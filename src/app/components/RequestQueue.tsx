'use client';

/**
 * RequestQueue - A singleton class to manage API requests and respect rate limits
 * 
 * Jikan API rate limits:
 * - 3 requests per second
 * - 60 requests per minute
 */

type QueuedRequest = {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  retryCount: number;
  lastRetryTime?: number;
};

class RequestQueueManager {
  private static instance: RequestQueueManager;
  private queue: QueuedRequest[] = [];
  private processing = false;
  private requestsThisSecond = 0;
  private requestsThisMinute = 0;
  private secondTimer: NodeJS.Timeout | null = null;
  private minuteTimer: NodeJS.Timeout | null = null;
  private paused = false;
  private pauseUntil = 0;
  private maxRetries = 5;
  private baseRetryDelay = 2000; // Start with 2 seconds

  private constructor() {
    // Reset the per-second counter every second
    this.secondTimer = setInterval(() => {
      this.requestsThisSecond = 0;
      this.checkPauseStatus();
      this.processQueue();
    }, 1000);

    // Reset the per-minute counter every minute
    this.minuteTimer = setInterval(() => {
      this.requestsThisMinute = 0;
    }, 60000);
  }

  private checkPauseStatus() {
    if (this.paused && Date.now() > this.pauseUntil) {
      console.log('Resuming queue after pause period');
      this.paused = false;
    }
  }

  public static getInstance(): RequestQueueManager {
    if (!RequestQueueManager.instance) {
      RequestQueueManager.instance = new RequestQueueManager();
    }
    return RequestQueueManager.instance;
  }

  public async enqueue<T>(id: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Check if there's already a request with the same ID in the queue
      const existingRequest = this.queue.find(request => request.id === id);
      
      if (existingRequest) {
        console.log(`Request with ID ${id} already in queue, skipping duplicate`);
        return;
      }

      this.queue.push({
        id,
        execute: requestFn,
        resolve,
        reject,
        retryCount: 0
      });

      // Emit event when adding to queue
      this.emitQueueStatusEvent();
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0 || this.paused) {
      return;
    }

    // Check rate limits
    if (this.requestsThisSecond >= 3) {
      // We've hit the per-second limit, wait for the next second
      return;
    }

    if (this.requestsThisMinute >= 60) {
      // We've hit the per-minute limit, pause the queue for a while
      this.paused = true;
      this.pauseUntil = Date.now() + 10000; // 10 seconds pause
      console.log(`Hit minute rate limit, pausing for 10 seconds`);
      this.emitQueueStatusEvent();
      return;
    }

    this.processing = true;

    // Emit event with current queue length
    this.emitQueueStatusEvent();

    // Sort queue to prioritize retries with sufficient backoff time
    this.queue.sort((a, b) => {
      // First, handle requests with no retries yet
      if (a.retryCount === 0 && b.retryCount === 0) return 0;
      if (a.retryCount === 0) return -1;
      if (b.retryCount === 0) return 1;
      
      // Then prioritize by backoff time
      const aReady = !a.lastRetryTime || (Date.now() - a.lastRetryTime) >= this.getBackoffTime(a.retryCount);
      const bReady = !b.lastRetryTime || (Date.now() - b.lastRetryTime) >= this.getBackoffTime(b.retryCount);
      
      if (aReady && !bReady) return -1;
      if (!aReady && bReady) return 1;
      
      // Both ready or both not ready, prioritize lower retry count
      return a.retryCount - b.retryCount;
    });

    const request = this.queue.shift();
    if (!request) {
      this.processing = false;
      return;
    }

    // Check if this request is in a backoff period
    if (request.lastRetryTime && Date.now() - request.lastRetryTime < this.getBackoffTime(request.retryCount)) {
      // Put it back in the queue and try the next one
      this.queue.push(request);
      this.processing = false;
      this.processQueue();
      return;
    }

    try {
      this.requestsThisSecond++;
      this.requestsThisMinute++;
      
      console.log(`Processing request ${request.id} (${this.requestsThisSecond}/3 per sec, ${this.requestsThisMinute}/60 per min), ${this.queue.length} remaining in queue`);
      
      const result = await request.execute();
      request.resolve(result);
    } catch (error: any) {
      console.error(`Error executing request ${request.id}:`, error);
      
      if (this.shouldRetry(error, request)) {
        // Update retry information
        request.retryCount++;
        request.lastRetryTime = Date.now();
        
        const backoffTime = this.getBackoffTime(request.retryCount);
        console.log(`Retrying request ${request.id} (attempt ${request.retryCount}/${this.maxRetries}) after ${backoffTime}ms backoff`);
        
        // Add back to queue for retry
        this.queue.push(request);
        
        // If we got a 429, pause the entire queue for a bit
        if (this.isRateLimitError(error)) {
          this.handleRateLimitError(request);
        }
      } else {
        // Max retries exceeded or error not worthy of retry
        request.reject(error);
      }
    } finally {
      this.processing = false;
      
      // Emit updated queue status
      this.emitQueueStatusEvent();
      
      // Process the next request with a small delay to ensure we don't hit rate limits
      // Only proceed if not paused
      if (!this.paused) {
        setTimeout(() => this.processQueue(), 350);
      }
    }
  }

  private isRateLimitError(error: any): boolean {
    return error.message?.includes('429') || 
           error.status === 429 || 
           (error.response && error.response.status === 429);
  }

  private handleRateLimitError(request: QueuedRequest): void {
    // Exponentially increase pause time based on retry count
    const baseTime = 5000; // 5 seconds
    const pauseTime = Math.min(baseTime * Math.pow(2, request.retryCount - 1), 60000); // Max 1 minute

    console.log(`Rate limit hit, pausing queue for ${pauseTime/1000} seconds`);
    this.paused = true;
    this.pauseUntil = Date.now() + pauseTime;
    
    // If we're getting repeated rate limits, reset counters to be more conservative
    if (request.retryCount > 1) {
      this.requestsThisSecond = 2; // Only allow one more this second
      this.requestsThisMinute = Math.max(50, this.requestsThisMinute); // Be conservative for the minute
    }
  }

  private shouldRetry(error: any, request: QueuedRequest): boolean {
    // Always retry rate limit errors
    if (this.isRateLimitError(error)) {
      return request.retryCount < this.maxRetries;
    }
    
    // Retry network errors and server errors (500s)
    if (
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('500') ||
      error.message?.includes('503') ||
      error.status >= 500 ||
      (error.response && error.response.status >= 500)
    ) {
      return request.retryCount < this.maxRetries;
    }
    
    // Don't retry client errors (400s) except rate limits
    return false;
  }

  private getBackoffTime(retryCount: number): number {
    // Exponential backoff formula: base * 2^retryCount with jitter
    const baseTime = this.baseRetryDelay * Math.pow(2, retryCount - 1);
    const jitter = 0.8 + (Math.random() * 0.4); // Add 80-120% jitter
    return Math.floor(baseTime * jitter);
  }

  private emitQueueStatusEvent() {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('queueStatusUpdate', {
        detail: {
          queueLength: this.queue.length,
          processing: this.processing,
          requestsThisSecond: this.requestsThisSecond,
          requestsThisMinute: this.requestsThisMinute,
          paused: this.paused,
          pauseUntil: this.pauseUntil
        }
      });
      window.dispatchEvent(event);
    }
  }

  public cleanup() {
    if (this.secondTimer) {
      clearInterval(this.secondTimer);
    }
    if (this.minuteTimer) {
      clearInterval(this.minuteTimer);
    }
  }
}

// Export a singleton instance
const requestQueue = RequestQueueManager.getInstance();
export default requestQueue; 