import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import Header from "../../components/Header"
import { apiCall } from "../../utils/apiClient"

function ManageFarmers() {

    const [farmers, setFarmers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFarmers()
    }, [])

    const fetchFarmers = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/farmers")
            if (!response.ok) throw new Error("Failed to fetch farmers")
            const data = await response.json()
            setFarmers(data || [])
        } catch (error) {
            console.error("Error fetching farmers:", error)
            setFarmers([])
        } finally {
            setLoading(false)
        }
    }

    const deleteFarmer = async (id: string) => {
        try {
            const response = await apiCall(`/farmers/${id}`, {
                method: "DELETE"
            })
            if (response.ok) {
                await fetchFarmers()
            }
        } catch (error) {
            console.error("Error deleting farmer:", error)
        }
    }

    return (

        <div>

            <AdminSidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2>Manage Farmers</h2>

                    {loading ? (
                        <p>Loading farmers...</p>
                    ) : farmers.length === 0 ? (
                        <p>No farmers found</p>
                    ) : (
                        <table className="table table-bordered mt-3">

                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Village</th>
                                    <th>Phone</th>
                                    <th>User</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {farmers.map(f => (
                                    <tr key={f._id}>
                                        <td>{f.name}</td>
                                        <td>{f.village}</td>
                                        <td>{f.phone}</td>
                                        <td>{f.userName}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteFarmer(f._id)}
                                            >
                                                Delete
                                            </button>
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

export default ManageFarmers
