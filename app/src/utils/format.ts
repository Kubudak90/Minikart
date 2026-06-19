// Biçimlendirme yardımcıları (Türkçe / TRY)

export function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

// Para tamsayı KURUŞ olarak tutulur. Bu yardımcılar görüntü/giriş sınırında çevirir.
export const tlToKurus = (tl: number): number => Math.round(tl * 100);
export const kurusToTl = (kurus: number): number => kurus / 100;

// ₺1.250,50 biçimi (Intl'e güvenmeden, Hermes uyumlu). Girdi: kuruş (tamsayı).
export function money(kurus: number): string {
  const k = Math.round(kurus);
  const neg = k < 0;
  const abs = Math.abs(k);
  const intPart = Math.floor(abs / 100).toString();
  const decPart = (abs % 100).toString().padStart(2, '0');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}₺${withThousands},${decPart}`;
}

// Kuruşu en yakın TL'ye yuvarlayıp kısa gösterir (₺1.251).
export function moneyShort(kurus: number): string {
  const tl = Math.round(Math.abs(kurus) / 100);
  const intPart = tl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${kurus < 0 ? '-' : ''}₺${intPart}`;
}

const MONTHS = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} gün önce`;
  return shortDate(iso);
}

export function dateTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hh}:${mm}`;
}

export function age(birthDate: string): number {
  const b = new Date(birthDate);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

export const CATEGORY_META: Record<
  string,
  { label: string; icon: string }
> = {
  market: { label: 'Market', icon: '🛒' },
  kirtasiye: { label: 'Kırtasiye', icon: '✏️' },
  ulasim: { label: 'Ulaşım', icon: '🚌' },
  yemek: { label: 'Yemek', icon: '🍔' },
  giyim: { label: 'Giyim', icon: '👕' },
  oyun: { label: 'Oyun / Dijital', icon: '🎮' },
  online: { label: 'Online Alışveriş', icon: '📦' },
  eglence: { label: 'Eğlence', icon: '🎡' },
  atm: { label: 'ATM', icon: '🏧' },
};
