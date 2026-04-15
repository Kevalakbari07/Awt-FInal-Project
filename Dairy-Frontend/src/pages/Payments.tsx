import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getTodayDateString, getTodayDateForInput, convertToInputFormat, convertToDisplayFormat, formatDateForDisplay, isDateInCurrentPeriod, getPaymentPeriodLabel, isPaymentPeriodFirstDay, getCurrentPeriodDateRange, isSamePeriod, getPaymentPeriodForDate, isDateInSamePeriod, getPaymentPeriodLabelForDate } from "../utils/dateUtils"
import { FaEdit, FaTrash, FaTimes, FaCheckCircle } from "react-icons/fa"
import DeleteConfirmModal from "../components/DeleteConfirmModal"

function Payments() {

    const [payments, setPayments] = useState<any[]>([])
    const [farmers, setFarmers] = useState<any[]>([])
    const [milkData, setMilkData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Form states
    const [selectedFarmer, setSelectedFarmer] = useState("")
    const [amount, setAmount] = useState("")
    const [calculatedTotal, setCalculatedTotal] = useState(0)
    const [date, setDate] = useState(getTodayDateForInput())
    const [errors, setErrors] = useState<any>({})
    const [submitting, setSubmitting] = useState(false)

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState("")
    const [editDate, setEditDate] = useState("")
    const [editErrors, setEditErrors] = useState<any>({})
    const [editSubmitting, setEditSubmitting] = useState(false)

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; farmer: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch payments and farmers on page load
    useEffect(() => {
        fetchPayments()
        fetchFarmers()
        fetchMilkData()
    }, [])

    // Auto-generate payments on the first day of each payment period OR when new farmer added
    useEffect(() => {
        if (farmers.length > 0 && milkData.length > 0) {
            autoGeneratePayments()
        }
    }, [farmers, milkData])

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/payments")
            if (!response.ok) throw new Error("Failed to fetch payments")
            const data = await response.json()
            setPayments(data || [])
            setLastUpdated(new Date())
            console.log("✅ Payments loaded:", data)
        } catch (error) {
            console.error("Error fetching payments:", error)
            setPayments([])
        } finally {
            setLoading(false)
        }
    }

    const fetchFarmers = async () => {
        try {
            const response = await apiCall("/farmers")
            if (!response.ok) throw new Error("Failed to fetch farmers")
            const data = await response.json()
            setFarmers(data || [])
            console.log("✅ Farmers loaded:", data)
        } catch (error) {
            console.error("Error fetching farmers:", error)
            setFarmers([])
        }
    }

    // Helper function to get farmer code by name
    const getFarmerCode = (farmerName: string) => {
        const farmerObj = farmers.find((f) => f.name === farmerName)
        return farmerObj?.codeNumber || "-"
    }

    // Fetch milk collection data
    const fetchMilkData = async () => {
        try {
            const response = await apiCall("/milk")
            if (!response.ok) throw new Error("Failed to fetch milk data")
            const data = await response.json()
            setMilkData(data || [])
            console.log("✅ Milk data loaded:", data)
        } catch (error) {
            console.error("Error fetching milk data:", error)
            setMilkData([])
        }
    }

    // Calculate total milk for a farmer in current 10-day period
    const calculateMilkTotal = (farmerName: string): number => {
        if (!farmerName) return 0
        
        const totalQuantity = milkData
            .filter((record: any) => {
                return record.farmer === farmerName && isDateInCurrentPeriod(record.date)
            })
            .reduce((sum: number, record: any) => sum + (Number(record.quantity) || 0), 0)
        
        // Calculate total in rupees: quantity * rate (assuming rate per liter)
        // For now, we'll return the total quantity * a standard rate
        // Get average rate from records or use quantity as base
        const totalAmount = totalQuantity * 100 // This will be updated based on actual rates
        
        // More accurate: sum up total directly from records
        const accurateTotal = milkData
            .filter((record: any) => {
                return record.farmer === farmerName && isDateInCurrentPeriod(record.date)
            })
            .reduce((sum: number, record: any) => sum + (Number(record.total) || 0), 0)
        
        return accurateTotal
    }

    // Calculate milk total for a specific date's period (for manual payments with date selection)
    const calculateMilkTotalForDate = (farmerName: string, dateStr: string): number => {
        if (!farmerName || !dateStr) return 0
        
        const accurateTotal = milkData
            .filter((record: any) => {
                return record.farmer === farmerName && isDateInSamePeriod(record.date, dateStr)
            })
            .reduce((sum: number, record: any) => sum + (Number(record.total) || 0), 0)
        
        return accurateTotal
    }

    // Handle farmer selection - auto-calculate milk total for current date
    const handleFarmerChange = (farmerName: string) => {
        setSelectedFarmer(farmerName)
        const milkTotal = calculateMilkTotalForDate(farmerName, date)
        setCalculatedTotal(milkTotal)
        setAmount(milkTotal.toString())
    }

    // Handle date change - recalculate milk total for selected farmer
    const handleDateChange = (newDate: string) => {
        setDate(newDate)
        if (selectedFarmer) {
            const milkTotal = calculateMilkTotalForDate(selectedFarmer, newDate)
            setCalculatedTotal(milkTotal)
            setAmount(milkTotal.toString())
        }
    }

    // Auto-generate payments for all farmers on the first day of payment period
    const autoGeneratePayments = async () => {
        try {
            // Get current period info
            const today = getTodayDateString()
            
            console.log("🤖 Checking for missing payments in current period...")

            // Create payment for each farmer who doesn't have one for the current period
            for (const farmer of farmers) {
                const milkTotal = calculateMilkTotal(farmer.name)
                
                // Only create payment if there's milk collection
                if (milkTotal > 0) {
                    // Check if THIS farmer already has a payment for the current period
                    const farmerHasPayment = payments.some((payment: any) => 
                        payment.farmer === farmer.name && isSamePeriod(payment.date)
                    )

                    if (!farmerHasPayment) {
                        try {
                            const response = await apiCall("/payments", {
                                method: "POST",
                                body: JSON.stringify({
                                    farmer: farmer.name,
                                    amount: milkTotal,
                                    date: today,
                                    status: "Pending",
                                    isAutoGenerated: true
                                })
                            })

                            if (response.ok) {
                                console.log(`✅ Auto-generated payment for ${farmer.name}: ₹${milkTotal}`)
                            }
                        } catch (error) {
                            console.error(`Error auto-generating payment for ${farmer.name}:`, error)
                        }
                    }
                }
            }

            // Refresh payments list
            await fetchPayments()
        } catch (error) {
            console.error("Error auto-generating payments:", error)
        }
    }
    const startEdit = (payment: any) => {
        setEditingId(payment._id)
        setEditAmount(payment.amount.toString())
        setEditDate(convertToInputFormat(payment.date))
        setEditErrors({})
    }

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null)
        setEditAmount("")
        setEditDate("")
        setEditErrors({})
    }

    // Update payment
    const updatePayment = async (paymentId: string) => {
        const newErrors: any = {}

        if (!editAmount || Number(editAmount) <= 0) {
            newErrors.amount = "Enter valid amount"
        }

        if (!editDate) {
            newErrors.date = "Date is required"
        }

        setEditErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            setEditSubmitting(true)

            try {
                const response = await apiCall(`/payments/${paymentId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        amount: Number(editAmount),
                        date: convertToDisplayFormat(editDate)
                    })
                })

                if (response.ok) {
                    await fetchPayments()
                    cancelEdit()
                } else {
                    setEditErrors({ submit: "Failed to update payment" })
                }
            } catch (error) {
                console.error("Error updating payment:", error)
                setEditErrors({ submit: "Error updating payment" })
            } finally {
                setEditSubmitting(false)
            }
        }
    }

    // Delete payment
    const deletePayment = async (paymentId: string) => {
        if (!isDeleting) {
            setIsDeleting(true)
        }

        try {
            const response = await apiCall(`/payments/${paymentId}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchPayments()
                setShowDeleteModal(false)
                setDeleteTarget(null)
            } else {
                const error = await response.json()
                alert(error.message || "Failed to delete payment")
            }
        } catch (error) {
            console.error("Error deleting payment:", error)
            alert("Error deleting payment")
        } finally {
            setIsDeleting(false)
        }
    }

    // Handle delete button click
    const handleDeleteClick = (paymentId: string, farmerName: string) => {
        setDeleteTarget({ id: paymentId, farmer: farmerName })
        setShowDeleteModal(true)
    }

    // Confirm delete
    const confirmDelete = () => {
        if (deleteTarget) {
            deletePayment(deleteTarget.id)
        }
    }

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setDeleteTarget(null)
        setIsDeleting(false)
    }

    const addPayment = async () => {

        const newErrors: any = {}

        if (!selectedFarmer) {
            newErrors.farmer = "Select a farmer"
        }

        if (!amount || Number(amount) <= 0) {
            newErrors.amount = "Enter valid amount"
        }

        if (!date) {
            newErrors.date = "Date is required"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {

            setSubmitting(true)

            try {
                const response = await apiCall("/payments", {
                    method: "POST",
                    body: JSON.stringify({
                        farmer: selectedFarmer,
                        amount: Number(amount),
                        date: convertToDisplayFormat(date),
                        status: "Pending"
                    })
                })

                if (response.ok) {
                    // Clear inputs
                    setSelectedFarmer("")
                    setAmount("")
                    setDate(getTodayDateForInput())
                    setErrors({})

                    // Refresh payments list
                    await fetchPayments()
                } else {
                    console.error("Failed to add payment")
                }

            } catch (error) {
                console.error("Error adding payment:", error)
            } finally {
                setSubmitting(false)
            }

        }

    }

    const toggleStatus = async (id: string) => {

        const payment = payments.find((p) => p._id === id)
        if (!payment) return

        const newStatus = payment.status === "Paid" ? "Pending" : "Paid"

        setToggling(id)

        try {
            const response = await apiCall(`/payments/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    status: newStatus
                })
            })

            if (response.ok) {
                // Refresh payments after toggle
                await fetchPayments()
            } else {
                console.error("Failed to update status")
            }

        } catch (error) {
            console.error("Error updating payment status:", error)
        } finally {
            setToggling(null)
        }

    }

    return (
        <div>
            <Sidebar />
            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>
                <Header />
                <div className="container mt-4">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0 }}>Payments</h2>
                        <small style={{ color: "#6c757d" }}>Last updated: {lastUpdated.toLocaleTimeString()}</small>
                    </div>

                    {/* Add Payment Form */}
                    <div className="card p-4 mb-4">
                        <h5 className="mb-3">Create Payment</h5>

                        <label className="form-label">Select Farmer</label>
                        <select
                            className="form-control mb-1"
                            value={selectedFarmer}
                            onChange={(e) => handleFarmerChange(e.target.value)}
                        >
                            <option value="">-- Select a farmer --</option>
                            {farmers.map((farmer) => (
                                <option key={farmer._id} value={farmer.name}>
                                    {farmer.name} (Code: {farmer.codeNumber})
                                </option>
                            ))}
                        </select>
                        {errors.farmer && <small className="text-danger">{errors.farmer}</small>}

                        <label className="form-label mt-3">Amount (₹) - Auto-calculated from milk collection</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                className="form-control mb-1"
                                type="number"
                                placeholder="Auto-calculated"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            {calculatedTotal > 0 && (
                                <div style={{ display: "flex", alignItems: "center", padding: "10px", backgroundColor: "#f0f7e8", borderRadius: "5px" }}>
                                    <small style={{ color: "#2e7d32", fontWeight: "bold" }}>
                                        Collected: ₹{calculatedTotal.toFixed(2)}
                                    </small>
                                </div>
                            )}
                        </div>
                        {errors.amount && <small className="text-danger">{errors.amount}</small>}

                        <label className="form-label mt-3">Date</label>
                        <input
                            className="form-control mb-3"
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                        />
                        {errors.date && <small className="text-danger">{errors.date}</small>}

                        {date && (
                            <div style={{ backgroundColor: "#f0f8ff", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                                <small style={{ color: "#0066cc" }}>
                                    <strong>Period for selected date:</strong> {getPaymentPeriodLabelForDate(convertToDisplayFormat(date))}
                                </small>
                            </div>
                        )}

                        <button
                            className="btn btn-success"
                            onClick={addPayment}
                            disabled={submitting || farmers.length === 0}
                        >
                            {submitting ? "Adding..." : farmers.length === 0 ? "No farmers available" : "Add Payment"}
                        </button>
                    </div>

                    {/* Payments List */}
                    {loading ? (
                        <div className="alert alert-info">Loading payments...</div>
                    ) : payments.length === 0 ? (
                        <div className="alert alert-warning">No payments recorded yet</div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table className="table table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Farmer Code</th>
                                        <th>Farmer</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        editingId === payment._id ? (
                                            <tr key={payment._id} style={{ backgroundColor: "#f0f8ff" }}>
                                                <td>{getFarmerCode(payment.farmer)}</td>
                                                <td>{payment.farmer}</td>
                                                <td>
                                                    <input type="number" className="form-control form-control-sm" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                                                    {editErrors.amount && <small className="text-danger d-block">{editErrors.amount}</small>}
                                                </td>
                                                <td>
                                                    <input type="date" className="form-control form-control-sm" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                                                    {editErrors.date && <small className="text-danger d-block">{editErrors.date}</small>}
                                                </td>
                                                <td>
                                                    <span className={payment.status === "Paid" ? "badge bg-success" : "badge bg-warning"}>{payment.status}</span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-success me-2" onClick={() => updatePayment(payment._id)} disabled={editSubmitting}>✓</button>
                                                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit} disabled={editSubmitting}><FaTimes /></button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={payment._id}>
                                                <td>{getFarmerCode(payment.farmer)}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <span>{payment.farmer}</span>
                                                        {payment.isAutoGenerated && (
                                                            <span title="Auto-generated payment" style={{ fontSize: "12px", color: "green" }}>
                                                                <FaCheckCircle /> Auto
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>₹{payment.amount}</td>
                                                <td>{formatDateForDisplay(payment.date)}</td>
                                                <td>
                                                    <button
                                                        className={payment.status === "Paid" ? "btn btn-success btn-sm" : "btn btn-warning btn-sm"}
                                                        onClick={() => toggleStatus(payment._id)}
                                                        disabled={toggling === payment._id}
                                                    >
                                                        {toggling === payment._id ? "Updating..." : payment.status}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-primary me-2" onClick={() => startEdit(payment)} title="Edit"><FaEdit /></button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(payment._id, payment.farmer)} title="Delete"><FaTrash /></button>
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmModal
                show={showDeleteModal}
                title="Delete Payment"
                message={`Are you sure you want to delete the payment for "${deleteTarget?.farmer}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isDeleting={isDeleting}
            />

        </div>
    )
}

export default Payments