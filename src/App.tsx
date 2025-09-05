import { useEffect } from 'react'
import { getAppConfig } from './api/config'
import { useQuickConnectionStatus } from './hooks/useConnectionTest'
import { ErrorBoundary, LoadingSpinner, Button } from './components/ui'
import { ConnectionStatus } from './components/ConnectionStatus'
import { SampleUI } from './components/SampleUI'
import { ApiDebugger } from './components/ApiDebugger'
import { Database, RefreshCw } from 'lucide-react'

// Simple logger to write to a file in the sandbox
const log = (message: string) => {
  // This is a simplified logger for the sandbox environment.
  // In a real app, you would use a more robust logging library.
  console.log(message);
};

function App() {
  const { connected, checking, error, rowCount, refresh } = useQuickConnectionStatus()
  const appConfig = getAppConfig()

  useEffect(() => {
    log('App component mounted');
    log(`Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
    if (connected && rowCount !== undefined) {
      log(`Real data loaded: ${rowCount} rows`);
    }
  }, [connected, rowCount])

  const testAddRow = async () => {
    // This will be replaced by AI-generated components
    // For now, just show a message
    alert('Add row functionality will be implemented by AI-generated UI')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text={`Loading ${appConfig.name}...`} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{appConfig.name}</h1>
              <p className="mt-1 text-gray-600">{appConfig.description}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={refresh}
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Connection
              </Button>
              <Button
                onClick={testAddRow}
                variant="primary"
                disabled={!connected}
              >
                Test Add Row
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Connection Status Panel */}
        <div className="mb-6">
          <ConnectionStatus />
        </div>

        {/* Sample UI Demo - Only show if connected */}
        {connected ? (
          <SampleUI />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-medium text-red-800">
                Google Sheets Connection Required
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              Cannot load real data from Google Sheets. Please check your API configuration above.
            </p>
            <p className="text-red-600 text-sm">
              <strong>This template never uses mock data.</strong> All data must come from your actual Google Sheets.
            </p>
            {error && (
              <div className="mt-3 p-3 bg-red-100 rounded text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        {/* API Debugger */}
        <ApiDebugger />

        {/* Template Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">ℹ️ About This Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
            <div>
              <h4 className="font-medium mb-2">Template Features:</h4>
              <ul className="space-y-1">
                <li>✅ Complete API integration</li>
                <li>✅ React hooks for data management</li>
                <li>✅ UI component library</li>
                <li>✅ TypeScript support</li>
                <li>✅ Error handling & validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Generation Ready:</h4>
              <ul className="space-y-1">
                <li>🤖 Standardized API responses</li>
                <li>🤖 Comprehensive documentation</li>
                <li>🤖 Example component patterns</li>
                <li>🤖 Utility function library</li>
                <li>🤖 Clean code structure</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border border-gray-200">
            <p className="text-gray-600 text-sm">
              The sample UI above demonstrates all template capabilities. 
              In production, this will be replaced with AI-generated interfaces 
              tailored to your specific Google Sheet data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Template by{' '}
            <a 
              href="https://sheetapps.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              SheetApps
            </a>
            {' '}- Optimized for AI-Generated UI
          </p>
        </div>
      </footer>
    </div>
  )
}

// Wrap the entire app in ErrorBoundary for better error handling
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithErrorBoundary