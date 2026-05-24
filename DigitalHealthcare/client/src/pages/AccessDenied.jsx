import React from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthSession, getStoredUser } from '../utils/auth'

const AccessDenied = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/')
  }

  const userInfo = getStoredUser()

  return (
    <div style={{ padding: 20 }}>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      {userInfo && (
        <div>
          <p>
            Logged in as: <strong>{userInfo.username}</strong> ({userInfo.user_type || userInfo.type || 'unknown'})
          </p>
        </div>
      )}
      <button onClick={handleLogout}>Return to Home / Logout</button>
    </div>
  )
}

export default AccessDenied
