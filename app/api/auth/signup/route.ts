import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
  try {
    await connectDB();

    // Get current user from Clerk 
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: clerkUser.id });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", user: existingUser },
        { status: 200 }
      );
    }

    // Create new user
    const newUser = await User.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.fullName || clerkUser.firstName || "",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}