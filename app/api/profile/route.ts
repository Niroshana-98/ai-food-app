import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/profile → Fetch current user
export async function GET() {
  try {
    await connectDB();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User  not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/profile → Update current user
export async function PUT(req: Request) {
  try {
    await connectDB();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updatedUser  = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          name: body.name,
          phone: body.phone,
          dateOfBirth: body.dateOfBirth,
          address: body.address,
          country: body.country,
          district: body.district,  // updated here
          city: body.city,
          zipCode: body.zipCode,
        },
      },
      { new: true } // return updated doc
    ).lean();

    if (!updatedUser ) {
      return NextResponse.json({ error: "User  not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser , { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
