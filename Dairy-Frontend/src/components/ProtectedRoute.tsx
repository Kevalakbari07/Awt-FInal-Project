import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userId = localStorage.getItem("userId")
  const username = localStorage.getItem("username")
  const role = localStorage.getItem("role")

  // If user is not logged in (no userId in localStorage), redirect to login
  if (!userId || !username || !role) {
    return <Navigate to="/" replace />
  }

  // User is logged in, allow access to the protected page
  return <>{children}</>
}

export default ProtectedRoute
