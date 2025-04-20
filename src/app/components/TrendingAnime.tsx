'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Anime, animeService } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';

interface TrendingAnimeProps {
  onToggleFavorite?: (anime: Anime) => void;
  onToggleWatchlist?: (anime: Anime) => void;
  isFavorite: (animeId: number) => boolean;
  isInWatchlist: (animeId: number) => boolean;
}

const TrendingAnime: React.FC<TrendingAnimeProps> = ({ 
  onToggleFavorite, 
  onToggleWatchlist, 
  isFavorite = () => false, 
  isInWatchlist = () => false
}) => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      setIsLoading(true);
      try {
        // Get currently airing anime sorted by popularity
        const response = await animeService.getPopularAnime();
        if (response?.data && response.data.length > 0) {
          // Get the first 12 anime
          setTrendingAnime(response.data.slice(0, 12));
        } else {
          setError('No trending anime available');
        }
      } catch (err) {
        console.error('Error fetching trending anime:', err);
        setError('Failed to load trending anime');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingAnime();
  }, []);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !trendingAnime || trendingAnime.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleScrollLeft}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleScrollRight}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trendingAnime.map((anime) => (
          <div 
            key={anime.mal_id}
            className="min-w-[200px] max-w-[200px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md flex-shrink-0"
          >
            <div className="relative">
              <Link href={`/anime/${anime.mal_id}`}>
                <div className="relative h-[280px] w-full">
                  <Image
                    src={
                      anime.images.jpg.large_image_url || 
                      (anime.images.webp && anime.images.webp.large_image_url) || 
                      anime.images.jpg.image_url || 
                      (anime.images.webp && anime.images.webp.image_url) || 
                      '/placeholder.png'
                    }
                    alt={anime.title}
                    fill
                    className="object-cover"
                    sizes="200px"
                    quality={90}
                    loading="eager"
                    placeholder="blur"
                    blurDataURL={anime.images.jpg.image_url || '/placeholder.png'}
                  />
                </div>
              </Link>
              <div className="absolute top-2 right-2 flex flex-col space-y-2">
                {onToggleFavorite && (
                  <FavoriteButton
                    anime={anime}
                    isFavorite={isFavorite && typeof isFavorite === 'function' ? isFavorite(anime.mal_id) : false}
                    onToggleFavorite={() => onToggleFavorite(anime)}
                    className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 p-1.5 rounded-full shadow-sm"
                  />
                )}
                {onToggleWatchlist && (
                  <WatchlistButton
                    anime={anime}
                    isInWatchlist={isInWatchlist && typeof isInWatchlist === 'function' ? isInWatchlist(anime.mal_id) : false}
                    onToggleWatchlist={() => onToggleWatchlist(anime)}
                    className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 p-1.5 rounded-full shadow-sm"
                  />
                )}
              </div>
            </div>
            <div className="p-4">
              <Link href={`/anime/${anime.mal_id}`}>
                <h3 className="font-bold text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 mb-2" title={anime.title}>
                  {anime.title}
                </h3>
              </Link>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                  {anime.status}
                </span>
                {anime.score > 0 && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-xs font-medium">{anime.score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingAnime;

// Add these styles to globals.css or a separate stylesheet
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// } 