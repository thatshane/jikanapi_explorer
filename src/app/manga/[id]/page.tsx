'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { animeService, type MangaDetails, type Manga } from '../../services/animeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FavoriteButton from '../../components/FavoriteButton';
import useFavorites from '../../hooks/useFavorites';
import useHistory from '../../hooks/useHistory';
import useWatchlist from '../../hooks/useWatchlist';
import WatchlistButton from '../../components/WatchlistButton';
import useRatings from '../../hooks/useRatings';
import RatingSelector from '../../components/RatingSelector';

export default function MangaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getAnimeRating, rateAnime, removeRating } = useRatings();
  const { addToHistory } = useHistory();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Track if we've already added this manga to history
  const [addedToHistory, setAddedToHistory] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchMangaDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.getMangaDetails(Number(id));
        setManga(response.data);
      } catch (err) {
        console.error('Error fetching manga details:', err);
        setError('Failed to load manga details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaDetails();
  }, [id]);

  // Separate effect for adding to history to avoid the infinite loop
  useEffect(() => {
    // Only add to history once we have manga data, haven't added it yet, and we're not loading
    if (manga && !addedToHistory && !isLoading && hasMounted) {
      // Use a timeout to ensure this happens after the component has stabilized
      const timer = setTimeout(() => {
        addToHistory(manga as any); // Using 'as any' since useHistory is designed for anime
        setAddedToHistory(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [manga, addedToHistory, addToHistory, isLoading, hasMounted]);

  const handleToggleFavorite = () => {
    if (!manga) return;
    
    if (isFavorite(manga.mal_id)) {
      removeFavorite(manga.mal_id);
    } else {
      addFavorite(manga as any); // Using 'as any' since favorites is designed for anime
    }
  };

  const handleToggleWatchlist = () => {
    if (!manga) return;
    
    if (isInWatchlist(manga.mal_id)) {
      removeFromWatchlist(manga.mal_id);
    } else {
      addToWatchlist(manga as any); // Using 'as any' since watchlist is designed for anime
    }
  };

  const handleRateManga = (score: number) => {
    if (!manga) return;
    rateAnime(manga.mal_id, score); // Using the same rating system for manga
  };

  const handleRemoveRating = () => {
    if (!manga) return;
    removeRating(manga.mal_id);
  };

  // Wait until client-side hydration is complete
  if (!hasMounted) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading manga details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg my-8">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          &#8592; Return to homepage
        </Link>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-6 py-4 rounded-lg my-8">
        <h2 className="text-xl font-bold mb-2">Manga Not Found</h2>
        <p>We couldn't find the manga you're looking for.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          &#8592; Return to homepage
        </Link>
      </div>
    );
  }

  // Calculate current rating
  const currentRating = getAnimeRating(manga.mal_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Manga image */}
        <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={manga.images.jpg.large_image_url || manga.images.jpg.image_url || '/placeholder.png'}
              alt={manga.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              priority
              quality={90}
            />
          </div>
          
          {/* Actions */}
          <div className="flex flex-col space-y-4 mt-4">
            <div className="flex justify-between">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  isFavorite(manga.mal_id)
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isFavorite(manga.mal_id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isFavorite(manga.mal_id) ? 0 : 2}
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  {isFavorite(manga.mal_id) ? 'Favorited' : 'Add to Favorites'}
                </span>
              </button>
              
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                  isInWatchlist(manga.mal_id)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isInWatchlist(manga.mal_id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isInWatchlist(manga.mal_id) ? 0 : 2}
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    />
                  </svg>
                  {isInWatchlist(manga.mal_id) ? 'In Reading List' : 'Add to Reading List'}
                </span>
              </button>
            </div>
            
            {/* Rating */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Rate This Manga</h3>
              <RatingSelector
                initialRating={currentRating || 0}
                onRate={handleRateManga}
                onRemove={handleRemoveRating}
              />
            </div>
          </div>
        </div>
        
        {/* Manga details */}
        <div className="md:w-2/3 lg:w-3/4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{manga.title}</h1>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            {manga.score && (
              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{manga.score.toFixed(2)}</span>
              </div>
            )}
            
            <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
              {manga.status}
            </div>
            
            {/* Only show volumes if they're greater than 0 */}
            {manga.volumes > 0 && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                {manga.volumes} {manga.volumes === 1 ? 'Volume' : 'Volumes'}
              </div>
            )}
            
            {/* Only show chapters if they're greater than 0 */}
            {manga.chapters > 0 && (
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                {manga.chapters} {manga.chapters === 1 ? 'Chapter' : 'Chapters'}
              </div>
            )}
            
            {manga.published && (
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                {manga.published.string}
              </div>
            )}
          </div>
          
          {/* Genres */}
          {manga.genres && manga.genres.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {manga.genres.map(genre => (
                  <Link 
                    key={genre.mal_id} 
                    href={`/search?genre=${genre.mal_id}&type=manga`}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Synopsis */}
          {manga.synopsis && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {manga.synopsis}
              </p>
            </div>
          )}
          
          {/* Authors */}
          {manga.authors && manga.authors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Authors</h3>
              <div className="flex flex-wrap gap-2">
                {manga.authors.map(author => (
                  <div key={author.mal_id} className="text-gray-700 dark:text-gray-300">
                    {author.name} ({author.type})
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Serialization */}
          {manga.serialization && manga.serialization.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Serialization</h3>
              <div className="flex flex-wrap gap-2">
                {manga.serialization.map(serial => (
                  <div key={serial.mal_id} className="text-gray-700 dark:text-gray-300">
                    {serial.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 