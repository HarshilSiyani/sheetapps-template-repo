/**
 * API Debugger Component - Shows API call statistics and helps identify rate limit issues
 */

import { useState, useEffect } from 'react';
import { apiManager } from '../api/apiManager';
import { Button } from './ui';
import { Activity, Trash2, BarChart3 } from 'lucide-react';

export function ApiDebugger() {
  const [stats, setStats] = useState(apiManager.getCacheStats());
  const [showDebugger, setShowDebugger] = useState(false);
  const [callLog, setCallLog] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiManager.getCacheStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for console logs to track API calls
  useEffect(() => {
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('ApiManager') || message.includes('📡') || message.includes('⏳') || message.includes('🔄')) {
        logs.push(`${new Date().toLocaleTimeString()}: ${message}`);
        setCallLog([...logs].slice(-20)); // Keep last 20 entries
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => setShowDebugger(true)}
          variant="ghost"
          size="sm"
          className="bg-black/20 backdrop-blur-sm text-white border-white/20"
          icon={<Activity className="w-4 h-4" />}
        >
          API Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="font-medium">API Debugger</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => {
              apiManager.clearCache();
              setCallLog([]);
            }}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            icon={<Trash2 className="w-3 h-3" />}
          />
          <Button
            onClick={() => setShowDebugger(false)}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 text-xs">Cache Entries</div>
            <div className="text-lg font-mono">{stats.cacheSize}</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 text-xs">Pending Requests</div>
            <div className="text-lg font-mono">{stats.pendingRequests}</div>
          </div>
        </div>

        {/* Cache Entries */}
        {stats.cacheEntries.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-1">Cached:</div>
            <div className="space-y-1">
              {stats.cacheEntries.map(entry => (
                <div key={entry} className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent API Calls */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Recent API Activity:</div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {callLog.length === 0 ? (
              <div className="text-xs text-gray-500">No recent activity</div>
            ) : (
              callLog.slice(-10).map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-300 bg-gray-800 p-1 rounded">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rate Limit Warning */}
        {stats.pendingRequests > 3 && (
          <div className="bg-red-900/30 text-red-300 text-xs p-2 rounded border border-red-700">
            ⚠️ High pending request count - potential rate limiting issue!
          </div>
        )}
      </div>
    </div>
  );
}