// MiniKart Aile - Uygulama durumu + servis katmanı (mock backend).
// Spec §14 (Rules&Limits Engine, Tasks/Rewards, Notifications, Audit log) bu
// dosyada yerel olarak simüle edilir. Durum AsyncStorage'da saklanır;
// böylece uygulama iOS/Android/Web'de gerçekten çalışır ve kalıcı olur.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState, Card, CardControls, CardLimits, Category, Child, Frequency,
  MoneyRequest, Notification, Relation, Session, Task, Transaction, Wallet,
} from './types';
import { buildSeed } from './seed';
import { applyTransfer, applyGoalContribution, applyTaskApproval, applyTaskSubmit, applyTaskReject, evaluateSpend, SpendResult } from './engine';
import { deserializeState, serializeState, STORAGE_KEY, SESSION_KEY } from './persistence';
import { uid, money } from '../utils/format';
import { hashPin, verifyPin } from '../utils/security';
import { deleteProofPhoto } from '../utils/proofPhotos';

// ---- saf yardımcılar (immutable) ----
const newTx = (t: Omit<Transaction, 'id' | 'createdAt'> & { createdAt?: string }): Transaction => ({
  id: uid('tx_'), createdAt: new Date().toISOString(), ...t,
});
const newNotif = (n: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => ({
  id: uid('n_'), createdAt: new Date().toISOString(), read: false, ...n,
});
const newAudit = (actor: string, action: string, entityType: string, entityId: string, metadata?: any) => ({
  id: uid('au_'), actor, action, entityType, entityId, metadata, createdAt: new Date().toISOString(),
});

interface Ctx {
  state: AppState;
  session: Session;
  ready: boolean;

  // selectors
  currentParent: () => AppState['parents'][number] | null;
  currentChild: () => Child | null;
  familyWallet: () => Wallet | null;
  childWallet: (childId: string) => Wallet | null;
  childCard: (childId: string) => Card | null;
  childTransactions: (childId: string) => Transaction[];
  childTasks: (childId: string) => Task[];
  childGoals: (childId: string) => AppState['savingsGoals'];
  childRequests: (childId: string) => MoneyRequest[];
  notifications: (scope: 'parent' | 'child', childId?: string) => Notification[];
  unreadCount: (scope: 'parent' | 'child', childId?: string) => number;

  // auth
  loginParent: () => void;
  loginChild: (childId: string, pin: string) => boolean;
  logout: () => void;
  resetDemo: () => void;

  // children & cards
  addChild: (input: AddChildInput) => void;
  createVirtualCard: (childId: string) => void;
  requestPhysicalCard: (childId: string) => void;
  setCardFrozen: (cardId: string, frozen: boolean) => void;
  updateCardControls: (cardId: string, patch: Partial<CardControls>) => void;
  updateCardLimits: (cardId: string, patch: Partial<CardLimits>) => void;
  toggleCategoryBlock: (cardId: string, cat: Category) => void;

  // money
  topUp: (amount: number) => void;
  sendAllowance: (childId: string, amount: number, description: string) => boolean;

  // allowance schedules
  createSchedule: (childId: string, amount: number, frequency: Frequency, capBalanceUnder?: number) => void;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
  runScheduleNow: (id: string) => boolean;

  // tasks
  createTask: (childId: string, title: string, description: string, reward: number, proofRequired: boolean, recurrence: 'once' | 'repeating') => void;
  submitTask: (taskId: string, photoUri?: string) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string, note?: string) => void;

  // savings
  createGoal: (childId: string, title: string, target: number, icon: string, autoPct: number) => void;
  contributeGoal: (goalId: string, amount: number) => boolean;

  // requests
  requestMoney: (childId: string, amount: number, reason: string) => void;
  approveRequest: (reqId: string) => void;
  rejectRequest: (reqId: string) => void;

  // card tx simulation (provider webhook simülasyonu)
  simulateSpend: (childId: string, merchant: string, amount: number, category: Category) => SpendResult;

  // notifications
  markNotifRead: (id: string) => void;
  markAllRead: (scope: 'parent' | 'child', childId?: string) => void;
}

export interface AddChildInput {
  name: string;
  birthDate: string;
  username: string;
  avatar: string;
  color: string;
  pin: string;
  relation: Relation;
  weeklyLimit: number;
  createVirtual: boolean;
}

const AppCtx = createContext<Ctx | null>(null);

// Güvenlik: tam PAN/CVV üretilmez/saklanmaz; yalnızca son 4 hane + SKT.
function genCardMeta() {
  return {
    last4: Math.floor(1000 + Math.random() * 9000).toString(),
    expMonth: 1 + Math.floor(Math.random() * 12),
    expYear: new Date().getFullYear() + 4,
  };
}

function makeCard(childId: string, type: 'virtual' | 'physical', weeklyLimit = 35000): Card {
  const c = genCardMeta();
  return {
    id: uid('crd_'), childId, type, status: 'active',
    last4: c.last4, brand: 'MiniKart', expMonth: c.expMonth, expYear: c.expYear,
    controls: { online: true, atm: false, contactless: true, abroad: false, nightBlock: true },
    limits: { daily: Math.round(weeklyLimit / 3), weekly: weeklyLimit, perTransaction: Math.round(weeklyLimit / 4) },
    blockedCategories: [],
    physicalRequested: type === 'physical',
    createdAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => buildSeed());
  const [session, setSession] = useState<Session>({ kind: 'none' });
  const [ready, setReady] = useState(false);

  // yükle
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(deserializeState(raw));
        const s = await AsyncStorage.getItem(SESSION_KEY);
        if (s) setSession(JSON.parse(s));
      } catch {}
      setReady(true);
    })();
  }, []);

  // kaydet
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, serializeState(state)).catch(() => {});
  }, [state, ready]);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch(() => {});
  }, [session, ready]);

  // ---- selectors ----
  const familyWallet = () => state.wallets.find((w) => w.ownerType === 'family') || null;
  const childWallet = (childId: string) => state.wallets.find((w) => w.ownerType === 'child' && w.ownerId === childId) || null;
  const childCard = (childId: string) => state.cards.find((c) => c.childId === childId && c.status !== 'cancelled') || null;
  const childTransactions = (childId: string) =>
    state.transactions.filter((t) => t.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const childTasks = (childId: string) =>
    state.tasks.filter((t) => t.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const childGoals = (childId: string) => state.savingsGoals.filter((g) => g.childId === childId);
  const childRequests = (childId: string) =>
    state.moneyRequests.filter((r) => r.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const notifications = (scope: 'parent' | 'child', childId?: string) =>
    state.notifications
      .filter((n) => n.scope === scope && (scope === 'parent' || n.childId === childId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unreadCount = (scope: 'parent' | 'child', childId?: string) =>
    notifications(scope, childId).filter((n) => !n.read).length;
  const currentParent = () => (session.kind === 'parent' ? state.parents.find((p) => p.id === session.parentId) || null : null);
  const currentChild = () => (session.kind === 'child' ? state.children.find((c) => c.id === session.childId) || null : null);

  // ---- auth ----
  const loginParent = () => {
    const p = state.parents[0];
    if (p) setSession({ kind: 'parent', parentId: p.id });
  };
  const loginChild = (childId: string, pin: string) => {
    const c = state.children.find((x) => x.id === childId);
    if (c && verifyPin(pin, c.pin)) {
      setSession({ kind: 'child', childId });
      return true;
    }
    return false;
  };
  const logout = () => setSession({ kind: 'none' });
  const resetDemo = () => {
    setState(buildSeed());
    setSession({ kind: 'none' });
  };

  // Harçlık/ödül transferi + otomatik birikim ve limit motoru artık saf
  // `./engine` modülünde (test edilir). Bakiye kontrolü updater içinde
  // `s` üzerinden yapıldığı için TOCTOU/çift-harcama açığı kapalıdır.

  // ---- children & cards ----
  const addChild = (input: AddChildInput) => {
    setState((s) => {
      if (!s.family) return s;
      const childId = uid('chd_');
      const child: Child = {
        id: childId, familyId: s.family.id, parentId: s.parents[0]?.id || '',
        name: input.name, birthDate: input.birthDate, username: input.username,
        avatar: input.avatar, color: input.color, pin: hashPin(input.pin), relation: input.relation,
        status: 'active', createdAt: new Date().toISOString(),
      };
      const wallet: Wallet = { id: uid('wal_'), ownerType: 'child', ownerId: childId, balance: 0, currency: 'TRY', status: 'active' };
      const cards = input.createVirtual ? [makeCard(childId, 'virtual', input.weeklyLimit)] : [];
      return {
        ...s,
        children: [...s.children, child],
        wallets: [...s.wallets, wallet],
        cards: [...s.cards, ...cards],
        notifications: [newNotif({ scope: 'parent', type: 'child', title: 'Çocuk profili oluşturuldu', body: `${input.name} ailene eklendi.` }), ...s.notifications],
        auditLogs: [newAudit('parent', 'child.created', 'child', childId), ...s.auditLogs],
      };
    });
  };

  const createVirtualCard = (childId: string) => {
    setState((s) => {
      if (s.cards.some((c) => c.childId === childId && c.status !== 'cancelled')) return s;
      const card = makeCard(childId, 'virtual');
      return { ...s, cards: [...s.cards, card], auditLogs: [newAudit('parent', 'card.created', 'card', card.id), ...s.auditLogs] };
    });
  };

  const requestPhysicalCard = (childId: string) => {
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.childId === childId ? { ...c, physicalRequested: true } : c)),
      notifications: [newNotif({ scope: 'parent', type: 'card', title: 'Fiziksel kart talebi alındı', body: 'Kartın 5-7 iş günü içinde adresine gönderilecek.' }), ...s.notifications],
      auditLogs: [newAudit('parent', 'card.physical_requested', 'child', childId), ...s.auditLogs],
    }));
  };

  const setCardFrozen = (cardId: string, frozen: boolean) => {
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.id === cardId ? { ...c, status: frozen ? 'frozen' : 'active' } : c)),
      notifications: [
        newNotif({ scope: 'parent', type: 'card', title: frozen ? 'Kart donduruldu' : 'Kart açıldı', body: frozen ? 'Kart geçici olarak donduruldu.' : 'Kart yeniden kullanılabilir.' }),
        ...s.notifications,
      ],
      auditLogs: [newAudit('parent', frozen ? 'card.frozen' : 'card.unfrozen', 'card', cardId), ...s.auditLogs],
    }));
  };

  const updateCardControls = (cardId: string, patch: Partial<CardControls>) =>
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, controls: { ...c.controls, ...patch } } : c)), auditLogs: [newAudit('parent', 'card.controls_updated', 'card', cardId, patch), ...s.auditLogs] }));

  const updateCardLimits = (cardId: string, patch: Partial<CardLimits>) =>
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, limits: { ...c.limits, ...patch } } : c)), auditLogs: [newAudit('parent', 'card.limits_updated', 'card', cardId, patch), ...s.auditLogs] }));

  const toggleCategoryBlock = (cardId: string, cat: Category) =>
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) =>
        c.id === cardId
          ? { ...c, blockedCategories: c.blockedCategories.includes(cat) ? c.blockedCategories.filter((x) => x !== cat) : [...c.blockedCategories, cat] }
          : c,
      ),
    }));

  // ---- money ----
  const topUp = (amount: number) => {
    if (amount <= 0) return;
    setState((s) => {
      const fam = s.wallets.find((w) => w.ownerType === 'family')!;
      return {
        ...s,
        wallets: s.wallets.map((w) => (w.id === fam.id ? { ...w, balance: w.balance + amount } : w)),
        transactions: [newTx({ walletId: fam.id, amount, type: 'topup', status: 'approved', description: 'Bakiye yükleme' }), ...s.transactions],
        auditLogs: [newAudit('parent', 'wallet.topup', 'wallet', fam.id, { amount }), ...s.auditLogs],
      };
    });
  };

  const sendAllowance = (childId: string, amount: number, description: string) => {
    if (amount <= 0) return false;
    const fam = familyWallet();
    if (!fam || fam.balance < amount) return false;
    setState((s) => applyTransfer(s, childId, amount, 'allowance', description).state);
    return true;
  };

  // ---- schedules ----
  const createSchedule = (childId: string, amount: number, frequency: Frequency, capBalanceUnder?: number) =>
    setState((s) => ({
      ...s,
      allowanceSchedules: [
        { id: uid('al_'), childId, amount, frequency, startDate: new Date().toISOString(), active: true, capBalanceUnder, dayOfWeek: 1 },
        ...s.allowanceSchedules,
      ],
      auditLogs: [newAudit('parent', 'allowance.schedule_created', 'child', childId, { amount, frequency }), ...s.auditLogs],
    }));
  const toggleSchedule = (id: string) =>
    setState((s) => ({ ...s, allowanceSchedules: s.allowanceSchedules.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) }));
  const deleteSchedule = (id: string) =>
    setState((s) => ({ ...s, allowanceSchedules: s.allowanceSchedules.filter((a) => a.id !== id) }));
  const runScheduleNow = (id: string) => {
    const sch = state.allowanceSchedules.find((a) => a.id === id);
    if (!sch) return false;
    const cw = childWallet(sch.childId);
    if (sch.capBalanceUnder != null && cw && cw.balance > sch.capBalanceUnder) return false;
    const fam = familyWallet();
    if (!fam || fam.balance < sch.amount) return false;
    setState((s) => {
      const next = applyTransfer(s, sch.childId, sch.amount, 'allowance', 'Otomatik harçlık').state;
      return { ...next, allowanceSchedules: next.allowanceSchedules.map((a) => (a.id === id ? { ...a, lastRunAt: new Date().toISOString() } : a)) };
    });
    return true;
  };

  // ---- tasks ----
  const createTask: Ctx['createTask'] = (childId, title, description, reward, proofRequired, recurrence) =>
    setState((s) => ({
      ...s,
      tasks: [
        { id: uid('tsk_'), childId, createdByParentId: s.parents[0]?.id || '', title, description, rewardAmount: reward, recurrence, proofRequired, status: 'open', createdAt: new Date().toISOString() },
        ...s.tasks,
      ],
      notifications: [newNotif({ scope: 'child', childId, type: 'task', title: 'Yeni görev! 📋', body: `${title} (+${money(reward)})` }), ...s.notifications],
      auditLogs: [newAudit('parent', 'task.created', 'child', childId), ...s.auditLogs],
    }));
  const submitTask = (taskId: string, photoUri?: string) =>
    setState((s) => {
      const t = s.tasks.find((x) => x.id === taskId);
      if (!t) return s;
      const next = applyTaskSubmit(s, taskId, photoUri);
      return {
        ...next,
        notifications: [newNotif({ scope: 'parent', type: 'task', title: 'Görev tamamlandı', body: `Görev "${t.title}" onayını bekliyor.` }), ...next.notifications],
      };
    });
  // Aile bakiyesi yetersizse görev 'submitted' kalır (kilitlenmez, ödül kaybolmaz).
  const approveTask = (taskId: string) =>
    setState((s) => {
      deleteProofPhoto(s.tasks.find((x) => x.id === taskId)?.proofPhotoUri);
      return applyTaskApproval(s, taskId).state;
    });
  const rejectTask = (taskId: string, note?: string) =>
    setState((s) => {
      const t = s.tasks.find((x) => x.id === taskId);
      if (!t) return s;
      deleteProofPhoto(t.proofPhotoUri);
      const next = applyTaskReject(s, taskId, note);
      return {
        ...next,
        notifications: [newNotif({ scope: 'child', childId: t.childId, type: 'task', title: 'Görev tekrar denenebilir', body: note ? `Ailen: "${note}" — tekrar deneyebilirsin.` : `"${t.title}" görevini tekrar tamamlayabilirsin.` }), ...next.notifications],
      };
    });

  // ---- savings ----
  const createGoal: Ctx['createGoal'] = (childId, title, target, icon, autoPct) =>
    setState((s) => ({
      ...s,
      savingsGoals: [
        { id: uid('sg_'), childId, title, targetAmount: target, currentAmount: 0, icon, autoContributionPct: autoPct, familyContribOpen: true, status: 'active', createdAt: new Date().toISOString() },
        ...s.savingsGoals,
      ],
      auditLogs: [newAudit('parent', 'goal.created', 'child', childId), ...s.auditLogs],
    }));
  const contributeGoal = (goalId: string, amount: number) => {
    const goal = state.savingsGoals.find((g) => g.id === goalId);
    if (!goal || amount <= 0) return false;
    const cw = childWallet(goal.childId);
    if (!cw || cw.balance < amount) return false;
    setState((s) => applyGoalContribution(s, goalId, amount).state);
    return true;
  };

  // ---- money requests ----
  const requestMoney = (childId: string, amount: number, reason: string) =>
    setState((s) => {
      const child = s.children.find((c) => c.id === childId);
      return {
        ...s,
        moneyRequests: [{ id: uid('mr_'), childId, amount, reason, status: 'pending', createdAt: new Date().toISOString() }, ...s.moneyRequests],
        notifications: [newNotif({ scope: 'parent', type: 'request', title: `${child?.name} para istedi`, body: `${money(amount)} istedi: ${reason}` }), ...s.notifications],
        auditLogs: [newAudit('child:' + childId, 'money.requested', 'child', childId, { amount }), ...s.auditLogs],
      };
    });
  const approveRequest = (reqId: string) => {
    const req = state.moneyRequests.find((r) => r.id === reqId);
    if (!req || req.status !== 'pending') return;
    const fam = familyWallet();
    if (!fam || fam.balance < req.amount) return;
    setState((s) => {
      const next = applyTransfer(s, req.childId, req.amount, 'request_fulfilled', 'Para isteği onaylandı').state;
      return {
        ...next,
        moneyRequests: next.moneyRequests.map((r) => (r.id === reqId ? { ...r, status: 'approved' } : r)),
        notifications: [newNotif({ scope: 'child', childId: req.childId, type: 'request', title: 'Para isteğin onaylandı ✅', body: `${money(req.amount)} hesabına eklendi.` }), ...next.notifications],
      };
    });
  };
  const rejectRequest = (reqId: string) =>
    setState((s) => {
      const req = s.moneyRequests.find((r) => r.id === reqId);
      return {
        ...s,
        moneyRequests: s.moneyRequests.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r)),
        notifications: req ? [newNotif({ scope: 'child', childId: req.childId, type: 'request', title: 'Para isteğin yanıtlandı', body: 'Bu sefer olmadı, ailenle konuşabilirsin.' }), ...s.notifications] : s.notifications,
      };
    });

  // ---- harcama simülasyonu (provider webhook simülasyonu) ----
  // Limit motoru (evaluateSpend) saf `./engine` modülünde; burada sadece çağrılır.
  const simulateSpend: Ctx['simulateSpend'] = (childId, merchant, amount, category) => {
    const result = evaluateSpend(state, childId, amount, category, new Date());
    const child = state.children.find((c) => c.id === childId);
    setState((s) => {
      const card = s.cards.find((c) => c.childId === childId && c.status !== 'cancelled');
      const wallet = s.wallets.find((w) => w.ownerType === 'child' && w.ownerId === childId)!;
      const tx = newTx({
        walletId: wallet.id, childId, cardId: card?.id, amount: -amount, type: 'spend',
        merchantName: merchant, category, status: result.allowed ? 'approved' : 'declined',
        declineReason: result.reason, description: merchant,
      });
      const wallets = result.allowed
        ? s.wallets.map((w) => (w.id === wallet.id ? { ...w, balance: Math.max(0, w.balance - amount) } : w))
        : s.wallets;
      const parentNotif = newNotif({
        scope: 'parent', type: result.allowed ? 'spend' : 'spend_declined',
        title: result.allowed ? `${child?.name} harcama yaptı` : 'Harcama reddedildi',
        body: `${merchant} • ${money(amount)}${result.allowed ? '' : ' • ' + result.reason}`,
      });
      const childNotif = newNotif({
        scope: 'child', childId, type: result.allowed ? 'spend' : 'limit',
        title: result.allowed ? 'Kart harcaması' : 'Harcama yapılamadı',
        body: result.allowed ? `${merchant} • ${money(amount)}` : (result.reason || ''),
      });
      return {
        ...s, wallets,
        transactions: [tx, ...s.transactions],
        notifications: [parentNotif, childNotif, ...s.notifications],
        auditLogs: [newAudit('system', result.allowed ? 'spend.approved' : 'spend.declined', 'child', childId, { amount, merchant }), ...s.auditLogs],
      };
    });
    return result;
  };

  // ---- notifications ----
  const markNotifRead = (id: string) =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  const markAllRead = (scope: 'parent' | 'child', childId?: string) =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.scope === scope && (scope === 'parent' || n.childId === childId) ? { ...n, read: true } : n)) }));

  const value: Ctx = {
    state, session, ready,
    currentParent, currentChild, familyWallet, childWallet, childCard,
    childTransactions, childTasks, childGoals, childRequests, notifications, unreadCount,
    loginParent, loginChild, logout, resetDemo,
    addChild, createVirtualCard, requestPhysicalCard, setCardFrozen, updateCardControls, updateCardLimits, toggleCategoryBlock,
    topUp, sendAllowance,
    createSchedule, toggleSchedule, deleteSchedule, runScheduleNow,
    createTask, submitTask, approveTask, rejectTask,
    createGoal, contributeGoal,
    requestMoney, approveRequest, rejectRequest,
    simulateSpend, markNotifRead, markAllRead,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
