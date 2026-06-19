// Son çare hata sınırı: bir ekran render sırasında patlarsa beyaz ekran yerine
// kurtarma ekranı gösterir ve demoyu sıfırlama imkânı verir (Spec güvenlik ağı).
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, SESSION_KEY } from '../store/persistence';
import { colors } from '../theme/theme';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Gerçek üründe burada hata raporlama servisine gönderilir.
    if (__DEV__) console.warn('ErrorBoundary yakaladı:', error);
  }

  reset = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, SESSION_KEY]);
    } catch {}
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 44 }}>🛟</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Bir şeyler ters gitti</Text>
        <Text style={{ textAlign: 'center', color: colors.textMuted }}>
          Uygulamayı sıfırlayıp demo verisiyle yeniden başlatabilirsin.
        </Text>
        <Pressable
          onPress={this.reset}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12, marginTop: 4 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Uygulamayı sıfırla</Text>
        </Pressable>
      </View>
    );
  }
}
