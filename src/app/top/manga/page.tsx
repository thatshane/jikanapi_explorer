'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { animeService, Manga } from '../../services/animeService';
import MangaGrid from '../../components/MangaGrid';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import useFavorites from '../../hooks/useFavorites';
import useWatchlist from '../../hooks/useWatchlist';

export default function TopMangaPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams?.get('page');
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  
  const [manga, setManga] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [hasMounted, setHasMounted] = useState(false);

  // Fix for hydration issues with localStorage
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchTopManga = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.getTopManga(currentPage);
        setManga(response.data);
        setTotalPages(response.pagination.last_visible_page);
      } catch (err) {
        console.error('Error fetching top manga:', err);
        setError('Failed to load top manga. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopManga();
  }, [currentPage]);

  const handleToggleFavorite = (manga: Manga) => {
    if (isFavorite(manga.mal_id)) {
      removeFavorite(manga.mal_id);
    } else {
      addFavorite(manga as any); // Using as any since favorites is designed for anime
    }
  };

  const handleToggleWatchlist = (manga: Manga) => {
    if (isInWatchlist(manga.mal_id)) {
      removeFromWatchlist(manga.mal_id);
    } else {
      addToWatchlist(manga as any); // Using as any since watchlist is designed for anime
    }
  };

  // Wait until client-side hydration is complete
  if (!hasMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Top Manga</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the highest-rated manga series based on MyAnimeList scores
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <MangaGrid
        mangaList={manga}
        isLoading={isLoading}
        favoriteIds={favorites.map(item => item.mal_id)}
        watchlistIds={watchlist.map(item => item.mal_id)}
        onToggleFavorite={handleToggleFavorite}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {!isLoading && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/top/manga"
        />
      )}
    </div>
  );
} 