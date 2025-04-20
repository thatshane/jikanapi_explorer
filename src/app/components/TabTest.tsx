'use client';

import { useState, useEffect } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import AnimeGrid from './AnimeGrid';
import MangaGrid from './MangaGrid';
import { animeService, Anime, Manga } from '../services/animeService';
import useFavorites from '../hooks/useFavorites';
import useWatchlist from '../hooks/useWatchlist';
import LoadingSpinner from './LoadingSpinner';

// This is a test component that demonstrates how to toggle between anime and manga content
export default function TabTest() {
  const [activeTab, setActiveTab] = useState<TabType>('anime');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingManga, setIsLoadingManga] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  // Load popular anime when the anime tab is active
  useEffect(() => {
    if (activeTab === 'anime' && animeList.length === 0) {
      const fetchAnime = async () => {
        setIsLoadingAnime(true);
        setError(null);
        try {
          const response = await animeService.getPopularAnime(1);
          setAnimeList(response.data);
        } catch (err) {
          console.error('Error fetching anime:', err);
          setError('Failed to load anime data');
        } finally {
          setIsLoadingAnime(false);
        }
      };
      
      fetchAnime();
    }
  }, [activeTab, animeList.length]);
  
  // Load popular manga when the manga tab is active
  useEffect(() => {
    if (activeTab === 'manga' && mangaList.length === 0) {
      const fetchManga = async () => {
        setIsLoadingManga(true);
        setError(null);
        try {
          const response = await animeService.getPopularManga(1);
          setMangaList(response.data);
        } catch (err) {
          console.error('Error fetching manga:', err);
          setError('Failed to load manga data');
        } finally {
          setIsLoadingManga(false);
        }
      };
      
      fetchManga();
    }
  }, [activeTab, mangaList.length]);
  
  const handleToggleFavorite = (item: Anime | Manga) => {
    if (isFavorite(item.mal_id)) {
      removeFavorite(item.mal_id);
    } else {
      addFavorite(item as any);
    }
  };
  
  const handleToggleWatchlist = (item: Anime | Manga) => {
    if (isInWatchlist(item.mal_id)) {
      removeFromWatchlist(item.mal_id);
    } else {
      addToWatchlist(item as any);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Anime/Manga Toggle Test</h1>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      {activeTab === 'anime' ? (
        <AnimeGrid
          animeList={animeList}
          isLoading={isLoadingAnime}
          favoriteAnimes={favorites.map(item => item.mal_id)}
          watchlistAnimes={watchlist.map(item => item.mal_id)}
          onToggleFavorite={handleToggleFavorite}
          onToggleWatchlist={handleToggleWatchlist}
        />
      ) : (
        <MangaGrid
          mangaList={mangaList}
          isLoading={isLoadingManga}
          favoriteIds={favorites.map(item => item.mal_id)}
          watchlistIds={watchlist.map(item => item.mal_id)}
          onToggleFavorite={handleToggleFavorite}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}
    </div>
  );
} 