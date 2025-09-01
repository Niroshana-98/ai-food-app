"use server";

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST() {
  await connectDB();

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const newUser = await User.findOneAndUpdate(
      { clerkId: user.id },
      {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}

