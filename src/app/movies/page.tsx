"use client";

import { useMemo, useState } from "react";

type CatalogItem = {
  id: number;
  title: string;
  year: number;
  type: "Movie" | "TV Show";
  genre: string;
};

type WatchStatus = "plan-to-watch" | "watching" | "watched";

type ListItem = CatalogItem & {
  status: WatchStatus;
};

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan-to-watch", label: "Plan to watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

const ADJECTIVES = [
  "Silent",
  "Neon",
  "Hidden",
  "Broken",
  "Golden",
  "Crimson",
  "Last",
  "Lost",
  "Midnight",
  "Electric",
];

const NOUNS = [
  "Empire",
  "Signal",
  "Voyage",
  "Heist",
  "Garden",
  "Frontier",
  "Legend",
  "Protocol",
  "Echo",
  "Shadow",
];

const SUFFIXES = [
  "Rising",
  "Returns",
  "Chronicles",
  "Reborn",
  "Files",
  "Awakening",
  "Legacy",
  "Fall",
  "Code",
  "Origins",
];

const GENRES = [
  "Drama",
  "Sci-Fi",
  "Thriller",
  "Comedy",
  "Fantasy",
  "Romance",
  "Action",
  "Mystery",
  "Animation",
  "Historical",
];

const createMockCatalog = (count: number): CatalogItem[] => {
  const items: CatalogItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const id = index + 1;
    const type: CatalogItem["type"] = index % 2 === 0 ? "Movie" : "TV Show";
    const adjective = ADJECTIVES[index % ADJECTIVES.length];
    const noun = NOUNS[Math.floor(index / ADJECTIVES.length) % NOUNS.length];
    const suffix = SUFFIXES[Math.floor(index / (ADJECTIVES.length * NOUNS.length)) % SUFFIXES.length];
    const genre = GENRES[index % GENRES.length];
    const year = 1980 + (index % 47);
    const title = `${adjective} ${noun}: ${suffix} ${Math.floor(index / 100) + 1}`;

    items.push({ id, title, year, type, genre });
  }

  return items;
};

const sampleCatalog: CatalogItem[] = createMockCatalog(1000);

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<ListItem[]>([]);

  const filteredCatalog = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sampleCatalog;
    }

    return sampleCatalog.filter((item) =>
      `${item.title} ${item.type} ${item.genre}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const addToList = (item: CatalogItem) => {
    setMyList((currentList) => {
      if (currentList.some((currentItem) => currentItem.id === item.id)) {
        return currentList;
      }

      return [...currentList, { ...item, status: "plan-to-watch" }];
    });
  };

  const updateStatus = (itemId: number, status: WatchStatus) => {
    setMyList((currentList) =>
      currentList.map((item) => (item.id === itemId ? { ...item, status } : item)),
    );
  };

  const removeFromList = (itemId: number) => {
    setMyList((currentList) => currentList.filter((item) => item.id !== itemId));
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Movies & TV</h1>
          <p className="mt-2 text-slate-600">
            Search titles and add what you are currently consuming.
          </p>

          <label htmlFor="media-search" className="mt-6 block text-sm font-medium text-slate-700">
            Search sample catalog
          </label>
          <input
            id="media-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: drama, Dune, TV show..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-slate-900/20 transition focus:ring"
          />

          <div className="mt-6 max-h-[34rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <ul className="grid gap-3">
              {filteredCatalog.map((item) => {
                const isInMyList = myList.some((listItem) => listItem.id === item.id);

                return (
                  <li
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                      <p className="text-sm text-slate-600">
                        {item.type} • {item.year} • {item.genre}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToList(item)}
                      disabled={isInMyList}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isInMyList ? "Added" : "Add to My List"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {filteredCatalog.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No matches found for your search.
            </p>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">My List</h2>
          <p className="mt-1 text-sm text-slate-600">
            {myList.length} {myList.length === 1 ? "title" : "titles"} added
          </p>

          {myList.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Your list is empty. Add a movie or TV show from the catalog.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myList.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600">
                        {item.type} • {item.year}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromList(item.id)}
                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>
                  <select
                    value={item.status}
                    onChange={(event) => updateStatus(item.id, event.target.value as WatchStatus)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none ring-slate-900/20 transition focus:ring"
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
