// app/api/auth/sync/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
  try {
    await connectDB();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure role metadata exists (default = "customer")
    const role = (clerkUser.publicMetadata?.role as string) || "customer";

    // Upsert user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        $set: {
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          role: role,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

