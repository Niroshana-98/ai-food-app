import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dish from "@/models/Dish";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// GET: Single dish by ID
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; 
    const dish = await Dish.findById(id).populate("restaurant", "_id name");

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error fetching dish:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update dish
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const contentType = req.headers.get('content-type');
    
    let updateData: any = {};
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await req.formData();
      
      // Extract form fields (same pattern as POST route)
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

        // Generate unique filename (same as POST route)
        const ext = path.extname(file.name);
        const uniqueName = crypto.randomUUID() + ext;
        const filePath = path.join(uploadDir, uniqueName);

        fs.writeFileSync(filePath, bytes);
        photoPath = "/uploads/" + uniqueName;
      }

      // Build update data
      updateData = {
        restaurant,
        name,
        price,
        description,
        category,
        cuisineType,
        preparationTime,
        dietaryTags,
        ingredients,
        available,
      };

      // Only update photo if new file was uploaded
      if (photoPath) {
        updateData.photo = photoPath;
      }
    } else {
      // Handle JSON data (no file upload)
      updateData = await req.json();
    }

    const dish = await Dish.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).populate("restaurant", "_id name");

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}

// DELETE: Remove dish
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
      return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}