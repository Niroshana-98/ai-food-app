import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dish from "@/models/Dish";

// GET: Single restaurant by ID
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const dish = await Dish.findById(id).populate("restaurant");

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error fetching dish:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update restaurant
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const data = await req.json();

    const dish = await Dish.findByIdAndUpdate(id, data, { new: true });

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove restaurant
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // 👈 await here
    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Dish deleted" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
