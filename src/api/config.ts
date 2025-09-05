import type { SheetConfig } from '../types';

export const getSheetConfig = (): SheetConfig => {
  // Parse headers and data types from environment
  let headers: string[] = [];
  let dataTypes: Record<string, string> = {};
  
  try {
    const headersEnv = import.meta.env.VITE_SHEET_HEADERS;
    const dataTypesEnv = import.meta.env.VITE_SHEET_DATA_TYPES;
    
    headers = headersEnv ? JSON.parse(headersEnv) : [];
    dataTypes = dataTypesEnv ? JSON.parse(dataTypesEnv) : {};
  } catch (error) {
    console.warn('Failed to parse sheet configuration:', error);
  }

  return {
    apiBaseUrl: import.meta.env.VITE_SHEETAPPS_API_URL || 'http://localhost:3000/api/v1',
    apiKey: import.meta.env.VITE_SHEETAPPS_API_KEY || '',
    sheetId: import.meta.env.VITE_SHEET_ID || '',
    headers,
    dataTypes
  };
};

export const getAppConfig = () => {
  return {
    name: import.meta.env.VITE_APP_NAME || 'SheetApps App',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'AI-powered app from your Google Sheets',
    devMode: import.meta.env.VITE_DEV_MODE === 'true',
    projectId: import.meta.env.VITE_PROJECT_ID || '',
  };
};