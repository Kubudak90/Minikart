// MiniKart Aile - Veri modeli (Spec §15)
// MVP için sadeleştirilmiş; gerçek üründe lisanslı e-para/kart partneri verisi.

export type KycStatus = 'pending' | 'verified' | 'rejected';

export interface Family {
  id: string;
  name: string;
  createdAt: string;
}

export interface Parent {
  id: string;
  familyId: string;
  fullName: string;
  phone: string;
  email: string;
  kycStatus: KycStatus;
  role: 'owner' | 'secondary_parent';
  createdAt: string;
}

export type Relation = 'kizim' | 'oglum' | 'yegenim' | 'torunum' | 'diger';

export interface Child {
  id: string;
  familyId: string;
  parentId: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  username: string;
  avatar: string; // emoji
  color: string;
  pin: string; // 4 haneli (MVP demo; gerçek üründe hashlenir)
  relation: Relation;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type WalletOwner = 'family' | 'child';

export interface Wallet {
  id: string;
  ownerType: WalletOwner;
  ownerId: string; // familyId veya childId
  balance: number; // kuruş değil, TL (MVP)
  currency: 'TRY';
  status: 'active' | 'frozen';
}

export interface CardControls {
  online: boolean;
  atm: boolean;
  contactless: boolean;
  abroad: boolean;
  nightBlock: boolean; // 22:00-06:00 engeli
}

export interface CardLimits {
  daily: number;
  weekly: number;
  perTransaction: number;
}

// Spec §9 kategori kontrolü
export type Category =
  | 'market'
  | 'kirtasiye'
  | 'ulasim'
  | 'yemek'
  | 'giyim'
  | 'oyun'
  | 'online'
  | 'eglence'
  | 'atm';

export interface Card {
  id: string;
  childId: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'cancelled';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  number: string; // demo amaçlı tam numara (gerçek üründe asla saklanmaz)
  cvv: string;
  controls: CardControls;
  limits: CardLimits;
  blockedCategories: Category[];
  physicalRequested?: boolean;
  createdAt: string;
}

export type TxType =
  | 'topup' // ebeveyn aile cüzdanına yükledi
  | 'allowance' // ebeveynden çocuğa harçlık
  | 'reward' // görev ödülü
  | 'spend' // kart harcaması
  | 'goal_contribution' // birikim hedefine aktarım
  | 'request_fulfilled'; // para isteği karşılandı

export interface Transaction {
  id: string;
  walletId: string;
  childId?: string;
  cardId?: string;
  amount: number; // + giriş, - çıkış
  type: TxType;
  merchantName?: string;
  category?: Category;
  mcc?: string;
  status: 'approved' | 'declined';
  declineReason?: string;
  description: string;
  createdAt: string;
}

export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export interface AllowanceSchedule {
  id: string;
  childId: string;
  amount: number;
  frequency: Frequency;
  dayOfWeek?: number; // 1=Pzt..7=Paz
  dayOfMonth?: number;
  startDate: string;
  active: boolean;
  capBalanceUnder?: number; // bakiye bu tutarın üstündeyse gönderme
  lastRunAt?: string;
}

export type TaskStatus = 'open' | 'submitted' | 'approved' | 'rejected';

export interface Task {
  id: string;
  childId: string;
  createdByParentId: string;
  title: string;
  description: string;
  rewardAmount: number;
  dueDate?: string;
  recurrence: 'once' | 'repeating';
  proofRequired: boolean;
  status: TaskStatus;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  childId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string; // emoji
  autoContributionPct: number; // her harçlığın %'si
  familyContribOpen: boolean;
  status: 'active' | 'completed';
  createdAt: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface MoneyRequest {
  id: string;
  childId: string;
  amount: number;
  reason: string;
  status: RequestStatus;
  createdAt: string;
}

export type NotifScope = 'parent' | 'child';

export interface Notification {
  id: string;
  scope: NotifScope;
  childId?: string; // çocuk bildirimi ise hangi çocuk
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string; // parent:<id> | child:<id> | system
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AppState {
  family: Family | null;
  parents: Parent[];
  children: Child[];
  wallets: Wallet[];
  cards: Card[];
  transactions: Transaction[];
  allowanceSchedules: AllowanceSchedule[];
  tasks: Task[];
  savingsGoals: SavingsGoal[];
  moneyRequests: MoneyRequest[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

// Oturum
export type Session =
  | { kind: 'none' }
  | { kind: 'parent'; parentId: string }
  | { kind: 'child'; childId: string };
