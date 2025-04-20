'use client';

import { useState, useEffect } from 'react';
import { Manga } from '../services/animeService';
import MangaCard from './MangaCard';
import LoadingSpinner from './LoadingSpinner';

interface MangaGridProps {
  mangaList: Manga[];
  isLoading: boolean;
  favoriteIds?: number[];
  watchlistIds?: number[];
  onToggleFavorite: (manga: Manga) => void;
  onToggleWatchlist: (manga: Manga) => void;
}

const MangaGrid: React.FC<MangaGridProps> = ({
  mangaList,
  isLoading,
  favoriteIds = [],
  watchlistIds = [],
  onToggleFavorite,
  onToggleWatchlist,
}) => {
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading manga...</p>
      </div>
    );
  }

  if (!mangaList || mangaList.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">No manga found</p>
          <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Make sure we have valid arrays to prevent runtime errors
  const favoritesArray = Array.isArray(favoriteIds) ? favoriteIds : [];
  const watchlistArray = Array.isArray(watchlistIds) ? watchlistIds : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {mangaList.map((manga) => (
        <MangaCard
          key={manga.mal_id}
          manga={manga}
          isFavorite={favoritesArray.includes(manga.mal_id)}
          isInWatchlist={watchlistArray.includes(manga.mal_id)}
          onToggleFavorite={() => onToggleFavorite(manga)}
          onToggleWatchlist={() => onToggleWatchlist(manga)}
        />
      ))}
    </div>
  );
};

export default MangaGrid; 