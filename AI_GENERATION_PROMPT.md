# 🤖 SheetApps AI Generation Prompt - App.tsx Generator

## 📋 **TASK:**
Generate a complete React App.tsx component for a Google Sheets-based web application. This component will replace an existing App.tsx file and must work seamlessly with the provided SheetApps template infrastructure.

---

## 🏗️ **MANDATORY TEMPLATE STRUCTURE:**

### **Required Imports (COPY EXACTLY):**
```tsx
import { useState } from 'react'
import { getAppConfig } from './api/config'
import { useSheetData, useAddRow, useUpdateField, useSearchData } from './hooks/useSheetData'
import { ErrorBoundary, LoadingSpinner, Button } from './components/ui'
import { 
  // Add appropriate Lucide React icons based on your UI needs
  // Available icons: Users, UserPlus, Search, RefreshCw, CheckCircle, XCircle, 
  // User, Phone, Calendar, UserCheck, AlertTriangle, Plus, Filter, Edit2, 
  // Trash2, Eye, Settings, Download, Upload, Bell, etc.
} from 'lucide-react'
```

### **Required Function Signature:**
```tsx
function App() {
  // Your implementation here
}

// MANDATORY: Always end with this exact ErrorBoundary wrapper
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithErrorBoundary
```

---

## 🔧 **REQUIRED HOOKS USAGE:**

### **1. Data Management (MANDATORY):**
```tsx
// ALWAYS use this pattern - provides both data and connection status
const { data, loading, error, refresh, count } = useSheetData()

// Derive connection status from data state
const connected = !loading && !error
const checking = loading
const rowCount = count
```

### **2. Search Functionality:**
```tsx
const { searchData, search, clearSearch, hasSearched, loading: searchLoading } = useSearchData()

// Usage:
search({
  field: 'ColumnName',
  value: searchTerm,
  operator: 'contains' // or 'equals', 'startsWith', etc.
})
```

### **3. Data Mutations:**
```tsx
const { addRow, loading: addLoading, success: addSuccess, reset: resetAdd } = useAddRow()
const { updateField, loading: updateLoading } = useUpdateField()

// Adding records:
const result = await addRow({
  ColumnName1: value1,
  ColumnName2: value2
})

// Updating fields:
await updateField({
  identifier: recordId, // row._id
  field: 'ColumnName',
  newValue: newValue
})
```

### **4. App Configuration:**
```tsx
const appConfig = getAppConfig() // Provides: { name, description, devMode, projectId }
```

---

## 🎨 **UI COMPONENT LIBRARY:**

### **Available Components:**
- **`<Button>`** - `variant="primary|secondary|danger|ghost"`, `size="sm|md|lg"`, `loading={bool}`, `icon={<Icon />}`
- **`<LoadingSpinner>`** - `size="sm|md|lg"`, `text="Loading message"`
- **`<EmptyState>`** - For empty data states with actions

### **Styling:**
- **Framework:** TailwindCSS (all classes available)
- **Layout:** Responsive design with `max-w-7xl mx-auto` containers
- **Colors:** Blue primary theme, gray neutrals
- **Components:** Cards with `bg-white rounded-lg shadow-sm`

---

## 📊 **DATA STRUCTURE:**

### **Sheet Row Format:**
```tsx
interface SheetRow {
  _id: string | number;     // Unique identifier
  _rowIndex: number;        // Row position in sheet
  [columnName: string]: any; // Your actual column data
}
```

### **Data Access Patterns:**
```tsx
// Always check for data existence
const displayData = hasSearched ? searchData : data

// Access column values
row.ColumnName || 'Default value'

// Row identification
String(row._id) // Always convert to string for keys/IDs
```

---

## 🎯 **REQUIRED FUNCTIONALITY:**

### **1. Connection Status UI:**
```tsx
if (checking) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <LoadingSpinner size="lg" text={`Loading ${appConfig.name}...`} />
    </div>
  )
}

if (!connected) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Required</h1>
          <p className="text-gray-600 mb-6">Cannot connect to Google Sheets. Please check your API configuration.</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <Button onClick={refresh} variant="primary" icon={<RefreshCw className="w-4 h-4" />}>
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### **2. Main App Layout:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  {/* Header */}
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header content with app title and actions */}
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Your app content */}
  </main>
</div>
```

---

## ⚠️ **CRITICAL REQUIREMENTS:**

### **Performance Optimization:**
- **NO automatic refresh after mutations** - Cache invalidation is handled automatically
- **NO clearCache() calls** - Let the system manage caching
- **Single API call on load** - Don't use multiple data hooks simultaneously

### **Error Handling:**
```tsx
// Always handle loading and error states
{loading ? (
  <LoadingSpinner size="lg" text="Loading data..." />
) : error ? (
  <div className="bg-red-50 border border-red-200 rounded p-6">
    <p className="text-red-800">{error}</p>
    <Button onClick={refresh} variant="primary">Try Again</Button>
  </div>
) : (
  // Your data UI
)}
```

### **Responsive Design:**
- Mobile-first approach
- Use `flex-col sm:flex-row` patterns
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Touch-friendly buttons and interactions

---

## 🎨 **UI PATTERNS TO FOLLOW:**

### **Data Cards:**
```tsx
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">Title ({data.length})</h3>
  </div>
  <div className="divide-y divide-gray-200">
    {data.map(row => (
      <div key={row._id} className="p-6 hover:bg-gray-50 transition-colors">
        {/* Row content */}
      </div>
    ))}
  </div>
</div>
```

### **Forms:**
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Placeholder"
      />
    </div>
  </div>
</form>
```

### **Search Interface:**
```tsx
<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>
    <Button onClick={handleSearch} loading={searchLoading}>Search</Button>
  </div>
</div>
```

---

## 📋 **REQUIRED INPUT DATA:**

Please provide the following information about the Google Sheets data:

1. **Sheet Columns:** [List of column names from the spreadsheet]
2. **Data Types:** [Specify type for each column: text, number, boolean, date, email, url]
3. **App Purpose:** [Brief description of what this app manages]
4. **Primary Actions:** [What users should be able to do: view, add, edit, search, filter, etc.]
5. **UI Theme:** [Any specific styling preferences or industry focus]

---

## 🎯 **GENERATION REQUIREMENTS:**

1. **Copy-Paste Ready:** Code must work immediately when placed in App.tsx
2. **Domain-Specific:** UI should reflect the actual data being managed
3. **Complete Implementation:** Include all CRUD operations, search, error handling
4. **Professional Design:** Modern, clean, responsive interface
5. **Performance Optimized:** Follow the API call optimization patterns
6. **Accessible:** Include proper ARIA labels and keyboard navigation

---

## 📝 **EXAMPLE OUTPUT:**

Generate code following this exact structure:

```tsx
import { useState } from 'react'
import { getAppConfig } from './api/config'
import { useSheetData, useAddRow, useUpdateField, useSearchData } from './hooks/useSheetData'
import { ErrorBoundary, LoadingSpinner, Button } from './components/ui'
import { /* icons */ } from 'lucide-react'

function App() {
  // Hook implementations
  // State management
  // Event handlers
  // UI components
  // Return JSX
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithErrorBoundary
```

**Generate a complete, production-ready App.tsx component that perfectly matches the provided sheet structure and business requirements.**