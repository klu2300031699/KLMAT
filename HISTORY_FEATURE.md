# History Feature Documentation

## Overview
The History feature allows users to track, view, and manage their previously generated question sets. Each user has their own separate history stored in the browser's localStorage.

## Features Added

### 1. **History Component** (`History.jsx` & `History.css`)
- Displays a list of all previously generated question sets
- Shows set name, timestamp, and question count breakdown
- Allows users to load previous sets
- Allows users to delete history items
- Responsive design with smooth animations

### 2. **User-Specific Storage**
- Each user's history is stored separately in localStorage
- Storage key format: `questionHistory_${username}`
- Persists between sessions
- Automatically clears when user logs out

### 3. **History Management Functions**

#### Save to History
When a user generates a new question set, it automatically saves:
- Set name (fileName)
- All 75 questions with their details
- Generation timestamp
- Unique ID for each history item

#### Load from History
Users can click "Load" on any history item to:
- Restore the exact question set
- View all questions as they were generated
- Download or print the set

#### Delete History
Users can delete individual history items:
- Confirmation dialog before deletion
- Removes from both state and localStorage
- Permanent deletion (cannot be undone)

### 4. **UI Updates**

#### Header
- New "📚 History" button appears when user is logged in
- Positioned next to the username dropdown
- Styled to match the existing design

#### History Modal
- Overlay design for easy access
- Sorted by newest first
- Shows detailed information for each set:
  - Set name
  - Generation date and time
  - Total questions count
  - Subject breakdown (Chemistry, Physics, Maths)
- Action buttons for each item (Load, Delete)

## How to Use

### For End Users:

1. **Login** to your account
2. **Generate** a question set as usual
3. The set is automatically saved to your history
4. **View History**:
   - Click the "📚 History" button in the header
   - Browse your previously generated sets
5. **Load a Previous Set**:
   - Click "📖 Load" on any history item
   - The set opens in the main view
6. **Delete a Set**:
   - Click "🗑️ Delete" on any history item
   - Confirm the deletion

### Technical Details:

#### Data Structure
```javascript
{
  id: 1697734800000,  // Timestamp
  fileName: "Set Name",
  questions: [...],    // Array of 75 question objects
  timestamp: "2025-10-19T12:00:00.000Z"
}
```

#### LocalStorage Keys
- Format: `questionHistory_${username}`
- Examples:
  - `questionHistory_Gnanesh`
  - `questionHistory_1277`
  - `questionHistory_4868`

#### Component Integration
- `App.jsx` - Main logic and state management
- `Header.jsx` - History button
- `History.jsx` - History modal display
- localStorage - Persistent storage

## Benefits

1. **No data loss** - All generated sets are saved automatically
2. **Easy access** - Quick retrieval of previous sets
3. **User-specific** - Each user has their own history
4. **Privacy** - History is stored locally in the browser
5. **Convenience** - No need to regenerate sets
6. **Management** - Easy to delete unwanted history items

## Browser Compatibility
Works on all modern browsers that support:
- localStorage API
- ES6+ JavaScript
- React 18+

## Notes
- History is stored locally in the browser
- Clearing browser data will delete history
- Each user can have unlimited history items
- History is not shared between different browsers/devices
