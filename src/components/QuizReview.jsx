import React from 'react'
import './QuizMode.css'

export default function QuizReview({ quizResult, onClose }) {
  const { questions, userAnswers, totalQuestions, score, percentage, timeElapsed } = quizResult
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getAnswerText = (question, selectedOption) => {
    if (!selectedOption) return null
    const optionIndex = ['A', 'B', 'C', 'D'].indexOf(selectedOption)
    if (optionIndex === -1) return selectedOption
    return question[`Option ${optionIndex + 1}`]
  }

  return (
    <div className="quiz-overlay">
      <div className="quiz-panel quiz-review-modern">
        <div className="review-header-modern">
          <div className="review-header-info">
            <h2>Review Answers - {quizResult.fileName}</h2>
            <div className="review-header-stats">
              <span className="header-stat">Score: {score}/{totalQuestions} ({percentage}%)</span>
              <span className="header-stat-divider">•</span>
              <span className="header-stat">Time: {formatTime(timeElapsed)}</span>
            </div>
          </div>
          <button className="review-close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="review-list-modern">
          {questions.map((q, index) => {
            const userAns = userAnswers[index]
            const userAnswerText = getAnswerText(q, userAns)
            const isCorrect = userAnswerText === q.Answer
            const options = ['A', 'B', 'C', 'D']
            const correctOption = options.find(opt => q[`Option ${options.indexOf(opt) + 1}`] === q.Answer)
            
            return (
              <div key={index} className="review-item-modern">
                <div className="review-item-header">
                  <div className="review-question-number">
                    {index + 1}. {q.Question}
                  </div>
                  {userAns && (
                    <span className={`review-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                  {!userAns && (
                    <span className="review-badge unanswered">Unanswered</span>
                  )}
                </div>
                
                <div className="review-options-modern">
                  {options.map((opt) => {
                    const optionKey = `Option ${options.indexOf(opt) + 1}`
                    const optionText = q[optionKey]
                    const isUserAnswer = userAns === opt
                    const isCorrectAnswer = correctOption === opt
                    
                    let optionClassName = 'review-option-modern'
                    if (isCorrectAnswer) {
                      optionClassName += ' correct-option'
                    }
                    if (isUserAnswer && !isCorrect) {
                      optionClassName += ' wrong-option'
                    }
                    if (isUserAnswer && isCorrect) {
                      optionClassName += ' user-correct-option'
                    }
                    
                    return (
                      <div key={opt} className={optionClassName}>
                        <div className="option-content">
                          <span className="option-letter-review">{opt}</span>
                          <span className="option-text-review">{optionText}</span>
                        </div>
                        {isCorrectAnswer && <span className="option-label correct">Correct</span>}
                        {isUserAnswer && !isCorrect && <span className="option-label incorrect">Incorrect</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
