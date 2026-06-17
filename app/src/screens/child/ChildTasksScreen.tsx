import React from 'react';
import { View, Text } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Pill, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';

export function ChildTasksScreen() {
  const { currentChild, childTasks, submitTask } = useApp();
  const child = currentChild();
  const tasks = child ? childTasks(child.id) : [];
  const open = tasks.filter((t) => t.status === 'open');
  const waiting = tasks.filter((t) => t.status === 'submitted');
  const done = tasks.filter((t) => t.status === 'approved');

  return (
    <Screen bg={colors.bgChild}>
      <Card style={{ backgroundColor: colors.purpleSoft }}>
        <Text style={{ fontWeight: '700', color: colors.purple, fontSize: font.h3 }}>Görevleri tamamla, ödülü kap! 🏅</Text>
        <Muted>Bir görevi bitirince "Tamamladım" de. Ailen onaylayınca paran gelir.</Muted>
      </Card>

      <H2>Yapılacaklar</H2>
      {open.length === 0 && <Empty icon="✅" title="Tüm görevler bitti!" sub="Şu an yapılacak görev yok." />}
      {open.map((t) => (
        <Card key={t.id} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{t.title}</Text>
              {t.description ? <Muted>{t.description}</Muted> : null}
            </View>
            <Pill text={`+${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
          </View>
          <Btn title="✓ Tamamladım" small kind="success" onPress={() => submitTask(t.id)} />
        </Card>
      ))}

      {waiting.length > 0 && (
        <>
          <H2>Onay bekleyenler</H2>
          {waiting.map((t) => (
            <Card key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{t.title}</Text>
                <Muted>Ailen onayını bekliyor…</Muted>
              </View>
              <Pill text="⏳ Beklemede" color={colors.amber} bg={colors.amberSoft} />
            </Card>
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <H2>Tamamlananlar</H2>
          {done.map((t) => (
            <Card key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{t.title}</Text>
              <Pill text={`✓ +${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
