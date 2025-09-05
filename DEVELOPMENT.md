# Development Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Local Development

### Environment Setup
1. Copy `.env.template` to `.env`
2. Configure your API credentials:
   ```bash
   VITE_SHEETAPPS_API_URL=https://your-api.com/api/v1
   VITE_SHEETAPPS_API_KEY=sk_your_api_key
   VITE_SHEET_ID=your_sheet_id
   VITE_SHEET_HEADERS=["Name","Email","Status"]
   VITE_SHEET_DATA_TYPES={"Name":"text","Email":"email","Status":"text"}
   VITE_APP_NAME=Your App Name
   VITE_APP_DESCRIPTION=Your app description
   ```

### Sample Data Testing
The template includes a sample UI that demonstrates all features:
- ✅ Data loading with loading states
- ✅ Search and filtering
- ✅ Inline editing
- ✅ Adding new records
- ✅ Error handling
- ✅ Responsive design

### API Configuration
- **Live API**: Uses your configured SheetApps API
- **Sample Data**: Fallback sample data when API is unavailable
- **Error Handling**: Graceful degradation with user-friendly messages

## 🎨 UI Components

### Available Components
```typescript
import { 
  Button, 
  LoadingSpinner, 
  EmptyState, 
  ErrorBoundary 
} from './components/ui';
```

### Usage Examples
```tsx
// Loading state
<LoadingSpinner size="lg" text="Loading..." />

// Empty state
<EmptyState 
  title="No data found" 
  description="Add some records to get started"
  icon={<DatabaseIcon />}
  action={<Button>Add Record</Button>}
/>

// Buttons with variants
<Button variant="primary" loading={loading}>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
```

## 🎣 React Hooks

### Data Hooks
```typescript
// Get all data
const { data, loading, error, refresh } = useSheetData();

// Search data
const { searchData, search, clearSearch } = useSearchData();

// Single row
const { row, loading, error } = useSheetRow(id);
```

### Mutation Hooks
```typescript
// Add records
const { addRow, loading, success, error } = useAddRow();

// Update fields
const { updateField, loading, success, error } = useUpdateField();

// Optimistic updates
const { data, optimisticUpdate, isUpdating } = useOptimisticUpdate(initialData);
```

## 🛠 Utility Functions

### Data Formatting
```typescript
import { formatValue, getStatusColor, truncate } from './utils';

// Format by data type
formatValue(row.Price, 'currency') // $1,234.50
formatValue(row.Date, 'date') // Jan 15, 2024
formatValue(row.Active, 'boolean') // Yes/No

// Status colors for badges
<span className={getStatusColor(row.Status)}>
  {row.Status}
</span>

// Truncate long text
truncate(row.Description, 100)
```

### Validation
```typescript
import { isValidEmail, isEmpty, isValidUrl } from './utils';

const errors = {};
if (!isValidEmail(data.Email)) errors.Email = 'Invalid email';
if (isEmpty(data.Name)) errors.Name = 'Name is required';
```

## 🔍 Testing

### Manual Testing
1. **Data Loading**: Check loading states and error handling
2. **CRUD Operations**: Test add, update, delete operations
3. **Search**: Test search and filter functionality
4. **Responsive**: Test on different screen sizes
5. **Error Cases**: Test with invalid API keys, network errors

### Sample Data
When the API is unavailable, the template generates realistic sample data for testing UI components.

## 🎯 AI Generation

### For AI Models
This template is optimized for AI code generation:

1. **Single API Entry Point**: `import { sheetApi } from '../api/sheetApi'`
2. **Standardized Responses**: All functions return `{ success, data, error }`
3. **React Hooks**: Use hooks for all data operations
4. **Type Safety**: Full TypeScript support
5. **Error Boundaries**: Automatic error recovery

### Example AI-Generated Component
```tsx
import { useSheetData, useAddRow } from '../hooks/useSheetData';
import { Button, LoadingSpinner } from '../components/ui';
import { formatValue } from '../utils';

export function TaskManager() {
  const { data, loading, error } = useSheetData();
  const { addRow, loading: addLoading } = useAddRow();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  
  const handleAddTask = async () => {
    await addRow({
      Name: 'New Task',
      Status: 'Pending',
      Priority: 'Medium'
    });
  };
  
  return (
    <div>
      <h1>Task Manager</h1>
      <Button onClick={handleAddTask} loading={addLoading}>
        Add Task
      </Button>
      
      {data.map(task => (
        <div key={task._id}>
          <h3>{task.Name}</h3>
          <p>Due: {formatValue(task.DueDate, 'date')}</p>
          <span className={getStatusColor(task.Status)}>
            {task.Status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```bash
VITE_SHEETAPPS_API_URL=https://production-api.com/api/v1
VITE_SHEETAPPS_API_KEY=sk_production_key
# ... other variables
```

### Deployment
- **Vercel**: Connect GitHub repo for automatic deployment
- **Netlify**: Drag and drop `dist` folder
- **Static Hosting**: Use `dist` folder contents

## 🔧 Customization

### Adding New Components
1. Create component in `src/components/`
2. Export from `src/components/ui/index.ts`
3. Follow existing patterns

### Adding Utility Functions
1. Add to `src/utils/index.ts`
2. Export the function
3. Document usage examples

### Extending API
1. Add methods to `src/api/sheetApi.ts`
2. Follow existing response format
3. Update TypeScript types

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
- Check TypeScript errors: `npx tsc --noEmit`
- Ensure all imports are correct
- Verify environment variables

**API Connection Fails**
- Check `VITE_SHEETAPPS_API_URL` and `VITE_SHEETAPPS_API_KEY`
- Verify sheet permissions
- Check browser network tab for errors

**Styling Issues**
- Ensure Tailwind classes are correct
- Check responsive breakpoints
- Verify component imports

**Data Not Loading**
- Check browser console for errors
- Verify sheet ID and headers
- Test with sample data mode

### Development Tips
- Use React DevTools for debugging
- Check browser console for errors
- Use network tab to debug API calls
- Test with different screen sizes

## 📚 Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite**: https://vitejs.dev/
- **Lucide Icons**: https://lucide.dev/