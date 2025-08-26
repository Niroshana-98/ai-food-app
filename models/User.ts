import mongoose, { Schema, model, models } from "mongoose";

interface IUser {
  clerkId: string;
  email: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
});

const User = models.User || model<IUser>("User", userSchema);
export default User;
