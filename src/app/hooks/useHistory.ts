'use client';

import { useState, useEffect, useCallback } from 'react';
import { Anime } from '../services/animeService';

const HISTORY_KEY = 'animeViewHistory';
const MAX_HISTORY_ITEMS = 20;

export interface HistoryItem {
  anime: Anime;
  timestamp: number;
}

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load history from localStorage on component mount
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history, isLoading]);

  // Memoize addToHistory to prevent unnecessary re-renders
  const addToHistory = useCallback((anime: Anime) => {
    if (!anime || !anime.mal_id) return; // Don't add invalid anime objects
    
    setHistory(prevHistory => {
      // Create a copy of the current history
      const newHistory = [...prevHistory];
      
      // Remove the anime if it already exists
      const existingIndex = newHistory.findIndex(item => item.anime.mal_id === anime.mal_id);
      if (existingIndex !== -1) {
        newHistory.splice(existingIndex, 1);
      }
      
      // Add the anime to the front of the list with current timestamp
      newHistory.unshift({
        anime,
        timestamp: Date.now()
      });
      
      // Trim the history if it exceeds the maximum length
      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory.splice(MAX_HISTORY_ITEMS);
      }
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((animeId: number) => {
    setHistory(prevHistory => 
      prevHistory.filter(item => item.anime.mal_id !== animeId)
    );
  }, []);

  return { 
    history, 
    addToHistory, 
    clearHistory, 
    removeFromHistory,
    isLoading 
  };
};

export default useHistory; 