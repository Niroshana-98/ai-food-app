import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

//  POST: Create restaurant
export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;
    const cuisineTypes = formData.get("cuisineTypes")
      ? JSON.parse(formData.get("cuisineTypes") as string)
      : [];
    const operatingHours = formData.get("operatingHours")
      ? JSON.parse(formData.get("operatingHours") as string)
      : {};
    const status =
      (formData.get("status") as "pending" | "active" | "inactive") || "active";
    const file = formData.get("photo") as File | null;

    let photoPath = "";

    if (file) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // 🔑 Generate unique filename
      const ext = path.extname(file.name);
      const uniqueName = crypto.randomUUID() + ext;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, bytes);

      photoPath = "/uploads/" + uniqueName;
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      phone,
      email,
      website,
      address,
      cuisineTypes,
      operatingHours,
      status,
      photo: photoPath,
    });

    return NextResponse.json(
      { success: true, restaurant },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}
