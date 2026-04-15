import express from "express"
import Settings from "../models/Settings.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get user's settings
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    let settings = await Settings.findOne({ userId })
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({ userId, fatRate: 0 })
      await settings.save()
    }
    
    res.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ message: "Error fetching settings" })
  }
})

// Update user's settings
router.put("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const { fatRate } = req.body

    if (fatRate === undefined || fatRate < 0) {
      return res.status(400).json({ message: "Invalid fat rate value" })
    }

    let settings = await Settings.findOne({ userId })
    
    if (!settings) {
      settings = new Settings({ userId, fatRate })
    } else {
      settings.fatRate = fatRate
    }

    settings.updatedAt = new Date()
    const updated = await settings.save()
    
    console.log("✅ Settings updated for user:", userId, "Fat Rate:", fatRate)
    res.json(updated)
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({ message: "Error updating settings" })
  }
})

export default router
