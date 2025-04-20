'use client';

import { useState, useEffect } from 'react';
import { animeService } from '../services/animeService';
import { randomDelay } from '../utils/delayUtils';

// This hook handles preloading and caching of essential app data
// with smart timing to avoid rate limits
export const useDataPreloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preloadEssentialData = async () => {
      try {
        // Track total preload steps
        const totalSteps = 4;
        let completedSteps = 0;
        
        // Function to update progress
        const updateProgress = () => {
          completedSteps++;
          setProgress(Math.round((completedSteps / totalSteps) * 100));
        };
        
        // Stagger requests to avoid rate limits
        
        // 1. Load genres (most important reference data)
        await animeService.getGenres();
        updateProgress();
        await randomDelay(500, 1000);
        
        // 2. Load seasons data
        await animeService.getSeasons();
        updateProgress();
        await randomDelay(700, 1200);
        
        // 3. Load top anime (for featured section)
        await animeService.getTopAnime(1, 'tv');
        updateProgress();
        await randomDelay(800, 1500);
        
        // 4. Load popular anime (for home page)
        await animeService.getPopularAnime(1);
        updateProgress();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error preloading data:', error);
        setError('Failed to preload some data');
        setIsLoading(false);
      }
    };
    
    // Start preloading essential data
    preloadEssentialData();
  }, []);

  return { isLoading, progress, error };
};

export default useDataPreloader; 