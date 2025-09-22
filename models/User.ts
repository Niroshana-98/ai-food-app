import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string
  email: string
  name?: string
  phone?: string
  role: "admin" | "restaurant_owner" | "customer"
  status?: "active" | "inactive" | "suspended"
  dateOfBirth?: Date
  address?: string
  city?: string
  district?: string  // corresponds to frontend "district"
  country?: string
  zipCode?: string
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["admin", "restaurant_owner", "customer"], default: "customer" },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  dateOfBirth: { type: Date },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  district: { type: String, default: "" },
  country: { type: String, default: "" },
  zipCode: { type: String, default: "" },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
