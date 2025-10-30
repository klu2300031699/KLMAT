import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportQuestionsToPDF(questions, fileName, includeAnswers = false, examDuration = null) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  
  // Group questions by subject
  const questionsBySubject = {}
  questions.forEach((q, index) => {
    if (!questionsBySubject[q.subject]) {
      questionsBySubject[q.subject] = []
    }
    questionsBySubject[q.subject].push({ ...q, originalIndex: index })
  })
  
  let isFirstPage = true
  let isVeryFirstSubject = true
  let currentSubject = ''
  let yPosition = 40
  
  // Helper function to add header on each page
  const addPageHeader = (subject, isSubjectStart = false) => {
    const radius = 3
    
  // Year box in top left corner
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)

  // Shared header font size for duration and "ANSWER ALL QUESTIONS"
  const headerFontSize = 12
    
    const yearBoxWidth = 25
    const yearBoxHeight = 12
    const yearBoxX = margin
    const yearBoxY = 10
    doc.roundedRect(yearBoxX, yearBoxY, yearBoxWidth, yearBoxHeight, radius, radius)
    doc.text('2025', yearBoxX + yearBoxWidth / 2, yearBoxY + 8, { align: 'center' })
    
  // Set name in top right corner (matching year box size and style)
  const setBoxWidth = 25
  const setBoxHeight = 12
    const setBoxX = pageWidth - margin - setBoxWidth
    const setBoxY = 10
    doc.roundedRect(setBoxX, setBoxY, setBoxWidth, setBoxHeight, radius, radius)
  // Center text horizontally and vertically (same as year box)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(fileName, setBoxX + setBoxWidth / 2, setBoxY + 8, { align: 'center' })
    
    // Subject heading in center (only at start of new subject)
    if (isSubjectStart) {
      yPosition = 35
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      
  // Draw rounded border box for subject. If examDuration is provided and
  // this is the very first subject page, render the duration centered
  // above the rounded box. The subject stays inside the box and is
  // vertically centered.
  const subjectText = subject.toUpperCase()
  const showDurationAboveBox = examDuration && isVeryFirstSubject && !includeAnswers

  // Subject font and box sizing
  const subjectFontSize = 12
  doc.setFontSize(subjectFontSize)
  doc.setFont('helvetica', 'bold')
  let subjectWidth = doc.getTextWidth(subjectText) + 8
  const subjectBoxHeight = subjectFontSize + 2 // even smaller padding around text
  const subjectBoxX = (pageWidth - subjectWidth) / 2

  if (showDurationAboveBox) {
    const durationText = `Duration: ${examDuration} minutes`
    // Use shared header font size so duration equals "ANSWER ALL QUESTIONS"
    doc.setFontSize(headerFontSize)
    doc.setFont('helvetica', 'bold')
    // Draw duration above the box (no underline)
    const durationTextWidth = doc.getTextWidth(durationText)
  const durationTextY = yPosition - (subjectBoxHeight / 2) - 3
    doc.text(durationText, pageWidth / 2, durationTextY, { align: 'center' })

    // Draw the box slightly lower to make room for duration above
  const boxY = yPosition - (subjectBoxHeight / 2) + 5
    doc.roundedRect(subjectBoxX, boxY, subjectWidth, subjectBoxHeight, radius, radius)

    // Vertically center subject inside the box
    doc.setFontSize(subjectFontSize)
  const subjectTextY = boxY + subjectBoxHeight / 2 + subjectFontSize / 6
    doc.text(subjectText, pageWidth / 2, subjectTextY, { align: 'center' })

    // Move yPosition down past the box and leave a larger spacer before the
    // "ANSWER ALL QUESTIONS" line so there is visible gap between box and text
  yPosition = boxY + subjectBoxHeight + 12
    // Only show duration once
    isVeryFirstSubject = false
  } else {
    // Single-line subject text as before (centered box)
    // Use smaller spacer for subsequent subjects (no duration)
    doc.roundedRect(subjectBoxX, yPosition - (subjectBoxHeight / 2), subjectWidth, subjectBoxHeight, radius, radius)
    doc.setFontSize(subjectFontSize)
    // Vertically center subject inside the box
  const subjectTextY = yPosition + subjectFontSize / 6
  doc.text(subjectText, pageWidth / 2, subjectTextY, { align: 'center' })
  yPosition += subjectBoxHeight + 4
  }

      // "ANSWER ALL QUESTIONS" text (unchanged behavior)
      if (!includeAnswers) {
        doc.setFontSize(headerFontSize)
        doc.setFont('helvetica', 'bold')
        const answerText = 'ANSWER ALL QUESTIONS'
        const answerTextWidth = doc.getTextWidth(answerText)
        const answerTextX = (pageWidth - answerTextWidth) / 2
        doc.text(answerText, pageWidth / 2, yPosition, { align: 'center' })
        // Draw underline
        doc.setLineWidth(0.5)
        doc.line(answerTextX, yPosition + 1, answerTextX + answerTextWidth, yPosition + 1)
        yPosition += 8
        // small spacer (previous logic adjusted to account for moved duration)
        yPosition += 4
      } else {
        yPosition += 8
      }
    } else {
      yPosition = 35
    }
  }
  
  // Process each subject
  Object.keys(questionsBySubject).forEach((subject, subjectIdx) => {
    const subjectQuestions = questionsBySubject[subject]
    currentSubject = subject
    
    subjectQuestions.forEach((q, idx) => {
      const isSubjectStart = idx === 0
      
      // Check if we need a new page - reduced threshold for better page utilization
      if (!isFirstPage && (yPosition > pageHeight - 50 || isSubjectStart)) {
        doc.addPage()
        addPageHeader(subject, isSubjectStart)
      } else if (isFirstPage) {
        addPageHeader(subject, true)
        isFirstPage = false
      } else if (isSubjectStart) {
        doc.addPage()
        addPageHeader(subject, true)
      }
      
      // Question number and text on same line
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      const questionNum = `${q.originalIndex + 1}.`
      const questionNumWidth = doc.getTextWidth(questionNum + '       ')
      
      // Write question number at consistent left margin
      doc.text(questionNum, margin, yPosition)
      
      // Write question text after number with proper spacing
      const questionTextWidth = maxWidth - questionNumWidth
      const fullQuestionText = q.Question
      const questionLines = doc.splitTextToSize(fullQuestionText, questionTextWidth)
      
      // Print first line of question on same line as Q number
      doc.text(questionLines[0], margin + questionNumWidth, yPosition)
      yPosition += 4.5
      
      // Print remaining question lines if any (aligned with first line)
      for (let i = 1; i < questionLines.length; i++) {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          addPageHeader(subject, false)
        }
        doc.text(questionLines[i], margin + questionNumWidth, yPosition)
        yPosition += 4.5
      }
      
      // Add space after question before options
      yPosition += 1.5
      
      // Options - format exactly like reference image
      const options = [
        { label: '(a)', text: q['Option 1'] },
        { label: '(b)', text: q['Option 2'] },
        { label: '(c)', text: q['Option 3'] },
        { label: '(d)', text: q['Option 4'] }
      ]
      
      // Consistent left alignment for all options (matching reference image)
      const optionIndent = margin + questionNumWidth
      const halfWidth = (maxWidth - questionNumWidth) / 2
      
      // Try to fit 2 options per line like in reference image
      // First line: (a) and (b)
      // Second line: (c) and (d)
      
      const optionAText = `${options[0].label} ${options[0].text}`
      const optionBText = `${options[1].label} ${options[1].text}`
      const optionCText = `${options[2].label} ${options[2].text}`
      const optionDText = `${options[3].label} ${options[3].text}`
      
      const optionAWidth = doc.getTextWidth(optionAText)
      const optionBWidth = doc.getTextWidth(optionBText)
      const optionCWidth = doc.getTextWidth(optionCText)
      const optionDWidth = doc.getTextWidth(optionDText)
      
      // Check if we can fit 2 options per line
      const canFitTwoPerLine = (optionAWidth + optionBWidth + 20) <= (maxWidth - questionNumWidth) &&
                               (optionCWidth + optionDWidth + 20) <= (maxWidth - questionNumWidth)
      
      if (canFitTwoPerLine) {
        // Display options exactly like reference image: 2 per line
        if (yPosition > pageHeight - 35) {
          doc.addPage()
          addPageHeader(subject, false)
        }
        
        // First line: (a) and (b)
        doc.text(optionAText, optionIndent, yPosition)
        const optionBStartX = optionIndent + halfWidth
        doc.text(optionBText, optionBStartX, yPosition)
        yPosition += 4.5
        
        // Second line: (c) and (d)
        doc.text(optionCText, optionIndent, yPosition)
        const optionDStartX = optionIndent + halfWidth
        doc.text(optionDText, optionDStartX, yPosition)
        yPosition += 4.5
      } else {
        // Fall back to 4 options per line or individual lines
        const allOptionsText = `${optionAText}     ${optionBText}     ${optionCText}     ${optionDText}`
        const allOptionsWidth = doc.getTextWidth(allOptionsText)
        
        if (allOptionsWidth <= (maxWidth - questionNumWidth)) {
          // All 4 options on one line
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            addPageHeader(subject, false)
          }
          doc.text(allOptionsText, optionIndent, yPosition)
          yPosition += 4.5
        } else {
          // Each option on separate line
          options.forEach(opt => {
            if (yPosition > pageHeight - 30) {
              doc.addPage()
              addPageHeader(subject, false)
            }
            const optionText = `${opt.label} ${opt.text}`
            const optionLines = doc.splitTextToSize(optionText, maxWidth - questionNumWidth)
            optionLines.forEach((line, lineIdx) => {
              const lineIndent = lineIdx === 0 ? optionIndent : optionIndent + 10
              doc.text(line, lineIndent, yPosition)
              yPosition += 4.5
            })
          })
        }
      }
      
      // Answer (if included)
      if (includeAnswers) {
        yPosition += 2
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          addPageHeader(subject, false)
        }
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`Answer: ${q.Answer}`, optionIndent, yPosition)
        doc.setFont('helvetica', 'normal')
        yPosition += 5
      }
      
      // Add one more line space between questions for better readability
      yPosition += 5
    })
  })
  
  // Footer on all pages with page numbers
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(
      `${i}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  const suffix = includeAnswers ? '_with_answers' : '_questions_only'
  doc.save(`${fileName}${suffix}.pdf`)
}

export function exportAnswerKeyToPDF(questions, fileName) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${fileName} - Answer Key`, pageWidth / 2, 20, { align: 'center' })
  
  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  doc.text(dateStr, pageWidth / 2, 28, { align: 'center' })
  
  // Prepare table data
  const tableData = questions.map((q, index) => [
    (index + 1).toString(),
    q.subject,
    q.Answer
  ])
  
  // Create table
  doc.autoTable({
    startY: 35,
    head: [['Question #', 'Subject', 'Answer']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [136, 0, 0],
      fontSize: 11,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
    }
  })
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  const pageHeight = doc.internal.pageSize.height
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  doc.save(`${fileName}_answer_key.pdf`)
}
