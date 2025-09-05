/**
 * Centralized API Manager - Prevents duplicate API calls and implements rate limiting
 * 
 * This manager ensures only one API call happens at a time per endpoint,
 * implements proper caching, and prevents rate limit issues.
 */

import { sheetApi } from './sheetApi';
import type { SheetRow, ApiResponse } from '../types';

interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T = any> {
  promise: Promise<T>;
  timestamp: number;
}

export class ApiManager {
  private cache = new Map<string, CachedResponse>();
  private pendingRequests = new Map<string, PendingRequest>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private readonly DEFAULT_TTL = 30000; // 30 second cache

  /**
   * Get all sheet data with deduplication and caching
   */
  async getAllData(): Promise<ApiResponse<SheetRow[]>> {
    const cacheKey = 'getAllData';
    
    // Check cache first
    const cached = this.getCachedResponse<ApiResponse<SheetRow[]>>(cacheKey);
    if (cached) {
      console.log('🔄 ApiManager: Returning cached data');
      return cached;
    }

    // Check if request is already in progress
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log('⏳ ApiManager: Request already in progress, waiting...');
      return await pending.promise;
    }

    // Rate limit check
    await this.enforceRateLimit();

    // Make new request
    console.log('📡 ApiManager: Making new API request for getAllData');
    const requestPromise = this.makeNewRequest(cacheKey);
    
    try {
      const result = await requestPromise;
      return result;
    } catch (error) {
      // Remove from pending on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Quick connection test with deduplication
   */
  async quickConnectionTest(): Promise<{ connected: boolean; error?: string; rowCount?: number }> {
    const cacheKey = 'quickTest';
    
    // Check cache first (shorter TTL for connection tests)
    const cached = this.getCachedResponse<{ connected: boolean; error?: string; rowCount?: number }>(
      cacheKey, 
      10000 // 10 second cache for connection tests
    );
    if (cached) {
      console.log('🔄 ApiManager: Returning cached connection status');
      return cached;
    }

    // Check if request is already in progress
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log('⏳ ApiManager: Connection test already in progress, waiting...');
      return await pending.promise;
    }

    // Rate limit check
    await this.enforceRateLimit();

    // Make new request
    console.log('📡 ApiManager: Making new connection test request');
    const requestPromise = this.makeQuickTestRequest(cacheKey);
    
    try {
      const result = await requestPromise;
      return result;
    } catch (error) {
      // Remove from pending on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Clear cache to force fresh data
   */
  clearCache(): void {
    console.log('🧹 ApiManager: Clearing cache');
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    console.log(`🧹 ApiManager: Clearing cache for ${key}`);
    this.cache.delete(key);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheEntries: Array.from(this.cache.keys())
    };
  }

  private async makeNewRequest(cacheKey: string): Promise<ApiResponse<SheetRow[]>> {
    const requestPromise = sheetApi.getAllData();
    
    // Store as pending
    this.pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    try {
      const result = await requestPromise;
      
      // Cache successful responses
      if (result.success) {
        this.setCacheEntry(cacheKey, result, this.DEFAULT_TTL);
      }
      
      // Remove from pending
      this.pendingRequests.delete(cacheKey);
      
      return result;
    } catch (error) {
      // Remove from pending on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  private async makeQuickTestRequest(cacheKey: string): Promise<{ connected: boolean; error?: string; rowCount?: number }> {
    const requestPromise = this.performQuickTest();
    
    // Store as pending
    this.pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    try {
      const result = await requestPromise;
      
      // Cache the result
      this.setCacheEntry(cacheKey, result, 10000); // 10 second cache
      
      // Remove from pending
      this.pendingRequests.delete(cacheKey);
      
      return result;
    } catch (error) {
      // Remove from pending on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  private async performQuickTest(): Promise<{ connected: boolean; error?: string; rowCount?: number }> {
    try {
      const result = await sheetApi.getAllData();
      
      if (result.success && result.data) {
        return {
          connected: true,
          rowCount: result.data.length
        };
      } else {
        return {
          connected: false,
          error: result.error || 'Unknown error'
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private getCachedResponse<T>(key: string, customTtl?: number): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const ttl = customTtl || cached.ttl;
    const isExpired = Date.now() - cached.timestamp > ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCacheEntry<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private async enforceRateLimit(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ ApiManager: Rate limiting - waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Clean up expired cache entries and old pending requests
   */
  private cleanup(): void {
    // Clean expired cache entries
    for (const [key, cached] of this.cache.entries()) {
      const isExpired = Date.now() - cached.timestamp > cached.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    }

    // Clean old pending requests (older than 30 seconds)
    for (const [key, pending] of this.pendingRequests.entries()) {
      const isStale = Date.now() - pending.timestamp > 30000;
      if (isStale) {
        this.pendingRequests.delete(key);
      }
    }
  }

  constructor() {
    // Run cleanup every minute
    setInterval(() => this.cleanup(), 60000);
  }
}

// Export singleton instance
export const apiManager = new ApiManager();