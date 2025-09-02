import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["admin", "restaurant_owner", "customer"], default: "customer" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
