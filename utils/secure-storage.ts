import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { StorageKey } from '@/constants/storage-keys';

const memory = new Map<string, string>();

function readWebValue(key: string): string | null {
  try {
    const stored = globalThis.localStorage?.getItem(key);
    if (stored != null) {
      memory.set(key, stored);
      return stored;
    }
  } catch {
    // Fall through to in-memory cache.
  }

  return memory.get(key) ?? null;
}

function writeWebValue(key: string, value: string) {
  memory.set(key, value);

  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Memory cache still keeps the value for this page lifetime.
  }
}

function removeWebValue(key: string) {
  memory.delete(key);

  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Missing keys are already gone.
  }
}

async function canUseSecureStore() {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function readStoredValue(key: StorageKey): Promise<string | null> {
  if (!(await canUseSecureStore())) {
    return readWebValue(key);
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writeStoredValue(key: StorageKey, value: string): Promise<void> {
  if (!(await canUseSecureStore())) {
    writeWebValue(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function removeStoredValue(key: StorageKey): Promise<void> {
  if (!(await canUseSecureStore())) {
    removeWebValue(key);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Missing keys are already gone.
  }
}
