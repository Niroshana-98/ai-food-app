import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const { userId, sessionClaims } = await auth(); 
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (sessionClaims?.publicMetadata as any)?.role || "customer";
  return NextResponse.json({ role });
}

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth(); 
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = (sessionClaims?.publicMetadata as any)?.role;
  if (myRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId: targetUserId, role } = await req.json();

  if (!["admin", "restaurantOwner", "customer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    await connectDB();

    const clerk = await clerkClient();
    await clerk.users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    // Update MongoDB mirror (if exists)
    await User.findOneAndUpdate({ clerkId: targetUserId }, { role }, { new: true });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("ROLE SET ERROR:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
