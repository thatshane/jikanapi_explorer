'use client';

import { useState, useEffect } from 'react';
import useFavorites from '../hooks/useFavorites';
import AnimeGrid from '../components/AnimeGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { Anime } from '../services/animeService';

export default function FavoritesPage() {
  const { favorites, removeFavorite, addFavorite, isLoading } = useFavorites();
  const [hasMounted, setHasMounted] = useState(false);

  // Fix for hydration issues with localStorage
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleFavorite = (anime: Anime) => {
    if (favorites.some(fav => fav.mal_id === anime.mal_id)) {
      removeFavorite(anime.mal_id);
    } else {
      addFavorite(anime);
    }
  };

  // Wait until client-side hydration is complete to avoid hydration mismatch
  if (!hasMounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      
      {favorites.length > 0 ? (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You have {favorites.length} {favorites.length === 1 ? 'anime' : 'animes'} in your favorites.
          </p>
          
          <AnimeGrid 
            animeList={favorites} 
            favoriteIds={favorites.map(anime => anime.mal_id)}
            onToggleFavorite={toggleFavorite}
          />
        </>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't added any anime to your favorites. Browse popular anime or search for your favorites to add them.
          </p>
        </div>
      )}
    </div>
  );
} 