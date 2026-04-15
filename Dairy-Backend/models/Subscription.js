import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    unique: true,
    required: true,
    default: () => `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  planType: {
    type: String,
    enum: ["single-monthly", "single-yearly", "multi-monthly", "multi-yearly"],
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  numberOfUsers: {
    type: Number,
    default: 1
  },
  duration: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  renewalDate: {
    type: Date,
    default: null
  }
})

const Subscription = mongoose.model("Subscription", subscriptionSchema)

export default Subscription
