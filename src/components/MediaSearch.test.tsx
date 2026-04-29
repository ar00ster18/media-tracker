import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { MediaSearch } from "./MediaSearch";

describe("MediaSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("fetches and displays popular movies on mount", async () => {
    const mockData = {
      results: [
        { id: 1, title: "Popular Movie", release_date: "2024-01-01", poster_path: "/path.jpg" }
      ]
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<MediaSearch type="movie" onAddToMyList={() => {}} isInMyList={() => false} />);

    await waitFor(() => {
      expect(screen.getByText("Popular Movie")).toBeDefined();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/media?type=movie"));
  });

  it("searches for movies when query changes", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });

    render(<MediaSearch type="movie" onAddToMyList={() => {}} isInMyList={() => false} />);

    const input = screen.getByLabelText(/Search movies/i);
    fireEvent.change(input, { target: { value: "Inception" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("query=Inception"));
    }, { timeout: 1000 });
  });

  it("calls onAddToMyList when add button is clicked", async () => {
    const onAddToMyList = vi.fn();
    const mockData = {
      results: [
        { id: 1, title: "Movie 1", release_date: "2024-01-01", poster_path: null }
      ]
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<MediaSearch type="movie" onAddToMyList={onAddToMyList} isInMyList={() => false} />);

    await waitFor(() => {
      const addButton = screen.getByRole("button", { name: /add to my list/i });
      fireEvent.click(addButton);
    });

    expect(onAddToMyList).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      title: "Movie 1"
    }));
  });
});
