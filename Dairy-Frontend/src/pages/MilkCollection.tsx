import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { apiCall } from "../utils/apiClient"
import { getTodayDateString, getTodayDateForInput, convertToDisplayFormat } from "../utils/dateUtils"
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa"
import DeleteConfirmModal from "../components/DeleteConfirmModal"

function MilkCollection() {

    const [farmer, setFarmer] = useState("")
    const [quantity, setQuantity] = useState("")
    const [fat, setFat] = useState("")

    const [records, setRecords] = useState<any[]>([])
    const [farmers, setFarmers] = useState<any[]>([])
    const [globalFatRate, setGlobalFatRate] = useState(0)
    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editQuantity, setEditQuantity] = useState("")
    const [editFat, setEditFat] = useState("")
    const [editErrors, setEditErrors] = useState<any>({})
    const [editSubmitting, setEditSubmitting] = useState(false)

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; farmer: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch milk records and farmers on page load
    useEffect(() => {
        fetchRecords()
        fetchFarmers()
        fetchGlobalSettings()
    }, [])

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const response = await apiCall("/milk")
            if (!response.ok) throw new Error("Failed to fetch milk records")
            const data = await response.json()
            setRecords(data || [])
            setLastUpdated(new Date())
            console.log("✅ Milk records loaded:", data)
        } catch (error) {
            console.error("Error fetching milk records:", error)
            setRecords([])
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

    const fetchGlobalSettings = async () => {
        try {
            const response = await apiCall("/settings")
            if (!response.ok) throw new Error("Failed to fetch settings")
            const data = await response.json()
            setGlobalFatRate(data.fatRate || 0)
            console.log("✅ User fat rate loaded:", data.fatRate)
        } catch (error) {
            console.error("Error fetching settings:", error)
            setGlobalFatRate(0)
        }
    }

    // Helper function to get farmer code by name
    const getFarmerCode = (farmerName: string) => {
        const farmerObj = farmers.find((f) => f.name === farmerName)
        return farmerObj?.codeNumber || "-"
    }

    // Calculate total using formula: Fat % × Fat Rate × Quantity
    const calculateTotal = (fatPercentage: number, quantity: number): number => {
        return fatPercentage * globalFatRate * quantity
    }

    // Start editing
    const startEdit = (record: any) => {
        setEditingId(record._id)
        setEditQuantity(record.quantity.toString())
        setEditFat(record.fat.toString())
        setEditErrors({})
    }

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null)
        setEditQuantity("")
        setEditFat("")
        setEditErrors({})
    }

    // Update record
    const updateRecord = async (recordId: string) => {
        const newErrors: any = {}

        if (editQuantity === "" || Number(editQuantity) <= 0) {
            newErrors.quantity = "Enter valid quantity"
        }

        if (editFat === "" || Number(editFat) <= 0) {
            newErrors.fat = "Enter valid fat %"
        }

        setEditErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            setEditSubmitting(true)

            try {
                const total = calculateTotal(Number(editFat), Number(editQuantity))
                const response = await apiCall(`/milk/${recordId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        quantity: Number(editQuantity),
                        fat: Number(editFat),
                        total: total
                    })
                })

                if (response.ok) {
                    await fetchRecords()
                    cancelEdit()
                } else {
                    setEditErrors({ submit: "Failed to update record" })
                }
            } catch (error) {
                console.error("Error updating record:", error)
                setEditErrors({ submit: "Error updating record" })
            } finally {
                setEditSubmitting(false)
            }
        }
    }

    // Delete record
    const deleteRecord = async (recordId: string) => {
        if (!isDeleting) {
            setIsDeleting(true)
        }

        try {
            const response = await apiCall(`/milk/${recordId}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchRecords()
                setShowDeleteModal(false)
                setDeleteTarget(null)
            } else {
                const error = await response.json()
                alert(error.message || "Failed to delete record")
            }
        } catch (error) {
            console.error("Error deleting record:", error)
            alert("Error deleting record")
        } finally {
            setIsDeleting(false)
        }
    }

    // Handle delete button click
    const handleDeleteClick = (recordId: string, farmerName: string) => {
        setDeleteTarget({ id: recordId, farmer: farmerName })
        setShowDeleteModal(true)
    }

    // Confirm delete
    const confirmDelete = () => {
        if (deleteTarget) {
            deleteRecord(deleteTarget.id)
        }
    }

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setDeleteTarget(null)
        setIsDeleting(false)
    }

    const addRecord = async () => {

        const newErrors: any = {}

        if (farmer === "") {
            newErrors.farmer = "Select farmer"
        }

        if (quantity === "" || Number(quantity) <= 0) {
            newErrors.quantity = "Enter valid quantity"
        }

        if (fat === "" || Number(fat) <= 0) {
            newErrors.fat = "Enter valid fat %"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {

            setSubmitting(true)

            try {
                const total = calculateTotal(Number(fat), Number(quantity))
                const today = getTodayDateString()
                
                // Get farmer code from selected farmer
                const selectedFarmerObj = farmers.find((f) => f.name === farmer)
                const farmerCode = selectedFarmerObj?.codeNumber || 0

                const response = await apiCall("/milk", {
                    method: "POST",
                    body: JSON.stringify({
                        farmer: farmer.trim(),
                        farmerCode: farmerCode,
                        quantity: Number(quantity),
                        fat: Number(fat),
                        total: total,
                        date: today
                    })
                })

                if (response.ok) {
                    // Clear inputs
                    setFarmer("")
                    setQuantity("")
                    setFat("")
                    setErrors({})

                    // Refresh records list
                    await fetchRecords()
                } else {
                    console.error("Failed to add record")
                }

            } catch (error) {
                console.error("Error adding record:", error)
            } finally {
                setSubmitting(false)
            }

        }

    }

    return (

        <div>

            <Sidebar />

            <div style={{ marginLeft: "250px", transition: "all 0.3s ease" }}>

                <Header />

                <div className="container mt-4">

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Milk Collection</h2>
                            <small style={{ color: "#6c757d" }}>Global Fat Rate: ₹{globalFatRate}/unit</small>
                        </div>
                        <small style={{ color: "#6c757d" }}>Last updated: {lastUpdated.toLocaleTimeString()}</small>
                    </div>

                    <div className="card p-4 mb-4">

                        <select
                            className="form-control mb-1"
                            value={farmer}
                            onChange={(e) => setFarmer(e.target.value)}
                        >
                            <option value="">Select Farmer</option>
                            {farmers.map((f) => (
                                <option key={f._id} value={f.name}>
                                    {f.name} (Code: {f.codeNumber})
                                </option>
                            ))}
                        </select>

                        {errors.farmer && (
                            <small className="text-danger">{errors.farmer}</small>
                        )}

                        <input
                            className="form-control mt-3 mb-1"
                            placeholder="Milk Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />

                        {errors.quantity && (
                            <small className="text-danger">{errors.quantity}</small>
                        )}

                        <input
                            className="form-control mt-3 mb-1"
                            placeholder="Fat %"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                        />

                        {errors.fat && (
                            <small className="text-danger">{errors.fat}</small>
                        )}

                        <button
                            className="btn btn-success mt-3"
                            onClick={addRecord}
                            disabled={submitting}
                        >
                            {submitting ? "Adding..." : "Add Record"}
                        </button>

                    </div>

                    {loading ? (
                        <div className="alert alert-info">Loading milk records...</div>
                    ) : (
                        <table className="table table-bordered">

                            <thead className="table-dark">

                                <tr>
                                    <th>Code</th>
                                    <th>Farmer</th>
                                    <th>Quantity (L)</th>
                                    <th>Fat %</th>
                                    <th>Total (₹)</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {records.map((r) => (
                                    editingId === r._id ? (
                                        <tr key={r._id} style={{ backgroundColor: "#f0f8ff" }}>
                                            <td>{getFarmerCode(r.farmer)}</td>
                                            <td>{r.farmer}</td>
                                            <td>
                                                <input type="number" className="form-control form-control-sm" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
                                                {editErrors.quantity && <small className="text-danger d-block">{editErrors.quantity}</small>}
                                            </td>
                                            <td>
                                                <input type="number" className="form-control form-control-sm" value={editFat} onChange={(e) => setEditFat(e.target.value)} />
                                                {editErrors.fat && <small className="text-danger d-block">{editErrors.fat}</small>}
                                            </td>
                                            <td><strong>₹{calculateTotal(Number(editFat), Number(editQuantity)).toFixed(2)}</strong></td>
                                            <td>
                                                <button className="btn btn-sm btn-success me-2" onClick={() => updateRecord(r._id)} disabled={editSubmitting}>✓</button>
                                                <button className="btn btn-sm btn-secondary" onClick={cancelEdit} disabled={editSubmitting}><FaTimes /></button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={r._id}>
                                            <td>{getFarmerCode(r.farmer)}</td>
                                            <td>{r.farmer}</td>
                                            <td>{r.quantity}</td>
                                            <td>{r.fat}</td>
                                            <td><strong>₹{r.total.toFixed(2)}</strong></td>
                                            <td>{r.date}</td>
                                            <td>
                                                <button className="btn btn-sm btn-primary me-2" onClick={() => startEdit(r)} title="Edit"><FaEdit /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(r._id, r.farmer)} title="Delete"><FaTrash /></button>
                                            </td>
                                        </tr>
                                    )
                                ))}

                            </tbody>

                        </table>
                    )}

                </div>

            </div>

            <DeleteConfirmModal
                show={showDeleteModal}
                title="Delete Milk Record"
                message={`Are you sure you want to delete the milk collection record for "${deleteTarget?.farmer}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isDeleting={isDeleting}
            />

        </div>

    )
}

export default MilkCollection