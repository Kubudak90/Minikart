import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, H1, Muted, Btn, Card, Avatar } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { isLocked, registerAttempt, initialGate, PinGate, MAX_PIN_ATTEMPTS, LOCK_MS } from '../../utils/security';

// Spec §14 çocuk için PIN/avatar tabanlı giriş (demo PIN: 1234)
export function ChildLoginScreen() {
  const { state, loginChild } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [gate, setGate] = useState<PinGate>(initialGate);

  const child = state.children.find((c) => c.id === selected);
  const locked = isLocked(gate, Date.now());

  const press = (d: string) => {
    if (pin.length >= 4 || locked) return;
    const next = pin + d;
    setPin(next);
    setErr('');
    if (next.length === 4) {
      setTimeout(() => {
        const ok = !!selected && loginChild(selected, next);
        const now = Date.now();
        const ng = registerAttempt(gate, ok, now);
        setGate(ng);
        if (!ok) {
          setPin('');
          if (isLocked(ng, now)) {
            setErr('Çok fazla yanlış deneme. 30 saniye bekle.');
            setTimeout(() => { setGate(initialGate); setErr(''); }, LOCK_MS);
          } else {
            setErr(`PIN hatalı. ${MAX_PIN_ATTEMPTS - ng.attempts} hakkın kaldı. (demo: 1234)`);
          }
        }
      }, 150);
    }
  };

  if (!selected) {
    return (
      <Screen>
        <View style={{ gap: 6, marginTop: spacing.md }}>
          <Text style={{ fontSize: 40 }}>🧒</Text>
          <H1>Kim giriş yapıyor?</H1>
          <Muted>Profilini seç.</Muted>
        </View>
        <View style={{ gap: spacing.md }}>
          {state.children.map((c) => (
            <Card key={c.id} onPress={() => setSelected(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <Avatar emoji={c.avatar} size={56} color={c.color + '22'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{c.name}</Text>
                <Muted>@{c.username}</Muted>
              </View>
              <Text style={{ fontSize: 22, color: colors.textFaint }}>›</Text>
            </Card>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 8, marginTop: spacing.lg }}>
        <Avatar emoji={child?.avatar || '🧒'} size={72} color={(child?.color || colors.purple) + '22'} />
        <H1>Merhaba {child?.name}!</H1>
        <Muted>4 haneli PIN'ini gir (demo: 1234)</Muted>
        <View style={{ flexDirection: 'row', gap: 14, marginVertical: spacing.lg }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < pin.length ? colors.purple : colors.surfaceAlt }]} />
          ))}
        </View>
        {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
      </View>

      <View style={s.pad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
          <Pressable
            key={i}
            disabled={k === '' || locked}
            onPress={() => (k === '⌫' ? setPin((p) => p.slice(0, -1)) : k && press(k))}
            style={({ pressed }) => [s.key, k === '' && { opacity: 0 }, pressed && { backgroundColor: colors.primarySoft }]}
          >
            <Text style={s.keyText}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <Btn title="Geri" kind="ghost" onPress={() => { setSelected(null); setPin(''); setErr(''); }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  dot: { width: 16, height: 16, borderRadius: 8 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 0 },
  key: { width: '33.33%', height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  keyText: { fontSize: 28, fontWeight: '600', color: colors.text },
});
