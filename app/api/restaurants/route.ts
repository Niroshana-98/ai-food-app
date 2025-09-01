import { type NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/lib/mongodb"
import Restaurant from "@/lib/models/Restaurant"
import { NextRequestHint } from "next/dist/server/web/adapter"

export async function GET(request: NextRequestHint) {

  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const cuisine = searchParams.get("cuisine")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const filter: any = {}
    if (status) filter.status = status
    if (cuisine) filter.cuisineTypes = { $in: [cuisine] }

    const skip = (page - 1) * limit

    const restaurants = await Restaurant.find(filter)
      .populate("ownerId", "name email")
      .sort({ rating: -1, totalOrders: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Restaurant.countDocuments(filter)

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const restaurant = new Restaurant(body)
    await restaurant.save()

    return NextResponse.json({ restaurant }, { status: 201 })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}