import React, { useState } from 'react'
import './AdminPanel.css'

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('add')
  const [subject, setSubject] = useState('Chemistry')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingQuestion, setEditingQuestion] = useState(null)
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    Question: '',
    'Option 1': '',
    'Option 2': '',
    'Option 3': '',
    'Option 4': '',
    Answer: 'A'
  })

  // Load questions from localStorage
  const loadQuestions = (subjectName) => {
    const key = `admin_questions_${subjectName.toLowerCase()}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  const saveQuestions = (subjectName, questions) => {
    const key = `admin_questions_${subjectName.toLowerCase()}`
    localStorage.setItem(key, JSON.stringify(questions))
  }

  const [questions, setQuestions] = useState(() => loadQuestions(subject))

  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject)
    setQuestions(loadQuestions(newSubject))
    setSearchQuery('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      Question: '',
      'Option 1': '',
      'Option 2': '',
      'Option 3': '',
      'Option 4': '',
      Answer: 'A'
    })
    setEditingQuestion(null)
  }

  const handleAddQuestion = (e) => {
    e.preventDefault()
    
    if (!formData.Question.trim()) {
      alert('Please enter a question!')
      return
    }

    const newQuestion = { ...formData, id: Date.now() }
    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    saveQuestions(subject, updatedQuestions)
    resetForm()
    alert('Question added successfully!')
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setFormData({
      Question: question.Question,
      'Option 1': question['Option 1'],
      'Option 2': question['Option 2'],
      'Option 3': question['Option 3'],
      'Option 4': question['Option 4'],
      Answer: question.Answer
    })
    setActiveTab('add')
  }

  const handleUpdateQuestion = (e) => {
    e.preventDefault()
    
    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? { ...formData, id: q.id } : q
    )
    setQuestions(updatedQuestions)
    saveQuestions(subject, updatedQuestions)
    resetForm()
    alert('Question updated successfully!')
    setActiveTab('manage')
  }

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId)
      setQuestions(updatedQuestions)
      saveQuestions(subject, updatedQuestions)
      alert('Question deleted successfully!')
    }
  }

  const handleExportToCSV = () => {
    const headers = ['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Answer']
    const csvContent = [
      headers.join(','),
      ...questions.map(q => 
        headers.map(h => `"${(q[h] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${subject.toLowerCase()}_questions.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImportFromCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          alert('CSV file is empty or invalid!')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const newQuestions = lines.slice(1).map((line, index) => {
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
          const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
          
          const question = {}
          headers.forEach((h, i) => {
            question[h] = cleanValues[i] || ''
          })
          question.id = Date.now() + index
          return question
        })

        const updatedQuestions = [...questions, ...newQuestions]
        setQuestions(updatedQuestions)
        saveQuestions(subject, updatedQuestions)
        alert(`Imported ${newQuestions.length} questions successfully!`)
      } catch (err) {
        console.error('Import error:', err)
        alert('Failed to import CSV file. Please check the format.')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset file input
  }

  const filteredQuestions = questions.filter(q =>
    q.Question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>🔧 Admin Panel</h2>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-subject-selector">
          <label>Subject:</label>
          {['Chemistry', 'Physics', 'Maths'].map(s => (
            <button
              key={s}
              className={`subject-tab ${subject === s ? 'active' : ''}`}
              onClick={() => handleSubjectChange(s)}
            >
              {s}
            </button>
          ))}
          <span className="question-count">({questions.length} questions)</span>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            {editingQuestion ? '✏️ Edit Question' : '➕ Add Question'}
          </button>
          <button
            className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage'); resetForm(); }}
          >
            📋 Manage Questions
          </button>
          <button
            className={`admin-tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            📥 Import/Export
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'add' && (
            <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion} className="admin-form">
              <div className="form-group">
                <label>Question *</label>
                <textarea
                  name="Question"
                  value={formData.Question}
                  onChange={handleInputChange}
                  placeholder="Enter the question..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Option A *</label>
                  <input
                    type="text"
                    name="Option 1"
                    value={formData['Option 1']}
                    onChange={handleInputChange}
                    placeholder="Option A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Option B *</label>
                  <input
                    type="text"
                    name="Option 2"
                    value={formData['Option 2']}
                    onChange={handleInputChange}
                    placeholder="Option B"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Option C *</label>
                  <input
                    type="text"
                    name="Option 3"
                    value={formData['Option 3']}
                    onChange={handleInputChange}
                    placeholder="Option C"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Option D *</label>
                  <input
                    type="text"
                    name="Option 4"
                    value={formData['Option 4']}
                    onChange={handleInputChange}
                    placeholder="Option D"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select name="Answer" value={formData.Answer} onChange={handleInputChange}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="form-actions">
                {editingQuestion && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'manage' && (
            <div className="manage-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found. Add some questions to get started!</p>
                </div>
              ) : (
                <div className="questions-table">
                  {filteredQuestions.map((q, index) => (
                    <div key={q.id} className="question-row">
                      <div className="question-number">{index + 1}</div>
                      <div className="question-details">
                        <div className="question-text-admin">{q.Question}</div>
                        <div className="question-options-admin">
                          <span className={q.Answer === 'A' ? 'correct-option' : ''}>A: {q['Option 1']}</span>
                          <span className={q.Answer === 'B' ? 'correct-option' : ''}>B: {q['Option 2']}</span>
                          <span className={q.Answer === 'C' ? 'correct-option' : ''}>C: {q['Option 3']}</span>
                          <span className={q.Answer === 'D' ? 'correct-option' : ''}>D: {q['Option 4']}</span>
                        </div>
                      </div>
                      <div className="question-actions">
                        <button className="btn-edit" onClick={() => handleEditQuestion(q)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteQuestion(q.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="import-section">
              <div className="import-card">
                <h3>📤 Export Questions</h3>
                <p>Download current {subject} questions as CSV file</p>
                <button className="btn-export" onClick={handleExportToCSV}>
                  Export to CSV
                </button>
              </div>

              <div className="import-card">
                <h3>📥 Import Questions</h3>
                <p>Upload CSV file to add questions (will be added to existing questions)</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportFromCSV}
                  id="csv-upload"
                  style={{ display: 'none' }}
                />
                <button className="btn-import" onClick={() => document.getElementById('csv-upload').click()}>
                  Choose CSV File
                </button>
              </div>

              <div className="import-info">
                <h4>CSV Format:</h4>
                <pre>
Question,Option 1,Option 2,Option 3,Option 4,Answer
"Your question here?","Option A","Option B","Option C","Option D",A
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
