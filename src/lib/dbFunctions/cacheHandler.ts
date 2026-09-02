import Redis from "ioredis";
import { REDIS_URL } from "$env/static/private";

if (!REDIS_URL) throw new Error('REDIS_URL not set in environment');
const redis = new Redis(REDIS_URL!);

export async function getCachedData(cacheKey: string): Promise<any | null> {
  if (!redis) return null;
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
}


export async function setCachedData(cacheKey: string, data: any, ttlSeconds?: number): Promise<void> {
  if (!redis) return;
  const isEmpty = data === null || data === undefined || data === '' || (typeof data === 'object' && Object.keys(data).length === 0);
  if (isEmpty) return;


  ttlSeconds ? await redis.set(cacheKey, JSON.stringify(data), 'EX', ttlSeconds) : await redis.set(cacheKey, JSON.stringify(data));
}


export async function deleteCachedData(cacheKeys: string | string[]): Promise<void> {
  if (!redis) return;
  const keys = Array.isArray(cacheKeys) ? cacheKeys : [cacheKeys];
  if (keys.length > 0) await redis.del(...keys);
}