import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import { colors, font, fonts } from '../theme/theme';
import { Icon, IconName } from '../components/Icon';
import { ParentStackParamList, ChildStackParamList, AuthStackParamList, ChildTabParamList } from './types';

// Auth
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { ParentLoginScreen } from '../screens/auth/ParentLoginScreen';
import { ChildLoginScreen } from '../screens/auth/ChildLoginScreen';

// Parent
import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';
import { AddChildScreen } from '../screens/parent/AddChildScreen';
import { TopUpScreen } from '../screens/parent/TopUpScreen';
import { ChildDetailScreen } from '../screens/parent/ChildDetailScreen';
import { SendAllowanceScreen } from '../screens/parent/SendAllowanceScreen';
import { CardControlsScreen } from '../screens/parent/CardControlsScreen';
import { LimitsScreen } from '../screens/parent/LimitsScreen';
import { CategoriesScreen } from '../screens/parent/CategoriesScreen';
import { SchedulesScreen } from '../screens/parent/SchedulesScreen';
import { SavingsScreen } from '../screens/parent/SavingsScreen';
import { CreateSavingsScreen } from '../screens/parent/CreateSavingsScreen';
import { TasksScreen } from '../screens/parent/TasksScreen';
import { CreateTaskScreen } from '../screens/parent/CreateTaskScreen';
import { SimulateSpendScreen } from '../screens/parent/SimulateSpendScreen';
import { ParentNotificationsScreen } from '../screens/parent/ParentNotificationsScreen';
import { ParentProfileScreen } from '../screens/parent/ParentProfileScreen';

// Child
import { ChildHomeScreen } from '../screens/child/ChildHomeScreen';
import { ChildTransactionsScreen } from '../screens/child/ChildTransactionsScreen';
import { RequestMoneyScreen } from '../screens/child/RequestMoneyScreen';
import { ChildNotificationsScreen } from '../screens/child/ChildNotificationsScreen';
import { ChildSavingsScreen } from '../screens/child/ChildSavingsScreen';
import { ChildTasksScreen } from '../screens/child/ChildTasksScreen';
import { ChildLearnScreen } from '../screens/child/ChildLearnScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ParentStack = createNativeStackNavigator<ParentStackParamList>();
const ChildStack = createNativeStackNavigator<ChildStackParamList>();
const ParentTabs = createBottomTabNavigator();
const ChildTabs = createBottomTabNavigator<ChildTabParamList>();

const headerOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.headingX, fontSize: font.h3 },
  headerBackTitle: 'Geri',
  contentStyle: { backgroundColor: colors.bg },
};

function tabIcon(name: IconName) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <Icon name={name} size={24} color={color} strokeWidth={focused ? 2.4 : 2} />
  );
}

function ParentHomeStack() {
  return (
    <ParentStack.Navigator screenOptions={headerOpts}>
      <ParentStack.Screen name="ParentHome" component={ParentHomeScreen} options={{ title: 'MiniKart Aile', headerLargeTitle: false }} />
      <ParentStack.Screen name="AddChild" component={AddChildScreen} options={{ title: 'Çocuk Ekle' }} />
      <ParentStack.Screen name="TopUp" component={TopUpScreen} options={{ title: 'Bakiye Yükle' }} />
      <ParentStack.Screen name="ChildDetail" component={ChildDetailScreen} options={{ title: 'Çocuk' }} />
      <ParentStack.Screen name="SendAllowance" component={SendAllowanceScreen} options={{ title: 'Harçlık Gönder' }} />
      <ParentStack.Screen name="CardControls" component={CardControlsScreen} options={{ title: 'Kart Kontrolleri' }} />
      <ParentStack.Screen name="Limits" component={LimitsScreen} options={{ title: 'Limitler' }} />
      <ParentStack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Kategoriler' }} />
      <ParentStack.Screen name="Schedules" component={SchedulesScreen} options={{ title: 'Otomatik Harçlık' }} />
      <ParentStack.Screen name="Savings" component={SavingsScreen} options={{ title: 'Birikim Hedefleri' }} />
      <ParentStack.Screen name="CreateSavings" component={CreateSavingsScreen} options={{ title: 'Yeni Hedef' }} />
      <ParentStack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Görevler' }} />
      <ParentStack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'Yeni Görev' }} />
      <ParentStack.Screen name="SimulateSpend" component={SimulateSpendScreen} options={{ title: 'Harcama Testi' }} />
    </ParentStack.Navigator>
  );
}

function ParentRoot() {
  const { unreadCount } = useApp();
  const unread = unreadCount('parent');
  return (
    <ParentTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
      }}
    >
      <ParentTabs.Screen name="HomeTab" component={ParentHomeStack} options={{ title: 'Ana Sayfa', tabBarIcon: tabIcon('home') }} />
      <ParentTabs.Screen name="NotifTab" component={ParentNotificationsScreen} options={{ title: 'Bildirimler', tabBarIcon: tabIcon('bell'), tabBarBadge: unread || undefined }} />
      <ParentTabs.Screen name="ProfileTab" component={ParentProfileScreen} options={{ title: 'Profil', tabBarIcon: tabIcon('user') }} />
    </ParentTabs.Navigator>
  );
}

function ChildWalletStack() {
  return (
    <ChildStack.Navigator screenOptions={headerOpts}>
      <ChildStack.Screen name="ChildHome" component={ChildHomeScreen} options={{ headerShown: false }} />
      <ChildStack.Screen name="ChildTransactions" component={ChildTransactionsScreen} options={{ title: 'Hareketlerim' }} />
      <ChildStack.Screen name="RequestMoney" component={RequestMoneyScreen} options={{ title: 'Para İste' }} />
      <ChildStack.Screen name="ChildNotifications" component={ChildNotificationsScreen} options={{ title: 'Bildirimler' }} />
    </ChildStack.Navigator>
  );
}

function ChildRoot() {
  const { session, unreadCount } = useApp();
  const childId = session.kind === 'child' ? session.childId : undefined;
  const unread = childId ? unreadCount('child', childId) : 0;
  return (
    <ChildTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgChild },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.headingX },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
      }}
    >
      <ChildTabs.Screen name="WalletTab" component={ChildWalletStack} options={{ title: 'Cüzdanım', headerShown: false, tabBarIcon: tabIcon('wallet'), tabBarBadge: unread || undefined }} />
      <ChildTabs.Screen name="TasksTab" component={ChildTasksScreen} options={{ title: 'Görevlerim', tabBarIcon: tabIcon('tasks') }} />
      <ChildTabs.Screen name="SavingsTab" component={ChildSavingsScreen} options={{ title: 'Biriktir', tabBarIcon: tabIcon('target') }} />
      <ChildTabs.Screen name="LearnTab" component={ChildLearnScreen} options={{ title: 'Öğren', tabBarIcon: tabIcon('lightbulb') }} />
    </ChildTabs.Navigator>
  );
}

function AuthRoot() {
  return (
    <AuthStack.Navigator screenOptions={{ ...headerOpts, headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="ParentLogin" component={ParentLoginScreen} options={{ headerShown: true, title: '' }} />
      <AuthStack.Screen name="ChildLogin" component={ChildLoginScreen} options={{ headerShown: true, title: '' }} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { session } = useApp();
  return (
    <NavigationContainer>
      {session.kind === 'none' && <AuthRoot />}
      {session.kind === 'parent' && <ParentRoot />}
      {session.kind === 'child' && <ChildRoot />}
    </NavigationContainer>
  );
}
