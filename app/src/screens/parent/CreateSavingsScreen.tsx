import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';

const ICONS = ['🚲', '🎨', '🎮', '📚', '⚽️', '🎧', '👟', '🪀', '🧩', '🎸'];
const PCTS = [0, 10, 20, 30, 50];

export function CreateSavingsScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { createGoal } = useApp();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [pct, setPct] = useState(20);

  const valid = title.trim() && (parseFloat(target) || 0) > 0;

  return (
    <Screen>
      <H2>Simge</H2>
      <View style={s.row}>
        {ICONS.map((ic) => (
          <Pressable key={ic} onPress={() => setIcon(ic)} style={[s.icon, { backgroundColor: icon === ic ? colors.primarySoft : colors.surface, borderColor: icon === ic ? colors.primary : colors.border }]}>
            <Text style={{ fontSize: 24 }}>{ic}</Text>
          </Pressable>
        ))}
      </View>
      <Card>
        <Field label="Hedef adı" value={title} onChangeText={setTitle} placeholder="Bisiklet" />
        <Field label="Hedef tutar (₺)" value={target} onChangeText={setTarget} keyboardType="number-pad" placeholder="3000" />
      </Card>
      <H2>Otomatik katkı</H2>
      <Muted>Her harçlığın bu yüzdesi otomatik bu hedefe aktarılsın.</Muted>
      <View style={s.row}>
        {PCTS.map((p) => (
          <Pressable key={p} onPress={() => setPct(p)} style={[s.pill, pct === p && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[s.pillText, pct === p && { color: colors.onPrimary }]}>%{p}</Text>
          </Pressable>
        ))}
      </View>
      <Btn title="Hedefi oluştur" disabled={!valid} onPress={() => { createGoal(childId, title.trim(), parseFloat(target), icon, pct); navigation.goBack(); }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  pill: { backgroundColor: colors.surface, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  pillText: { fontWeight: '700', color: colors.text, fontSize: font.body },
});
