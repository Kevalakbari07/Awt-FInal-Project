import { useState, useEffect } from "react"
import { FaChartBar, FaSync } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getTodayDayName, formatDateForDisplay, getPaymentPeriodForDate, getDateDay } from "../utils/dateUtils"

function Reports() {

    const [reportType, setReportType] = useState("")
    const [milkData, setMilkData] = useState<any[]>([])
    const [paymentData, setPaymentData] = useState<any[]>([])
    const [monthlyData, setMonthlyData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchMilkReport = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/milk")
            if (!response.ok) throw new Error("Failed to fetch milk report")
            const data = await response.json()
            const mappedData = Array.isArray(data) ? data.map((item: any) => ({
                _id: item._id,
                date: item.date || item.createdAt,
                farmer: item.farmer || item.farmerName,
                quantity: item.quantity || item.qty,
                fat: item.fat || item.fatPercentage
            })) : []
            setMilkData(mappedData)
            setLastUpdated(new Date())
            console.log("✅ Milk report loaded:", mappedData)
        } catch (error) {
            console.error("Error fetching milk report:", error)
            setMilkData([])
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentReport = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/payments")
            if (!response.ok) throw new Error("Failed to fetch payment report")
            const data = await response.json()
            const mappedData = Array.isArray(data) ? data.map((item: any) => ({
                _id: item._id,
                farmer: item.farmer || item.farmerName,
                amount: item.amount || item.total,
                date: item.date || item.createdAt,
                status: item.status || "Pending"
            })) : []
            setPaymentData(mappedData)
            setLastUpdated(new Date())
            console.log("✅ Payment report loaded:", mappedData)
        } catch (error) {
            console.error("Error fetching payment report:", error)
            setPaymentData([])
        } finally {
            setLoading(false)
        }
    }

    // Group payments by 10-day period
    const getPaymentsByPeriod = () => {
        const grouped: { [key: string]: { farmer: string; period: string; totalAmount: number; paidAmount: number; pendingAmount: number; entries: number } } = {}

        paymentData.forEach((payment: any) => {
            const period = getPaymentPeriodForDate(payment.date)
            
            // Get month and year
            let month = 0, year = 0
            if (payment.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const [d, m, y] = payment.date.split('-')
                month = Number(m)
                year = Number(y)
            } else if (payment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = payment.date.split('-')
                month = Number(m)
                year = Number(y)
            }

            const periodLabel = `${period.start} to ${period.end}-${String(month).padStart(2, '0')}-${year}`
            const key = `${payment.farmer}-${String(month).padStart(2, '0')}-${year}-${period.start}`

            if (!grouped[key]) {
                grouped[key] = {
                    farmer: payment.farmer,
                    period: periodLabel,
                    totalAmount: 0,
                    paidAmount: 0,
                    pendingAmount: 0,
                    entries: 0
                }
            }

            grouped[key].totalAmount += Number(payment.amount) || 0
            grouped[key].entries += 1

            if (payment.status === "Paid") {
                grouped[key].paidAmount += Number(payment.amount) || 0
            } else {
                grouped[key].pendingAmount += Number(payment.amount) || 0
            }
        })

        return Object.values(grouped)
    }

    const fetchMonthlyReport = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/reports")
            if (!response.ok) throw new Error("Failed to fetch monthly report")
            const data = await response.json()
            const mappedData = Array.isArray(data) ? data.map((item: any) => ({
                _id: item._id,
                month: item.month || item.monthName,
                totalMilk: item.totalMilk || item.milk || item.total
            })) : []
            setMonthlyData(mappedData)
            setLastUpdated(new Date())
            console.log("✅ Monthly report loaded:", mappedData)
        } catch (error) {
            console.error("Error fetching monthly report:", error)
            setMonthlyData([])
        } finally {
            setLoading(false)
        }
    }

    // Auto-refresh when report type changes
    useEffect(() => {
        if (reportType === "milk") {
            fetchMilkReport()
        } else if (reportType === "payments") {
            fetchPaymentReport()
        } else if (reportType === "monthly") {
            fetchMonthlyReport()
        }
    }, [reportType])

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ marginLeft: "250px", width: "100%", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0 }}>Reports</h2>
                        {reportType && (
                            <div style={{ textAlign: "right" }}>
                                <small style={{ color: "#6c757d", display: "block" }}>{getTodayDayName()}</small>
                                <small style={{ color: "#0369a1" }}>{lastUpdated.toLocaleTimeString()}</small>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">

                        <button
                            className={`btn me-2 ${reportType === "milk" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setReportType("milk")}
                        >
                            Daily Milk Report
                        </button>

                        <button
                            className={`btn me-2 ${reportType === "payments" ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => setReportType("payments")}
                        >
                            Payment Report
                        </button>

                        <button
                            className={`btn ${reportType === "monthly" ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => setReportType("monthly")}
                        >
                            Monthly Milk Report
                        </button>

                        {reportType && (
                            <button
                                className="btn btn-outline-secondary ms-2"
                                onClick={() => {
                                    if (reportType === "milk") fetchMilkReport()
                                    else if (reportType === "payments") fetchPaymentReport()
                                    else if (reportType === "monthly") fetchMonthlyReport()
                                }}
                                disabled={loading}
                            >
                                <FaSync /> {loading ? "Refreshing..." : "Refresh"}
                            </button>
                        )}

                    </div>

                    {!reportType && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "500px" }}>
                            <div style={{
                                width: "520px",
                                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                                borderRadius: "16px",
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.09), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                                padding: "70px 45px",
                                textAlign: "center",
                                border: "1px solid rgba(0, 0, 0, 0.05)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}>
                                <div style={{
                                    fontSize: "70px",
                                    color: "#0d6efd",
                                    marginBottom: "28px",
                                    display: "flex",
                                    justifyContent: "center",
                                    opacity: 0.85,
                                    animation: "fadeIn 0.6s ease-out"
                                }}>
                                    <FaChartBar />
                                </div>
                                
                                <h4 style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: "#1a1a1a",
                                    marginBottom: "12px",
                                    letterSpacing: "-0.3px"
                                }}>
                                    No Report Selected
                                </h4>
                                
                                <div style={{
                                    width: "50px",
                                    height: "2px",
                                    background: "linear-gradient(90deg, transparent, #0d6efd, transparent)",
                                    margin: "18px auto 24px",
                                    opacity: 0.5
                                }}></div>
                                
                                <p style={{
                                    fontSize: "15px",
                                    color: "#6c757d",
                                    marginBottom: 0,
                                    lineHeight: "1.6",
                                    opacity: 0.85
                                }}>
                                    Select a report button above to view real-time dairy analytics and insights
                                </p>
                            </div>
                            
                            <style>{`
                                @keyframes fadeIn {
                                    from {
                                        opacity: 0;
                                        transform: translateY(-10px);
                                    }
                                    to {
                                        opacity: 0.85;
                                        transform: translateY(0);
                                    }
                                }
                            `}</style>
                        </div>
                    )}

                    {reportType === "milk" && (
                        loading ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#0c5460" }}>
                                <p>Loading milk report...</p>
                            </div>
                        ) : milkData.length === 0 ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#6c757d" }}>
                                <p>No milk data found</p>
                            </div>
                        ) : (
                            <table className="table table-bordered">

                                <thead className="table-dark">
                                    <tr>
                                        <th>Date</th>
                                        <th>Farmer</th>
                                        <th>Quantity</th>
                                        <th>Fat</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {milkData.map((item) => (

                                        <tr key={item._id || item.date}>
                                            <td>{formatDateForDisplay(item.date)}</td>
                                            <td>{item.farmer}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.fat}</td>
                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )
                    )}

                    {reportType === "payments" && (
                        loading ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#0c5460" }}>
                                <p>Loading payment report...</p>
                            </div>
                        ) : paymentData.length === 0 ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#6c757d" }}>
                                <p>No payment data found</p>
                            </div>
                        ) : (
                            <table className="table table-bordered">

                                <thead className="table-dark">
                                    <tr>
                                        <th>Farmer</th>
                                        <th>Period (10 Days)</th>
                                        <th>Total Amount</th>
                                        <th>Paid</th>
                                        <th>Pending</th>
                                        <th>Entries</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {getPaymentsByPeriod().map((item, index) => (

                                        <tr key={index}>
                                            <td>{item.farmer}</td>
                                            <td>
                                                <span style={{
                                                    background: "#fff3cd",
                                                    color: "#856404",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }}>
                                                    {item.period}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: "bold", color: "#28a745" }}>₹{item.totalAmount.toFixed(2)}</td>
                                            <td style={{ color: "#17a2b8", fontWeight: "bold" }}>₹{item.paidAmount.toFixed(2)}</td>
                                            <td style={{ color: "#ffc107", fontWeight: "bold" }}>₹{item.pendingAmount.toFixed(2)}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <span style={{
                                                    background: "#e7f3ff",
                                                    color: "#0066cc",
                                                    padding: "2px 6px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }}>
                                                    {item.entries}
                                                </span>
                                            </td>
                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )
                    )}

                    {reportType === "monthly" && (
                        loading ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#0c5460" }}>
                                <p>Loading monthly report...</p>
                            </div>
                        ) : monthlyData.length === 0 ? (
                            <div style={{ textAlign: "center", marginTop: "20px", color: "#6c757d" }}>
                                <p>No monthly data found</p>
                            </div>
                        ) : (
                            <table className="table table-bordered">

                                <thead className="table-dark">
                                    <tr>
                                        <th>Month</th>
                                        <th>Total Milk</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {monthlyData.map((item) => (

                                        <tr key={item._id || item.month}>
                                            <td>{item.month}</td>
                                            <td>{item.totalMilk || item.milk}</td>
                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )
                    )}

                </div>

            </div>

        </div>

    )
}

export default Reports