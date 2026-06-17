import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Btn, H1, Muted } from '../../components/ui';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';

export function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.wrap}>
        <View style={s.hero}>
          <View style={s.logo}><Text style={{ fontSize: 44 }}>💳</Text></View>
          <H1 style={{ fontSize: 34, textAlign: 'center' }}>MiniKart Aile</H1>
          <Text style={s.tag}>Çocuğun ilk kartı, ailenin kontrolünde.</Text>
          <Muted style={{ textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            Harçlık gönderin, limit belirleyin, harcamaları takip edin. Çocuğunuz parayı güvenle kullanmayı öğrensin.
          </Muted>
        </View>

        <View style={s.featureRow}>
          <Feature icon="🔒" label="Güvenli kart" />
          <Feature icon="🔔" label="Anlık bildirim" />
          <Feature icon="🎯" label="Birikim hedefi" />
        </View>

        <View style={{ gap: spacing.md }}>
          <Btn title="👨‍👩‍👧 Ebeveyn olarak gir" onPress={() => navigation.navigate('ParentLogin')} />
          <Btn title="🧒 Çocuk olarak gir" kind="secondary" onPress={() => navigation.navigate('ChildLogin')} />
          <Muted style={{ textAlign: 'center', marginTop: 4 }}>Demo sürümü • gerçek ödeme yapılmaz</Muted>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.feature}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={s.featureLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  hero: { alignItems: 'center', gap: 6, marginTop: spacing.xxl },
  logo: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  tag: { fontSize: font.h3, fontWeight: '700', color: colors.primary, textAlign: 'center', marginTop: 4 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  feature: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 6, ...shadow.soft },
  featureLabel: { fontSize: font.tiny, fontWeight: '600', color: colors.textMuted, textAlign: 'center' },
});
