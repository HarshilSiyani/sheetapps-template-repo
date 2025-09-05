/**
 * Connection Status Component - Shows real Google Sheets API connection status
 */

import { useState } from 'react';
import { useConnectionTest } from '../hooks/useConnectionTest';
import { Button } from './ui';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Database,
  Key,
  Globe,
  Sheet
} from 'lucide-react';

export function ConnectionStatus() {
  const { 
    testResult, 
    loading, 
    quickStatus, 
    runFullTest, 
    runQuickTest,
    isConnected,
    connectionError,
    rowCount
  } = useConnectionTest();

  const [showDetails, setShowDetails] = useState(false);
  const [showFullDiagnostics, setShowFullDiagnostics] = useState(false);

  // const summary = getConnectionSummary();

  const getStatusIcon = (success: boolean, loading = false) => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
    return success 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Quick Status Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(isConnected, quickStatus === null)}
              <h3 className="font-medium text-gray-900">
                Google Sheets Connection
              </h3>
            </div>
            {isConnected && rowCount !== undefined && (
              <span className="text-sm text-gray-600">
                ({rowCount} rows)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={runQuickTest}
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="sm"
              icon={showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-2">
          {isConnected ? (
            <p className="text-sm text-green-700">
              ✅ Connected to Google Sheets API - Real data loaded
            </p>
          ) : (
            <div>
              <p className="text-sm text-red-700">
                ❌ Cannot connect to Google Sheets API
              </p>
              {connectionError && (
                <p className="text-xs text-red-600 mt-1">
                  {connectionError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Connection Details</h4>
            <Button
              onClick={runFullTest}
              loading={loading}
              variant="secondary"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
            >
              Run Full Diagnostics
            </Button>
          </div>

          {/* Quick Status Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                API Status: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Data Rows: {rowCount !== undefined ? rowCount : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sheet className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Real Data: {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Full Test Results */}
          {testResult && (
            <div className="border rounded-lg">
              <div 
                className="p-3 bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => setShowFullDiagnostics(!showFullDiagnostics)}
              >
                <h5 className="font-medium text-gray-900">
                  Full Diagnostic Results ({testResult.summary.passed}/{testResult.summary.totalTests} tests passed)
                </h5>
                {showFullDiagnostics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              
              {showFullDiagnostics && (
                <div className="p-3">
                  {/* Test Results */}
                  <div className="space-y-3">
                    {Object.entries(testResult.tests).map(([key, test]) => (
                      <div key={key} className="flex items-start gap-3">
                        {getStatusIcon(test.success)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {test.name}
                            </span>
                            <span className={`text-sm ${getStatusColor(test.success)}`}>
                              {test.success ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {test.message}
                          </p>
                          {test.error && (
                            <p className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                              Error: {test.error}
                            </p>
                          )}
                          {test.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer">
                                View Details
                              </summary>
                              <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostics Info */}
                  <div className="mt-4 pt-4 border-t">
                    <h6 className="font-medium text-gray-900 mb-2">Configuration</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">API URL:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs">
                          {testResult.diagnostics.apiUrl}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">API Key:</span>
                        <span className="ml-2 text-gray-600">
                          {testResult.diagnostics.hasApiKey ? '✅ Set' : '❌ Missing'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Sheet ID:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs">
                          {testResult.diagnostics.sheetId}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Headers:</span>
                        <span className="ml-2 text-gray-600">
                          {testResult.diagnostics.configuredHeaders?.join(', ') || 'None'}
                        </span>
                      </div>
                      {testResult.diagnostics.responseTime && (
                        <div>
                          <span className="font-medium">Response Time:</span>
                          <span className="ml-2 text-gray-600">
                            {testResult.diagnostics.responseTime}ms
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warnings */}
                  {testResult.summary.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Warnings</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {testResult.summary.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No Mock Data Notice */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Real Data Only
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This template never uses mock data. All data comes directly from your Google Sheets.
              {!isConnected && ' Please fix the connection to see your real data.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}