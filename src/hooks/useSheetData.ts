/**
 * React Hooks for SheetApps - Optimized for AI-Generated UI
 * 
 * These hooks provide easy data management for AI-generated components.
 * All hooks include loading states, error handling, and caching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiManager } from '../api/apiManager';
import { sheetApi } from '../api/sheetApi';
import type { SheetRow, SearchQuery, UpdateOperation, ApiResponse } from '../types';

// ===== DATA FETCHING HOOKS =====

/**
 * Hook to get all sheet data with caching and loading states
 * 
 * Example usage in AI-generated components:
 * ```tsx
 * const { data, loading, error, refresh } = useSheetData();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return (
 *   <div>
 *     {data.map(row => (
 *       <div key={row._id}>{row.Name}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSheetData() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎣 useSheetData: Fetching data via ApiManager');
      const response = await apiManager.getAllData();
      
      if (response.success) {
        setData(response.data || []);
        setLastUpdated(response.timestamp || new Date().toISOString());
      } else {
        setError(response.error || 'Failed to load data');
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    console.log('🔄 useSheetData: Force refresh - clearing cache');
    apiManager.clearCache();
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isEmpty: data.length === 0,
    count: data.length
  };
}

/**
 * Hook to search/filter sheet data
 * 
 * Example usage:
 * ```tsx
 * const { searchData, loading, error, search, clearSearch } = useSearchData();
 * const [searchTerm, setSearchTerm] = useState('');
 * 
 * const handleSearch = () => {
 *   search({ field: 'Name', value: searchTerm, operator: 'contains' });
 * };
 * ```
 */
export function useSearchData() {
  const [searchData, setSearchData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: SearchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sheetApi.search(query);
      
      if (response.success) {
        setSearchData(response.data || []);
        setHasSearched(true);
      } else {
        setError(response.error || 'Search failed');
        setSearchData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search error');
      setSearchData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchData([]);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    searchData,
    loading,
    error,
    hasSearched,
    search,
    clearSearch,
    isEmpty: searchData.length === 0,
    count: searchData.length
  };
}

/**
 * Hook to get a single row by ID
 * 
 * Example usage:
 * ```tsx
 * const { row, loading, error, refetch } = useSheetRow('user123');
 * ```
 */
export function useSheetRow(identifier: string | number | null) {
  const [row, setRow] = useState<SheetRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRow = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sheetApi.getRow(id);
      
      if (response.success) {
        setRow(response.data || null);
      } else {
        setError(response.error || 'Failed to load row');
        setRow(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (identifier !== null && identifier !== undefined) {
      fetchRow(identifier);
    } else {
      setRow(null);
      setError(null);
    }
  }, [identifier, fetchRow]);

  return {
    row,
    loading,
    error,
    refetch: identifier !== null ? () => fetchRow(identifier) : () => {},
    exists: row !== null
  };
}

// ===== DATA MUTATION HOOKS =====

/**
 * Hook for adding new rows
 * 
 * Example usage:
 * ```tsx
 * const { addRow, loading, error, success } = useAddRow();
 * 
 * const handleSubmit = async (formData) => {
 *   const result = await addRow(formData);
 *   if (result.success) {
 *     // Show success message
 *     // Optionally refresh data
 *   }
 * };
 * ```
 */
export function useAddRow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addRow = useCallback(async (data: Record<string, any>): Promise<ApiResponse<boolean>> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await sheetApi.addRow(data);
      
      if (response.success) {
        setSuccess(true);
        // Clear cache to force refresh of data
        console.log('✅ useAddRow: Row added successfully, clearing cache');
        apiManager.clearCache();
      } else {
        setError(response.error || 'Failed to add row');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    addRow,
    loading,
    error,
    success,
    reset
  };
}

/**
 * Hook for updating fields
 * 
 * Example usage:
 * ```tsx
 * const { updateField, loading, error } = useUpdateField();
 * 
 * const handleStatusChange = (rowId, newStatus) => {
 *   updateField({
 *     identifier: rowId,
 *     field: 'Status',
 *     newValue: newStatus
 *   });
 * };
 * ```
 */
export function useUpdateField() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = useCallback(async (params: UpdateOperation): Promise<ApiResponse<boolean>> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await sheetApi.updateField(params);
      
      if (response.success) {
        setSuccess(true);
        // Clear cache to force refresh of data
        console.log('✅ useUpdateField: Field updated successfully, clearing cache');
        apiManager.clearCache();
      } else {
        setError(response.error || 'Failed to update field');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    updateField,
    loading,
    error,
    success,
    reset
  };
}

// ===== OPTIMISTIC UPDATE HOOK =====

/**
 * Hook for optimistic updates (immediate UI updates with rollback on error)
 * 
 * Example usage:
 * ```tsx
 * const { data, optimisticUpdate, isUpdating, error } = useOptimisticUpdate(initialData);
 * 
 * const toggleStatus = (rowId) => {
 *   optimisticUpdate(
 *     // Optimistic update function
 *     (prevData) => prevData.map(row => 
 *       row._id === rowId 
 *         ? { ...row, Status: row.Status === 'Active' ? 'Inactive' : 'Active' }
 *         : row
 *     ),
 *     // Server update function
 *     () => sheetApi.updateField({
 *       identifier: rowId,
 *       field: 'Status',
 *       newValue: data.find(r => r._id === rowId)?.Status === 'Active' ? 'Inactive' : 'Active'
 *     })
 *   );
 * };
 * ```
 */
export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<T>(initialData);

  const optimisticUpdate = useCallback(async (
    optimisticUpdateFn: (prevData: T) => T,
    serverUpdateFn: () => Promise<ApiResponse<any>>
  ) => {
    setIsUpdating(true);
    setError(null);
    
    // Store previous data for rollback
    previousDataRef.current = data;
    
    // Apply optimistic update
    const optimisticData = optimisticUpdateFn(data);
    setData(optimisticData);
    
    try {
      // Attempt server update
      const response = await serverUpdateFn();
      
      if (!response.success) {
        // Rollback on server error
        setData(previousDataRef.current);
        setError(response.error || 'Update failed');
      }
    } catch (err) {
      // Rollback on network/other error
      setData(previousDataRef.current);
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    optimisticUpdate,
    isUpdating,
    error,
    reset
  };
}

// ===== UTILITY HOOKS =====

/**
 * Hook to get sheet metadata and configuration
 */
export function useSheetConfig() {
  const [config] = useState(() => sheetApi.getSheetInfo());
  
  return {
    headers: sheetApi.getHeaders(),
    dataTypes: config.dataTypes,
    totalColumns: config.totalColumns,
    hasData: config.hasData,
    getFieldType: (fieldName: string) => sheetApi.getFieldType(fieldName)
  };
}

/**
 * Hook for form validation based on sheet data types
 */
export function useFormValidation() {
  const { dataTypes } = useSheetConfig();

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const fieldType = dataTypes[fieldName] || 'text';
    const stringValue = String(value || '').trim();

    if (!stringValue) {
      return null; // Empty values are handled elsewhere
    }

    switch (fieldType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue) ? null : 'Invalid email format';
      case 'number':
        return !isNaN(Number(stringValue)) ? null : 'Must be a valid number';
      case 'date':
        return !isNaN(Date.parse(stringValue)) ? null : 'Invalid date format';
      case 'url':
        try {
          new URL(stringValue);
          return null;
        } catch {
          return 'Invalid URL format';
        }
      default:
        return null;
    }
  }, [dataTypes]);

  const validateRow = useCallback((data: Record<string, any>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    Object.entries(data).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  }, [validateField]);

  return {
    validateField,
    validateRow,
    isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidNumber: (num: string) => !isNaN(Number(num)) && num.trim() !== '',
    isValidDate: (date: string) => !isNaN(Date.parse(date))
  };
}