'use client';

import { useState, useEffect } from 'react';

interface AnimeRating {
  animeId: number;
  score: number;
  timestamp: number;
}

const RATINGS_KEY = 'animeRatings';

export const useRatings = () => {
  const [ratings, setRatings] = useState<AnimeRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load ratings from localStorage on component mount
    const loadRatings = () => {
      try {
        const savedRatings = localStorage.getItem(RATINGS_KEY);
        if (savedRatings) {
          setRatings(JSON.parse(savedRatings));
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRatings();
  }, []);

  // Save ratings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    }
  }, [ratings, isLoading]);

  const rateAnime = (animeId: number, score: number) => {
    setRatings(prevRatings => {
      // Check if anime is already rated
      const existingIndex = prevRatings.findIndex(rating => rating.animeId === animeId);
      
      if (existingIndex !== -1) {
        // Update existing rating
        const newRatings = [...prevRatings];
        newRatings[existingIndex] = {
          animeId,
          score,
          timestamp: Date.now()
        };
        return newRatings;
      } else {
        // Add new rating
        return [...prevRatings, {
          animeId,
          score,
          timestamp: Date.now()
        }];
      }
    });
  };

  const removeRating = (animeId: number) => {
    setRatings(prevRatings => 
      prevRatings.filter(rating => rating.animeId !== animeId)
    );
  };

  const getAnimeRating = (animeId: number): number | null => {
    const rating = ratings.find(rating => rating.animeId === animeId);
    return rating ? rating.score : null;
  };

  return {
    ratings,
    rateAnime,
    removeRating,
    getAnimeRating,
    isLoading
  };
};

export default useRatings; 