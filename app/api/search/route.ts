import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embedding";
import Restaurant from "@/models/Restaurant";
import { connectDB } from "@/lib/mongodb";

// helper function
async function searchRestaurants(query: string) {
  const queryEmbedding = await generateEmbedding(query);

  const results = await Restaurant.aggregate([
    {
      $vectorSearch: {
        index: "restaurant_embedding_index", // ✅ must exist in MongoDB Atlas
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 5,
      },
    },
  ]);

  return results;
}

// ✅ Next.js API route handler
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const results = await searchRestaurants(query);

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
