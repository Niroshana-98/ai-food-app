import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dish from "@/models/Dish";
import Restaurant from "@/models/Restaurant";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
  await connectDB();

  const formData = await req.formData();
  const restaurant = formData.get("restaurant") as string;
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const cuisineType = formData.get("cuisineType") as string;
  const preparationTime = Number(formData.get("preparationTime"));
  const dietaryTags = formData.get("dietaryTags")
    ? JSON.parse(formData.get("dietaryTags") as string)
    : [];
  const ingredients = formData.get("ingredients")
    ? JSON.parse(formData.get("ingredients") as string)
    : [];
  const available = formData.get("available") !== "false";

  const file = formData.get("photo") as File | null;
  let photoPath = "";

  if (file) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 🔑 Generate unique filename
    const ext = path.extname(file.name); // get extension (.jpg, .png, etc.)
    const uniqueName = crypto.randomUUID() + ext;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, bytes);

    photoPath = "/uploads/" + uniqueName;
  }

  const restaurantDoc = await Restaurant.findById(restaurant);
  if (!restaurantDoc) {
    return NextResponse.json(
      { success: false, error: "Restaurant not found" },
      { status: 404 }
    );
  }

  const dish = await Dish.create({
    restaurant: restaurantDoc._id,
    name,
    price,
    description,
    category,
    cuisineType,
    preparationTime,
    dietaryTags,
    ingredients,
    available,
    photo: photoPath,
  });

  const populatedDish = await dish.populate("restaurant", "_id name");

  return NextResponse.json({ success: true, dish: populatedDish });
}
