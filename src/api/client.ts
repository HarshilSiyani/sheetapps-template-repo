// Smart SheetApps API Client
import type { 
  SheetConfig, 
  SheetRow, 
  UpdateOperation, 
  SearchQuery, 
  ApiResponse 
} from '../types';
import { getSheetConfig } from './config';

export class SheetClient {
  private config: SheetConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor() {
    this.config = getSheetConfig();
  }

  // Smart CRUD operations with change tracking
  async updateField(params: UpdateOperation): Promise<ApiResponse> {
    const { identifier, field, newValue, oldValue } = params;
    
    try {
      // Find the row by identifier
      const rowIndex = await this.findRowByIdentifier(identifier);
      const columnIndex = this.config.headers.indexOf(field);
      
      if (rowIndex === -1) {
        throw new Error(`Row with identifier ${identifier} not found`);
      }
      if (columnIndex === -1) {
        throw new Error(`Field ${field} not found in headers`);
      }
      
      // Validate old value if provided (optimistic locking)
      if (oldValue !== undefined) {
        const currentValue = await this.getCellValue(rowIndex, columnIndex);
        if (currentValue !== oldValue) {
          throw new Error('Optimistic lock failed: value was changed by another user');
        }
      }
      
      // Convert to sheet coordinates (A1 notation)
      const range = this.getA1Notation(rowIndex + 1, columnIndex); // +1 for 0-based to 1-based
      
      const response = await this.makeRequest('POST', `/sheets/${this.config.sheetId}/update`, {
        range,
        values: [[this.formatValue(newValue, this.config.dataTypes[field])]],
        valueInputOption: 'USER_ENTERED'
      });

      // Invalidate cache
      this.invalidateCache();
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addRow(data: Record<string, any>): Promise<ApiResponse> {
    try {
      // Map object keys to column order
      const values = this.config.headers.map(header => 
        this.formatValue(data[header] || '', this.config.dataTypes[header])
      );
      
      const response = await this.makeRequest('PUT', `/sheets/${this.config.sheetId}/update`, {
        range: 'A:A',
        values: [values],
        valueInputOption: 'USER_ENTERED'
      });

      // Invalidate cache
      this.invalidateCache();
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Note: Delete functionality not available in current SheetApps API
  // Users can manually delete rows in Google Sheets

  async bulkUpdate(changes: UpdateOperation[]): Promise<ApiResponse[]> {
    // Execute changes in parallel for efficiency
    const operations = await Promise.all(
      changes.map(change => this.updateField(change))
    );
    return operations;
  }

  // Data retrieval and search
  async getAllData(): Promise<SheetRow[]> {
    const cacheKey = 'all_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const response = await this.makeRequest('GET', `/sheets/${this.config.sheetId}/data?range=A1:Z1000`);
    
    if (!response.data?.values || response.data.values.length === 0) {
      throw new Error('No data found in the specified sheet. Please check your sheet ID and ensure the sheet contains data.');
    }

    const rows = this.transformRawDataToRows(response.data.values);
    
    // Cache the result
    this.cache.set(cacheKey, { data: rows, timestamp: Date.now() });
    
    return rows;
  }

  async search(query: SearchQuery): Promise<SheetRow[]> {
    const allData = await this.getAllData();
    return this.filterData(allData, query);
  }

  async getRowById(identifier: string | number): Promise<SheetRow | null> {
    const allData = await this.getAllData();
    const row = allData.find(row => 
      row._id === identifier || 
      row[this.config.headers[0]] === identifier
    );
    return row || null;
  }

  // Helper methods
  private async findRowByIdentifier(identifier: string | number): Promise<number> {
    const allData = await this.getAllData();
    
    return allData.findIndex(row => {
      // Check if identifier matches the ID or primary key (first column)
      return row._id === identifier || 
             row[this.config.headers[0]] === identifier ||
             Object.values(row).some(value => value === identifier);
    });
  }

  private async getCellValue(rowIndex: number, columnIndex: number): Promise<any> {
    const allData = await this.getAllData();
    if (rowIndex >= allData.length || columnIndex >= this.config.headers.length) {
      return null;
    }
    
    const header = this.config.headers[columnIndex];
    return allData[rowIndex][header];
  }

  private getA1Notation(row: number, col: number): string {
    const colLetter = this.numberToColumnLetter(col);
    return `${colLetter}${row}`;
  }

  private numberToColumnLetter(num: number): string {
    let result = '';
    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  private formatValue(value: any, dataType: string): string {
    if (value === null || value === undefined) return '';
    
    switch (dataType) {
      case 'number':
        return String(Number(value) || 0);
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      case 'email':
        return String(value).toLowerCase().trim();
      case 'boolean':
        return Boolean(value).toString();
      case 'url':
        return String(value).trim();
      default:
        return String(value);
    }
  }

  private transformRawDataToRows(rawData: string[][]): SheetRow[] {
    if (rawData.length === 0) return [];
    
    // Extract headers from first row and ensure they match config
    const sheetHeaders = rawData[0] || [];
    const dataRows = rawData.slice(1);
    
    // Auto-detect if sheet headers don't match config headers
    const effectiveHeaders = this.config.headers.length > 0 ? this.config.headers : sheetHeaders;
    
    return dataRows.map((row, index) => {
      const rowObject: SheetRow = {
        _id: row[0] || `row_${index + 1}`, // Use first column as ID or generate
        _rowIndex: index + 1, // 1-based row index (excluding header)
      };
      
      // Robust mapping that handles misaligned data
      effectiveHeaders.forEach((header, colIndex) => {
        // Get the cell value, handling array bounds
        let cellValue = '';
        if (colIndex < row.length) {
          cellValue = row[colIndex] || '';
        }
        
        // Apply intelligent type conversion
        rowObject[header] = this.smartTypeConversion(cellValue, header);
      });
      
      return rowObject;
    });
  }

  private filterData(data: SheetRow[], query: SearchQuery): SheetRow[] {
    if (!query.field && !query.value) return data;
    
    return data.filter(row => {
      const fieldValue = query.field ? row[query.field] : null;
      const searchValue = query.value;
      
      if (!fieldValue && !searchValue) return true;
      
      switch (query.operator) {
        case 'equals':
          return fieldValue === searchValue;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(searchValue).toLowerCase());
        case 'startsWith':
          return String(fieldValue).toLowerCase().startsWith(String(searchValue).toLowerCase());
        case 'greaterThan':
          return Number(fieldValue) > Number(searchValue);
        case 'lessThan':
          return Number(fieldValue) < Number(searchValue);
        default:
          return String(fieldValue).toLowerCase().includes(String(searchValue).toLowerCase());
      }
    });
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<ApiResponse> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return result.success ? {
        success: true,
        data: result.data
      } : {
        success: false,
        error: result.error
      };
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private invalidateCache(): void {
    this.cache.clear();
  }

  // Public utility methods
  getHeaders(): string[] {
    return [...this.config.headers];
  }

  getDataTypes(): Record<string, string> {
    return { ...this.config.dataTypes };
  }

  getFieldType(fieldName: string): string {
    return this.config.dataTypes[fieldName] || 'text';
  }


  // Simple type conversion for basic checkbox functionality
  private smartTypeConversion(value: string, columnName: string): any {
    if (!value || value.trim() === '') return '';
    
    const trimmedValue = value.trim();
    const lowerColumnName = columnName.toLowerCase();
    const lowerValue = trimmedValue.toLowerCase();
    
    // Basic boolean detection for checkbox columns only
    if (this.isBooleanColumn(lowerColumnName, lowerValue)) {
      return this.convertToBoolean(lowerValue);
    }
    
    // Return original value for everything else
    return trimmedValue;
  }
  
  private isBooleanColumn(columnName: string, value: string): boolean {
    const booleanColumnNames = ['done', 'completed', 'finished', 'active', 'visited'];
    const booleanValues = ['true', 'false', 'yes', 'no', 'y', 'n', '1', '0', 'done', 'completed'];
    
    return booleanColumnNames.some(name => columnName.includes(name)) || 
           booleanValues.includes(value);
  }
  
  private convertToBoolean(value: string): boolean {
    const truthyValues = ['true', 'yes', 'y', '1', 'done', 'completed', 'active', 'visited'];
    return truthyValues.includes(value);
  }

}