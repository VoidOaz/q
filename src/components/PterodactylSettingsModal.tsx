import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Key,
  Globe,
  Layers,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { PterodactylConfigFrontend, PterodactylTestResult } from '../types.ts';

interface PterodactylSettingsModalProps {
  onClose: () => void;
  onUpdated?: () => void;
}

export const PterodactylSettingsModal: React.FC<PterodactylSettingsModalProps> = ({
  onClose,
  onUpdated,
}) => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<'config' | 'nodes' | 'guide'>('config');

  const [panelUrl, setPanelUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');
  const [hasClientApiKey, setHasClientApiKey] = useState(false);
  const [nodeId, setNodeId] = useState('1');
  const [nestId, setNestId] = useState('1');
  const [eggId, setEggId] = useState('1');
  const [locationId, setLocationId] = useState('1');

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<PterodactylTestResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<any[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);

  // Fetch current Pterodactyl config
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/pterodactyl/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PterodactylConfigFrontend = await res.json();
        setPanelUrl(data.panelUrl || '');
        setHasApiKey(data.hasApiKey);
        setHasClientApiKey(data.hasClientApiKey);
        setNodeId(String(data.nodeId || 1));
        setNestId(String(data.nestId || 1));
        setEggId(String(data.eggId || 1));
        setLocationId(String(data.locationId || 1));
      }
    } catch (e) {
      console.error('Failed to load Pterodactyl settings:', e);
    }
  };

  const fetchNodes = async () => {
    setNodesLoading(true);
    try {
      const res = await fetch('/api/pterodactyl/nodes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNodes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch Pterodactyl nodes:', e);
    } finally {
      setNodesLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/pterodactyl/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          panelUrl: panelUrl.trim(),
          apiKey: apiKey.trim() || undefined,
          clientApiKey: clientApiKey.trim() || undefined,
          nodeId: Number(nodeId) || 1,
          nestId: Number(nestId) || 1,
          eggId: Number(eggId) || 1,
          locationId: Number(locationId) || 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess('Pterodactyl Panel integration configuration saved successfully.');
        setHasApiKey(Boolean(apiKey || hasApiKey));
        setHasClientApiKey(Boolean(clientApiKey || hasClientApiKey));
        setApiKey('');
        setClientApiKey('');
        if (onUpdated) onUpdated();
      } else {
        setError(data.error || 'Failed to save Pterodactyl settings.');
      }
    } catch {
      setError('Network error saving settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await fetch('/api/pterodactyl/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          panelUrl: panelUrl.trim(),
          apiKey: apiKey.trim() || undefined,
          clientApiKey: clientApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        fetchNodes();
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Connection test timed out.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Pterodactyl Panel API Integration</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                v1.x REST API
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Connect your VDS Pterodactyl daemon to automatically provision, manage, and monitor Minecraft servers.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 mt-4 mb-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            API Credentials & Endpoints
          </button>
          <button
            onClick={() => {
              setActiveTab('nodes');
              fetchNodes();
            }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'nodes'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Connected Nodes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
              {nodes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Setup Guide & API Keys
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'config' && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Panel URL */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Pterodactyl Panel URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={panelUrl}
                  onChange={(e) => setPanelUrl(e.target.value)}
                  placeholder="https://panel.fluxhost.com.tr or https://pterodactyl.yourdomain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
                <Globe className="w-4 h-4 text-neutral-600 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Application API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Application API Key (ptla_...) *
                </label>
                {hasApiKey && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Configured in Database
                  </span>
                )}
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? '•••••••••••••••• (Leave blank to keep current)' : 'ptla_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Used to provision Minecraft servers, assign allocations, and manage node resources.
              </p>
            </div>

            {/* Client API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Client API Key (ptlc_...) [Optional for Console/Files]
                </label>
                {hasClientApiKey && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Configured in Database
                  </span>
                )}
              </div>
              <input
                type="password"
                value={clientApiKey}
                onChange={(e) => setClientApiKey(e.target.value)}
                placeholder={hasClientApiKey ? '•••••••••••••••• (Leave blank to keep current)' : 'ptlc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
              />
            </div>

            {/* Node, Nest, Egg mapping */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Node ID</label>
                <input
                  type="number"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Nest ID (Minecraft)</label>
                <input
                  type="number"
                  value={nestId}
                  onChange={(e) => setNestId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Egg ID (Paper/Java)</label>
                <input
                  type="number"
                  value={eggId}
                  onChange={(e) => setEggId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Location ID</label>
                <input
                  type="number"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Diagnostics and Live Test Box */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Test Pterodactyl API Connection</span>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing API...' : 'Test API Connection'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded border text-xs ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/30 border-red-800 text-red-300'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex flex-wrap gap-3 mt-2 font-mono">
                    <span>Application API: {testResult.applicationApiOk ? '✅ OK' : '❌ Failed'}</span>
                    <span>Client API: {testResult.clientApiOk ? '✅ OK' : '⚠️ Not Configured'}</span>
                    {testResult.nodesCount !== undefined && <span>Nodes: {testResult.nodesCount}</span>}
                    {testResult.nestsCount !== undefined && <span>Nests: {testResult.nestsCount}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
              <span>Pterodactyl Daemon Nodes</span>
              <button
                onClick={fetchNodes}
                disabled={nodesLoading}
                className="flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${nodesLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Nodes</span>
              </button>
            </div>

            {nodes.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-lg border border-neutral-800">
                No active Pterodactyl nodes found or API credentials not yet verified.
              </div>
            ) : (
              <div className="space-y-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white text-sm">{node.name}</span>
                        <span className="text-neutral-500 font-mono text-[11px]">ID: #{node.id}</span>
                      </div>
                      <div className="text-neutral-400 font-mono text-[11px]">
                        FQDN / IP: {node.fqdn}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-neutral-400 space-y-0.5">
                      <div className="text-emerald-400 font-bold">{node.memory || 65536} MB RAM</div>
                      <div>{node.disk || 1000000} MB Disk</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" />
                How to generate Application API Key in Pterodactyl
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs">
                <li>Log in to your Pterodactyl Admin Panel as an Administrator.</li>
                <li>Navigate to the <strong>Admin Control Panel</strong> (cog icon in top right).</li>
                <li>Click <strong>Application API</strong> in the left sidebar menu.</li>
                <li>Click <strong>Create New</strong>, provide a description (e.g. <em>Flux Hosting Bridge</em>).</li>
                <li>
                  Grant <strong>Read & Write</strong> permissions for: <em>Servers</em>, <em>Nodes</em>, <em>Allocations</em>, <em>Users</em>, <em>Nests</em>.
                </li>
                <li>Copy the generated key starting with <code className="bg-neutral-800 px-1 py-0.5 rounded text-emerald-400 font-mono">ptla_...</code> into Flux Hosting.</li>
              </ol>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Hardware Allocation Rules
              </h3>
              <p className="text-neutral-400">
                Every server created by Flux Hosting is automatically allocated:
              </p>
              <div className="grid grid-cols-2 gap-2 text-neutral-200 font-mono text-[11px] pt-1">
                <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                  <span className="text-neutral-400">Memory:</span> 3072 MB (3 GB DDR4)
                </div>
                <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                  <span className="text-neutral-400">Disk:</span> 10240 MB (10 GB NVMe)
                </div>
                <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                  <span className="text-neutral-400">CPU Limit:</span> 200% (Xeon E5-2690 v4)
                </div>
                <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                  <span className="text-neutral-400">Network:</span> 1 Gbit/s Uplink
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
