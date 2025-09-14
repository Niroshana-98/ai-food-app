import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  cuisineTypes: string[];
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>;
  status: "pending" | "active" | "inactive";
  photo?: string; 
  createdAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    description: String,
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String,
    address: { type: String, required: true },
    cuisineTypes: { type: [String], required: true },
    operatingHours: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "active",
    },
    photo: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Restaurant || model<IRestaurant>("Restaurant", RestaurantSchema);
