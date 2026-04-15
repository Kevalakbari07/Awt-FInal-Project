// Middleware to extract userId and username from request
// Accepts userId and username from:
// 1. Headers: X-User-Id header & X-User-Name header
// 2. Body: userId & userName fields in request body

export const extractUserId = (req, res, next) => {
  try {
    // Try to get userId from headers first
    const userIdFromHeader = req.headers["x-user-id"]
    const userNameFromHeader = req.headers["x-user-name"]
    
    // Try to get userId and userName from body
    const userIdFromBody = req.body?.userId
    const userNameFromBody = req.body?.userName
    
    console.log("🔍 Middleware - URL:", req.path, "Method:", req.method)
    console.log("🔍 Middleware - Body userId:", userIdFromBody)
    console.log("🔍 Middleware - Body:", req.body)
    
    // Use whichever is available
    const userId = userIdFromHeader || userIdFromBody
    const userName = userNameFromHeader || userNameFromBody
    
    console.log("🔍 Middleware - Final userId:", userId, "userName:", userName)
    
    // Attach to request object
    req.userId = userId || null
    req.userName = userName || null
    
    // Check if user is admin (optional - can be added to req.body)
    req.isAdmin = req.body?.isAdmin === true
    
    next()
  } catch (error) {
    console.error("Error extracting userId:", error)
    req.userId = null
    req.userName = null
    next()
  }
}
