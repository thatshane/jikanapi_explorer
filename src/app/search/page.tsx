'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { animeService, type Anime } from '../services/animeService';
import AnimeGrid from '../components/AnimeGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const searchAnime = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await animeService.searchAnime(query, page);
        setSearchResults(response.data);
        setTotalPages(response.pagination.last_visible_page);
      } catch (err) {
        console.error('Error searching anime:', err);
        setError('Failed to search anime. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    searchAnime();
  }, [query, page]);

  const handleSearch = (searchQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Search Anime</h1>
      
      <SearchBar onSearch={handleSearch} initialQuery={query} />
      
      {query && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            {isLoading ? 'Searching...' : `Search results for "${query}"`}
          </h2>
          {!isLoading && searchResults.length > 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              Found {searchResults.length} results {totalPages > 1 ? `(Page ${page} of ${totalPages})` : ''}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : (
        query && (
          <>
            <AnimeGrid animeList={searchResults} />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )
      )}

      {!query && !isLoading && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">Search for your favorite anime</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Enter a title in the search box above to discover anime.
          </p>
        </div>
      )}
    </div>
  );
} 