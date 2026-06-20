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
