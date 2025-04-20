'use client';

import { Anime } from '../services/animeService';

interface WatchlistButtonProps {
  anime: Anime;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
  className?: string;
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  anime,
  isInWatchlist,
  onToggleWatchlist,
  className = '',
}) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleWatchlist();
      }}
      className={`transition-colors focus:outline-none ${className}`}
      aria-label={isInWatchlist ? `Remove ${anime.title} from watchlist` : `Add ${anime.title} to watchlist`}
    >
      {isInWatchlist ? (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-green-500 hover:text-green-600" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
          />
        </svg>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-400 hover:text-green-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      )}
    </button>
  );
};

export default WatchlistButton; 