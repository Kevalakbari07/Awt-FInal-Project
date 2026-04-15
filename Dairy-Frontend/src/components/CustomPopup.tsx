import { useEffect } from "react"
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa"

interface PopupProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

function CustomPopup({ message, type, onClose }: PopupProps) {
  useEffect(() => {
    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === "success"
  const bgColor = isSuccess ? "#10b981" : "#ef4444"
  const lightBg = isSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"
  const borderColor = isSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"
  const shadowColor = isSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease-in-out"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backdropFilter: "blur(15px)",
          background: `linear-gradient(135deg, ${lightBg}, ${lightBg})`,
          border: `1px solid ${borderColor}`,
          borderRadius: "16px",
          padding: "40px 30px",
          width: "90%",
          maxWidth: "380px",
          boxShadow: `0 20px 60px ${shadowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
          animation: "scaleIn 0.3s ease-in-out",
          textAlign: "center",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            color: bgColor,
            fontSize: "24px",
            cursor: "pointer",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
          }}
        >
          <FaTimes />
        </button>

        {/* Icon */}
        <div
          style={{
            fontSize: "60px",
            marginBottom: "20px",
            color: bgColor,
            display: "flex",
            justifyContent: "center"
          }}
        >
          {isSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}
        </div>

        {/* Message */}
        <p
          style={{
            color: bgColor,
            fontSize: "16px",
            fontWeight: "600",
            margin: "0",
            lineHeight: "1.6",
            letterSpacing: "0.3px"
          }}
        >
          {message}
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: "20px",
            height: "3px",
            background: borderColor,
            borderRadius: "2px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              background: bgColor,
              animation: "progress 3s ease-in-out forwards"
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export default CustomPopup
