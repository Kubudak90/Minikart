import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { money } from '../../utils/format';

const QUICK = [100, 250, 500, 1000];

export function TopUpScreen({ navigation }: any) {
  const { familyWallet, topUp } = useApp();
  const [amount, setAmount] = useState('');
  const fam = familyWallet();
  const val = parseFloat(amount.replace(',', '.')) || 0;

  return (
    <Screen>
      <Card>
        <Muted>Mevcut aile bakiyesi</Muted>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{money(fam?.balance || 0)}</Text>
      </Card>

      <H2>Ne kadar yüklemek istersin?</H2>
      <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" />
      <View style={s.chips}>
        {QUICK.map((q) => (
          <Pressable key={q} style={s.chip} onPress={() => setAmount(String(q))}>
            <Text style={s.chipText}>+{q}₺</Text>
          </Pressable>
        ))}
      </View>

      <Muted>Demo: gerçek ödeme alınmaz. Gerçek üründe banka/kart ile lisanslı e-para sağlayıcısı üzerinden yüklenir.</Muted>

      <Btn
        title={val > 0 ? `${money(val)} Yükle` : 'Tutar gir'}
        disabled={val <= 0}
        onPress={() => { topUp(val); navigation.goBack(); }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.primarySoft, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  chipText: { color: colors.primaryDark, fontWeight: '700', fontSize: font.body },
});
