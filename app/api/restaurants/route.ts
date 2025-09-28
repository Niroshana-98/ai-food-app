import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRestaurant } from "@/lib/services/restaurantService";

//  GET: List restaurants
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const cuisine = searchParams.get("cuisine");

    let query = {};
    if (cuisine) {
      query = { cuisineTypes: { $in: [cuisine] } }; 
    }

    const restaurants = await Restaurant.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

//  POST: Create a new restaurant
export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    // 🔹 Extract fields safely
    const data: any = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      website: formData.get("website")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      cuisineTypes: formData.get("cuisineTypes")
        ? JSON.parse(formData.get("cuisineTypes") as string)
        : [],
      operatingHours: formData.get("operatingHours")
        ? JSON.parse(formData.get("operatingHours") as string)
        : {},
      status:
        (formData.get("status") as "pending" | "active" | "inactive") || "active",
    };

    // 🔹 Handle file upload (if photo is provided)
    const file = formData.get("photo") as File | null;
    let photoPath = "";

    if (file) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name);
      const uniqueName = crypto.randomUUID() + ext;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, bytes);
      photoPath = "/uploads/" + uniqueName;
    }

    // 🔹 Add photo path into restaurant data
    if (photoPath) {
      data.photo = photoPath;
    }

    // 🔹 Save restaurant (with embedding handled in service)
    const restaurant = await createRestaurant(data);

    return NextResponse.json({ success: true, restaurant }, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

