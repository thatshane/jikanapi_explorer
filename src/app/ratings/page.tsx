'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useRatings from '../hooks/useRatings';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingSelector from '../components/RatingSelector';
import { animeService, type Anime } from '../services/animeService';

type RatedAnime = Anime & {
  userRating: number;
  ratingTimestamp: number;
};

export default function RatingsPage() {
  const { ratings, removeRating, isLoading: isRatingsLoading } = useRatings();
  const [ratedAnime, setRatedAnime] = useState<RatedAnime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fix for hydration issues with localStorage
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch anime details for each rated anime
  useEffect(() => {
    const fetchRatedAnimeDetails = async () => {
      if (ratings.length === 0) {
        setIsLoadingAnime(false);
        return;
      }

      setIsLoadingAnime(true);
      setError(null);

      try {
        // Sort by timestamp (newest first)
        const sortedRatings = [...ratings].sort((a, b) => b.timestamp - a.timestamp);
        
        const animeDetailsPromises = sortedRatings.map(async (rating) => {
          try {
            const response = await animeService.getAnimeDetails(rating.animeId);
            return {
              ...response.data,
              userRating: rating.score,
              ratingTimestamp: rating.timestamp
            };
          } catch (error) {
            console.error(`Error fetching anime ${rating.animeId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(animeDetailsPromises);
        setRatedAnime(results.filter(anime => anime !== null) as RatedAnime[]);
      } catch (error) {
        console.error('Error fetching rated anime details:', error);
        setError('Failed to load your rated anime. Please try again later.');
      } finally {
        setIsLoadingAnime(false);
      }
    };

    if (!isRatingsLoading) {
      fetchRatedAnimeDetails();
    }
  }, [ratings, isRatingsLoading]);

  const handleRemoveRating = (animeId: number) => {
    removeRating(animeId);
  };

  // Wait until client-side hydration is complete to avoid hydration mismatch
  if (!hasMounted || isRatingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your ratings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">My Anime Ratings</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {isLoadingAnime ? (
        <div className="flex flex-col items-center py-12">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading anime details...</p>
        </div>
      ) : ratings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratedAnime.map((anime) => (
            <div 
              key={anime.mal_id}
              className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
            >
              <div className="relative w-32 h-44 flex-shrink-0">
                <Image
                  src={anime.images.jpg.large_image_url || anime.images.jpg.image_url || '/placeholder.png'}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                  quality={85}
                />
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                  <Link 
                    href={`/anime/${anime.mal_id}`}
                    className="font-bold text-lg hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {anime.title}
                  </Link>
                  
                  <div className="flex mt-2 items-center">
                    <RatingSelector
                      initialRating={anime.userRating}
                      onRate={() => {}}
                      readOnly
                      size="small"
                    />
                    <button
                      onClick={() => handleRemoveRating(anime.mal_id)}
                      className="ml-3 text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Rated on {new Date(anime.ratingTimestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Ratings Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't rated any anime yet. Browse anime and add ratings to build your collection.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Explore Anime
          </button>
        </div>
      )}
    </div>
  );
} 