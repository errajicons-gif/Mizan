// Local privacy-first persistence with optional Web Crypto AES-GCM encryption
// for sensitive health/lab records + Backup Export/Import + Complete Wipe.

const STORAGE_PREFIX = 'mizan_v1_';
const VAULT_KEY = `${STORAGE_PREFIX}health_vault_enc`;
const SALT_KEY = `${STORAGE_PREFIX}vault_salt`;

function getDeviceSecret(): string {
  let deviceKey = localStorage.getItem(`${STORAGE_PREFIX}device_secret`);
  if (!deviceKey) {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    deviceKey = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(`${STORAGE_PREFIX}device_secret`, deviceKey);
  }
  return deviceKey;
}

async function deriveAesKey(passphrase: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: 60000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function saveEncryptedHealthVault<T>(data: T): Promise<void> {
  try {
    if (!window.crypto?.subtle) {
      localStorage.setItem(VAULT_KEY, JSON.stringify({ plain: data }));
      return;
    }
    let saltB64 = localStorage.getItem(SALT_KEY);
    let salt: Uint8Array;
    if (!saltB64) {
      const saltBuf = new Uint8Array(new ArrayBuffer(16));
      crypto.getRandomValues(saltBuf);
      salt = saltBuf;
      saltB64 = toBase64(salt);
      localStorage.setItem(SALT_KEY, saltB64);
    } else {
      salt = fromBase64(saltB64);
    }

    const key = await deriveAesKey(getDeviceSecret(), salt);
    const iv = new Uint8Array(new ArrayBuffer(12));
    crypto.getRandomValues(iv);
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const cipherBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      encoded.buffer as ArrayBuffer
    );

    localStorage.setItem(
      VAULT_KEY,
      JSON.stringify({
        iv: toBase64(iv),
        ct: toBase64(new Uint8Array(cipherBuf)),
      })
    );
  } catch {
    localStorage.setItem(VAULT_KEY, JSON.stringify({ plain: data }));
  }
}

export async function loadEncryptedHealthVault<T>(fallback: T): Promise<T> {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { plain?: T; iv?: string; ct?: string };
    if (parsed.plain !== undefined) return parsed.plain;
    if (!parsed.iv || !parsed.ct || !window.crypto?.subtle) return fallback;

    const saltB64 = localStorage.getItem(SALT_KEY);
    if (!saltB64) return fallback;
    const key = await deriveAesKey(getDeviceSecret(), fromBase64(saltB64));
    const iv = fromBase64(parsed.iv);
    const ct = fromBase64(parsed.ct);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ct.buffer as ArrayBuffer
    );
    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function loadLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocalJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }
}

export function clearAllMizanData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
