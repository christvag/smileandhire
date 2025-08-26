'use client';

import { useState, useEffect } from 'react';

interface DebugLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
  url?: string;
  status?: number;
}

export function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const requestUrl = typeof url === 'string' ? url : url.toString();
      
      addLog('info', `🌐 ${options?.method || 'GET'} ${requestUrl}`, {
        method: options?.method || 'GET',
        headers: options?.headers,
        body: options?.body
      }, requestUrl);

      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        
        let responseData;
        try {
          responseData = await clonedResponse.json();
        } catch {
          responseData = await clonedResponse.text();
        }

        addLog(
          response.ok ? 'success' : 'error',
          `${response.ok ? '✅' : '❌'} ${response.status} ${requestUrl}`,
          responseData,
          requestUrl,
          response.status
        );

        return response;
      } catch (error) {
        addLog('error', `💥 Network Error: ${requestUrl}`, error, requestUrl);
        throw error;
      }
    };

    // Intercept console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      addLog('error', `🔴 Console Error: ${args.join(' ')}`, args);
      originalConsoleError(...args);
    };

    // Intercept console warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      addLog('warn', `🟡 Console Warning: ${args.join(' ')}`, args);
      originalConsoleWarn(...args);
    };

    // Show debugger by default in dev
    setIsVisible(true);

    return () => {
      window.fetch = originalFetch;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const addLog = (type: DebugLog['type'], message: string, data?: any, url?: string, status?: number) => {
    const newLog: DebugLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      data,
      url,
      status
    };

    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const clearLogs = () => setLogs([]);

  const getTypeColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500 text-white';
      case 'warn': return 'bg-yellow-500 text-white';
      case 'success': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (process.env.NODE_ENV !== 'development' || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800"
        >
          🐛 Debug ({logs.length})
        </button>
      ) : (
        <div className="bg-gray-900 text-white rounded-lg shadow-xl max-w-lg w-96">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span>🐛</span>
              <span className="font-bold">Debug Console</span>
              <span className="text-gray-400">({logs.length})</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={clearLogs}
                className="text-gray-400 hover:text-white p-1"
                title="Clear logs"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white p-1"
                title="Minimize"
              >
                ➖
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white p-1"
                title="Close"
              >
                ❌
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">
                No debug logs yet...
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="border-b border-gray-800 p-2 hover:bg-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(log.type)}`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mb-1 break-words">
                    {log.message}
                  </div>
                  {log.status && (
                    <div className="text-xs text-gray-400">
                      Status: {log.status}
                    </div>
                  )}
                  {log.data && (
                    <details className="mt-1">
                      <summary className="text-gray-400 cursor-pointer hover:text-white">
                        📋 Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-700 text-xs">
            <div className="flex space-x-2">
              <button
                onClick={() => addLog('info', '🔄 Manual test log', { test: true })}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              >
                Test Log
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  addLog('info', '🔑 Auth Token Check', { 
                    hasToken: !!token, 
                    tokenLength: token?.length || 0 
                  });
                }}
                className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
              >
                Check Auth
              </button>
              <button
                onClick={() => {
                  addLog('info', '🌍 Environment Info', {
                    env: process.env.NODE_ENV,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                  });
                }}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              >
                Env Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}