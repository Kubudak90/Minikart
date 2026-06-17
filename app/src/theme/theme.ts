// MiniKart Aile - Tasarım sistemi (Spec §20 Tasarım İlkeleri)
// Pastel ama bebeksi değil, güven veren mavi/yeşil, sıcak krem arka plan.

export const colors = {
  // Marka
  primary: '#2E6BE6', // güven veren mavi
  primaryDark: '#1E4FB0',
  primarySoft: '#E7EFFE',
  green: '#2BB673', // birikim / olumlu
  greenSoft: '#E3F7EE',
  amber: '#F5A623',
  amberSoft: '#FDF1DD',
  red: '#E5484D',
  redSoft: '#FCE8E9',
  purple: '#7C5CFC', // çocuk vurgusu
  purpleSoft: '#EEE9FF',

  // Yüzeyler
  bg: '#FBF7F0', // sıcak krem arka plan
  bgChild: '#F4F0FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0EA',

  // Metin
  text: '#1C2430',
  textMuted: '#6B7480',
  textFaint: '#A0A8B2',
  onPrimary: '#FFFFFF',

  border: '#ECE7DD',
  borderStrong: '#DAD4C8',
  shadow: '#1C243015',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const font = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export const shadow = {
  card: {
    shadowColor: '#1C2430',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  soft: {
    shadowColor: '#1C2430',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
};
