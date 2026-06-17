import React from 'react';
import { View, Text } from 'react-native';
import { Screen, H2, Muted, Card, Btn, ToggleRow, Divider, Empty } from '../../components/ui';
import { CardVisual } from '../../components/CardVisual';
import { useApp } from '../../store/AppContext';
import { colors } from '../../theme/theme';

export function CardControlsScreen({ route, navigation }: any) {
  const { childId } = route.params;
  const { state, childCard, setCardFrozen, updateCardControls, createVirtualCard, requestPhysicalCard } = useApp();
  const child = state.children.find((c) => c.id === childId)!;
  const card = childCard(childId);

  if (!card) {
    return (
      <Screen>
        <Empty icon="💳" title="Kart yok" sub={`${child.name} için bir sanal kart oluştur.`} />
        <Btn title="Sanal kart oluştur" onPress={() => createVirtualCard(childId)} />
      </Screen>
    );
  }

  const c = card.controls;
  return (
    <Screen>
      <CardVisual card={card} name={child.name} color={child.color} />

      <Card>
        <ToggleRow icon="❄️" label="Kartı dondur" sub="Tüm harcamaları geçici durdurur" value={card.status === 'frozen'} onValueChange={(v) => setCardFrozen(card.id, v)} />
      </Card>

      <H2>İzinler</H2>
      <Card>
        <ToggleRow icon="🌐" label="Online ödeme" sub="İnternetten alışveriş" value={c.online} onValueChange={(v) => updateCardControls(card.id, { online: v })} />
        <Divider />
        <ToggleRow icon="🏧" label="ATM kullanımı" sub="Nakit çekme" value={c.atm} onValueChange={(v) => updateCardControls(card.id, { atm: v })} />
        <Divider />
        <ToggleRow icon="📶" label="Temassız ödeme" sub="NFC ile ödeme" value={c.contactless} onValueChange={(v) => updateCardControls(card.id, { contactless: v })} />
        <Divider />
        <ToggleRow icon="✈️" label="Yurt dışı" sub="Yurt dışı işlemler" value={c.abroad} onValueChange={(v) => updateCardControls(card.id, { abroad: v })} />
        <Divider />
        <ToggleRow icon="🌙" label="Gece harcaması engeli" sub="22:00 - 06:00 arası harcamayı engelle" value={c.nightBlock} onValueChange={(v) => updateCardControls(card.id, { nightBlock: v })} />
      </Card>

      <Btn title="📊 Limitleri düzenle" kind="secondary" onPress={() => navigation.navigate('Limits', { childId })} />
      <Btn title="🏷️ Kategori kontrolü" kind="secondary" onPress={() => navigation.navigate('Categories', { childId })} />
      {card.type === 'virtual' && !card.physicalRequested && (
        <Btn title="📮 Fiziksel kart iste" kind="ghost" onPress={() => requestPhysicalCard(childId)} />
      )}
    </Screen>
  );
}
