// PIN hashleme + giriş deneme kilidi (demo-grade; üretimde sunucu tarafı bcrypt/argon2).
import { hashPin, verifyPin, initialGate, isLocked, registerAttempt, MAX_PIN_ATTEMPTS, LOCK_MS } from './security';

describe('hashPin / verifyPin', () => {
  test('aynı PIN aynı hashi üretir', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'));
  });
  test('farklı PIN farklı hash üretir', () => {
    expect(hashPin('1234')).not.toBe(hashPin('1235'));
  });
  test('hash düz metin PINi içermez', () => {
    expect(hashPin('1234')).not.toContain('1234');
  });
  test('verifyPin doğru PINi onaylar, yanlışı reddeder', () => {
    const h = hashPin('1234');
    expect(verifyPin('1234', h)).toBe(true);
    expect(verifyPin('0000', h)).toBe(false);
  });
});

describe('PIN deneme kilidi', () => {
  const NOW = 1_000_000;

  test(`art arda ${MAX_PIN_ATTEMPTS} hatalı denemede kilitlenir`, () => {
    let g = initialGate;
    for (let i = 0; i < MAX_PIN_ATTEMPTS - 1; i++) g = registerAttempt(g, false, NOW);
    expect(isLocked(g, NOW)).toBe(false);
    g = registerAttempt(g, false, NOW); // son deneme
    expect(isLocked(g, NOW)).toBe(true);
  });

  test('kilit süresi dolunca açılır', () => {
    let g = initialGate;
    for (let i = 0; i < MAX_PIN_ATTEMPTS; i++) g = registerAttempt(g, false, NOW);
    expect(isLocked(g, NOW + LOCK_MS - 1)).toBe(true);
    expect(isLocked(g, NOW + LOCK_MS + 1)).toBe(false);
  });

  test('doğru PIN deneme sayacını sıfırlar', () => {
    let g = registerAttempt(initialGate, false, NOW);
    g = registerAttempt(g, true, NOW);
    expect(g).toEqual(initialGate);
  });
});
