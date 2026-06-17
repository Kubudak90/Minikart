import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, H1, H2, Muted, Card, Btn, Divider, Empty, Pill } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, font } from '../../theme/theme';
import { money, timeAgo } from '../../utils/format';

const ICONS: Record<string, string> = {
  request: '🙋', task: '📋', spend: '🛍️', spend_declined: '⛔', card: '💳', allowance: '💛', child: '🧒',
};

export function ParentNotificationsScreen() {
  const { state, notifications, markAllRead, approveRequest, rejectRequest, familyWallet } = useApp();
  const notifs = notifications('parent');
  const pending = state.moneyRequests.filter((r) => r.status === 'pending');
  const fam = familyWallet();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
        <H1>Bildirimler</H1>
        {notifs.some((n) => !n.read) && <Btn title="Tümünü okundu" kind="ghost" small onPress={() => markAllRead('parent')} />}
      </View>

      {pending.length > 0 && (
        <>
          <H2>💬 Para istekleri</H2>
          {pending.map((r) => {
            const child = state.children.find((c) => c.id === r.childId);
            const canAfford = (fam?.balance || 0) >= r.amount;
            return (
              <Card key={r.id} style={{ gap: spacing.sm, borderWidth: 1.5, borderColor: colors.amber }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{child?.name} • {money(r.amount)}</Text>
                  <Muted>{timeAgo(r.createdAt)}</Muted>
                </View>
                <Muted>"{r.reason}"</Muted>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Btn title={`✓ Onayla (${money(r.amount)})`} small kind="success" style={{ flex: 1 }} disabled={!canAfford} onPress={() => approveRequest(r.id)} />
                  <Btn title="Reddet" small kind="ghost" onPress={() => rejectRequest(r.id)} />
                </View>
                {!canAfford && <Muted style={{ color: colors.red }}>Aile bakiyesi yetersiz.</Muted>}
              </Card>
            );
          })}
        </>
      )}

      <H2>Tüm bildirimler</H2>
      {notifs.length === 0 && <Empty icon="🔔" title="Bildirim yok" />}
      <Card>
        {notifs.map((n, i) => (
          <View key={n.id}>
            <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, opacity: n.read ? 0.55 : 1 }}>
              <Text style={{ fontSize: 22 }}>{ICONS[n.type] || '🔔'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{n.title}</Text>
                <Muted>{n.body}</Muted>
                <Text style={{ fontSize: font.tiny, color: colors.textFaint, marginTop: 2 }}>{timeAgo(n.createdAt)}</Text>
              </View>
              {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 }} />}
            </View>
            {i < notifs.length - 1 && <Divider />}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({});
