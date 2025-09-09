import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dish from "@/models/Dish";
import Restaurant from "@/models/Restaurant";

export async function GET() {
  try {
    await connectDB();

    // Populate restaurant with _id and name
    const dishes = await Dish.find().populate("restaurant", "_id name");

    return NextResponse.json({ success: true, dishes });
  } catch (err) {
    console.error("GET DISHES ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      restaurant: restaurantId,
      name,
      price,
      description,
      category,
      cuisineType,
      preparationTime,
      dietaryTags,
      ingredients,
      available,
    } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "Restaurant ID required" },
        { status: 400 }
      );
    }

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Create dish
    const dish = await Dish.create({
      restaurant: restaurant._id, // store ObjectId reference
      name,
      price: Number(price),
      description,
      category,
      cuisineType,
      preparationTime: Number(preparationTime),
      dietaryTags: dietaryTags || [],
      ingredients: ingredients || [],
      available: available !== undefined ? available : true,
    });

    // Populate restaurant before returning
    const populatedDish = await dish.populate("restaurant", "_id name");

    return NextResponse.json({ success: true, dish: populatedDish });
  } catch (err) {
    console.error("CREATE DISH ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
