# SheetApps Template Repository

## 🎯 Overview

This is the official SheetApps template repository, specifically optimized for AI-generated user interfaces. It provides a complete, production-ready foundation for building React applications powered by Google Sheets data.

## 🚀 Key Features

### ✅ Backend Ready
- **Complete API Integration**: Pre-configured SheetApps API client with all CRUD operations
- **Standardized Responses**: All API calls return consistent `{ success, data, error, timestamp }` format
- **Data Validation**: Built-in validation for email, number, date, and URL fields
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting Aware**: Handles API rate limits gracefully

### ✅ Frontend Optimized
- **React + TypeScript**: Modern development with full type safety
- **Custom Hooks**: Ready-to-use hooks for data fetching, searching, and mutations
- **UI Component Library**: Consistent, accessible components (Button, LoadingSpinner, etc.)
- **Tailwind CSS**: Utility-first styling with responsive design
- **Utility Functions**: Data formatting, validation, and helper functions

### ✅ AI-Generation Ready
- **Clear API Surface**: Single entry point (`sheetApi`) for all data operations
- **Comprehensive Documentation**: Detailed examples and patterns for AI models
- **Type Definitions**: Full TypeScript support for better AI code generation
- **Error Boundaries**: Automatic error recovery for generated components

## How It Works

1. **E2B Cloning**: The SheetApps AI system clones this repository into an E2B sandbox
2. **Configuration**: Environment variables are injected based on your Google Sheet structure
3. **AI Generation**: Custom UI components are generated and deployed
4. **Live App**: A fully functional app is created and served

## Template Structure

```
src/
├── api/
│   ├── client.ts      # SheetApps API client with CRUD operations
│   └── config.ts      # Configuration management
├── types/
│   └── index.ts       # TypeScript type definitions
├── App.tsx           # Main application component (replaced by AI)
├── main.tsx          # React entry point
└── index.css         # Tailwind CSS imports

public/               # Static assets
├── vite.svg         # Default Vite logo

Configuration files:
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── .env.template     # Environment variable template
```

## Environment Variables

The following variables are automatically injected during app generation:

- `VITE_SHEETAPPS_API_URL`: API endpoint
- `VITE_SHEETAPPS_API_KEY`: Authentication key
- `VITE_SHEET_ID`: Google Sheet identifier
- `VITE_SHEET_HEADERS`: Column headers as JSON array
- `VITE_SHEET_DATA_TYPES`: Column data types as JSON object
- `VITE_APP_NAME`: Generated app name
- `VITE_APP_DESCRIPTION`: App description
- `VITE_PROJECT_ID`: SheetApps project identifier

## Features

### SheetClient API

The template includes a comprehensive API client (`src/api/client.ts`) with:

- **CRUD Operations**: Create, read, update operations
- **Smart Caching**: 30-second cache for performance
- **Type Conversion**: Automatic boolean detection for checkbox columns
- **Error Handling**: Graceful fallbacks and error recovery
- **Sample Data**: Demo data when live sheets aren't available

### Responsive UI

- Mobile-first design with Tailwind CSS
- Loading states and error handling
- Data tables with scrolling and pagination
- Status indicators and interactive elements

### AI-Ready Structure

The template is optimized for AI code generation:

- Clean component structure
- Consistent naming conventions
- TypeScript interfaces for type safety
- Tailwind utility classes for styling

## Local Development

To test this template locally:

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/sheetapps-template.git
cd sheetapps-template

# Install dependencies
npm install

# Set up environment variables
cp .env.template .env
# Edit .env with your actual values

# Start development server
npm run dev
```

## Deployment

This template is designed to be cloned and deployed automatically by the SheetApps system. Manual deployment steps:

```bash
# Build the application
npm run build

# Serve the built application
npm run preview
```

## Customization

### Adding New API Methods

Extend the `SheetClient` class in `src/api/client.ts`:

```typescript
async customMethod(): Promise<any> {
  // Your implementation
  return this.makeRequest('GET', '/custom-endpoint');
}
```

### Modifying Types

Update type definitions in `src/types/index.ts`:

```typescript
export interface CustomType {
  // Your fields
}
```

### Styling Changes

Update Tailwind configuration in `tailwind.config.js` or add custom CSS to `src/index.css`.

## AI Generation Process

1. **Template Cloning**: E2B clones this repository
2. **Environment Setup**: Variables are injected into `.env`
3. **AI Processing**: Custom `App.tsx` is generated based on sheet structure
4. **Deployment**: Dependencies are installed and the app is served
5. **Live URL**: A working app is made available via E2B preview URL

## Best Practices

- Keep dependencies minimal and well-tested
- Maintain backward compatibility
- Follow React and TypeScript best practices
- Use semantic versioning for releases
- Test changes thoroughly before releasing

## Contributing

When contributing to this template:

1. Test locally with various sheet configurations
2. Ensure backward compatibility
3. Update documentation for new features
4. Follow the existing code style
5. Create appropriate git tags for versions

## License

This template is open source and available under the MIT License.

## Support

For issues with this template:
- SheetApps Platform: https://sheetapps.com
- Documentation: https://docs.sheetapps.com
- GitHub Issues: Create an issue in this repository