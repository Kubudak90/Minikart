// MiniKart Aile - Tasarım Sistemi
// "Çocuk için anlaşılır, ebeveyn için güvenilir."
// Güvenilir fintech + sıcak aile dünyası. Claude Design handoff'undan üretildi.
// Marka: Mini Purple #7B61FF (CTA/aktif/logo) + Family Green #45B982 (başarı/birikim).

export const colors = {
  // Marka
  primary: '#7B61FF', // Mini Purple
  primaryDark: '#5A40DB',
  primaryPress: '#6A4FF0',
  primarySoft: '#EDE8FF', // card-lavender
  green: '#45B982', // Family Green
  greenDark: '#2F9468',
  greenSoft: '#DDF7EF', // sky-mint
  amber: '#9A6B00', // okunur sarı (metin/ikon)
  amberSoft: '#FFF1CF',
  yellow: '#FFD66B', // sunshine — rozet/yıldız dolgusu
  red: '#FF7A70', // coral-alert
  redSoft: '#FFE9E6',
  purple: '#7B61FF', // çocuk vurgusu da mor
  purpleSoft: '#EDE8FF',
  pink: '#FFB7C8', // piggy mascot

  // Yüzeyler
  bg: '#F8F8FB', // neutral-50 app arka planı
  bgWarm: '#FAF7F2', // soft cream
  bgChild: '#F4F0FF', // çocuk ekranı biraz daha renkli
  surface: '#FFFFFF',
  surfaceAlt: '#F1F1F6', // neutral-100
  mint: '#DDF7EF',
  lavender: '#EDE8FF',
  cream: '#FAF7F2',

  // Metin
  text: '#20223A', // night-navy
  textHeading: '#181A2A', // neutral-900
  textMuted: '#73778C', // neutral-500
  textFaint: '#C8CBD8', // neutral-300
  onPrimary: '#FFFFFF',

  border: '#F1F1F6', // neutral-100
  borderStrong: '#C8CBD8', // neutral-300
  shadow: '#20223A14',
};

// Kart yüzü gradyanı (mor) + çocuk başına tema renkleri
export const gradients = {
  card: ['#8E78FF', '#6A4FF0'] as const, // varsayılan mor kart
  green: ['#54C997', '#2F9468'] as const,
  pink: ['#FF9DB6', '#F06A8E'] as const,
  navy: ['#3A3E63', '#20223A'] as const,
  yellow: ['#FFD66B', '#F0A93C'] as const,
  purpleSoft: ['#EDE8FF', '#F3EFFF'] as const,
};

// Çocuk renk kodundan kart gradyanı seç
export function cardGradient(hex: string): readonly [string, string] {
  switch (hex.toUpperCase()) {
    case '#2BB673':
    case '#45B982':
      return gradients.green;
    case '#E5484D':
    case '#FF7A70':
      return gradients.pink;
    case '#20223A':
    case '#1C2430':
      return gradients.navy;
    case '#F5A623':
    case '#FFD66B':
      return gradients.yellow;
    default:
      return gradients.card;
  }
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 6, // chip
  sm: 10, // input
  md: 16, // card
  lg: 22, // panel
  xl: 28, // hero
  pill: 999,
};

// Tipografi — Inter (UI/para, tabular) + Nunito Sans (sıcak başlıklar)
export const fonts = {
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heading: 'NunitoSans_700Bold',
  headingX: 'NunitoSans_800ExtraBold',
};

// Type scale (spec §6.3): size
export const font = {
  display: 34,
  h1: 28,
  h2: 24,
  h3: 20,
  bodyLg: 17,
  body: 15,
  small: 13,
  tiny: 12,
};

export const shadow = {
  card: {
    shadowColor: '#20223A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#20223A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  purple: {
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
};
