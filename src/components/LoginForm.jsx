import React, { useState } from 'react'
import './LoginForm.css'

export default function LoginForm({ onLogin, onClose }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')
    
    // Valid credentials
    const validCredentials = [
      { username: 'Gnanesh', password: 'Gnanesh' },
      { username: '1277', password: '1277' },
      { username: '4868', password: '4868' },
      { username: '2300031699', password: 'Gnanesh' }
    ]
    
    // Check if entered credentials match any valid combination
    const isValid = validCredentials.some(
      cred => username.trim() === cred.username && password === cred.password
    )
    
    if (isValid) {
      const trimmedUsername = username.trim()
      // Determine user type based on username length
      // Username < 10 characters = admin, >= 10 characters = student
      const userType = trimmedUsername.length < 10 ? 'admin' : 'student'
      onLogin({ 
        username: trimmedUsername,
        userType: userType
      })
    } else {
      setError('Invalid credentials! Please enter correct username and password.')
      setPassword('') // Clear password field
    }
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-panel" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit} className="login-form">
          <label>
            Username (ID)
            <input 
              placeholder="Enter your ID" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </label>
          <label>
            Password
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1,
              height: '44px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: 'white',
              color: '#666',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" className="login-submit" style={{ flex: 1, margin: 0 }}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
