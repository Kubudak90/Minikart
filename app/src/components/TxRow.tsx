import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../store/types';
import { colors, font, fonts } from '../theme/theme';
import { money, timeAgo } from '../utils/format';
import { Icon, IconName } from './Icon';

const CAT_ICON: Record<string, IconName> = {
  market: 'cart', kirtasiye: 'pencil', ulasim: 'bus', yemek: 'food', giyim: 'shirt',
  oyun: 'game', online: 'package', eglence: 'ferris', atm: 'atm',
};
const CAT_LABEL: Record<string, string> = {
  market: 'Market', kirtasiye: 'Kırtasiye', ulasim: 'Ulaşım', yemek: 'Yemek', giyim: 'Giyim',
  oyun: 'Oyun / Dijital', online: 'Online Alışveriş', eglence: 'Eğlence', atm: 'ATM',
};
const TYPE_META: Record<string, { icon: IconName; label: string }> = {
  topup: { icon: 'arrow-up', label: 'Bakiye yükleme' },
  allowance: { icon: 'hand-coins', label: 'Harçlık' },
  reward: { icon: 'star', label: 'Görev ödülü' },
  goal_contribution: { icon: 'target', label: 'Birikim' },
  request_fulfilled: { icon: 'check', label: 'Para isteği' },
  spend: { icon: 'bag', label: 'Harcama' },
};

export function TxRow({ tx }: { tx: Transaction }) {
  const icon: IconName = tx.category ? CAT_ICON[tx.category] : TYPE_META[tx.type]?.icon || 'receipt';
  const label = tx.category ? CAT_LABEL[tx.category] : TYPE_META[tx.type]?.label || '';
  const declined = tx.status === 'declined';
  const positive = tx.amount > 0;
  const tint = declined ? colors.red : positive ? colors.green : colors.text;
  return (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: declined ? colors.redSoft : positive ? colors.greenSoft : colors.surfaceAlt }]}>
        <Icon name={icon} size={19} color={declined ? colors.red : positive ? colors.green : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1}>{tx.description}</Text>
        <Text style={s.sub} numberOfLines={1}>
          {declined ? 'Reddedildi' : label} • {timeAgo(tx.createdAt)}
        </Text>
        {declined && tx.declineReason ? <Text style={s.reason} numberOfLines={2}>{tx.declineReason}</Text> : null}
      </View>
      <Text style={[s.amount, { color: declined ? colors.textFaint : tint, textDecorationLine: declined ? 'line-through' : 'none' }]}>
        {positive ? '+' : ''}{money(tx.amount)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: font.body, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: font.tiny, color: colors.textMuted, marginTop: 2 },
  reason: { fontFamily: fonts.body, fontSize: font.tiny, color: colors.red, marginTop: 2 },
  amount: { fontFamily: fonts.bold, fontSize: font.body, fontVariant: ['tabular-nums'] },
});
