import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaCheckCircle, FaGift, FaArrowRight } from "react-icons/fa"
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

interface UserData {
  companyName?: string
  fullName?: string
  username: string
}

function SubscriptionPage() {
  const navigate = useNavigate()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = localStorage.getItem("userId")

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/subscriptions/check-status/${userId}`)
      setSubscriptionStatus(response.data)

      const userRes = await axios.get(`http://localhost:5000/api/subscriptions/profile/${userId}`)
      setUserData(userRes.data)
    } catch (error) {
      console.error("Error fetching subscription status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0369a1 0%, #10b981 100%)"
      }}>
        <div style={{ fontSize: "24px", color: "white", fontWeight: "600" }}>Loading subscription details...</div>
      </div>
    )
  }

  const getStatusColor = () => {
    if (!subscriptionStatus?.isActive) return "#ef4444"
    if (subscriptionStatus?.isFreeTrialActive) return "#f59e0b"
    return "#10b981"
  }

  const getStatusText = () => {
    if (!subscriptionStatus?.isActive) return "Subscription Expired"
    if (subscriptionStatus?.isFreeTrialActive) return "Free Trial Active"
    return "Subscription Active"
  }

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px"
      }}>
        {/* Header */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          marginBottom: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "15px"
          }}>
            {subscriptionStatus?.isFreeTrialActive ? "🎁" : subscriptionStatus?.isActive ? "✅" : "⏰"}
          </div>
          <h2 style={{ margin: "0 0 10px 0", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>
            Welcome to Dairy Management System!
          </h2>
          <p style={{ margin: "0", color: "#6b7280", fontSize: "16px" }}>
            {userData?.companyName || userData?.fullName || userData?.username}
          </p>
        </div>

        {/* Subscription Status Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          borderLeft: `5px solid ${getStatusColor()}`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <FaCheckCircle style={{ fontSize: "32px", color: getStatusColor() }} />
            <div>
              <h3 style={{ margin: "0", color: "#1f2937", fontSize: "18px", fontWeight: "700" }}>
                {getStatusText()}
              </h3>
              <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                {subscriptionStatus?.subscriptionType === "free-trial" ? "Free Trial Period" : subscriptionStatus?.subscriptionType}
              </p>
            </div>
          </div>

          {/* Status Details Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <div style={{
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                START DATE
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                {subscriptionStatus?.subscriptionStartDate ? new Date(subscriptionStatus.subscriptionStartDate).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div style={{
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                EXPIRY DATE
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                {subscriptionStatus?.subscriptionEndDate ? new Date(subscriptionStatus.subscriptionEndDate).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div style={{
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                DAYS REMAINING
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                {subscriptionStatus?.daysRemaining ?? 0} days
              </p>
            </div>

            <div style={{
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                USERS ALLOWED
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                {subscriptionStatus?.numberOfUsers} {subscriptionStatus?.numberOfUsers === 1 ? "user" : "users"}
              </p>
            </div>
          </div>

          {/* Features or Warnings */}
          {subscriptionStatus?.isExpired && (
            <div style={{
              padding: "12px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              ⚠️ Your subscription has expired. Please renew to continue using the system.
            </div>
          )}

          {subscriptionStatus?.daysRemaining !== undefined && subscriptionStatus.daysRemaining <= 5 && subscriptionStatus.daysRemaining > 0 && (
            <div style={{
              padding: "12px",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              color: "#92400e",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              ⏰ Your subscription expires in {subscriptionStatus?.daysRemaining ?? 0} days. Renew now to avoid interruption.
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1f2937", fontSize: "18px", fontWeight: "700" }}>
            <FaGift style={{ marginRight: "8px" }} />
            Included Features
          </h3>
          <ul style={{ margin: "0", padding: "0", listStyle: "none" }}>
            <li style={{
              padding: "12px 0",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#1f2937"
            }}>
              <FaCheckCircle style={{ color: "#10b981" }} />
              <span>Full access to Milk Collection Management</span>
            </li>
            <li style={{
              padding: "12px 0",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#1f2937"
            }}>
              <FaCheckCircle style={{ color: "#10b981" }} />
              <span>Complete Farmer Records Management</span>
            </li>
            <li style={{
              padding: "12px 0",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#1f2937"
            }}>
              <FaCheckCircle style={{ color: "#10b981" }} />
              <span>Dairy Scheme Participation</span>
            </li>
            <li style={{
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#1f2937"
            }}>
              <FaCheckCircle style={{ color: "#10b981" }} />
              <span>Detailed Reports and Analytics</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #0369a1 0%, #10b981 100%)",
            border: "none",
            color: "white",
            fontSize: "16px",
            fontWeight: "700",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(3, 105, 161, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(3, 105, 161, 0.4)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(3, 105, 161, 0.3)"
          }}
        >
          Continue to Dashboard
          <FaArrowRight style={{ fontSize: "14px" }} />
        </button>
      </div>
    </div>
  )
}

export default SubscriptionPage
