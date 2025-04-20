'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { animeService, type Anime } from '../services/animeService';
import AnimeGrid from '../components/AnimeGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import useFavorites from '../hooks/useFavorites';

export default function SeasonsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get('year') ? parseInt(searchParams.get('year') || '') : null;
  const season = searchParams.get('season') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [hasMounted, setHasMounted] = useState(false);

  // Set available seasons for the UI
  const availableSeasons = ['winter', 'spring', 'summer', 'fall'];
  
  // Get current year and last few years for the UI
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchSeasonalAnime = async () => {
      // If no year or season is selected, don't fetch
      if (!year || !season) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.getSeasonalAnime(year, season);
        setAnimeList(response.data);
        setTotalPages(response.pagination.last_visible_page);
      } catch (err) {
        console.error('Error fetching seasonal anime:', err);
        setError('Failed to fetch seasonal anime. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasonalAnime();
  }, [year, season, page]);

  const handleSeasonSelect = (newYear: number, newSeason: string) => {
    router.push(`/seasons?year=${newYear}&season=${newSeason}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/seasons?year=${year}&season=${season}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (anime: Anime) => {
    if (isFavorite(anime.mal_id)) {
      removeFavorite(anime.mal_id);
    } else {
      addFavorite(anime);
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
      <h1 className="text-3xl font-bold mb-6">Seasonal Anime</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Select a Season:</h2>
        <div className="mb-6">
          <div className="font-medium mb-2">Year:</div>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((availableYear) => (
              <button
                key={availableYear}
                onClick={() => handleSeasonSelect(availableYear, season || 'winter')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  year === availableYear
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
              >
                {availableYear}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Season:</div>
          <div className="flex flex-wrap gap-2">
            {availableSeasons.map((availableSeason) => (
              <button
                key={availableSeason}
                onClick={() => handleSeasonSelect(year || currentYear, availableSeason)}
                className={`px-3 py-1 text-sm capitalize rounded-md transition-colors ${
                  season === availableSeason
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
              >
                {availableSeason}
              </button>
            ))}
          </div>
        </div>
      </div>

      {year && season ? (
        <>
          <h2 className="text-2xl font-semibold mb-4 capitalize">
            {season} {year} Anime
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
                animeList={animeList} 
                favoriteIds={favorites.map(anime => anime.mal_id)}
                onToggleFavorite={toggleFavorite}
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
        </>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Select a Season</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select a year and season above to browse anime.
          </p>
        </div>
      )}
    </div>
  );
} 