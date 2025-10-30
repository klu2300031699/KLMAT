import React, { useState } from 'react'
import './QuizHistory.css'

export default function QuizHistory({ quizHistory, onClose, onViewDetails }) {
  const [sortBy, setSortBy] = useState('date') // date, score, time

  const sortedHistory = [...quizHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.timestamp) - new Date(a.timestamp)
      case 'score':
        return parseFloat(b.percentage) - parseFloat(a.percentage)
      case 'time':
        return a.timeElapsed - b.timeElapsed
      default:
        return 0
    }
  })

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (percentage) => {
    const pct = parseFloat(percentage)
    if (pct >= 80) return '#28a745'
    if (pct >= 60) return '#ffc107'
    return '#dc3545'
  }

  const getScoreGrade = (percentage) => {
    const pct = parseFloat(percentage)
    if (pct >= 90) return 'A+'
    if (pct >= 80) return 'A'
    if (pct >= 70) return 'B'
    if (pct >= 60) return 'C'
    if (pct >= 50) return 'D'
    return 'F'
  }

  // Calculate statistics
  const totalAttempts = quizHistory.length
  const avgScore = totalAttempts > 0
    ? (quizHistory.reduce((sum, q) => sum + parseFloat(q.percentage), 0) / totalAttempts).toFixed(1)
    : 0
  const bestScore = totalAttempts > 0
    ? Math.max(...quizHistory.map(q => parseFloat(q.percentage))).toFixed(1)
    : 0
  const totalQuestions = quizHistory.reduce((sum, q) => sum + q.totalQuestions, 0)

  return (
    <div className="quiz-history-overlay">
      <div className="quiz-history-panel-modern">
        <div className="quiz-history-header-modern">
          <h2>Quiz History</h2>
          <button className="history-close-btn" onClick={onClose}>✕</button>
        </div>

        {quizHistory.length === 0 ? (
          <div className="quiz-history-empty-modern">
            <div className="empty-icon-modern">📝</div>
            <h3>No Quiz Attempts Yet</h3>
            <p>Start a quiz to see your results here!</p>
          </div>
        ) : (
          <>
            <div className="quiz-stats-modern">
              <div className="stat-box-modern">
                <div className="stat-label-modern">Total Attempts</div>
                <div className="stat-value-modern">{totalAttempts}</div>
              </div>
              <div className="stat-box-modern">
                <div className="stat-label-modern">Average Score</div>
                <div className="stat-value-modern avg-score">{avgScore}%</div>
              </div>
              <div className="stat-box-modern">
                <div className="stat-label-modern">Best Score</div>
                <div className="stat-value-modern best-score">{bestScore}%</div>
              </div>
              <div className="stat-box-modern">
                <div className="stat-label-modern">Questions Solved</div>
                <div className="stat-value-modern">{totalQuestions}</div>
              </div>
            </div>

            <div className="quiz-history-body-modern">
              <div className="history-list-modern">
                {sortedHistory.map((quiz, index) => {
                  const scoreColor = getScoreColor(quiz.percentage)

                  return (
                    <div key={quiz.id} className="history-item-modern">
                      <div className="history-item-header-modern">
                        <div className="history-item-title">
                          <span className="history-number">{index + 1}.</span>
                          <div className="history-info">
                            <h3>{quiz.fileName}</h3>
                            <span className="history-date">{formatDate(quiz.timestamp)}</span>
                          </div>
                        </div>
                        <div className="history-score-badge" style={{ color: scoreColor, borderColor: scoreColor }}>
                          {quiz.percentage}%
                        </div>
                      </div>

                      <div className="history-item-stats">
                        <div className="history-stat">
                          <span className="stat-icon-small">📝</span>
                          <span>{quiz.totalQuestions} Questions</span>
                        </div>
                        <div className="history-stat">
                          <span className="stat-icon-small">✅</span>
                          <span>{quiz.score} Correct</span>
                        </div>
                        <div className="history-stat">
                          <span className="stat-icon-small">❌</span>
                          <span>{quiz.totalQuestions - quiz.score} Wrong</span>
                        </div>
                        <div className="history-stat">
                          <span className="stat-icon-small">⏱️</span>
                          <span>{formatTime(quiz.timeElapsed)}</span>
                        </div>
                      </div>

                      <button 
                        className="history-view-btn"
                        onClick={() => onViewDetails(quiz)}
                      >
                        View Details
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
