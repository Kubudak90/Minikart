// Biçimlendirme yardımcıları (Türkçe / TRY)

export function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

// ₺1.250,50 biçimi (Intl'e güvenmeden, Hermes uyumlu)
export function money(amount: number): string {
  const neg = amount < 0;
  const abs = Math.abs(amount);
  const fixed = abs.toFixed(2); // "1250.50"
  const [intPart, decPart] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}₺${withThousands},${decPart}`;
}

export function moneyShort(amount: number): string {
  const abs = Math.abs(amount);
  const intPart = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}₺${intPart}`;
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
