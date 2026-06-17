import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, H1, H2, Muted, Card, Btn, Divider, Pill, Avatar } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, font } from '../../theme/theme';
import { dateTime } from '../../utils/format';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Muted>{label}</Muted>
      <Text style={{ fontWeight: '600', color: colors.text }}>{value}</Text>
    </View>
  );
}

export function ParentProfileScreen() {
  const { state, currentParent, logout, resetDemo } = useApp();
  const parent = currentParent();
  const audit = [...state.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 6, marginTop: spacing.md }}>
        <Avatar emoji="👤" size={64} color={colors.primarySoft} />
        <H1>{parent?.fullName}</H1>
        <Pill text={`KYC: ${parent?.kycStatus === 'verified' ? '✓ Doğrulandı' : 'Bekliyor'}`} color={colors.green} bg={colors.greenSoft} />
      </View>

      <Card>
        <H2>Aile bilgileri</H2>
        <Row label="Aile" value={state.family?.name || '-'} />
        <Divider />
        <Row label="Telefon" value={parent?.phone || '-'} />
        <Divider />
        <Row label="E-posta" value={parent?.email || '-'} />
        <Divider />
        <Row label="Rol" value={parent?.role === 'owner' ? 'Hesap sahibi' : 'İkincil ebeveyn'} />
        <Divider />
        <Row label="Çocuk sayısı" value={String(state.children.length)} />
      </Card>

      {/* Spec §17 Admin / §15 Audit log */}
      <Card>
        <H2>İşlem kayıtları (Audit Log)</H2>
        <Muted>Tüm kritik işlemler güvenlik için kaydedilir.</Muted>
        {audit.map((a, i) => (
          <View key={a.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: colors.text, fontSize: font.small }}>{a.action}</Text>
                <Muted>{a.actor}</Muted>
              </View>
              <Text style={{ fontSize: font.tiny, color: colors.textFaint }}>{dateTime(a.createdAt)}</Text>
            </View>
            {i < audit.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      <Btn title="Çıkış yap" kind="secondary" onPress={logout} />
      <Btn title="Demo verisini sıfırla" kind="ghost" onPress={resetDemo} />
      <Muted style={{ textAlign: 'center' }}>MiniKart Aile • MVP demo sürümü</Muted>
    </Screen>
  );
}

const s = StyleSheet.create({});
