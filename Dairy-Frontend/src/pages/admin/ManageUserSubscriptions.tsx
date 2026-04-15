import { useEffect, useState } from "react"
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUsers
} from "react-icons/fa"
import axios from "axios"

interface User {
  _id: string
  username: string
  fullName?: string
  companyName?: string
  subscriptionType: string
  subscriptionEndDate: string
  numberOfUsers: number
  isSubscriptionActive: boolean
  createdAt: string
}

interface Plan {
  _id: string
  planName: string
  price: number
  planType: string
}

function ManageUserSubscriptions() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    planId: "",
    numberOfUsers: 1,
    extendDays: 0
  })

  useEffect(() => {
    fetchUsers()
    fetchPlans()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/subscriptions/admin/all-users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/subscriptions/plans")
      setPlans(response.data)
    } catch (error) {
      console.error("Error fetching plans:", error)
    }
  }

  const filterUsers = () => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredUsers(filtered)
  }

  const handleEditSubscription = (user: User) => {
    setSelectedUser(user)
    setFormData({
      planId: "",
      numberOfUsers: user.numberOfUsers || 1,
      extendDays: 0
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await axios.put(
        `http://localhost:5000/api/subscriptions/admin/update-subscription/${selectedUser?._id}`,
        formData
      )

      setShowModal(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating subscription:", error)
    }
  }

  const handleCancelSubscription = async (userId: string) => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      try {
        await axios.post(`http://localhost:5000/api/subscriptions/admin/cancel-subscription/${userId}`)
        fetchUsers()
      } catch (error) {
        console.error("Error cancelling subscription:", error)
      }
    }
  }

  const getStatusBadge = (user: User) => {
    const now = new Date()
    const isExpired = new Date(user.subscriptionEndDate) < now

    if (user.subscriptionType === "free-trial" && !isExpired) {
      return { text: "Free Trial", color: "#f59e0b", bg: "#fffbeb" }
    }
    if (!user.isSubscriptionActive || isExpired) {
      return { text: "Expired", color: "#ef4444", bg: "#fee2e2" }
    }
    return { text: "Active", color: "#10b981", bg: "#f0fdf4" }
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff < 0 ? 0 : diff
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading users...</div>
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>
          User Subscription Management
        </h2>

        {/* Search Bar */}
        <div style={{
          display: "flex",
          gap: "10px",
          background: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <FaSearch style={{ color: "#6b7280", fontSize: "18px", marginTop: "2px" }} />
          <input
            type="text"
            placeholder="Search by username, name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px"
          }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "700", color: "#1f2937" }}>
                  User Info
                </th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "700", color: "#1f2937" }}>
                  Subscription Type
                </th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "700", color: "#1f2937" }}>
                  Users
                </th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "700", color: "#1f2937" }}>
                  Expiry Date
                </th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "700", color: "#1f2937" }}>
                  Days Left
                </th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "700", color: "#1f2937" }}>
                  Status
                </th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "700", color: "#1f2937" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const status = getStatusBadge(user)
                const daysLeft = getDaysRemaining(user.subscriptionEndDate)

                return (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      transition: "background 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={(e) =>
                      e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#f9fafb"
                    }
                  >
                    <td style={{ padding: "15px" }}>
                      <div>
                        <p style={{ margin: "0", fontWeight: "600", color: "#1f2937" }}>
                          {user.username}
                        </p>
                        <p style={{ margin: "3px 0 0 0", color: "#6b7280", fontSize: "12px" }}>
                          {user.fullName || "N/A"}
                        </p>
                        <p style={{ margin: "2px 0 0 0", color: "#9ca3af", fontSize: "11px" }}>
                          {user.companyName || "No company"}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: "15px", color: "#1f2937" }}>
                      {user.subscriptionType === "free-trial"
                        ? "Free Trial"
                        : user.subscriptionType
                            ?.replace(/-/g, " ")
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                    </td>
                    <td style={{ padding: "15px", color: "#1f2937" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaUsers style={{ color: "#6b7280" }} />
                        {user.numberOfUsers}
                      </div>
                    </td>
                    <td style={{ padding: "15px", color: "#1f2937" }}>
                      {new Date(user.subscriptionEndDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", fontWeight: "600" }}>
                      <div style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: daysLeft <= 5 && daysLeft > 0 ? "#fef3c7" : "#f0fdf4",
                        color: daysLeft <= 5 && daysLeft > 0 ? "#92400e" : "#16a34a",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {daysLeft} days
                      </div>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        background: status.bg,
                        color: status.color,
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {status.text}
                      </div>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEditSubscription(user)}
                          style={{
                            padding: "6px 12px",
                            background: "#dbeafe",
                            border: "1px solid #bfdbfe",
                            color: "#0369a1",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#bfdbfe"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#dbeafe"}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(user._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#fee2e2",
                            border: "1px solid #fecaca",
                            color: "#991b1b",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fecaca"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#fee2e2"}
                        >
                          <FaTrash /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            No users found matching your search.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
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
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h3 style={{ margin: "0", color: "#1f2937", fontSize: "22px", fontWeight: "700" }}>
                Update Subscription
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ margin: "0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>USER</p>
              <p style={{ margin: "5px 0 0 0", color: "#1f2937", fontSize: "16px", fontWeight: "700" }}>
                {selectedUser.username} ({selectedUser.fullName || "N/A"})
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Change Plan
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} - ${plan.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Number of Users
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfUsers}
                  onChange={(e) => setFormData({ ...formData, numberOfUsers: parseInt(e.target.value) })}
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

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Extend Subscription (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.extendDays}
                  onChange={(e) => setFormData({ ...formData, extendDays: parseInt(e.target.value) })}
                  placeholder="0"
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

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    color: "#1f2937",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "linear-gradient(135deg, #0369a1, #10b981)",
                    border: "none",
                    color: "white",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <FaCheck /> Update Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUserSubscriptions
