'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Anime } from '../services/animeService';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';

interface AnimeCardProps {
  anime: Anime;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onToggleFavorite?: () => void;
  onToggleWatchlist?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ 
  anime, 
  isFavorite = false,
  isInWatchlist = false,
  onToggleFavorite,
  onToggleWatchlist
}) => {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
        {onToggleFavorite && (
          <FavoriteButton
            anime={anime}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded-full shadow-md"
          />
        )}
        
        {onToggleWatchlist && (
          <WatchlistButton
            anime={anime}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={onToggleWatchlist}
            className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded-full shadow-md"
          />
        )}
      </div>
      
      <Link 
        href={`/anime/${anime.mal_id}`}
        className="block"
      >
        <div className="relative h-64 w-full overflow-hidden">
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
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={95}
            placeholder="blur"
            blurDataURL={anime.images.jpg.image_url || '/placeholder.png'}
          />
          {anime.score > 0 && (
            <div className="absolute bottom-0 left-0 m-3 flex items-center bg-black bg-opacity-70 text-white px-2.5 py-1 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {anime.score.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={anime.title}>
            {anime.title}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
              {anime.status}
            </span>
            {anime.episodes > 0 && (
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                {anime.episodes} {anime.episodes === 1 ? 'episode' : 'episodes'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AnimeCard; 