import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field, Avatar } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { money } from '../../utils/format';

const QUICK = [50, 100, 150, 200];
const REASONS = ['Haftalık harçlık', 'Ödül', 'Acil para', 'Hediye'];

export function SendAllowanceScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { state, familyWallet, childWallet, childGoals, sendAllowance } = useApp();
  const child = state.children.find((c) => c.id === childId)!;
  const fam = familyWallet();
  const cw = childWallet(childId);
  const goals = childGoals(childId).filter((g) => g.status === 'active' && g.autoContributionPct > 0);

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [err, setErr] = useState('');
  const val = parseFloat(amount.replace(',', '.')) || 0;
  const insufficient = val > (fam?.balance || 0);

  const send = () => {
    if (val <= 0) return;
    if (sendAllowance(childId, val, reason)) navigation.goBack();
    else setErr('Aile bakiyesi yetersiz. Önce bakiye yükle.');
  };

  return (
    <Screen>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar emoji={child.avatar} size={48} color={child.color + '22'} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{child.name}</Text>
          <Muted>Bakiyesi: {money(cw?.balance || 0)}</Muted>
        </View>
      </Card>

      <H2>Tutar</H2>
      <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" />
      <View style={s.chips}>
        {QUICK.map((q) => (
          <Pressable key={q} style={s.chip} onPress={() => setAmount(String(q))}>
            <Text style={s.chipText}>{q}₺</Text>
          </Pressable>
        ))}
      </View>

      <H2>Açıklama</H2>
      <View style={s.chips}>
        {REASONS.map((r) => (
          <Pressable key={r} style={[s.reason, reason === r && s.reasonActive]} onPress={() => setReason(r)}>
            <Text style={[s.reasonText, reason === r && { color: colors.onPrimary }]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {goals.length > 0 && val > 0 && (
        <Card style={{ backgroundColor: colors.greenSoft }}>
          <Text style={{ fontWeight: '700', color: colors.green }}>🎯 Otomatik birikim</Text>
          {goals.map((g) => (
            <Muted key={g.id}>{g.title}: bu harçlığın %{g.autoContributionPct}'i ({money(val * g.autoContributionPct / 100)}) otomatik hedefe gider.</Muted>
          ))}
        </Card>
      )}

      <Muted>Aile bakiyesi: {money(fam?.balance || 0)}</Muted>
      {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
      <Btn
        title={val > 0 ? `${money(val)} Gönder` : 'Tutar gir'}
        kind="success"
        disabled={val <= 0 || insufficient}
        onPress={send}
      />
      {insufficient && val > 0 ? <Muted style={{ textAlign: 'center', color: colors.red }}>Aile bakiyesi yetersiz.</Muted> : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.greenSoft, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  chipText: { color: colors.green, fontWeight: '700', fontSize: font.body },
  reason: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  reasonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  reasonText: { fontWeight: '600', color: colors.text, fontSize: font.small },
});
