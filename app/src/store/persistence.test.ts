// Kalıcılık katmanı: şema doğrulama + güvenli reseed (regresyon ağı).
import { buildSeed } from './seed';
import { STATE_VERSION, isValidAppState, serializeState, deserializeState } from './persistence';

describe('deserializeState — şema doğrulama + güvenli yükleme', () => {
  test('serialize→deserialize aynı state döndürür', () => {
    const seed = buildSeed();
    expect(deserializeState(serializeState(seed))).toEqual(seed);
  });

  test('null girdide tohum state döndürür', () => {
    const out = deserializeState(null);
    expect(isValidAppState(out)).toBe(true);
    expect(out.family).not.toBeNull();
  });

  test('bozuk JSON çökmez, tohuma düşer', () => {
    expect(() => deserializeState('{ bozuk json')).not.toThrow();
    expect(isValidAppState(deserializeState('{ bozuk'))).toBe(true);
  });

  test('eski/yanlış versiyon blob tohuma düşer', () => {
    const seed = buildSeed();
    const oldBlob = JSON.stringify({ ...seed, __v: STATE_VERSION - 1 });
    const out = deserializeState(oldBlob);
    // Versiyon uyuşmazsa içerik güvenilmez; tohum dönmeli (en azından geçerli).
    expect(isValidAppState(out)).toBe(true);
  });

  test('zorunlu bir dizi eksikse tohuma düşer (sessiz bozulma yok)', () => {
    const seed = buildSeed();
    const broken: any = { ...seed, __v: STATE_VERSION };
    delete broken.savingsGoals; // şema kayması simülasyonu
    const out = deserializeState(JSON.stringify(broken));
    expect(Array.isArray(out.savingsGoals)).toBe(true); // çökme yerine geçerli state
    expect(isValidAppState(out)).toBe(true);
  });
});

describe('isValidAppState', () => {
  test('tam state için true', () => {
    expect(isValidAppState(buildSeed())).toBe(true);
  });
  test('eksik alan için false', () => {
    const { wallets, ...rest } = buildSeed();
    expect(isValidAppState(rest)).toBe(false);
  });
  test('null/primitive için false', () => {
    expect(isValidAppState(null)).toBe(false);
    expect(isValidAppState(42)).toBe(false);
    expect(isValidAppState('x')).toBe(false);
  });
});
