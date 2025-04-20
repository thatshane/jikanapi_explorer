/**
 * Utility functions for handling delays and rate limiting
 */

/**
 * Creates a promise that resolves after a specified time
 * @param ms Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Creates a promise that resolves after a random delay within a range
 * @param minMs Minimum milliseconds to delay
 * @param maxMs Maximum milliseconds to delay
 * @returns Promise that resolves after the random delay
 */
export const randomDelay = (minMs: number, maxMs: number): Promise<void> => {
  const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return delay(delayMs);
};

/**
 * Creates an exponential backoff delay based on the attempt number
 * @param attemptNumber The current attempt number (starting from 1)
 * @param baseMs Base delay in milliseconds
 * @param maxMs Maximum delay in milliseconds
 * @returns Promise that resolves after calculated delay
 */
export const exponentialBackoff = (
  attemptNumber: number, 
  baseMs: number = 1000, 
  maxMs: number = 30000
): Promise<void> => {
  // Calculate delay with jitter: baseMs * 2^(attemptNumber-1) * (0.5 + random(0, 0.5))
  const expDelay = baseMs * Math.pow(2, attemptNumber - 1);
  const jitter = 0.5 + Math.random() * 0.5; // 50-100% of calculated delay
  const finalDelay = Math.min(expDelay * jitter, maxMs);
  
  return delay(Math.floor(finalDelay));
}; 