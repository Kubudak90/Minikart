import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { colors, spacing, radius, font, fonts } from '../../theme/theme';
import { AuthScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  return (
    <LinearGradient colors={['#8E78FF', '#5A40DB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.wrap}>
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Image source={require('../../../assets/logos/logo-reversed.png')} style={s.logo} />
            <Image source={require('../../../assets/illustrations/family-happy.png')} style={s.hero} />
            <Text style={s.tag}>Çocuğun ilk kartı,{'\n'}ailenin kontrolünde.</Text>
            <Text style={s.sub}>
              Harçlık gönderin, limit belirleyin, harcamaları takip edin. Çocuğunuz parayı güvenle kullanmayı öğrensin.
            </Text>
          </View>

          <View style={s.featureRow}>
            <Feature icon="shield" label="Güvenli kart" />
            <Feature icon="bell" label="Anlık bildirim" />
            <Feature icon="target" label="Birikim hedefi" />
          </View>

          <View style={{ gap: spacing.md }}>
            <Pressable style={({ pressed }) => [s.primaryBtn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]} onPress={() => navigation.navigate('ParentLogin')}>
              <Icon name="users" size={18} color={colors.primaryDark} />
              <Text style={s.primaryText}>Ebeveyn olarak gir</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [s.ghostBtn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]} onPress={() => navigation.navigate('ChildLogin')}>
              <Icon name="star" size={18} color="#fff" />
              <Text style={s.ghostText}>Çocuk olarak gir</Text>
            </Pressable>
            <Text style={s.demo}>Demo sürümü • gerçek ödeme yapılmaz</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Feature({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={s.feature}>
      <Icon name={icon} size={22} color="#fff" />
      <Text style={s.featureLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'space-between', paddingVertical: spacing.xl },
  logo: { width: 190, height: 64, resizeMode: 'contain', marginTop: spacing.sm },
  hero: { width: 240, height: 178, resizeMode: 'contain' },
  tag: { fontFamily: fonts.headingX, fontSize: 25, color: '#fff', textAlign: 'center', lineHeight: 32 },
  sub: { fontFamily: fonts.body, fontSize: font.body, color: '#ffffffd8', textAlign: 'center', lineHeight: 21, paddingHorizontal: spacing.sm },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  feature: { flex: 1, backgroundColor: '#ffffff1f', borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center', gap: 8 },
  featureLabel: { fontFamily: fonts.semibold, fontSize: font.tiny, color: '#fff', textAlign: 'center' },
  primaryBtn: { height: 52, borderRadius: radius.pill, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: fonts.bold, fontSize: font.body, color: colors.primaryDark },
  ghostBtn: { height: 52, borderRadius: radius.pill, borderWidth: 1.5, borderColor: '#ffffff66', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ghostText: { fontFamily: fonts.bold, fontSize: font.body, color: '#fff' },
  demo: { fontFamily: fonts.body, fontSize: font.tiny, color: '#ffffffb0', textAlign: 'center', marginTop: 2 },
});
