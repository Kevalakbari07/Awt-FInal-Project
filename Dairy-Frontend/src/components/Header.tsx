import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaClock, FaWater, FaShieldAlt, FaUser, FaTimes, FaLock, FaIdBadge, FaCalendarAlt } from "react-icons/fa"
import axios from "axios"

interface SubscriptionStatus {
  subscriptionType: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  numberOfUsers: number
  isActive: boolean
  isExpired: boolean
  daysRemaining: number
  isFreeTrialActive: boolean
  notificationSent: boolean
}

function Header() {
    const [showProfile, setShowProfile] = useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)

    const navigate = useNavigate()
    const username = localStorage.getItem("username") || "User"
    const role = localStorage.getItem("role") || "user"
    const userId = localStorage.getItem("userId")

    useEffect(() => {
        if (userId) {
            fetchSubscriptionStatus()
        }
    }, [userId])

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/subscriptions/check-status/${userId}`)
            setSubscriptionStatus(response.data)
        } catch (error) {
            console.error("Error fetching subscription status:", error)
        }
    }

    const logout = () => {
        localStorage.clear()
        navigate("/", { replace: true })
    }

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }

    return (
        <div
            style={{
                width: "100%",
                height: "70px",
                background: "linear-gradient(135deg, #0369a1 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 30px",
                boxShadow: "0 4px 12px rgba(3, 105, 161, 0.15)",
                color: "white"
            }}
        >

            {/* Left Side - Logo/Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <FaWater size={24} />
                </div>
                <div>
                    <h5 style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>
                        Dairy Management System
                    </h5>
                    <small style={{ opacity: 0.9, fontSize: "12px", textTransform: "capitalize" }}>
                        Smart Farm Operations
                    </small>
                </div>
            </div>

            {/* Right Side - User Info & Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                
                {/* Clock */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.9 }}>
                    <FaClock style={{ fontSize: "16px" }} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        {getCurrentTime()}
                    </span>
                </div>

                {/* User Profile */}
                <div
                    onClick={() => setShowProfile(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 15px",
                        background: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"
                    }}
                >
                    <div style={{
                        width: "35px",
                        height: "35px",
                        background: "rgba(255, 255, 255, 0.25)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "bold"
                    }}>
                        {role === "admin" ? <FaShieldAlt size={18} /> : <FaUser size={18} />}
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>
                            {username.toUpperCase()}
                        </div>
                        <div style={{ fontSize: "11px", opacity: 0.7, textTransform: "capitalize" }}>
                            {role}
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                        e.currentTarget.style.transform = "translateY(0)"
                    }}
                >
                    <FaSignOutAlt style={{ fontSize: "14px" }} />
                    <span>Logout</span>
                </button>

            </div>

            {/* User Profile Modal */}
            {showProfile && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                        backdropFilter: "blur(5px)"
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowProfile(false)
                        }
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "30px",
                            width: "90%",
                            maxWidth: "420px",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                            position: "relative",
                            animation: "slideUp 0.3s ease"
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowProfile(false)}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "15px",
                                background: "none",
                                border: "none",
                                fontSize: "24px",
                                cursor: "pointer",
                                color: "#6b7280",
                                padding: "5px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* Profile Header */}
                        <div style={{ textAlign: "center", marginBottom: "25px" }}>
                            <div style={{
                                width: "70px",
                                height: "70px",
                                background: role === "admin" 
                                    ? "linear-gradient(135deg, #0369a1, #0284c7)"
                                    : "linear-gradient(135deg, #10b981, #059669)",
                                borderRadius: "50%",
                                margin: "0 auto 15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "white"
                            }}>
                                {role === "admin" ? <FaShieldAlt size={32} /> : <FaUser size={32} />}
                            </div>
                            <h3 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "22px", fontWeight: "700" }}>
                                {username.toUpperCase()}
                            </h3>
                            <p style={{ margin: "0", color: "#6b7280", fontSize: "13px", textTransform: "capitalize" }}>
                                {role} Account
                            </p>
                        </div>

                        {/* Profile Details */}
                        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
                            <div style={{ marginBottom: "18px" }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "12px",
                                    padding: "12px",
                                    background: "#f3f4f6",
                                    borderRadius: "10px"
                                }}>
                                    <FaIdBadge style={{ 
                                        color: role === "admin" ? "#0369a1" : "#10b981",
                                        fontSize: "18px" 
                                    }} />
                                    <div>
                                        <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>USERNAME</p>
                                        <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                            {username}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "0" }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "12px",
                                    padding: "12px",
                                    background: "#f3f4f6",
                                    borderRadius: "10px"
                                }}>
                                    <FaLock style={{ 
                                        color: role === "admin" ? "#ef4444" : "#f59e0b",
                                        fontSize: "18px" 
                                    }} />
                                    <div>
                                        <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>ROLE</p>
                                        <p style={{ 
                                            margin: "0", 
                                            fontSize: "14px", 
                                            color: "#1f2937", 
                                            fontWeight: "600",
                                            textTransform: "capitalize"
                                        }}>
                                            {role}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {role !== "admin" && subscriptionStatus && (
                                <div style={{ marginTop: "18px" }}>
                                    <div style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "12px",
                                        padding: "12px",
                                        background: subscriptionStatus.isFreeTrialActive ? "#fef3c7" : subscriptionStatus.isActive ? "#dcfce7" : "#fee2e2",
                                        borderRadius: "10px"
                                    }}>
                                        <FaCalendarAlt style={{ 
                                            color: subscriptionStatus.isFreeTrialActive ? "#f59e0b" : subscriptionStatus.isActive ? "#10b981" : "#ef4444",
                                            fontSize: "18px" 
                                        }} />
                                        <div>
                                            <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>SUBSCRIPTION</p>
                                            <p style={{ 
                                                margin: "0", 
                                                fontSize: "14px", 
                                                color: "#1f2937", 
                                                fontWeight: "600"
                                            }}>
                                                {subscriptionStatus.isFreeTrialActive ? "Free Trial" : subscriptionStatus.isActive ? "Active" : "Expired"}
                                            </p>
                                            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: subscriptionStatus.isExpired ? "#ef4444" : subscriptionStatus.isFreeTrialActive ? "#f59e0b" : "#10b981" }}>
                                                {subscriptionStatus.daysRemaining} days remaining
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => setShowProfile(false)}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "#f3f4f6",
                                    border: "2px solid #e5e7eb",
                                    color: "#1f2937",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#e5e7eb"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6"
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    logout()
                                    setShowProfile(false)
                                }}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)"
                                }}
                            >
                                <FaSignOutAlt style={{ marginRight: "8px" }} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Header