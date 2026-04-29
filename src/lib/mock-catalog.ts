export type CatalogItem = {
  id: number;
  title: string;
  year: number;
  type: "Movie" | "TV Show";
  genre: string;
};

const ADJECTIVES = [
  "Silent", "Neon", "Hidden", "Broken", "Golden", "Crimson", "Last", "Lost", "Midnight", "Electric",
];

const NOUNS = [
  "Empire", "Signal", "Voyage", "Heist", "Garden", "Frontier", "Legend", "Protocol", "Echo", "Shadow",
];

const SUFFIXES = [
  "Rising", "Returns", "Chronicles", "Reborn", "Files", "Awakening", "Legacy", "Fall", "Code", "Origins",
];

const GENRES = [
  "Drama", "Sci-Fi", "Thriller", "Comedy", "Fantasy", "Romance", "Action", "Mystery", "Animation", "Historical",
];

export const createMockCatalog = (count: number): CatalogItem[] => {
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

export const sampleCatalog: CatalogItem[] = createMockCatalog(1000);
