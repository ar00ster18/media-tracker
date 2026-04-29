"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MediaItem } from "@/components/MediaSearch";

type WatchStatus = "plan-to-watch" | "watching" | "watched";

export type ListItem = MediaItem & {
  status: WatchStatus;
  userRating?: number;
};

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan-to-watch", label: "Plan to watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

const RATING_OPTIONS = [
  { value: "0", label: "No rating" },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  })),
];

interface WatchlistAsideProps {
  myList: ListItem[];
  setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>;
  isInitialLoading: boolean;
  type: "Movie" | "TV Show";
}

export function WatchlistAside({ myList, setMyList, isInitialLoading, type }: WatchlistAsideProps) {
  const syncWithDatabase = async (item: ListItem) => {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaItem: {
            id: item.id,
            title: item.title,
            type: item.type,
            poster_path: item.poster_path,
            year: item.year,
            ratings: item.ratings
          },
          status: item.status,
          rating: item.userRating && item.userRating > 0 ? item.userRating : null
        })
      });
    } catch (error) {
      console.error("Failed to sync item:", error);
    }
  };

  const updateStatus = async (itemId: number, status: WatchStatus) => {
    setMyList((currentList) => {
      const newList = currentList.map((item) => (item.id === itemId ? { ...item, status } : item));
      const updatedItem = newList.find(i => i.id === itemId);
      if (updatedItem) syncWithDatabase(updatedItem);
      return newList;
    });
  };

  const updateUserRating = async (itemId: number, rating: number) => {
    setMyList((currentList) => {
      const newList = currentList.map((item) => (item.id === itemId ? { ...item, userRating: rating } : item));
      const updatedItem = newList.find(i => i.id === itemId);
      if (updatedItem) syncWithDatabase(updatedItem);
      return newList;
    });
  };

  const removeFromList = async (itemId: number) => {
    setMyList((currentList) => currentList.filter((item) => item.id !== itemId));
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: itemId })
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm self-start">
      <h2 className="text-xl font-semibold text-slate-900">My List</h2>
      <p className="mt-1 text-sm text-slate-600">
        {myList.length} {myList.length === 1 ? "title" : "titles"} added
      </p>

      {isInitialLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      ) : myList.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Your list is empty. Add a {type.toLowerCase()} from the catalog.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {myList.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-600">
                    {item.type} • {item.year}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromList(item.id)}
                  className="px-2 py-1 text-[10px] w-auto h-auto leading-none min-h-0"
                >
                  Remove
                </Button>
              </div>
              <div className="mt-3 grid gap-2">
                <Select
                  label="Status"
                  sizeVariant="sm"
                  value={item.status}
                  onChange={(event) => updateStatus(item.id, event.target.value as WatchStatus)}
                  options={STATUS_OPTIONS}
                />
                <Select
                  label="Your Rating"
                  sizeVariant="sm"
                  value={item.userRating?.toString() || "0"}
                  onChange={(event) => updateUserRating(item.id, parseInt(event.target.value, 10))}
                  options={RATING_OPTIONS}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
