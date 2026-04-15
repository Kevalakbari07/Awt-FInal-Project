import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getTodayDayName } from "../utils/dateUtils"
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa"
import DeleteConfirmModal from "../components/DeleteConfirmModal"

function Farmers() {

    const [farmers, setFarmers] = useState<any[]>([])
    const [nextCodeNumber, setNextCodeNumber] = useState<number>(1)

    const [name, setName] = useState("")
    const [village, setVillage] = useState("")
    const [phone, setPhone] = useState("")
    const [codeNumber, setCodeNumber] = useState<number | string>("")

    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editVillage, setEditVillage] = useState("")
    const [editPhone, setEditPhone] = useState("")
    const [editCodeNumber, setEditCodeNumber] = useState<number | string>("")
    const [editErrors, setEditErrors] = useState<any>({})
    const [editSubmitting, setEditSubmitting] = useState(false)

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch farmers and next code on component load
    useEffect(() => {
        fetchFarmers()
        fetchNextCodeNumber()
    }, [])

    const fetchFarmers = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/farmers")
            if (!response.ok) throw new Error("Failed to fetch farmers")
            const data = await response.json()
            setFarmers(data || [])
            console.log("✅ Farmers loaded:", data)
        } catch (error) {
            console.error("Error fetching farmers:", error)
            setFarmers([])
        } finally {
            setLoading(false)
        }
    }

    const fetchNextCodeNumber = async () => {
        try {
            const response = await apiCall("/farmers/next-code")
            if (response.ok) {
                const data = await response.json()
                setNextCodeNumber(data.nextCodeNumber)
                setCodeNumber(data.nextCodeNumber)
                console.log("✅ Next code number:", data.nextCodeNumber)
            }
        } catch (error) {
            console.error("Error fetching next code:", error)
        }
    }

    const addFarmer = async () => {

        const newErrors: any = {}

        if (name.trim() === "") {
            newErrors.name = "Name is required"
        }

        if (village.trim() === "") {
            newErrors.village = "Village is required"
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            newErrors.phone = "Phone must be 10 digits"
        }

        if (!codeNumber || codeNumber < 1) {
            newErrors.codeNumber = "Code number must be 1 or higher"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {

            setSubmitting(true)

            try {
                const response = await apiCall("/farmers", {
                    method: "POST",
                    body: JSON.stringify({
                        name: name.trim(),
                        village: village.trim(),
                        phone: phone.trim(),
                        codeNumber: Number(codeNumber)
                    })
                })

                if (response.ok) {
                    // Clear inputs
                    setName("")
                    setVillage("")
                    setPhone("")
                    setErrors({})

                    // Refresh farmers list and next code
                    await fetchFarmers()
                    await fetchNextCodeNumber()
                } else {
                    const error = await response.json()
                    setErrors({ submit: error.message || "Failed to add farmer" })
                }

            } catch (error) {
                console.error("Error adding farmer:", error)
                setErrors({ submit: "Error adding farmer" })
            } finally {
                setSubmitting(false)
            }

        }

    }

    // Start editing a farmer
    const startEdit = (farmer: any) => {
        setEditingId(farmer._id)
        setEditName(farmer.name)
        setEditVillage(farmer.village)
        setEditPhone(farmer.phone)
        setEditCodeNumber(farmer.codeNumber)
        setEditErrors({})
    }

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
        setEditVillage("")
        setEditPhone("")
        setEditCodeNumber("")
        setEditErrors({})
    }

    // Update farmer
    const updateFarmer = async (farmerId: string) => {

        const newErrors: any = {}

        if (editName.trim() === "") {
            newErrors.name = "Name is required"
        }

        if (editVillage.trim() === "") {
            newErrors.village = "Village is required"
        }

        if (!/^[0-9]{10}$/.test(editPhone)) {
            newErrors.phone = "Phone must be 10 digits"
        }

        if (!editCodeNumber || editCodeNumber < 1) {
            newErrors.codeNumber = "Code number must be 1 or higher"
        }

        setEditErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {

            setEditSubmitting(true)

            try {
                const response = await apiCall(`/farmers/${farmerId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        name: editName.trim(),
                        village: editVillage.trim(),
                        phone: editPhone.trim(),
                        codeNumber: Number(editCodeNumber)
                    })
                })

                if (response.ok) {
                    await fetchFarmers()
                    cancelEdit()
                } else {
                    const error = await response.json()
                    setEditErrors({ submit: error.message || "Failed to update farmer" })
                }

            } catch (error) {
                console.error("Error updating farmer:", error)
                setEditErrors({ submit: "Error updating farmer" })
            } finally {
                setEditSubmitting(false)
            }

        }

    }

    // Delete farmer
    const deleteFarmer = async (farmerId: string) => {

        if (!isDeleting) {
            setIsDeleting(true)
        }

        try {
            const response = await apiCall(`/farmers/${farmerId}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchFarmers()
                await fetchNextCodeNumber()
                setShowDeleteModal(false)
                setDeleteTarget(null)
            } else {
                const error = await response.json()
                alert(error.message || "Failed to delete farmer")
            }

        } catch (error) {
            console.error("Error deleting farmer:", error)
            alert("Error deleting farmer")
        } finally {
            setIsDeleting(false)
        }

    }

    // Handle delete button click
    const handleDeleteClick = (farmerId: string, farmerName: string) => {
        setDeleteTarget({ id: farmerId, name: farmerName })
        setShowDeleteModal(true)
    }

    // Confirm delete
    const confirmDelete = () => {
        if (deleteTarget) {
            deleteFarmer(deleteTarget.id)
        }
    }

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setDeleteTarget(null)
        setIsDeleting(false)
    }

    return (

        <div>

            <Sidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0 }}>Farmers</h2>
                        <small style={{ color: "#6c757d" }}>{getTodayDayName()}</small>
                    </div>

                    <div className="card p-4 mb-4">

                        <h5 className="mb-3">Add New Farmer</h5>

                        <input
                            className="form-control mb-1"
                            placeholder="Farmer Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {errors.name && (
                            <small className="text-danger">{errors.name}</small>
                        )}

                        <input
                            className="form-control mt-3 mb-1"
                            placeholder="Village"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                        />

                        {errors.village && (
                            <small className="text-danger">{errors.village}</small>
                        )}

                        <input
                            className="form-control mt-3 mb-1"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        {errors.phone && (
                            <small className="text-danger">{errors.phone}</small>
                        )}

                        <div className="mt-3 mb-1">
                            <label className="form-label">Code Number</label>
                            <input
                                className="form-control"
                                type="number"
                                placeholder={`Next available: ${nextCodeNumber}`}
                                value={codeNumber}
                                onChange={(e) => setCodeNumber(e.target.value ? Number(e.target.value) : "")}
                                min="1"
                            />
                        </div>

                        {errors.codeNumber && (
                            <small className="text-danger">{errors.codeNumber}</small>
                        )}

                        {errors.submit && (
                            <small className="text-danger">{errors.submit}</small>
                        )}

                        <button
                            className="btn btn-success mt-3"
                            onClick={addFarmer}
                            disabled={submitting}
                        >
                            {submitting ? "Adding..." : "Add Farmer"}
                        </button>

                    </div>

                    {loading ? (
                        <div className="alert alert-info">Loading farmers...</div>
                    ) : farmers.length === 0 ? (
                        <div className="alert alert-warning">No farmers registered yet</div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table className="table table-bordered table-hover">

                                <thead className="table-dark">

                                    <tr>
                                        <th>Code #</th>
                                        <th>Name</th>
                                        <th>Village</th>
                                        <th>Phone</th>
                                        <th style={{ width: "100px" }}>Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {farmers.map((farmer) => (

                                        editingId === farmer._id ? (
                                            <tr key={farmer._id} style={{ backgroundColor: "#f0f8ff" }}>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={editCodeNumber}
                                                        onChange={(e) => setEditCodeNumber(e.target.value ? Number(e.target.value) : "")}
                                                        min="1"
                                                    />
                                                    {editErrors.codeNumber && <small className="text-danger d-block">{editErrors.codeNumber}</small>}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                    />
                                                    {editErrors.name && <small className="text-danger d-block">{editErrors.name}</small>}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editVillage}
                                                        onChange={(e) => setEditVillage(e.target.value)}
                                                    />
                                                    {editErrors.village && <small className="text-danger d-block">{editErrors.village}</small>}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                    />
                                                    {editErrors.phone && <small className="text-danger d-block">{editErrors.phone}</small>}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary me-1"
                                                        onClick={() => updateFarmer(farmer._id)}
                                                        disabled={editSubmitting}
                                                        title="Save"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={cancelEdit}
                                                        title="Cancel"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={farmer._id}>
                                                <td><strong>{farmer.codeNumber}</strong></td>
                                                <td>{farmer.name}</td>
                                                <td>{farmer.village}</td>
                                                <td>{farmer.phone}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-warning me-1"
                                                        onClick={() => startEdit(farmer)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteClick(farmer._id, farmer.name)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
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
                title="Delete Farmer"
                message={`Are you sure you want to delete farmer "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isDeleting={isDeleting}
            />

        </div>

    )
}

export default Farmers