import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bg from "../assets/Collection_unit.png"
import logo from "../assets/logo.png"
import "../styles/login.css"

import { FaEye, FaEyeSlash } from "react-icons/fa"
import CustomPopup from "../components/CustomPopup"

function Signup() {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null)

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

        if (confirmPassword.trim() === "")
            newErrors.confirmPassword = "Confirm password"

        else if (confirmPassword !== password)
            newErrors.confirmPassword = "Passwords don't match"

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0

    }

    const handleSignup = async () => {

        if (!validate()) return

        setLoading(true)

        try {
            const response = await fetch("http://localhost:5000/api/signup", {
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

            console.log("SIGNUP RESPONSE:", data)

            if (data.username && data.role) {
                // Success
                setPopup({ message: "Signup successful! Please login.", type: "success" })
                setTimeout(() => {
                    navigate("/")
                }, 2000)
            } else if (data.message) {
                // Error response from backend
                setPopup({ message: data.message, type: "error" })
                setLoading(false)
            }
        } catch (error) {
            console.error("Signup error:", error)
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

                    <h4 style={{ color: "white" }}>Create Account</h4>

                    <small style={{ color: "#eee" }}>
                        Join Dairy Management Platform
                    </small>

                </div>

                <input
                    className="form-control mb-1"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
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

                <div className="input-group mt-3">

                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    <button
                        className="btn btn-light"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        type="button"
                    >

                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}

                    </button>

                </div>

                {errors.confirmPassword &&
                    <small className="text-danger">{errors.confirmPassword}</small>
                }

                <button
                    className="btn btn-primary w-100 mt-4"
                    onClick={handleSignup}
                    disabled={loading}
                >

                    {loading ? "Creating Account..." : "Sign Up"}

                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <small style={{ color: "#ddd" }}>
                        Already have account? {" "}
                        <span
                            onClick={() => navigate("/")}
                            style={{
                                color: "#4CAF50",
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "underline"
                            }}
                        >
                            Login here
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

export default Signup
