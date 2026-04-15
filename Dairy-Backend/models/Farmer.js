import mongoose from "mongoose"

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  codeNumber: {
    type: Number,
    required: true,
    min: 1
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

// Compound unique index: combination of userId and codeNumber must be unique
farmerSchema.index(
  { userId: 1, codeNumber: 1 },
  { unique: true, sparse: true }
)

const Farmer = mongoose.model("Farmer", farmerSchema)

export default Farmer
