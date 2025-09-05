/**
 * React Hook for API Connection Testing
 * 
 * Provides real-time connection status and detailed diagnostics
 */

import { useState, useEffect, useCallback } from 'react';
import { connectionTester, type ConnectionTestResult } from '../api/connectionTest';
import { apiManager } from '../api/apiManager';

export function useConnectionTest() {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickStatus, setQuickStatus] = useState<{
    connected: boolean;
    error?: string;
    rowCount?: number;
  } | null>(null);

  const runFullTest = useCallback(async () => {
    setLoading(true);
    try {
      const result = await connectionTester.runFullTest();
      setTestResult(result);
      return result;
    } catch (error) {
      const errorResult: ConnectionTestResult = {
        success: false,
        tests: {
          configValidation: {
            name: 'Configuration Validation',
            success: false,
            message: 'Test execution failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          apiReachability: {
            name: 'API Reachability',
            success: false,
            message: 'Could not run test',
          },
          authentication: {
            name: 'Authentication',
            success: false,
            message: 'Could not run test',
          },
          sheetAccess: {
            name: 'Sheet Access',
            success: false,
            message: 'Could not run test',
          },
          dataRetrieval: {
            name: 'Data Retrieval',
            success: false,
            message: 'Could not run test',
          }
        },
        summary: {
          totalTests: 5,
          passed: 0,
          failed: 5,
          warnings: []
        },
        diagnostics: {
          apiUrl: '',
          hasApiKey: false,
          sheetId: '',
          configuredHeaders: []
        },
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
      setTestResult(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const runQuickTest = useCallback(async () => {
    try {
      console.log('🔍 useConnectionTest: Using ApiManager for connection test');
      const result = await apiManager.quickConnectionTest();
      setQuickStatus(result);
      return result;
    } catch (error) {
      const errorResult = {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
      setQuickStatus(errorResult);
      return errorResult;
    }
  }, []);

  // Run quick test on mount
  useEffect(() => {
    runQuickTest();
  }, [runQuickTest]);

  const getConnectionSummary = useCallback(() => {
    if (!testResult) return null;

    const criticalTests = ['configValidation', 'authentication', 'sheetAccess', 'dataRetrieval'];
    const criticalFailures = criticalTests.filter(testName => !testResult.tests[testName as keyof typeof testResult.tests].success);

    return {
      status: testResult.success ? 'healthy' : 'error',
      message: testResult.success 
        ? `All ${testResult.summary.totalTests} tests passed successfully`
        : `${criticalFailures.length} critical issues found`,
      criticalFailures,
      warnings: testResult.summary.warnings,
      rowCount: testResult.diagnostics.rowCount,
      responseTime: testResult.diagnostics.responseTime
    };
  }, [testResult]);

  return {
    testResult,
    loading,
    quickStatus,
    runFullTest,
    runQuickTest,
    getConnectionSummary,
    isConnected: quickStatus?.connected === true,
    connectionError: quickStatus?.error,
    rowCount: quickStatus?.rowCount
  };
}

// Specialized hook for just checking if we're connected
export function useQuickConnectionStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    error?: string;
    rowCount?: number;
    checking: boolean;
  }>({
    connected: false,
    checking: true
  });

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      console.log('🔍 useQuickConnectionStatus: Checking via ApiManager');
      const result = await apiManager.quickConnectionTest();
      setStatus({
        connected: result.connected,
        error: result.error,
        rowCount: result.rowCount,
        checking: false
      });
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Connection check failed',
        checking: false
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const refresh = useCallback(async () => {
    console.log('🔄 useQuickConnectionStatus: Force refresh - clearing cache');
    apiManager.clearCache();
    await checkConnection();
  }, [checkConnection]);

  return {
    ...status,
    refresh
  };
}