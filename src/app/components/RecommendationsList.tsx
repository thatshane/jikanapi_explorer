'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RecommendationEntry } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';

interface RecommendationsListProps {
  recommendations: RecommendationEntry[];
  isLoading?: boolean;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <LoadingSpinner size="medium" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">No recommendations available.</p>
      </div>
    );
  }

  // Sort recommendations by votes (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.votes - a.votes);
  
  // Show at most 8 recommendations
  const limitedRecommendations = sortedRecommendations.slice(0, 8);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {limitedRecommendations.map((rec) => (
          <Link 
            href={`/anime/${rec.entry.mal_id}`} 
            key={rec.entry.mal_id}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow group"
          >
            <div className="relative h-40 w-full">
              <Image
                src={rec.entry.images.jpg.image_url || '/placeholder.png'}
                alt={rec.entry.title}
                fill
                className="object-cover rounded-t-lg"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-60 px-2 py-1 rounded-full text-xs">
                  {rec.votes} {rec.votes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm truncate" title={rec.entry.title}>
                {rec.entry.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>

      {recommendations.length > 8 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing top 8 of {recommendations.length} recommendations
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList; 