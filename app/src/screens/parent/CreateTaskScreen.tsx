import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field, ToggleRow } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { ParentScreenProps } from '../../navigation/types';
import { tlToKurus } from '../../utils/format';

const QUICK = [20, 30, 50, 100]; // TL ön ayarları

export function CreateTaskScreen({ route, navigation }: ParentScreenProps<'CreateTask'>) {
  const { childId } = route.params;
  const { createTask } = useApp();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reward, setReward] = useState('30');
  const [repeating, setRepeating] = useState(false);
  const [proof, setProof] = useState(false);

  const valid = title.trim() && (parseFloat(reward) || 0) > 0;

  return (
    <Screen>
      <Card>
        <Field label="Görev adı" value={title} onChangeText={setTitle} placeholder="Kitap oku" />
        <Field label="Açıklama" value={desc} onChangeText={setDesc} placeholder="Bu hafta 50 sayfa oku" multiline />
        <Field label="Ödül (₺)" value={reward} onChangeText={setReward} keyboardType="number-pad" />
        <View style={s.chips}>
          {QUICK.map((q) => (
            <Pressable key={q} style={s.chip} onPress={() => setReward(String(q))}>
              <Text style={s.chipText}>{q}₺</Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <Card>
        <ToggleRow icon="🔁" label="Tekrarlı görev" sub="Onaylandıkça yeniden açılır" value={repeating} onValueChange={setRepeating} />
        <ToggleRow icon="📷" label="Kanıt gerekli" sub="Çocuk tamamladığında ebeveyn onayı ister" value={proof} onValueChange={setProof} />
      </Card>
      <Btn title="Görevi oluştur" disabled={!valid} onPress={() => { createTask(childId, title.trim(), desc.trim(), tlToKurus(parseFloat(reward)), proof, repeating ? 'repeating' : 'once'); navigation.goBack(); }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.greenSoft, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  chipText: { color: colors.green, fontWeight: '700', fontSize: font.body },
});
