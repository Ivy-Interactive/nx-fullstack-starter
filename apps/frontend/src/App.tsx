import { useEffect, useState } from 'react';
import type { Item, HealthResponse } from '@proj/shared';
import { Server, Database, CheckCircle2, Circle, Plus, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthResponse = await res.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch {
      setHealth(null);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data: Item[] = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        await fetchItems();
      }
    } catch (err) {
      console.error('Failed to create item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item: Item) => {
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, completed: !it.completed } : it))
        );
      }
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Nx Monorepo • Tendril Ready</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white mb-2">
          Ivy Interactive Monorepo
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Modern React 19 + Vite frontend communicating with Fastify backend and SQLite database layer.
        </p>
      </header>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Frontend Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Frontend</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            Port {window.location.port || '3000'}
          </div>
          <p className="text-xs text-slate-500">Vite • React 19 • Tailwind v4</p>
        </div>

        {/* Backend Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backend API</span>
            </div>
            {health ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Offline
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            Port {health?.port ?? '3001'}
          </div>
          <p className="text-xs text-slate-500">Fastify • TypeScript • Node 24</p>
        </div>

        {/* Database Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Database</span>
            </div>
            {health?.database === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Standby
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-white mb-1">SQLite</div>
          <p className="text-xs text-slate-500">better-sqlite3 • Drizzle ORM</p>
        </div>
      </div>

      {/* Main Content Area: Item List & Add Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Database Items</h2>
            <p className="text-xs text-slate-400">Live data persisted across sessions in SQLite</p>
          </div>
          <button
            onClick={() => {
              fetchHealth();
              fetchItems();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Task or item title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Items List */}
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No items found in database.</div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <li
                key={item.id}
                className="py-3 flex items-start gap-3 group hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item)}
                  className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
