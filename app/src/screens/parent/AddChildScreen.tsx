import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field, ToggleRow } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Relation } from '../../store/types';
import { colors, spacing, radius, font } from '../../theme/theme';

const AVATARS = ['🦊', '🐯', '🐼', '🦁', '🐨', '🐸', '🦄', '🐧', '🐶', '🐱'];
const COLORS = ['#7C5CFC', '#2BB673', '#2E6BE6', '#F5A623', '#E5484D', '#00B8D9'];
const RELATIONS: { key: Relation; label: string }[] = [
  { key: 'kizim', label: 'Kızım' },
  { key: 'oglum', label: 'Oğlum' },
  { key: 'yegenim', label: 'Yeğenim' },
  { key: 'torunum', label: 'Torunum' },
  { key: 'diger', label: 'Diğer' },
];

export function AddChildScreen({ navigation }: any) {
  const { addChild } = useApp();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [relation, setRelation] = useState<Relation>('kizim');
  const [weekly, setWeekly] = useState('350');
  const [createVirtual, setCreateVirtual] = useState(true);
  const [err, setErr] = useState('');

  const valid = name.trim() && username.trim() && pin.length === 4 && /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  const submit = () => {
    if (!valid) { setErr('Lütfen tüm alanları doğru doldur (PIN 4 hane, doğum tarihi YYYY-AA-GG).'); return; }
    addChild({
      name: name.trim(), birthDate, username: username.trim().toLowerCase(), avatar, color, pin,
      relation, weeklyLimit: parseInt(weekly) || 350, createVirtual,
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <H2>Avatar seç</H2>
      <View style={s.row}>
        {AVATARS.map((a) => (
          <Pressable key={a} onPress={() => setAvatar(a)} style={[s.avatar, { backgroundColor: avatar === a ? color + '33' : colors.surface, borderColor: avatar === a ? color : colors.border }]}>
            <Text style={{ fontSize: 24 }}>{a}</Text>
          </Pressable>
        ))}
      </View>

      <H2>Renk</H2>
      <View style={s.row}>
        {COLORS.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[s.color, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text }]} />
        ))}
      </View>

      <Card>
        <Field label="Ad" value={name} onChangeText={setName} placeholder="Çocuğun adı" />
        <Field label="Doğum tarihi (YYYY-AA-GG)" value={birthDate} onChangeText={setBirthDate} placeholder="2014-05-12" keyboardType="number-pad" />
        <Field label="Kullanıcı adı" value={username} onChangeText={setUsername} placeholder="elif" />
        <Field label="Giriş PIN'i (4 hane)" value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={4} secureTextEntry placeholder="••••" />
      </Card>

      <H2>İlişki</H2>
      <View style={s.row}>
        {RELATIONS.map((r) => (
          <Pressable key={r.key} onPress={() => setRelation(r.key)} style={[s.pill, relation === r.key && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[s.pillText, relation === r.key && { color: colors.onPrimary }]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <Field label="Varsayılan haftalık limit (₺)" value={weekly} onChangeText={setWeekly} keyboardType="number-pad" />
        <ToggleRow icon="💳" label="Sanal kart oluştur" sub="Profil ile birlikte hemen kullanılabilir kart" value={createVirtual} onValueChange={setCreateVirtual} />
      </Card>

      {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
      <Btn title="Çocuk profilini oluştur" disabled={!valid} onPress={submit} />
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  color: { width: 40, height: 40, borderRadius: 20 },
  pill: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  pillText: { fontWeight: '600', color: colors.text, fontSize: font.small },
});
