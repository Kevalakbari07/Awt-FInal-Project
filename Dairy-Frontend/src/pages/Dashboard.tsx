import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getTodayDateString, getCurrentDateTimeIST, getTodayDayName } from "../utils/dateUtils"
import { FaChartLine, FaUsers, FaWater, FaMoneyBill, FaChartBar, FaSpinner } from "react-icons/fa"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer
} from "recharts"

function Dashboard() {

    const [farmersCount, setFarmersCount] = useState(0)
    const [milkToday, setMilkToday] = useState(0)
    const [totalPayments, setTotalPayments] = useState(0)
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    
    // Fat rate settings
    const [fatRate, setFatRate] = useState(0)
    const [editingFatRate, setEditingFatRate] = useState(false)
    const [newFatRate, setNewFatRate] = useState("")
    const [savingFatRate, setSavingFatRate] = useState(false)

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Build chart data from scratch
    const buildChartData = (milkEntries: any[]): any[] => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const todayStr = getTodayDateString() // Use the same function as the rest of the app
        
        // Build 7-day chart starting from 6 days ago
        const result = []
        const today = new Date()
        
        for (let i = 6; i >= 0; i--) {
            const chartDate = new Date(today)
            chartDate.setDate(chartDate.getDate() - i)
            
            // Create date string in YYYY-MM-DD format
            const year = chartDate.getFullYear()
            const month = String(chartDate.getMonth() + 1).padStart(2, '0')
            const day = String(chartDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            const dayIndex = chartDate.getDay()
            const dayShort = dayNames[dayIndex]
            
            // Sum all milk entries for this specific date
            const totalMilk = milkEntries
                .filter((entry: any) => entry.date === dateStr)
                .reduce((sum: number, entry: any) => sum + (entry.quantity || 0), 0)
            
            result.push({
                date: dateStr,
                day: dayShort,
                milk: totalMilk ? Math.round(totalMilk) : 0,
                isToday: dateStr === todayStr
            })
        }
        
        console.log("📊 Chart Data Built:", result, "Today:", todayStr)
        return result
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            setError("")

            try {
                // 1. Fetch farmers count
                const farmersResponse = await apiCall("/farmers")
                if (!farmersResponse.ok) throw new Error("Failed to fetch farmers")
                const farmers = await farmersResponse.json()
                setFarmersCount(farmers.length || 0)

                // 2. Fetch milk collection data
                const milkResponse = await apiCall("/milk")
                if (!milkResponse.ok) throw new Error("Failed to fetch milk data")
                const milkData = await milkResponse.json()
                
                // Calculate milk today
                const today = getTodayDateString()
                const todayMilk = milkData
                    .filter((entry: any) => entry.date === today)
                    .reduce((sum: number, entry: any) => sum + (entry.quantity || 0), 0)
                
                setMilkToday(todayMilk)

                // Build chart from scratch
                const weeklyData = buildChartData(milkData)
                setChartData(weeklyData)

                // 3. Fetch payments and calculate total
                const paymentsResponse = await apiCall("/payments")
                if (!paymentsResponse.ok) throw new Error("Failed to fetch payments")
                const payments = await paymentsResponse.json()
                const total = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
                setTotalPayments(total)

                // 4. Fetch fat rate settings
                const settingsResponse = await apiCall("/settings")
                if (settingsResponse.ok) {
                    const settings = await settingsResponse.json()
                    setFatRate(settings.fatRate || 0)
                }

                setLoading(false)

            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                setError("Failed to load dashboard data")
                setLoading(false)
            }
        }

        fetchDashboardData()
        const interval = setInterval(fetchDashboardData, 5000)
        return () => clearInterval(interval)
    }, [])

    // Save fat rate
    const saveFatRate = async () => {
        if (!newFatRate || Number(newFatRate) < 0) {
            alert("Please enter a valid fat rate")
            return
        }

        setSavingFatRate(true)
        try {
            const response = await apiCall("/settings", {
                method: "PUT",
                body: JSON.stringify({ fatRate: Number(newFatRate) })
            })

            if (response.ok) {
                const updated = await response.json()
                setFatRate(updated.fatRate)
                setEditingFatRate(false)
                setNewFatRate("")
                console.log("✅ Fat rate saved:", updated.fatRate)
            } else {
                alert("Failed to save fat rate")
            }
        } catch (error) {
            console.error("Error saving fat rate:", error)
            alert("Error saving fat rate")
        } finally {
            setSavingFatRate(false)
        }
    }

    // Cancel editing
    const cancelEditFatRate = () => {
        setEditingFatRate(false)
        setNewFatRate("")
    }

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ marginLeft: "250px", width: "100%", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}><FaChartLine /> Dashboard</h2>
                        <div style={{ textAlign: "right", padding: "10px", background: "#f0f9ff", borderRadius: "8px", borderLeft: "4px solid #06b6d4" }}>
                            <small style={{ color: "#0891b2", display: "block", fontWeight: "bold", fontSize: "1.1rem" }}>
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                            </small>
                            <small style={{ color: "#0369a1", fontWeight: "bold", fontSize: "0.95rem" }}>
                                {currentTime.toLocaleTimeString()}
                            </small>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row mb-4">

                        <div className="col-md-4">
                            <div className="dashboard-card card-primary">
                                <div className="card-icon"><FaUsers size={32} color="#0369a1" /></div>
                                <div className="card-label">Total Farmers</div>
                                <div className="card-value">{loading ? "..." : farmersCount}</div>
                                <div className="card-change positive">↑ Active Members</div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dashboard-card card-success">
                                <div className="card-icon"><FaWater size={32} color="#10b981" /></div>
                                <div className="card-label">Milk Today</div>
                                <div className="card-value">{loading ? "..." : milkToday} <span style={{ fontSize: "1.2rem" }}>L</span></div>
                                <div className="card-change positive">↑ Production Up</div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dashboard-card card-warning">
                                <div className="card-icon"><FaMoneyBill size={32} color="#f59e0b" /></div>
                                <div className="card-label">Total Payments</div>
                                <div className="card-value">₹{loading ? "..." : totalPayments}</div>
                                <div className="card-change positive">↑ Processed</div>
                            </div>
                        </div>

                    </div>

                    {/* Fat Rate Settings Card */}
                    <div className="card p-4 shadow mb-4" style={{
                        background: "#f0f9ff",
                        borderRadius: "12px",
                        borderLeft: "4px solid #06b6d4"
                    }}>
                        <h5 style={{ color: "#0891b2", fontWeight: "700", marginBottom: "15px" }}>⚙️ Fat Rate Settings</h5>
                        
                        {editingFatRate ? (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="number"
                                    value={newFatRate}
                                    onChange={(e) => setNewFatRate(e.target.value)}
                                    placeholder="Enter fat rate (₹)"
                                    className="form-control"
                                    step="0.01"
                                    min="0"
                                    style={{ maxWidth: "200px" }}
                                />
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={saveFatRate}
                                    disabled={savingFatRate}
                                >
                                    {savingFatRate ? "Saving..." : "Save"}
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={cancelEditFatRate}
                                    disabled={savingFatRate}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: 0, color: "#6c757d", fontSize: "0.9rem" }}>Current Fat Rate (per unit):</p>
                                    <p style={{ margin: "5px 0 0 0", fontSize: "1.8rem", fontWeight: "bold", color: "#0891b2" }}>
                                        ₹{fatRate}
                                    </p>
                                    <small style={{ color: "#64748b" }}>This rate applies to all your milk collections</small>
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                        setEditingFatRate(true)
                                        setNewFatRate(fatRate.toString())
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card p-4 shadow" style={{
                        background: "white",
                        borderRadius: "12px",
                        borderTop: "4px solid #0369a1"
                    }}>

                        <h5 className="mb-3" style={{ color: "#0369a1", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}><FaChartBar /> Weekly Milk Collection (Last 7 Days)</h5>
                        
                        <div style={{ marginBottom: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
                            📍 <span style={{ fontWeight: "bold", color: "#10b981" }}>Green highlight = Today</span>
                        </div>

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
                                        formatter={(value: any, name: string, props: any) => {
                                            const isToday = props.payload.isToday
                                            return [
                                                `${value} L`,
                                                `${props.payload.day}${isToday ? ' (TODAY)' : ''}`
                                            ]
                                        }}
                                    />
                                    <Bar 
                                        dataKey="milk" 
                                        fill="#0369a1"
                                        radius={[8, 8, 0, 0]}
                                    >
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={entry.isToday ? "#10b981" : "#0369a1"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                    </div>

                </div>

            </div>

        </div>

    )
}

export default Dashboard