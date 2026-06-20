// MiniKart Aile - Limit motoru + para transferi çekirdeği (saf fonksiyonlar).
// React'ten bağımsız, (state) => sonuç. AppContext bunları setState updater'ı
// İÇİNDE çağırır; böylece bakiye kontrolü ile mutasyon atomik olur (TOCTOU yok).
import { AppState, Category, Notification, Task, Transaction, Wallet } from './types';
import { uid, money } from '../utils/format';

export interface SpendResult {
  allowed: boolean;
  reason?: string;
}

export interface TransferResult {
  state: AppState;
  ok: boolean;
}

const newTx = (t: Omit<Transaction, 'id' | 'createdAt'> & { createdAt?: string }): Transaction => ({
  id: uid('tx_'), createdAt: new Date().toISOString(), ...t,
});
const newNotif = (n: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => ({
  id: uid('n_'), createdAt: new Date().toISOString(), read: false, ...n,
});
const newAudit = (actor: string, action: string, entityType: string, entityId: string, metadata?: any) => ({
  id: uid('au_'), actor, action, entityType, entityId, metadata, createdAt: new Date().toISOString(),
});
const getBal = (wallets: Wallet[], id: string) => wallets.find((w) => w.id === id)?.balance ?? 0;
// Para tamsayı kuruştur → toplama/çıkarma tam. Tek yuvarlama gereken yer yüzde bölmesi.

// ---- limit motoru (Spec §9) ----
// `now` enjekte edilir → gece engeli ve pencereler deterministik test edilebilir.
export function evaluateSpend(
  s: AppState, childId: string, amount: number, category: Category, now: Date,
): SpendResult {
  const card = s.cards.find((c) => c.childId === childId && c.status !== 'cancelled');
  const wallet = s.wallets.find((w) => w.ownerType === 'child' && w.ownerId === childId);
  if (!card) return { allowed: false, reason: 'Aktif kart yok.' };
  if (card.status === 'frozen') return { allowed: false, reason: 'Kartın şu an dondurulmuş. Ailenle konuşabilirsin.' };
  if (card.blockedCategories.includes(category)) return { allowed: false, reason: 'Bu kategori ailen tarafından kapatılmış.' };
  if (category === 'atm' && !card.controls.atm) return { allowed: false, reason: 'ATM kullanımı kapalı.' };
  if (category === 'online' && !card.controls.online) return { allowed: false, reason: 'Online ödeme kapalı.' };
  const hour = now.getHours();
  if (card.controls.nightBlock && (hour >= 22 || hour < 6)) return { allowed: false, reason: 'Gece saatlerinde harcama engellendi.' };
  if (amount > card.limits.perTransaction) return { allowed: false, reason: `Tek işlem limitin ${money(card.limits.perTransaction)}. Ailenden izin isteyebilirsin.` };

  // Her iki pencere de takvim-tabanlı (tutarlı): günlük bugün 00:00, haftalık bu
  // haftanın Pazartesi 00:00. Böylece limitler net bir günde/haftada sıfırlanır.
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now); startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Pazartesi'ye geri sar
  const spentToday = s.transactions
    .filter((t) => t.childId === childId && t.type === 'spend' && t.status === 'approved' && new Date(t.createdAt) >= startOfDay)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const spentWeek = s.transactions
    .filter((t) => t.childId === childId && t.type === 'spend' && t.status === 'approved' && new Date(t.createdAt) >= startOfWeek)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  if (spentToday + amount > card.limits.daily) return { allowed: false, reason: `Günlük limitin (${money(card.limits.daily)}) aşılıyor.` };
  if (spentWeek + amount > card.limits.weekly) return { allowed: false, reason: `Haftalık limitin (${money(card.limits.weekly)}) aşılıyor.` };
  if (!wallet || wallet.balance < amount) return { allowed: false, reason: 'Bu alışveriş için yeterli paran yok. İstersen para isteği gönderebilirsin.' };
  return { allowed: true };
}

// ---- harçlık/ödül transferi + otomatik birikim (Spec §8.6) ----
export function applyTransfer(
  s: AppState, childId: string, amount: number, type: Transaction['type'], description: string,
): TransferResult {
  const fam = s.wallets.find((w) => w.ownerType === 'family');
  const cw = s.wallets.find((w) => w.ownerType === 'child' && w.ownerId === childId);
  if (!fam || !cw || amount <= 0) return { state: s, ok: false };
  // Atomik bakiye kontrolü: updater içinde `s` üzerinden bakıldığı için iki
  // eşzamanlı transfer aynı eski bakiyeyi göremez → overdraft/TOCTOU kapanır.
  if (fam.balance < amount) return { state: s, ok: false };

  const wallets = s.wallets.map((w) => {
    if (w.id === fam.id) return { ...w, balance: Math.max(0, w.balance - amount) };
    if (w.id === cw.id) return { ...w, balance: w.balance + amount };
    return w;
  });
  const txs: Transaction[] = [newTx({ walletId: cw.id, childId, amount, type, status: 'approved', description })];

  let goals = s.savingsGoals;
  let extraWallets = wallets;
  const childGoalsActive = s.savingsGoals.filter((g) => g.childId === childId && g.status === 'active' && g.autoContributionPct > 0);
  for (const g of childGoalsActive) {
    const contrib = Math.min(Math.round(amount * g.autoContributionPct / 100), getBal(extraWallets, cw.id));
    if (contrib <= 0) continue;
    extraWallets = extraWallets.map((w) => (w.id === cw.id ? { ...w, balance: w.balance - contrib } : w));
    goals = goals.map((x) => {
      if (x.id !== g.id) return x;
      const nextAmt = x.currentAmount + contrib; // kuruş tamsayı → tam karşılaştırma
      return { ...x, currentAmount: nextAmt, status: nextAmt >= x.targetAmount ? 'completed' : 'active' };
    });
    txs.push(newTx({ walletId: cw.id, childId, amount: -contrib, type: 'goal_contribution', status: 'approved', description: `${g.title} hedefine otomatik aktarım` }));
  }

  const notifs: Notification[] = [
    newNotif({ scope: 'child', childId, type, title: type === 'reward' ? 'Görev ödülün geldi! 🎉' : 'Harçlığın geldi 💛', body: `${description}: ${money(amount)} hesabına eklendi.` }),
  ];
  const state: AppState = {
    ...s,
    wallets: extraWallets,
    savingsGoals: goals,
    transactions: [...txs, ...s.transactions],
    notifications: [...notifs, ...s.notifications],
    auditLogs: [newAudit('parent', type === 'reward' ? 'reward.sent' : 'allowance.sent', 'child', childId, { amount }), ...s.auditLogs],
  };
  return { state, ok: true };
}

// ---- görev onayı + ödül ----
// Ödül ÖDENMEDEN görev 'approved' yapılmaz. Aile bakiyesi yetmezse görev
// 'submitted' kalır (TasksScreen'de tekrar onaylanabilir) → ödül sessizce kaybolmaz.
export function applyTaskApproval(s: AppState, taskId: string): TransferResult {
  const t = s.tasks.find((x) => x.id === taskId);
  if (!t) return { state: s, ok: false };
  const res = applyTransfer(s, t.childId, t.rewardAmount, 'reward', `Görev ödülü: ${t.title}`);
  if (!res.ok) return { state: s, ok: false };
  const tasks = res.state.tasks.map((x) =>
    x.id === taskId
      ? { ...x, status: (x.recurrence === 'repeating' ? 'open' : 'approved') as Task['status'], proofPhotoUri: undefined }
      : x,
  );
  return { state: { ...res.state, tasks }, ok: true };
}

// ---- görev gönderimi (kanıt fotoğrafı opsiyonel) ----
export function applyTaskSubmit(s: AppState, taskId: string, photoUri?: string): AppState {
  if (!s.tasks.some((x) => x.id === taskId)) return s;
  return {
    ...s,
    tasks: s.tasks.map((x) =>
      x.id === taskId ? { ...x, status: 'submitted', proofPhotoUri: photoUri, rejectionNote: undefined } : x,
    ),
  };
}

// ---- görev reddi (görevi tekrar açar, not bırakır) ----
export function applyTaskReject(s: AppState, taskId: string, note?: string): AppState {
  if (!s.tasks.some((x) => x.id === taskId)) return s;
  return {
    ...s,
    tasks: s.tasks.map((x) =>
      x.id === taskId ? { ...x, status: 'open', rejectionNote: note, proofPhotoUri: undefined } : x,
    ),
  };
}

// ---- birikim hedefine elle aktarım ----
export function applyGoalContribution(s: AppState, goalId: string, amount: number): TransferResult {
  const g = s.savingsGoals.find((x) => x.id === goalId);
  if (!g || amount <= 0) return { state: s, ok: false };
  const cw = s.wallets.find((w) => w.ownerType === 'child' && w.ownerId === g.childId);
  if (!cw || cw.balance < amount) return { state: s, ok: false }; // atomik bakiye kontrolü

  const wallets = s.wallets.map((w) => (w.id === cw.id ? { ...w, balance: Math.max(0, w.balance - amount) } : w));
  const goals = s.savingsGoals.map((x) => {
    if (x.id !== goalId) return x;
    const nextAmt = x.currentAmount + amount;
    return { ...x, currentAmount: nextAmt, status: (nextAmt >= x.targetAmount ? 'completed' : 'active') as 'active' | 'completed' };
  });
  const state: AppState = {
    ...s,
    wallets,
    savingsGoals: goals,
    transactions: [newTx({ walletId: cw.id, childId: g.childId, amount: -amount, type: 'goal_contribution', status: 'approved', description: `${g.title} hedefine aktarım` }), ...s.transactions],
    notifications: [newNotif({ scope: 'child', childId: g.childId, type: 'goal', title: 'Birikim yaptın! 🎯', body: `${g.title} için ${money(amount)} biriktirdin.` }), ...s.notifications],
  };
  return { state, ok: true };
}
