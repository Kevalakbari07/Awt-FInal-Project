import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  fatRate: {
    type: Number,
    default: 0,
    description: "Fat rate in rupees (per user)"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Settings = mongoose.model("Settings", settingsSchema)

export default Settings
