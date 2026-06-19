import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Avatar, Divider, Empty, ToggleRow, Pill } from '../../components/ui';
import { CardVisual } from '../../components/CardVisual';
import { TxRow } from '../../components/TxRow';
import { Icon, IconName } from '../../components/Icon';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font, fonts, shadow } from '../../theme/theme';
import { money, age } from '../../utils/format';
import { ParentScreenProps, ChildIdRoute } from '../../navigation/types';

const ACTIONS: { icon: IconName; label: string; route: ChildIdRoute; tint?: string; bg?: string }[] = [
  { icon: 'hand-coins', label: 'Harçlık Gönder', route: 'SendAllowance', tint: colors.green, bg: colors.greenSoft },
  { icon: 'repeat', label: 'Otomatik Harçlık', route: 'Schedules' },
  { icon: 'sliders', label: 'Limitler', route: 'Limits' },
  { icon: 'tag', label: 'Kategoriler', route: 'Categories' },
  { icon: 'target', label: 'Birikim', route: 'Savings' },
  { icon: 'tasks', label: 'Görevler', route: 'Tasks' },
  { icon: 'card', label: 'Kart Kontrol', route: 'CardControls' },
  { icon: 'flask', label: 'Harcama Testi', route: 'SimulateSpend' },
];

export function ChildDetailScreen({ route, navigation }: ParentScreenProps<'ChildDetail'>) {
  const { childId } = route.params;
  const { state, childWallet, childCard, childTransactions, createVirtualCard, requestPhysicalCard, setCardFrozen } = useApp();
  const child = state.children.find((c) => c.id === childId);
  const wallet = childWallet(childId);
  const card = childCard(childId);
  const txs = childTransactions(childId).slice(0, 6);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: child?.name || 'Çocuk' });
  }, [child]);

  if (!child) return <Screen><Empty icon="❓" title="Çocuk bulunamadı" /></Screen>;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Avatar emoji={child.avatar} size={64} color={child.color + '22'} />
        <Text style={{ fontSize: font.h2, fontWeight: '800', color: colors.text }}>{child.name}</Text>
        <Muted>{age(child.birthDate)} yaş • @{child.username}</Muted>
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 4 }}>{money(wallet?.balance || 0)}</Text>
        <Muted>güncel bakiye</Muted>
      </View>

      {card ? (
        <>
          <CardVisual card={card} name={child.name} color={child.color} />
          <Card>
            <ToggleRow
              icon="snowflake"
              label="Kartı dondur"
              sub={card.status === 'frozen' ? 'Kart şu an dondurulmuş' : 'Kart aktif, harcama yapılabilir'}
              value={card.status === 'frozen'}
              onValueChange={(v) => setCardFrozen(card.id, v)}
            />
            {card.type === 'virtual' && !card.physicalRequested && (
              <>
                <Divider />
                <Btn title="Fiziksel kart iste" icon="send" kind="ghost" small onPress={() => requestPhysicalCard(childId)} />
              </>
            )}
            {card.physicalRequested && card.type === 'virtual' && (
              <Pill text="Fiziksel kart yolda" color={colors.amber} bg={colors.amberSoft} />
            )}
          </Card>
        </>
      ) : (
        <Card style={{ alignItems: 'center', gap: spacing.md }}>
          <Icon name="card" size={40} color={colors.primary} />
          <H2>Henüz kart yok</H2>
          <Muted style={{ textAlign: 'center' }}>{child.name} için bir sanal kart oluştur, hemen kullanmaya başlasın.</Muted>
          <Btn title="Sanal kart oluştur" icon="plus" onPress={() => createVirtualCard(childId)} />
        </Card>
      )}

      {/* Aksiyon ızgarası */}
      <View style={s.grid}>
        {ACTIONS.map((a) => (
          <Pressable key={a.route} style={({ pressed }) => [s.tile, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]} onPress={() => navigation.navigate(a.route, { childId })}>
            <View style={[s.tileIcon, { backgroundColor: a.bg || colors.lavender }]}>
              <Icon name={a.icon} size={22} color={a.tint || colors.primary} />
            </View>
            <Text style={s.tileLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H2>Hareketler</H2>
      </View>
      <Card>
        {txs.length === 0 ? (
          <Muted>Henüz hareket yok.</Muted>
        ) : (
          txs.map((t, i) => (
            <View key={t.id}>
              <TxRow tx={t} />
              {i < txs.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center', gap: 10, ...shadow.soft },
  tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: fonts.semibold, fontSize: font.small, color: colors.text },
});
