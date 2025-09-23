import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";  
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb"; 

// GET user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const client = await clerkClient();
    
    // fetch from Clerk
    const clerkUser  = await client.users.getUser (id);

    // fetch from MongoDB
    const dbUser  = await User.findOne({ clerkId: id });

    return NextResponse.json({ clerkUser , dbUser  }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// DELETE user by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB(); 

    const client = await clerkClient();
    
    // delete from Clerk
    await client.users.deleteUser (id);

    // Delete user from MongoDB
    await User.deleteOne({ clerkId: id });

    return NextResponse.json({ message: "User  deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
