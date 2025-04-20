'use client';

import { useState, useEffect } from 'react';
import { animeService, type Season } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';

interface SeasonSelectorProps {
  onSelectSeason: (year: number, season: string) => void;
  selectedYear?: number;
  selectedSeason?: string;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  onSelectSeason,
  selectedYear,
  selectedSeason
}) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Static array of season names for ordering purposes
  const seasonOrder = ['winter', 'spring', 'summer', 'fall'];

  useEffect(() => {
    const fetchSeasons = async () => {
      setIsLoading(true);
      try {
        const response = await animeService.getSeasons();
        // Sort the seasons data by year (newest first)
        const sortedSeasons = [...response.data].sort((a, b) => b.year - a.year);
        setSeasons(sortedSeasons);
      } catch (err) {
        console.error('Error fetching seasons:', err);
        setError('Failed to load seasons data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="small" />;
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Browse by season:</h3>
      
      <div className="flex flex-wrap gap-4">
        {seasons.slice(0, 3).map((yearData) => (
          <div key={yearData.year} className="mb-4">
            <h4 className="text-sm font-medium mb-2">{yearData.year}</h4>
            <div className="flex flex-wrap gap-2">
              {seasonOrder.map((season) => {
                if (yearData.seasons.includes(season)) {
                  return (
                    <button
                      key={`${yearData.year}-${season}`}
                      onClick={() => onSelectSeason(yearData.year, season)}
                      className={`px-3 py-1 text-sm capitalize rounded-full transition-colors ${
                        selectedYear === yearData.year && selectedSeason === season
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
                      }`}
                    >
                      {season}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => {
          // Get current date for current season
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth();
          
          // Determine current season based on month
          let season: string;
          if (month >= 0 && month < 3) season = 'winter';
          else if (month >= 3 && month < 6) season = 'spring';
          else if (month >= 6 && month < 9) season = 'summer';
          else season = 'fall';
          
          onSelectSeason(year, season);
        }}
        className="mt-2 text-blue-600 text-sm hover:underline"
      >
        Current Season
      </button>
    </div>
  );
};

export default SeasonSelector; 