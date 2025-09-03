
import mongoose from "mongoose";
import User from "../lib/models/User.js";
import Restaurant from "../lib/models/Restaurant.js";
import { Dish } from "../lib/models/Dish.js"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mytharindud_db_user:4zXuP5k3lkGDcH1B@dishai.xolxtbs.mongodb.net/dishAI?retryWrites=true&w=majority&appName=DishAI"

async function setupDatabase() {
    try {
        console.log("Connecting to MongoDB...")
        console.log(MONGODB_URI)
        await mongoose.connect(MONGODB_URI)
        console.log("Database connected successfully")

        // Clear existing data
        console.log("Clearing existing data...")
        await User.deleteMany({})
        await Restaurant.deleteMany({})

        // Create sample users
        console.log("Creating sample users...")

        const users = await User.create([
            {
                clerkId: "user_2ndsqZTvIjaxEVDfKUhPOv4SgJ5",
                name: "John Doe",
                email: "john@example.com",
                role: "customer",
                dietaryPreferences: ["Vegetarian", "Spicy"],
                moodPreferences: ["Comfort Food", "Adventurous"],
                address: "123 Main St, Downtown, NY 10001",
            },
            {
                clerkId: "user_2ndsr8MzKjwxPVGhLRiWFt6QbZ3",
                name: "Jane Smith",
                email: "jane@example.com",
                role: "customer",
                dietaryPreferences: ["Vegan", "Low-Carb"],
                moodPreferences: ["Healthy", "Quick Bite"],
                address: "456 Oak Ave, Midtown, NY 10002",
            },
            {
                clerkId: "user_2ndsxYKvMnpqTWaEBuCkLo5VhD8",
                name: "Mike Johnson",
                email: "mike@spicegarden.com",
                role: "restaurant_owner",
                restaurantId: null, // Will be set after restaurant creation
            },
            {
                clerkId: "user_2ndt1FqJNbzrSXeACgHiPw9KmT4",
                name: "Admin User",
                email: "admin@dishAI.com",
                role: "admin",
            },
        ])

        // Create sample restaurants
        console.log("Creating sample restaurants...")

        const restaurants = await Restaurant.create([
            {
                name: "Spice Garden",
                description:
                    "Authentic Indian cuisine with a modern twist. We specialize in traditional curries, tandoor dishes, and fresh naan bread.",
                cuisineTypes: ["Indian", "Vegetarian"],
                address: "123 Main St, Downtown, NY 10001",
                phone: "(555) 123-4567",
                email: "info@spicegarden.com",
                rating: 4.8,
                totalOrders: 234,
                operatingHours: {
                    monday: { open: "11:00", close: "22:00", closed: false },
                    tuesday: { open: "11:00", close: "22:00", closed: false },
                    wednesday: { open: "11:00", close: "22:00", closed: false },
                    thursday: { open: "11:00", close: "22:00", closed: false },
                    friday: { open: "11:00", close: "23:00", closed: false },
                    saturday: { open: "11:00", close: "23:00", closed: false },
                    sunday: { open: "12:00", close: "21:00", closed: false },
                },
                ownerId: users.find((u) => u.email === "mike@spicegarden.com")._id,
            },
            {
                name: "Mumbai Palace",
                description: "Fine dining Indian restaurant with traditional recipes passed down through generations.",
                cuisineTypes: ["Indian", "Fine Dining"],
                address: "456 Oak Ave, Midtown, NY 10002",
                phone: "(555) 987-6543",
                email: "info@mumbaipalace.com",
                rating: 4.6,
                totalOrders: 189,
                operatingHours: {
                    monday: { open: "17:00", close: "23:00", closed: false },
                    tuesday: { open: "17:00", close: "23:00", closed: false },
                    wednesday: { open: "17:00", close: "23:00", closed: false },
                    thursday: { open: "17:00", close: "23:00", closed: false },
                    friday: { open: "17:00", close: "24:00", closed: false },
                    saturday: { open: "17:00", close: "24:00", closed: false },
                    sunday: { open: "17:00", close: "22:00", closed: false },
                },
            },
            {
                name: "Thai Basil",
                description: "Authentic Thai cuisine with fresh ingredients and traditional cooking methods.",
                cuisineTypes: ["Thai"],
                address: "789 Pine St, Eastside, NY 10003",
                phone: "(555) 456-7890",
                email: "info@thaibasil.com",
                rating: 4.4,
                totalOrders: 156,
                status: "pending",
                operatingHours: {
                    monday: { open: "11:30", close: "21:30", closed: false },
                    tuesday: { open: "11:30", close: "21:30", closed: false },
                    wednesday: { open: "11:30", close: "21:30", closed: false },
                    thursday: { open: "11:30", close: "21:30", closed: false },
                    friday: { open: "11:30", close: "22:00", closed: false },
                    saturday: { open: "11:30", close: "22:00", closed: false },
                    sunday: { open: "12:00", close: "21:00", closed: false },
                },
            },
        ])

        // Update restaurant owner with restaurant ID
        await User.findByIdAndUpdate(users.find((u) => u.email === "mike@spicegarden.com")._id, {
            restaurantId: restaurants[0]._id,
        })
        console.log("Sample data created successfully")
        console.log(`Created ${users.length} users and ${restaurants.length} restaurants`)

        // Create sample dishes
        console.log("🍽️ Creating sample dishes...")
        const dishes = await Dish.create([
            {
                name: "Chicken Tikka Masala",
                description: "Tender chicken in creamy tomato-based curry sauce with warming spices",
                price: 16.99,
                category: "Main Course",
                cuisineType: "Indian",
                dietaryTags: ["Spicy", "Comfort Food"],
                ingredients: ["Chicken", "Tomatoes", "Cream", "Onions", "Garlic", "Ginger", "Spices"],
                restaurantId: restaurants[0]._id,
                available: true,
                preparationTime: 25,
            },
            {
                name: "Vegetable Biryani",
                description: "Fragrant basmati rice with mixed vegetables and aromatic spices",
                price: 14.99,
                category: "Main Course",
                cuisineType: "Indian",
                dietaryTags: ["Vegetarian", "Comfort Food"],
                ingredients: ["Basmati Rice", "Mixed Vegetables", "Saffron", "Spices", "Herbs"],
                restaurantId: restaurants[0]._id,
                available: true,
                preparationTime: 30,
            },
            {
                name: "Butter Chicken",
                description: "Creamy and rich chicken curry with butter and tomato sauce",
                price: 18.99,
                category: "Main Course",
                cuisineType: "Indian",
                dietaryTags: ["Spicy", "Comfort Food", "Creamy"],
                ingredients: ["Chicken", "Butter", "Tomatoes", "Cream", "Spices"],
                restaurantId: restaurants[1]._id,
                available: false,
                preparationTime: 20,
            },
            {
                name: "Pad Thai",
                description: "Classic Thai stir-fried noodles with shrimp, tofu, and peanuts",
                price: 14.99,
                category: "Main Course",
                cuisineType: "Thai",
                dietaryTags: ["Quick Bite", "Street Food"],
                ingredients: ["Rice Noodles", "Shrimp", "Tofu", "Bean Sprouts", "Peanuts", "Lime"],
                restaurantId: restaurants[2]._id,
                available: true,
                preparationTime: 15,
            },
        ])

    } catch (error) {
        console.error("Database connection failed:", error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log("Disconnected from MongoDB")
        process.exit(0)
    }
}
setupDatabase();
