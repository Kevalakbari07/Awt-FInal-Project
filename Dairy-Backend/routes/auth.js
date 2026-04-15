import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

// Signup API
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" })
    }

    // Check if user exists
    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Create new user
    // Check if this is the admin user
    const role = username.toLowerCase() === "astro@133790" ? "admin" : "user"
    
    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role
    })

    await newUser.save()

    return res.status(201).json({
      message: "User created successfully",
      username: newUser.username,
      role: newUser.role,
      userId: newUser._id
    })

  } catch (error) {
    console.error("Signup error:", error)
    return res.status(500).json({ message: "Server is down. Please try again later." })
  }
})

// Login API
router.post("/login", async (req, res) => {
  try {
    // DEBUG: Log incoming request
    console.log("BODY:", req.body)
    console.log("USERNAME RECEIVED:", req.body.username)
    console.log("PASSWORD RECEIVED:", req.body.password)

    // Get and trim inputs
    const username = req.body.username?.trim()
    const password = req.body.password?.trim()

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" })
    }

    // DEBUG: Fetch all users to see what's in DB
    const allUsers = await User.find()
    console.log("ALL USERS IN DB:", allUsers.map(u => ({ username: u.username, role: u.role })))

    // Find user by username using case-insensitive regex
    const user = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    })

    console.log("USER FOUND:", user ? { username: user.username, role: user.role } : "NOT FOUND")

    if (!user) {
      console.log("❌ Login failed: User not found for username:", username)
      return res.status(404).json({ message: "User not found. Please signup first." })
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password)
    
    if (!isMatch) {
      console.log("❌ Login failed: Invalid password for user:", username)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    // Return success with token and user info
    console.log("✅ Login successful for user:", username, "with role:", user.role)
    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      username: user.username,
      role: user.role
    })

  } catch (error) {
    console.error("❌ Login error:", error)
    return res.status(500).json({ message: "Server is down. Please try again later." })
  }
})

export default router
