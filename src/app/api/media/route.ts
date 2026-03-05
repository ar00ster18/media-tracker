import { NextRequest, NextResponse } from "next/server";
import { 
  getPopularMovies, 
  getPopularTVShows, 
  searchMovies, 
  searchTVShows,
  getMediaExternalRatings
} from "@/lib/media";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type"); // "movie" or "tv"
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const action = searchParams.get("action"); // "search" (default) or "ratings"
  const id = searchParams.get("id");

  try {
    if (action === "ratings") {
      if (!id || !type) {
        return NextResponse.json({ error: "ID and type are required for ratings" }, { status: 400 });
      }
      const ratings = await getMediaExternalRatings(parseInt(id, 10), type as "movie" | "tv");
      return NextResponse.json(ratings);
    }

    if (type === "movie") {
      if (query) {
        const data = await searchMovies(query, page);
        return NextResponse.json(data);
      } else {
        const data = await getPopularMovies(page);
        return NextResponse.json(data);
      }
    } else if (type === "tv") {
      if (query) {
        const data = await searchTVShows(query, page);
        return NextResponse.json(data);
      } else {
        const data = await getPopularTVShows(page);
        return NextResponse.json(data);
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Media API proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch from Media API" }, { status: 500 });
  }
}
