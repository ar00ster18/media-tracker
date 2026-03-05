import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import TVShowsPage from "./page";
import { authClient } from "@/lib/auth-client";
import { MediaItem } from "@/components/MediaSearch";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

interface MediaSearchProps {
  onAddToMyList: (item: MediaItem) => void;
}

// Mock MediaSearch to avoid actual fetching
vi.mock("@/components/MediaSearch", () => ({
  MediaSearch: ({ onAddToMyList }: MediaSearchProps) => (
    <div>
      <button onClick={() => onAddToMyList({ id: 1, title: "Neon Show", year: 2024, type: "TV Show", poster_path: null })}>
        Add Neon Show
      </button>
    </div>
  ),
}));

describe("TVShowsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Default fetch mock for watchlist
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("returns null for guest users", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    const { container } = render(<TVShowsPage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the TV shows page and adds/removes shows", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { id: "user-1", name: "Jane Doe" },
      },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<TVShowsPage />);
    
    // Wait for initial load to finish (spinner gone)
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });

    // Add a show via the mocked MediaSearch
    const addButton = screen.getByRole("button", { name: /Add Neon Show/i });
    fireEvent.click(addButton);

    // Check if it appears in "My List"
    await waitFor(() => {
      expect(screen.getByText("Neon Show")).toBeDefined();
    });
    
    // Remove it
    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    // Check if list is empty again
    await waitFor(() => {
      expect(screen.getByText(/your list is empty/i)).toBeDefined();
    });
  });
});
