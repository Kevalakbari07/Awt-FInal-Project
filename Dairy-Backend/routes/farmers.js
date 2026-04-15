import express from "express"
import Farmer from "../models/Farmer.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Helper function to get next available code number in slot range
// Slots: 1-100, 101-200, 201-300, etc.
const getNextAvailableCodeNumber = async (userId) => {
  try {
    // Get all code numbers for this user, sorted
    const existingFarmers = await Farmer.find({ userId }).select("codeNumber").sort({ codeNumber: 1 })
    const usedCodes = existingFarmers.map(f => f.codeNumber)
    
    // Find next available number starting from 1
    let codeNumber = 1
    while (usedCodes.includes(codeNumber)) {
      codeNumber++
    }
    
    return codeNumber
  } catch (error) {
    console.error("Error getting next code number:", error)
    throw error
  }
}

// Get all farmers (filtered by userId for regular users, all for admins)
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {}

    console.log("🔍 GET /farmers - userId:", req.userId, "role:", req.role)

    // If admin: return all data
    if (req.role === "admin") {
      // Admin sees all farmers (no userId filtering)
      console.log("👤 Admin user - returning ALL farmers")
    } else if (req.userId) {
      // Normal user: return ONLY their own farmers
      query.userId = req.userId
      console.log("✅ Regular user - filtering by userId:", req.userId)
    } else {
      // No userId and not admin: return empty
      console.log("⚠️ No userId identified - returning empty")
      return res.json([])
    }
    
    const farmers = await Farmer.find(query).sort({ codeNumber: 1 }).populate("userId", "username")
    console.log("📊 Found farmers:", farmers.length)
    res.json(farmers)
  } catch (error) {
    console.error("Get farmers error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

// Get next available code number for UI
router.get("/next-code", verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const nextCode = await getNextAvailableCodeNumber(userId)
    
    console.log("📝 Next available code number for user:", userId, "is:", nextCode)
    res.json({ nextCodeNumber: nextCode })
  } catch (error) {
    console.error("Error getting next code:", error)
    res.status(500).json({ message: "Error getting next code number" })
  }
})

// Create farmer
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, village, phone, codeNumber } = req.body

    if (!name || !village) {
      return res.status(400).json({ message: "Name and village required" })
    }

    if (!codeNumber || codeNumber < 1) {
      return res.status(400).json({ message: "Valid code number (1+) required" })
    }

    // Use userId and username from JWT token (via auth middleware)
    const userId = req.userId
    const userName = req.username

    // Check if code number already exists for this user
    const existingFarmer = await Farmer.findOne({ userId, codeNumber })
    if (existingFarmer) {
      return res.status(400).json({ message: `Code number ${codeNumber} already assigned to another farmer` })
    }

    console.log("Saving farmer for userId:", userId, "codeNumber:", codeNumber)

    const farmer = new Farmer({
      name,
      village,
      phone: phone || "",
      codeNumber,
      userId: userId,
      userName: userName
    })

    const savedFarmer = await farmer.save()
    console.log("✅ Farmer saved successfully:", savedFarmer)
    await savedFarmer.populate("userId", "username")
    res.status(201).json(savedFarmer)

  } catch (error) {
    console.error("❌ Create farmer error:", error.message)
    res.status(500).json({ message: "Error saving farmer: " + error.message })
  }
})

// Update farmer
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, village, phone, codeNumber } = req.body

    const farmer = await Farmer.findById(id)

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }

    // Check authorization
    const canUpdate = req.role === "admin" || 
                     !req.userId || 
                     (farmer.userId && farmer.userId.toString() === req.userId)

    if (!canUpdate) {
      return res.status(403).json({ message: "You can only edit your own farmers" })
    }

    // If code number is being changed, check uniqueness
    if (codeNumber && codeNumber !== farmer.codeNumber) {
      const existingFarmer = await Farmer.findOne({ 
        userId: farmer.userId, 
        codeNumber,
        _id: { $ne: id }
      })
      if (existingFarmer) {
        return res.status(400).json({ message: `Code number ${codeNumber} already assigned to another farmer` })
      }
    }

    // Update fields
    if (name) farmer.name = name
    if (village) farmer.village = village
    if (phone) farmer.phone = phone
    if (codeNumber) farmer.codeNumber = codeNumber

    const updatedFarmer = await farmer.save()
    console.log("✅ Farmer updated:", updatedFarmer)
    await updatedFarmer.populate("userId", "username")
    res.json(updatedFarmer)

  } catch (error) {
    console.error("❌ Update farmer error:", error.message)
    res.status(500).json({ message: "Error updating farmer: " + error.message })
  }
})

// Delete farmer
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const farmer = await Farmer.findById(id)
    
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" })
    }

    // Allow deletion if:
    // 1. User is admin, OR
    // 2. Farmer belongs to the user, OR
    // 3. No userId set (backward compatibility)
    const canDelete = req.role === "admin" || 
                     !req.userId || 
                     (farmer.userId && farmer.userId.toString() === req.userId)

    if (!canDelete) {
      return res.status(403).json({ message: "You can only delete your own farmers" })
    }

    const deletedFarmer = await Farmer.findByIdAndDelete(id)
    console.log("✅ Farmer deleted - code number", deletedFarmer.codeNumber, "is now available")
    res.json({ message: "Farmer deleted", farmer: deletedFarmer })

  } catch (error) {
    console.error("Delete farmer error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

export default router
