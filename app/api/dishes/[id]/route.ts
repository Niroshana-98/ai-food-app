import { type NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/lib/mongodb"
import { Dish } from "@/lib/models/Dish"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const dish =  await Dish.findById(params.id).populate("restaurantId", "name address phone rating operatingHours")
    
    if (!dish) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 })
    }

    return NextResponse.json({ dish })
  } catch (error) {
    console.error("Error fetching dish:", error)
    return NextResponse.json({ error: "Failed to fetch dish" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB()

        const body = await request.json()
        const dish = await Dish.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).populate("restaurantId", "name address phone rating operatingHours")

        if (!dish) {
            return NextResponse.json({ error: "Dish not found" }, { status: 404 })
        }

        return NextResponse.json({ dish })
    } catch (error) {
        console.error("Error updating dish:", error)
        return NextResponse.json({ error: "Failed to update dish" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB()

        const dish = await Dish.findByIdAndDelete(params.id)

        if (!dish) {
            return NextResponse.json({ error: "Dish not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Dish deleted successfully" })
    } catch (error) {
        console.error("Error deleting dish:", error)
        return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 })
    }
}
