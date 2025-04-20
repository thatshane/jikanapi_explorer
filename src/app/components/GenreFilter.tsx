'use client';

import { useState, useEffect } from 'react';
import { animeService } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';

interface Genre {
  mal_id: number;
  name: string;
}

interface GenreFilterProps {
  onGenreSelect: (genreId: number | null) => void;
  selectedGenreId: number | null;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ onGenreSelect, selectedGenreId }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      try {
        const response = await animeService.getGenres();
        setGenres(response.data);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="small" />;
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h3 className="font-semibold mr-2">Filter by genre:</h3>
        {selectedGenreId && (
          <button
            onClick={() => onGenreSelect(null)}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.mal_id}
            onClick={() => onGenreSelect(genre.mal_id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedGenreId === genre.mal_id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter; 