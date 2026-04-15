import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user"]
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  companyName: {
    type: String,
    default: null
  },
  fullName: {
    type: String,
    default: null
  },

  // Subscription Information
  subscriptionId: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  subscriptionType: {
    type: String,
    enum: ["free-trial", "single-monthly", "single-yearly", "multi-monthly", "multi-yearly", "admin-lifetime"],
    default: "free-trial"
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days free trial
  },
  numberOfUsers: {
    type: Number,
    default: 1
  },
  isSubscriptionActive: {
    type: Boolean,
    default: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model("User", userSchema)

export default User
