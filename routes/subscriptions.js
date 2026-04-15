import express from "express"
import User from "../models/User.js"
import Subscription from "../models/Subscription.js"
import SubscriptionPlan from "../models/SubscriptionPlan.js"

const router = express.Router()

// ===== SUBSCRIPTION PLANS MANAGEMENT (ADMIN) =====

// Get all subscription plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 })
    res.json(plans)
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription plans", error: error.message })
  }
})

// Create new subscription plan (ADMIN)
router.post("/plans", async (req, res) => {
  try {
    const { planName, planType, duration, durationDays, maxUsers, price, features, description } = req.body

    if (!planName || !planType || !duration || !durationDays || maxUsers === undefined || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const newPlan = new SubscriptionPlan({
      planName,
      planType,
      duration,
      durationDays,
      maxUsers,
      price,
      features: features || [],
      description
    })

    const savedPlan = await newPlan.save()
    res.status(201).json({ message: "Subscription plan created successfully", plan: savedPlan })
  } catch (error) {
    res.status(500).json({ message: "Error creating subscription plan", error: error.message })
  }
})

// Update subscription plan (ADMIN)
router.put("/plans/:id", async (req, res) => {
  try {
    const { planName, price, features, description, isActive, durationDays } = req.body

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      {
        planName,
        price,
        features,
        description,
        isActive,
        durationDays,
        updatedAt: new Date()
      },
      { new: true }
    )

    res.json({ message: "Subscription plan updated successfully", plan: updatedPlan })
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription plan", error: error.message })
  }
})

// Delete subscription plan (ADMIN)
router.delete("/plans/:id", async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(req.params.id)
    res.json({ message: "Subscription plan deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting subscription plan", error: error.message })
  }
})

// ===== USER SUBSCRIPTIONS MANAGEMENT (ADMIN) =====

// Get all user subscriptions (ADMIN)
router.get("/admin/users", async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("users").sort({ createdAt: -1 })
    res.json(subscriptions)
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error: error.message })
  }
})

// Get all users with their subscription status (ADMIN)
router.get("/admin/all-users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("username fullName companyName subscriptionType subscriptionEndDate numberOfUsers isSubscriptionActive createdAt")
      .sort({ createdAt: -1 })
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
})

// Assign subscription to user (ADMIN)
router.post("/admin/assign-subscription", async (req, res) => {
  try {
    const { userId, planId, numberOfUsers } = req.body

    if (!userId || !planId) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    const plan = await SubscriptionPlan.findById(planId)
    if (!plan) return res.status(404).json({ message: "Plan not found" })

    // Generate subscription ID for new subscriptions
    const subscriptionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays)

    // Create subscription
    const subscription = new Subscription({
      subscriptionId,
      planType: plan.planType,
      users: [userId],
      numberOfUsers: numberOfUsers || plan.maxUsers,
      duration: plan.duration,
      price: plan.price,
      features: plan.features,
      expiresAt: expiryDate,
      isActive: true
    })

    const savedSubscription = await subscription.save()

    // Update user
    await User.findByIdAndUpdate(userId, {
      subscriptionId,
      subscriptionType: plan.planType,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: expiryDate,
      numberOfUsers: numberOfUsers || plan.maxUsers,
      isSubscriptionActive: true,
      notificationSent: false
    })

    res.json({ message: "Subscription assigned successfully", subscription: savedSubscription })
  } catch (error) {
    res.status(500).json({ message: "Error assigning subscription", error: error.message })
  }
})

// Update user subscription (ADMIN)
router.put("/admin/update-subscription/:userId", async (req, res) => {
  try {
    const { planId, numberOfUsers, extendDays } = req.body

    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (planId) {
      const plan = await SubscriptionPlan.findById(planId)
      if (!plan) return res.status(404).json({ message: "Plan not found" })

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays)

      await User.findByIdAndUpdate(req.params.userId, {
        subscriptionType: plan.planType,
        subscriptionEndDate: expiryDate,
        numberOfUsers: numberOfUsers || plan.maxUsers,
        notificationSent: false
      })
    }

    if (extendDays) {
      const currentEndDate = new Date(user.subscriptionEndDate)
      currentEndDate.setDate(currentEndDate.getDate() + extendDays)

      await User.findByIdAndUpdate(req.params.userId, {
        subscriptionEndDate: currentEndDate,
        notificationSent: false
      })
    }

    const updatedUser = await User.findById(req.params.userId)
    res.json({ message: "Subscription updated successfully", user: updatedUser })
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription", error: error.message })
  }
})

// Cancel user subscription (ADMIN)
router.post("/admin/cancel-subscription/:userId", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      isSubscriptionActive: false,
      subscriptionEndDate: new Date()
    })

    res.json({ message: "Subscription cancelled successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error cancelling subscription", error: error.message })
  }
})

// ===== CHECK SUBSCRIPTION STATUS =====

// Check user subscription status
router.get("/check-status/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    const now = new Date()
    const isExpired = user.subscriptionEndDate < now
    const daysRemaining = Math.ceil((user.subscriptionEndDate - now) / (1000 * 60 * 60 * 24))

    const status = {
      subscriptionType: user.subscriptionType,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      numberOfUsers: user.numberOfUsers,
      isActive: user.isSubscriptionActive && !isExpired,
      isExpired,
      daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
      isFreeTrialActive: user.subscriptionType === "free-trial" && !isExpired,
      notificationSent: user.notificationSent
    }

    res.json(status)
  } catch (error) {
    res.status(500).json({ message: "Error checking subscription status", error: error.message })
  }
})

// ===== USER PROFILE UPDATE =====

// Update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { fullName, companyName, profilePicture } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        fullName,
        companyName,
        profilePicture
      },
      { new: true }
    ).select("-password")

    res.json({ message: "Profile updated successfully", user: updatedUser })
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message })
  }
})

// Get user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message })
  }
})

// ===== MULTI-USER SUBSCRIPTION =====

// Add user to existing subscription
router.post("/add-to-subscription", async (req, res) => {
  try {
    const { newUserId, subscriptionId } = req.body

    if (!newUserId || !subscriptionId) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const subscription = await Subscription.findOne({ subscriptionId })
    if (!subscription) return res.status(404).json({ message: "Subscription not found" })

    if (subscription.users.length >= subscription.numberOfUsers) {
      return res.status(400).json({ message: "Subscription user limit reached" })
    }

    const newUser = await User.findById(newUserId)
    if (!newUser) return res.status(404).json({ message: "User not found" })

    subscription.users.push(newUserId)
    await subscription.save()

    await User.findByIdAndUpdate(newUserId, {
      subscriptionId,
      subscriptionType: subscription.planType,
      subscriptionStartDate: subscription.createdAt,
      subscriptionEndDate: subscription.expiresAt,
      numberOfUsers: subscription.numberOfUsers,
      isSubscriptionActive: true
    })

    res.json({ message: "User added to subscription successfully", subscription })
  } catch (error) {
    res.status(500).json({ message: "Error adding user to subscription", error: error.message })
  }
})

export default router
