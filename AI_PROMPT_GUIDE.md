# AI Code Generation Guide for SheetApps Template

## 🤖 Overview

This SheetApps template is specifically optimized for AI code generation. It provides a clean, well-structured foundation that AI models can easily understand and build upon. All backend functionality is pre-configured, so AI only needs to focus on generating UI components.

## 📁 Template Structure

```
src/
├── api/
│   ├── sheetApi.ts        # Main API interface for AI to use
│   ├── client.ts          # Low-level client (used by sheetApi)
│   └── config.ts          # Environment configuration
├── hooks/
│   └── useSheetData.ts    # React hooks for data management
├── components/
│   └── ui/                # Reusable UI components
├── utils/
│   └── index.ts          # Utility functions for data formatting
├── types/
│   └── index.ts          # TypeScript type definitions
└── App.tsx               # Main app (to be replaced by AI)
```

## 🔧 Core API Interface (`src/api/sheetApi.ts`)

### Import Statement
```typescript
import { sheetApi } from '../api/sheetApi';
// or
import sheetApi from '../api/sheetApi';
```

### Available Methods

#### Data Retrieval
```typescript
// Get all sheet data
const response = await sheetApi.getAllData();
// Response: { success: boolean, data: SheetRow[], message?: string, timestamp?: string }

// Get single row by ID
const response = await sheetApi.getRow('user123');
// Response: { success: boolean, data: SheetRow | null, message?: string }

// Search/filter data
const response = await sheetApi.search({
  field: 'Status',
  value: 'Active',
  operator: 'equals' // 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan'
});
// Response: { success: boolean, data: SheetRow[], message?: string }
```

#### Data Modification
```typescript
// Add new row
const response = await sheetApi.addRow({
  Name: 'John Doe',
  Email: 'john@example.com',
  Status: 'Active'
});
// Response: { success: boolean, data?: boolean, error?: string }

// Update single field
const response = await sheetApi.updateField({
  identifier: 'john@example.com', // or row ID
  field: 'Status',
  newValue: 'Inactive',
  oldValue: 'Active' // optional for conflict detection
});
// Response: { success: boolean, data?: boolean, error?: string }

// Bulk update multiple fields
const response = await sheetApi.bulkUpdate([
  { identifier: '1', field: 'Status', newValue: 'Complete' },
  { identifier: '2', field: 'Priority', newValue: 'High' }
]);
// Response: { success: boolean, data: { successful: number, failed: number, errors: string[] } }
```

#### Metadata & Configuration
```typescript
// Get sheet headers
const headers = sheetApi.getHeaders();
// Returns: string[] (e.g., ['Name', 'Email', 'Status', 'Priority'])

// Get field data type
const dataType = sheetApi.getFieldType('Email');
// Returns: 'text' | 'email' | 'number' | 'date' | 'boolean' | 'url'

// Get sheet info
const info = sheetApi.getSheetInfo();
// Returns: { headers: string[], dataTypes: Record<string, string>, totalColumns: number, hasData: boolean }
```

## 🎣 React Hooks (`src/hooks/useSheetData.ts`)

### Data Fetching Hooks

#### useSheetData() - Get all data with loading states
```typescript
import { useSheetData } from '../hooks/useSheetData';

const { data, loading, error, refresh, isEmpty, count } = useSheetData();

// Usage in JSX:
if (loading) return <LoadingSpinner />;
if (error) return <div>Error: {error}</div>;
if (isEmpty) return <EmptyState title="No data" />;

return (
  <div>
    <h1>Found {count} records</h1>
    {data.map(row => <div key={row._id}>{row.Name}</div>)}
    <button onClick={refresh}>Refresh</button>
  </div>
);
```

#### useSearchData() - Search with loading states
```typescript
import { useSearchData } from '../hooks/useSheetData';

const { searchData, loading, search, clearSearch, hasSearched } = useSearchData();

const handleSearch = () => {
  search({ field: 'Name', value: searchTerm, operator: 'contains' });
};
```

#### useSheetRow(id) - Get single row
```typescript
import { useSheetRow } from '../hooks/useSheetData';

const { row, loading, error, refetch } = useSheetRow(userId);
```

### Data Mutation Hooks

#### useAddRow() - Add new rows
```typescript
import { useAddRow } from '../hooks/useSheetData';

const { addRow, loading, error, success, reset } = useAddRow();

const handleSubmit = async (formData) => {
  const result = await addRow(formData);
  if (result.success) {
    // Show success message
    reset(); // Clear success/error states
  }
};
```

#### useUpdateField() - Update fields
```typescript
import { useUpdateField } from '../hooks/useSheetData';

const { updateField, loading, error, success } = useUpdateField();

const handleStatusChange = (rowId, newStatus) => {
  updateField({
    identifier: rowId,
    field: 'Status',
    newValue: newStatus
  });
};
```

#### useOptimisticUpdate() - Immediate UI updates with rollback
```typescript
import { useOptimisticUpdate } from '../hooks/useSheetData';

const { data, optimisticUpdate, isUpdating, error } = useOptimisticUpdate(initialData);

const toggleComplete = (taskId) => {
  optimisticUpdate(
    // Optimistic update (immediate UI change)
    (prevData) => prevData.map(task => 
      task._id === taskId 
        ? { ...task, Status: task.Status === 'Complete' ? 'Pending' : 'Complete' }
        : task
    ),
    // Server update (real API call)
    () => sheetApi.updateField({
      identifier: taskId,
      field: 'Status',
      newValue: data.find(t => t._id === taskId)?.Status === 'Complete' ? 'Pending' : 'Complete'
    })
  );
};
```

## 🧩 UI Components (`src/components/ui/`)

### Available Components
```typescript
import { 
  Button, 
  LoadingSpinner, 
  EmptyState, 
  ErrorBoundary 
} from '../components/ui';

// Button with variants and loading states
<Button 
  variant="primary" // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="md" // 'sm' | 'md' | 'lg'
  loading={loading}
  onClick={handleClick}
  icon={<PlusIcon />}
>
  Add New
</Button>

// Loading spinner
<LoadingSpinner size="lg" text="Loading data..." />

// Empty state
<EmptyState 
  title="No tasks found"
  description="Create your first task to get started"
  icon={<TaskIcon />}
  action={<Button onClick={handleAdd}>Add Task</Button>}
/>

// Error boundary (wrap components)
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 🛠 Utility Functions (`src/utils/index.ts`)

### Data Formatting
```typescript
import { 
  formatValue, 
  getStatusColor, 
  getPriorityColor,
  truncate,
  formatPhoneNumber 
} from '../utils';

// Format values by data type
{formatValue(row.Price, 'currency')} // $1,234.50
{formatValue(row.Date, 'date')} // Jan 15, 2024
{formatValue(row.IsActive, 'boolean')} // Yes/No

// Get status colors for badges
<span className={getStatusColor(row.Status)}>
  {row.Status}
</span>

// Truncate long text
{truncate(row.Description, 100)}
```

### Validation
```typescript
import { isValidEmail, isEmpty, isValidUrl } from '../utils';

const validateForm = (data) => {
  const errors = {};
  
  if (isEmpty(data.Name)) errors.Name = 'Name is required';
  if (!isValidEmail(data.Email)) errors.Email = 'Invalid email';
  if (!isValidUrl(data.Website)) errors.Website = 'Invalid URL';
  
  return errors;
};
```

## 📋 Example AI-Generated Component Patterns

### 1. Task Manager Dashboard
```typescript
import React from 'react';
import { useSheetData, useUpdateField } from '../hooks/useSheetData';
import { Button, LoadingSpinner, EmptyState } from '../components/ui';
import { formatValue, getStatusColor } from '../utils';
import { CheckCircle, Clock } from 'lucide-react';

export function TaskDashboard() {
  const { data: tasks, loading, error } = useSheetData();
  const { updateField } = useUpdateField();

  const toggleTaskStatus = (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Complete' ? 'Pending' : 'Complete';
    updateField({
      identifier: taskId,
      field: 'Status',
      newValue: newStatus
    });
  };

  if (loading) return <LoadingSpinner text="Loading tasks..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (tasks.length === 0) return <EmptyState title="No tasks found" />;

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div key={task._id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{task.Name}</h3>
              <p className="text-gray-600">{formatValue(task.DueDate, 'date')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.Status)}`}>
                {task.Status}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleTaskStatus(task._id, task.Status)}
                icon={task.Status === 'Complete' ? <CheckCircle /> : <Clock />}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Data Entry Form
```typescript
import React, { useState } from 'react';
import { useAddRow, useSheetConfig } from '../hooks/useSheetData';
import { Button } from '../components/ui';
import { isValidEmail } from '../utils';

export function AddUserForm() {
  const { headers, getFieldType } = useSheetConfig();
  const { addRow, loading, error, success, reset } = useAddRow();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    headers.forEach(field => {
      const value = formData[field];
      const fieldType = getFieldType(field);
      
      if (!value && field === headers[0]) { // First field usually required
        newErrors[field] = `${field} is required`;
      } else if (value && fieldType === 'email' && !isValidEmail(value)) {
        newErrors[field] = 'Invalid email format';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await addRow(formData);
    if (result.success) {
      setFormData({});
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {headers.map(field => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            {field}
          </label>
          <input
            type={getFieldType(field) === 'email' ? 'email' : 'text'}
            value={formData[field] || ''}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors[field] && (
            <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
          )}
        </div>
      ))}
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      {success && (
        <div className="text-green-600 text-sm">Record added successfully!</div>
      )}
      
      <Button type="submit" loading={loading}>
        Add Record
      </Button>
    </form>
  );
}
```

### 3. Search and Filter Interface
```typescript
import React, { useState } from 'react';
import { useSearchData, useSheetConfig } from '../hooks/useSheetData';
import { Button, EmptyState } from '../components/ui';
import { Search, X } from 'lucide-react';

export function SearchInterface() {
  const { searchData, loading, search, clearSearch, hasSearched } = useSearchData();
  const { headers } = useSheetConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState(headers[0]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      search({
        field: selectedField,
        value: searchTerm,
        operator: 'contains'
      });
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    clearSearch();
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <div className="flex space-x-2">
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          {headers.map(header => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 border rounded-md px-3 py-2"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <Button onClick={handleSearch} loading={loading} icon={<Search />}>
          Search
        </Button>
        
        {hasSearched && (
          <Button onClick={handleClear} variant="secondary" icon={<X />}>
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div>
          {searchData.length > 0 ? (
            <div className="grid gap-4">
              {searchData.map(row => (
                <div key={row._id} className="bg-white p-4 rounded-lg shadow">
                  {headers.map(header => (
                    <div key={header}>
                      <strong>{header}:</strong> {row[header]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No results found" description="Try a different search term" />
          )}
        </div>
      )}
    </div>
  );
}
```

## 📝 AI Prompt Guidelines

### When generating UI components, remember:

1. **Always import from the correct paths:**
   - API: `import { sheetApi } from '../api/sheetApi'`
   - Hooks: `import { useSheetData } from '../hooks/useSheetData'`
   - UI: `import { Button } from '../components/ui'`
   - Utils: `import { formatValue } from '../utils'`

2. **Handle loading and error states:**
   ```typescript
   if (loading) return <LoadingSpinner text="Loading..." />;
   if (error) return <div className="text-red-600">Error: {error}</div>;
   ```

3. **Use the hook patterns provided:**
   - `useSheetData()` for displaying data
   - `useAddRow()` for forms
   - `useUpdateField()` for inline editing
   - `useSearchData()` for search functionality

4. **Follow the response format:**
   - All API functions return `{ success: boolean, data?: any, error?: string }`
   - Always check `response.success` before using `response.data`

5. **Use utility functions for formatting:**
   - `formatValue(value, dataType)` for display formatting
   - `getStatusColor(status)` for status badges
   - `truncate(text, length)` for long text

6. **Wrap components in ErrorBoundary:**
   ```typescript
   <ErrorBoundary>
     <YourComponent />
   </ErrorBoundary>
   ```

7. **Use Tailwind CSS classes for styling:**
   - The template includes Tailwind CSS
   - Use responsive classes: `md:grid-cols-2`, `lg:px-8`
   - Use consistent spacing: `space-y-4`, `gap-4`

## 🎯 Common App Patterns

### Dashboard Pattern
- Use `useSheetData()` to display overview
- Show key metrics and recent items
- Include search and filter capabilities

### CRUD Interface Pattern
- List view with `useSheetData()`
- Add form with `useAddRow()`
- Inline editing with `useUpdateField()`
- Search with `useSearchData()`

### Kanban Board Pattern
- Group data by status using `groupBy()` from utils
- Use `useOptimisticUpdate()` for drag-and-drop
- Update status field on column changes

### Calendar/Timeline Pattern
- Filter data by date fields
- Use `isDateInRange()` for date filtering
- Format dates with `formatValue(date, 'date')`

This template is designed to make AI code generation as smooth as possible. The AI should focus on creating engaging, functional UI components while the backend handles all data operations reliably.