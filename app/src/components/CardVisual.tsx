import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card as TCard } from '../store/types';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Çocuk/ebeveyn ekranında gösterilen kart görseli.
// Tam numara varsayılan gizli; göster/gizle ile açılır (Spec §18 güvenlik).
export function CardVisual({ card, name, color = '#2E6BE6', allowReveal = true }: {
  card: TCard; name: string; color?: string; allowReveal?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const frozen = card.status === 'frozen';
  return (
    <View style={[s.card, { backgroundColor: color }, shadow.card]}>
      {frozen && (
        <View style={s.frozen}>
          <Text style={s.frozenText}>❄️  Donduruldu</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={s.brand}>MiniKart</Text>
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
          <Text style={s.revealText}>{revealed ? '🙈 Bilgileri gizle' : '👁️  Kart bilgilerini göster'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg, minHeight: 200, justifyContent: 'space-between', overflow: 'hidden' },
  frozen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  frozenText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  brand: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  type: { color: '#ffffffcc', fontSize: 12, fontWeight: '700', backgroundColor: '#ffffff2a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  number: { color: '#fff', fontSize: 21, fontWeight: '700', letterSpacing: 2 },
  miniLabel: { color: '#ffffffaa', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  value: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  reveal: { backgroundColor: '#ffffff2a', paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  revealText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
