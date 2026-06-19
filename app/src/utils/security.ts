// Çocuk PIN'i için DEMO yardımcıları.
//
// ⚠️ GÜVENLİK SINIRI DEĞİLDİR. Bunlar bir DESENİ gösterir, gerçek koruma sağlamaz:
//  - hashPin: kriptografik DEĞİL (djb2). Tek amacı düz metin PIN'i diske yazmamak.
//    4 haneli PIN'in anahtar uzayı 10^4 olduğundan HİÇBİR istemci-içi KDF (argon2/
//    PBKDF2 dahil) bunu güvenli yapamaz; cihaza+hash'e erişen saniyeler içinde kırar.
//    Demoda PIN zaten ekranda yazılı ("demo: 1234") → gizli bir sır yok.
//  - kilit (aşağıda): istemci tarafı, cihaz saati değiştirilerek atlatılabilir.
//
// ÜRETİM: PIN asla istemcide doğrulanmaz. Sunucu, kullanıcıya özel rastgele salt +
// argon2id/bcrypt ile hashler, sabit-zamanlı kıyaslar ve deneme limitini SUNUCUDA
// uygular. Bu dosya yalnızca yerel demo akışını çalıştırır.
const SALT = 'minikart::pin::v1';

export function hashPin(pin: string): string {
  let h = 5381;
  const str = SALT + pin;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0; // djb2, 32-bit
  }
  return 'h1$' + (h >>> 0).toString(16);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

// ---- giriş deneme kilidi (brute-force koruması) ----
export const MAX_PIN_ATTEMPTS = 5;
export const LOCK_MS = 30_000; // 30 sn

export interface PinGate {
  attempts: number;
  lockedUntil: number; // epoch ms; 0 = kilitli değil
}

export const initialGate: PinGate = { attempts: 0, lockedUntil: 0 };

export function isLocked(gate: PinGate, now: number): boolean {
  return gate.lockedUntil > now;
}

export function registerAttempt(gate: PinGate, success: boolean, now: number): PinGate {
  if (success) return initialGate; // başarı sayacı sıfırlar
  const attempts = gate.attempts + 1;
  if (attempts >= MAX_PIN_ATTEMPTS) return { attempts: 0, lockedUntil: now + LOCK_MS };
  return { attempts, lockedUntil: 0 };
}
