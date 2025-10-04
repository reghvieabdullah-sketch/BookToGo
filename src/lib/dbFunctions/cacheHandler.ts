// export async function invalidateCacheAndUpdate(
//   key: string,
//   redis: any,
//   venueID: string,
//   newCacheData?: any,
//   ttlSeconds?: number
// ) {


//   // kinda hacky, since it uses the first value of dependentKeys as the new cache key
//   // but it works for now
//   if (!redis || !venueID) return;
//   const dependentKeys = getDependentKeys(key, venueID);
//   if (dependentKeys.length > 0) await redis.del(...dependentKeys);

//   // Optionally set new cache
//   if (newCacheData !== undefined) {
//     if (ttlSeconds) {
//       await redis.set(dependentKeys[0], JSON.stringify(newCacheData), 'EX', ttlSeconds);
//     } else {
//       await redis.set(dependentKeys[0], JSON.stringify(newCacheData));
//     }
//   }
// }

// function getDependentKeys(key: string, venueID: string): string[] {
//   const dependencies: Record<string, string[]> = {
//     generalData: [`venue:${venueID}:general`, `venue:${venueID}:bundled`],
//     settingsData: [`venue:${venueID}:settings`, `venue:${venueID}:bundled`],
//     courtsData: [`venue:${venueID}:courts`, `venue:${venueID}:bundled`],
//     bundled: [`venue:${venueID}:bundled`],
//   };

//   return dependencies[key] || [];
// }


// function getCacheKey(key: string, venueID: string): string {
//   const cacheKeys: Record<string, string> = {
//     generalData: `venue:${venueID}:general`,
//     settingsData: `venue:${venueID}:settings`,
//     courtsData: `venue:${venueID}:courts`,
//     bundled: `venue:${venueID}:bundled`,
//   };
//   return cacheKeys[key] || '';
// }



import Redis from "ioredis";
import { REDIS_URL } from "$env/static/private";

if (!REDIS_URL) {
  throw new Error('REDIS_URL not set in environment');
}
const redis = new Redis(REDIS_URL!);



export async function getCachedData(cacheKey: string): Promise<any | null> {
  if (!redis) return null;
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
}


export async function setCachedData(cacheKey: string, data: any, ttlSeconds?: number): Promise<void> {
  if (!redis) return;
  ttlSeconds ? await redis.set(cacheKey, JSON.stringify(data), 'EX', ttlSeconds) : await redis.set(cacheKey, JSON.stringify(data));
}


export async function deleteCachedData(cacheKeys: string | string[]): Promise<void> {
  if (!redis) return;
  console.log('deleting cache for keys:', cacheKeys);

  const keys = Array.isArray(cacheKeys) ? cacheKeys : [cacheKeys];
  if (keys.length > 0) await redis.del(...keys);
}