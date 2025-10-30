import React, { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import LoginForm from './components/LoginForm'
import History from './components/History'
import QuizMode from './components/QuizMode'
import QuizHistory from './components/QuizHistory'
import QuizReview from './components/QuizReview'
import AdminPanel from './components/AdminPanel'
import { exportQuestionsToPDF } from './utils/pdfExport'

// Utility: parse simple CSV text to array of objects
function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i]?.trim() || '' })
    
    // Normalize column names to handle inconsistencies
    const normalized = {
      Question: obj.Question || obj.question || '',
      'Option 1': obj['Option 1'] || obj['option 1'] || '',
      'Option 2': obj['Option 2'] || obj['option 2'] || '',
      'Option 3': obj['Option 3'] || obj['option 3'] || '',
      'Option 4': obj['Option 4'] || obj['option 4'] || '',
      Answer: obj.Answer || obj.answer || ''
    }
    return normalized
  })
}

// Utility: randomly sample N unique items from array
function randomSample(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [fileName, setFileName] = useState('SET-1A')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAnswers, setShowAnswers] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isGenerated, setIsGenerated] = useState(false)
  const [history, setHistory] = useState([])
  const [showQuizMode, setShowQuizMode] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showQuizHistory, setShowQuizHistory] = useState(false)
  const [quizHistory, setQuizHistory] = useState([])
  const [showQuizReview, setShowQuizReview] = useState(null)
  
  // Exam selection state (for admin users)
  const [selectedExam, setSelectedExam] = useState(null)
  const [showExamSelection, setShowExamSelection] = useState(false)
  
  // Subject selection state
  const [chemCount, setChemCount] = useState(25)
  const [physCount, setPhysCount] = useState(25)
  const [mathCount, setMathCount] = useState(25)
  
  // Predefined set options
  const setOptions = [
    'SET-1A', 'SET-1B', 'SET-1C', 'SET-1D',
    'SET-2A', 'SET-2B', 'SET-2C', 'SET-2D',
    'SET-3A', 'SET-3B', 'SET-3C', 'SET-3D'
  ]
  
  // Exam configuration
  const examOptions = [
    {
      name: 'KLEEE',
      duration: 180,
      questions: '25+25+25',
      subjects: 'Mathematics + Physics + Chemistry (JEE-Difficulty Level)',
      subjectConfig: [
        { name: 'Chemistry', count: 25, file: 'chemistry.csv' },
        { name: 'Physics', count: 25, file: 'physics.csv' },
        { name: 'Maths', count: 25, file: 'Maths.csv' }
      ]
    },
    {
      name: 'KLSAT',
      duration: 180,
      questions: '80+40+40',
      subjects: 'Biology + Physics + Chemistry (JEE-Difficulty Level)',
      subjectConfig: [
        { name: 'Biology', count: 80, file: 'Biology.csv' },
        { name: 'Physics', count: 40, file: 'physics.csv' },
        { name: 'Chemistry', count: 40, file: 'chemistry.csv' }
      ]
    },
    {
      name: 'KLECET',
      duration: 90,
      questions: '25',
      subjects: 'MPC + Domain (EEE, CSE, ECE, Mech, Civil)',
      subjectConfig: [
        { name: 'Chemistry', count: 8, file: 'chemistry.csv' },
        { name: 'Physics', count: 9, file: 'physics.csv' },
        { name: 'Maths', count: 8, file: 'Maths.csv' }
      ]
    },
    {
      name: 'KLHAT',
      duration: 90,
      questions: '25+20+15+15',
      subjects: 'English + Logical + Quantitative + General Knowledge',
      subjectConfig: [
        { name: 'English', count: 25, file: 'English.csv' },
        { name: 'Logical', count: 20, file: 'Logical.csv' },
        { name: 'Quantitative', count: 15, file: 'Quantitative .csv' },
        { name: 'General Knowledge', count: 15, file: 'General Knowledge.csv' }
      ]
    },
    {
      name: 'KLMAT',
      duration: 90,
      questions: '25+20+15+15',
      subjects: 'English + Logical + Quantitative + General Knowledge',
      subjectConfig: [
        { name: 'English', count: 25, file: 'English.csv' },
        { name: 'Logical', count: 20, file: 'Logical.csv' },
        { name: 'Quantitative', count: 15, file: 'Quantitative .csv' },
        { name: 'General Knowledge', count: 15, file: 'General Knowledge.csv' }
      ]
    }
  ]
  
  const questionsPerPage = 10
  const MAX_HISTORY_ITEMS = 50 // Limit history to prevent storage issues

  // Load history from localStorage when user logs in
  useEffect(() => {
    if (user) {
      const storageKey = `questionHistory_${user.username}`
      const savedHistory = localStorage.getItem(storageKey)
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory))
        } catch (err) {
          console.error('Error loading history:', err)
          setHistory([])
        }
      } else {
        setHistory([])
      }
      
      // Load quiz history and recalculate scores if needed
      const quizStorageKey = `quizHistory_${user.username}`
      const savedQuizHistory = localStorage.getItem(quizStorageKey)
      if (savedQuizHistory) {
        try {
          const parsedHistory = JSON.parse(savedQuizHistory)
          // Recalculate scores for old quiz data
          const correctedHistory = parsedHistory.map(quiz => {
            if (quiz.questions && quiz.userAnswers) {
              let correctCount = 0
              quiz.questions.forEach((q, index) => {
                const userAns = quiz.userAnswers[index]
                if (userAns) {
                  const optionIndex = ['A', 'B', 'C', 'D'].indexOf(userAns)
                  const userAnswerText = optionIndex !== -1 ? q[`Option ${optionIndex + 1}`] : userAns
                  if (userAnswerText === q.Answer) {
                    correctCount++
                  }
                }
              })
              return {
                ...quiz,
                score: correctCount,
                percentage: ((correctCount / quiz.totalQuestions) * 100).toFixed(1)
              }
            }
            return quiz
          })
          setQuizHistory(correctedHistory)
          // Save corrected history back to localStorage
          localStorage.setItem(quizStorageKey, JSON.stringify(correctedHistory))
        } catch (err) {
          console.error('Error loading quiz history:', err)
          setQuizHistory([])
        }
      } else {
        setQuizHistory([])
      }
      
      // Auto-generate quiz for students
      if (user.userType === 'student') {
        autoGenerateQuizForStudent()
      }
    } else {
      setHistory([])
      setQuizHistory([])
    }
  }, [user])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (user && history.length > 0) {
      const storageKey = `questionHistory_${user.username}`
      localStorage.setItem(storageKey, JSON.stringify(history))
    }
  }, [history, user])
  
  // Save quiz history to localStorage whenever it changes
  useEffect(() => {
    if (user && quizHistory.length > 0) {
      const quizStorageKey = `quizHistory_${user.username}`
      localStorage.setItem(quizStorageKey, JSON.stringify(quizHistory))
    }
  }, [quizHistory, user])

  function handleLogin(data) {
    setUser(data)
    setShowLogin(false)
    
    // Show exam selection for admin users (non-10-digit usernames)
    if (data.userType === 'admin') {
      setShowExamSelection(true)
    }
  }

  function handleLogout() {
    setUser(null)
    setQuestions([])
    setFileName('')
    setShowAnswers({})
    setCurrentPage(1)
    setIsGenerated(false)
    setHistory([])
    setShowHistory(false)
    setSelectedExam(null)
    setShowExamSelection(false)
  }

  function handleRegenerate() {
    setQuestions([])
    setShowAnswers({})
    setCurrentPage(1)
    setIsGenerated(false)
    setFileName('SET-1A')
    setChemCount(25)
    setPhysCount(25)
    setMathCount(25)
  }

  function toggleAnswer(index) {
    setShowAnswers(prev => ({ ...prev, [index]: !prev[index] }))
  }

  function handleDownloadSet() {
    // Export as PDF without answers
    const examDuration = selectedExam ? selectedExam.duration : null
    exportQuestionsToPDF(questions, fileName, false, examDuration)
  }

  function handleDownloadAnswers() {
    // Export as PDF with answers
    const examDuration = selectedExam ? selectedExam.duration : null
    exportQuestionsToPDF(questions, fileName, true, examDuration)
  }

  async function handleGenerateSet() {
    if (isGenerated) return
    
    if (!selectedExam) {
      alert('Please select an exam first!')
      return
    }
    
    setLoading(true)
    try {
      const subjectConfig = selectedExam.subjectConfig
      
      // Fetch all required CSV files
      const fetchPromises = subjectConfig.map(subject => fetch(`/${subject.file}`))
      const responses = await Promise.all(fetchPromises)
      const textPromises = responses.map(res => res.text())
      const texts = await Promise.all(textPromises)
      
      // Parse all CSV files
      const allSubjectQuestions = texts.map(text => parseCSV(text))
      
      // Select random questions from each subject
      const allQuestions = []
      subjectConfig.forEach((subject, index) => {
        const subjectQuestions = allSubjectQuestions[index]
        const selected = randomSample(subjectQuestions, subject.count)
        const questionsWithSubject = selected.map((q, i) => ({
          ...q,
          subject: subject.name,
          subjectNumber: i + 1
        }))
        allQuestions.push(...questionsWithSubject)
      })
      
      setQuestions(allQuestions)
      setShowAnswers({})
      setCurrentPage(1)
      setIsGenerated(true)
      
      // Save to history (limit to MAX_HISTORY_ITEMS to prevent storage issues)
      const historyItem = {
        id: Date.now(),
        fileName: fileName.trim(),
        questions: allQuestions,
        timestamp: new Date().toISOString()
      }
      setHistory(prev => {
        const newHistory = [historyItem, ...prev]
        return newHistory.slice(0, MAX_HISTORY_ITEMS) // Keep only the latest items
      })
      
      console.log('Generated questions by subject:', 
        subjectConfig.map((s, i) => `${s.name}: ${randomSample(allSubjectQuestions[i], s.count).length}`).join(', '),
        'Total:', allQuestions.length)
    } catch (err) {
      console.error('Error loading questions:', err)
      alert('Failed to load question files. Make sure all CSV files are in the public folder.')
    } finally {
      setLoading(false)
    }
  }
  
  async function autoGenerateQuizForStudent() {
    setLoading(true)
    try {
      const [chemRes, physRes, mathRes] = await Promise.all([
        fetch('/chemistry.csv'),
        fetch('/physics.csv'),
        fetch('/Maths.csv')
      ])
      const [chemText, physText, mathText] = await Promise.all([
        chemRes.text(),
        physRes.text(),
        mathRes.text()
      ])
      const chemQ = parseCSV(chemText)
      const physQ = parseCSV(physText)
      const mathQ = parseCSV(mathText)

      // Generate 75 questions (25 from each subject)
      const chemSelected = randomSample(chemQ, 25)
      const physSelected = randomSample(physQ, 25)
      const mathSelected = randomSample(mathQ, 25)

      const allQuestions = [
        ...chemSelected.map((q, i) => ({ ...q, subject: 'Chemistry', subjectNumber: i + 1 })),
        ...physSelected.map((q, i) => ({ ...q, subject: 'Physics', subjectNumber: i + 1 })),
        ...mathSelected.map((q, i) => ({ ...q, subject: 'Maths', subjectNumber: i + 1 }))
      ]
      
      setQuestions(allQuestions)
      setFileName('Practice Quiz')
      setIsGenerated(true)
      
      console.log('Auto-generated quiz with', allQuestions.length, 'questions for student (25 Chemistry, 25 Physics, 25 Maths)')
    } catch (err) {
      console.error('Error auto-generating quiz:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLoadHistory(historyItem) {
    setFileName(historyItem.fileName)
    setQuestions(historyItem.questions)
    setShowAnswers({})
    setCurrentPage(1)
    setIsGenerated(true)
  }

  function handleDeleteHistory(id) {
    if (window.confirm('Are you sure you want to delete this history item?')) {
      setHistory(prev => prev.filter(item => item.id !== id))
      // Also delete from localStorage
      if (user) {
        const storageKey = `questionHistory_${user.username}`
        const updatedHistory = history.filter(item => item.id !== id)
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
      }
    }
  }
  
  const handleSaveQuizResult = (quizResult) => {
    const resultWithId = {
      ...quizResult,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }
    setQuizHistory(prev => [resultWithId, ...prev])
  }

  return (
    <div className="app-root">
      <Header 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={handleLogout}
        onHistoryClick={() => setShowHistory(true)}
        onAdminClick={() => setShowAdminPanel(true)}
      />
      {showLogin && <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      
      {!user && !showLogin && (
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Welcome to KL Exam Portal</h1>
            <p>Prepare for your entrance exams with our comprehensive question bank</p>
          </div>
        </div>
      )}
      
      <main className="app-content">
        {showHistory && (
          <History 
            user={user}
            history={history}
            onLoadHistory={handleLoadHistory}
            onDeleteHistory={handleDeleteHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
        {user && (
          <>
            {user.userType === 'student' ? (
              // Student view: Only show quiz buttons, no question generation
              <div className="student-quiz-controls no-print">
                <button className="export-btn quiz-mode-btn" onClick={() => setShowQuizMode(true)}>
                  📝 Start Quiz
                </button>
                <button className="export-btn quiz-history-btn" onClick={() => setShowQuizHistory(true)}>
                  📊 Quiz History
                </button>
              </div>
            ) : showExamSelection && !selectedExam ? (
              // Admin view: Show exam selection table
              <div className="exam-selection-container">
                <h2>Select Entrance Exam</h2>
                <div className="exam-table-wrapper">
                  <table className="exam-table">
                    <thead>
                      <tr>
                        <th>Entrance Exam</th>
                        <th>Exam Duration (in min.)</th>
                        <th>No. of Questions</th>
                        <th>Topics/Syllabus</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examOptions.map((exam, index) => (
                        <tr key={index}>
                          <td><strong>{exam.name}</strong></td>
                          <td>{exam.duration}</td>
                          <td>{exam.questions}</td>
                          <td>{exam.subjects}</td>
                          <td>
                            <button 
                              className="select-exam-btn"
                              onClick={() => {
                                // When selecting a new exam, clear any previously generated questions
                                // so the admin is prompted to generate a fresh set for the newly
                                // selected exam (prevents showing old questions from another exam).
                                setSelectedExam(exam)
                                setShowExamSelection(false)
                                setQuestions([])
                                setShowAnswers({})
                                setCurrentPage(1)
                                setIsGenerated(false)
                                setFileName('SET-1A')
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Admin view: Show full question generation interface
              <>
                {selectedExam && (
                  <div className="selected-exam-banner">
                    <div className="selected-exam-info">
                      <strong>Selected Exam:</strong> {selectedExam.name} 
                      <span className="exam-details">
                        ({selectedExam.questions} questions, {selectedExam.duration} min)
                      </span>
                    </div>
                    <button 
                      className="change-exam-btn"
                      onClick={() => {
                        // Clear selected exam and previously generated state so admin must
                        // re-generate a set after choosing a different exam.
                        setSelectedExam(null)
                        setShowExamSelection(true)
                        setQuestions([])
                        setShowAnswers({})
                        setCurrentPage(1)
                        setIsGenerated(false)
                        setFileName('SET-1A')
                      }}
                    >
                      Change Exam
                    </button>
                  </div>
                )}
                <div className="generate-wrap no-print">
                  <div className="set-selector-wrap">
                    <label htmlFor="set-select" className="set-label">Select Set:</label>
                    <select 
                      id="set-select"
                      className="generate-filename-select" 
                      value={fileName} 
                      onChange={(e) => setFileName(e.target.value)}
                      disabled={isGenerated}
                    >
                      {setOptions.map(setName => (
                        <option key={setName} value={setName}>
                          {setName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {!isGenerated && selectedExam && (
                    <div className="subject-selector">
                      <div className="subject-list-header">
                        <strong>Question Distribution:</strong>
                      </div>
                      {selectedExam.subjectConfig.map((subject, idx) => (
                        <div key={idx} className="subject-info-item">
                          <span className="subject-name">{subject.name}:</span>
                          <span className="subject-count">{subject.count} questions</span>
                        </div>
                      ))}
                      <div className="subject-total">
                        Total: {selectedExam.subjectConfig.reduce((sum, s) => sum + s.count, 0)} questions
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="generate-set" 
                    onClick={handleGenerateSet} 
                    disabled={loading || isGenerated}
                  >
                    {loading ? 'Loading...' : 'Generate Set'}
                  </button>
                  {isGenerated && (
                    <button 
                      className="regenerate-btn" 
                      onClick={handleRegenerate}
                    >
                      🔄 Regenerate
                    </button>
                  )}
                </div>
                {questions.length > 0 && (() => {
                  const indexOfLastQuestion = currentPage * questionsPerPage
                  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
                  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion)
                  const totalPages = Math.ceil(questions.length / questionsPerPage)

                  return (
                    <div className="questions-display">
                      <div className="questions-header no-print">
                        <div>
                          <h2>Generated Set: {fileName}</h2>
                          <p>Total Questions: {questions.length} | Page {currentPage} of {totalPages}</p>
                        </div>
                        <div className="export-buttons">
                          <button className="export-btn download-set-btn" onClick={handleDownloadSet}>
                            📄 PDF Questions
                          </button>
                          <button className="export-btn answer-set-btn" onClick={handleDownloadAnswers}>
                            📄 PDF with Answers
                          </button>
                        </div>
                      </div>
                      
                      <div className="pagination-controls no-print">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages} (Showing {indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, questions.length)})
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="questions-list">
                    {currentQuestions.map((q, idx) => {
                      const actualIdx = indexOfFirstQuestion + idx
                      return (
                        <div key={actualIdx} className="question-item">
                          <div className="question-header">
                            <span className="question-number">
                              {q.subject} Q{q.subjectNumber}
                            </span>
                            <span className="question-subject">#{actualIdx + 1}</span>
                          </div>
                          <div className="question-text">{q.Question}</div>
                          <div className="question-options">
                            <div className="option">A. {q['Option 1']}</div>
                            <div className="option">B. {q['Option 2']}</div>
                            <div className="option">C. {q['Option 3']}</div>
                            <div className="option">D. {q['Option 4']}</div>
                          </div>
                          <div className="question-answer-section">
                            <button 
                              className="toggle-answer no-print" 
                              onClick={() => toggleAnswer(actualIdx)}
                            >
                              {showAnswers[actualIdx] ? '🔒 Hide Answer' : '🔓 Show Answer'}
                            </button>
                            {showAnswers[actualIdx] && (
                              <div className="question-answer">
                                Answer: <strong>{q.Answer}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Hidden div for printing questions only (no answers) */}
                  <div className="print-only print-questions-only" style={{ display: 'none' }}>
                    {questions.map((q, idx) => (
                      <div key={`print-no-ans-${idx}`} className="question-item">
                        <div className="question-header">
                          <span className="question-number">
                            {q.subject} Q{q.subjectNumber}
                          </span>
                          <span className="question-subject">#{idx + 1}</span>
                        </div>
                        <div className="question-text">{q.Question}</div>
                        <div className="question-options">
                          <div className="option">A. {q['Option 1']}</div>
                          <div className="option">B. {q['Option 2']}</div>
                          <div className="option">C. {q['Option 3']}</div>
                          <div className="option">D. {q['Option 4']}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hidden div for printing questions with answers */}
                  <div className="print-only print-questions-answers" style={{ display: 'none' }}>
                    {questions.map((q, idx) => (
                      <div key={`print-with-ans-${idx}`} className="question-item">
                        <div className="question-header">
                          <span className="question-number">
                            {q.subject} Q{q.subjectNumber}
                          </span>
                          <span className="question-subject">#{idx + 1}</span>
                        </div>
                        <div className="question-text">{q.Question}</div>
                        <div className="question-options">
                          <div className="option">A. {q['Option 1']}</div>
                          <div className="option">B. {q['Option 2']}</div>
                          <div className="option">C. {q['Option 3']}</div>
                          <div className="option">D. {q['Option 4']}</div>
                        </div>
                        <div className="question-answer">
                          Answer: <strong>{q.Answer}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pagination-controls no-print">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )
            })()}
              </>
            )}
          </>
        )}
      </main>
      
      {showQuizMode && (
        <QuizMode
          questions={questions}
          fileName={fileName}
          onClose={() => setShowQuizMode(false)}
          onSaveResult={handleSaveQuizResult}
          user={user}
        />
      )}
      
      {showQuizHistory && (
        <QuizHistory
          quizHistory={quizHistory}
          onClose={() => setShowQuizHistory(false)}
          onViewDetails={(quizResult) => {
            setShowQuizHistory(false)
            setShowQuizReview(quizResult)
          }}
        />
      )}
      
      {showQuizReview && (
        <QuizReview
          quizResult={showQuizReview}
          onClose={() => setShowQuizReview(null)}
        />
      )}
      
      {showHistory && (
        <History
          history={history}
          onLoad={handleLoadHistory}
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  )
}

export default App
