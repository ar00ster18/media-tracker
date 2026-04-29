"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { MediaSearch, MediaItem } from "@/components/MediaSearch";
import { WatchlistAside, ListItem } from "@/components/WatchlistAside";

interface WatchLogItem {
  status: "plan-to-watch" | "watching" | "watched";
  rating: number | null;
  mediaItem: {
    id: number;
    title: string;
    type: string;
    posterPath: string | null;
    year: number | null;
    ratings?: Array<{ source: string; value: string }>;
  };
}

export default function TVShowsPage() {
  const { data: session } = authClient.useSession();
  const [myList, setMyList] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json() as WatchLogItem[];
        const formattedList: ListItem[] = data.map((log) => ({
          id: log.mediaItem.id,
          title: log.mediaItem.title,
          year: log.mediaItem.year || "N/A",
          type: log.mediaItem.type === "movie" ? "Movie" : "TV Show",
          poster_path: log.mediaItem.posterPath,
          status: log.status,
          userRating: log.rating || 0,
          ratings: log.mediaItem.ratings?.map((r) => ({ source: r.source, value: r.value }))
        }));
        setMyList(formattedList);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchWatchlist();
    }
  }, [session, fetchWatchlist]);

  const addToList = async (item: MediaItem) => {
    if (myList.some((currentItem) => currentItem.id === item.id)) return;

    const newItem: ListItem = { ...item, status: "plan-to-watch", userRating: 0 };
    setMyList((currentList) => [...currentList, newItem]);
    
    // Initial sync
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaItem: {
            id: newItem.id,
            title: newItem.title,
            type: newItem.type,
            poster_path: newItem.poster_path,
            year: newItem.year,
            ratings: newItem.ratings
          },
          status: newItem.status,
          rating: null
        })
      });
    } catch (error) {
      console.error("Failed to sync item:", error);
    }
  };

  const isInMyList = (id: number) => myList.some((item) => item.id === id);

  if (!session) return null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr] px-6">
      <MediaSearch 
        type="tv" 
        onAddToMyList={addToList} 
        isInMyList={isInMyList} 
      />

      <WatchlistAside 
        myList={myList} 
        setMyList={setMyList} 
        isInitialLoading={isInitialLoading} 
        type="TV Show"
      />
    </div>
  );
}
