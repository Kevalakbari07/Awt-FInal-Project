import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getPaymentPeriodLabel, isSamePeriod, getTodayDateString, getPaymentPeriodForDate, getDateDay } from "../utils/dateUtils"

function PaymentsSummary() {

    const [payments, setPayments] = useState<any[]>([])
    const [farmers, setFarmers] = useState<any[]>([])
    const [milkData, setMilkData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)

    // Fetch payments, farmers and milk data on page load
    useEffect(() => {
        fetchPayments()
        fetchFarmers()
        fetchMilkData()
    }, [])

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

    // Silent refresh - updates data WITHOUT showing loading spinner
    const refreshPayments = async () => {
        try {
            console.log("🔄 Refreshing payments from database...")
            const response = await apiCall("/payments")
            if (response.ok) {
                const data = await response.json()
                setPayments(data || [])
                setLastUpdated(new Date())
                console.log("✅ Payments refreshed successfully:", data.length)
            } else {
                console.error("🔴 Refresh failed - API returned:", response.status)
            }
        } catch (error) {
            console.error("🔴 Error refreshing payments:", error)
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

    // Format period date range as "1 to 10-04-2026"
    const formatPeriodDateRange = (dateStr: string): string => {
        if (!dateStr) return ""
        
        let month = 0, year = 0
        
        // Parse DD-MM-YYYY
        if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [d, m, y] = dateStr.split('-')
            month = Number(m)
            year = Number(y)
        }
        // Parse YYYY-MM-DD
        else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = dateStr.split('-')
            month = Number(m)
            year = Number(y)
        }
        
        if (month === 0 || year === 0) return ""
        
        const period = getPaymentPeriodForDate(dateStr)
        const monthStr = String(month).padStart(2, '0')
        
        return `${period.start} to ${period.end}-${monthStr}-${year}`
    }

    // Get payment summary for current period
    const getPaymentSummary = () => {
        const summary: { [key: string]: { name: string; codeNumber: string; period: string; total: number; count: number; paid: number; pending: number } } = {}

        // Filter payments for current period
        const currentPeriodPayments = payments.filter((payment: any) => isSamePeriod(payment.date))

        // Group by farmer and sum
        currentPeriodPayments.forEach((payment: any) => {
            if (!summary[payment.farmer]) {
                const farmer = farmers.find((f) => f.name === payment.farmer)
                summary[payment.farmer] = {
                    name: payment.farmer,
                    codeNumber: farmer?.codeNumber || "N/A",
                    period: formatPeriodDateRange(payment.date),
                    total: 0,
                    count: 0,
                    paid: 0,
                    pending: 0
                }
            }
            summary[payment.farmer].total += Number(payment.amount) || 0
            summary[payment.farmer].count += 1

            if (payment.status === "Paid") {
                summary[payment.farmer].paid += Number(payment.amount) || 0
            } else {
                summary[payment.farmer].pending += Number(payment.amount) || 0
            }
        })

        return Object.values(summary)
    }

    // Toggle payment status for entire 10-day period
    const togglePaymentStatus = async (farmerName: string) => {
        if (!farmerName || farmerName.trim() === "") {
            console.warn("⚠️ No farmer name provided")
            return
        }

        console.log("🔄 Starting toggle for farmer:", farmerName)
        
        // Check if user is authenticated
        const token = localStorage.getItem("token")
        if (!token) {
            console.error("❌ No authentication token found!")
            alert("You are not logged in. Please login first.")
            return
        }
        console.log("✅ Auth token found")

        setUpdatingPayment(farmerName)

        try {
            // Get all payments for this farmer in current period
            const paymentsToUpdate = payments.filter((p: any) => 
                p.farmer === farmerName && isSamePeriod(p.date)
            )

            console.log("📋 Payments to update:", paymentsToUpdate.length, paymentsToUpdate)
            if (paymentsToUpdate.length === 0) {
                console.log("⚠️ No payments found for this farmer in current period")
                setUpdatingPayment(null)
                return
            }

            // Determine new status
            const hasUnpaid = paymentsToUpdate.some((p: any) => p.status !== "Paid")
            const newStatus = hasUnpaid ? "Paid" : "Pending"

            console.log(`🔄 Toggling to status: ${newStatus}`)

            // Update each payment - wait for all to complete
            const updatePromises = paymentsToUpdate.map((payment: any) => 
                apiCall(`/payments/${payment._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ status: newStatus })
                })
                .then((response) => {
                    console.log(`✅ API Response for ${payment._id}:`, response.status, response.ok)
                    if (!response.ok) {
                        console.error(`❌ Bad response: ${response.status}`)
                    }
                    return response
                })
                .catch((error) => {
                    console.error(`❌ Network error for ${payment._id}:`, error)
                    throw error
                })
            )

            const responses = await Promise.all(updatePromises)
            const allSuccess = responses.every((r) => r.ok)

            console.log("📊 Update results:", { total: responses.length, successful: responses.filter(r => r.ok).length, allSuccess })

            if (allSuccess) {
                console.log("✅ All payments updated successfully in database")
                // Update local state immediately instead of fetching
                const updatedPayments = payments.map((p: any) => {
                    if (p.farmer === farmerName && isSamePeriod(p.date)) {
                        return { ...p, status: newStatus }
                    }
                    return p
                })
                setPayments(updatedPayments)
                console.log("✅ UI updated with new status")
            } else {
                console.error("❌ Some payments failed to update, fetching latest data from database...")
                // Still try to refresh to get latest
                await refreshPayments()
            }

        } catch (error) {
            console.error("❌ Error in togglePaymentStatus:", error)
            // Force refresh to sync with database
            console.log("🔄 Force refreshing from database due to error...")
            await refreshPayments()
        } finally {
            setUpdatingPayment(null)
            console.log("🏁 Toggle operation completed")
        }
    }

    // Get current payment status
    const getCurrentPaymentStatus = (farmerName: string): "Paid" | "Pending" => {
        const farmerPayments = payments.filter((p: any) => 
            p.farmer === farmerName && isSamePeriod(p.date)
        )

        if (farmerPayments.length === 0) return "Pending"

        const allPaid = farmerPayments.every((p: any) => p.status === "Paid")
        return allPaid ? "Paid" : "Pending"
    }

    // Get monthly milk collection summary
    const getMonthlySummary = () => {
        const today = new Date()
        const currentMonth = today.getMonth() + 1
        const currentYear = today.getFullYear()

        const summary: { [key: string]: { name: string; codeNumber: string; quantity: number; totalAmount: number; entries: number } } = {}

        // Filter milk data for current month only
        milkData.forEach((record: any) => {
            let recordMonth = 0, recordYear = 0

            // Parse DD-MM-YYYY
            if (record.date && record.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const [d, m, y] = record.date.split('-')
                recordMonth = Number(m)
                recordYear = Number(y)
            }
            // Parse YYYY-MM-DD
            else if (record.date && record.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = record.date.split('-')
                recordMonth = Number(m)
                recordYear = Number(y)
            }

            // Only include current month
            if (recordMonth === currentMonth && recordYear === currentYear) {
                if (!summary[record.farmer]) {
                    const farmer = farmers.find((f) => f.name === record.farmer)
                    summary[record.farmer] = {
                        name: record.farmer,
                        codeNumber: farmer?.codeNumber || "N/A",
                        quantity: 0,
                        totalAmount: 0,
                        entries: 0
                    }
                }
                summary[record.farmer].quantity += Number(record.quantity) || 0
                summary[record.farmer].totalAmount += Number(record.total) || 0
                summary[record.farmer].entries += 1
            }
        })

        return Object.values(summary)
    }

    const summaryData = getPaymentSummary()
    const monthlySummaryData = getMonthlySummary()
    const grandTotal = summaryData.reduce((sum, item) => sum + item.total, 0)
    const totalPaid = summaryData.reduce((sum, item) => sum + item.paid, 0)
    const totalPending = summaryData.reduce((sum, item) => sum + item.pending, 0)
    
    const monthlyGrandQuantity = monthlySummaryData.reduce((sum, item) => sum + item.quantity, 0)
    const monthlyGrandAmount = monthlySummaryData.reduce((sum, item) => sum + item.totalAmount, 0)

    // Get current month name and year
    const monthName = new Date().toLocaleString('en-US', { month: 'long' })
    const currentYear = new Date().getFullYear()

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ marginLeft: "250px", width: "calc(100% - 250px)", minHeight: "100vh", background: "#f8f9fa" }}>
                <Header />

                <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                    {/* Page Title */}
                    <div className="mb-4">
                        <h2 style={{ color: "#1a1a2e", marginBottom: "5px" }}>Payment Summary - 10 Days</h2>
                        <p style={{ color: "#6c757d", marginBottom: "3px" }}>Total payments for the current 10-day payment cycle</p>
                        <small style={{ color: "#6c757d" }}>Last updated: {lastUpdated.toLocaleTimeString()}</small>
                    </div>

                    {/* Period Info Card */}
                    <div className="card p-4 mb-4" style={{ borderLeft: "5px solid #7c3aed", background: "#f0f4ff" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <h5 style={{ color: "#1a1a2e", marginBottom: "5px" }}>Current Payment Period</h5>
                                <h3 style={{ color: "#7c3aed", fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                                    {getPaymentPeriodLabel()}
                                </h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <small style={{ display: "block", color: "#6c757d", marginBottom: "8px" }}>Total Farmers</small>
                                <h4 style={{ color: "#1a1a2e", fontSize: "28px", margin: 0 }}>{summaryData.length}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card p-4" style={{ borderTop: "4px solid #28a745" }}>
                                <small style={{ color: "#6c757d", display: "block", marginBottom: "8px" }}>Grand Total</small>
                                <h3 style={{ color: "#28a745", fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                                    ₹{grandTotal.toFixed(2)}
                                </h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-4" style={{ borderTop: "4px solid #ffc107" }}>
                                <small style={{ color: "#6c757d", display: "block", marginBottom: "8px" }}>Pending Amount</small>
                                <h3 style={{ color: "#ffc107", fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                                    ₹{totalPending.toFixed(2)}
                                </h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-4" style={{ borderTop: "4px solid #17a2b8" }}>
                                <small style={{ color: "#6c757d", display: "block", marginBottom: "8px" }}>Paid Amount</small>
                                <h3 style={{ color: "#17a2b8", fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                                    ₹{totalPaid.toFixed(2)}
                                </h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-4" style={{ borderTop: "4px solid #6c757d" }}>
                                <small style={{ color: "#6c757d", display: "block", marginBottom: "8px" }}>Total Entries</small>
                                <h3 style={{ color: "#1a1a2e", fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                                    {payments.filter((p) => isSamePeriod(p.date)).length}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Summary Table */}
                    <div className="card">
                        {summaryData.length === 0 ? (
                            <div className="p-5 text-center" style={{ color: "#6c757d" }}>
                                <h5>No payments recorded for this period</h5>
                                <p>Payments will appear here once they are added</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                        <tr>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px" }}>Farmer Name</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px" }}>Code</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px" }}>Period</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "right" }}>Total Amount</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "right" }}>Paid</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "right" }}>Pending</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "center" }}>Entries</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "center" }}>Payment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summaryData.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: "1px solid #dee2e6", transition: "background 0.2s" }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                            >
                                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#1a1a2e", fontWeight: "500" }}>
                                                    {item.name}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#6c757d" }}>
                                                    <span style={{
                                                        background: "#e9ecef",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}>
                                                        {item.codeNumber}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#6c757d", fontWeight: "500" }}>
                                                    <span style={{
                                                        background: "#fff3cd",
                                                        color: "#856404",
                                                        padding: "6px 12px",
                                                        borderRadius: "4px",
                                                        fontSize: "13px",
                                                        fontWeight: "600"
                                                    }}>
                                                        {item.period}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#28a745", fontWeight: "bold", fontSize: "16px" }}>
                                                    ₹{item.total.toFixed(2)}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#17a2b8", fontWeight: "bold" }}>
                                                    ₹{item.paid.toFixed(2)}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#ffc107", fontWeight: "bold" }}>
                                                    ₹{item.pending.toFixed(2)}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "center" }}>
                                                    <span style={{
                                                        background: "#e7f3ff",
                                                        color: "#0066cc",
                                                        padding: "4px 10px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}>
                                                        {item.count}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "center", whiteSpace: "nowrap" }}>
                                                    <button
                                                        className={getCurrentPaymentStatus(item.name) === "Paid" ? "btn btn-success btn-sm" : "btn btn-warning btn-sm"}
                                                        onClick={() => {
                                                            console.log("🔘 Button clicked for farmer:", item.name)
                                                            togglePaymentStatus(item.name)
                                                        }}
                                                        disabled={updatingPayment === item.name}
                                                        style={{ 
                                                            padding: "8px 20px", 
                                                            fontSize: "13px", 
                                                            fontWeight: "600", 
                                                            minWidth: "110px",
                                                            opacity: updatingPayment === item.name ? 0.6 : 1,
                                                            cursor: updatingPayment === item.name ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        {updatingPayment === item.name ? "⏳ Updating..." : (getCurrentPaymentStatus(item.name) === "Paid" ? "✅ Paid" : "⏱️ Pending")}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr style={{ background: "#f8f9fa", borderTop: "2px solid #dee2e6", fontWeight: "bold" }}>
                                            <td colSpan={3} style={{ padding: "15px", color: "#1a1a2e" }}>
                                                TOTAL
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "#28a745", fontSize: "16px" }}>
                                                ₹{grandTotal.toFixed(2)}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "#17a2b8", fontSize: "16px" }}>
                                                ₹{totalPaid.toFixed(2)}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "#ffc107", fontSize: "16px" }}>
                                                ₹{totalPending.toFixed(2)}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "center", color: "#1a1a2e", fontSize: "16px" }}>
                                                {payments.filter((p) => isSamePeriod(p.date)).length}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "center", color: "#6c757d" }}>
                                                {/* Empty cell for alignment */}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Monthly Milk Collection Summary */}
                    <div className="card mt-5">
                        <div className="card-header" style={{ background: "#e8f4f8", borderBottom: "2px solid #17a2b8", padding: "15px" }}>
                            <h5 style={{ color: "#0c5460", margin: 0 }}>📊 Monthly Milk Collection Summary - {monthName} {currentYear}</h5>
                            <small style={{ color: "#0c5460" }}>Total milk quantity and amount collected during the entire month</small>
                        </div>
                        {milkData.length === 0 ? (
                            <div className="p-5 text-center" style={{ color: "#6c757d" }}>
                                <p>No milk collection data available for this month</p>
                            </div>
                        ) : monthlySummaryData.length === 0 ? (
                            <div className="p-5 text-center" style={{ color: "#6c757d" }}>
                                <p>No milk collected this month yet</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                        <tr>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px" }}>Farmer Name</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px" }}>Code</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "right" }}>Total Quantity (Liters)</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "right" }}>Total Amount (₹)</th>
                                            <th style={{ color: "#1a1a2e", fontWeight: "600", padding: "15px", textAlign: "center" }}>Entries</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlySummaryData.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: "1px solid #dee2e6", transition: "background 0.2s" }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                            >
                                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#1a1a2e", fontWeight: "500" }}>
                                                    {item.name}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#6c757d" }}>
                                                    <span style={{
                                                        background: "#e9ecef",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}>
                                                        {item.codeNumber}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#0066cc", fontWeight: "bold", fontSize: "16px" }}>
                                                    {item.quantity.toFixed(2)}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#17a2b8", fontWeight: "bold", fontSize: "16px" }}>
                                                    ₹{item.totalAmount.toFixed(2)}
                                                </td>
                                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "center", color: "#6c757d" }}>
                                                    <span style={{
                                                        background: "#e7f3ff",
                                                        color: "#0066cc",
                                                        padding: "4px 10px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}>
                                                        {item.entries}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr style={{ background: "#f8f9fa", borderTop: "2px solid #dee2e6", fontWeight: "bold" }}>
                                            <td colSpan={2} style={{ padding: "15px", color: "#1a1a2e" }}>
                                                TOTAL FOR {monthName.toUpperCase()}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "#0066cc", fontSize: "16px" }}>
                                                {monthlyGrandQuantity.toFixed(2)} L
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "#17a2b8", fontSize: "16px" }}>
                                                ₹{monthlyGrandAmount.toFixed(2)}
                                            </td>
                                            <td style={{ padding: "15px", textAlign: "center", color: "#1a1a2e", fontSize: "16px" }}>
                                                {milkData.filter((item: any) => {
                                                    let recordMonth = 0, recordYear = 0
                                                    if (item.date && item.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
                                                        const [d, m, y] = item.date.split('-')
                                                        recordMonth = Number(m)
                                                        recordYear = Number(y)
                                                    } else if (item.date && item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                                        const [y, m, d] = item.date.split('-')
                                                        recordMonth = Number(m)
                                                        recordYear = Number(y)
                                                    }
                                                    return recordMonth === new Date().getMonth() + 1 && recordYear === new Date().getFullYear()
                                                }).length}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Print Buttons */}
                    <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.print()}
                            style={{ padding: "10px 20px" }}
                        >
                            🖨️ Print 10-Day Payment Summary
                        </button>
                        <button
                            className="btn btn-info"
                            onClick={() => window.print()}
                            style={{ padding: "10px 20px", color: "white" }}
                        >
                            🥛 Print Monthly Milk Summary
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => window.print()}
                            style={{ padding: "10px 20px" }}
                        >
                            📋 Print Complete Report
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                fetchPayments()
                                fetchMilkData()
                            }}
                            style={{ padding: "10px 20px" }}
                        >
                            🔄 Refresh
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default PaymentsSummary
