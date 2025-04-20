'use client';

import { useEffect, useState } from 'react';
import { animeService, type Anime, type Manga } from './services/animeService';
import AnimeGrid from './components/AnimeGrid';
import MangaGrid from './components/MangaGrid';
import LoadingSpinner from './components/LoadingSpinner';
import Pagination from './components/Pagination';
import GenreFilter from './components/GenreFilter';
import SeasonSelector from './components/SeasonSelector';
import useFavorites from './hooks/useFavorites';
import useWatchlist from './hooks/useWatchlist';
import FeaturedAnime from './components/FeaturedAnime';
import CategoryNav from './components/CategoryNav';
import TrendingAnime from './components/TrendingAnime';
import TabNavigation, { TabType } from './components/TabNavigation';

export default function Home() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('anime');
  
  // State for component loading statuses
  const [featuredLoaded, setFeaturedLoaded] = useState<boolean>(false);
  const [trendingLoaded, setTrendingLoaded] = useState<boolean>(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);
  
  // Main content states - Anime
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState<boolean>(true);
  const [currentAnimeGenreId, setCurrentAnimeGenreId] = useState<number | null>(null);
  const [currentAnimePage, setCurrentAnimePage] = useState<number>(1);
  const [totalAnimePages, setTotalAnimePages] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  
  // Main content states - Manga
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [isLoadingManga, setIsLoadingManga] = useState<boolean>(true);
  const [currentMangaGenreId, setCurrentMangaGenreId] = useState<number | null>(null);
  const [currentMangaPage, setCurrentMangaPage] = useState<number>(1);
  const [totalMangaPages, setTotalMangaPages] = useState<number>(1);
  
  // Shared states
  const [error, setError] = useState<string | null>(null);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [hasMounted, setHasMounted] = useState(false);

  // Fix for hydration issues with localStorage
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Staggered loading of components
  useEffect(() => {
    // Stage 1: Load the featured anime first (highest priority)
    const loadInitialContent = async () => {
      // Simply mark as loaded since FeaturedAnime loads data itself
      setFeaturedLoaded(true);
    };

    // Stage 2: Load categories and trending (medium priority)
    const loadSecondaryContent = async () => {
      setTimeout(() => {
        // Mark categories loaded
        setCategoriesLoaded(true);
        
        // After a short delay, mark trending as loaded
        setTimeout(() => {
          setTrendingLoaded(true);
        }, 500);
      }, 500);
    };

    if (hasMounted) {
      loadInitialContent();
      loadSecondaryContent();
    }
  }, [hasMounted]);

  // Load anime content
  useEffect(() => {
    // Only start fetching main content after higher priority content is loaded
    if (!hasMounted || !featuredLoaded || activeTab !== 'anime') {
      return;
    }

    const fetchAnime = async () => {
      setIsLoadingAnime(true);
      setError(null);
      try {
        let response;

        if (selectedYear && selectedSeason) {
          // Fetch seasonal anime
          response = await animeService.getSeasonalAnime(selectedYear, selectedSeason);
        } else if (currentAnimeGenreId) {
          // Fetch anime by genre
          response = await animeService.getAnimeByGenre(currentAnimeGenreId, currentAnimePage);
        } else {
          // Fetch popular anime
          response = await animeService.getPopularAnime(currentAnimePage);
        }

        if (response && response.data) {
          setPopularAnime(response.data);
          if (response.pagination && response.pagination.last_visible_page) {
            setTotalAnimePages(response.pagination.last_visible_page);
          } else {
            setTotalAnimePages(1);
          }
        } else {
          setPopularAnime([]);
          setError('No data received from API. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setPopularAnime([]);
        setError('Failed to fetch anime data. Please try again later.');
      } finally {
        setIsLoadingAnime(false);
      }
    };

    fetchAnime();
  }, [currentAnimePage, currentAnimeGenreId, selectedYear, selectedSeason, hasMounted, featuredLoaded, activeTab]);

  // Load manga content
  useEffect(() => {
    // Only fetch manga content when manga tab is active
    if (!hasMounted || activeTab !== 'manga') {
      return;
    }

    const fetchManga = async () => {
      setIsLoadingManga(true);
      setError(null);
      try {
        let response;

        if (currentMangaGenreId) {
          // Fetch manga by genre
          response = await animeService.getMangaByGenre(currentMangaGenreId, currentMangaPage);
        } else {
          // Fetch popular manga
          response = await animeService.getPopularManga(currentMangaPage);
        }

        if (response && response.data) {
          setPopularManga(response.data);
          if (response.pagination && response.pagination.last_visible_page) {
            setTotalMangaPages(response.pagination.last_visible_page);
          } else {
            setTotalMangaPages(1);
          }
        } else {
          setPopularManga([]);
          setError('No data received from API. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching manga data:', err);
        setPopularManga([]);
        setError('Failed to fetch manga data. Please try again later.');
      } finally {
        setIsLoadingManga(false);
      }
    };

    fetchManga();
  }, [currentMangaPage, currentMangaGenreId, hasMounted, activeTab]);

  // Handle anime pagination
  const handleAnimePageChange = (page: number) => {
    setCurrentAnimePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle manga pagination
  const handleMangaPageChange = (page: number) => {
    setCurrentMangaPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle genre selection based on active tab
  const handleGenreSelect = (genreId: number | null) => {
    if (activeTab === 'anime') {
      setCurrentAnimeGenreId(genreId);
      setCurrentAnimePage(1);
      // Reset season filter when selecting a genre
      setSelectedYear(null);
      setSelectedSeason(null);
    } else {
      setCurrentMangaGenreId(genreId);
      setCurrentMangaPage(1);
    }
  };

  const handleSeasonSelect = (year: number, season: string) => {
    if (activeTab === 'anime') {
      setSelectedYear(year);
      setSelectedSeason(season);
      // Reset genre filter and page when selecting a season
      setCurrentAnimeGenreId(null);
      setCurrentAnimePage(1);
    }
  };

  const toggleFavorite = (item: Anime | Manga) => {
    if (isFavorite(item.mal_id)) {
      removeFavorite(item.mal_id);
    } else {
      addFavorite(item as any); // Using existing hooks
    }
  };

  const toggleWatchlist = (item: Anime | Manga) => {
    if (isInWatchlist(item.mal_id)) {
      removeFromWatchlist(item.mal_id);
    } else {
      addToWatchlist(item as any); // Using existing hooks
    }
  };

  // Wait until client-side hydration is complete to avoid hydration mismatch with favorites
  if (!hasMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Determine current state based on active tab
  const isLoading = activeTab === 'anime' ? isLoadingAnime : isLoadingManga;
  const currentPage = activeTab === 'anime' ? currentAnimePage : currentMangaPage;
  const totalPages = activeTab === 'anime' ? totalAnimePages : totalMangaPages;
  const handlePageChange = activeTab === 'anime' ? handleAnimePageChange : handleMangaPageChange;
  const currentGenreId = activeTab === 'anime' ? currentAnimeGenreId : currentMangaGenreId;

  // Content heading
  let contentHeading = 'Popular Anime';
  if (activeTab === 'manga') {
    contentHeading = currentGenreId ? 'Manga by Genre' : 'Popular Manga';
  } else {
    contentHeading = currentGenreId 
      ? 'Anime by Genre' 
      : (selectedSeason 
          ? `${selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} ${selectedYear} Anime` 
          : 'Popular Anime');
  }

  return (
    <div className="space-y-8">
      {/* Featured Anime Hero Section - Load first */}
      {featuredLoaded && (
        <FeaturedAnime 
          onToggleFavorite={toggleFavorite}
          onToggleWatchlist={toggleWatchlist}
          isFavorite={isFavorite}
          isInWatchlist={isInWatchlist}
        />
      )}
      
      {/* Quick Navigation - Load second */}
      {categoriesLoaded && <CategoryNav />}
      
      {/* Trending Anime - Load third */}
      {trendingLoaded && (
        <TrendingAnime 
          onToggleFavorite={toggleFavorite}
          onToggleWatchlist={toggleWatchlist}
          isFavorite={isFavorite}
          isInWatchlist={isInWatchlist}
        />
      )}
      
      {/* Main Content with Tabs */}
      <div className="mt-12">
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab)} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              <GenreFilter 
                onGenreSelect={handleGenreSelect} 
                selectedGenreId={currentGenreId} 
              />
              {activeTab === 'anime' && (
                <SeasonSelector 
                  onSelectSeason={handleSeasonSelect} 
                  selectedYear={selectedYear || undefined} 
                  selectedSeason={selectedSeason || undefined} 
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {contentHeading}
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <LoadingSpinner size="large" />
            ) : (
              <>
                {activeTab === 'anime' ? (
                  <AnimeGrid 
                    animeList={popularAnime || []} 
                    isLoading={isLoadingAnime}
                    favoriteAnimes={favorites ? favorites.map(item => item.mal_id) : []}
                    watchlistAnimes={popularAnime.filter(anime => isInWatchlist(anime.mal_id)).map(anime => anime.mal_id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleWatchlist={toggleWatchlist}
                  />
                ) : (
                  <MangaGrid 
                    mangaList={popularManga || []} 
                    isLoading={isLoadingManga}
                    favoriteIds={favorites ? favorites.map(item => item.mal_id) : []}
                    watchlistIds={popularManga.filter(manga => isInWatchlist(manga.mal_id)).map(manga => manga.mal_id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleWatchlist={toggleWatchlist}
                  />
                )}
                
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
