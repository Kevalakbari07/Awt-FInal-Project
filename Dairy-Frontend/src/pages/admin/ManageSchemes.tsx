import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import Header from "../../components/Header"
import { apiCall } from "../../utils/apiClient"

function ManageSchemes() {

    const [schemes, setSchemes] = useState<any[]>([])

    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")

    // Fetch schemes on load
    useEffect(() => {
        fetchSchemes()
    }, [])

    const fetchSchemes = async () => {
        try {
            const response = await apiCall("/schemes")
            if (!response.ok) throw new Error("Failed to fetch schemes")
            const data = await response.json()
            setSchemes(data || [])
        } catch (error) {
            console.error("Error fetching schemes:", error)
            setSchemes([])
        }
    }

    const addScheme = async () => {

        if (title === "" || desc === "") return

        try {
            const userId = localStorage.getItem("userId")
            const userName = localStorage.getItem("username") || "temporary-user"

            const response = await apiCall("/schemes", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description: desc,
                    userId: userId,
                    userName: userName
                })
            })

            if (response.ok) {
                setTitle("")
                setDesc("")
                await fetchSchemes()
            } else {
                console.error("Failed to add scheme")
            }

        } catch (error) {
            console.error("Error adding scheme:", error)
        }

    }

    const deleteScheme = async (id: string) => {

        try {
            const response = await apiCall(`/schemes/${id}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchSchemes()
            } else {
                console.error("Failed to delete scheme")
            }

        } catch (error) {
            console.error("Error deleting scheme:", error)
        }

    }

    return (

        <div>

            <AdminSidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <h2>Manage Schemes</h2>

                    <div className="card p-4 mb-4">

                        <input
                            className="form-control mb-2"
                            placeholder="Scheme Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            className="form-control mb-2"
                            placeholder="Description"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />

                        <button
                            className="btn btn-success"
                            onClick={addScheme}
                        >

                            Add Scheme

                        </button>

                    </div>

                    <table className="table table-bordered">

                        <thead className="table-dark">

                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {schemes.map(s => (

                                <tr key={s._id || s.id}>

                                    <td>{(s._id || s.id).toString().substring(0, 8)}...</td>
                                    <td>{s.title}</td>
                                    <td>{s.description || s.desc}</td>

                                    <td>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteScheme(s._id || s.id)}
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

export default ManageSchemes
