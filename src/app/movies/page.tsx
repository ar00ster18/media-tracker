"use client";

import { useMemo, useState } from "react";

type CatalogItem = {
  id: number;
  title: string;
  year: number;
  type: "Movie" | "TV Show";
  genre: string;
};

const sampleCatalog: CatalogItem[] = [
  { id: 1, title: "Dune: Part Two", year: 2024, type: "Movie", genre: "Sci-Fi" },
  { id: 2, title: "The Bear", year: 2022, type: "TV Show", genre: "Drama" },
  {
    id: 3,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    type: "Movie",
    genre: "Animation",
  },
  { id: 4, title: "Severance", year: 2022, type: "TV Show", genre: "Thriller" },
  { id: 5, title: "Oppenheimer", year: 2023, type: "Movie", genre: "Drama" },
  { id: 6, title: "The Last of Us", year: 2023, type: "TV Show", genre: "Drama" },
  { id: 7, title: "Past Lives", year: 2023, type: "Movie", genre: "Romance" },
  { id: 8, title: "Shogun", year: 2024, type: "TV Show", genre: "Historical" },
];

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<CatalogItem[]>([]);

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

      return [...currentList, item];
    });
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

          <ul className="mt-6 grid gap-3">
            {filteredCatalog.map((item) => {
              const isInMyList = myList.some((listItem) => listItem.id === item.id);

              return (
                <li
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
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
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600">
                    {item.type} • {item.year}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
