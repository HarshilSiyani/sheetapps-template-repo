/**
 * Utility functions for AI-Generated SheetApps
 * 
 * These utilities provide common functionality that AI-generated components can use.
 */

import { format, parseISO, isValid } from 'date-fns';

// ===== DATA FORMATTING =====

/**
 * Format value based on its data type
 * @param value - Raw value from sheet
 * @param dataType - Expected data type
 * @returns Formatted display value
 * 
 * Example usage in AI components:
 * ```tsx
 * {formatValue(row.Price, 'currency')}
 * {formatValue(row.Date, 'date')}
 * ```
 */
export function formatValue(value: any, dataType: string = 'text'): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const stringValue = String(value);

  switch (dataType) {
    case 'email':
      return stringValue.toLowerCase();
    
    case 'number':
      const num = Number(stringValue);
      return isNaN(num) ? stringValue : num.toLocaleString();
    
    case 'currency':
      const currency = Number(stringValue);
      return isNaN(currency) 
        ? stringValue 
        : new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(currency);
    
    case 'percentage':
      const percent = Number(stringValue);
      return isNaN(percent) 
        ? stringValue 
        : `${(percent * 100).toFixed(1)}%`;
    
    case 'date':
      try {
        const date = parseISO(stringValue);
        return isValid(date) ? format(date, 'MMM dd, yyyy') : stringValue;
      } catch {
        return stringValue;
      }
    
    case 'datetime':
      try {
        const date = parseISO(stringValue);
        return isValid(date) ? format(date, 'MMM dd, yyyy hh:mm a') : stringValue;
      } catch {
        return stringValue;
      }
    
    case 'boolean':
      const boolValue = String(value).toLowerCase();
      const truthyValues = ['true', 'yes', 'y', '1', 'active', 'completed', 'done'];
      return truthyValues.includes(boolValue) ? 'Yes' : 'No';
    
    case 'url':
      return stringValue;
    
    default:
      return stringValue;
  }
}

/**
 * Get display color for status-like values
 * @param value - Status value
 * @returns Tailwind color class
 */
export function getStatusColor(value: string): string {
  const lowerValue = String(value).toLowerCase();
  
  if (['active', 'completed', 'success', 'approved', 'paid', 'done'].includes(lowerValue)) {
    return 'bg-green-100 text-green-800';
  }
  
  if (['pending', 'in progress', 'processing', 'review'].includes(lowerValue)) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  if (['inactive', 'failed', 'rejected', 'cancelled', 'error'].includes(lowerValue)) {
    return 'bg-red-100 text-red-800';
  }
  
  if (['draft', 'new', 'created'].includes(lowerValue)) {
    return 'bg-blue-100 text-blue-800';
  }
  
  return 'bg-gray-100 text-gray-800';
}

/**
 * Get priority color for priority values
 * @param value - Priority value
 * @returns Tailwind color class
 */
export function getPriorityColor(value: string): string {
  const lowerValue = String(value).toLowerCase();
  
  if (['high', 'urgent', 'critical'].includes(lowerValue)) {
    return 'bg-red-100 text-red-800';
  }
  
  if (['medium', 'normal'].includes(lowerValue)) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  if (['low', 'minor'].includes(lowerValue)) {
    return 'bg-green-100 text-green-800';
  }
  
  return 'bg-gray-100 text-gray-800';
}

// ===== DATA VALIDATION =====

/**
 * Check if value is empty (null, undefined, empty string, or whitespace)
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean and validate phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  
  return phone; // Return original if can't format
}

// ===== STRING UTILITIES =====

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return String(str)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (String(text).length <= maxLength) return String(text);
  return String(text).slice(0, maxLength) + '...';
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// ===== ARRAY UTILITIES =====

/**
 * Group array of objects by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple criteria
 */
export function sortBy<T>(array: T[], ...criteria: ((item: T) => any)[]): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aVal = criterion(a);
      const bVal = criterion(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Filter array with multiple conditions
 */
export function filterMultiple<T>(
  array: T[],
  filters: Record<string, any>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return true; // Skip empty filters
      }
      
      const itemValue = (item as any)[key];
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
}

// ===== DATE UTILITIES =====

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(targetDate)) return 'Invalid date';
  
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (Math.abs(diffInSeconds) < 60) {
    return 'Just now';
  } else if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 ? `${diffInMinutes} minutes ago` : `in ${Math.abs(diffInMinutes)} minutes`;
  } else if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 ? `${diffInHours} hours ago` : `in ${Math.abs(diffInHours)} hours`;
  } else if (Math.abs(diffInDays) < 30) {
    return diffInDays > 0 ? `${diffInDays} days ago` : `in ${Math.abs(diffInDays)} days`;
  } else {
    return format(targetDate, 'MMM dd, yyyy');
  }
}

/**
 * Check if date is within a range
 */
export function isDateInRange(
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return isValid(targetDate) && isValid(start) && isValid(end) &&
         targetDate >= start && targetDate <= end;
}

// ===== COLOR UTILITIES =====

/**
 * Generate consistent color from string (for avatars, charts, etc.)
 */
export function getColorFromString(str: string): string {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// ===== DEBOUNCE UTILITY =====

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// ===== EXPORT UTILITIES =====

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvHeader = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const escapedValue = String(value).replace(/"/g, '""');
      return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
    }).join(',')
  );
  
  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Download data as file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}