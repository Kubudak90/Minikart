// Limit motoru + para transferi çekirdeği için testler.
// Para tamsayı KURUŞ olarak tutulur; testlerde okunabilirlik için TL() ile yazılır.
import { buildSeed } from './seed';
import { evaluateSpend, applyTransfer, applyGoalContribution, applyTaskApproval, applyTaskSubmit, applyTaskReject } from './engine';
import { AppState, Transaction, Task } from './types';

const ELIF = 'chd_elif';
const KEREM = 'chd_kerem';

const TL = (n: number) => Math.round(n * 100); // TL → kuruş

const NOON = new Date('2026-06-19T12:00:00'); // Cuma, gündüz
const NIGHT = new Date('2026-06-19T23:30:00');

function familyBal(s: AppState): number {
  return s.wallets.find((w) => w.ownerType === 'family')!.balance;
}
function childBal(s: AppState, childId: string): number {
  return s.wallets.find((w) => w.ownerType === 'child' && w.ownerId === childId)!.balance;
}
function spend(childId: string, amountTL: number, when: Date): Transaction {
  return {
    id: 't_' + amountTL + '_' + when.getTime(), walletId: 'w', childId, amount: -TL(amountTL),
    type: 'spend', status: 'approved', description: 'test', createdAt: when.toISOString(),
  };
}

describe('evaluateSpend — limit motoru (Spec §9)', () => {
  const clean = (): AppState => ({ ...buildSeed(), transactions: [] });

  test('limitler içindeki normal harcamaya izin verir', () => {
    expect(evaluateSpend(clean(), ELIF, TL(20), 'market', NOON)).toEqual({ allowed: true });
  });

  test('tek işlem limitini aşan harcamayı reddeder', () => {
    const r = evaluateSpend(clean(), ELIF, TL(80), 'market', NOON); // perTransaction = 75 TL
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/Tek işlem/);
  });

  test('ailenin kapattığı kategoriyi reddeder', () => {
    const r = evaluateSpend(clean(), ELIF, TL(10), 'oyun', NOON); // blockedCategories: ['oyun']
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/kategori/);
  });

  test('ATM kapalıyken ATM işlemini reddeder', () => {
    const r = evaluateSpend(clean(), ELIF, TL(10), 'atm', NOON);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/ATM/);
  });

  test('gece engeli açıkken gece saatinde reddeder', () => {
    const r = evaluateSpend(clean(), ELIF, TL(10), 'market', NIGHT);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/[Gg]ece/);
  });

  test('gece engeli kapalı kartta gece saatinde izin verir', () => {
    const r = evaluateSpend(clean(), KEREM, TL(10), 'market', NIGHT);
    expect(r.allowed).toBe(true);
  });

  test('günlük limit aşımını reddeder (takvim günü)', () => {
    const s = clean();
    s.transactions = [spend(ELIF, 90, new Date(NOON.getTime() - 3600_000))]; // bugün 90 TL
    const r = evaluateSpend(s, ELIF, TL(20), 'market', NOON); // 90+20=110 > günlük 100
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/[Gg]ünlük/);
  });

  // NOON = Cuma 2026-06-19 → bu takvim haftası Pazartesi 2026-06-15 00:00'da başlar.
  test('haftalık limit aşımını reddeder (takvim haftası)', () => {
    const s = clean();
    s.transactions = [
      spend(ELIF, 100, new Date('2026-06-15T10:00:00')), // Pazartesi
      spend(ELIF, 120, new Date('2026-06-16T10:00:00')), // Salı
      spend(ELIF, 90, new Date('2026-06-18T10:00:00')),  // Perşembe
    ]; // bu hafta toplam 310; +50 = 360 > haftalık 350
    const r = evaluateSpend(s, ELIF, TL(50), 'market', NOON);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/[Hh]aftalık/);
  });

  test('geçen haftanın harcaması (Pazar) bu haftalık pencereye girmez', () => {
    const s = clean();
    // 06-14 Pazar: kayan 7-gün penceresinde AMA geçen takvim haftasında.
    s.transactions = [spend(ELIF, 320, new Date('2026-06-14T10:00:00'))];
    const r = evaluateSpend(s, ELIF, TL(50), 'market', NOON);
    expect(r.allowed).toBe(true);
  });

  test('bakiye yetersizse reddeder', () => {
    const s = clean();
    s.wallets = s.wallets.map((w) =>
      w.ownerType === 'child' && w.ownerId === ELIF ? { ...w, balance: TL(5) } : w);
    const r = evaluateSpend(s, ELIF, TL(20), 'market', NOON);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/paran yok/);
  });

  test('donmuş kartı reddeder', () => {
    const s = clean();
    s.cards = s.cards.map((c) => (c.childId === ELIF ? { ...c, status: 'frozen' } : c));
    const r = evaluateSpend(s, ELIF, TL(20), 'market', NOON);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/dondurul/);
  });

  test('kartı olmayan çocuğu reddeder', () => {
    const s = clean();
    s.cards = [];
    const r = evaluateSpend(s, ELIF, TL(20), 'market', NOON);
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/kart yok/);
  });

  test('reddedilen geçmiş harcama bütçeyi tüketmez', () => {
    const s = clean();
    s.transactions = [{ ...spend(ELIF, 90, NOON), status: 'declined' }];
    const r = evaluateSpend(s, ELIF, TL(20), 'market', NOON);
    expect(r.allowed).toBe(true);
  });
});

describe('applyTransfer — harçlık/ödül + otomatik birikim', () => {
  test('aile cüzdanından çocuğa para taşır', () => {
    const seed = { ...buildSeed(), savingsGoals: [] }; // otomatik birikimi izole et
    const { state, ok } = applyTransfer(seed, KEREM, TL(50), 'allowance', 'Harçlık');
    expect(ok).toBe(true);
    expect(familyBal(state)).toBe(TL(2400)); // 2450 - 50
    expect(childBal(state, KEREM)).toBe(TL(362)); // 312 + 50
  });

  test('otomatik birikim yüzdesini hedefe aktarır', () => {
    // Elif 'Boya seti': pct 20, current 160.
    const { state } = applyTransfer(buildSeed(), ELIF, TL(100), 'allowance', 'Harçlık');
    expect(childBal(state, ELIF)).toBe(TL(265.5)); // 185.5 + 100 - 20
    const goal = state.savingsGoals.find((g) => g.childId === ELIF && g.title === 'Boya seti')!;
    expect(goal.currentAmount).toBe(TL(180)); // 160 + 20
  });

  // Tamsayı-kuruş değişmezi: yüzde bölmesi tam bölünmese bile kuruş tamsayı kalmalı.
  test('tam bölünmeyen otomatik birikim kuruşu tamsayı tutar', () => {
    let seed = buildSeed();
    seed = {
      ...seed,
      savingsGoals: [
        { id: 'sg_x', childId: ELIF, title: 'X', targetAmount: TL(1000), currentAmount: TL(160),
          icon: '🎯', autoContributionPct: 33, familyContribOpen: true, status: 'active', createdAt: NOON.toISOString() },
      ],
    };
    const { state } = applyTransfer(seed, ELIF, TL(100.5), 'allowance', 'x'); // 10050 kuruş * 33% = 3316.5 → yuvarla
    const goal = state.savingsGoals.find((g) => g.id === 'sg_x')!;
    expect(Number.isInteger(goal.currentAmount)).toBe(true);
    expect(Number.isInteger(childBal(state, ELIF))).toBe(true);
    expect(goal.currentAmount).toBe(TL(160) + Math.round(TL(100.5) * 33 / 100)); // 16000 + 3317
  });

  // BUG #3 — TOCTOU: iki ardışık transfer aile cüzdanını negatife düşürmemeli.
  test('aile cüzdanını negatife düşürmez (atomik bakiye kontrolü)', () => {
    let s = buildSeed(); // aile bakiyesi 2450 TL
    const r1 = applyTransfer(s, ELIF, TL(2000), 'allowance', 'x');
    s = r1.state;
    const r2 = applyTransfer(s, KEREM, TL(2000), 'allowance', 'y'); // kalan 450 < 2000
    s = r2.state;
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
    expect(familyBal(s)).toBeGreaterThanOrEqual(0);
    expect(familyBal(s)).toBe(TL(450));
  });

  test('yetersiz bakiyede state değişmez', () => {
    const s = buildSeed();
    const before = familyBal(s);
    const { state, ok } = applyTransfer(s, ELIF, TL(999999), 'allowance', 'x');
    expect(ok).toBe(false);
    expect(familyBal(state)).toBe(before);
    expect(state.transactions.length).toBe(s.transactions.length);
  });
});

describe('applyTaskApproval — görev onayı + ödül', () => {
  test('tek seferlik görevi onaylar ve ödülü öder', () => {
    const seed = buildSeed();
    const t = seed.tasks.find((x) => x.recurrence === 'once' && x.status === 'submitted')!;
    const { state, ok } = applyTaskApproval(seed, t.id);
    expect(ok).toBe(true);
    expect(state.tasks.find((x) => x.id === t.id)!.status).toBe('approved');
    expect(familyBal(state)).toBe(TL(2450) - t.rewardAmount);
  });

  test('tekrar eden görev onaylanınca yeniden açılır (open)', () => {
    const seed = buildSeed();
    const t = seed.tasks.find((x) => x.recurrence === 'repeating')!;
    const { state, ok } = applyTaskApproval(seed, t.id);
    expect(ok).toBe(true);
    expect(state.tasks.find((x) => x.id === t.id)!.status).toBe('open');
  });

  test('yetersiz bakiyede görevi onaylamaz; submitted kalır (kilitlenmez)', () => {
    const seed = buildSeed();
    const t = seed.tasks.find((x) => x.recurrence === 'once' && x.status === 'submitted')!;
    const broke = { ...seed, wallets: seed.wallets.map((w) => (w.ownerType === 'family' ? { ...w, balance: 0 } : w)) };
    const { state, ok } = applyTaskApproval(broke, t.id);
    expect(ok).toBe(false);
    expect(state.tasks.find((x) => x.id === t.id)!.status).toBe('submitted');
    expect(familyBal(state)).toBe(0);
    expect(state.transactions.length).toBe(broke.transactions.length);
  });
});

describe('applyGoalContribution — birikim hedefi', () => {
  test('çocuk cüzdanından hedefe aktarır', () => {
    const seed = buildSeed();
    const goal = seed.savingsGoals.find((g) => g.childId === ELIF)!;
    const { state, ok } = applyGoalContribution(seed, goal.id, TL(25));
    expect(ok).toBe(true);
    expect(childBal(state, ELIF)).toBe(TL(160.5)); // 185.5 - 25
    const g = state.savingsGoals.find((x) => x.id === goal.id)!;
    expect(g.currentAmount).toBe(TL(185)); // 160 + 25
  });

  test('bakiye yetersizse aktarmaz', () => {
    const seed = buildSeed();
    const goal = seed.savingsGoals.find((g) => g.childId === ELIF)!;
    const { state, ok } = applyGoalContribution(seed, goal.id, TL(999999));
    expect(ok).toBe(false);
    expect(childBal(state, ELIF)).toBe(TL(185.5));
  });

  test('hedefi tam dolduğunda completed yapar', () => {
    let seed = buildSeed();
    const gid = 'sg_edge';
    seed = {
      ...seed,
      savingsGoals: [
        { id: gid, childId: ELIF, title: 'Edge', targetAmount: TL(186), currentAmount: TL(180),
          icon: '🎯', autoContributionPct: 0, familyContribOpen: true, status: 'active', createdAt: NOON.toISOString() },
      ],
    };
    const { state } = applyGoalContribution(seed, gid, TL(6)); // 180 + 6 = 186 == hedef
    const g = state.savingsGoals.find((x) => x.id === gid)!;
    expect(g.currentAmount).toBe(TL(186));
    expect(g.status).toBe('completed');
  });
});

function withTask(overrides: Partial<Task> = {}): AppState {
  const s = buildSeed();
  const task: Task = {
    id: 'tsk_test', childId: ELIF, createdByParentId: 'par_x', title: 'Odanı topla',
    description: '', rewardAmount: TL(10), recurrence: 'once', proofRequired: true,
    status: 'open', createdAt: '2026-06-19T10:00:00.000Z', ...overrides,
  };
  // ödül testleri için aile cüzdanını bolca fonla
  const wallets = s.wallets.map((w) => (w.ownerType === 'family' ? { ...w, balance: TL(1000) } : w));
  // otomatik birikimi devre dışı bırak (yalnızca görev lojik testine odaklan)
  const savingsGoals = s.savingsGoals.map((g) => ({ ...g, autoContributionPct: 0 }));
  return { ...s, wallets, tasks: [task], savingsGoals };
}

describe('görev kanıtı — saf engine geçişleri', () => {
  test('applyTaskSubmit: submitted yapar, foto URI set eder, eski notu temizler', () => {
    const s = withTask({ rejectionNote: 'eski not' });
    const t = applyTaskSubmit(s, 'tsk_test', 'file:///proof.jpg').tasks[0];
    expect(t.status).toBe('submitted');
    expect(t.proofPhotoUri).toBe('file:///proof.jpg');
    expect(t.rejectionNote).toBeUndefined();
  });

  test('applyTaskReject: open yapar, notu yazar, fotoyu temizler', () => {
    const s = withTask({ status: 'submitted', proofPhotoUri: 'file:///proof.jpg' });
    const t = applyTaskReject(s, 'tsk_test', 'yatağı da topla').tasks[0];
    expect(t.status).toBe('open');
    expect(t.rejectionNote).toBe('yatağı da topla');
    expect(t.proofPhotoUri).toBeUndefined();
  });

  test('applyTaskApproval: ödül öder, approved yapar, fotoyu temizler', () => {
    const s = withTask({ status: 'submitted', proofPhotoUri: 'file:///proof.jpg' });
    const before = childBal(s, ELIF);
    const r = applyTaskApproval(s, 'tsk_test');
    expect(r.ok).toBe(true);
    expect(r.state.tasks[0].status).toBe('approved');
    expect(r.state.tasks[0].proofPhotoUri).toBeUndefined();
    expect(childBal(r.state, ELIF)).toBe(before + TL(10));
  });

  test('applyTaskApproval: tekrarlı görev tekrar open olur, foto temizlenir', () => {
    const s = withTask({ status: 'submitted', recurrence: 'repeating', proofPhotoUri: 'file:///p.jpg' });
    const r = applyTaskApproval(s, 'tsk_test');
    expect(r.state.tasks[0].status).toBe('open');
    expect(r.state.tasks[0].proofPhotoUri).toBeUndefined();
  });
});
