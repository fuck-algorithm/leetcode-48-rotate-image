import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Language } from '../types';

interface AppDB extends DBSchema {
  settings: {
    key: string;
    value: {
      key: string;
      value: string | number;
      updatedAt: number;
    };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: unknown;
      expireAt: number;
    };
  };
}

let dbInstance: IDBPDatabase<AppDB> | null = null;

async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<AppDB>('leetcode-48-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    },
  });
  
  return dbInstance;
}

// 保存设置
export async function saveSetting(key: string, value: string | number): Promise<void> {
  const db = await getDB();
  await db.put('settings', {
    key,
    value,
    updatedAt: Date.now(),
  });
}

// 获取设置
export async function getSetting<T extends string | number>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    const result = await db.get('settings', key);
    return (result?.value as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

// 保存语言偏好
export async function saveLanguagePreference(language: Language): Promise<void> {
  await saveSetting('preferredLanguage', language);
}

// 获取语言偏好
export async function getLanguagePreference(): Promise<Language> {
  return getSetting<Language>('preferredLanguage', 'java');
}

// 保存播放速度
export async function savePlaybackSpeed(speed: number): Promise<void> {
  await saveSetting('playbackSpeed', speed);
}

// 获取播放速度
export async function getPlaybackSpeed(): Promise<number> {
  return getSetting<number>('playbackSpeed', 1);
}

// 缓存数据（带过期时间）
export async function cacheData(key: string, data: unknown, ttlMs: number): Promise<void> {
  const db = await getDB();
  await db.put('cache', {
    key,
    data,
    expireAt: Date.now() + ttlMs,
  });
}

// 获取缓存数据
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const result = await db.get('cache', key);
    
    if (!result) return null;
    
    if (Date.now() > result.expireAt) {
      await db.delete('cache', key);
      return null;
    }
    
    return result.data as T;
  } catch {
    return null;
  }
}

// GitHub Star 缓存（1小时）
const GITHUB_CACHE_KEY = 'github-stars';
const GITHUB_CACHE_TTL = 60 * 60 * 1000; // 1小时

export async function cacheGitHubStars(stars: number): Promise<void> {
  await cacheData(GITHUB_CACHE_KEY, stars, GITHUB_CACHE_TTL);
}

export async function getCachedGitHubStars(): Promise<number | null> {
  return getCachedData<number>(GITHUB_CACHE_KEY);
}
