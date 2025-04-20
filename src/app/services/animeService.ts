// Types for anime data
export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
    webp?: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  episodes: number;
  status: string;
  aired: {
    string: string;
  };
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
}

export interface Manga {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
    webp?: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  volumes: number;
  chapters: number;
  status: string;
  published: {
    string: string;
  };
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  authors: Array<{
    mal_id: number;
    name: string;
    type: string;
  }>;
}

export interface AnimeResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export interface MangaResponse {
  data: Manga[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export interface AnimeDetails extends Anime {
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  studios: Array<{
    mal_id: number;
    name: string;
  }>;
  duration: string;
  rating: string;
  source: string;
}

export interface AnimeDetailsResponse {
  data: AnimeDetails;
}

export interface Genre {
  mal_id: number;
  name: string;
}

export interface GenreResponse {
  data: Genre[];
}

export interface Season {
  year: number;
  seasons: string[];
}

export interface SeasonResponse {
  data: Season[];
}

export interface Character {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    name: string;
  };
  role: string;
  voice_actors: Array<{
    person: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
      name: string;
    };
    language: string;
  }>;
}

export interface CharactersResponse {
  data: Character[];
}

export interface RelatedAnime {
  relation: string;
  entry: Array<{
    mal_id: number;
    title: string;
    type: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  }>;
}

export interface RelatedAnimeResponse {
  data: RelatedAnime[];
}

export interface RecommendationEntry {
  entry: {
    mal_id: number;
    title: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  votes: number;
}

export interface RecommendationsResponse {
  data: RecommendationEntry[];
}

export interface MangaDetails extends Manga {
  favorites: number;
  serialization: Array<{
    mal_id: number;
    name: string;
  }>;
  type: string;
  popularity: number;
}

export interface MangaDetailsResponse {
  data: MangaDetails;
}

const BASE_URL = 'https://api.jikan.moe/v4';

// At the top of the file, after imports
import cacheService from './cacheService';
import requestQueue from '../components/RequestQueue';

// Set longer cache times for less frequently changing data
const CACHE_TIMES = {
  DETAILS: 24 * 60 * 60 * 1000, // 24 hours for anime details
  TOP: 6 * 60 * 60 * 1000,      // 6 hours for top anime
  SEARCH: 30 * 60 * 1000,       // 30 minutes for search results
  GENRES: 7 * 24 * 60 * 60 * 1000, // 7 days for genres (rarely change)
  SEASONS: 7 * 24 * 60 * 60 * 1000, // 7 days for seasons data
  CHARACTERS: 24 * 60 * 60 * 1000, // 24 hours for characters
  RELATED: 24 * 60 * 60 * 1000,   // 24 hours for related anime
  RECOMMENDATIONS: 24 * 60 * 60 * 1000, // 24 hours for recommendations
  DEFAULT: 60 * 60 * 1000        // 1 hour default
};

export const animeService = {
  // Get popular anime with pagination
  getPopularAnime: async (page: number = 1): Promise<AnimeResponse> => {
    const cacheKey = `popular_anime_${page}`;
    
    // Check if we have cached data
    const cachedData = cacheService.get<AnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    // No cache, need to fetch data through the queue
    return requestQueue.enqueue(`popular_anime_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime?page=${page}&limit=24&order_by=popularity&sort=asc`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        
        // Store result in cache
        cacheService.set(cacheKey, data, CACHE_TIMES.DEFAULT);
        
        return data;
      } catch (error) {
        console.error('Error in getPopularAnime:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Search anime by query
  searchAnime: async (query: string, page: number = 1): Promise<AnimeResponse> => {
    const cacheKey = `search_anime_${query}_${page}`;
    
    const cachedData = cacheService.get<AnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`search_anime_${query}_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime?q=${query}&page=${page}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.SEARCH);
        
        return data;
      } catch (error) {
        console.error('Error in searchAnime:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get detailed information about a specific anime
  getAnimeDetails: async (id: number): Promise<AnimeDetailsResponse> => {
    const cacheKey = `anime_details_${id}`;
    
    const cachedData = cacheService.get<AnimeDetailsResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`anime_details_${id}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime/${id}/full`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: {} as AnimeDetails
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.DETAILS);
        
        return data;
      } catch (error) {
        console.error('Error in getAnimeDetails:', error);
        return {
          data: {} as AnimeDetails
        };
      }
    });
  },

  // Get all anime genres
  getGenres: async (): Promise<GenreResponse> => {
    const cacheKey = 'anime_genres';
    
    const cachedData = cacheService.get<GenreResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue('anime_genres', async () => {
      try {
        const response = await fetch(`${BASE_URL}/genres/anime`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: []
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.GENRES);
        
        return data;
      } catch (error) {
        console.error('Error in getGenres:', error);
        return {
          data: []
        };
      }
    });
  },

  // Get anime by genre
  getAnimeByGenre: async (genreId: number, page: number = 1): Promise<AnimeResponse> => {
    const cacheKey = `anime_by_genre_${genreId}_${page}`;
    
    const cachedData = cacheService.get<AnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`anime_by_genre_${genreId}_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime?genres=${genreId}&page=${page}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.DEFAULT);
        
        return data;
      } catch (error) {
        console.error('Error in getAnimeByGenre:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get seasonal anime
  getSeasonalAnime: async (year: number, season: string): Promise<AnimeResponse> => {
    const cacheKey = `seasonal_anime_${year}_${season}`;
    
    const cachedData = cacheService.get<AnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`seasonal_anime_${year}_${season}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/seasons/${year}/${season}`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.DEFAULT);
        
        return data;
      } catch (error) {
        console.error('Error in getSeasonalAnime:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get available seasons
  getSeasons: async (): Promise<SeasonResponse> => {
    const cacheKey = 'anime_seasons';
    
    const cachedData = cacheService.get<SeasonResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue('anime_seasons', async () => {
      try {
        const response = await fetch(`${BASE_URL}/seasons`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: []
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.SEASONS);
        
        return data;
      } catch (error) {
        console.error('Error in getSeasons:', error);
        return {
          data: []
        };
      }
    });
  },

  // Get characters for an anime
  getAnimeCharacters: async (animeId: number): Promise<CharactersResponse> => {
    const cacheKey = `anime_characters_${animeId}`;
    
    const cachedData = cacheService.get<CharactersResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`anime_characters_${animeId}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime/${animeId}/characters`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: []
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.CHARACTERS);
        
        return data;
      } catch (error) {
        console.error('Error in getAnimeCharacters:', error);
        return {
          data: []
        };
      }
    });
  },

  // Get related anime
  getRelatedAnime: async (animeId: number): Promise<RelatedAnimeResponse> => {
    const cacheKey = `related_anime_${animeId}`;
    
    const cachedData = cacheService.get<RelatedAnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`related_anime_${animeId}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime/${animeId}/relations`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: []
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.RELATED);
        
        return data;
      } catch (error) {
        console.error('Error in getRelatedAnime:', error);
        return {
          data: []
        };
      }
    });
  },

  // Get anime recommendations
  getAnimeRecommendations: async (animeId: number): Promise<RecommendationsResponse> => {
    const cacheKey = `anime_recommendations_${animeId}`;
    
    const cachedData = cacheService.get<RecommendationsResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`anime_recommendations_${animeId}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/anime/${animeId}/recommendations`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: []
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.RECOMMENDATIONS);
        
        return data;
      } catch (error) {
        console.error('Error in getAnimeRecommendations:', error);
        return {
          data: []
        };
      }
    });
  },

  // Get top anime
  getTopAnime: async (page: number = 1, type: string = 'tv'): Promise<AnimeResponse> => {
    const cacheKey = `top_anime_${type}_${page}`;
    
    const cachedData = cacheService.get<AnimeResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`top_anime_${type}_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/top/anime?page=${page}&type=${type}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return a valid empty response structure instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.TOP);
        return data;
      } catch (error) {
        console.error('Error in getTopAnime:', error);
        // Return a valid empty response structure instead of throwing
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get popular manga with pagination
  getPopularManga: async (page: number = 1): Promise<MangaResponse> => {
    const cacheKey = `popular_manga_${page}`;
    
    // Check if we have cached data
    const cachedData = cacheService.get<MangaResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    // No cache, need to fetch data through the queue
    return requestQueue.enqueue(`popular_manga_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/manga?page=${page}&limit=24&order_by=popularity&sort=asc`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        
        // Store result in cache
        cacheService.set(cacheKey, data, CACHE_TIMES.DEFAULT);
        
        return data;
      } catch (error) {
        console.error('Error in getPopularManga:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Search manga by query
  searchManga: async (query: string, page: number = 1): Promise<MangaResponse> => {
    const cacheKey = `search_manga_${query}_${page}`;
    
    const cachedData = cacheService.get<MangaResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`search_manga_${query}_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/manga?q=${query}&page=${page}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.SEARCH);
        
        return data;
      } catch (error) {
        console.error('Error in searchManga:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get detailed information about a specific manga
  getMangaDetails: async (id: number): Promise<MangaDetailsResponse> => {
    const cacheKey = `manga_details_${id}`;
    
    const cachedData = cacheService.get<MangaDetailsResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`manga_details_${id}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/manga/${id}/full`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: {} as MangaDetails
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.DETAILS);
        
        return data;
      } catch (error) {
        console.error('Error in getMangaDetails:', error);
        return {
          data: {} as MangaDetails
        };
      }
    });
  },

  // Get manga by genre
  getMangaByGenre: async (genreId: number, page: number = 1): Promise<MangaResponse> => {
    const cacheKey = `manga_by_genre_${genreId}_${page}`;
    
    const cachedData = cacheService.get<MangaResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`manga_by_genre_${genreId}_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/manga?genres=${genreId}&page=${page}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return empty data instead of throwing
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.DEFAULT);
        
        return data;
      } catch (error) {
        console.error('Error in getMangaByGenre:', error);
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  },

  // Get top manga
  getTopManga: async (page: number = 1): Promise<MangaResponse> => {
    const cacheKey = `top_manga_${page}`;
    
    const cachedData = cacheService.get<MangaResponse>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    return requestQueue.enqueue(`top_manga_${page}`, async () => {
      try {
        const response = await fetch(`${BASE_URL}/top/manga?page=${page}&limit=24`);
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Return a valid empty response structure
          return {
            data: [],
            pagination: {
              last_visible_page: 1,
              has_next_page: false
            }
          };
        }
        
        const data = await response.json();
        cacheService.set(cacheKey, data, CACHE_TIMES.TOP);
        return data;
      } catch (error) {
        console.error('Error in getTopManga:', error);
        // Return a valid empty response structure
        return {
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false
          }
        };
      }
    });
  }
}; 