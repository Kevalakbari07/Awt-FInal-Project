import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

// Load environment variables
dotenv.config()

// Import middleware
import { extractUserId } from "./middleware/extractUserId.js"

// Import models
import User from "./models/User.js"

// Import routes
import authRoutes from "./routes/auth.js"
import farmerRoutes from "./routes/farmers.js"
import milkRoutes from "./routes/milk.js"
import paymentRoutes from "./routes/payments.js"
import reportRoutes from "./routes/reports.js"
import schemeRoutes from "./routes/schemes.js"
import subscriptionRoutes from "./routes/subscriptions.js"
import settingsRoutes from "./routes/settings.js"

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dairyDB"

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",           // Local development
    "http://localhost:3000",           // Alternative local port
    process.env.FRONTEND_URL           // Production URL (from .env)
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())
app.use(extractUserId)

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB")
    
    // Create admin user if it doesn't exist
    try {
      const adminExists = await User.findOne({ username: "astro@133790" })
      
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("Rachit@672", 10)
        const adminUser = new User({
          username: "astro@133790",
          password: hashedPassword,
          role: "admin",
          subscriptionType: "admin-lifetime",
          isSubscriptionActive: true,
          subscriptionEndDate: new Date("2099-12-31") // Never expires
        })
        await adminUser.save()
        console.log("✅ Admin user created: astro@133790")
        console.log("   Password: Rachit@672")
        console.log("   Subscription: LIFETIME (never expires) ♾️")
      } else {
        // Update existing admin to have lifetime subscription
        await User.updateOne(
          { username: "astro@133790" },
          {
            role: "admin",
            subscriptionType: "admin-lifetime",
            isSubscriptionActive: true,
            subscriptionEndDate: new Date("2099-12-31")
          }
        )
        console.log("✅ Admin user updated: astro@133790")
        console.log("   Subscription: LIFETIME (never expires) ♾️")
      }
    } catch (error) {
      console.error("⚠️ Error creating/updating admin user:", error.message)
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message)
    process.exit(1)
  })

// Routes
app.use("/api", authRoutes)
app.use("/api/farmers", farmerRoutes)
app.use("/api/milk", milkRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/schemes", schemeRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/settings", settingsRoutes)

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" })
})

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Dairy Management System Backend is running" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({ message: "Server is down. Please try again later." })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          🐄 DAIRY MANAGEMENT SYSTEM BACKEND 🐄            ║
║                                                            ║
║  ✅ Server running on http://localhost:${PORT}            ║
║  ✅ MongoDB connected to ${MONGODB_URI}          ║
║                                                            ║
║  API Endpoints:                                          ║
║  - POST   /api/signup          (Create user)            ║
║  - POST   /api/login           (Login user)             ║
║  - GET    /api/farmers         (Get all farmers)        ║
║  - POST   /api/farmers         (Create farmer)          ║
║  - DELETE /api/farmers/:id     (Delete farmer)          ║
║  - GET    /api/milk            (Get milk collections)   ║
║  - POST   /api/milk            (Create milk entry)      ║
║  - GET    /api/payments        (Get all payments)       ║
║  - POST   /api/payments        (Create payment)         ║
║  - PUT    /api/payments/:id    (Update payment status)  ║
║  - GET    /api/reports         (Get all reports)        ║
║  - POST   /api/reports         (Create report)          ║
║  - DELETE /api/reports/:id     (Delete report)          ║
║  - GET    /api/schemes         (Get all schemes)        ║
║  - POST   /api/schemes         (Create scheme)          ║
║  - DELETE /api/schemes/:id     (Delete scheme)          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `)
})
