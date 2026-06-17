import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card as TCard } from '../store/types';
import { colors, radius, spacing, shadow, fonts } from '../theme/theme';
import { cardGradient } from '../theme/theme';
import { Icon } from './Icon';

// Çocuk/ebeveyn ekranında gösterilen kart görseli (mor gradyan, çocuk temalı).
// Tam numara varsayılan gizli; göster/gizle ile açılır (Spec §18 güvenlik).
export function CardVisual({ card, name, color = colors.primary, allowReveal = true }: {
  card: TCard; name: string; color?: string; allowReveal?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const frozen = card.status === 'frozen';
  const grad = cardGradient(color);
  return (
    <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadow.purple]}>
      {frozen && (
        <View style={s.frozen}>
          <Icon name="snowflake" size={26} color="#fff" />
          <Text style={s.frozenText}>Donduruldu</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Icon name="wallet" size={20} color="#fff" />
          <Text style={s.brand}>MiniKart</Text>
        </View>
        <Text style={s.type}>{card.type === 'virtual' ? 'Sanal' : 'Fiziksel'}</Text>
      </View>
      <Text style={s.number}>
        {revealed ? card.number : `•••• •••• •••• ${card.last4}`}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text style={s.miniLabel}>KART SAHİBİ</Text>
          <Text style={s.value}>{name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.miniLabel}>SKT</Text>
          <Text style={s.value}>{String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(2)}</Text>
        </View>
        {revealed && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.miniLabel}>CVV</Text>
            <Text style={s.value}>{card.cvv}</Text>
          </View>
        )}
      </View>
      {allowReveal && (
        <Pressable onPress={() => setRevealed((r) => !r)} style={s.reveal}>
          <Icon name={revealed ? 'eye-off' : 'eye'} size={15} color="#fff" />
          <Text style={s.revealText}>{revealed ? 'Bilgileri gizle' : 'Kart bilgilerini göster'}</Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg, minHeight: 200, justifyContent: 'space-between', overflow: 'hidden' },
  frozen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#14152Bcc', alignItems: 'center', justifyContent: 'center', zIndex: 5, gap: 6 },
  frozenText: { color: '#fff', fontSize: 17, fontFamily: fonts.headingX },
  brand: { color: '#fff', fontSize: 19, fontFamily: fonts.headingX, letterSpacing: 0.3 },
  type: { color: '#ffffffdd', fontSize: 12, fontFamily: fonts.semibold, backgroundColor: '#ffffff2e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  number: { color: '#fff', fontSize: 21, fontFamily: fonts.semibold, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  miniLabel: { color: '#ffffffaa', fontSize: 9, fontFamily: fonts.bold, letterSpacing: 1 },
  value: { color: '#fff', fontSize: 14, fontFamily: fonts.bold, marginTop: 2 },
  reveal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ffffff2a', paddingVertical: 9, borderRadius: 999 },
  revealText: { color: '#fff', fontSize: 12, fontFamily: fonts.semibold },
});
