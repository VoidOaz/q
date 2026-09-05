import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Power,
  Terminal,
  Activity,
  Users,
  Sliders,
  Boxes,
  FolderTree,
  Compass,
  Copy,
  Check,
  Globe,
  Trash2,
  RefreshCcw,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { MinecraftServerInstance } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { MinecraftConsoleTab } from './server/MinecraftConsoleTab.tsx';
import { MinecraftOverviewTab } from './server/MinecraftOverviewTab.tsx';
import { MinecraftPlayersTab } from './server/MinecraftPlayersTab.tsx';
import { MinecraftPropertiesTab } from './server/MinecraftPropertiesTab.tsx';
import { MinecraftPluginsModsTab } from './server/MinecraftPluginsModsTab.tsx';
import { MinecraftFileManagerTab } from './server/MinecraftFileManagerTab.tsx';
import { MinecraftWorldsTab } from './server/MinecraftWorldsTab.tsx';

interface Props {
  serverId: string;
  onServerDeleted: () => void;
}

export const MinecraftServerDashboard: React.FC<Props> = ({ serverId, onServerDeleted }) => {
  const { token, refreshUser } = useAuth();
  const [server, setServer] = useState<MinecraftServerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'console' | 'overview' | 'players' | 'properties' | 'plugins' | 'files' | 'worlds'>('console');
  const [copied, setCopied] = useState(false);
  const [isPowering, setIsPowering] = useState(false);
  const [powerError, setPowerError] = useState<string | null>(null);

  const fetchServer = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServer(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServer();
    const interval = setInterval(fetchServer, 5000);
    return () => clearInterval(interval);
  }, [serverId, token]);

  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    setIsPowering(true);
    setPowerError(null);
    try {
      const res = await fetch(`/api/servers/${serverId}/power`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} server`);
      }

      await fetchServer();
    } catch (err: any) {
      console.error(err);
      setPowerError(err.message);
    } finally {
      setIsPowering(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!confirm(`Are you absolutely sure you want to delete Minecraft server "${server?.name}"? All world data and files will be permanently wiped.`)) return;

    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await refreshUser();
        onServerDeleted();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyAddress = () => {
    if (!server) return;
    navigator.clipboard.writeText(`${server.domain}:${server.port}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !server) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono text-neutral-400">Loading Minecraft Server Instance...</span>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (server.status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        );
      case 'starting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            STARTING...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-neutral-500" />
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Server Control Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Server Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {server.name}
              </h1>
              {getStatusBadge()}
            </div>

            {/* Address & Loader Tag */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono transition-all"
                title="Click to copy server address"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">{server.domain}</span>
                <span className="text-neutral-500">:{server.port}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" /> : <Copy className="w-3.5 h-3.5 text-neutral-500 ml-1" />}
              </button>

              <span className="px-2.5 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700/60 font-mono font-bold text-neutral-200 uppercase">
                {server.loader} {server.version}
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-neutral-800/50 text-neutral-400 font-mono hidden sm:inline">
                3 GB DDR4 • Xeon E5-2690 v4
              </span>
            </div>
          </div>

          {/* Right: Power Controls & Delete */}
          <div className="flex flex-wrap items-center gap-2">
            {server.status === 'offline' ? (
              <button
                onClick={() => handlePowerAction('start')}
                disabled={isPowering}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-black" />
                Start Server
              </button>
            ) : (
              <>
                <button
                  onClick={() => handlePowerAction('restart')}
                  disabled={isPowering}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-all border border-neutral-700 cursor-pointer"
                  title="Restart Minecraft server"
                >
                  <RotateCw className={`w-4 h-4 ${isPowering ? 'animate-spin' : ''}`} />
                  Restart
                </button>

                <button
                  onClick={() => handlePowerAction('stop')}
                  disabled={isPowering}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-all border border-neutral-700 cursor-pointer"
                  title="Gracefully stop Minecraft server"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>

                <button
                  onClick={() => handlePowerAction('kill')}
                  disabled={isPowering}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-semibold text-xs transition-all border border-rose-900/40 cursor-pointer"
                  title="Force terminate instance immediately"
                >
                  <Power className="w-4 h-4" />
                  Kill
                </button>
              </>
            )}

            <button
              onClick={handleDeleteServer}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-rose-950/40 text-neutral-500 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/40 transition-all text-xs"
              title="Delete Minecraft server"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {powerError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {powerError}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800 scrollbar-thin">
        {[
          { id: 'console', label: 'Console', icon: Terminal },
          { id: 'overview', label: 'Overview & Metrics', icon: Activity },
          { id: 'players', label: `Players (${server.onlinePlayersCount || 0})`, icon: Users },
          { id: 'properties', label: 'Server Properties', icon: Sliders },
          { id: 'plugins', label: 'Plugins & Mods', icon: Boxes },
          { id: 'files', label: 'File Manager', icon: FolderTree },
          { id: 'worlds', label: 'Worlds & Backups', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'console' && (
          <MinecraftConsoleTab server={server} onRefresh={fetchServer} />
        )}
        {activeTab === 'overview' && (
          <MinecraftOverviewTab server={server} />
        )}
        {activeTab === 'players' && (
          <MinecraftPlayersTab server={server} onRefresh={fetchServer} />
        )}
        {activeTab === 'properties' && (
          <MinecraftPropertiesTab server={server} onRefresh={fetchServer} />
        )}
        {activeTab === 'plugins' && (
          <MinecraftPluginsModsTab server={server} onRefresh={fetchServer} />
        )}
        {activeTab === 'files' && (
          <MinecraftFileManagerTab server={server} />
        )}
        {activeTab === 'worlds' && (
          <MinecraftWorldsTab server={server} onRefresh={fetchServer} />
        )}
      </div>
    </div>
  );
};
