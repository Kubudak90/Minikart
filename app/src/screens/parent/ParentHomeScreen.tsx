import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, H1, H2, Muted, Card, Btn, Avatar, Pill, Divider, Empty, Money } from '../../components/ui';
import { TxRow } from '../../components/TxRow';
import { Icon } from '../../components/Icon';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font, fonts, shadow, gradients } from '../../theme/theme';
import { money, age } from '../../utils/format';

export function ParentHomeScreen({ navigation }: any) {
  const { state, currentParent, familyWallet, childWallet, childCard, unreadCount } = useApp();
  const parent = currentParent();
  const fam = familyWallet();
  const recent = [...state.transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
        <View>
          <Muted>Merhaba 👋</Muted>
          <H1>{parent?.fullName?.split(' ')[0] || 'Ebeveyn'}</H1>
        </View>
        <Pill text={state.family?.name || 'Aile'} />
      </View>

      {/* Aile cüzdanı */}
      <LinearGradient colors={gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.walletCard, shadow.purple]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="wallet" size={18} color="#ffffffcc" />
          <Text style={s.walletLabel}>Aile Bakiyesi</Text>
        </View>
        <Money style={s.walletBalance}>{money(fam?.balance || 0)}</Money>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <Btn title="Bakiye Yükle" icon="plus" kind="secondary" small style={{ flex: 1 }} onPress={() => navigation.navigate('TopUp')} />
          <Btn title="Çocuk Ekle" icon="users" kind="secondary" small style={{ flex: 1 }} onPress={() => navigation.navigate('AddChild')} />
        </View>
      </LinearGradient>

      {/* Çocuklar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H2>Çocuklar</H2>
        <Muted>{state.children.length} profil</Muted>
      </View>

      {state.children.length === 0 && <Empty icon="🧒" title="Henüz çocuk profili yok" sub="İlk çocuğunu ekleyerek başla." />}

      {state.children.map((c) => {
        const w = childWallet(c.id);
        const card = childCard(c.id);
        return (
          <Card key={c.id} onPress={() => navigation.navigate('ChildDetail', { childId: c.id })} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar emoji={c.avatar} size={52} color={c.color + '22'} />
              <View style={{ flex: 1 }}>
                <Text style={s.childName}>{c.name}</Text>
                <Muted>{age(c.birthDate)} yaş • @{c.username}</Muted>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Money style={s.childBalance}>{money(w?.balance || 0)}</Money>
                {card ? (
                  <Pill
                    text={card.status === 'frozen' ? 'Donduruldu' : card.type === 'virtual' ? 'Sanal kart' : 'Fiziksel kart'}
                    color={card.status === 'frozen' ? colors.red : colors.green}
                    bg={card.status === 'frozen' ? colors.redSoft : colors.greenSoft}
                  />
                ) : (
                  <Pill text="Kart yok" color={colors.amber} bg={colors.amberSoft} />
                )}
              </View>
            </View>
            <Divider />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Btn title="Harçlık" icon="hand-coins" small kind="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('SendAllowance', { childId: c.id })} />
              <Btn title="Kart" icon="sliders" small kind="ghost" style={{ flex: 1 }} onPress={() => navigation.navigate('CardControls', { childId: c.id })} />
            </View>
          </Card>
        );
      })}

      {/* Son hareketler */}
      <H2>Son Hareketler</H2>
      <Card>
        {recent.length === 0 ? (
          <Muted>Henüz hareket yok.</Muted>
        ) : (
          recent.map((t, i) => (
            <View key={t.id}>
              <TxRow tx={t} />
              {i < recent.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  walletCard: { borderRadius: radius.xl, padding: spacing.xl, gap: 4 },
  walletLabel: { color: '#ffffffcc', fontSize: font.small, fontFamily: fonts.semibold },
  walletBalance: { color: '#fff', fontSize: 36, fontFamily: fonts.headingX, letterSpacing: -1 },
  childName: { fontSize: font.h3, fontFamily: fonts.heading, color: colors.text },
  childBalance: { fontSize: font.h3, fontFamily: fonts.bold, color: colors.text },
});
