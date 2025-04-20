'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface FeaturedAnimeSkeletonProps {
  message?: string;
}

const FeaturedAnimeSkeleton: React.FC<FeaturedAnimeSkeletonProps> = ({ 
  message = "Loading featured anime..." 
}) => {
  return (
    <div className="w-full h-[500px] bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-lg overflow-hidden shadow-xl">
      <div className="h-full flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <LoadingSpinner size="large" />
          
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            {message}
          </p>
          
          {/* Fake content skeleton */}
          <div className="mt-12 w-full max-w-md flex flex-col items-start px-6">
            <div className="w-3/4 h-10 bg-gray-400/30 dark:bg-gray-600/30 rounded-lg mb-4"></div>
            <div className="w-1/2 h-6 bg-gray-400/30 dark:bg-gray-600/30 rounded-lg mb-8"></div>
            <div className="w-full h-4 bg-gray-400/30 dark:bg-gray-600/30 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-400/30 dark:bg-gray-600/30 rounded mb-2"></div>
            <div className="w-2/3 h-4 bg-gray-400/30 dark:bg-gray-600/30 rounded mb-6"></div>
            <div className="w-36 h-10 bg-blue-600/40 dark:bg-blue-500/40 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAnimeSkeleton; 