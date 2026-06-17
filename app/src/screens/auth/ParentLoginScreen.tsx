import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Screen, H1, Muted, Field, Btn, Card } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing } from '../../theme/theme';

// Spec §8.1 ebeveyn kayıt/giriş — telefon + OTP (demo: kod 1234)
export function ParentLoginScreen() {
  const { loginParent } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+90 555 000 0000');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');

  return (
    <Screen>
      <View style={{ gap: 8, marginTop: spacing.md }}>
        <Image source={require('../../../assets/logos/logo-horizontal.png')} style={{ width: 170, height: 56, resizeMode: 'contain' }} />
        <H1>Ebeveyn Girişi</H1>
        <Muted>Aile hesabını yönetmek için telefonunla giriş yap.</Muted>
      </View>

      {step === 'phone' ? (
        <Card>
          <Field label="Telefon numarası" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+90 5XX XXX XX XX" />
          <Btn title="Doğrulama kodu gönder" onPress={() => { setStep('otp'); setErr(''); }} />
          <Muted style={{ textAlign: 'center' }}>SMS ile 4 haneli kod göndereceğiz.</Muted>
        </Card>
      ) : (
        <Card>
          <Muted>{phone} numarasına gönderilen kodu gir.</Muted>
          <View style={{ backgroundColor: colors.amberSoft, padding: 12, borderRadius: 12 }}>
            <Text style={{ color: colors.amber, fontWeight: '700', textAlign: 'center' }}>Demo kodu: 1234</Text>
          </View>
          <Field label="Doğrulama kodu" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={4} placeholder="••••" />
          {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
          <Btn title="Doğrula ve gir" onPress={() => { if (otp === '1234') loginParent(); else setErr('Kod hatalı. Demo kodu: 1234'); }} />
          <Btn title="Numarayı değiştir" kind="ghost" small onPress={() => setStep('phone')} />
        </Card>
      )}

      <Muted style={{ textAlign: 'center' }}>
        Giriş yaparak KVKK aydınlatma metnini ve kullanıcı sözleşmesini kabul etmiş olursun.
      </Muted>
    </Screen>
  );
}
