import { Schema, model } from "mongoose";

const channelSchema = new Schema({
    adminId:{type:String,required:true},
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  link: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Channel", channelSchema);
