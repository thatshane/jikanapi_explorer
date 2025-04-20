'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { animeService, type Anime } from '../services/animeService';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';
import LoadingSpinner from './LoadingSpinner';
import useImagePreloader from '../hooks/useImagePreloader';
import FeaturedAnimeSkeleton from './FeaturedAnimeSkeleton';

interface FeaturedAnimeProps {
  onToggleFavorite: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
  isFavorite: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
}

// Default featured anime as fallback when API fails
const fallbackAnime: Anime = {
  mal_id: 1,
  title: "Anime Explorer",
  images: {
    jpg: {
      image_url: "/placeholder.png",
      large_image_url: "/placeholder.png"
    }
  },
  synopsis: "Welcome to Anime Explorer! Browse through our collection of anime series and movies.",
  score: 0,
  episodes: 0,
  status: "",
  aired: { 
    string: "" 
  },
  genres: []
};

const FeaturedAnime: React.FC<FeaturedAnimeProps> = ({
  onToggleFavorite,
  onToggleWatchlist,
  isFavorite = () => false,
  isInWatchlist = () => false
}) => {
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Extract image URL for preloading once we have featured anime
  const imageUrl = featuredAnime ? (
    featuredAnime.images.jpg.large_image_url || 
    (featuredAnime.images.webp && featuredAnime.images.webp.large_image_url) || 
    featuredAnime.images.jpg.image_url || 
    (featuredAnime.images.webp && featuredAnime.images.webp.image_url) || 
    '/placeholder.png'
  ) : null;
  
  // Preload the featured image
  const { imagesPreloaded } = useImagePreloader(imageUrl ? [imageUrl] : []);

  useEffect(() => {
    const fetchFeaturedAnime = async () => {
      try {
        setIsLoading(true);
        
        // First attempt with cached data
        let response = await animeService.getTopAnime(1, 'tv');
        
        // If we didn't get any data, try popular anime as fallback
        if (!response?.data?.length) {
          console.log('Top anime request returned empty data, trying popular anime');
          response = await animeService.getPopularAnime(1);
        }
        
        if (response?.data?.length > 0) {
          // Get a random anime from the results
          const randomIndex = Math.floor(Math.random() * Math.min(5, response.data.length));
          const selectedAnime = response.data[randomIndex];
          
          // Fetch full anime details
          if (selectedAnime && selectedAnime.mal_id) {
            try {
              const detailsResponse = await animeService.getAnimeDetails(selectedAnime.mal_id);
              if (detailsResponse?.data?.mal_id) {
                setFeaturedAnime(detailsResponse.data);
              } else {
                console.log('Using selected anime without full details');
                setFeaturedAnime(selectedAnime);
              }
            } catch (detailError) {
              console.error('Error fetching anime details:', detailError);
              setFeaturedAnime(selectedAnime);
            }
          } else {
            setFeaturedAnime(selectedAnime);
          }
        } else if (retryCount < 3) {
          // Retry up to 3 times with increasing delay
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`No anime data received, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          
          return; // Skip setting isLoading to false until retry completes
        } else {
          console.error('Unable to fetch featured anime after multiple attempts');
          setError('Could not load featured anime');
          // Use fallback anime
          setFeaturedAnime(fallbackAnime);
        }
      } catch (err) {
        console.error('Error fetching featured anime:', err);
        setError('Failed to load featured anime');
        // Use fallback anime
        setFeaturedAnime(fallbackAnime);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedAnime();
  }, [retryCount]);

  // We're not fully loaded until the featured anime data is loaded AND the image is preloaded
  const isFullyLoaded = !isLoading && (imagesPreloaded || !featuredAnime);

  if (!isFullyLoaded) {
    return (
      <FeaturedAnimeSkeleton 
        message={!isLoading && !imagesPreloaded ? "Loading high quality image..." : "Loading featured anime..."}
      />
    );
  }

  if (error && !featuredAnime) {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'No featured anime available at the moment.'}
        </p>
      </div>
    );
  }

  // If we still have no anime data, use the fallback
  const anime = featuredAnime || fallbackAnime;

  const {
    mal_id,
    title,
    images,
    synopsis,
    score
  } = anime;

  const truncatedSynopsis = synopsis && synopsis.length > 300 
    ? `${synopsis.substring(0, 300)}...` 
    : synopsis;

  // Make sure we have a valid image URL with highest resolution
  const displayImageUrl = (
    images?.jpg?.large_image_url || 
    (images?.webp && images.webp.large_image_url) || 
    images?.jpg?.image_url || 
    (images?.webp && images.webp.image_url) || 
    '/placeholder.png'
  );

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={displayImageUrl}
          alt={title}
          fill
          className="object-cover featured-anime-image"
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          placeholder="blur"
          blurDataURL={images?.jpg?.image_url || '/placeholder.png'}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 z-10 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>
        
        <div className="flex items-center mb-4">
          {score > 0 && (
            <div className="flex items-center mr-4">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 font-semibold text-white">{score.toFixed(1)}</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <FavoriteButton
              anime={anime}
              isFavorite={typeof isFavorite === 'function' ? isFavorite(mal_id) : false}
              onToggleFavorite={() => onToggleFavorite(anime)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            />
            <WatchlistButton
              anime={anime}
              isInWatchlist={typeof isInWatchlist === 'function' ? isInWatchlist(mal_id) : false}
              onToggleWatchlist={() => onToggleWatchlist(anime)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            />
          </div>
        </div>
        
        <p className="text-gray-200 mb-6 line-clamp-3">{truncatedSynopsis || 'No synopsis available.'}</p>
        
        {mal_id > 1 && (
          <Link
            href={`/anime/${mal_id}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default FeaturedAnime; 