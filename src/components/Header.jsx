import React, { useState, useRef, useEffect } from 'react'
import './Header.css'

export default function Header({ user, onLoginClick, onLogout, onHistoryClick, onAdminClick }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef()
  const isAdmin = user && user.username === 'Gnanesh'

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  return (
    <header className="site-header">
      <div className="site-header__logo-section">
        <img src="/logo.jpg" alt="logo" className="site-header__logo" />
        <div className="site-header__logo-text">
          <div className="site-header__logo-title">KL CSE-4</div>
          <div className="site-header__logo-subtitle">EXAM Portal</div>
        </div>
      </div>

      {!user ? (
        <button className="site-header__login" onClick={onLoginClick} aria-label="Login">Login</button>
      ) : (
        <div className="site-header__user-controls">
          <button className="site-header__history" onClick={onHistoryClick} aria-label="History">
            📚 History
          </button>
          {isAdmin && (
            <button className="site-header__admin" onClick={onAdminClick} aria-label="Admin Panel">
              🔧 Admin
            </button>
          )}
          <div className="site-header__user" ref={menuRef}>
            <button className="site-header__userbtn" onClick={() => setOpen((s) => !s)}>{user.username}</button>
            {open && (
              <div className="site-header__dropdown">
                <button className="site-header__logout" onClick={() => { onLogout(); setOpen(false) }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="site-header__inner">
        <h1 className="site-header__title">Koneru Lakshmaiah Education Foundation</h1>
        <h2 className="site-header__subtitle">Academic Examination Portal</h2>
        <p className="site-header__department">Department of CSE-4</p>
      </div>
    </header>
  )
}
