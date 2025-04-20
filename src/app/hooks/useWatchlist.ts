'use client';

import { useState, useEffect } from 'react';
import { Anime } from '../services/animeService';

const WATCHLIST_KEY = 'animeWatchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load watchlist from localStorage on component mount
    const loadWatchlist = () => {
      try {
        const savedWatchlist = localStorage.getItem(WATCHLIST_KEY);
        if (savedWatchlist) {
          const parsed = JSON.parse(savedWatchlist);
          // Validate that we got a proper array
          setWatchlist(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading watchlist:', error);
        // Reset to empty array on error
        setWatchlist([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Use a small timeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      loadWatchlist();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist || []));
      } catch (error) {
        console.error('Error saving watchlist:', error);
      }
    }
  }, [watchlist, isLoading]);

  const addToWatchlist = (anime: Anime) => {
    if (!anime || typeof anime !== 'object') return;
    
    setWatchlist(prevWatchlist => {
      // Ensure we're working with an array
      const current = Array.isArray(prevWatchlist) ? prevWatchlist : [];
      // Check if anime is already in watchlist
      if (current.some(item => item.mal_id === anime.mal_id)) {
        return current;
      }
      return [...current, anime];
    });
  };

  const removeFromWatchlist = (animeId: number) => {
    if (!animeId) return;
    
    setWatchlist(prevWatchlist => {
      // Ensure we're working with an array
      const current = Array.isArray(prevWatchlist) ? prevWatchlist : [];
      return current.filter(anime => anime?.mal_id !== animeId);
    });
  };

  const isInWatchlist = (animeId: number) => {
    if (!animeId || !Array.isArray(watchlist)) return false;
    return watchlist.some(anime => anime?.mal_id === animeId);
  };

  return { 
    watchlist: Array.isArray(watchlist) ? watchlist : [], 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist,
    isLoading 
  };
};

export default useWatchlist; 