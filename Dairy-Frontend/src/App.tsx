import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Farmers from "./pages/Farmers"
import MilkCollection from "./pages/MilkCollection"
import Payments from "./pages/Payments"
import PaymentsSummary from "./pages/PaymentsSummary"
import Reports from "./pages/Reports"
import Schemes from "./pages/Schemes"
import SubscriptionPage from "./pages/SubscriptionPage"
import AdminProtectedRoute from "./components/AdminProtectedRoute"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminDashboard from "./pages/admin/AdminDashboard.tsx"
import ManageFarmers from "./pages/admin/ManageFarmers.tsx"
import ManagePayments from "./pages/admin/ManagePayments.tsx"
import ManageReports from "./pages/admin/ManageReports.tsx"
import ManageSchemes from "./pages/admin/ManageSchemes.tsx"
import ManageSubscriptionPlans from "./pages/admin/ManageSubscriptionPlans.tsx"
import ManageUserSubscriptions from "./pages/admin/ManageUserSubscriptions.tsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        <Route path="/farmers" element={<ProtectedRoute><Farmers /></ProtectedRoute>} />
        <Route path="/milk" element={<ProtectedRoute><MilkCollection /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/payments-summary" element={<ProtectedRoute><PaymentsSummary /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/manage-farmers" element={<AdminProtectedRoute><ManageFarmers /></AdminProtectedRoute>} />
        <Route path="/manage-payments" element={<AdminProtectedRoute><ManagePayments /></AdminProtectedRoute>} />
        <Route path="/manage-reports" element={<AdminProtectedRoute><ManageReports /></AdminProtectedRoute>} />
        <Route path="/manage-schemes" element={<AdminProtectedRoute><ManageSchemes /></AdminProtectedRoute>} />
        <Route path="/manage-subscription-plans" element={<AdminProtectedRoute><ManageSubscriptionPlans /></AdminProtectedRoute>} />
        <Route path="/manage-user-subscriptions" element={<AdminProtectedRoute><ManageUserSubscriptions /></AdminProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App