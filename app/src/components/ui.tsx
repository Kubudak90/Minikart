// MiniKart Aile - paylaşılan UI bileşenleri
import React from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ViewStyle, TextStyle,
  ScrollView, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow, font } from '../theme/theme';

export function Screen({
  children, scroll = true, bg = colors.bg, padded = true,
}: { children: React.ReactNode; scroll?: boolean; bg?: string; padded?: boolean }) {
  const inner = (
    <View style={{ padding: padded ? spacing.lg : 0, paddingBottom: spacing.xxl * 2, gap: spacing.lg }}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {inner}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{inner}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function H1({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.h1, style]}>{children}</Text>;
}
export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.h2, style]}>{children}</Text>;
}
export function Muted({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.muted, style]}>{children}</Text>;
}
export function Body({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const content = <View style={[s.card, style]}>{children}</View>;
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>{content}</Pressable>;
  return content;
}

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export function Btn({
  title, onPress, kind = 'primary', disabled, style, small,
}: { title: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; style?: ViewStyle; small?: boolean }) {
  const palette: Record<BtnKind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    success: { bg: colors.green, fg: colors.onPrimary },
    danger: { bg: colors.red, fg: colors.onPrimary },
    secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
    ghost: { bg: 'transparent', fg: colors.primary, border: colors.border },
  };
  const p = palette[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        small && { paddingVertical: 10, paddingHorizontal: 16 },
        { backgroundColor: p.bg, opacity: disabled ? 0.45 : pressed ? 0.9 : 1 },
        p.border ? { borderWidth: 1.5, borderColor: p.border } : null,
        style,
      ]}
    >
      <Text style={[s.btnText, small && { fontSize: font.small }, { color: p.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  label, value, onChangeText, placeholder, keyboardType, secureTextEntry, maxLength, multiline,
}: {
  label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address'; secureTextEntry?: boolean;
  maxLength?: number; multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        style={[s.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        multiline={multiline}
      />
    </View>
  );
}

export function Pill({ text, color = colors.primary, bg = colors.primarySoft }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color }]}>{text}</Text>
    </View>
  );
}

export function Avatar({ emoji, size = 48, color = colors.primarySoft }: { emoji: string; size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color = colors.green, height = 12 }: { pct: number; color?: string; height?: number }) {
  return (
    <View style={{ height, backgroundColor: colors.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

export function ToggleRow({
  label, sub, value, onValueChange, icon,
}: { label: string; sub?: string; value: boolean; onValueChange: (v: boolean) => void; icon?: string }) {
  return (
    <View style={s.toggleRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        {icon ? <Text style={{ fontSize: 20 }}>{icon}</Text> : null}
        <View style={{ flex: 1 }}>
          <Text style={s.toggleLabel}>{label}</Text>
          {sub ? <Text style={s.toggleSub}>{sub}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.borderStrong }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl, gap: 6 }}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
      <Text style={[s.h2, { textAlign: 'center' }]}>{title}</Text>
      {sub ? <Muted style={{ textAlign: 'center' }}>{sub}</Muted> : null}
    </View>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: font.h1, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: font.h3, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.small, color: colors.textMuted },
  body: { fontSize: font.body, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow.card },
  btn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: font.body, fontWeight: '700' },
  label: { fontSize: font.small, fontWeight: '600', color: colors.textMuted, marginLeft: 4 },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: font.body, color: colors.text, borderWidth: 1.5, borderColor: colors.border,
  },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: font.tiny, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  toggleLabel: { fontSize: font.body, fontWeight: '600', color: colors.text },
  toggleSub: { fontSize: font.tiny, color: colors.textMuted, marginTop: 2 },
});
