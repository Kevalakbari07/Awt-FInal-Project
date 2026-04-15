import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaHome, FaUsers, FaMoneyBill, FaClipboardList, FaChartBar, FaGift, FaBars, FaTimes, FaSignOutAlt, FaWater, FaUser, FaIdBadge, FaEdit, FaCheck, FaCalendarAlt, FaReceipt } from "react-icons/fa"
import axios from "axios"

interface SubscriptionStatus {
    isFreeTrialActive: boolean
    isActive: boolean
    isExpired: boolean
    daysRemaining: number
}

function Sidebar() {

    const [collapsed, setCollapsed] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
    const [profileData, setProfileData] = useState({
        fullName: "",
        companyName: "",
        profilePicture: null
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const userId = localStorage.getItem("userId")
    const username = localStorage.getItem("username") || "Farmer"
    const role = localStorage.getItem("role") || "user"

    useEffect(() => {
        fetchUserProfile()
        fetchSubscriptionStatus()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/subscriptions/profile/${userId}`)
            setProfileData({
                fullName: response.data.fullName || "",
                companyName: response.data.companyName || "",
                profilePicture: response.data.profilePicture
            })
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
    }

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/subscriptions/check-status/${userId}`)
            setSubscriptionStatus(response.data)
        } catch (error) {
            console.error("Error fetching subscription:", error)
        }
    }

    const handleSaveProfile = async () => {
        try {
            setLoading(true)
            await axios.put(`http://localhost:5000/api/subscriptions/profile/${userId}`, profileData)
            setIsEditing(false)
            fetchUserProfile()
        } catch (error) {
            console.error("Error saving profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate("/", { replace: true })
    }

    const menuItems = [
        { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
        { icon: <FaUsers />, label: "Farmers", path: "/farmers" },
        { icon: <FaClipboardList />, label: "Milk Collection", path: "/milk" },
        { icon: <FaMoneyBill />, label: "Payments", path: "/payments" },
        { icon: <FaReceipt />, label: "Payment Summary", path: "/payments-summary" },
        { icon: <FaChartBar />, label: "Reports", path: "/reports" },
        { icon: <FaGift />, label: "Schemes", path: "/schemes" }
    ]

    return (
        <div
            className="d-none d-md-flex"
            style={{
                width: collapsed ? "80px" : "250px",
                height: "100vh",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                color: "white",
                padding: "20px 0",
                position: "fixed",
                flexDirection: "column",
                transition: "all 0.3s ease",
                boxShadow: "4px 0 15px rgba(0, 0, 0, 0.3)",
                zIndex: 1000
            }}
        >

            {/* Header with Toggle */}
            <div style={{ padding: "0 15px", marginBottom: "30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {!collapsed && (
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#7c3aed", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaWater size={20} /> Dairy
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "5px"
                    }}
                >
                    {collapsed ? <FaBars /> : <FaTimes />}
                </button>
            </div>

            {/* User Profile Section */}
            {!collapsed && (
                <div 
                    onClick={() => setShowProfile(true)}
                    style={{
                        padding: "15px",
                        margin: "0 15px 20px",
                        background: "rgba(124, 58, 237, 0.1)",
                        borderRadius: "12px",
                        borderLeft: "4px solid #7c3aed",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "2px solid rgba(124, 58, 237, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)"
                        e.currentTarget.style.borderColor = "#7c3aed"
                        e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(124, 58, 237, 0.1)"
                        e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)"
                        e.currentTarget.style.transform = "translateY(0)"
                    }}
                >
                    <div style={{
                        width: "50px",
                        height: "50px",
                        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        fontWeight: "bold"
                    }}>
                        <FaUser size={24} />
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                        {username.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#a19ecb" }}>
                        Farmer User
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", padding: "0 10px", overflowY: "auto" }}>
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: collapsed ? "0" : "12px",
                            padding: "12px 15px",
                            textDecoration: "none",
                            color: "white",
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            background: "transparent",
                            fontSize: collapsed ? "20px" : "14px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            cursor: "pointer"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)"
                            e.currentTarget.style.borderLeft = "4px solid #7c3aed"
                            e.currentTarget.style.paddingLeft = collapsed ? "15px" : "15px"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent"
                            e.currentTarget.style.borderLeft = "none"
                        }}
                    >
                        <span style={{ minWidth: collapsed ? "auto" : "20px" }}>{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>

            {/* Logout Button */}
            <div style={{ padding: "0 10px", marginTop: "auto" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "12px 15px",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        border: "none",
                        color: "white",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: collapsed ? "16px" : "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        gap: collapsed ? "0" : "10px",
                        transition: "all 0.3s ease",
                        fontWeight: "600"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #ef4444, #dc2626)"
                        e.currentTarget.style.transform = "translateY(0)"
                    }}
                >
                    <FaSignOutAlt />
                    {!collapsed && <span>Logout</span>}
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
                                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                                borderRadius: "50%",
                                margin: "0 auto 15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "white"
                            }}>
                                <FaUser size={32} />
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
                            {isEditing ? (
                                <>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", display: "block", marginBottom: "5px" }}>
                                            FULL NAME
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                boxSizing: "border-box"
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", display: "block", marginBottom: "5px" }}>
                                            COMPANY/DAIRY NAME
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.companyName}
                                            onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                boxSizing: "border-box"
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginBottom: "18px" }}>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "12px",
                                            padding: "12px",
                                            background: "#f3f4f6",
                                            borderRadius: "10px"
                                        }}>
                                            <FaIdBadge style={{ color: "#0369a1", fontSize: "18px" }} />
                                            <div>
                                                <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>USERNAME</p>
                                                <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                                    {username}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {profileData.fullName && (
                                        <div style={{ marginBottom: "18px" }}>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "12px",
                                                padding: "12px",
                                                background: "#f3f4f6",
                                                borderRadius: "10px"
                                            }}>
                                                <FaUser style={{ color: "#10b981", fontSize: "18px" }} />
                                                <div>
                                                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>FULL NAME</p>
                                                    <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                                        {profileData.fullName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {profileData.companyName && (
                                        <div style={{ marginBottom: "18px" }}>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "12px",
                                                padding: "12px",
                                                background: "#f3f4f6",
                                                borderRadius: "10px"
                                            }}>
                                                <FaGift style={{ color: "#f59e0b", fontSize: "18px" }} />
                                                <div>
                                                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>DAIRY/COMPANY</p>
                                                    <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                                        {profileData.companyName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {subscriptionStatus && (
                                        <div style={{ marginBottom: "0" }}>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "12px",
                                                padding: "12px",
                                                background: subscriptionStatus.isExpired ? "#fee2e2" : "#f0fdf4",
                                                borderRadius: "10px"
                                            }}>
                                                <FaCalendarAlt style={{ 
                                                    color: (subscriptionStatus?.isExpired) ? "#ef4444" : "#10b981", 
                                                    fontSize: "18px" 
                                                }} />
                                                <div>
                                                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>SUBSCRIPTION</p>
                                                    <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                                        {subscriptionStatus?.isFreeTrialActive ? "Free Trial" : subscriptionStatus?.isActive ? "Active" : "Expired"}
                                                    </p>
                                                    <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: subscriptionStatus?.isExpired ? "#ef4444" : "#16a34a" }}>
                                                        {subscriptionStatus?.daysRemaining ?? 0} days remaining
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
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
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            background: "linear-gradient(135deg, #10b981, #059669)",
                                            border: "none",
                                            color: "white",
                                            borderRadius: "10px",
                                            cursor: loading ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            transition: "all 0.3s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            opacity: loading ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) e.currentTarget.style.transform = "translateY(-2px)"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)"
                                        }}
                                    >
                                        <FaCheck /> {loading ? "Saving..." : "Save"}
                                    </button>
                                </>
                            ) : (
                                <>
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
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            background: "linear-gradient(135deg, #0369a1, #0284c7)",
                                            border: "none",
                                            color: "white",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            transition: "all 0.3s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)"
                                        }}
                                    >
                                        <FaEdit /> Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Sidebar