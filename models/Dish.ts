import mongoose, { Schema, Document, models } from "mongoose";

export interface IDish extends Document {
  restaurant: mongoose.Schema.Types.ObjectId; // Reference restaurant
  name: string;
  price: number;
  description: string;
  category: string;
  cuisineType: string;
  preparationTime: number; 
  dietaryTags: string[]; 
  ingredients: string[];
  available: boolean;
  photo?: string;
  createdAt: Date;
}

const DishSchema = new Schema<IDish>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    cuisineType: { type: String, required: true },
    preparationTime: { type: Number, required: true },
    dietaryTags: { type: [String], default: [] },
    ingredients: { type: [String], required: true },
    available: { type: Boolean, default: true },
    photo: { type: String, required: false },
    
  },
  { timestamps: true }
);

export default models.Dish || mongoose.model<IDish>("Dish", DishSchema);
