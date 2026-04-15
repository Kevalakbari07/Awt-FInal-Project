import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import Header from "../../components/Header"
import { apiCall } from "../../utils/apiClient"

function ManageReports() {

    const [reports, setReports] = useState<any[]>([])

    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")

    // Fetch reports on load
    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const response = await apiCall("/reports")
            if (!response.ok) throw new Error("Failed to fetch reports")
            const data = await response.json()
            setReports(data || [])
        } catch (error) {
            console.error("Error fetching reports:", error)
            setReports([])
        }
    }

    const addReport = async () => {

        if (title === "" || desc === "") return

        try {
            const userId = localStorage.getItem("userId")
            const userName = localStorage.getItem("username") || "temporary-user"

            const response = await apiCall("/reports", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description: desc,
                    date: new Date().toLocaleDateString(),
                    userId: userId,
                    userName: userName
                })
            })

            if (response.ok) {
                setTitle("")
                setDesc("")
                await fetchReports()
            } else {
                console.error("Failed to add report")
            }

        } catch (error) {
            console.error("Error adding report:", error)
        }

    }

    const deleteReport = async (id: string) => {

        try {
            const response = await apiCall(`/reports/${id}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchReports()
            } else {
                console.error("Failed to delete report")
            }

        } catch (error) {
            console.error("Error deleting report:", error)
        }

    }

    return (

        <div>

            <AdminSidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2>Manage Reports</h2>

                    {/* ADD REPORT FORM */}

                    <div className="card p-4 mb-4">

                        <input
                            className="form-control mb-2"
                            placeholder="Report Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="form-control mb-2"
                            placeholder="Report Description"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />

                        <button
                            className="btn btn-primary"
                            onClick={addReport}
                        >
                            Add Report
                        </button>

                    </div>

                    {/* REPORT LIST */}

                    <table className="table table-bordered">

                        <thead className="table-dark">

                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {reports.map(r => (

                                <tr key={r._id || r.id}>

                                    <td>{(r._id || r.id).toString().substring(0, 8)}...</td>
                                    <td>{r.title}</td>
                                    <td>{r.description || r.desc}</td>
                                    <td>{r.date || r.createdAt?.split('T')[0]}</td>

                                    <td>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteReport(r._id || r.id)}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    )

}

export default ManageReports
