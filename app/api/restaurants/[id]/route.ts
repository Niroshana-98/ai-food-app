import { type NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/lib/mongodb"
import Restaurant from "@/lib/models/Restaurant"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const restaurant = await Restaurant.findById(params.id).populate("ownerId", "name email")

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await request.json()
    const restaurant = await Restaurant.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error("Error updating restaurant:", error)
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const restaurant = await Restaurant.findByIdAndDelete(params.id)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Restaurant deleted successfully" })
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 })
  }
}
