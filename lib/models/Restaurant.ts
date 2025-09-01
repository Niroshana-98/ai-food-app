import mongoose from "mongoose"
const { Schema, models } = mongoose;

export interface IRestaurant extends mongoose.Document {
    name: string
    description: string
    cuisineTypes: string[]
    address: string
    phone: string
    email: string
    website?: string
    rating: number
    totalOrders: number
    status: "active" | "inactive" | "pending"
    operatingHours: {
        monday: { open: string; close: string; closed: boolean }
        tuesday: { open: string; close: string; closed: boolean }
        wednesday: { open: string; close: string; closed: boolean }
        thursday: { open: string; close: string; closed: boolean }
        friday: { open: string; close: string; closed: boolean }
        saturday: { open: string; close: string; closed: boolean }
        sunday: { open: string; close: string; closed: boolean }
    }
    ownerId?: mongoose.Types.ObjectId
    images: string[]
    createdAt: Date
    updatedAt: Date
}

const OperatingHoursSchema = new Schema(
    {
        open: { type: String, required: true },
        close: { type: String, required: true },
        closed: { type: Boolean, default: false },
    },
    { _id: false },
)

const RestaurantSchema = new Schema<IRestaurant>({
    name: { type: String, required: true, trim: true, },
    description: { type: String, required: true, trim: true, },
    cuisineTypes: [
        {
            type: String,
            enum: [
                "Indian",
                "Chinese",
                "Italian",
                "Mexican",
                "Thai",
                "Japanese",
                "Mediterranean",
                "American",
                "French",
                "Korean",
                "Vietnamese",
                "Greek",
                "Vegetarian",
                "Vegan",
                "Fine Dining",
                "Fast Food",
                "Street Food",
            ],
        },
    ],
    address: { type: String, required: true, trim: true, },
    phone: { type: String, required: true, trim: true, },
    email: { type: String, required: true, trim: true, lowercase: true },
    website: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0, min: 0, },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "pending" },
    operatingHours: {
        monday: OperatingHoursSchema,
        tuesday: OperatingHoursSchema,
        wednesday: OperatingHoursSchema,
        thursday: OperatingHoursSchema,
        friday: OperatingHoursSchema,
        saturday: OperatingHoursSchema,
        sunday: OperatingHoursSchema,
    },
    ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
    images: [
        {
            type: String,
        },
    ],
}, { timestamps: true })

RestaurantSchema.index({ name: 1 })
RestaurantSchema.index({ cuisineTypes: 1 })
RestaurantSchema.index({ status: 1 })
RestaurantSchema.index({ rating: -1 })

export default models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);