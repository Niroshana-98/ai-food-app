import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import Dish from "@/models/Dish";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
    const { id } = await context.params;
    const contentType = req.headers.get('content-type');
    
    let updateData: any = {};
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await req.formData();
      
      // Extract form fields (same pattern as POST route)
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
      const status = (formData.get("status") as "pending" | "active" | "inactive") || "active";
      
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
        name,
        description,
        phone,
        email,
        website,
        address,
        cuisineTypes,
        operatingHours,
        status,
      };
      
      // Only update photo if new file was uploaded
      if (photoPath) {
        updateData.photo = photoPath;
      }
    } else {
      // Handle JSON data (no file upload)
      updateData = await req.json();
    }
    
    const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    }, { status: 500 });
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
