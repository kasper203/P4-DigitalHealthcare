import React from 'react'
import { useNavigate } from 'react-router-dom'

const AccessDenied = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  let userInfo = null
  try {
    const raw = localStorage.getItem('user')
    if (raw) userInfo = JSON.parse(raw)
  } catch (_e) {
    userInfo = null
  }

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
