# Görev Fotoğraf Kanıtı — Tasarım Dokümanı

- **Tarih:** 2026-06-20
- **Durum:** Onaylandı (uygulama planı bekleniyor)
- **Kapsam:** Tek özellik — çocuğun bir görevi kamerayla çektiği fotoğrafla kanıtlaması, ailenin onaylaması.

## 1. Amaç

Çocuk bir görevi (ör. "odasını topla") bitirdiğinde, ebeveyn istediği görevlerde
**anlık çekilmiş bir fotoğrafı** kanıt olarak görsün, ardından onaylasın ya da
notla geri göndersin. Amaç: ödülün gerçek bir tamamlama karşılığında verilmesini
sağlamak ve "tekrar dene" döngüsüyle çocuğu eğitmek.

## 2. Kararlar (brainstorm çıktısı)

1. **Foto kaynağı:** Sadece kamera (anlık çekim). Galeri seçimi yok.
2. **Kapsam:** Görev bazında — ebeveyn görev oluştururken seçer (`proofRequired`).
3. **Reddetme:** Geri gönder + kısa not → görev tekrar açılır, çocuk yeni foto çeker.
4. **Saklama:** Foto yalnızca onay/red sürecinde yaşar; onay anında (ya da reddedip
   yeni foto geldiğinde) cihazdan **silinir**. Foto birikmez (gizlilik).

## 3. Mevcut durum (kod tabanında zaten var olanlar)

Bu özelliğin iskeleti büyük ölçüde mevcut; delta küçük:

- `Task` tipinde `proofRequired: boolean` alanı **var** (`src/store/types.ts`).
- `TaskStatus = 'open' | 'submitted' | 'approved' | 'rejected'` **var**.
- **Ebeveyn UI'ı hazır:** `CreateTaskScreen.tsx`'te "Kanıt gerekli" `ToggleRow`'u
  ve `createTask(..., proofRequired, ...)` çağrısı **zaten mevcut** — bugün bu bayrak
  çocuk akışında hiçbir şey yapmıyor.
- `submitTask(taskId)`, `approveTask(taskId)`, `rejectTask(taskId)` context'te **var**.
- `rejectTask` görevi `status: 'open'`'a çekip çocuğa "tekrar denenebilir" bildirimi
  **zaten atıyor** — eksik olan tek şey **not**.
- `approveTask` → engine'deki saf `applyTaskApproval(s, taskId)`'i çağırıyor; tekrarlı
  görevde tekrar `open`, diğerinde `approved` yapıyor.

## 4. Veri modeli değişiklikleri

`src/store/types.ts` → `Task` arayüzüne **2 opsiyonel alan**:

```ts
export interface Task {
  // ...mevcut alanlar...
  proofPhotoUri?: string;   // kanıt fotoğrafının yerel dosya yolu (yalnızca onay beklerken dolu)
  rejectionNote?: string;   // ebeveynin geri gönderme notu (en son reddedişte)
}
```

`proofRequired`, statü makinesi vb. değişmez.

## 5. Mimari / katman ayrımı

Kritik kural: **engine saf kalır** (yan etkisiz, test edilebilir). Dosya sistemi
işlemleri (foto kopyalama/silme) **AppContext sarmalayıcı katmanında** yapılır.

| Katman | Sorumluluk |
|--------|-----------|
| `engine.ts` (saf) | Statü geçişleri, ödül transferi, `proofPhotoUri`/`rejectionNote` alanlarını state'te set/temizle. Dosya I/O **yapmaz**. |
| `AppContext.tsx` (sarmalayıcı) | Kamera çağrısı, dosyayı `documentDirectory`'ye kopyalama, eski fotoyu `deleteAsync` ile silme (fire-and-forget), sonra saf engine fonksiyonunu çağırma. |
| Ekranlar | İzin isteği UX'i, foto önizleme, not girişi. |

**Saf engine yardımcıları** (mevcut `applyTaskApproval` ile aynı desende eklenecek):
- `applyTaskSubmit(s, taskId, photoUri?)` → statü `submitted`, `proofPhotoUri` set, `rejectionNote` temizle.
- `applyTaskReject(s, taskId, note)` → statü `open`, `rejectionNote` set, `proofPhotoUri` temizle.
- `applyTaskApproval(s, taskId)` → mevcut davranış + `proofPhotoUri` temizle.

Bugün `submitTask`/`rejectTask` mantığı AppContext içinde gömülü; bu refaktör ile saf
kısımları engine'e taşınır, AppContext yalnızca dosya I/O + bildirim sarmalaması yapar.

## 6. Akış (state machine)

```
[open] --çocuk: foto çek & gönder--> [submitted] (proofPhotoUri dolu)
[submitted] --ebeveyn: onayla--> [approved]  (+ödül, foto SİLİNİR, uri temizlenir)
                                  veya tekrarlıysa [open] (foto SİLİNİR)
[submitted] --ebeveyn: geri gönder(not)--> [open] (rejectionNote dolu, foto SİLİNİR)
[open + rejectionNote] --çocuk: yeni foto çek & gönder--> [submitted] (rejectionNote temizlenir)
```

`proofRequired === false` olan görevlerde akış bugünkü gibi: foto adımı yok,
"Tamamladım" doğrudan `submitted` yapar.

## 7. Ekran değişiklikleri

### 7.1 CreateTaskScreen (ebeveyn) — değişiklik YOK / minimal
- "Kanıt gerekli" toggle zaten var. (Opsiyonel iyileştirme: alt yazıyı "fotoğraf"
  vurgusuyla netleştirmek — `sub="Çocuk bir fotoğraf çekip göndersin"`.)

### 7.2 ChildTasksScreen (çocuk)
- `open` görevde `proofRequired === true` ise buton: **"📷 Fotoğraf çek & gönder"**.
  - Basınca: kamera izni iste → `launchCameraAsync()` → çekilen dosyayı
    `documentDirectory/task-proofs/<taskId>.jpg`'e kopyala → `submitTask(id, uri)`.
  - İptal/izin yok ise: görev gönderilmez, kullanıcıya nazik uyarı.
- `proofRequired === false` ise bugünkü "Tamamladım" davranışı.
- `rejectionNote` dolu (yani reddedilip tekrar açılmış) görev "Yapılacaklar"da
  kırmızımsı bir not bandıyla görünür: *"Ailen: <not> — tekrar dene"*.
- "Onay bekleyenler"de küçük foto önizleme (thumbnail).

### 7.3 TasksScreen (ebeveyn onay)
- `submitted` görevde **foto thumbnail** + dokununca tam ekran görüntüleme.
- **Onayla** → `approveTask(taskId)` (ödül + foto sil).
- **Geri gönder** → kısa not girişi (Alert.prompt veya küçük modal) → `rejectTask(taskId, note)`.

## 8. Saklama, izin, bağımlılıklar

- **Bağımlılıklar:** `expo-image-picker` (kamera), `expo-file-system` (kopyala/sil).
  SDK 56 ile uyumlu sürümler; tam API + sürüm uygulama planında Context7 ile sabitlenecek.
- **İzin:** `app.json` → `ios.infoPlist.NSCameraUsageDescription` (TR açıklama metni).
  Android kamera izni Expo eklenti akışıyla. Runtime'da izin isteği picker üzerinden.
- **Saklama:** Foto baytları **AsyncStorage'a girmez**. Sadece URI string'i `Task`'ta
  persist edilir; mevcut JSON persistence küçük kalır.
- **Silme:** Onay/red/yeniden-gönderim anında AppContext eski `proofPhotoUri`'yi
  `deleteAsync(..., { idempotent: true })` ile siler (hata olsa da akışı bloklamaz).

## 9. Hata durumları

- **Kamera izni reddedildi:** Görev gönderilmez; "Fotoğraf için kamera izni gerekli"
  mesajı, ayarlara yönlendirme opsiyonu.
- **Çekim iptal:** Sessizce geri dön, statü değişmez.
- **Simülatörde kamera yok:** `launchCameraAsync` hata/iptal döner → yukarıdaki iptal
  yolu. (Bu özellik gerçek cihazda test edilir — bkz. §11.)
- **Dosya kopyalama/silme hatası:** Loglanır; silme hatası akışı bloklamaz (idempotent).

## 10. Test planı

Mevcut Jest + RTL harness'ında, **engine saf fonksiyonları** birim testlerle:
- `applyTaskSubmit`: statü `submitted`, `proofPhotoUri` set edilir, `rejectionNote` temizlenir.
- `applyTaskApproval`: onayda `proofPhotoUri` temizlenir (dosya silme niyeti AppContext'te;
  engine sadece alanı boşaltır), ödül transferi korunur, tekrarlı görev `open`'a döner.
- `applyTaskReject`: `rejectionNote` yazılır, statü `open`, `proofPhotoUri` temizlenir.
- Dosya I/O (`expo-file-system`, `expo-image-picker`) **mock'lanır**; gerçek kamera/dosya
  testte çağrılmaz.

## 11. Simülatör / cihaz notu

Kamera-only kararı gereği, foto akışı **gerçek telefonda Expo Go ile** test edilir;
iOS simülatöründe kamera çağrısı çalışmaz. Geri kalan mantık (statü, not, ödül)
simülatörde + birim testlerde doğrulanabilir.

## 12. Açıkça kapsam DIŞI (YAGNI)

- Birden fazla foto / galeri seçimi.
- Foto düzenleme, filtre, kırpma.
- Bulut yükleme / backend (uygulama yerel-only prototip).
- Onay sonrası "başarı albümü" (foto bilinçli olarak silinir).
- Video kanıt.
- Emoji "?" tofu render hatası — ayrı bir iş, bu spec'in parçası değil.
