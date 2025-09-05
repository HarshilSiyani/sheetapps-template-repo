/**
 * Sample UI Component - Demonstrates template capabilities
 * This shows what AI-generated UIs might look like using the template
 */

import { useState } from 'react'
import { useSheetData, useAddRow, useUpdateField, useSearchData } from '../hooks/useSheetData'
import { Button, LoadingSpinner, EmptyState } from './ui'
import { formatValue, getStatusColor, truncate } from '../utils'
import { 
  Plus, 
  Search, 
  Edit2, 
  X, 
  Eye, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

export function SampleUI() {
  const { data, loading, error, refresh, count } = useSheetData()
  const { searchData, search, clearSearch, hasSearched, loading: searchLoading } = useSearchData()
  const { addRow, loading: addLoading, success: addSuccess, reset: resetAdd } = useAddRow()
  const { updateField, loading: updateLoading } = useUpdateField()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})

  const displayData = hasSearched ? searchData : data
  const headers = data.length > 0 ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : []

  // Initialize search field with first header
  if (!searchField && headers.length > 0) {
    setSearchField(headers[0])
  }

  const handleSearch = () => {
    if (searchTerm.trim() && searchField) {
      search({
        field: searchField,
        value: searchTerm,
        operator: 'contains'
      })
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addRow(formData)
    
    if (result.success) {
      setFormData({})
      setShowAddForm(false)
      resetAdd()
      refresh() // Refresh data to show new record
    }
  }

  const handleCellEdit = async (rowId: string, field: string, newValue: any) => {
    await updateField({
      identifier: rowId,
      field,
      newValue
    })
    setEditingCell(null)
    refresh() // Refresh to show updated data
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading sample data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-2xl mb-2">🚫</div>
        <h3 className="text-red-800 font-medium mb-2">Google Sheets API Error</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <div className="bg-red-100 rounded p-3 text-left mb-4">
          <p className="text-red-800 text-sm font-medium">❌ No Mock Data Available</p>
          <p className="text-red-600 text-xs mt-1">
            This template only works with real Google Sheets data. Please fix the API connection to continue.
          </p>
        </div>
        <Button onClick={refresh} variant="danger" size="sm">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real Google Sheets Data</h2>
          <p className="text-gray-600">
            Live data from your Google Sheets ({count} records) - No mock data ever used
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Record
          </Button>
          <Button
            onClick={refresh}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search & Filter
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {headers.length > 0 && (
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          )}
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${searchField}...`}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <Button
            onClick={handleSearch}
            loading={searchLoading}
            disabled={!searchTerm.trim()}
            icon={<Search className="w-4 h-4" />}
          >
            Search
          </Button>
          
          {hasSearched && (
            <Button
              onClick={() => {
                clearSearch()
                setSearchTerm('')
              }}
              variant="secondary"
              icon={<X className="w-4 h-4" />}
            >
              Clear
            </Button>
          )}
        </div>
        
        {hasSearched && (
          <div className="mt-2 text-sm text-gray-600">
            {searchData.length > 0 ? (
              `Found ${searchData.length} result${searchData.length !== 1 ? 's' : ''} for "${searchTerm}"`
            ) : (
              `No results found for "${searchTerm}"`
            )}
          </div>
        )}
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-medium text-gray-900 mb-4">Add New Record</h3>
          
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map(header => (
                <div key={header}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {header}
                  </label>
                  <input
                    type="text"
                    value={formData[header] || ''}
                    onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder={`Enter ${header.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
            
            {addSuccess && (
              <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
                Record added successfully!
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="submit"
                loading={addLoading}
                variant="primary"
              >
                Add Record
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({})
                  resetAdd()
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      {displayData.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {hasSearched ? 'Search Results' : 'All Records'} ({displayData.length})
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Filter className="w-4 h-4" />}
              >
                Filter
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {headers.map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    {headers.map(header => {
                      const isEditing = editingCell?.rowId === String(row._id) && editingCell?.field === header
                      const value = row[header]
                      
                      return (
                        <td
                          key={header}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                defaultValue={value}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellEdit(String(row._id), header, (e.target as HTMLInputElement).value)
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null)
                                  }
                                }}
                                onBlur={(e) => {
                                  handleCellEdit(String(row._id), header, e.target.value)
                                }}
                                autoFocus
                              />
                              {updateLoading && (
                                <div className="animate-spin w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
                              )}
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded group flex items-center gap-2"
                              onClick={() => setEditingCell({ rowId: String(row._id), field: header })}
                            >
                              {header.toLowerCase().includes('status') ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                                  {value || '-'}
                                </span>
                              ) : (
                                <span>{truncate(formatValue(value, 'text'), 30) || '-'}</span>
                              )}
                              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        className="opacity-60 hover:opacity-100"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : hasSearched ? (
        <EmptyState
          title="No search results"
          description={`No records found matching "${searchTerm}" in ${searchField}`}
          icon={<Search />}
          action={
            <Button onClick={() => { clearSearch(); setSearchTerm('') }}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <EmptyState
          title="No data available"
          description="Add some records to get started, or check your API configuration"
          icon={<Database />}
          action={
            <Button onClick={() => setShowAddForm(true)} icon={<Plus />}>
              Add First Record
            </Button>
          }
        />
      )}

      {/* Real Data Demo Features */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-medium text-green-900 mb-4">✅ Real Google Sheets Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-800 text-sm">
          <div>
            <h4 className="font-medium mb-2">Live Data Operations:</h4>
            <ul className="space-y-1">
              <li>✅ Real Google Sheets API</li>
              <li>✅ Live search and filtering</li>
              <li>✅ Real-time inline editing</li>
              <li>✅ Actual record creation</li>
              <li>✅ Persistent data changes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">No Mock Data:</h4>
            <ul className="space-y-1">
              <li>❌ No sample data fallback</li>
              <li>❌ No hardcoded values</li>
              <li>❌ No offline mode</li>
              <li>✅ API connection required</li>
              <li>✅ Real validation & errors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Production Ready:</h4>
            <ul className="space-y-1">
              <li>✅ Connection diagnostics</li>
              <li>✅ Error troubleshooting</li>
              <li>✅ Rate limit handling</li>
              <li>✅ Authentication validation</li>
              <li>✅ Data integrity checks</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded border border-green-200">
          <p className="text-green-800 text-sm">
            <strong>🎯 Guaranteed Real Data:</strong> This interface shows your actual Google Sheets data. 
            All changes are saved directly to your sheet. Perfect for AI generation of production-ready apps.
          </p>
        </div>
      </div>
    </div>
  )
}

// Fix Database import issue
function Database() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4-1.79 4-4M4 7h16M4 7l2-2h12l2 2" />
    </svg>
  )
}