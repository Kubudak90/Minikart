import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import { colors, font } from '../theme/theme';
import { ParentStackParamList, ChildStackParamList } from './types';

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

const AuthStack = createNativeStackNavigator();
const ParentStack = createNativeStackNavigator<ParentStackParamList>();
const ChildStack = createNativeStackNavigator<ChildStackParamList>();
const ParentTabs = createBottomTabNavigator();
const ChildTabs = createBottomTabNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: font.h3 },
  headerBackTitle: 'Geri',
  contentStyle: { backgroundColor: colors.bg },
};

function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
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
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <ParentTabs.Screen name="HomeTab" component={ParentHomeStack} options={{ title: 'Ana Sayfa', tabBarIcon: tabIcon('🏠') }} />
      <ParentTabs.Screen name="NotifTab" component={ParentNotificationsScreen} options={{ title: 'Bildirimler', tabBarIcon: tabIcon('🔔'), tabBarBadge: unread || undefined }} />
      <ParentTabs.Screen name="ProfileTab" component={ParentProfileScreen} options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }} />
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
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <ChildTabs.Screen name="WalletTab" component={ChildWalletStack} options={{ title: 'Cüzdanım', headerShown: false, tabBarIcon: tabIcon('💳'), tabBarBadge: unread || undefined }} />
      <ChildTabs.Screen name="TasksTab" component={ChildTasksScreen} options={{ title: 'Görevlerim', tabBarIcon: tabIcon('📋') }} />
      <ChildTabs.Screen name="SavingsTab" component={ChildSavingsScreen} options={{ title: 'Biriktir', tabBarIcon: tabIcon('🎯') }} />
      <ChildTabs.Screen name="LearnTab" component={ChildLearnScreen} options={{ title: 'Öğren', tabBarIcon: tabIcon('💡') }} />
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
