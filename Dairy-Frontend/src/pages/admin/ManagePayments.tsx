import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import Header from "../../components/Header"
import { apiCall } from "../../utils/apiClient"

function ManagePayments() {

    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/payments")
            if (!response.ok) throw new Error("Failed to fetch payments")
            const data = await response.json()
            setPayments(data || [])
        } catch (error) {
            console.error("Error fetching payments:", error)
            setPayments([])
        } finally {
            setLoading(false)
        }
    }

    const approvePayment = async (id: string) => {
        try {
            const response = await apiCall(`/payments/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: "Approved" })
            })
            if (response.ok) {
                await fetchPayments()
            }
        } catch (error) {
            console.error("Error approving payment:", error)
        }
    }

    return (

        <div>

            <AdminSidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2>Approve Payments</h2>

                    {loading ? (
                        <p>Loading payments...</p>
                    ) : payments.length === 0 ? (
                        <p>No payments found</p>
                    ) : (
                        <table className="table table-bordered mt-3">

                            <thead className="table-dark">
                                <tr>
                                    <th>Farmer Name</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {payments.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.farmer}</td>
                                        <td>₹{p.amount}</td>
                                        <td>
                                            <span className={`badge ${p.status === "Approved" ? "bg-success" : "bg-warning"}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>{p.date}</td>
                                        <td>{p.userName}</td>
                                        <td>

                                            {p.status === "Pending" && (

                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => approvePayment(p._id)}
                                                >
                                                    Approve
                                                </button>

                                            )}

                                        </td>
                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    )}

                </div>

            </div>

        </div>

    )

}

export default ManagePayments
