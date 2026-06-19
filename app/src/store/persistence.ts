// Kalıcılık katmanı: blob içinde şema versiyonu + yükleme sırasında doğrula-ya-da-tohumla.
// Amaç: şema kayması/bozuk veri sessizce typed state'e yüklenip uygulamayı çökertmesin.
import { AppState } from './types';
import { buildSeed } from './seed';

export const STORAGE_KEY = 'minikart_state_v2';
export const SESSION_KEY = 'minikart_session_v2';
export const STATE_VERSION = 3; // v3: para tamsayı kuruş (v2 TL blob'ları otomatik tohuma düşer)

const REQUIRED_ARRAYS: (keyof AppState)[] = [
  'parents', 'children', 'wallets', 'cards', 'transactions', 'allowanceSchedules',
  'tasks', 'savingsGoals', 'moneyRequests', 'notifications', 'auditLogs',
];

export function isValidAppState(x: any): x is AppState {
  if (!x || typeof x !== 'object') return false;
  if (!('family' in x)) return false; // family null olabilir ama anahtar bulunmalı
  return REQUIRED_ARRAYS.every((k) => Array.isArray((x as any)[k]));
}

export function serializeState(state: AppState): string {
  return JSON.stringify({ __v: STATE_VERSION, ...state });
}

// Geçersiz/eski/bozuk her durumda güvenli bir tohum state döndürür (asla throw etmez).
export function deserializeState(raw: string | null): AppState {
  if (!raw) return buildSeed();
  try {
    const parsed = JSON.parse(raw);
    const { __v, ...rest } = parsed ?? {};
    if (__v === STATE_VERSION && isValidAppState(rest)) return rest as AppState;
    return buildSeed();
  } catch {
    return buildSeed();
  }
}
