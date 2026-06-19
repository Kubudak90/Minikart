import React from 'react';
import { View, Text } from 'react-native';
import { Screen, H2, Muted, Card, Btn, ProgressBar, Empty, Pill } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';
import { ParentScreenProps } from '../../navigation/types';

export function SavingsScreen({ route, navigation }: ParentScreenProps<'Savings'>) {
  const { childId } = route.params;
  const { childGoals } = useApp();
  const goals = childGoals(childId);

  return (
    <Screen>
      <Btn title="Yeni hedef oluştur" icon="plus" onPress={() => navigation.navigate('CreateSavings', { childId })} />
      {goals.length === 0 && <Empty image={require('../../../assets/illustrations/piggy-saving.png')} title="Hedef yok" sub="Çocuğun için bir birikim hedefi oluştur." />}
      {goals.map((g) => {
        const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
        return (
          <Card key={g.id} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text style={{ fontSize: 32 }}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{g.title}</Text>
                <Muted>{money(g.currentAmount)} / {money(g.targetAmount)}</Muted>
              </View>
              {g.status === 'completed' ? <Pill text="✓ Tamamlandı" color={colors.green} bg={colors.greenSoft} /> : <Pill text={`%${pct}`} />}
            </View>
            <ProgressBar pct={pct} color={g.status === 'completed' ? colors.green : colors.primary} />
            <Muted>Otomatik katkı: her harçlığın %{g.autoContributionPct}'i</Muted>
          </Card>
        );
      })}
    </Screen>
  );
}
