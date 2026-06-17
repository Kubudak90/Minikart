import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Category } from '../../store/types';
import { CATEGORY_META, money } from '../../utils/format';
import { colors, spacing, radius, font } from '../../theme/theme';

const CATS: Category[] = ['market', 'kirtasiye', 'ulasim', 'yemek', 'giyim', 'oyun', 'online', 'eglence', 'atm'];

// Spec §16 Webhooks: provider/transaction simülasyonu — limit motorunu test eder.
export function SimulateSpendScreen({ route }: any) {
  const { childId } = route.params;
  const { childCard, childWallet, simulateSpend } = useApp();
  const card = childCard(childId);
  const wallet = childWallet(childId);
  const [merchant, setMerchant] = useState('Migros');
  const [amount, setAmount] = useState('30');
  const [cat, setCat] = useState<Category>('market');
  const [result, setResult] = useState<{ allowed: boolean; reason?: string } | null>(null);

  const run = () => {
    const a = parseFloat(amount) || 0;
    if (a <= 0 || !merchant.trim()) return;
    setResult(simulateSpend(childId, merchant.trim(), a, cat));
  };

  return (
    <Screen>
      <Card style={{ backgroundColor: colors.amberSoft }}>
        <Text style={{ fontWeight: '700', color: colors.amber }}>🧪 Harcama Simülatörü</Text>
        <Muted>Gerçek bir kart işlemini (POS/online) taklit eder. Limit ve kural motorunu test etmek için kullan.</Muted>
        <Muted>Çocuk bakiyesi: {money(wallet?.balance || 0)}{card ? ` • Tek işlem limiti: ${money(card.limits.perTransaction)}` : ''}</Muted>
      </Card>

      <Card>
        <Field label="İşyeri" value={merchant} onChangeText={setMerchant} placeholder="Migros" />
        <Field label="Tutar (₺)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
        <Text style={{ fontSize: font.small, fontWeight: '600', color: colors.textMuted, marginLeft: 4 }}>Kategori</Text>
        <View style={s.chips}>
          {CATS.map((c) => (
            <Pressable key={c} style={[s.chip, cat === c && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setCat(c)}>
              <Text style={[s.chipText, cat === c && { color: colors.onPrimary }]}>{CATEGORY_META[c].icon} {CATEGORY_META[c].label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Btn title="İşlemi gönder" onPress={run} />

      {result && (
        <Card style={{ backgroundColor: result.allowed ? colors.greenSoft : colors.redSoft, alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 36 }}>{result.allowed ? '✅' : '⛔'}</Text>
          <Text style={{ fontSize: font.h3, fontWeight: '800', color: result.allowed ? colors.green : colors.red }}>
            {result.allowed ? 'Onaylandı' : 'Reddedildi'}
          </Text>
          {result.reason ? <Muted style={{ textAlign: 'center' }}>{result.reason}</Muted> : <Muted>Harcama bakiyeden düşüldü ve bildirim gönderildi.</Muted>}
        </Card>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  chipText: { fontWeight: '600', color: colors.text, fontSize: font.small },
});
