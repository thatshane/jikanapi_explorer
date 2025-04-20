'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RelatedAnime } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';

interface RelatedAnimeListProps {
  relatedAnime: RelatedAnime[];
  isLoading?: boolean;
}

const RelatedAnimeList: React.FC<RelatedAnimeListProps> = ({ relatedAnime, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <LoadingSpinner size="medium" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading related anime...</p>
      </div>
    );
  }

  if (relatedAnime.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">No related anime available.</p>
      </div>
    );
  }

  // Helper function to get a readable relation type
  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case 'Sequel':
        return 'Sequels';
      case 'Prequel':
        return 'Prequels';
      case 'Side story':
        return 'Side Stories';
      case 'Spin-off':
        return 'Spin-offs';
      case 'Alternative setting':
        return 'Alternative Settings';
      case 'Alternative version':
        return 'Alternative Versions';
      case 'Summary':
        return 'Summaries';
      case 'Parent story':
        return 'Parent Stories';
      default:
        return relation;
    }
  };

  // Only show anime entries (filter out manga etc.)
  const animeRelations = relatedAnime.filter(rel => 
    rel.entry.some(entry => entry.type === 'anime' || entry.type === 'TV' || entry.type === 'Movie' || entry.type === 'OVA')
  );
  
  if (animeRelations.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">No related anime available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {animeRelations.map((relation) => (
        <div key={relation.relation} className="space-y-2">
          <h3 className="text-lg font-semibold">{getRelationLabel(relation.relation)}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relation.entry
              .filter(entry => entry.type === 'anime' || entry.type === 'TV' || entry.type === 'Movie' || entry.type === 'OVA')
              .map((entry) => (
                <Link 
                  href={`/anime/${entry.mal_id}`} 
                  key={entry.mal_id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={entry.images.jpg.image_url || '/placeholder.png'}
                      alt={entry.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      quality={85}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate" title={entry.title}>
                      {entry.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.type}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedAnimeList; 