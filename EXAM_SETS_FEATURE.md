# Exam Sets Feature - Documentation

## Overview
This feature allows you to generate multiple exam sets with the same questions but in different orders, ensuring fairness across all exam phases.

## How It Works

### Set Numbering System
- **Set Number (1, 2, 3, etc.)**: Determines WHICH questions are selected
- **Set Letter (A, B, C, D)**: Determines HOW questions and options are shuffled

### Example:
- **SET-1A, SET-1B, SET-1C, SET-1D**: All contain the SAME questions, but:
  - Questions are shuffled in different orders within each subject
  - Options (a, b, c, d) are shuffled for each question
  - Each set is unique but fair

- **SET-2A, SET-2B, SET-2C, SET-2D**: Contain DIFFERENT questions than Set-1, but follow the same shuffling pattern among themselves

## Features

### 1. Single Set Generation
- Select a set (e.g., SET-1A) from the dropdown
- Click "Generate Set" button
- Questions are loaded with shuffled order and options
- Download PDFs:
  - **PDF Questions**: Questions only (for students)
  - **PDF with Answers**: Questions with correct answers (for teachers)

### 2. Batch Generation (All Sets)
- After generating any set, click **"📦 Generate All Sets (A,B,C,D)"** button
- Automatically generates all 4 sets (A, B, C, D) for the same set number
- Downloads 8 PDFs total:
  - 4 question-only PDFs (one for each set)
  - 4 answer PDFs (one for each set)

## Use Cases

### Day 1 Exam - 3 Phases
- **Phase 1**: Use SET-1A
- **Phase 2**: Use SET-1B  
- **Phase 3**: Use SET-1C
- **Backup**: Use SET-1D

All students get the same questions but in different order, so no phase is easier than another.

### Day 2 Exam - 3 Phases
- **Phase 1**: Use SET-2A
- **Phase 2**: Use SET-2B
- **Phase 3**: Use SET-2C
- **Backup**: Use SET-2D

Different questions from Day 1, but same fairness principle.

### Day 3 Exam - 3 Phases
- Use SET-3A, SET-3B, SET-3C, SET-3D

## Technical Details

### Question Selection
- Uses **seeded randomization** based on set number
- Ensures all sets with same number get identical questions
- Questions are selected from CSV files per subject configuration

### Shuffling Algorithm
- **Question Order**: Shuffled within each subject using seed = `setNumber * 1000 + setLetter * 100 + subjectIndex`
- **Option Order**: Shuffled for each question using seed = `setNumber * 10000 + setLetter * 1000 + subjectIndex * 100 + questionIndex`
- **Answer Key**: Automatically updated to match shuffled options

### PDF Generation
- Questions displayed as Q1, Q2, Q3, etc.
- Options aligned properly (a, b, c, d)
- Subject headers displayed clearly
- Page numbers at bottom
- Duration and set name in header

## Benefits

1. **Fairness**: All exam phases equally difficult
2. **Security**: Prevents copying since each set has different order
3. **Flexibility**: Can generate multiple sets for different days
4. **Efficiency**: Batch generate all 4 sets with one click
5. **Traceability**: Answer keys generated for each set
6. **Consistency**: Same questions ensure comparable results

## Files Modified
- `src/App.jsx`: Added batch generation logic
- `src/utils/shuffleUtils.js`: Shuffling algorithms (NEW)
- `src/utils/pdfExport.js`: PDF generation with Q prefix
- `src/App.css`: Styling for new buttons and info box

## Important Notes
- Always generate all 4 sets (A, B, C, D) before the exam to ensure they're ready
- Keep answer PDFs secure and separate from question PDFs
- Test the PDFs before distributing to students
- Set numbers should be planned ahead for multi-day exams
