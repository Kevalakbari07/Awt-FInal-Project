import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bg from "../assets/Collection_unit.png"
import logo from "../assets/logo.png"
import "../styles/login.css"

import { FaEye, FaEyeSlash, FaTractor, FaShieldAlt } from "react-icons/fa"
import CustomPopup from "../components/CustomPopup"

function Login() {

    const navigate = useNavigate()

    const [loginType, setLoginType] = useState<"user" | "admin">("user")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null)

    // Update username when login type changes
    const handleLoginTypeChange = (type: "user" | "admin") => {
        setLoginType(type)
        setErrors({})
        
        if (type === "admin") {
            setUsername("astro@133790")
        } else {
            setUsername("")
        }
    }

    const validate = () => {

        const newErrors: any = {}

        if (username.trim() === "")
            newErrors.username = "Username required"

        else if (username.length < 4)
            newErrors.username = "Minimum 4 characters"

        if (password.trim() === "")
            newErrors.password = "Password required"

        else if (password.length < 6)
            newErrors.password = "Minimum 6 characters"

        else if (!/[A-Z]/.test(password))
            newErrors.password = "Add one uppercase letter"

        else if (!/[0-9]/.test(password))
            newErrors.password = "Add one number"

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0

    }

    const handleLogin = async () => {

        if (!validate()) return

        setLoading(true)

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim()
                })
            })

            const data = await response.json()

            console.log("LOGIN RESPONSE:", data)

            if (data.role) {
                // Success - save userId, username, role, and JWT token
                console.log("✅ Raw response data:", data)
                console.log("✅ userId type:", typeof data.userId, "value:", data.userId)
                
                // Ensure userId is stored as string
                const userIdString = String(data.userId)
                const usernameString = String(data.username)
                
                console.log("✅ Storing - userId:", userIdString, "username:", usernameString)
                
                localStorage.setItem("userId", userIdString)
                localStorage.setItem("username", usernameString)
                localStorage.setItem("role", data.role)
                localStorage.setItem("token", data.token) // Store JWT token
                
                console.log("✅ Verification - userId:", localStorage.getItem("userId"))
                console.log("✅ Verification - username:", localStorage.getItem("username"))
                console.log("✅ Verification - role:", localStorage.getItem("role"))
                console.log("✅ Verification - token:", localStorage.getItem("token")?.substring(0, 20) + "...")

                if (data.role === "admin") {
                    navigate("/admin-dashboard")
                } else {
                    navigate("/dashboard")
                }
            } else if (data.message) {
                // Error response from backend
                setPopup({ message: data.message, type: "error" })
                setLoading(false)
            }
        } catch (error) {
            console.error("Login error:", error)
            setPopup({ message: "Server is down. Please try again later.", type: "error" })
            setLoading(false)
        }

    }

    return (

        <div
            style={{
                height: "100vh",
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative"
            }}
        >

            <div className="login-overlay"></div>

            {/* floating drops */}

            <div className="milk-drop" style={{ left: "10%", animationDelay: "1s" }}></div>
            <div className="milk-drop" style={{ left: "25%", animationDelay: "4s" }}></div>
            <div className="milk-drop" style={{ left: "60%", animationDelay: "2s" }}></div>
            <div className="milk-drop" style={{ left: "80%", animationDelay: "5s" }}></div>

            <div
                style={{
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.15)",
                    padding: "40px",
                    borderRadius: "16px",
                    width: "360px",
                    boxShadow: "0 15px 40px rgba(0,0,0,.35)",
                    zIndex: 2
                }}
            >

                <div style={{ textAlign: "center", marginBottom: "25px" }}>

                    <img src={logo} style={{ width: "60px", marginBottom: "10px" }} />

                    <h4 style={{ color: "white" }}>Dairy Management</h4>

                    <small style={{ color: "#eee" }}>
                        Smart Dairy Operations Platform
                    </small>

                </div>

                {/* Login Type Selector */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <button
                        className={`btn w-100 ${loginType === "user" ? "btn-success" : "btn-outline-light"}`}
                        onClick={() => handleLoginTypeChange("user")}
                        style={{ fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        <FaTractor /> Farmer Login
                    </button>
                    <button
                        className={`btn w-100 ${loginType === "admin" ? "btn-warning" : "btn-outline-light"}`}
                        onClick={() => handleLoginTypeChange("admin")}
                        style={{ fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        <FaShieldAlt /> Admin Login
                    </button>
                </div>

                <input
                    className="form-control mb-1"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    readOnly={loginType === "admin"}
                    style={{ cursor: loginType === "admin" ? "not-allowed" : "auto" }}
                />

                {errors.username &&
                    <small className="text-danger">{errors.username}</small>
                }

                <div className="input-group mt-3">

                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <button
                        className="btn btn-light"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                    >

                        {showPassword ? <FaEyeSlash /> : <FaEye />}

                    </button>

                </div>

                {errors.password &&
                    <small className="text-danger">{errors.password}</small>
                }

                <button
                    className="btn btn-primary w-100 mt-4"
                    onClick={handleLogin}
                    disabled={loading}
                >

                    {loading ? "Signing In..." : "Login"}

                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <small style={{ color: "#ddd" }}>
                        New user? {" "}
                        <span
                            onClick={() => navigate("/signup")}
                            style={{
                                color: "#4CAF50",
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "underline"
                            }}
                        >
                            Sign up here
                        </span>
                    </small>
                </div>

            </div>

            {popup && (
                <CustomPopup
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                />
            )}

        </div>

    )

}

export default Login