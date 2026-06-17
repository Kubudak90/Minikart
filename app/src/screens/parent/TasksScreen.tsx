import React from 'react';
import { View, Text } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Pill, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Task } from '../../store/types';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';

const STATUS_META: Record<Task['status'], { label: string; color: string; bg: string }> = {
  open: { label: 'Açık', color: colors.primary, bg: colors.primarySoft },
  submitted: { label: 'Onay bekliyor', color: colors.amber, bg: colors.amberSoft },
  approved: { label: '✓ Onaylandı', color: colors.green, bg: colors.greenSoft },
  rejected: { label: 'Reddedildi', color: colors.red, bg: colors.redSoft },
};

export function TasksScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { childTasks, approveTask, rejectTask } = useApp();
  const tasks = childTasks(childId);

  return (
    <Screen>
      <Btn title="Yeni görev oluştur" icon="plus" onPress={() => navigation.navigate('CreateTask', { childId })} />
      {tasks.length === 0 && <Empty icon="📋" title="Görev yok" sub="Çocuğun için ödüllü görev oluştur." />}
      {tasks.map((t) => {
        const m = STATUS_META[t.status];
        return (
          <Card key={t.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{t.title}</Text>
                {t.description ? <Muted>{t.description}</Muted> : null}
              </View>
              <Pill text={m.label} color={m.color} bg={m.bg} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pill text={`+${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
              <Muted>{t.recurrence === 'repeating' ? 'Tekrarlı' : 'Tek seferlik'}{t.proofRequired ? ' • Kanıt gerekli' : ''}</Muted>
            </View>
            {t.status === 'submitted' && (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Btn title={`Onayla (${money(t.rewardAmount)})`} icon="check" small kind="success" style={{ flex: 1 }} onPress={() => approveTask(t.id)} />
                <Btn title="Reddet" small kind="ghost" onPress={() => rejectTask(t.id)} />
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
