import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Dish } from "@/lib/models/Dish"

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurantId")
        const cuisine = searchParams.get("cuisine")
        const category = searchParams.get("category")
        const available = searchParams.get("available")
        const dietaryTags = searchParams.get("dietaryTags")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const page = Number.parseInt(searchParams.get("page") || "1")

        const filter: any = {}
        if (restaurantId) {
            filter.restaurantId = restaurantId
        }
        if (cuisine) {
            filter.cuisine = cuisine
        }
        if (category) {
            filter.category = category
        }
        if (available !== null) {
            filter.available = available === "true"
        }
        if (dietaryTags) {
            const tags = dietaryTags.split(",")
            filter.dietaryTags = { $in: tags }
        }

        const skip = (page - 1) * limit
        const dishes = await Dish.find(filter)
            .populate("restaurantId", "name address phone rating operatingHours")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Dish.countDocuments(filter)

        return NextResponse.json({
            dishes, pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching dishes:", error)
        return NextResponse.json({ error: "Failed to fetch dishes" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const body = await request.json()
        const newDish = new Dish(body)
        await newDish.save()

        const populatedDish = await newDish.populate("restaurantId", "name address phone rating operatingHours")

        return NextResponse.json(populatedDish, { status: 201 })
    } catch (error) {
        console.error("Error creating dish:", error)
        return NextResponse.json({ error: "Failed to create dish" }, { status: 500 })
    }
}
