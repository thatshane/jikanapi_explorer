/**
 * Simple in-memory cache service with time-based expiration
 */

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item is expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Store data in the cache
   * @param key Cache key
   * @param data Data to store
   * @param ttl Time to live in milliseconds (default 10 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 10 * 60 * 1000): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
  }
  
  /**
   * Remove item from cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Check if cache has valid item for key
   * @param key Cache key
   * @returns True if cache has valid item
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if the item is expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Singleton instance for the entire application
const cacheService = new CacheService();
export default cacheService; 