"use server";

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get current Clerk user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", user: null },
        { status: 401 }
      );
    }

    // Find user in MongoDB
    const dbUser = await User.findOne({ clerkId: user.id });

    return NextResponse.json({
      message: "User logged in",
      user: dbUser || null,
    });
  } catch (error) {
    console.error("Signin route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", user: null },
      { status: 500 }
    );
  }
}
