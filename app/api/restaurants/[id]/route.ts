import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import Dish from "@/models/Dish";

// GET: Single restaurant by ID
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update restaurant
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const data = await req.json();

    const restaurant = await Restaurant.findByIdAndUpdate(id, data, { new: true });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove restaurant
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    // Delete all dishes associated with this restaurant
    await Dish.deleteMany({ restaurant: id });

    return NextResponse.json({ success: true, message: "Restaurant and associated dishes deleted" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
