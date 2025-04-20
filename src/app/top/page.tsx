'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { animeService, type Anime } from '../services/animeService';
import AnimeGrid from '../components/AnimeGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import useFavorites from '../hooks/useFavorites';
import useWatchlist from '../hooks/useWatchlist';

export default function TopAnimePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'tv';
  const page = parseInt(searchParams.get('page') || '1');

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [hasMounted, setHasMounted] = useState(false);

  // Set available types for the UI
  const animeTypes = [
    { id: 'tv', label: 'TV Series' },
    { id: 'movie', label: 'Movies' },
    { id: 'ova', label: 'OVAs' },
    { id: 'special', label: 'Specials' },
    { id: 'ona', label: 'ONAs' },
    { id: 'music', label: 'Music' },
  ];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchTopAnime = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.getTopAnime(page, type);
        if (response && response.data) {
          setAnimeList(response.data);
          if (response.pagination && response.pagination.last_visible_page) {
            setTotalPages(response.pagination.last_visible_page);
          } else {
            setTotalPages(1);
          }
        } else {
          setAnimeList([]);
          setError('No data received from API. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching top anime:', err);
        setAnimeList([]);
        setError('Failed to fetch top anime. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopAnime();
  }, [type, page]);

  const handleTypeSelect = (newType: string) => {
    router.push(`/top?type=${newType}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/top?type=${type}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (anime: Anime) => {
    if (isFavorite(anime.mal_id)) {
      removeFavorite(anime.mal_id);
    } else {
      addFavorite(anime);
    }
  };

  const toggleWatchlist = (anime: Anime) => {
    if (isInWatchlist(anime.mal_id)) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  // Wait until client-side hydration is complete
  if (!hasMounted) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Top Anime</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the highest-rated anime across different formats, from TV series to movies and more.
        </p>
      </section>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Filter by Format:</h2>
        <div className="flex flex-wrap gap-2">
          {animeTypes.map((animeType) => (
            <button
              key={animeType.id}
              onClick={() => handleTypeSelect(animeType.id)}
              className={`px-4 py-2 rounded-md transition-colors ${
                type === animeType.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              {animeType.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 capitalize">
          Top {animeTypes.find(t => t.id === type)?.label || type}
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : (
          <>
            <AnimeGrid 
              animeList={animeList || []} 
              favoriteIds={favorites ? favorites.map(anime => anime.mal_id) : []}
              watchlistIds={isInWatchlist ? animeList.filter(anime => isInWatchlist(anime.mal_id)).map(anime => anime.mal_id) : []}
              onToggleFavorite={toggleFavorite}
              onToggleWatchlist={toggleWatchlist}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 