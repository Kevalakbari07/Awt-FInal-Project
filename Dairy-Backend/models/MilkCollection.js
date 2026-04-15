import mongoose from "mongoose"

const milkCollectionSchema = new mongoose.Schema({
  farmer: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  userName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const MilkCollection = mongoose.model("MilkCollection", milkCollectionSchema)

export default MilkCollection
