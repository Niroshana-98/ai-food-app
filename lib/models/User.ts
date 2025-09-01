import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

interface IUser {
  clerkId: string;
  email: string;
  name: string;
  role: "customer" | "restaurant_owner" | "admin"
  phone?: string
  address?: string
  dateOfBirth?: Date
  dietaryPreferences: string[]
  moodPreferences: string[]
  restaurantId?: mongoose.Types.ObjectId
  status: "active" | "inactive" | "suspended"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, enum: ["customer", "restaurant_owner", "admin"] },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  dateOfBirth: { type: Date },
  dietaryPreferences:  [
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
          "Keto",
          "Paleo",
          "Low-Carb",
          "Spicy",
          "Mild",
        ],
      },
    ],
  moodPreferences: [
      {
        type: String,
        enum: [
          "Adventurous",
          "Comfort Food",
          "Healthy",
          "Indulgent",
          "Quick Bite",
          "Fine Dining",
          "Casual",
          "Nostalgic",
          "Exotic",
          "Traditional",
        ],
      },
    ],
  restaurantId: { type: mongoose.Types.ObjectId, ref: "Restaurant" },
  status: { type: String, required: true, enum: ["active", "inactive", "suspended"], default: "active" },

}, { timestamps: true });

//UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })

export default models.User || model<IUser>("User", UserSchema);
