// Demo veri tohumu — uygulama ilk açılışta dolu görünsün diye.
import { AppState } from './types';
import { uid } from '../utils/format';

function isoDaysAgo(days: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
}

export function buildSeed(): AppState {
  const familyId = 'fam_demo';
  const parentId = 'par_demo';
  const elifId = 'chd_elif';
  const keremId = 'chd_kerem';
  const famWalletId = 'wal_fam';
  const elifWalletId = 'wal_elif';
  const keremWalletId = 'wal_kerem';
  const elifCardId = 'crd_elif';
  const keremCardId = 'crd_kerem';

  const now = new Date().toISOString();

  const state: AppState = {
    family: { id: familyId, name: 'Arslan Ailesi', createdAt: isoDaysAgo(40) },
    parents: [
      {
        id: parentId,
        familyId,
        fullName: 'Hüseyin Arslan',
        phone: '+90 555 000 0000',
        email: 'huseyin@example.com',
        kycStatus: 'verified',
        role: 'owner',
        createdAt: isoDaysAgo(40),
      },
    ],
    children: [
      {
        id: elifId,
        familyId,
        parentId,
        name: 'Elif',
        birthDate: '2014-05-12',
        username: 'elif',
        avatar: '🦊',
        color: '#7C5CFC',
        pin: '1234',
        relation: 'kizim',
        status: 'active',
        createdAt: isoDaysAgo(38),
      },
      {
        id: keremId,
        familyId,
        parentId,
        name: 'Kerem',
        birthDate: '2012-09-03',
        username: 'kerem',
        avatar: '🐯',
        color: '#2BB673',
        pin: '1234',
        relation: 'oglum',
        status: 'active',
        createdAt: isoDaysAgo(30),
      },
    ],
    wallets: [
      { id: famWalletId, ownerType: 'family', ownerId: familyId, balance: 2450, currency: 'TRY', status: 'active' },
      { id: elifWalletId, ownerType: 'child', ownerId: elifId, balance: 185.5, currency: 'TRY', status: 'active' },
      { id: keremWalletId, ownerType: 'child', ownerId: keremId, balance: 312, currency: 'TRY', status: 'active' },
    ],
    cards: [
      {
        id: elifCardId,
        childId: elifId,
        type: 'virtual',
        status: 'active',
        last4: '4821',
        brand: 'MiniKart',
        expMonth: 9,
        expYear: 2029,
        number: '5312 9043 1122 4821',
        cvv: '204',
        controls: { online: true, atm: false, contactless: true, abroad: false, nightBlock: true },
        limits: { daily: 100, weekly: 350, perTransaction: 75 },
        blockedCategories: ['oyun'],
        createdAt: isoDaysAgo(38),
      },
      {
        id: keremCardId,
        childId: keremId,
        type: 'physical',
        status: 'active',
        last4: '7390',
        brand: 'MiniKart',
        expMonth: 3,
        expYear: 2030,
        number: '5312 9088 5510 7390',
        cvv: '617',
        controls: { online: true, atm: true, contactless: true, abroad: false, nightBlock: false },
        limits: { daily: 150, weekly: 500, perTransaction: 120 },
        blockedCategories: [],
        physicalRequested: true,
        createdAt: isoDaysAgo(28),
      },
    ],
    transactions: [
      { id: uid('tx_'), walletId: famWalletId, amount: 3000, type: 'topup', status: 'approved', description: 'Bakiye yükleme', createdAt: isoDaysAgo(20) },
      { id: uid('tx_'), walletId: elifWalletId, childId: elifId, amount: 150, type: 'allowance', status: 'approved', description: 'Haftalık harçlık', createdAt: isoDaysAgo(7) },
      { id: uid('tx_'), walletId: elifWalletId, childId: elifId, cardId: elifCardId, amount: -32, type: 'spend', merchantName: 'Okul Kantini', category: 'yemek', mcc: '5814', status: 'approved', description: 'Okul Kantini', createdAt: isoDaysAgo(6, 11) },
      { id: uid('tx_'), walletId: elifWalletId, childId: elifId, cardId: elifCardId, amount: -18.5, type: 'spend', merchantName: 'Kırtasiye Mavi', category: 'kirtasiye', mcc: '5943', status: 'approved', description: 'Kırtasiye Mavi', createdAt: isoDaysAgo(4, 15) },
      { id: uid('tx_'), walletId: elifWalletId, childId: elifId, cardId: elifCardId, amount: -120, type: 'spend', merchantName: 'Oyun Marketi', category: 'oyun', mcc: '5816', status: 'declined', declineReason: 'Bu kategori kapalı ve tutar tek işlem limitinin üstünde.', description: 'Oyun Marketi', createdAt: isoDaysAgo(3, 21) },
      { id: uid('tx_'), walletId: elifWalletId, childId: elifId, amount: 50, type: 'reward', status: 'approved', description: 'Görev ödülü: Kitap oku', createdAt: isoDaysAgo(2) },
      { id: uid('tx_'), walletId: keremWalletId, childId: keremId, amount: 150, type: 'allowance', status: 'approved', description: 'Haftalık harçlık', createdAt: isoDaysAgo(7) },
      { id: uid('tx_'), walletId: keremWalletId, childId: keremId, cardId: keremCardId, amount: -45, type: 'spend', merchantName: 'Migros', category: 'market', mcc: '5411', status: 'approved', description: 'Migros', createdAt: isoDaysAgo(5, 17) },
      { id: uid('tx_'), walletId: keremWalletId, childId: keremId, cardId: keremCardId, amount: -25, type: 'spend', merchantName: 'İETT Ulaşım', category: 'ulasim', mcc: '4111', status: 'approved', description: 'İETT Ulaşım', createdAt: isoDaysAgo(2, 8) },
      { id: uid('tx_'), walletId: keremWalletId, childId: keremId, amount: -30, type: 'goal_contribution', status: 'approved', description: 'Bisiklet hedefine aktarım', createdAt: isoDaysAgo(2) },
    ],
    allowanceSchedules: [
      { id: uid('al_'), childId: elifId, amount: 150, frequency: 'weekly', dayOfWeek: 1, startDate: isoDaysAgo(35), active: true, capBalanceUnder: 500, lastRunAt: isoDaysAgo(7) },
    ],
    tasks: [
      { id: uid('tsk_'), childId: elifId, createdByParentId: parentId, title: 'Odanı topla', description: 'Hafta sonu odanı düzenle', rewardAmount: 30, recurrence: 'repeating', proofRequired: false, status: 'open', createdAt: isoDaysAgo(2) },
      { id: uid('tsk_'), childId: elifId, createdByParentId: parentId, title: 'Kitap oku (50 sayfa)', description: 'Bu hafta 50 sayfa kitap oku', rewardAmount: 50, recurrence: 'once', proofRequired: true, status: 'submitted', createdAt: isoDaysAgo(3) },
      { id: uid('tsk_'), childId: keremId, createdByParentId: parentId, title: 'Matematik ödevi', description: 'Ödevi bitir ve göster', rewardAmount: 40, recurrence: 'once', proofRequired: true, status: 'open', createdAt: isoDaysAgo(1) },
    ],
    savingsGoals: [
      { id: uid('sg_'), childId: elifId, title: 'Boya seti', targetAmount: 400, currentAmount: 160, icon: '🎨', autoContributionPct: 20, familyContribOpen: true, status: 'active', createdAt: isoDaysAgo(15) },
      { id: uid('sg_'), childId: keremId, title: 'Bisiklet', targetAmount: 3000, currentAmount: 780, icon: '🚲', autoContributionPct: 25, familyContribOpen: true, status: 'active', createdAt: isoDaysAgo(20) },
    ],
    moneyRequests: [
      { id: uid('mr_'), childId: keremId, amount: 60, reason: 'Arkadaşımın doğum günü hediyesi', status: 'pending', createdAt: isoDaysAgo(0, 9) },
    ],
    notifications: [
      { id: uid('n_'), scope: 'parent', type: 'request', title: 'Kerem para istedi', body: 'Kerem 60₺ istedi: Arkadaşımın doğum günü hediyesi', read: false, createdAt: isoDaysAgo(0, 9) },
      { id: uid('n_'), scope: 'parent', type: 'task', title: 'Görev tamamlandı', body: 'Elif "Kitap oku" görevini tamamladı, onayını bekliyor.', read: false, createdAt: isoDaysAgo(0, 10) },
      { id: uid('n_'), scope: 'parent', type: 'spend_declined', title: 'Harcama reddedildi', body: 'Elif - Oyun Marketi 120₺ reddedildi.', read: true, createdAt: isoDaysAgo(3, 21) },
      { id: uid('n_'), scope: 'child', childId: elifId, type: 'reward', title: 'Görev ödülün geldi! 🎉', body: '"Kitap oku" görevinden 50₺ kazandın.', read: false, createdAt: isoDaysAgo(2) },
      { id: uid('n_'), scope: 'child', childId: elifId, type: 'allowance', title: 'Harçlığın geldi 💛', body: 'Haftalık harçlığın 150₺ hesabına eklendi.', read: true, createdAt: isoDaysAgo(7) },
    ],
    auditLogs: [
      { id: uid('au_'), actor: 'parent:' + parentId, action: 'family.created', entityType: 'family', entityId: familyId, createdAt: isoDaysAgo(40) },
      { id: uid('au_'), actor: 'parent:' + parentId, action: 'child.created', entityType: 'child', entityId: elifId, createdAt: isoDaysAgo(38) },
      { id: uid('au_'), actor: 'parent:' + parentId, action: 'card.created', entityType: 'card', entityId: elifCardId, createdAt: isoDaysAgo(38) },
    ],
  };

  return state;
}
