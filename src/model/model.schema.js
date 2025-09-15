import { Schema, model } from "mongoose";

// Xabarlar saqlanadigan schema
const channelMessageSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true, // har bir xabar uchun alohida kod
  },
  text: {
    type: String,
    required: true,
  },
  channelMessageId: {
    type: Number, // kanaldagi message_id
    required: true,
  },
  channelId: {
    type: String, // qaysi kanalga yuborilgani
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("ChannelMessage", channelMessageSchema);
