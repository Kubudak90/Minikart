import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field, Divider, Empty, Pill } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Frequency } from '../../store/types';
import { colors, spacing, radius, font } from '../../theme/theme';
import { money, shortDate, tlToKurus } from '../../utils/format';
import { ParentScreenProps } from '../../navigation/types';

const FREQ: { key: Frequency; label: string }[] = [
  { key: 'weekly', label: 'Haftalık' },
  { key: 'biweekly', label: '2 Haftada bir' },
  { key: 'monthly', label: 'Aylık' },
];

export function SchedulesScreen({ route }: ParentScreenProps<'Schedules'>) {
  const { childId } = route.params;
  const { state, createSchedule, toggleSchedule, deleteSchedule, runScheduleNow } = useApp();
  const schedules = state.allowanceSchedules.filter((a) => a.childId === childId);

  const [amount, setAmount] = useState('150');
  const [freq, setFreq] = useState<Frequency>('weekly');
  const [cap, setCap] = useState('500');
  const [msg, setMsg] = useState('');

  const add = () => {
    const a = parseFloat(amount) || 0;
    if (a <= 0) return;
    createSchedule(childId, tlToKurus(a), freq, cap ? tlToKurus(parseFloat(cap)) : undefined);
    setMsg('Otomatik harçlık planı oluşturuldu.');
  };

  return (
    <Screen>
      <H2>Aktif planlar</H2>
      {schedules.length === 0 && <Empty icon="🔁" title="Plan yok" sub="Aşağıdan otomatik harçlık planı oluştur." />}
      {schedules.map((sch) => (
        <Card key={sch.id} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: font.h3, fontWeight: '800', color: colors.text }}>{money(sch.amount)}</Text>
            <Pill text={sch.active ? 'Aktif' : 'Duraklatıldı'} color={sch.active ? colors.green : colors.textMuted} bg={sch.active ? colors.greenSoft : colors.surfaceAlt} />
          </View>
          <Muted>{FREQ.find((f) => f.key === sch.frequency)?.label}{sch.capBalanceUnder ? ` • Bakiye ${money(sch.capBalanceUnder)} üstündeyse gönderme` : ''}</Muted>
          {sch.lastRunAt ? <Muted>Son gönderim: {shortDate(sch.lastRunAt)}</Muted> : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Btn title="Şimdi çalıştır" icon="send" small kind="success" style={{ flex: 1 }} onPress={() => { if (!runScheduleNow(sch.id)) setMsg('Çalıştırılamadı (bakiye/koşul). Aile bakiyesini kontrol et.'); else setMsg('Harçlık gönderildi.'); }} />
            <Btn title={sch.active ? 'Duraklat' : 'Sürdür'} small kind="ghost" style={{ flex: 1 }} onPress={() => toggleSchedule(sch.id)} />
            <Btn title="Sil" small kind="ghost" onPress={() => deleteSchedule(sch.id)} />
          </View>
        </Card>
      ))}

      <Divider />
      <H2>Yeni plan</H2>
      <Card>
        <Field label="Tutar (₺)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
        <Text style={{ fontSize: font.small, fontWeight: '600', color: colors.textMuted, marginLeft: 4 }}>Sıklık</Text>
        <View style={s.chips}>
          {FREQ.map((f) => (
            <Pressable key={f.key} style={[s.chip, freq === f.key && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setFreq(f.key)}>
              <Text style={[s.chipText, freq === f.key && { color: colors.onPrimary }]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Otomatik durdurma: bakiye bunun üstündeyse gönderme (₺)" value={cap} onChangeText={setCap} keyboardType="number-pad" />
      </Card>
      {msg ? <Text style={{ color: colors.green, fontWeight: '600' }}>{msg}</Text> : null}
      <Btn title="Planı oluştur" onPress={add} />
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  chipText: { fontWeight: '600', color: colors.text, fontSize: font.small },
});
