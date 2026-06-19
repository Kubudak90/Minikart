// Para artık tamsayı KURUŞ olarak tutulur; money() görüntülerken 100'e böler.
import { money, moneyShort, tlToKurus, kurusToTl } from './format';

describe('money (kuruş girişi)', () => {
  test('binlik ayıracı ve virgüllü kuruş', () => {
    expect(money(125050)).toBe('₺1.250,50'); // 1250.50 TL
  });
  test('küçük tam sayı', () => {
    expect(money(3200)).toBe('₺32,00'); // 32 TL
  });
  test('negatif değer', () => {
    expect(money(-1850)).toBe('-₺18,50');
  });
  test('sıfır', () => {
    expect(money(0)).toBe('₺0,00');
  });
  test('milyon ölçeği', () => {
    expect(money(123456789)).toBe('₺1.234.567,89');
  });
  test('tek haneli kuruş sıfırla doldurulur', () => {
    expect(money(105)).toBe('₺1,05'); // 1.05 TL
  });
});

describe('moneyShort (kuruş girişi)', () => {
  test('en yakın TL’ye yuvarlar', () => {
    expect(moneyShort(125050)).toBe('₺1.251'); // 1250.50 → 1251
    expect(moneyShort(3200)).toBe('₺32');
  });
});

describe('TL <-> kuruş dönüşümü', () => {
  test('tlToKurus tamsayı kuruş üretir', () => {
    expect(tlToKurus(1250.5)).toBe(125050);
    expect(tlToKurus(18.5)).toBe(1850);
    expect(tlToKurus(0.07)).toBe(7); // float tuzağı yok
  });
  test('kurusToTl bölme yapar', () => {
    expect(kurusToTl(125050)).toBe(1250.5);
  });
  test('tlToKurus ile money tutarlı', () => {
    expect(money(tlToKurus(99.9))).toBe('₺99,90');
  });
});
