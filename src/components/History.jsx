import React from 'react'
import './History.css'

export default function History({ user, history, onLoadHistory, onDeleteHistory, onClose }) {
  if (!user) return null

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  function formatDate(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function handleLoad(item) {
    onLoadHistory(item)
    onClose()
  }

  return (
    <div className="history-overlay">
      <div className="history-panel">
        <div className="history-header">
          <h2>📚 My History</h2>
          <button className="history-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        
        <div className="history-info">
          <p>💡 History is saved locally in your browser. To access from other devices, keep the same browser signed in.</p>
        </div>
        
        {sortedHistory.length === 0 ? (
          <div className="history-empty">
            <p>No history yet. Generate your first question set!</p>
          </div>
        ) : (
          <div className="history-list">
            {sortedHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <h3 className="history-item-title">{item.fileName}</h3>
                  <span className="history-item-date">{formatDate(item.timestamp)}</span>
                </div>
                <div className="history-item-details">
                  <span className="history-item-count">
                    {item.questions.length} questions
                  </span>
                  <span className="history-item-subjects">
                    Chemistry: {item.questions.filter(q => q.subject === 'Chemistry').length} | 
                    Physics: {item.questions.filter(q => q.subject === 'Physics').length} | 
                    Maths: {item.questions.filter(q => q.subject === 'Maths').length}
                  </span>
                </div>
                <div className="history-item-actions">
                  <button 
                    className="history-load-btn" 
                    onClick={() => handleLoad(item)}
                  >
                    📖 Load
                  </button>
                  <button 
                    className="history-delete-btn" 
                    onClick={() => onDeleteHistory(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
