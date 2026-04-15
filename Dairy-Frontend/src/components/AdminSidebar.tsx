import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUsers, FaMoneyBill, FaChartBar, FaHome, FaGift, FaBars, FaTimes, FaSignOutAlt, FaLock, FaShieldAlt, FaIdBadge } from "react-icons/fa"

function AdminSidebar() {

    const [collapsed, setCollapsed] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const navigate = useNavigate()
    const username = localStorage.getItem("username") || "Admin"
    const role = localStorage.getItem("role") || "admin"

    const handleLogout = () => {
        localStorage.clear()
        navigate("/", { replace: true })
    }

    const menuItems = [
        { icon: <FaHome />, label: "Dashboard", path: "/admin-dashboard" },
        { icon: <FaUsers />, label: "Manage Farmers", path: "/manage-farmers" },
        { icon: <FaMoneyBill />, label: "Approve Payments", path: "/manage-payments" },
        { icon: <FaGift />, label: "Manage Schemes", path: "/manage-schemes" },
        { icon: <FaChartBar />, label: "Manage Reports", path: "/manage-reports" },
        { icon: <FaShieldAlt />, label: "Subscription Plans", path: "/manage-subscription-plans" },
        { icon: <FaUsers />, label: "User Subscriptions", path: "/manage-user-subscriptions" }
    ]

    return (
        <div
            style={{
                width: collapsed ? "80px" : "250px",
                height: "100vh",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                color: "white",
                padding: "20px 0",
                position: "fixed",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                boxShadow: "4px 0 15px rgba(0, 0, 0, 0.3)",
                zIndex: 1000
            }}
        >

            {/* Header with Toggle */}
            <div style={{ padding: "0 15px", marginBottom: "30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {!collapsed && (
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaLock size={20} /> Admin Panel
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

            {/* Admin Profile Section */}
            {!collapsed && (
                <div 
                    onClick={() => setShowProfile(true)}
                    style={{
                        padding: "15px",
                        margin: "0 15px 20px",
                        background: "rgba(245, 158, 11, 0.1)",
                        borderRadius: "12px",
                        borderLeft: "4px solid #f59e0b",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "2px solid rgba(245, 158, 11, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)"
                        e.currentTarget.style.borderColor = "#f59e0b"
                        e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)"
                        e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.3)"
                        e.currentTarget.style.transform = "translateY(0)"
                    }}
                >
                    <div style={{
                        width: "50px",
                        height: "50px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        fontWeight: "bold"
                    }}>
                        <FaShieldAlt size={24} />
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", textTransform: "capitalize" }}>
                        {username.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#a19ecb" }}>
                        Administrator
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
                            e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)"
                            e.currentTarget.style.borderLeft = "4px solid #f59e0b"
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

            {/* Admin Profile Modal */}
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
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                borderRadius: "50%",
                                margin: "0 auto 15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "white"
                            }}>
                                <FaShieldAlt size={32} />
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
                                    <FaIdBadge style={{ color: "#f59e0b", fontSize: "18px" }} />
                                    <div>
                                        <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>USERNAME</p>
                                        <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                            {username}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "18px" }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "12px",
                                    padding: "12px",
                                    background: "#f3f4f6",
                                    borderRadius: "10px"
                                }}>
                                    <FaLock style={{ color: "#ef4444", fontSize: "18px" }} />
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

                            <div style={{ marginBottom: "0" }}>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "12px",
                                    padding: "12px",
                                    background: "#f3f4f6",
                                    borderRadius: "10px"
                                }}>
                                    <FaShieldAlt style={{ color: "#0369a1", fontSize: "18px" }} />
                                    <div>
                                        <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>ACCOUNT TYPE</p>
                                        <p style={{ margin: "0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                            Administrator
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                                onClick={handleLogout}
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

export default AdminSidebar
