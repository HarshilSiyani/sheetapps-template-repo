export interface SheetConfig {
  apiBaseUrl: string;
  apiKey: string;
  sheetId: string;
  headers: string[];
  dataTypes: Record<string, string>;
}

export interface SheetRow {
  _id: string | number;
  _rowIndex: number;
  [key: string]: any;
}

export interface UpdateOperation {
  identifier: string | number;
  field: string;
  newValue: any;
  oldValue?: any;
}

export interface SearchQuery {
  field?: string;
  value?: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface SheetMetadata {
  sheetId: string;
  range: string;
  rowCount: number;
  columnCount: number;
  lastUpdated?: string;
  headers: string[];
}

export interface AppMetadata {
  name: string;
  description: string;
  version: string;
  features: string[];
  generatedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DataStats {
  totalRows: number;
  totalColumns: number;
  dataTypes: Record<string, string>;
  hasData: boolean;
}