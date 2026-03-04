"use client";

import { useMemo, useState, useEffect } from "react";
import { CatalogItem, sampleCatalog } from "@/lib/mock-catalog";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

type WatchStatus = "plan-to-watch" | "watching" | "watched";

type ListItem = CatalogItem & {
  status: WatchStatus;
};

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan-to-watch", label: "Plan to watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

export default function MoviesPage() {
  const { data: session, isPending } = authClient.useSession();
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<ListItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in?callbackURL=/movies");
    }
  }, [session, isPending, router]);

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

  if (isPending || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr] px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Movies & TV</h1>
        <p className="mt-2 text-slate-600">
          Search titles and add what you are currently consuming.
        </p>

        <div className="mt-6">
          <Input
            label="Search sample catalog"
            id="media-search"
            type="text"
            sizeVariant="lg"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: drama, Dune, TV show..."
          />
        </div>

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
                  <Button
                    size="md"
                    onClick={() => addToList(item)}
                    disabled={isInMyList}
                    className="w-auto px-6"
                  >
                    {isInMyList ? "Added" : "Add to My List"}
                  </Button>
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

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm self-start">
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
                <div className="mt-2">
                  <Select
                    label="Status"
                    sizeVariant="sm"
                    value={item.status}
                    onChange={(event) => updateStatus(item.id, event.target.value as WatchStatus)}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
