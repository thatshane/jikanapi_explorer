'use client';

import { useState, useEffect } from 'react';
import requestQueue from './RequestQueue';

interface RequestStatusProps {
  className?: string;
}

const RequestStatus: React.FC<RequestStatusProps> = ({ className = '' }) => {
  const [requestsInQueue, setRequestsInQueue] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseEndTime, setPauseEndTime] = useState<number>(0);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Create a custom event to track queue status
    const queueStatusHandler = (event: CustomEvent) => {
      const { queueLength, paused, pauseUntil } = event.detail;
      setRequestsInQueue(queueLength);
      setIsPaused(paused);
      setPauseEndTime(pauseUntil);
      
      // Show the status indicator if there are requests in queue or if paused
      if (queueLength > 0 || paused) {
        setIsVisible(true);
      } else {
        // Hide after a short delay when queue is empty and not paused
        setTimeout(() => setIsVisible(false), 2000);
      }
    };

    // Add the event listener
    window.addEventListener('queueStatusUpdate' as any, queueStatusHandler as EventListener);

    // Update the countdown timer if queue is paused
    let countdownInterval: NodeJS.Timeout | null = null;
    
    if (isPaused && pauseEndTime > 0) {
      countdownInterval = setInterval(() => {
        const remaining = Math.max(0, pauseEndTime - Date.now());
        setPauseTimeRemaining(remaining);
        
        if (remaining === 0) {
          setIsPaused(false);
        }
      }, 1000);
    }

    // Clean up on unmount
    return () => {
      window.removeEventListener('queueStatusUpdate' as any, queueStatusHandler as EventListener);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isPaused, pauseEndTime]);

  if (!isVisible) {
    return null;
  }

  // Format the remaining time in seconds
  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isPaused ? 'bg-amber-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg shadow-lg transition-all ${className}`}>
      <div className="flex items-center space-x-3">
        {isPaused ? (
          // Paused indicator
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span>Rate limit hit! Resuming in {formatTime(pauseTimeRemaining)}</span>
              {requestsInQueue > 0 && (
                <p className="text-xs opacity-80">{requestsInQueue} {requestsInQueue === 1 ? 'request' : 'requests'} waiting</p>
              )}
            </div>
          </div>
        ) : (
          // Normal loading indicator
          <>
            <div className="animate-pulse flex">
              <div className="h-3 w-3 bg-blue-300 rounded-full"></div>
            </div>
            <div>
              {requestsInQueue === 0 ? (
                <span>All requests complete</span>
              ) : (
                <span>Loading: {requestsInQueue} {requestsInQueue === 1 ? 'request' : 'requests'} pending</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestStatus; 