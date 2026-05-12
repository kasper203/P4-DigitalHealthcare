import React from 'react'
import { Navigate } from 'react-router-dom'

const normalizeRole = (role) => {
  if (!role) return null
  if (role === 'user') return 'patient'
  return role
}

const ProtectedRoute = ({ requiredRole, children }) => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return <Navigate to="/" replace />

    const user = JSON.parse(raw)
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
