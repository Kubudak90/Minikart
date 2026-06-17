import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, ProgressBar, Empty, Pill, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { money } from '../../utils/format';

export function ChildSavingsScreen() {
  const { currentChild, childGoals, childWallet, contributeGoal } = useApp();
  const child = currentChild();
  const goals = child ? childGoals(child.id) : [];
  const wallet = child ? childWallet(child.id) : null;
  const [active, setActive] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState('');

  const add = (goalId: string) => {
    const a = parseFloat(amount) || 0;
    if (a <= 0) return;
    if (contributeGoal(goalId, a)) { setActive(null); setAmount(''); setErr(''); }
    else setErr('Yeterli paran yok.');
  };

  return (
    <Screen bg={colors.bgChild}>
      <Card style={{ backgroundColor: colors.surface }}>
        <Muted>Param</Muted>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{money(wallet?.balance || 0)}</Text>
        <Muted>Hedeflerin için buradan biriktirebilirsin 🎯</Muted>
      </Card>

      {goals.length === 0 && <Empty icon="🎯" title="Hedef yok" sub="Ailenle birlikte bir birikim hedefi oluşturabilirsin." />}

      {goals.map((g) => {
        const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
        const done = g.status === 'completed';
        return (
          <Card key={g.id} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text style={{ fontSize: 34 }}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{g.title}</Text>
                <Muted>{money(g.currentAmount)} / {money(g.targetAmount)}</Muted>
              </View>
              {done ? <Pill text="🎉 Tamam!" color={colors.green} bg={colors.greenSoft} /> : <Pill text={`%${pct}`} color={colors.purple} bg={colors.purpleSoft} />}
            </View>
            <ProgressBar pct={pct} color={done ? colors.green : colors.purple} />
            {!done && (
              active === g.id ? (
                <View style={{ gap: spacing.sm }}>
                  <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="Tutar (₺)" />
                  {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Btn title="Biriktir" small kind="success" style={{ flex: 1 }} onPress={() => add(g.id)} />
                    <Btn title="Vazgeç" small kind="ghost" onPress={() => { setActive(null); setErr(''); }} />
                  </View>
                </View>
              ) : (
                <Btn title="💰 Bu hedefe biriktir" small kind="secondary" onPress={() => { setActive(g.id); setAmount(''); }} />
              )
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const s = StyleSheet.create({});
