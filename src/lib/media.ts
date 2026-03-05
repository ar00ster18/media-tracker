const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ExternalRating {
  source: string;
  value: string;
}

export interface OMDBMovie {
  Ratings: Array<{ Source: string; Value: string }>;
  imdbRating: string;
  imdbID: string;
}

const getTMDBToken = () => {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    throw new Error("TMDB_TOKEN environment variable is not set");
  }
  return token;
};

const getOMDBToken = () => {
  const token = process.env.OMDB_TOKEN;
  if (!token) {
    throw new Error("OMDB_TOKEN environment variable is not set");
  }
  return token;
};

export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const token = getTMDBToken();
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchOMDB<T>(params: Record<string, string> = {}): Promise<T> {
  const token = getOMDBToken();
  const url = new URL(OMDB_BASE_URL);
  
  url.searchParams.append("apikey", token);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`OMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getPopularMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/popular", {
    page: page.toString(),
  });
}

export async function searchMovies(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/search/movie", {
    query,
    page: page.toString(),
  });
}

export async function getPopularTVShows(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/popular", {
    page: page.toString(),
  });
}

export async function searchTVShows(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/search/tv", {
    query,
    page: page.toString(),
  });
}

export async function getMovieExternalIds(id: number) {
  return fetchTMDB<{ imdb_id: string }> (`/movie/${id}/external_ids`);
}

export async function getTVExternalIds(id: number) {
  return fetchTMDB<{ imdb_id: string }> (`/tv/${id}/external_ids`);
}

export async function getMediaExternalRatings(id: number, type: "movie" | "tv"): Promise<ExternalRating[]> {
  const ratings: ExternalRating[] = [];
  
  try {
    // 1. Get TMDB Rating
    const tmdbData = await fetchTMDB<{ vote_average: number }>(`/${type}/${id}`);
    ratings.push({ source: "TMDB", value: tmdbData.vote_average.toFixed(1) });

    // 2. Get External IDs to find IMDB ID
    const externalIds = type === "movie" 
      ? await getMovieExternalIds(id) 
      : await getTVExternalIds(id);

    if (externalIds.imdb_id) {
      // 3. Get OMDB Ratings using IMDB ID
      const omdbData = await fetchOMDB<OMDBMovie>({ i: externalIds.imdb_id });
      
      if (omdbData.imdbRating && omdbData.imdbRating !== "N/A") {
        ratings.push({ source: "IMDB", value: omdbData.imdbRating });
      }

      const rtRating = omdbData.Ratings?.find(r => r.Source === "Rotten Tomatoes");
      if (rtRating) {
        ratings.push({ source: "Rotten Tomatoes", value: rtRating.Value });
      }
    }
  } catch (error) {
    console.error(`Error fetching external ratings for ${type} ${id}:`, error);
  }

  return ratings;
}

export function getTMDBImageUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
