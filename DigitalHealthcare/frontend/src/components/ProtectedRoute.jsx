import React from 'react'
import { Navigate } from 'react-router-dom'
import { getAuthToken, getStoredUser } from '../utils/auth'

const normalizeRole = (role) => {
  if (!role) return null
  if (role === 'user') return 'patient'
  return role
}

const ProtectedRoute = ({ requiredRole, children }) => {
  try {
    const token = getAuthToken()
    const user = getStoredUser()
    if (!token || !user) return <Navigate to="/" replace />

    const role = normalizeRole(user.user_type || user.type || user.role)

    if (!requiredRole) return children

    const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const normalizedRequired = required.map(r => normalizeRole(r))

    if (!role || !normalizedRequired.includes(role)) {
      return <Navigate to="/403" replace />
    }

    return children
  } catch (_err) {
    return <Navigate to="/" replace />
  }
}

export default ProtectedRoute
