import express from "express"
import Scheme from "../models/Scheme.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get all schemes (filtered by userId for regular users, all for admins)
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {}

    console.log("🔍 GET /schemes - userId:", req.userId, "role:", req.role)

    // If admin: return all data
    if (req.role === "admin") {
      // Admin sees all schemes
      console.log("👤 Admin user - returning ALL schemes")
    } else if (req.userId) {
      // Normal user: return ONLY their own
      query.userId = req.userId
      console.log("✅ Regular user - filtering by userId:", req.userId)
    } else {
      // No userId and not admin: return empty
      console.log("⚠️ No userId identified - returning empty")
      return res.json([])
    }
    
    const schemes = await Scheme.find(query).populate("userId", "username")
    console.log("📊 Found schemes:", schemes.length)
    res.json(schemes)
  } catch (error) {
    console.error("Get schemes error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

// Create scheme
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" })
    }

    // Extract userId and userName from request with fallback
    console.log("Incoming userId:", req.body.userId)
    console.log("Incoming userName:", req.body.userName)
    console.log("Full request body:", req.body)
    const userId = req.body.userId || req.headers.userid || "temporary-user"
    const userName = req.body.userName || req.headers.username || "temporary-user"

    console.log("Saving scheme for userId:", userId)

    const scheme = new Scheme({
      title,
      description,
      userId: userId,
      userName: userName
    })

    const savedScheme = await scheme.save()
    console.log("✅ Scheme saved successfully:", savedScheme)
    await savedScheme.populate("userId", "username")
    res.status(201).json(savedScheme)

  } catch (error) {
    console.error("❌ Create scheme error:", error.message)
    res.status(500).json({ message: "Error saving scheme: " + error.message })
  }
})

// Delete scheme
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const scheme = await Scheme.findById(id)
    
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" })
    }

    // Allow deletion if:
    // 1. User is admin, OR
    // 2. Scheme belongs to the user, OR
    // 3. No userId set (backward compatibility)
    const canDelete = req.isAdmin || 
                     !req.userId || 
                     (scheme.userId && scheme.userId.toString() === req.userId)

    if (!canDelete) {
      return res.status(403).json({ message: "You can only delete your own schemes" })
    }

    const deletedScheme = await Scheme.findByIdAndDelete(id)
    res.json({ message: "Scheme deleted", scheme: deletedScheme })

  } catch (error) {
    console.error("Delete scheme error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

export default router
