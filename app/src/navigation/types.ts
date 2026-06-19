import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ParentStackParamList = {
  ParentHome: undefined;
  AddChild: undefined;
  TopUp: undefined;
  ChildDetail: { childId: string };
  SendAllowance: { childId: string };
  CardControls: { childId: string };
  Limits: { childId: string };
  Categories: { childId: string };
  Schedules: { childId: string };
  Savings: { childId: string };
  CreateSavings: { childId: string };
  Tasks: { childId: string };
  CreateTask: { childId: string };
  SimulateSpend: { childId: string };
};

export type ChildStackParamList = {
  ChildHome: undefined;
  ChildTransactions: undefined;
  RequestMoney: undefined;
  ChildNotifications: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  ParentLogin: undefined;
  ChildLogin: undefined;
};

export type ChildTabParamList = {
  WalletTab: undefined;
  TasksTab: undefined;
  SavingsTab: undefined;
  LearnTab: undefined;
};

// childId parametresi alan ebeveyn rotaları (ChildDetail aksiyon ızgarası bunlara gider).
export type ChildIdRoute =
  | 'SendAllowance' | 'Schedules' | 'Limits' | 'Categories'
  | 'Savings' | 'Tasks' | 'CardControls' | 'SimulateSpend';

// Ekran prop yardımcıları — her ekran tek satırlık tip import eder.
export type ParentScreenProps<T extends keyof ParentStackParamList> = NativeStackScreenProps<ParentStackParamList, T>;
export type ChildScreenProps<T extends keyof ChildStackParamList> = NativeStackScreenProps<ChildStackParamList, T>;
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
