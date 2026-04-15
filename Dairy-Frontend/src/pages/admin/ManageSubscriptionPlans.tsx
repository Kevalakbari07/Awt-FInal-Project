import { useEffect, useState } from "react"
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa"
import axios from "axios"

interface Plan {
  _id: string
  planName: string
  planType: string
  duration: string
  durationDays: number
  maxUsers: number
  price: number
  features?: string[]
  description?: string
}

interface FormData {
  planName: string
  planType: string
  durationDays: number
  maxUsers: number
  price: number
  features: string
  description: string
}

function ManageSubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    planName: "",
    planType: "single-monthly",
    durationDays: 30,
    maxUsers: 1,
    price: 0,
    features: "",
    description: ""
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/subscriptions/plans")
      setPlans(response.data)
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlan = () => {
    setEditingPlan(null)
    setFormData({
      planName: "",
      planType: "single-monthly",
      durationDays: 30,
      maxUsers: 1,
      price: 0,
      features: "",
      description: ""
    })
    setShowForm(true)
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      planName: plan.planName,
      planType: plan.planType,
      durationDays: plan.durationDays,
      maxUsers: plan.maxUsers,
      price: plan.price,
      features: plan.features?.join(", ") || "",
      description: plan.description || ""
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const submitData = {
        ...formData,
        features: formData.features.split(",").map(f => f.trim()).filter(f => f)
      }

      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/subscriptions/plans/${editingPlan._id}`, submitData)
      } else {
        await axios.post("http://localhost:5000/api/subscriptions/plans", submitData)
      }

      setShowForm(false)
      fetchPlans()
    } catch (error) {
      console.error("Error saving plan:", error)
    }
  }

  const handleDelete = async (planId: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await axios.delete(`http://localhost:5000/api/subscriptions/plans/${planId}`)
        fetchPlans()
      } catch (error) {
        console.error("Error deleting plan:", error)
      }
    }
  }

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "single-monthly": "Single User - Monthly",
      "single-yearly": "Single User - Yearly",
      "multi-monthly": "Multi User - Monthly",
      "multi-yearly": "Multi User - Yearly"
    }
    return labels[type] || type
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading plans...</div>
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ margin: "0", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>
          Subscription Plans
        </h2>
        <button
          onClick={handleAddPlan}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #0369a1, #10b981)",
            border: "none",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <FaPlus /> Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {plans.map((plan) => (
          <div
            key={plan._id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1f2937", fontSize: "18px", fontWeight: "700" }}>
              {plan.planName}
            </h3>
            <p style={{ margin: "0 0 15px 0", color: "#6b7280", fontSize: "14px" }}>
              {getPlanTypeLabel(plan.planType)}
            </p>

            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                PRICE & DURATION
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "16px", fontWeight: "700" }}>
                ${plan.price} / {plan.duration === "monthly" ? "month" : "year"}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "13px" }}>
                {plan.durationDays} days access
              </p>
            </div>

            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                MAX USERS
              </p>
              <p style={{ margin: "0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                {plan.maxUsers} {plan.maxUsers === 1 ? "user" : "users"}
              </p>
            </div>

            {plan.features && plan.features.length > 0 && (
              <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "12px", fontWeight: "500" }}>
                  FEATURES
                </p>
                <ul style={{ margin: "0", padding: "0", listStyle: "none", fontSize: "13px" }}>
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} style={{ margin: "3px 0", color: "#1f2937" }}>
                      ✓ {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li style={{ margin: "3px 0", color: "#6b7280" }}>+ {plan.features.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleEditPlan(plan)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#1f2937",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(plan._id)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fecaca"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fee2e2"}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
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
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h3 style={{ margin: "0", color: "#1f2937", fontSize: "22px", fontWeight: "700" }}>
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  required
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                    Plan Type
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="single-monthly">Single - Monthly</option>
                    <option value="single-yearly">Single - Yearly</option>
                    <option value="multi-monthly">Multi - Monthly</option>
                    <option value="multi-yearly">Multi - Yearly</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value, 10) || 1 })}
                    required
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 30 })}
                    required
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
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
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
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Features (comma-separated)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                  placeholder="e.g., API Access, Priority Support, Custom Reports"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: "600", fontSize: "14px" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  <FaCheck /> {editingPlan ? "Update" : "Create"} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageSubscriptionPlans
