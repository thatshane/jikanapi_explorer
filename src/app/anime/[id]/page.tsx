'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { animeService, type AnimeDetails, type Character, type RelatedAnime, type RecommendationEntry, type Anime } from '../../services/animeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FavoriteButton from '../../components/FavoriteButton';
import CharactersList from '../../components/CharactersList';
import RelatedAnimeList from '../../components/RelatedAnimeList';
import RecommendationsList from '../../components/RecommendationsList';
import useFavorites from '../../hooks/useFavorites';
import useHistory from '../../hooks/useHistory';
import useWatchlist from '../../hooks/useWatchlist';
import WatchlistButton from '../../components/WatchlistButton';
import useRatings from '../../hooks/useRatings';
import RatingSelector from '../../components/RatingSelector';

export default function AnimePage() {
  const { id } = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getAnimeRating, rateAnime, removeRating } = useRatings();
  const { addToHistory } = useHistory();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Additional data states
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relatedAnime, setRelatedAnime] = useState<RelatedAnime[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Tab state for additional content
  const [activeTab, setActiveTab] = useState<'characters' | 'related' | 'recommendations'>('characters');

  // Track if we've already added this anime to history
  const [addedToHistory, setAddedToHistory] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.getAnimeDetails(Number(id));
        setAnime(response.data);
        
        // We'll add to history after setting the anime state, not in this effect
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]); // Remove addToHistory dependency

  // Separate effect for adding to history to avoid the infinite loop
  useEffect(() => {
    // Only add to history once we have anime data, haven't added it yet, and we're not loading
    if (anime && !addedToHistory && !isLoading && hasMounted) {
      // Use a timeout to ensure this happens after the component has stabilized
      const timer = setTimeout(() => {
        addToHistory(anime);
        setAddedToHistory(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [anime, addedToHistory, addToHistory, isLoading, hasMounted]);

  // Fetch characters when needed
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!id || activeTab !== 'characters') return;
      
      setIsLoadingCharacters(true);
      try {
        const response = await animeService.getAnimeCharacters(Number(id));
        setCharacters(response.data);
      } catch (err) {
        console.error('Error fetching characters:', err);
      } finally {
        setIsLoadingCharacters(false);
      }
    };

    fetchCharacters();
  }, [id, activeTab]);

  // Fetch related anime when needed
  useEffect(() => {
    const fetchRelatedAnime = async () => {
      if (!id || activeTab !== 'related') return;
      
      setIsLoadingRelated(true);
      try {
        const response = await animeService.getRelatedAnime(Number(id));
        setRelatedAnime(response.data);
      } catch (err) {
        console.error('Error fetching related anime:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelatedAnime();
  }, [id, activeTab]);

  // Fetch recommendations when needed
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!id || activeTab !== 'recommendations') return;
      
      setIsLoadingRecommendations(true);
      try {
        const response = await animeService.getAnimeRecommendations(Number(id));
        setRecommendations(response.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [id, activeTab]);

  const handleToggleFavorite = () => {
    if (!anime) return;
    
    if (isFavorite(anime.mal_id)) {
      removeFavorite(anime.mal_id);
    } else {
      addFavorite(anime);
    }
  };

  const handleToggleWatchlist = () => {
    if (!anime) return;
    
    if (isInWatchlist(anime.mal_id)) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  const handleRateAnime = (score: number) => {
    if (!anime) return;
    rateAnime(anime.mal_id, score);
  };

  const handleRemoveRating = () => {
    if (!anime) return;
    removeRating(anime.mal_id);
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
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading anime details...</p>
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

  if (!anime) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Anime Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We couldn't find the anime you're looking for.
        </p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          &#8592; Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Anime Image */}
        <div className="w-full lg:w-1/3">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={anime.images.jpg.large_image_url || '/placeholder.png'}
              alt={anime.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Information</h3>
              <div className="flex space-x-2">
                <FavoriteButton
                  anime={anime}
                  isFavorite={isFavorite(anime.mal_id)}
                  onToggleFavorite={handleToggleFavorite}
                />
                <WatchlistButton
                  anime={anime}
                  isInWatchlist={isInWatchlist(anime.mal_id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium">{anime.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Episodes:</span>
                <span className="font-medium">{anime.episodes || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Aired:</span>
                <span className="font-medium">{anime.aired.string}</span>
              </div>
              {anime.rating && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span className="font-medium">{anime.rating}</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{anime.duration}</span>
                </div>
              )}
              {anime.source && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Source:</span>
                  <span className="font-medium">{anime.source}</span>
                </div>
              )}
            </div>

            {/* Add rating section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-2">Your Rating</h3>
              <RatingSelector 
                initialRating={getAnimeRating(anime.mal_id)}
                onRate={handleRateAnime}
                onRemove={handleRemoveRating}
                size="medium"
              />
            </div>
          </div>
        </div>

        {/* Anime Details */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center mb-2">
            <button 
              onClick={() => router.back()}
              className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
            >
              &#8592; Back
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
          
          {anime.score > 0 && (
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-xl font-bold">{anime.score.toFixed(1)}</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">from MyAnimeList</span>
            </div>
          )}

          {/* Genre Tags */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre) => (
                <span
                  key={genre.mal_id}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-3 py-1 rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Studios */}
          {anime.studios && anime.studios.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Studios:</h3>
              <div className="mt-1">
                {anime.studios.map((studio, index) => (
                  <span key={studio.mal_id}>
                    {studio.name}
                    {index < anime.studios.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Synopsis</h3>
            <p className="leading-relaxed text-gray-800 dark:text-gray-200">
              {anime.synopsis || 'No synopsis available.'}
            </p>
          </div>

          {/* Trailer */}
          {anime.trailer && anime.trailer.embed_url && (
            <div className="mt-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Trailer</h3>
              <div className="aspect-video w-full">
                <iframe
                  src={anime.trailer.embed_url}
                  title={`${anime.title} trailer`}
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation for Additional Content */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'characters'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Characters
          </button>
          <button
            onClick={() => setActiveTab('related')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'related'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Related Anime
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Recommendations
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-10">
        {activeTab === 'characters' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Characters</h2>
            <CharactersList characters={characters} isLoading={isLoadingCharacters} />
          </div>
        )}

        {activeTab === 'related' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Related Anime</h2>
            <RelatedAnimeList relatedAnime={relatedAnime} isLoading={isLoadingRelated} />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
            <RecommendationsList recommendations={recommendations} isLoading={isLoadingRecommendations} />
          </div>
        )}
      </div>
    </div>
  );
} 