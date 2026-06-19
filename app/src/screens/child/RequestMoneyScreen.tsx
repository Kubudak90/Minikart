import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, font } from '../../theme/theme';
import { ChildScreenProps } from '../../navigation/types';
import { tlToKurus } from '../../utils/format';

const QUICK = [20, 50, 100, 150]; // TL ön ayarları

// Spec §18: çocuk para gönderemez, sadece isteyebilir.
export function RequestMoneyScreen({ navigation }: ChildScreenProps<'RequestMoney'>) {
  const { currentChild, requestMoney } = useApp();
  const child = currentChild()!;
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  const val = parseFloat(amount) || 0;

  if (sent) {
    return (
      <Screen bg={colors.bgChild}>
        <Card style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.xl }}>
          <Image source={require('../../../assets/illustrations/request-money.png')} style={{ width: 200, height: 150, resizeMode: 'contain' }} />
          <H2>İsteğin gönderildi!</H2>
          <Muted style={{ textAlign: 'center' }}>Ailen isteğini görecek ve onaylarsa paran hesabına eklenecek.</Muted>
          <Btn title="Tamam" onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.bgChild}>
      <Card style={{ backgroundColor: colors.purpleSoft }}>
        <Text style={{ fontWeight: '700', color: colors.purple }}>🙋 Aileden para iste</Text>
        <Muted>Ne kadar ve ne için istediğini yaz. Ailen karar verecek.</Muted>
      </Card>

      <H2>Ne kadar?</H2>
      <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" />
      <View style={s.chips}>
        {QUICK.map((q) => (
          <Pressable key={q} style={s.chip} onPress={() => setAmount(String(q))}>
            <Text style={s.chipText}>{q}₺</Text>
          </Pressable>
        ))}
      </View>

      <H2>Ne için?</H2>
      <Field value={reason} onChangeText={setReason} placeholder="Örn: Arkadaşımın doğum günü hediyesi" multiline />

      <Btn
        title="İsteği gönder"
        kind="primary"
        disabled={val <= 0 || !reason.trim()}
        onPress={() => { requestMoney(child.id, tlToKurus(val), reason.trim()); setSent(true); }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.purpleSoft, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  chipText: { color: colors.purple, fontWeight: '700', fontSize: font.body },
});
