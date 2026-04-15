import { useState } from "react"

interface DeleteConfirmModalProps {
    show: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    isDeleting?: boolean
}

function DeleteConfirmModal({ show, title, message, onConfirm, onCancel, isDeleting = false }: DeleteConfirmModalProps) {
    if (!show) return null

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "30px",
                    maxWidth: "400px",
                    width: "90%",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    animation: "slideIn 0.3s ease-out"
                }}
            >
                <style>{`
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>

                <h4 style={{ color: "#d32f2f", marginBottom: "15px", fontWeight: "600" }}>
                    ⚠️ {title}
                </h4>

                <p style={{ color: "#666", marginBottom: "25px", lineHeight: "1.5" }}>
                    {message}
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            opacity: isDeleting ? 0.7 : 1
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal
