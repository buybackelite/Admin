import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import PriceEngine from './pages/PriceEngine'
import ConditionDeductions from './pages/ConditionDeductions'
import FraudAlerts from './pages/FraudAlerts'
import AgentManagement from './pages/AgentManagement'
import Notifications from './pages/Notifications'
import CashifyPrices from './pages/CashifyPrices'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'

function ProtectedRoute({ children }) {
  const { isAuthenticated, checkAuth } = useStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAuth().finally(() => setIsChecking(false))
  }, [checkAuth])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<Requests />} />
          <Route path="price-engine" element={<PriceEngine />} />
          <Route path="condition-deductions" element={<ConditionDeductions />} />
          <Route path="fraud-alerts" element={<FraudAlerts />} />
          <Route path="agents" element={<AgentManagement />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cashify-prices" element={<CashifyPrices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
