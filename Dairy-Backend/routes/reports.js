import express from "express"
import Report from "../models/Report.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get all reports (filtered by userId for regular users, all for admins)
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {}

    console.log("🔍 GET /reports - userId:", req.userId, "role:", req.role)

    // If admin: return all data
    if (req.role === "admin") {
      // Admin sees all reports
      console.log("👤 Admin user - returning ALL reports")
    } else if (req.userId) {
      // Normal user: return ONLY their own
      query.userId = req.userId
      console.log("✅ Regular user - filtering by userId:", req.userId)
    } else {
      // No userId and not admin: return empty
      console.log("⚠️ No userId identified - returning empty")
      return res.json([])
    }
    
    const reports = await Report.find(query).sort({ createdAt: -1 }).populate("userId", "username")
    console.log("📊 Found reports:", reports.length)
    res.json(reports)
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

// Create report
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, date } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" })
    }

    // Extract userId and userName from request with fallback
    console.log("Incoming userId:", req.body.userId)
    console.log("Incoming userName:", req.body.userName)
    console.log("Full request body:", req.body)
    const userId = req.body.userId || req.headers.userid || "temporary-user"
    const userName = req.body.userName || req.headers.username || "temporary-user"

    console.log("Saving report for userId:", userId)

    const report = new Report({
      title,
      description,
      date: date || new Date().toLocaleDateString(),
      userId: userId,
      userName: userName
    })

    const savedReport = await report.save()
    console.log("✅ Report saved successfully:", savedReport)
    await savedReport.populate("userId", "username")
    res.status(201).json(savedReport)

  } catch (error) {
    console.error("❌ Create report error:", error.message)
    res.status(500).json({ message: "Error saving report: " + error.message })
  }
})

// Delete report
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const report = await Report.findById(id)
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    // Allow deletion if:
    // 1. User is admin, OR
    // 2. Report belongs to the user, OR
    // 3. No userId set (backward compatibility)
    const canDelete = req.isAdmin || 
                     !req.userId || 
                     (report.userId && report.userId.toString() === req.userId)

    if (!canDelete) {
      return res.status(403).json({ message: "You can only delete your own reports" })
    }

    const deletedReport = await Report.findByIdAndDelete(id)
    res.json({ message: "Report deleted", report: deletedReport })

  } catch (error) {
    console.error("Delete report error:", error)
    res.status(500).json({ message: "Something went wrong." })
  }
})

export default router
