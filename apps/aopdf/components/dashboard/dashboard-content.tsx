'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Key, BarChart3, Crown, CreditCard, Copy, Trash2, Plus, Loader2, CheckCircle2, Activity, Clock, FileText } from 'lucide-react';
import { appPath } from '@/lib/paths';

interface DashboardData {
  subscription: { plan: string; status: string; stripeCustomerId?: string | null };
  apiKeys: { id: string; name: string; prefix: string; lastUsed: string | null; createdAt: string }[];
  todayUsage: number;
  totalUsage: number;
  recentUsage: { id: string; tool: string; fileSize: number; status: string; createdAt: string }[];
}

export default function DashboardContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(appPath('/api/dashboard'));
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      // The request resolves asynchronously before it updates dashboard state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchDashboard();
    }
  }, [fetchDashboard, router, status]);

  const createApiKey = async () => {
    setCreatingKey(true);
    try {
      const res = await fetch(appPath('/api/api-keys'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'Default' }),
      });
      const json = await res.json();
      if (json?.key) {
        setShowNewKey(json.key);
        setNewKeyName('');
        fetchDashboard();
      }
    } catch (err: any) {
      console.error('API key creation error:', err);
    } finally {
      setCreatingKey(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      await fetch(appPath('/api/api-keys'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchDashboard();
    } catch (err: any) {
      console.error('Delete key error:', err);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(appPath('/api/stripe/portal'), { method: 'POST' });
      const json = await res.json();
      if (json?.url) window.location.href = json.url;
    } catch (err: any) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const plan = data?.subscription?.plan ?? 'free';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Dashboard</h1>
        <p className="text-zinc-400 text-sm">Welcome back, {session?.user?.name ?? session?.user?.email ?? 'User'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Crown, label: 'Current Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Activity, label: 'Today\'s Usage', value: `${data?.todayUsage ?? 0} ops`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: BarChart3, label: 'Total Operations', value: `${data?.totalUsage ?? 0}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Key, label: 'API Keys', value: `${data?.apiKeys?.length ?? 0} active`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat: any, i: number) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold text-zinc-200 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Subscription & Billing */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-400" /> Subscription</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">You are on the <span className="font-semibold text-zinc-200 capitalize">{plan}</span> plan.</p>
            <p className="text-xs text-zinc-500 mt-1">Status: <span className="text-emerald-400 capitalize">{data?.subscription?.status ?? 'active'}</span></p>
          </div>
          <div className="flex gap-3">
            {plan === 'free' && (
              <button onClick={() => router.push('/pricing')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25">
                Upgrade
              </button>
            )}
            {data?.subscription?.stripeCustomerId && (
              <button onClick={openBillingPortal} disabled={portalLoading} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-xl transition-colors border border-zinc-700 disabled:opacity-50">
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-400" /> API Keys</h2>
        {plan === 'free' ? (
          <p className="text-sm text-zinc-500">API access requires a Pro or Enterprise subscription. <button onClick={() => router.push('/pricing')} className="text-indigo-400 hover:text-indigo-300">Review plans</button></p>
        ) : (
          <div className="space-y-4">
            {showNewKey && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">New API Key Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-zinc-950 px-3 py-2 rounded-lg text-zinc-300 font-mono break-all">{showNewKey}</code>
                  <button onClick={() => { navigator?.clipboard?.writeText?.(showNewKey ?? ''); }} className="p-2 text-zinc-400 hover:text-zinc-200">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-emerald-400/70 mt-2">Copy this key now — it won&apos;t be shown again.</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e: any) => setNewKeyName(e.target?.value ?? '')}
                placeholder="Key name (optional)"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={createApiKey} disabled={creatingKey} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5">
                {creatingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Generate Key
              </button>
            </div>

            {(data?.apiKeys ?? []).length > 0 && (
              <div className="space-y-2">
                {(data?.apiKeys ?? []).map((key: any) => (
                  <div key={key.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{key?.name ?? 'Unnamed'}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{key?.prefix ?? ''}...****</p>
                    </div>
                    <button onClick={() => deleteApiKey(key.id)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-400" /> Recent Activity</h2>
        {(data?.recentUsage ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">No activity yet. Start processing PDFs to see your history here.</p>
        ) : (
          <div className="space-y-2">
            {(data?.recentUsage ?? []).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200 capitalize">{(log?.tool ?? 'unknown').replace(/-/g, ' ')}</p>
                    <p className="text-[11px] text-zinc-500">{log?.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${log?.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{log?.status ?? 'unknown'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
