import { Schema, model } from "mongoose";

const userModel = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // har bir xabar uchun alohida kod
  },
  username: {
    type: String,
  },
  full_name: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default model("UserModel", userModel);
