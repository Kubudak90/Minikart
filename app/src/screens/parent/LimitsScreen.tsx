import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { money } from '../../utils/format';

function Stepper({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  return (
    <View style={s.stepRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.value}>{money(value)}</Text>
      </View>
      <Pressable style={s.btn} onPress={() => onChange(Math.max(0, value - step))}><Text style={s.btnText}>−</Text></Pressable>
      <Pressable style={s.btn} onPress={() => onChange(value + step)}><Text style={s.btnText}>＋</Text></Pressable>
    </View>
  );
}

export function LimitsScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { childCard, updateCardLimits } = useApp();
  const card = childCard(childId);
  const [daily, setDaily] = useState(card?.limits.daily || 100);
  const [weekly, setWeekly] = useState(card?.limits.weekly || 350);
  const [perTx, setPerTx] = useState(card?.limits.perTransaction || 75);

  if (!card) return <Screen><Empty icon="💳" title="Kart yok" /></Screen>;

  return (
    <Screen>
      <Muted>Limitler kart işlemlerinde anlık uygulanır. Limit aşan harcamalar otomatik reddedilir.</Muted>
      <Card>
        <Stepper label="Tek işlem limiti" value={perTx} onChange={setPerTx} step={25} />
        <Stepper label="Günlük limit" value={daily} onChange={setDaily} step={50} />
        <Stepper label="Haftalık limit" value={weekly} onChange={setWeekly} step={50} />
      </Card>
      <Btn title="Limitleri kaydet" onPress={() => { updateCardLimits(card.id, { daily, weekly, perTransaction: perTx }); navigation.goBack(); }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  label: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  value: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  btn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 24, fontWeight: '700', color: colors.primaryDark },
});
