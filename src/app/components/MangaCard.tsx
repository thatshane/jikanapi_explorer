'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Manga } from '../services/animeService';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';

interface MangaCardProps {
  manga: Manga;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onToggleFavorite?: () => void;
  onToggleWatchlist?: () => void;
}

const MangaCard: React.FC<MangaCardProps> = ({ 
  manga, 
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
            anime={manga as any} // Using existing buttons with manga
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded-full shadow-md"
          />
        )}
        
        {onToggleWatchlist && (
          <WatchlistButton
            anime={manga as any} // Using existing buttons with manga
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={onToggleWatchlist}
            className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded-full shadow-md"
          />
        )}
      </div>
      
      <Link 
        href={`/manga/${manga.mal_id}`}
        className="block"
      >
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={
              manga.images.jpg.large_image_url || 
              (manga.images.webp && manga.images.webp.large_image_url) || 
              manga.images.jpg.image_url || 
              (manga.images.webp && manga.images.webp.image_url) || 
              '/placeholder.png'
            }
            alt={manga.title}
            fill
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={95}
            placeholder="blur"
            blurDataURL={manga.images.jpg.image_url || '/placeholder.png'}
          />
          {manga.score > 0 && (
            <div className="absolute bottom-0 left-0 m-3 flex items-center bg-black bg-opacity-70 text-white px-2.5 py-1 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {manga.score.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={manga.title}>
            {manga.title}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">
              {manga.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {manga.volumes > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                {manga.volumes} {manga.volumes === 1 ? 'volume' : 'volumes'}
              </span>
            )}
            {manga.chapters > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                {manga.chapters} {manga.chapters === 1 ? 'chapter' : 'chapters'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MangaCard; 