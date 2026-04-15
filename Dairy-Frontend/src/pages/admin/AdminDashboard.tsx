import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import Header from "../../components/Header"
import { apiCall } from "../../utils/apiClient"
import { FaLock, FaUsers, FaWater, FaMoneyBill, FaClock, FaChartBar, FaSpinner } from "react-icons/fa"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts"

function AdminDashboard() {

    const [totalFarmers, setTotalFarmers] = useState(0)
    const [totalMilk, setTotalMilk] = useState(0)
    const [totalPayments, setTotalPayments] = useState(0)
    const [pendingPayments, setPendingPayments] = useState(0)
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            // Fetch farmers
            const farmersRes = await apiCall("/farmers")
            if (!farmersRes.ok) throw new Error("Failed to fetch farmers")
            const farmers = await farmersRes.json()
            setTotalFarmers(farmers.length)

            // Fetch milk collections
            const milkRes = await apiCall("/milk")
            if (!milkRes.ok) throw new Error("Failed to fetch milk data")
            const milkData = await milkRes.json()
            const totalMilkQty = milkData.reduce((sum: number, m: any) => sum + (m.quantity || 0), 0)
            setTotalMilk(totalMilkQty)

            // Fetch payments
            const paymentsRes = await apiCall("/payments")
            if (!paymentsRes.ok) throw new Error("Failed to fetch payments")
            const payments = await paymentsRes.json()
            const totalPaymentAmount = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
            setTotalPayments(totalPaymentAmount)
            
            const pendingCount = payments.filter((p: any) => p.status === "Pending").length
            setPendingPayments(pendingCount)

            // Generate chart data from milk collections
            const dailyMilk: any = {}
            milkData.forEach((m: any) => {
                const date = m.date || new Date().toLocaleDateString()
                dailyMilk[date] = (dailyMilk[date] || 0) + (m.quantity || 0)
            })

            const chart = Object.entries(dailyMilk).map(([date, qty]) => ({
                day: date,
                milk: qty
            })).slice(-7)

            setChartData(chart.length > 0 ? chart : [
                { day: "Mon", milk: 0 },
                { day: "Tue", milk: 0 },
                { day: "Wed", milk: 0 },
                { day: "Thu", milk: 0 },
                { day: "Fri", milk: 0 },
                { day: "Sat", milk: 0 },
                { day: "Sun", milk: 0 }
            ])
        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    return (

        <div>

            <AdminSidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2 style={{ color: "#0369a1", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}><FaLock /> Admin Dashboard</h2>

                    <div className="row mt-4">

                        <div className="col-md-3 mb-3">
                            <div className="dashboard-card card-primary">
                                <div className="card-icon"><FaUsers size={32} color="#0369a1" /></div>
                                <div className="card-label">Total Farmers</div>
                                <div className="card-value">{totalFarmers}</div>
                                <div className="card-change positive">All Members</div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="dashboard-card card-success">
                                <div className="card-icon"><FaWater size={32} color="#10b981" /></div>
                                <div className="card-label">Total Milk</div>
                                <div className="card-value">{totalMilk} <span style={{ fontSize: "1.2rem" }}>L</span></div>
                                <div className="card-change positive">Collected</div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="dashboard-card card-warning">
                                <div className="card-icon"><FaMoneyBill size={32} color="#f59e0b" /></div>
                                <div className="card-label">Total Payments</div>
                                <div className="card-value">₹{totalPayments}</div>
                                <div className="card-change positive">Processed</div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="dashboard-card card-danger">
                                <div className="card-icon"><FaClock size={32} color="#ef4444" /></div>
                                <div className="card-label">Pending Approvals</div>
                                <div className="card-value">{pendingPayments}</div>
                                <div className="card-change negative">Waiting</div>
                            </div>
                        </div>

                    </div>

                    <div className="card mt-4 p-4 shadow" style={{
                        background: "white",
                        borderRadius: "12px",
                        borderTop: "4px solid #f59e0b"
                    }}>

                        <h5 style={{ color: "#0369a1", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}><FaChartBar /> Weekly Milk Collection</h5>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                <div style={{ fontSize: "2rem", color: "#0369a1", animation: "spin 1s linear infinite" }}><FaSpinner /></div>
                                <p style={{ color: "#6b7280", marginTop: "10px" }}>Loading chart data...</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>

                                <BarChart data={chartData}>

                                    <XAxis dataKey="day" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip 
                                        contentStyle={{
                                            background: "white",
                                            border: "2px solid #0369a1",
                                            borderRadius: "8px"
                                        }}
                                    />

                                    <Bar dataKey="milk" fill="url(#colorMilk)" />
                                    <defs>
                                        <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>

                                </BarChart>

                            </ResponsiveContainer>
                        )}

                    </div>

                </div>

            </div>

        </div>

    )

}

export default AdminDashboard
