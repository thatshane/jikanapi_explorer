'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useHistory, { HistoryItem } from '../hooks/useHistory';
import useFavorites from '../hooks/useFavorites';
import useWatchlist from '../hooks/useWatchlist';
import LoadingSpinner from '../components/LoadingSpinner';
import { Anime } from '../services/animeService';
import FavoriteButton from '../components/FavoriteButton';
import WatchlistButton from '../components/WatchlistButton';

// Group history by day
type GroupedHistory = {
  [key: string]: HistoryItem[];
};

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory, isLoading } = useHistory();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [hasMounted, setHasMounted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [groupByDate, setGroupByDate] = useState(true);
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory>({});

  // Fix for hydration issues with localStorage
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Group history by date when it changes or when grouping preference changes
  useEffect(() => {
    if (!isLoading && history.length > 0) {
      if (groupByDate) {
        const grouped: GroupedHistory = {};
        
        history.forEach(item => {
          const date = new Date(item.timestamp);
          const dateKey = date.toLocaleDateString();
          
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          
          grouped[dateKey].push(item);
        });
        
        setGroupedHistory(grouped);
      } else {
        // Reset grouped history when grouping is disabled
        setGroupedHistory({});
      }
    } else {
      setGroupedHistory({});
    }
  }, [history, isLoading, groupByDate]);

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

  const handleClearHistory = () => {
    if (showClearConfirm) {
      clearHistory();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const date = new Date(timestamp);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Format time for display
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Wait until client-side hydration is complete to avoid hydration mismatch
  if (!hasMounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your viewing history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Viewing History</h1>
        
        <div className="flex space-x-4">
          {history.length > 0 && (
            <div className="flex items-center">
              <label className="mr-2 text-sm">Group by date:</label>
              <button
                onClick={() => setGroupByDate(!groupByDate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  groupByDate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    groupByDate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
          {history.length > 0 && (
            <div className="flex space-x-2">
              {showClearConfirm ? (
                <>
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  Clear History
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {history.length > 0 ? (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your recently viewed anime. Your {history.length} most recent views are saved.
          </p>
          
          {groupByDate ? (
            <div className="space-y-10">
              {Object.entries(groupedHistory).map(([dateKey, items]) => (
                <div key={dateKey} className="space-y-4">
                  <h2 className="text-xl font-semibold">{formatDate(items[0].timestamp)}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div 
                        key={`${item.anime.mal_id}-${item.timestamp}`}
                        className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                      >
                        <Link 
                          href={`/anime/${item.anime.mal_id}`}
                          className="relative w-24 h-32 flex-shrink-0"
                        >
                          <Image
                            src={item.anime.images.jpg.large_image_url || item.anime.images.jpg.image_url || '/placeholder.png'}
                            alt={item.anime.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                            quality={85}
                          />
                        </Link>
                        
                        <div className="p-3 flex-grow flex flex-col">
                          <div className="flex-grow">
                            <Link 
                              href={`/anime/${item.anime.mal_id}`}
                              className="font-bold hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {item.anime.title}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Viewed at {formatTime(item.timestamp)}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <button
                              onClick={() => removeFromHistory(item.anime.mal_id)}
                              className="text-xs text-gray-500 hover:text-red-500"
                            >
                              Remove
                            </button>
                            
                            <div className="flex space-x-2">
                              <FavoriteButton
                                anime={item.anime}
                                isFavorite={isFavorite(item.anime.mal_id)}
                                onToggleFavorite={() => toggleFavorite(item.anime)}
                                className="text-gray-400"
                              />
                              <WatchlistButton
                                anime={item.anime}
                                isInWatchlist={isInWatchlist(item.anime.mal_id)}
                                onToggleWatchlist={() => toggleWatchlist(item.anime)}
                                className="text-gray-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.map((item) => (
                <div 
                  key={`${item.anime.mal_id}-${item.timestamp}`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
                    <FavoriteButton
                      anime={item.anime}
                      isFavorite={isFavorite(item.anime.mal_id)}
                      onToggleFavorite={() => toggleFavorite(item.anime)}
                      className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 p-1.5 rounded-full shadow-sm"
                    />
                    <WatchlistButton
                      anime={item.anime}
                      isInWatchlist={isInWatchlist(item.anime.mal_id)}
                      onToggleWatchlist={() => toggleWatchlist(item.anime)}
                      className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 p-1.5 rounded-full shadow-sm"
                    />
                  </div>
                  
                  <Link href={`/anime/${item.anime.mal_id}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.anime.images.jpg.large_image_url || item.anime.images.jpg.image_url || '/placeholder.png'}
                        alt={item.anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={85}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate" title={item.anime.title}>
                        {item.anime.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Viewed on {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromHistory(item.anime.mal_id);
                          }}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Viewing History</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't viewed any anime details yet. Browse anime and view their details to build your history.
          </p>
        </div>
      )}
    </div>
  );
} 