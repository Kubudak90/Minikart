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
  ChildLearn: undefined;
};
