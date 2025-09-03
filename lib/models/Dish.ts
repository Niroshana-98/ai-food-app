import mongoose, { type Document, Schema } from "mongoose"

export interface IDish extends Document {
  name: string
  description: string
  price: number
  category: string
  cuisineType: string
  dietaryTags: string[]
  ingredients: string[]
  restaurantId: mongoose.Types.ObjectId
  available: boolean
  preparationTime: number // in minutes
  images: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  createdAt: Date
  updatedAt: Date
}

const DishSchema = new Schema<IDish>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish", "Salad", "Soup"],
    },
    cuisineType: {
      type: String,
      required: true,
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
      ],
    },
    dietaryTags: [
      {
        type: String,
        enum: [
          "Vegan",
          "Vegetarian",
          "Gluten-Free",
          "Dairy-Free",
          "Nut-Free",
          "Halal",
          "Kosher",
          "Spicy",
          "Mild",
          "Comfort Food",
          "Healthy",
          "Street Food",
          "Fine Dining",
          "Quick Bite",
          "Creamy",
        ],
      },
    ],
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      required: true,
      min: 1,
    },
    images: [
      {
        type: String,
      },
    ],
    nutritionalInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
DishSchema.index({ restaurantId: 1 })
DishSchema.index({ cuisineType: 1 })
DishSchema.index({ dietaryTags: 1 })
DishSchema.index({ available: 1 })
DishSchema.index({ price: 1 })

export const Dish = mongoose.models.Dish || mongoose.model<IDish>("Dish", DishSchema)
