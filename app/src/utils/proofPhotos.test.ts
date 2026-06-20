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
