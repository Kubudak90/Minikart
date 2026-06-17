# MiniKart Aile 💳

> Çocuğun ilk kartı, ailenin kontrolünde.

Çocuklar için ebeveyn kontrollü aile para yönetimi uygulaması. Bu repo,
[`Mvp-spec`](./Mvp-spec) dosyasındaki ürün spesifikasyonundan üretilmiş,
**iOS + Android + Web** üzerinde çalışan bir MVP uygulaması içerir.

Tek kod tabanı (Expo / React Native + React Native Web) ile üç platforma da
derlenir.

## Ne yapar?

İki rol var:

### 👨‍👩‍👧 Ebeveyn uygulaması
- Telefon + OTP ile giriş (demo kodu `1234`)
- Çocuk profili oluşturma (avatar, renk, PIN, ilişki, haftalık limit)
- Sanal kart oluşturma / fiziksel kart talebi
- Aile cüzdanına bakiye yükleme
- Tek seferlik harçlık gönderme (otomatik birikim katkısı dahil)
- Otomatik harçlık planı (haftalık / 2 haftalık / aylık, bakiye koşullu)
- Kart kontrolleri: dondur/aç, online, ATM, temassız, yurt dışı, gece engeli
- Limitler: tek işlem / günlük / haftalık
- Kategori (MCC) kontrolü: market, kırtasiye, ulaşım, oyun…
- Görev oluşturma → çocuk tamamlar → ebeveyn onaylar → ödül bakiyeye geçer
- Birikim hedefleri (otomatik katkı yüzdesiyle)
- Para isteklerini onaylama / reddetme
- Bildirim merkezi
- **Harcama simülatörü** — kart işlemi (POS/online webhook) taklidi ile
  limit & kural motorunu canlı test etme
- Profil + KYC durumu + **Audit Log** (kritik işlem kayıtları)

### 🧒 Çocuk uygulaması
- Avatar seçimi + 4 haneli PIN girişi (demo PIN `1234`)
- Bakiye, kart görseli (bilgileri göster/gizle), hareket geçmişi
- Para isteme (çocuk para gönderemez, yalnızca isteyebilir — Spec §18)
- Görevleri görüntüleme ve "Tamamladım" işaretleme
- Birikim hedefine para aktarma
- **Para Okulu** — mini finansal eğitim dersleri + quiz + rozet (Spec §11)
- Bildirimler

### ⚙️ Sistem (yerel servis katmanı)
Gerçek bir e-para/kart partneri olmadan uygulamanın uçtan uca çalışması için
[`app/src/store/AppContext.tsx`](./app/src/store/AppContext.tsx) içinde mock
backend uygulanmıştır:
- Kural & limit motoru (frozen, kategori, gece, tek işlem/günlük/haftalık,
  bakiye kontrolü)
- Görev/ödül motoru
- Otomatik birikim katkısı
- Bildirim üretimi (ebeveyn + çocuk)
- Audit log
- Durum `AsyncStorage`'da kalıcı (web'de `localStorage`)

## Teknoloji

- **Expo SDK 56** + React Native 0.85 + React 19
- **React Native Web** (web hedefi)
- **React Navigation** (native-stack + bottom-tabs)
- **AsyncStorage** ile kalıcı yerel durum
- TypeScript

## Çalıştırma

```bash
cd app
npm install

# Web
npm run web

# iOS (Expo Go veya simülatör — macOS gerektirir)
npm run ios

# Android (Expo Go veya emülatör)
npm run android
```

Expo Go uygulamasıyla telefonunuzda da QR kod okutarak çalıştırabilirsiniz:

```bash
cd app
npx expo start
```

## Demo girişleri

| Rol     | Giriş                                  |
|---------|----------------------------------------|
| Ebeveyn | Herhangi telefon → OTP `1234`          |
| Çocuk   | Elif veya Kerem profili → PIN `1234`   |

Demo verisi (Arslan Ailesi, 2 çocuk, kartlar, işlemler, hedefler, görevler,
bekleyen para isteği) ilk açılışta yüklüdür. Profil sekmesinden
"Demo verisini sıfırla" ile baştan başlayabilirsiniz.

## Önemli not

Bu bir **MVP demo**'dur; gerçek para hareketi yoktur. Spec §13'te belirtildiği
gibi gerçek üründe para yükleme, saklama ve kart işlemleri lisanslı bir
elektronik para / banka partneri (6493 sayılı Kanun, TCMB izinleri) üzerinden
yürütülmelidir. Kart verisi sunucuda saklanmamalı, KYC/MASAK ve KVKK
yükümlülükleri partner yapısına göre tasarlanmalıdır.
