import React, { useState, useEffect } from 'react'
import './QuizMode.css'

export default function QuizMode({ questions, fileName, onClose, onSaveResult, user }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [startTime] = useState(new Date())
  const [quizStarted, setQuizStarted] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  // Timer
  useEffect(() => {
    let interval
    if (isRunning && !quizCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, quizCompleted])

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

  const handleAnswerSelect = (option) => {
    if (!quizStarted) setQuizStarted(true)
    setSelectedAnswer(option)
  }
  
  const handleQuestionJump = (index) => {
    if (selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer
      }))
    }
    setCurrentQuestionIndex(index)
    setSelectedAnswer(userAnswers[index] || '')
  }

  const handleNext = () => {
    if (selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer
      }))
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || '')
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      if (selectedAnswer) {
        setUserAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: selectedAnswer
        }))
      }
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '')
    }
  }

  const handleFinish = () => {
    const finalAnswers = { ...userAnswers }
    if (selectedAnswer) {
      finalAnswers[currentQuestionIndex] = selectedAnswer
    }
    
    setUserAnswers(finalAnswers)
    setIsRunning(false)
    setQuizCompleted(true)
    
    // Calculate score with final answers using proper comparison
    let correct = 0
    questions.forEach((q, index) => {
      const userAnswerText = getAnswerText(q, finalAnswers[index])
      if (userAnswerText === q.Answer) {
        correct++
      }
    })
    
    // Save quiz result
    const quizResult = {
      id: Date.now(),
      fileName,
      totalQuestions,
      score: correct,
      percentage: ((correct / totalQuestions) * 100).toFixed(1),
      timeElapsed,
      timestamp: new Date().toISOString(),
      startTime: startTime.toISOString(),
      questions,
      userAnswers: finalAnswers
    }
    
    if (onSaveResult) {
      onSaveResult(quizResult)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      const userAnswerText = getAnswerText(q, userAnswers[index])
      if (userAnswerText === q.Answer) {
        correct++
      }
    })
    return correct
  }

  const getPercentage = () => {
    return ((calculateScore() / totalQuestions) * 100).toFixed(1)
  }

  const getScoreColor = () => {
    const percentage = parseFloat(getPercentage())
    if (percentage >= 80) return '#28a745'
    if (percentage >= 60) return '#ffc107'
    return '#dc3545'
  }

  if (quizCompleted && !showReview) {
    const score = calculateScore()
    const percentage = getPercentage()
    const scoreColor = getScoreColor()
    const unanswered = totalQuestions - Object.keys(userAnswers).length

    return (
      <div className="quiz-overlay">
        <div className="quiz-panel quiz-results-modern">
          <div className="results-header">
            <h2>Results</h2>
          </div>
          
          <div className="results-content">
            <div className="results-score-grid">
              <div className="score-box">
                <div className="score-label">Score</div>
                <div className="score-big" style={{ color: scoreColor }}>{percentage}%</div>
              </div>
              <div className="score-box">
                <div className="score-label">Correct</div>
                <div className="score-big correct-color">{score}</div>
              </div>
              <div className="score-box">
                <div className="score-label">Incorrect</div>
                <div className="score-big incorrect-color">{totalQuestions - score - unanswered}</div>
              </div>
              <div className="score-box">
                <div className="score-label">Time</div>
                <div className="score-big time-color">{formatTime(timeElapsed)}</div>
              </div>
            </div>

            <button className="results-review-btn" onClick={() => setShowReview(true)}>
              Review Answers
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showReview) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-panel quiz-review-modern">
          <div className="review-header-modern">
            <h2>Review Answers</h2>
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

  const options = ['A', 'B', 'C', 'D']
  const progress = ((currentQuestionIndex + 1) / totalQuestions * 100).toFixed(0)
  const attemptedCount = Object.keys(userAnswers).length + (selectedAnswer ? 1 : 0)

  return (
    <div className="quiz-overlay">
      <div className="quiz-panel quiz-panel-split">
        <div className="quiz-main-section">
          <div className="quiz-header-compact">
            <div className="quiz-info-top">
              <h2 className="quiz-title">Quiz in Progress</h2>
              <div className="quiz-attempted-info">
                Attempted {attemptedCount}/{totalQuestions}
              </div>
            </div>
            <div className="quiz-timer-display">
              <span className="timer-label">Time left:</span>
              <span className="timer-value">{formatTime(Math.max(0, (totalQuestions * 90) - timeElapsed))}</span>
            </div>
          </div>

          <div className="quiz-subheader">
            <div className="quiz-question-count">
              QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
            </div>
            <button 
              className="quiz-btn-attempt-all"
              onClick={() => {
                // Jump to first unanswered question
                const firstUnanswered = questions.findIndex((_, idx) => !userAnswers[idx] && idx !== currentQuestionIndex && !selectedAnswer)
                if (firstUnanswered !== -1) {
                  handleQuestionJump(firstUnanswered)
                }
              }}
            >
              ATTEMPT ALL QUESTIONS
            </button>
          </div>
          
          <div className="quiz-content-main">
            <div className="quiz-question-display">
              <div className="quiz-question-text-main">{currentQuestion.Question}</div>
            </div>
            
            <div className="quiz-options-main">
              {options.map((opt) => {
                const optionKey = `Option ${options.indexOf(opt) + 1}`
                const optionText = currentQuestion[optionKey]
                
                return (
                  <button
                    key={opt}
                    className={`quiz-option-main ${selectedAnswer === opt ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(opt)}
                  >
                    <span className="option-letter-main">{opt}</span>
                    <span className="option-text-main">{optionText}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="quiz-navigation-bottom">
            <button 
              className="quiz-nav-btn previous-btn" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button 
                className="quiz-nav-btn next-btn" 
                onClick={handleNext}
              >
                Next
              </button>
            ) : null}
            
            <button 
              className="quiz-nav-btn submit-btn-bottom" 
              onClick={handleFinish}
            >
              Submit Quiz
            </button>
          </div>

          <div className="quiz-footer-info">
            <span>{totalQuestions} Questions • {Math.ceil(totalQuestions * 1.5)} Minutes</span>
          </div>
        </div>
        
        <div className="quiz-sidebar">
          <div className="sidebar-header">Questions</div>
          <div className="question-grid">
            {questions.map((_, index) => {
              const isAnswered = userAnswers[index] || (index === currentQuestionIndex && selectedAnswer)
              const isCurrent = index === currentQuestionIndex
              
              return (
                <button
                  key={index}
                  className={`question-number-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => handleQuestionJump(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
