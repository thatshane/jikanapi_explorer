'use client';

import { useState, useEffect } from 'react';
import { Anime } from '../services/animeService';
import AnimeCard from './AnimeCard';
import LoadingSpinner from './LoadingSpinner';

interface AnimeGridProps {
  animeList: Anime[];
  isLoading: boolean;
  favoriteAnimes?: number[];
  watchlistAnimes?: number[];
  onToggleFavorite: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
}

const AnimeGrid: React.FC<AnimeGridProps> = ({
  animeList,
  isLoading,
  favoriteAnimes = [],
  watchlistAnimes = [],
  onToggleFavorite,
  onToggleWatchlist,
}) => {
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading anime...</p>
      </div>
    );
  }

  if (!animeList || animeList.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">No anime found</p>
          <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Make sure we have valid arrays to prevent runtime errors
  const favoritesArray = Array.isArray(favoriteAnimes) ? favoriteAnimes : [];
  const watchlistArray = Array.isArray(watchlistAnimes) ? watchlistAnimes : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {animeList.map((anime) => (
        <AnimeCard
          key={anime.mal_id}
          anime={anime}
          isFavorite={favoritesArray.includes(anime.mal_id)}
          isInWatchlist={watchlistArray.includes(anime.mal_id)}
          onToggleFavorite={() => onToggleFavorite(anime)}
          onToggleWatchlist={() => onToggleWatchlist(anime)}
        />
      ))}
    </div>
  );
};

export default AnimeGrid; 