import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, ProgressBar, Divider, Avatar, Pill } from '../../components/ui';
import { CardVisual } from '../../components/CardVisual';
import { TxRow } from '../../components/TxRow';
import { Icon, IconCircle } from '../../components/Icon';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font, fonts } from '../../theme/theme';
import { money } from '../../utils/format';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ChildScreenProps, ChildTabParamList } from '../../navigation/types';

export function ChildHomeScreen({ navigation }: ChildScreenProps<'ChildHome'>) {
  const { currentChild, childWallet, childCard, childTransactions, childGoals, childTasks, unreadCount, logout } = useApp();
  const child = currentChild();
  if (!child) return null;
  const wallet = childWallet(child.id);
  const card = childCard(child.id);
  const txs = childTransactions(child.id).slice(0, 5);
  const goal = childGoals(child.id).find((g) => g.status === 'active');
  const openTasks = childTasks(child.id).filter((t) => t.status === 'open').length;
  const unread = unreadCount('child', child.id);

  return (
    <Screen bg={colors.bgChild}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
        <Avatar emoji={child.avatar} size={48} color={child.color + '33'} />
        <View style={{ flex: 1 }}>
          <Muted>Merhaba</Muted>
          <Text style={{ fontSize: font.h2, fontFamily: fonts.headingX, color: colors.text }}>{child.name}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('ChildNotifications')} style={s.bell}>
          <Icon name="bell" size={20} color={colors.text} />
          {unread > 0 && <View style={s.badge}><Text style={s.badgeText}>{unread}</Text></View>}
        </Pressable>
        <Pressable onPress={logout} style={s.bell}><Icon name="logout" size={18} color={colors.text} /></Pressable>
      </View>

      {/* Bakiye */}
      <View style={[s.balanceCard, { backgroundColor: child.color }]}>
        <Text style={s.balanceLabel}>Param</Text>
        <Text style={s.balance}>{money(wallet?.balance || 0)}</Text>
      </View>

      {/* Kart */}
      {card && <CardVisual card={card} name={child.name} color={child.color} />}

      {/* Hızlı aksiyonlar */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Btn title="Para İste" icon="hand-coins" kind="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('RequestMoney')} />
        <Btn title="Hareketler" icon="receipt" kind="ghost" style={{ flex: 1 }} onPress={() => navigation.navigate('ChildTransactions')} />
      </View>

      {/* Birikim hedefi */}
      {goal && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Text style={{ fontSize: 30 }}>{goal.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{goal.title}</Text>
              <Muted>{money(goal.currentAmount)} / {money(goal.targetAmount)}</Muted>
            </View>
            <Pill text={`%${Math.round((goal.currentAmount / goal.targetAmount) * 100)}`} color={colors.purple} bg={colors.purpleSoft} />
          </View>
          <ProgressBar pct={(goal.currentAmount / goal.targetAmount) * 100} color={colors.purple} />
        </Card>
      )}

      {/* Görev özeti */}
      <Card onPress={() => navigation.getParent<BottomTabNavigationProp<ChildTabParamList>>()?.navigate('TasksTab')} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <IconCircle name="tasks" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Görevlerim</Text>
          <Muted>{openTasks > 0 ? `${openTasks} görev seni bekliyor` : 'Şu an açık görev yok'}</Muted>
        </View>
        <Text style={{ fontSize: 20, color: colors.textFaint }}>›</Text>
      </Card>

      {/* Son hareketler */}
      <H2>Son harcamalarım</H2>
      <Card>
        {txs.length === 0 ? <Muted>Henüz hareket yok.</Muted> : txs.map((t, i) => (
          <View key={t.id}>
            <TxRow tx={t} />
            {i < txs.length - 1 && <Divider />}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  bell: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.red, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  balanceCard: { borderRadius: radius.xl, padding: spacing.xl },
  balanceLabel: { color: '#ffffffcc', fontSize: font.body, fontWeight: '600' },
  balance: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
});
