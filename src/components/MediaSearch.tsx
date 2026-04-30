"use client";

import { useEffect, useState, useCallback } from "react";
import { TMDBMovie, TMDBTVShow, TMDBResponse, getTMDBImageUrl, ExternalRating } from "@/lib/media";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";

type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  title: string;
  year: number | string;
  type: "Movie" | "TV Show";
  poster_path: string | null;
  ratings?: ExternalRating[];
}

interface MediaSearchProps {
  type: MediaType;
  onAddToMyList: (item: MediaItem) => void;
  isInMyList: (id: number) => boolean;
}

export function MediaSearch({ type, onAddToMyList, isInMyList }: MediaSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRatings = useCallback((items: MediaItem[]) => {
    items.forEach(async (item) => {
      try {
        const params = new URLSearchParams({ action: "ratings", type, id: item.id.toString() });
        const res = await fetch(`/api/media?${params}`);
        if (res.ok) {
          const ratings = await res.json() as ExternalRating[];
          setResults(prev => prev.map(p => p.id === item.id ? { ...p, ratings } : p));
        }
      } catch (err) {
        console.error("Failed to fetch ratings for", item.title, err);
      }
    });
  }, [type]);

  const fetchMedia = useCallback(async (searchQuery: string, pageNum: number, append: boolean) => {
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type, page: pageNum.toString() });
      if (searchQuery) params.set("query", searchQuery);

      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      let newItems: MediaItem[] = [];
      if (type === "movie") {
        const data = await response.json() as TMDBResponse<TMDBMovie>;
        setTotalPages(data.total_pages);
        newItems = data.results.map(item => ({
          id: item.id,
          title: item.title,
          year: item.release_date ? new Date(item.release_date).getFullYear() : "N/A",
          type: "Movie" as const,
          poster_path: item.poster_path,
        }));
      } else {
        const data = await response.json() as TMDBResponse<TMDBTVShow>;
        setTotalPages(data.total_pages);
        newItems = data.results.map(item => ({
          id: item.id,
          title: item.name,
          year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : "N/A",
          type: "TV Show" as const,
          poster_path: item.poster_path,
        }));
      }

      setResults(prev => append ? [...prev, ...newItems] : newItems);
      fetchRatings(newItems);
    } catch (err) {
      setError("An error occurred while fetching media.");
      console.error(err);
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }, [type, fetchRatings]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchMedia(query, 1, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchMedia]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(query, nextPage, true);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900 capitalize">
        {type === "movie" ? "Movies" : "TV Shows"}
      </h1>
      <p className="mt-2 text-slate-600">
        Search {type === "movie" ? "movies" : "TV shows"} and add what you are currently consuming.
      </p>

      <div className="mt-6">
        <Input
          label={`Search ${type === "movie" ? "movies" : "TV shows"}`}
          id="media-search"
          type="text"
          sizeVariant="lg"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={type === "movie" ? "Try: Inception, Dune..." : "Try: Breaking Bad, Succession..."}
        />
      </div>

      <div className="mt-6 max-h-[34rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : (
          <ul className="grid gap-3">
            {results.map((item) => {
              const { id, title, year, poster_path, type: itemType, ratings } = item;
              const posterUrl = getTMDBImageUrl(poster_path, "w154");
              const added = isInMyList(id);

              return (
                <li
                  key={id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    {posterUrl ? (
                      <Image 
                        src={posterUrl} 
                        alt={title} 
                        width={56}
                        height={80}
                        className="h-20 w-14 rounded-md object-cover shadow-sm"
                      />
                    ) : (
                      <div className="h-20 w-14 rounded-md bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                        No Image
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                      <p className="text-sm text-slate-600">
                        {year} • {itemType}
                      </p>
                      {ratings && ratings.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {ratings.map(r => (
                            <span key={r.source} className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                              {r.source}: {r.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="md"
                    onClick={() => onAddToMyList(item)}
                    disabled={added}
                    className="w-auto px-6"
                  >
                    {added ? "Added" : "Add to My List"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isLoading && results.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No matches found for your search.
        </p>
      )}

      {!isLoading && results.length > 0 && page < totalPages && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Spinner className="h-4 w-4" /> : "Load more"}
          </Button>
        </div>
      )}
    </section>
  );
}
