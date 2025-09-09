import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

//  POST: Create restaurant
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const restaurant = await Restaurant.create(data);

    return NextResponse.json({ success: true, restaurant }, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

//  GET: List restaurants
export async function GET() {
  try {
    await connectDB();
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
