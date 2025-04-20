'use client';

import { useEffect } from 'react';
import useDataPreloader from '../hooks/useDataPreloader';

interface DataPreloaderProps {
  children: React.ReactNode;
}

const DataPreloader: React.FC<DataPreloaderProps> = ({ children }) => {
  const { isLoading, progress, error } = useDataPreloader();

  // When not loading or if there's an error, render children
  if (!isLoading || error) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4 py-16">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-8 text-blue-600 dark:text-blue-400">
            Loading AnimeDB
          </h2>
          
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progress === 100 ? 'Almost ready...' : `Loading essential data (${progress}%)`}
          </p>
          
          <div className="mt-12 animate-pulse">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreloader; 