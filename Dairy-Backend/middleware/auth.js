import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info to request
    req.userId = decoded.userId
    req.username = decoded.username
    req.role = decoded.role

    next()

  } catch (error) {
    console.error("❌ Token verification error:", error.message)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Optional: Middleware to check if user is admin
export const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." })
  }
  next()
}
