/**
 * SheetApps API Client - Optimized for AI-Generated UI
 * 
 * This is the main API interface that AI-generated UI should use.
 * All functions return standardized responses with proper typing.
 */

import { SheetClient } from './client';
import type { 
  SheetRow, 
  UpdateOperation, 
  SearchQuery, 
  ApiResponse,
  SheetMetadata,
  DataStats,
  ValidationError
} from '../types';

export class SheetApi {
  private client: SheetClient;

  constructor() {
    this.client = new SheetClient();
  }

  // ===== DATA RETRIEVAL =====

  /**
   * Get all data from the sheet
   * @returns Promise<ApiResponse<SheetRow[]>>
   * 
   * Example response:
   * {
   *   success: true,
   *   data: [
   *     { _id: "1", _rowIndex: 1, Name: "John Doe", Email: "john@example.com" },
   *     { _id: "2", _rowIndex: 2, Name: "Jane Smith", Email: "jane@example.com" }
   *   ],
   *   message: "Successfully retrieved 2 rows",
   *   timestamp: "2024-01-15T10:30:00Z"
   * }
   */
  async getAllData(): Promise<ApiResponse<SheetRow[]>> {
    try {
      const data = await this.client.getAllData();
      
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No data found in the sheet. Please ensure your Google Sheet contains data and check your configuration.',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data,
        message: `Successfully retrieved ${data.length} rows from Google Sheets`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve data from Google Sheets';
      return {
        success: false,
        error: `Google Sheets API Error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get a single row by ID or identifier
   * @param identifier - Row ID or primary key value
   * @returns Promise<ApiResponse<SheetRow | null>>
   * 
   * Example response:
   * {
   *   success: true,
   *   data: { _id: "1", _rowIndex: 1, Name: "John Doe", Email: "john@example.com" },
   *   message: "Row found",
   *   timestamp: "2024-01-15T10:30:00Z"
   * }
   */
  async getRow(identifier: string | number): Promise<ApiResponse<SheetRow | null>> {
    try {
      const row = await this.client.getRowById(identifier);
      return {
        success: true,
        data: row,
        message: row ? 'Row found' : 'Row not found',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve row',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search/filter data
   * @param query - Search parameters
   * @returns Promise<ApiResponse<SheetRow[]>>
   * 
   * Example usage:
   * await sheetApi.search({ field: "Status", value: "Active", operator: "equals" });
   * await sheetApi.search({ field: "Name", value: "john", operator: "contains" });
   * 
   * Example response:
   * {
   *   success: true,
   *   data: [filtered rows],
   *   message: "Found 3 matching rows",
   *   timestamp: "2024-01-15T10:30:00Z"
   * }
   */
  async search(query: SearchQuery): Promise<ApiResponse<SheetRow[]>> {
    try {
      const results = await this.client.search(query);
      return {
        success: true,
        data: results,
        message: `Found ${results.length} matching rows`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===== DATA MODIFICATION =====

  /**
   * Add a new row to the sheet
   * @param data - Object with column names as keys
   * @returns Promise<ApiResponse<boolean>>
   * 
   * Example usage:
   * await sheetApi.addRow({ Name: "New User", Email: "new@example.com", Status: "Active" });
   * 
   * Example response:
   * {
   *   success: true,
   *   data: true,
   *   message: "Row added successfully",
   *   timestamp: "2024-01-15T10:30:00Z"
   * }
   */
  async addRow(data: Record<string, any>): Promise<ApiResponse<boolean>> {
    try {
      // Validate required fields
      const validation = this.validateRowData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          timestamp: new Date().toISOString()
        };
      }

      const result = await this.client.addRow(data);
      
      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Row added successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to add row',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add row',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update a single field in a row
   * @param params - Update parameters
   * @returns Promise<ApiResponse<boolean>>
   * 
   * Example usage:
   * await sheetApi.updateField({
   *   identifier: "john@example.com",
   *   field: "Status", 
   *   newValue: "Inactive",
   *   oldValue: "Active" // optional for conflict detection
   * });
   * 
   * Example response:
   * {
   *   success: true,
   *   data: true,
   *   message: "Field updated successfully",
   *   timestamp: "2024-01-15T10:30:00Z"
   * }
   */
  async updateField(params: UpdateOperation): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.client.updateField(params);
      
      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Field updated successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to update field',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update field',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update multiple fields at once
   * @param changes - Array of update operations
   * @returns Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>>
   * 
   * Example usage:
   * await sheetApi.bulkUpdate([
   *   { identifier: "1", field: "Status", newValue: "Complete" },
   *   { identifier: "2", field: "Priority", newValue: "High" }
   * ]);
   */
  async bulkUpdate(changes: UpdateOperation[]): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> {
    try {
      const results = await this.client.bulkUpdate(changes);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

      return {
        success: true,
        data: { successful, failed, errors },
        message: `Bulk update completed: ${successful} successful, ${failed} failed`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk update failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===== METADATA & CONFIGURATION =====

  /**
   * Get sheet metadata and configuration
   * @returns SheetMetadata & DataStats
   * 
   * Example response:
   * {
   *   headers: ["Name", "Email", "Status", "Priority"],
   *   dataTypes: { "Name": "text", "Email": "email", "Status": "text", "Priority": "text" },
   *   totalRows: 156,
   *   totalColumns: 4,
   *   hasData: true,
   *   sheetId: "1ABC...xyz",
   *   lastUpdated: "2024-01-15T10:30:00Z"
   * }
   */
  getSheetInfo(): SheetMetadata & DataStats {
    const headers = this.client.getHeaders();
    const dataTypes = this.client.getDataTypes();
    
    return {
      sheetId: '', // Will be populated from config
      range: 'A1:Z1000',
      rowCount: 0, // Will be updated when data is loaded
      columnCount: headers.length,
      headers,
      dataTypes,
      totalRows: 0,
      totalColumns: headers.length,
      hasData: headers.length > 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get available column headers
   * @returns string[]
   */
  getHeaders(): string[] {
    return this.client.getHeaders();
  }

  /**
   * Get data type for a specific field
   * @param fieldName - Column name
   * @returns string - Data type (text, email, number, date, boolean, url)
   */
  getFieldType(fieldName: string): string {
    return this.client.getFieldType(fieldName);
  }

  // ===== VALIDATION HELPERS =====

  /**
   * Validate row data before adding/updating
   * @param data - Row data to validate
   * @returns Validation result with errors if any
   */
  private validateRowData(data: Record<string, any>): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const headers = this.client.getHeaders();

    // Check for required fields (first column is usually required)
    if (headers.length > 0) {
      const primaryField = headers[0];
      if (!data[primaryField] || String(data[primaryField]).trim() === '') {
        errors.push({
          field: primaryField,
          message: `${primaryField} is required`,
          code: 'REQUIRED_FIELD'
        });
      }
    }

    // Validate data types
    Object.entries(data).forEach(([field, value]) => {
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        const fieldType = this.client.getFieldType(field);
        if (!this.isValidType(value, fieldType)) {
          errors.push({
            field,
            message: `${field} must be a valid ${fieldType}`,
            code: 'INVALID_TYPE'
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if value matches expected type
   */
  private isValidType(value: any, expectedType: string): boolean {
    const stringValue = String(value).trim();
    
    switch (expectedType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
      case 'number':
        return !isNaN(Number(stringValue)) && stringValue !== '';
      case 'date':
        return !isNaN(Date.parse(stringValue));
      case 'url':
        try {
          new URL(stringValue);
          return true;
        } catch {
          return false;
        }
      case 'boolean':
        return ['true', 'false', 'yes', 'no', '1', '0'].includes(stringValue.toLowerCase());
      default:
        return true; // text type accepts anything
    }
  }
}

// Export singleton instance
export const sheetApi = new SheetApi();
export default sheetApi;