import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../store/types';
import { colors, font } from '../theme/theme';
import { money, timeAgo, CATEGORY_META } from '../utils/format';

const TYPE_META: Record<string, { icon: string; label: string }> = {
  topup: { icon: '⬆️', label: 'Bakiye yükleme' },
  allowance: { icon: '💛', label: 'Harçlık' },
  reward: { icon: '🏅', label: 'Görev ödülü' },
  goal_contribution: { icon: '🎯', label: 'Birikim' },
  request_fulfilled: { icon: '✅', label: 'Para isteği' },
  spend: { icon: '🛍️', label: 'Harcama' },
};

export function TxRow({ tx }: { tx: Transaction }) {
  const meta = tx.category ? CATEGORY_META[tx.category] : undefined;
  const icon = meta?.icon || TYPE_META[tx.type]?.icon || '•';
  const declined = tx.status === 'declined';
  const positive = tx.amount > 0;
  return (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: declined ? colors.redSoft : positive ? colors.greenSoft : colors.surfaceAlt }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1}>{tx.description}</Text>
        <Text style={s.sub} numberOfLines={1}>
          {declined ? '⛔ Reddedildi' : (meta?.label || TYPE_META[tx.type]?.label || '')} • {timeAgo(tx.createdAt)}
        </Text>
        {declined && tx.declineReason ? <Text style={s.reason} numberOfLines={2}>{tx.declineReason}</Text> : null}
      </View>
      <Text style={[s.amount, { color: declined ? colors.textFaint : positive ? colors.green : colors.text, textDecorationLine: declined ? 'line-through' : 'none' }]}>
        {positive ? '+' : ''}{money(tx.amount)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.body, fontWeight: '600', color: colors.text },
  sub: { fontSize: font.tiny, color: colors.textMuted, marginTop: 2 },
  reason: { fontSize: font.tiny, color: colors.red, marginTop: 2 },
  amount: { fontSize: font.body, fontWeight: '800' },
});
