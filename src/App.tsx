import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Send, 
  Settings, 
  Code, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database,
  ChevronRight,
  ChevronDown,
  Copy,
  Terminal,
  Activity,
  History as HistoryIcon,
  Layers,
  Save,
  PlayCircle,
  AlertCircle,
  FileCode,
  BarChart3,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TestRun {
  name: string;
  duration: number;
  status: string;
  error: string | null;
  steps: {
    title: string;
    duration: number;
    category: string;
  }[];
}

interface SpecResult {
  success: boolean;
  testRuns: TestRun[];
  error?: string;
  details?: string;
}

interface SpecHistoryItem {
  id: string;
  timestamp: number;
  code: string;
  result: SpecResult;
}

const DEFAULT_SPEC = `import { test, expect } from '@playwright/test';

test('Get single post', async ({ request }) => {
  const response = await request.get('/posts/1');
  expect(response.status()).toBe(200);
});

test('Create a post', async ({ request }) => {
  const response = await request.post('/posts', {
    data: {
      title: 'Playwright Test',
      body: 'Testing API with Playwright',
      userId: 1,
    },
  });
  expect(response.status()).toBe(201);
});

test('Get all posts', async ({ request }) => {
  const response = await request.get('/posts');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.length).toBeGreaterThan(0);
});

test('Update post', async ({ request }) => {
  const response = await request.put('/posts/1', {
    data: {
      id: 1,
      title: 'Updated Title',
      body: 'Updated Body',
      userId: 1,
    },
  });
  expect(response.status()).toBe(200);
});`;

export default function App() {
  const [specCode, setSpecCode] = useState(DEFAULT_SPEC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpecResult | null>(null);
  const [history, setHistory] = useState<SpecHistoryItem[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'specs' | 'history'>('specs');
  const [error, setError] = useState<string | null>(null);

  // Load history from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('playwright_spec_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save history to LocalStorage
  useEffect(() => {
    localStorage.setItem('playwright_spec_history', JSON.stringify(history));
  }, [history]);

  const runSpec = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/run-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specCode })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute spec');
      }

      setResult(data);
      
      // Add to history
      const historyItem: SpecHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        code: specCode,
        result: data
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 20));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: SpecHistoryItem) => {
    setSpecCode(item.code);
    setResult(item.result);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161b22] px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Playwright Spec Runner</h1>
            <p className="text-xs text-gray-400 font-medium">v2.0.0 • Spec-based API Testing</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-gray-300">Runner Ready</span>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-800 bg-[#161b22] flex flex-col">
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setSidebarTab('specs')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                sidebarTab === 'specs' ? 'text-blue-400 bg-blue-500/5' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Templates
            </button>
            <button 
              onClick={() => setSidebarTab('history')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                sidebarTab === 'history' ? 'text-blue-400 bg-blue-500/5' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              History
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {sidebarTab === 'specs' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spec Templates</span>
                <div 
                  onClick={() => setSpecCode(DEFAULT_SPEC)}
                  className="p-3 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-blue-500/50 cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-blue-400">JSONPlaceholder API</p>
                  <p className="text-[10px] text-gray-500 mt-1">Standard CRUD tests for posts.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Runs</span>
                  <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 hover:text-red-300">Clear</button>
                </div>
                {history.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold ${item.result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {item.result.success ? 'PASSED' : 'FAILED'}
                      </span>
                      <span className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-300 truncate">Spec Run #{item.id.slice(-4)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#0f1115]">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            {/* Editor */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <section className="bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col flex-1 min-h-[500px]">
                <div className="p-4 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">spec.ts</h2>
                  </div>
                  <button 
                    onClick={runSpec}
                    disabled={loading}
                    className="h-9 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    {loading ? 'Running...' : 'Run Spec'}
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea 
                    value={specCode}
                    onChange={(e) => setSpecCode(e.target.value)}
                    className="absolute inset-0 w-full h-full p-6 bg-[#0d1117] font-mono text-sm text-blue-100/90 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </section>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Execution Error</p>
                    <p className="text-xs mt-1 opacity-80">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Results & Visualization */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <section className="bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col h-full min-h-[600px]">
                <div className="p-4 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Metrics & Results</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-8">
                  {!result && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 py-20">
                      <Layout className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-medium">No results to display</p>
                      <p className="text-xs mt-1">Run a spec to see response time metrics</p>
                    </div>
                  )}

                  {loading && (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-gray-400 mt-6 animate-pulse">Executing Playwright Suite...</p>
                    </div>
                  )}

                  {result && result.testRuns && (
                    <>
                      {/* Chart */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Response Times (ms)</h3>
                        <div className="h-64 w-full bg-[#0d1117] rounded-xl p-4 border border-gray-800">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.testRuns}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                stroke="#6b7280" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: '#6b7280' }}
                              />
                              <YAxis 
                                stroke="#6b7280" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: '#6b7280' }}
                              />
                              <Tooltip 
                                cursor={{ fill: '#1f2937' }}
                                contentStyle={{ 
                                  backgroundColor: '#161b22', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }}
                              />
                              <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                                {result.testRuns.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.status === 'passed' ? '#3b82f6' : '#ef4444'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Test List */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Test Summary</h3>
                        <div className="space-y-2">
                          {result.testRuns.map((test, i) => (
                            <div key={i} className="p-4 bg-[#0d1117] border border-gray-800 rounded-lg flex items-center justify-between group hover:border-gray-700 transition-all">
                              <div className="flex items-center gap-3">
                                {test.status === 'passed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-200">{test.name}</p>
                                  {test.error && <p className="text-[10px] text-red-400 mt-1 line-clamp-1">{test.error}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-blue-400">{test.duration}ms</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{test.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 bg-[#161b22] text-center z-20">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          Playwright Spec Runner • Metrics Dashboard • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
