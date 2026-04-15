import mongoose from "mongoose"

const subscriptionPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ["single-monthly", "single-yearly", "multi-monthly", "multi-yearly"],
    required: true
  },
  duration: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  maxUsers: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  description: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema)

export default SubscriptionPlan
