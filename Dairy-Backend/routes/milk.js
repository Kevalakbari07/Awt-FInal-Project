import express from "express"
import MilkCollection from "../models/MilkCollection.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get all milk collections (filtered by userId for regular users, all for admins)
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {}

    console.log("🔍 GET /milk - userId:", req.userId, "role:", req.role)

    // If admin: return all data
    if (req.role === "admin") {
      // Admin sees all milk collections
      console.log("👤 Admin user - returning ALL milk collections")
    } else if (req.userId) {
      // Normal user: return ONLY their own
      query.userId = req.userId
      console.log("✅ Regular user - filtering by userId:", req.userId)
    } else {
      // No userId and not admin: return empty
      console.log("⚠️ No userId identified - returning empty")
      return res.json([])
    }
    
    const milkCollections = await MilkCollection.find(query).sort({ createdAt: -1 }).populate("userId", "username")
    console.log("📊 Found milk collections:", milkCollections.length)
    res.json(milkCollections)
  } catch (error) {
    console.error("Get milk collections error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

// Create milk collection
router.post("/", verifyToken, async (req, res) => {
  try {
    const { farmer, quantity, fat, total, date } = req.body

    if (!farmer || quantity == null || total == null || !date) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    // Use userId and username from JWT token (via auth middleware)
    const userId = req.userId
    const userName = req.username

    console.log("Saving milk collection for userId:", userId)

    const milkCollection = new MilkCollection({
      farmer,
      quantity,
      fat: fat || 0,
      total,
      date,
      userId: userId,
      userName: userName
    })

    const savedCollection = await milkCollection.save()
    console.log("✅ Milk collection saved successfully:", savedCollection)
    await savedCollection.populate("userId", "username")
    res.status(201).json(savedCollection)

  } catch (error) {
    console.error("❌ Create milk collection error:", error.message)
    res.status(500).json({ message: "Error saving milk: " + error.message })
  }
})

// Update milk collection
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, fat, total } = req.body

    const milkCollection = await MilkCollection.findById(id)

    if (!milkCollection) {
      return res.status(404).json({ message: "Milk collection not found" })
    }

    // Check authorization
    const canUpdate = req.role === "admin" || 
                     !req.userId || 
                     (milkCollection.userId && milkCollection.userId.toString() === req.userId)

    if (!canUpdate) {
      return res.status(403).json({ message: "You can only edit your own records" })
    }

    // Update fields
    if (quantity !== undefined) milkCollection.quantity = quantity
    if (fat !== undefined) milkCollection.fat = fat
    if (total !== undefined) milkCollection.total = total

    const updatedCollection = await milkCollection.save()
    console.log("✅ Milk collection updated:", updatedCollection)
    await updatedCollection.populate("userId", "username")
    res.json(updatedCollection)

  } catch (error) {
    console.error("❌ Update milk collection error:", error.message)
    res.status(500).json({ message: "Error updating milk: " + error.message })
  }
})

// Delete milk collection
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const milkCollection = await MilkCollection.findById(id)

    if (!milkCollection) {
      return res.status(404).json({ message: "Milk collection not found" })
    }

    // Check authorization
    const canDelete = req.role === "admin" || 
                     !req.userId || 
                     (milkCollection.userId && milkCollection.userId.toString() === req.userId)

    if (!canDelete) {
      return res.status(403).json({ message: "You can only delete your own records" })
    }

    const deletedCollection = await MilkCollection.findByIdAndDelete(id)
    console.log("✅ Milk collection deleted:", deletedCollection._id)
    res.json({ message: "Milk collection deleted", record: deletedCollection })

  } catch (error) {
    console.error("Delete milk collection error:", error)
    res.status(500).json({ message: "Error deleting milk collection" })
  }
})

export default router
