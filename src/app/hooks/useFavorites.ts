'use client';

import { useState, useEffect } from 'react';
import { Anime } from '../services/animeService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('animeFavorites');
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          // Validate that we got a proper array
          setFavorites(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        // Reset to empty array on error
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Use a small timeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      loadFavorites();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('animeFavorites', JSON.stringify(favorites || []));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  }, [favorites, isLoading]);

  const addFavorite = (anime: Anime) => {
    if (!anime || typeof anime !== 'object') return;
    
    setFavorites(prevFavorites => {
      // Ensure we're working with an array
      const current = Array.isArray(prevFavorites) ? prevFavorites : [];
      // Check if anime is already in favorites
      if (current.some(fav => fav.mal_id === anime.mal_id)) {
        return current;
      }
      return [...current, anime];
    });
  };

  const removeFavorite = (animeId: number) => {
    if (!animeId) return;
    
    setFavorites(prevFavorites => {
      // Ensure we're working with an array
      const current = Array.isArray(prevFavorites) ? prevFavorites : [];
      return current.filter(anime => anime?.mal_id !== animeId);
    });
  };

  const isFavorite = (animeId: number) => {
    if (!animeId || !Array.isArray(favorites)) return false;
    return favorites.some(anime => anime?.mal_id === animeId);
  };

  return { 
    favorites: Array.isArray(favorites) ? favorites : [], 
    addFavorite, 
    removeFavorite, 
    isFavorite,
    isLoading 
  };
};

export default useFavorites; 