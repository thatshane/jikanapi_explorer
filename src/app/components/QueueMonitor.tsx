'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface QueueStats {
  queueLength: number;
  processing: boolean;
  requestsThisSecond: number;
  requestsThisMinute: number;
  paused: boolean;
  pauseUntil: number;
}

const QueueMonitor: React.FC = () => {
  const [stats, setStats] = useState<QueueStats>({
    queueLength: 0,
    processing: false,
    requestsThisSecond: 0,
    requestsThisMinute: 0,
    paused: false,
    pauseUntil: 0
  });
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Only show the monitor in development
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) return;

    const queueStatusHandler = (event: CustomEvent) => {
      setStats(event.detail);
      
      // Auto-show when there's queue activity
      if (event.detail.queueLength > 0 || event.detail.paused) {
        setVisible(true);
      }
    };

    // Register for queue updates
    window.addEventListener('queueStatusUpdate' as any, queueStatusHandler as EventListener);

    // Initial show if in dev mode
    setVisible(isDev);

    return () => {
      window.removeEventListener('queueStatusUpdate' as any, queueStatusHandler as EventListener);
    };
  }, [isDev]);

  // Don't render anything outside development
  if (!isDev || !visible) return null;

  const remainingPauseTime = stats.paused ? Math.max(0, Math.ceil((stats.pauseUntil - Date.now()) / 1000)) : 0;

  return (
    <div className="fixed top-20 right-4 z-50 w-auto min-w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs overflow-hidden">
      <div 
        className={`p-2 ${stats.paused ? 'bg-amber-600' : (stats.queueLength > 0 ? 'bg-blue-600' : 'bg-green-600')} text-white flex justify-between items-center cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="font-medium">
          API Queue Monitor {stats.paused ? '(Paused)' : (stats.queueLength > 0 ? '(Active)' : '(Idle)')}
        </div>
        <div>
          {expanded ? '▼' : '▶'}
        </div>
      </div>
      
      {expanded && (
        <div className="p-3 space-y-2 text-gray-800 dark:text-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Queue Length:</div>
            <div className={`${stats.queueLength > 0 ? 'text-amber-600 dark:text-amber-500 font-bold' : 'text-green-600 dark:text-green-500'}`}>
              {stats.queueLength} requests
            </div>
            
            <div className="font-medium">Processing:</div>
            <div className={stats.processing ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'}>
              {stats.processing ? 'Yes' : 'No'}
            </div>
            
            <div className="font-medium">Requests (Second):</div>
            <div className={`${stats.requestsThisSecond >= 3 ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
              {stats.requestsThisSecond}/3
            </div>
            
            <div className="font-medium">Requests (Minute):</div>
            <div className={`${stats.requestsThisMinute >= 50 ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
              {stats.requestsThisMinute}/60
            </div>
            
            <div className="font-medium">Status:</div>
            <div className={stats.paused ? 'text-amber-600 dark:text-amber-500 font-bold' : 'text-green-600 dark:text-green-500'}>
              {stats.paused ? `Paused (${remainingPauseTime}s)` : 'Running'}
            </div>
            
            <div className="font-medium">Current Page:</div>
            <div className="truncate max-w-[140px]">
              {pathname}
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button 
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              onClick={() => setVisible(false)}
            >
              Hide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueMonitor; 