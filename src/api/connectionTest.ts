/**
 * API Connection Testing Utility
 * 
 * This utility validates real Google Sheets API connections and provides
 * detailed diagnostic information for troubleshooting.
 */

import { getSheetConfig } from './config';

export interface ConnectionTestResult {
  success: boolean;
  tests: {
    configValidation: TestResult;
    apiReachability: TestResult;
    authentication: TestResult;
    sheetAccess: TestResult;
    dataRetrieval: TestResult;
  };
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: string[];
  };
  diagnostics: {
    apiUrl: string;
    hasApiKey: boolean;
    sheetId: string;
    configuredHeaders: string[];
    responseTime?: number;
    actualHeaders?: string[];
    rowCount?: number;
  };
  error?: string;
}

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export class ConnectionTester {
  private config = getSheetConfig();

  async runFullTest(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const tests = {
      configValidation: await this.testConfiguration(),
      apiReachability: await this.testApiReachability(),
      authentication: await this.testAuthentication(),
      sheetAccess: await this.testSheetAccess(),
      dataRetrieval: await this.testDataRetrieval(),
    };

    const responseTime = Date.now() - startTime;
    const testResults = Object.values(tests);
    const passed = testResults.filter(t => t.success).length;
    const failed = testResults.filter(t => !t.success).length;
    
    const warnings: string[] = [];
    if (responseTime > 5000) warnings.push('Slow API response time detected');
    if (!this.config.dataTypes || Object.keys(this.config.dataTypes).length === 0) {
      warnings.push('No data types configured - field validation may not work properly');
    }

    return {
      success: passed === testResults.length,
      tests,
      summary: {
        totalTests: testResults.length,
        passed,
        failed,
        warnings
      },
      diagnostics: {
        apiUrl: this.config.apiBaseUrl,
        hasApiKey: !!this.config.apiKey,
        sheetId: this.config.sheetId,
        configuredHeaders: this.config.headers,
        responseTime
      }
    };
  }

  private async testConfiguration(): Promise<TestResult> {
    const issues: string[] = [];
    
    if (!this.config.apiBaseUrl) {
      issues.push('Missing VITE_SHEETAPPS_API_URL');
    } else if (!this.config.apiBaseUrl.startsWith('http')) {
      issues.push('Invalid API URL format');
    }
    
    if (!this.config.apiKey) {
      issues.push('Missing VITE_SHEETAPPS_API_KEY');
    } else if (!this.config.apiKey.startsWith('sk_')) {
      issues.push('API key should start with "sk_"');
    }
    
    if (!this.config.sheetId) {
      issues.push('Missing VITE_SHEET_ID');
    }
    
    if (!this.config.headers || this.config.headers.length === 0) {
      issues.push('Missing VITE_SHEET_HEADERS configuration');
    }

    return {
      name: 'Configuration Validation',
      success: issues.length === 0,
      message: issues.length === 0 
        ? 'All configuration variables are present' 
        : `Configuration issues: ${issues.join(', ')}`,
      details: {
        apiUrl: this.config.apiBaseUrl ? 'Set' : 'Missing',
        apiKey: this.config.apiKey ? 'Set' : 'Missing', 
        sheetId: this.config.sheetId ? 'Set' : 'Missing',
        headers: this.config.headers?.length || 0
      },
      error: issues.length > 0 ? issues.join('; ') : undefined
    };
  }

  private async testApiReachability(): Promise<TestResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.config.apiBaseUrl.replace('/api/v1', '/health'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      return {
        name: 'API Reachability',
        success: response.status < 500,
        message: response.ok 
          ? 'API endpoint is reachable' 
          : `API returned status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        name: 'API Reachability',
        success: false,
        message: `Cannot reach API: ${errorMessage}`,
        error: errorMessage,
        details: {
          endpoint: this.config.apiBaseUrl
        }
      };
    }
  }

  private async testAuthentication(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/sheets/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return {
          name: 'Authentication',
          success: false,
          message: 'Invalid API key or authentication failed',
          error: 'Authentication failed',
          details: {
            status: response.status,
            response: responseData
          }
        };
      }

      if (response.status === 403) {
        return {
          name: 'Authentication',
          success: false,
          message: 'API key does not have required permissions',
          error: 'Insufficient permissions',
          details: {
            status: response.status,
            response: responseData
          }
        };
      }

      return {
        name: 'Authentication',
        success: response.ok,
        message: response.ok 
          ? 'Authentication successful' 
          : `Authentication failed with status ${response.status}`,
        details: {
          status: response.status,
          hasSheets: responseData.data?.sheets?.length > 0
        },
        error: !response.ok ? responseData.error || 'Authentication failed' : undefined
      };
    } catch (error) {
      return {
        name: 'Authentication',
        success: false,
        message: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testSheetAccess(): Promise<TestResult> {
    try {
      const url = `${this.config.apiBaseUrl}/sheets/${this.config.sheetId}/data?range=A1:Z1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return {
          name: 'Sheet Access',
          success: false,
          message: 'Sheet not found - check VITE_SHEET_ID',
          error: 'Sheet not found',
          details: {
            sheetId: this.config.sheetId,
            status: response.status
          }
        };
      }

      if (response.status === 403) {
        return {
          name: 'Sheet Access',
          success: false,
          message: 'No permission to access this sheet',
          error: 'Permission denied',
          details: {
            sheetId: this.config.sheetId,
            status: response.status
          }
        };
      }

      return {
        name: 'Sheet Access',
        success: response.ok,
        message: response.ok 
          ? 'Can access the specified sheet' 
          : `Cannot access sheet: ${responseData.error || 'Unknown error'}`,
        details: {
          sheetId: this.config.sheetId,
          status: response.status,
          hasData: !!responseData.data?.values
        },
        error: !response.ok ? responseData.error || 'Sheet access failed' : undefined
      };
    } catch (error) {
      return {
        name: 'Sheet Access',
        success: false,
        message: `Sheet access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testDataRetrieval(): Promise<TestResult> {
    try {
      const url = `${this.config.apiBaseUrl}/sheets/${this.config.sheetId}/data?range=A1:Z1000`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          name: 'Data Retrieval',
          success: false,
          message: `Failed to retrieve data: ${responseData.error || 'Unknown error'}`,
          error: responseData.error || 'Data retrieval failed',
          details: {
            status: response.status,
            response: responseData
          }
        };
      }

      const values = responseData.data?.values || [];
      const actualHeaders = values.length > 0 ? values[0] : [];
      const dataRows = values.slice(1);

      // Check if configured headers match actual headers
      const headerMismatch = this.config.headers.length > 0 && 
        JSON.stringify(this.config.headers) !== JSON.stringify(actualHeaders);

      const warnings: string[] = [];
      if (headerMismatch) {
        warnings.push(`Header mismatch detected. Configured: ${JSON.stringify(this.config.headers)}, Actual: ${JSON.stringify(actualHeaders)}`);
      }
      if (dataRows.length === 0) {
        warnings.push('No data rows found in sheet');
      }

      return {
        name: 'Data Retrieval',
        success: true,
        message: `Retrieved ${dataRows.length} rows of data`,
        details: {
          totalRows: values.length,
          headerRows: 1,
          dataRows: dataRows.length,
          configuredHeaders: this.config.headers,
          actualHeaders: actualHeaders,
          headerMismatch,
          warnings
        }
      };
    } catch (error) {
      return {
        name: 'Data Retrieval',
        success: false,
        message: `Data retrieval test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Quick connection test for UI status
  async quickTest(): Promise<{ connected: boolean; error?: string; rowCount?: number }> {
    try {
      const url = `${this.config.apiBaseUrl}/sheets/${this.config.sheetId}/data?range=A1:Z10`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          connected: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const responseData = await response.json();
      const values = responseData.data?.values || [];
      
      return {
        connected: true,
        rowCount: Math.max(0, values.length - 1) // Subtract header row
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

// Export singleton instance
export const connectionTester = new ConnectionTester();