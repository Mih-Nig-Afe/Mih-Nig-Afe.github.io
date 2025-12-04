/**
 * Cache Manager for GitHub API data
 * Implements smart caching with expiry to avoid rate limits
 */

class CacheManager {
  constructor(cachePrefix = 'github_cache_') {
    this.cachePrefix = cachePrefix;
    this.defaultExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  /**
   * Set data in cache with expiry timestamp
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} expiryMs - Optional custom expiry time in milliseconds
   */
  set(key, data, expiryMs = this.defaultExpiry) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: expiryMs
      };
      localStorage.setItem(this.cachePrefix + key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get data from cache if not expired
   * @param {string} key - Cache key
   * @returns {*} Cached data or null if expired/not found
   */
  get(key) {
    try {
      const cached = localStorage.getItem(this.cachePrefix + key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      // Check if cache has expired
      if (age > cacheData.expiry) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      localStorage.removeItem(this.cachePrefix + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache entries with our prefix
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache age in milliseconds
   * @param {string} key - Cache key
   * @returns {number|null} Age in milliseconds or null if not found
   */
  getAge(key) {
    try {
      const cached = localStorage.getItem(this.cachePrefix + key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return Date.now() - cacheData.timestamp;
    } catch (error) {
      console.error('Cache age error:', error);
      return null;
    }
  }

  /**
   * Check if cache exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  isValid(key) {
    return this.get(key) !== null;
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
