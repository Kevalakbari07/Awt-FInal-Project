import mongoose from "mongoose"

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
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

const Report = mongoose.model("Report", reportSchema)

export default Report
