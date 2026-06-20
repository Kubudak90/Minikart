# Görev Fotoğraf Kanıtı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Çocuk, ebeveynin "kanıt gerekli" işaretlediği görevleri kamerayla çektiği bir fotoğrafla tamamlasın; ebeveyn fotoğrafı görüp onaylasın veya notla geri göndersin.

**Architecture:** Saf engine yardımcıları statü/alan geçişlerini yönetir (test edilebilir); kamera + dosya sistemi yan etkileri ayrı bir util'de (`proofPhotos.ts`) toplanır; AppContext bunları sarmalar (engine fonksiyonu + dosya silme + bildirim). Fotoğraf baytları AsyncStorage'a girmez — sadece yerel dosya URI'si persist edilir, onay/red anında dosya silinir.

**Tech Stack:** Expo SDK ~56, React Native 0.85, TypeScript, `expo-image-picker` (kamera), `expo-file-system` (yeni `File`/`Directory`/`Paths` sınıf API'si), Jest + jest-expo + RTL.

## Global Constraints

- Tüm para alanları tamsayı **kuruş** (örn. 18550 = 185,50 TL). Bu özellik ödül transferini değiştirmez; mevcut `applyTaskApproval`/`applyTransfer` kullanılır.
- **Engine saf kalır** (`src/store/engine.ts`): React/yan etki yok. Dosya/kamera I/O yalnızca `src/utils/proofPhotos.ts` ve `src/store/AppContext.tsx`'te.
- **Fotoğraf AsyncStorage'a girmez.** Sadece `Task.proofPhotoUri` (string) persist edilir.
- **Kamera-only:** galeri seçimi yok. iOS **simülatöründe kamera çalışmaz** → kamera akışı gerçek cihazda (Expo Go) doğrulanır; geri kalan mantık birim testlerde.
- UI metinleri **Türkçe**; mevcut tasarım sistemi bileşenleri (`src/components/ui.tsx`) ve Lucide `Icon` kullanılır (ham emoji buton/etiketlerden kaçın — özel font emoji'yi "?" render ediyor).
- Test dosyaları `*.test.ts(x)`, preset `jest-expo` (bkz. `jest.config.js`).
- Çalışma dizini komutlar için: `/Users/huseyinarslan/Desktop/Minikart/app`. `npx` yerine yerel binary kullan (`./node_modules/.bin/...`) — ortamda `npx` `npm`'e yeniden yazılabiliyor.
- Dal: `feat/task-photo-proof` (zaten açık, spec orada commit'li).

---

### Task 1: Bağımlılıklar + kamera izni konfigürasyonu

**Files:**
- Modify: `app/package.json` (expo install ile otomatik)
- Modify: `app/app.json`

**Interfaces:**
- Consumes: yok
- Produces: `expo-image-picker`, `expo-file-system` paketleri kurulu; iOS `NSCameraUsageDescription` + image-picker plugin konfigürasyonu.

- [ ] **Step 1: Paketleri kur**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/expo install expo-image-picker expo-file-system
```
Expected: Her iki paket `package.json` `dependencies`'e SDK ile uyumlu sürümlerle eklenir.

- [ ] **Step 2: Kurulumu doğrula**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && grep -E "expo-image-picker|expo-file-system" package.json
```
Expected: İki satır da görünür.

- [ ] **Step 3: `app.json`'a izin + plugin ekle**

`app/app.json`'da `ios` bloğuna `infoPlist` ekle ve `plugins` dizisini genişlet. Dosyanın tamamı şu hale gelir:

```json
{
  "expo": {
    "name": "MiniKart Aile",
    "slug": "minikart-aile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "minikart",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "backgroundColor": "#FBF7F0"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.minikart.aile",
      "infoPlist": {
        "NSCameraUsageDescription": "MiniKart, görev kanıtı fotoğrafı çekebilmen için kameranı kullanır."
      }
    },
    "android": {
      "package": "com.minikart.aile",
      "adaptiveIcon": {
        "backgroundColor": "#E7EFFE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-font",
      [
        "expo-image-picker",
        {
          "cameraPermission": "MiniKart, görev kanıtı fotoğrafı çekebilmen için kameranı kullanır."
        }
      ]
    ]
  }
}
```

> Not: Expo Go SDK 56'da kamera izni Expo Go'nun kendi Info.plist'inden gelir → kanıt akışını Expo Go'da test etmek için yeniden derleme gerekmez. Bu konfigürasyon ileride bağımsız/dev-client build içindir.

- [ ] **Step 4: Tip kontrolü**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/tsc --noEmit
```
Expected: Hata yok (henüz kod değişmedi).

- [ ] **Step 5: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/package.json app/package-lock.json app/app.json && git commit -m "feat(deps): add expo-image-picker + expo-file-system, camera permission config"
```

---

### Task 2: Task model alanları + saf engine yardımcıları (TDD)

**Files:**
- Modify: `app/src/store/types.ts` (`Task` arayüzü)
- Modify: `app/src/store/engine.ts` (`applyTaskSubmit`, `applyTaskReject` ekle; `applyTaskApproval` güncelle)
- Test: `app/src/store/engine.test.ts`

**Interfaces:**
- Consumes: `AppState`, `Task`, `TransferResult`, mevcut `applyTransfer`.
- Produces:
  - `Task.proofPhotoUri?: string`, `Task.rejectionNote?: string`
  - `applyTaskSubmit(s: AppState, taskId: string, photoUri?: string): AppState`
  - `applyTaskReject(s: AppState, taskId: string, note?: string): AppState`
  - `applyTaskApproval(s: AppState, taskId: string): TransferResult` (mevcut; artık `proofPhotoUri` temizler)

- [ ] **Step 1: `Task` arayüzüne 2 alan ekle**

`app/src/store/types.ts`, `Task` arayüzünde `proofRequired: boolean;` satırından sonra:

```ts
  proofRequired: boolean;
  proofPhotoUri?: string; // kanıt fotoğrafının yerel dosya yolu (yalnızca onay beklerken dolu)
  rejectionNote?: string; // ebeveynin en son geri gönderme notu
```

- [ ] **Step 2: Başarısız testleri yaz**

`app/src/store/engine.test.ts` dosyasının sonuna ekle (import satırını da güncelle: `applyTaskApproval`'ın yanına `applyTaskSubmit, applyTaskReject` ekle):

```ts
// engine.test.ts en üstteki import'u şu hale getir:
// import { evaluateSpend, applyTransfer, applyGoalContribution, applyTaskApproval, applyTaskSubmit, applyTaskReject } from './engine';
import { Task } from './types';

function withTask(overrides: Partial<Task> = {}): AppState {
  const s = buildSeed();
  const task: Task = {
    id: 'tsk_test', childId: ELIF, createdByParentId: 'par_x', title: 'Odanı topla',
    description: '', rewardAmount: TL(10), recurrence: 'once', proofRequired: true,
    status: 'open', createdAt: '2026-06-19T10:00:00.000Z', ...overrides,
  };
  // ödül testleri için aile cüzdanını bolca fonla
  const wallets = s.wallets.map((w) => (w.ownerType === 'family' ? { ...w, balance: TL(1000) } : w));
  return { ...s, wallets, tasks: [task] };
}

describe('görev kanıtı — saf engine geçişleri', () => {
  test('applyTaskSubmit: submitted yapar, foto URI set eder, eski notu temizler', () => {
    const s = withTask({ rejectionNote: 'eski not' });
    const t = applyTaskSubmit(s, 'tsk_test', 'file:///proof.jpg').tasks[0];
    expect(t.status).toBe('submitted');
    expect(t.proofPhotoUri).toBe('file:///proof.jpg');
    expect(t.rejectionNote).toBeUndefined();
  });

  test('applyTaskReject: open yapar, notu yazar, fotoyu temizler', () => {
    const s = withTask({ status: 'submitted', proofPhotoUri: 'file:///proof.jpg' });
    const t = applyTaskReject(s, 'tsk_test', 'yatağı da topla').tasks[0];
    expect(t.status).toBe('open');
    expect(t.rejectionNote).toBe('yatağı da topla');
    expect(t.proofPhotoUri).toBeUndefined();
  });

  test('applyTaskApproval: ödül öder, approved yapar, fotoyu temizler', () => {
    const s = withTask({ status: 'submitted', proofPhotoUri: 'file:///proof.jpg' });
    const before = childBal(s, ELIF);
    const r = applyTaskApproval(s, 'tsk_test');
    expect(r.ok).toBe(true);
    expect(r.state.tasks[0].status).toBe('approved');
    expect(r.state.tasks[0].proofPhotoUri).toBeUndefined();
    expect(childBal(r.state, ELIF)).toBe(before + TL(10));
  });

  test('applyTaskApproval: tekrarlı görev tekrar open olur, foto temizlenir', () => {
    const s = withTask({ status: 'submitted', recurrence: 'repeating', proofPhotoUri: 'file:///p.jpg' });
    const r = applyTaskApproval(s, 'tsk_test');
    expect(r.state.tasks[0].status).toBe('open');
    expect(r.state.tasks[0].proofPhotoUri).toBeUndefined();
  });
});
```

- [ ] **Step 3: Testlerin başarısız olduğunu doğrula**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest src/store/engine.test.ts -t "görev kanıtı"
```
Expected: FAIL — `applyTaskSubmit`/`applyTaskReject` export edilmemiş.

- [ ] **Step 4: Engine'i güncelle**

`app/src/store/engine.ts`'te `applyTaskApproval` fonksiyonunun map satırını şu hale getir (statünün yanına `proofPhotoUri: undefined` ekle):

```ts
  const tasks = res.state.tasks.map((x) =>
    x.id === taskId
      ? { ...x, status: (x.recurrence === 'repeating' ? 'open' : 'approved') as Task['status'], proofPhotoUri: undefined }
      : x,
  );
```

Aynı dosyada, `applyTaskApproval` fonksiyonundan hemen sonra iki saf yardımcı ekle:

```ts
// ---- görev gönderimi (kanıt fotoğrafı opsiyonel) ----
export function applyTaskSubmit(s: AppState, taskId: string, photoUri?: string): AppState {
  if (!s.tasks.some((x) => x.id === taskId)) return s;
  return {
    ...s,
    tasks: s.tasks.map((x) =>
      x.id === taskId ? { ...x, status: 'submitted', proofPhotoUri: photoUri, rejectionNote: undefined } : x,
    ),
  };
}

// ---- görev reddi (görevi tekrar açar, not bırakır) ----
export function applyTaskReject(s: AppState, taskId: string, note?: string): AppState {
  if (!s.tasks.some((x) => x.id === taskId)) return s;
  return {
    ...s,
    tasks: s.tasks.map((x) =>
      x.id === taskId ? { ...x, status: 'open', rejectionNote: note, proofPhotoUri: undefined } : x,
    ),
  };
}
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest src/store/engine.test.ts
```
Expected: PASS (yeni 4 test + mevcut testler).

- [ ] **Step 6: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/src/store/types.ts app/src/store/engine.ts app/src/store/engine.test.ts && git commit -m "feat(store): proof fields on Task + pure applyTaskSubmit/applyTaskReject, clear photo on approval"
```

---

### Task 3: Kanıt fotoğrafı util'i (kamera + dosya) + mock'lu test

**Files:**
- Create: `app/src/utils/proofPhotos.ts`
- Test: `app/src/utils/proofPhotos.test.ts`

**Interfaces:**
- Consumes: `expo-image-picker`, `expo-file-system` (`File`, `Directory`, `Paths`)
- Produces:
  - `type CaptureResult = { uri: string } | { error: 'denied' | 'cancelled' }`
  - `captureProofPhoto(taskId: string): Promise<CaptureResult>`
  - `deleteProofPhoto(uri?: string): void`

- [ ] **Step 1: Başarısız testleri yaz**

Create `app/src/utils/proofPhotos.test.ts`:

```ts
import { captureProofPhoto, deleteProofPhoto } from './proofPhotos';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Directory: jest.fn(),
  Paths: { document: {} },
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('proofPhotos', () => {
  beforeEach(() => jest.clearAllMocks());

  test('kamera izni reddedilince {error:"denied"} döner, kamera açılmaz', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as any);
    const r = await captureProofPhoto('tsk_1');
    expect(r).toEqual({ error: 'denied' });
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  test('çekim iptal edilince {error:"cancelled"} döner', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as any);
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as any);
    const r = await captureProofPhoto('tsk_1');
    expect(r).toEqual({ error: 'cancelled' });
  });

  test('deleteProofPhoto(undefined) güvenli no-op (hata fırlatmaz)', () => {
    expect(() => deleteProofPhoto(undefined)).not.toThrow();
  });
});
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest src/utils/proofPhotos.test.ts
```
Expected: FAIL — `./proofPhotos` modülü yok.

- [ ] **Step 3: Util'i yaz**

Create `app/src/utils/proofPhotos.ts`:

```ts
// MiniKart Aile - Görev kanıtı fotoğrafı: kamera çekimi + yerel dosya saklama.
// Yan etkili modül (kamera + dosya sistemi). Engine saf kalsın diye ayrı tutulur.
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';

const PROOF_DIR = new Directory(Paths.document, 'task-proofs');

export type CaptureResult = { uri: string } | { error: 'denied' | 'cancelled' };

// Kamera izni iste → kamerayı aç → çekilen fotoğrafı kalıcı klasöre kopyala → URI döndür.
export async function captureProofPhoto(taskId: string): Promise<CaptureResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { error: 'denied' };
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5 });
  if (res.canceled || !res.assets?.length) return { error: 'cancelled' };
  const uri = await saveProofPhoto(taskId, res.assets[0].uri);
  return { uri };
}

// Çekilen geçici dosyayı document/task-proofs/<taskId>.jpg'e kopyala.
async function saveProofPhoto(taskId: string, sourceUri: string): Promise<string> {
  if (!PROOF_DIR.exists) PROOF_DIR.create();
  const dest = new File(PROOF_DIR, `${taskId}.jpg`);
  if (dest.exists) dest.delete();
  await new File(sourceUri).copy(dest);
  return dest.uri;
}

// Fotoğrafı cihazdan sil — en iyi çaba, idempotent. URI yoksa no-op.
// AppContext bunu setState updater'ı içinde çağırabilir; idempotent olduğu için
// (StrictMode'da çift çalışsa bile) güvenlidir.
export function deleteProofPhoto(uri?: string): void {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // silme hatası akışı bloklamamalı
  }
}
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest src/utils/proofPhotos.test.ts
```
Expected: PASS (3 test).

> Not: Mutlu yol (gerçek dosya kopyalama) SDK sınıflarının ince sarmalı olduğu için birim testten çıkarıldı; gerçek cihazda Task 7'de doğrulanır.

- [ ] **Step 5: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/src/utils/proofPhotos.ts app/src/utils/proofPhotos.test.ts && git commit -m "feat(utils): proofPhotos — camera capture + document-dir save/delete"
```

---

### Task 4: AppContext bağlama (imzalar + sarmalayıcılar)

**Files:**
- Modify: `app/src/store/AppContext.tsx`

**Interfaces:**
- Consumes: `applyTaskSubmit`, `applyTaskReject`, `applyTaskApproval` (engine); `deleteProofPhoto` (proofPhotos); mevcut `newNotif`, `setState`.
- Produces:
  - `submitTask: (taskId: string, photoUri?: string) => void`
  - `rejectTask: (taskId: string, note?: string) => void`
  - `approveTask: (taskId: string) => void` (artık fotoğrafı siler)

- [ ] **Step 1: Import'ları güncelle**

`app/src/store/AppContext.tsx` satır 12'deki engine import'una `applyTaskSubmit, applyTaskReject` ekle:

```ts
import { applyTransfer, applyGoalContribution, applyTaskApproval, applyTaskSubmit, applyTaskReject, evaluateSpend, SpendResult } from './engine';
```

Satır 15'ten sonra yeni import ekle:

```ts
import { deleteProofPhoto } from '../utils/proofPhotos';
```

- [ ] **Step 2: Ctx imzalarını güncelle**

Satır 73 ve 75'i şu hale getir:

```ts
  submitTask: (taskId: string, photoUri?: string) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string, note?: string) => void;
```

- [ ] **Step 3: `submitTask` const'unu değiştir**

Mevcut `submitTask` const'unu (satır ~329-338) şununla değiştir:

```ts
  const submitTask = (taskId: string, photoUri?: string) =>
    setState((s) => {
      const t = s.tasks.find((x) => x.id === taskId);
      if (!t) return s;
      const next = applyTaskSubmit(s, taskId, photoUri);
      return {
        ...next,
        notifications: [newNotif({ scope: 'parent', type: 'task', title: 'Görev tamamlandı', body: `Görev "${t.title}" onayını bekliyor.` }), ...next.notifications],
      };
    });
```

- [ ] **Step 4: `approveTask` const'unu değiştir (fotoğrafı sil)**

Mevcut `approveTask` const'unu (satır ~340-341) şununla değiştir:

```ts
  // Aile bakiyesi yetersizse görev 'submitted' kalır (kilitlenmez, ödül kaybolmaz).
  const approveTask = (taskId: string) =>
    setState((s) => {
      deleteProofPhoto(s.tasks.find((x) => x.id === taskId)?.proofPhotoUri);
      return applyTaskApproval(s, taskId).state;
    });
```

- [ ] **Step 5: `rejectTask` const'unu değiştir (not + fotoğrafı sil)**

Mevcut `rejectTask` const'unu (satır ~342-350) şununla değiştir:

```ts
  const rejectTask = (taskId: string, note?: string) =>
    setState((s) => {
      const t = s.tasks.find((x) => x.id === taskId);
      if (!t) return s;
      deleteProofPhoto(t.proofPhotoUri);
      const next = applyTaskReject(s, taskId, note);
      return {
        ...next,
        notifications: [newNotif({ scope: 'child', childId: t.childId, type: 'task', title: 'Görev tekrar denenebilir', body: note ? `Ailen: "${note}" — tekrar deneyebilirsin.` : `"${t.title}" görevini tekrar tamamlayabilirsin.` }), ...next.notifications],
      };
    });
```

> `submitTask, approveTask, rejectTask` provider value nesnesinde (satır ~456) zaten isimle listeleniyor — ek değişiklik gerekmez.

- [ ] **Step 6: Tip kontrolü**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/tsc --noEmit
```
Expected: Hata yok.

- [ ] **Step 7: Tüm testleri çalıştır (regresyon yok)**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest
```
Expected: Tüm testler PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/src/store/AppContext.tsx && git commit -m "feat(store): wire photo proof — submit(uri), reject(note), approve deletes photo"
```

---

### Task 5: Çocuk ekranı — kamera akışı + reddetme bandı + thumbnail

**Files:**
- Modify: `app/src/components/Icon.tsx` (`camera` ikonu ekle)
- Modify: `app/src/screens/child/ChildTasksScreen.tsx`

**Interfaces:**
- Consumes: `submitTask(id, uri?)`, `captureProofPhoto`, `Task`, `Icon` (`camera`).
- Produces: kullanıcıya görünür kamera akışı.

- [ ] **Step 1: `Icon` haritasına `camera` ekle**

`app/src/components/Icon.tsx` satır 4-13 import listesine `Camera` ekle (örn. `Clock,` sonrası):

```ts
  TrendingUp, Clock, Camera,
} from 'lucide-react-native';
```

`MAP` nesnesine (satır 28 civarı, `clock: Clock,` yanına) ekle:

```ts
  'check-circle': CircleCheck, 'alert-circle': CircleAlert, trending: TrendingUp, clock: Clock, camera: Camera,
```

- [ ] **Step 2: `ChildTasksScreen`'i güncelle**

`app/src/screens/child/ChildTasksScreen.tsx`'i tümüyle şununla değiştir:

```tsx
import React from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Pill, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { useCelebrate } from '../../components/Celebrate';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';
import { captureProofPhoto } from '../../utils/proofPhotos';
import { Task } from '../../store/types';

export function ChildTasksScreen() {
  const { currentChild, childTasks, submitTask } = useApp();
  const celebrate = useCelebrate();
  const child = currentChild();

  const finishCelebrate = (title: string) =>
    celebrate({ title: 'Harika! 🎉', sub: `"${title}" görevini tamamladın. Ailen onaylayınca ödülün gelecek.`, image: require('../../../assets/illustrations/task-reward.png') });

  const onComplete = async (t: Task) => {
    if (t.proofRequired) {
      const r = await captureProofPhoto(t.id);
      if ('error' in r) {
        if (r.error === 'denied') {
          Alert.alert('Kamera izni gerekli', 'Bu görevi tamamlamak için bir fotoğraf çekmelisin. Ayarlardan kamera iznini açabilirsin.');
        }
        return; // iptal → sessizce çık
      }
      submitTask(t.id, r.uri);
    } else {
      submitTask(t.id);
    }
    finishCelebrate(t.title);
  };

  const tasks = child ? childTasks(child.id) : [];
  const open = tasks.filter((t) => t.status === 'open');
  const waiting = tasks.filter((t) => t.status === 'submitted');
  const done = tasks.filter((t) => t.status === 'approved');

  return (
    <Screen bg={colors.bgChild}>
      <Card style={{ backgroundColor: colors.purpleSoft }}>
        <Text style={{ fontWeight: '700', color: colors.purple, fontSize: font.h3 }}>Görevleri tamamla, ödülü kap! 🏅</Text>
        <Muted>Bir görevi bitirince "Tamamladım" de. Ailen onaylayınca paran gelir.</Muted>
      </Card>

      <H2>Yapılacaklar</H2>
      {open.length === 0 && <Empty icon="✅" title="Tüm görevler bitti!" sub="Şu an yapılacak görev yok." />}
      {open.map((t) => (
        <Card key={t.id} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{t.title}</Text>
              {t.description ? <Muted>{t.description}</Muted> : null}
            </View>
            <Pill text={`+${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
          </View>
          {t.rejectionNote ? (
            <View style={{ backgroundColor: colors.redSoft, borderRadius: 10, padding: 10, gap: 2 }}>
              <Text style={{ color: colors.red, fontSize: font.small, fontWeight: '700' }}>Tekrar dene</Text>
              <Text style={{ color: colors.text, fontSize: font.small }}>Ailen: {t.rejectionNote}</Text>
            </View>
          ) : null}
          {t.proofRequired ? (
            <Btn title="Fotoğraf çek & gönder" icon="camera" small kind="success" onPress={() => onComplete(t)} />
          ) : (
            <Btn title="Tamamladım" icon="check" small kind="success" onPress={() => onComplete(t)} />
          )}
        </Card>
      ))}

      {waiting.length > 0 && (
        <>
          <H2>Onay bekleyenler</H2>
          {waiting.map((t) => (
            <Card key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
              {t.proofPhotoUri ? <Image source={{ uri: t.proofPhotoUri }} style={{ width: 44, height: 44, borderRadius: 8 }} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{t.title}</Text>
                <Muted>Ailen onayını bekliyor…</Muted>
              </View>
              <Pill text="⏳ Beklemede" color={colors.amber} bg={colors.amberSoft} />
            </Card>
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <H2>Tamamlananlar</H2>
          {done.map((t) => (
            <Card key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{t.title}</Text>
              <Pill text={`✓ +${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
```

- [ ] **Step 3: Tip kontrolü**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/tsc --noEmit
```
Expected: Hata yok.

- [ ] **Step 4: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/src/components/Icon.tsx app/src/screens/child/ChildTasksScreen.tsx && git commit -m "feat(child): camera proof flow, rejection note banner, pending photo thumbnail"
```

---

### Task 6: Ebeveyn onay ekranı — thumbnail + tam ekran + notla reddet (+ CreateTask metni)

**Files:**
- Modify: `app/src/screens/parent/TasksScreen.tsx`
- Modify: `app/src/screens/parent/CreateTaskScreen.tsx`

**Interfaces:**
- Consumes: `approveTask(id)`, `rejectTask(id, note?)`, `childTasks`, `Field`, `Btn` (`camera`/`repeat` ikonları), `Image`, `Modal`.
- Produces: ebeveynin fotoğrafı görüp onaylama/notla reddetme akışı.

- [ ] **Step 1: `TasksScreen`'i güncelle**

`app/src/screens/parent/TasksScreen.tsx`'i tümüyle şununla değiştir:

```tsx
import React, { useState } from 'react';
import { View, Text, Image, Modal, Pressable } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Pill, Empty, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Task } from '../../store/types';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';
import { ParentScreenProps } from '../../navigation/types';

const STATUS_META: Record<Task['status'], { label: string; color: string; bg: string }> = {
  open: { label: 'Açık', color: colors.primary, bg: colors.primarySoft },
  submitted: { label: 'Onay bekliyor', color: colors.amber, bg: colors.amberSoft },
  approved: { label: '✓ Onaylandı', color: colors.green, bg: colors.greenSoft },
  rejected: { label: 'Reddedildi', color: colors.red, bg: colors.redSoft },
};

export function TasksScreen({ route, navigation }: ParentScreenProps<'Tasks'>) {
  const { childId } = route.params;
  const { childTasks, approveTask, rejectTask } = useApp();
  const tasks = childTasks(childId);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [viewUri, setViewUri] = useState<string | null>(null);

  const cancelReject = () => { setRejectingId(null); setNote(''); };
  const confirmReject = (id: string) => { rejectTask(id, note.trim() || undefined); cancelReject(); };

  return (
    <Screen>
      <Btn title="Yeni görev oluştur" icon="plus" onPress={() => navigation.navigate('CreateTask', { childId })} />
      {tasks.length === 0 && <Empty icon="📋" title="Görev yok" sub="Çocuğun için ödüllü görev oluştur." />}
      {tasks.map((t) => {
        const m = STATUS_META[t.status];
        return (
          <Card key={t.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{t.title}</Text>
                {t.description ? <Muted>{t.description}</Muted> : null}
              </View>
              <Pill text={m.label} color={m.color} bg={m.bg} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pill text={`+${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
              <Muted>{t.recurrence === 'repeating' ? 'Tekrarlı' : 'Tek seferlik'}{t.proofRequired ? ' • Kanıt gerekli' : ''}</Muted>
            </View>

            {t.status === 'submitted' && (
              <>
                {t.proofPhotoUri ? (
                  <Pressable onPress={() => setViewUri(t.proofPhotoUri!)}>
                    <Image source={{ uri: t.proofPhotoUri }} style={{ width: '100%', height: 170, borderRadius: 12 }} resizeMode="cover" />
                  </Pressable>
                ) : null}

                {rejectingId === t.id ? (
                  <View style={{ gap: spacing.sm }}>
                    <Field label="Geri gönderme notu" value={note} onChangeText={setNote} placeholder="Örn. yatağı da topla" multiline />
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <Btn title="Geri gönder" small kind="danger" style={{ flex: 1 }} onPress={() => confirmReject(t.id)} />
                      <Btn title="Vazgeç" small kind="ghost" onPress={cancelReject} />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Btn title={`Onayla (${money(t.rewardAmount)})`} icon="check" small kind="success" style={{ flex: 1 }} onPress={() => approveTask(t.id)} />
                    <Btn title="Reddet" small kind="ghost" onPress={() => setRejectingId(t.id)} />
                  </View>
                )}
              </>
            )}
          </Card>
        );
      })}

      <Modal visible={!!viewUri} transparent animationType="fade" onRequestClose={() => setViewUri(null)}>
        <Pressable onPress={() => setViewUri(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          {viewUri ? <Image source={{ uri: viewUri }} style={{ width: '100%', height: '70%', borderRadius: 16 }} resizeMode="contain" /> : null}
          <Text style={{ color: '#fff', marginTop: 16, fontSize: font.body }}>Kapatmak için dokun</Text>
        </Pressable>
      </Modal>
    </Screen>
  );
}
```

- [ ] **Step 2: `CreateTaskScreen` toggle metnini netleştir + ikonları düzelt**

`app/src/screens/parent/CreateTaskScreen.tsx` satır 37-38'i şununla değiştir (emoji yerine Lucide ikon; "?" render sorunundan kaçınır):

```tsx
        <ToggleRow icon="repeat" label="Tekrarlı görev" sub="Onaylandıkça yeniden açılır" value={repeating} onValueChange={setRepeating} />
        <ToggleRow icon="camera" label="Fotoğraf kanıtı iste" sub="Çocuk görevi bitince kamerayla bir fotoğraf çeksin" value={proof} onValueChange={setProof} />
```

- [ ] **Step 3: Tip kontrolü**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/tsc --noEmit
```
Expected: Hata yok.

- [ ] **Step 4: Commit**

```bash
cd /Users/huseyinarslan/Desktop/Minikart && git add app/src/screens/parent/TasksScreen.tsx app/src/screens/parent/CreateTaskScreen.tsx && git commit -m "feat(parent): proof photo thumbnail + fullscreen view + reject-with-note"
```

---

### Task 7: Tam doğrulama (suite + gerçek cihaz)

**Files:** yok (doğrulama)

**Interfaces:**
- Consumes: tüm önceki task'lar.
- Produces: yeşil suite + cihazda doğrulanmış akış.

- [ ] **Step 1: Tüm testler + tip kontrolü**

Run:
```bash
cd /Users/huseyinarslan/Desktop/Minikart/app && ./node_modules/.bin/jest && ./node_modules/.bin/tsc --noEmit
```
Expected: Tüm testler PASS, tip hatası yok.

- [ ] **Step 2: Gerçek cihazda manuel doğrulama (kamera-only → simülatörde yapılamaz)**

Telefonda Expo Go ile uygulamayı aç (`./node_modules/.bin/expo start`, QR ile). Kontrol listesi:
- Ebeveyn: "Fotoğraf kanıtı iste" açık bir görev oluştur.
- Çocuk: görevde "Fotoğraf çek & gönder" → kamera açılır → çek → görev "Onay bekleyenler"e geçer, thumbnail görünür.
- Ebeveyn: onay ekranında fotoğrafı gör → dokun → tam ekran açılır.
- Ebeveyn: "Reddet" → not yaz → "Geri gönder" → görev çocukta notla tekrar açılır.
- Çocuk: yeni foto çek & gönder → ebeveyn "Onayla" → ödül bakiyeye yansır, foto kaybolur.
- İzni reddet senaryosu: görev gönderilmez, uyarı çıkar.

- [ ] **Step 3: (Gerekirse) düzeltme commit'i**

Cihazda bir sorun çıkarsa düzelt, ilgili task'ın test/typecheck adımlarını tekrar çalıştır, commit et.

---

## Self-Review

**Spec coverage:** §4 model→T2 · §5 engine/AppContext ayrımı→T2+T4 · §6 akış→T2/T4/T5/T6 · §7.1 CreateTask→T6 · §7.2 çocuk→T5 · §7.3 ebeveyn→T6 · §8 deps/izin/saklama→T1+T3 · §9 hata durumları→T3+T5 · §10 testler→T2+T3 · §11 cihaz→T7 · §12 kapsam dışı→korundu. Boşluk yok.

**Placeholder scan:** Tüm adımlarda gerçek kod/komut var. TODO/TBD yok.

**Type consistency:** `applyTaskSubmit`/`applyTaskReject` (T2 tanım = T4 kullanım), `captureProofPhoto`/`deleteProofPhoto` + `CaptureResult` (`{uri}|{error:'denied'|'cancelled'}`) (T3 tanım = T4/T5 kullanım), `Task.proofPhotoUri`/`rejectionNote` (T2 tanım = T4/T5/T6 kullanım), `Icon` `camera`/`repeat` (T5 ekleme = T5/T6 kullanım) tutarlı.
