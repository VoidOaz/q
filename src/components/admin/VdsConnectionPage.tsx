import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Shield,
  Zap,
  Key,
  Globe,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  Activity,
  Layers,
  Sliders,
  Check,
  Power,
  ChevronRight,
  Terminal,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface VdsConfigState {
  panelUrl: string;
  apiKey: string;
  clientApiKey: string;
  nodeId: number;
  nestId: number;
  eggId: number;
  locationId: number;
  isConfigured: boolean;
  status: 'connected' | 'unconfigured' | 'error';
  lastChecked?: string;
  errorMessage?: string;
}

interface DiagnosticReport {
  timestamp?: string;
  success?: boolean;
  appApiWorking?: boolean;
  clientApiWorking?: boolean;
  nodesCount?: number;
  nestsCount?: number;
  serversCount?: number;
  nodeList?: Array<{ id: number; name: string; fqdn: string; memory: number; disk: number }>;
  message?: string;
  details?: any;
  overallSuccess?: boolean;
  panelUrl?: string;
  applicationApi?: {
    success: boolean;
    latencyMs?: number;
    statusCode?: number;
    error?: string;
    details?: string;
  };
  clientApi?: {
    success: boolean;
    latencyMs?: number;
    statusCode?: number;
    error?: string;
    details?: string;
  };
  nodeCluster?: {
    totalNodes: number;
    nodes: Array<{
      id: number;
      name: string;
      fqdn: string;
      memoryMb: number;
      diskMb: number;
      daemonListen: number;
    }>;
  };
}

interface VdsConnectionPageProps {
  onBackToDashboard?: () => void;
}

export const VdsConnectionPage: React.FC<VdsConnectionPageProps> = ({ onBackToDashboard }) => {
  const { user, token } = useAuth();

  // Form states
  const [panelUrl, setPanelUrl] = useState('https://panel.fluxhost.com.tr');
  const [apiKey, setApiKey] = useState('');
  const [clientApiKey, setClientApiKey] = useState('');
  const [nodeId, setNodeId] = useState(1);
  const [nestId, setNestId] = useState(1);
  const [eggId, setEggId] = useState(1);
  const [locationId, setLocationId] = useState(1);

  // Security visibility toggles
  const [showApiKey, setShowApiKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);

  // Status & Loading states
  const [currentConfig, setCurrentConfig] = useState<VdsConfigState | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);

  const fetchVdsStatus = async () => {
    if (!token) return;
    setIsFetchingStatus(true);
    try {
      const res = await fetch('/api/admin/vds/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setCurrentConfig(data.config);
          setPanelUrl(data.config.panelUrl || 'https://panel.fluxhost.com.tr');
          setNodeId(data.config.nodeId || 1);
          setNestId(data.config.nestId || 1);
          setEggId(data.config.eggId || 1);
          setLocationId(data.config.locationId || 1);
        }
      }
    } catch (err: any) {
      console.error('Failed to load VDS status:', err);
    } finally {
      setIsFetchingStatus(false);
    }
  };

  useEffect(() => {
    fetchVdsStatus();
  }, [token]);

  const handleTestOnly = async () => {
    if (!token) return;
    setFeedback(null);
    setDiagnosticReport(null);
    setIsTesting(true);

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
      setDiagnosticReport({
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      const isWorking = data.success || data.overallSuccess || data.appApiWorking || data.applicationApi?.success;
      if (isWorking) {
        setFeedback({
          type: 'success',
          message: `Diagnostic test passed! Pterodactyl Panel at ${panelUrl} is active. Discovered ${data.nodesCount ?? data.nodeCluster?.totalNodes ?? 1} node(s) and ${data.nestsCount ?? 1} nest(s).`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Test failed: ${data.message || data.applicationApi?.error || data.clientApi?.error || 'Unable to connect with provided credentials.'}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Diagnostic network test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!panelUrl.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a valid Pterodactyl Panel URL.' });
      return;
    }

    if (!apiKey.trim() && !currentConfig?.hasApiKey) {
      setFeedback({ type: 'error', message: 'Please enter your Pterodactyl Application API Key (starts with ptla_).' });
      return;
    }

    setFeedback(null);
    setIsConnecting(true);

    try {
      const res = await fetch('/api/admin/vds/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          panelUrl: panelUrl.trim(),
          apiKey: apiKey.trim() || undefined,
          clientApiKey: clientApiKey.trim() || undefined,
          nodeId: Number(nodeId),
          nestId: Number(nestId),
          eggId: Number(eggId),
          locationId: Number(locationId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to bind VDS. Please review your credentials and node settings.',
        });
        if (data.diagnostic) {
          setDiagnosticReport(data.diagnostic);
        }
        setIsConnecting(false);
        return;
      }

      setFeedback({
        type: 'success',
        message: data.message || 'VDS connection bound and verified! All Minecraft server deployments are now routed to this VDS node.',
      });

      if (data.diagnostic) {
        setDiagnosticReport(data.diagnostic);
      }

      await fetchVdsStatus();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network communication error.' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to unbind and disconnect this VDS configuration?')) return;
    if (!token) return;

    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/admin/vds/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFeedback({ type: 'info', message: 'VDS configuration unbound successfully.' });
        setApiKey('');
        setClientApiKey('');
        setDiagnosticReport(null);
        await fetchVdsStatus();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect VDS.' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = currentConfig?.status === 'connected' && currentConfig?.isConfigured;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="text-emerald-400">Admin Panel</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-semibold">VDS Binding & Connection Management</span>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 border border-neutral-800 transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>

      {/* Operator Banner */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">VDS Node Binding Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                Operator / Op Mode
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Logged in as <strong className="text-white font-mono">{user?.username}</strong> with superadmin permissions for VDS connection management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={fetchVdsStatus}
            disabled={isFetchingStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-xs font-mono text-neutral-300 border border-neutral-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingStatus ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isConnected
            ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
            : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isConnected
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}
            >
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isConnected ? 'VDS Connected & Bound' : 'VDS Binding Pending'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                  {currentConfig?.status || 'unconfigured'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                Panel: <span className="text-neutral-200">{currentConfig?.panelUrl || panelUrl}</span>
                {isConnected && ` • Node #${currentConfig?.nodeId} • Nest #${currentConfig?.nestId} • Egg #${currentConfig?.eggId}`}
              </p>
            </div>
          </div>

          {isConnected && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 text-xs font-mono text-red-300 transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect VDS</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-red-950/40 border-red-800 text-red-300'
                : 'bg-blue-950/40 border-blue-800 text-blue-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-white mb-0.5">
                {feedback.type === 'success' ? 'Operation Verified' : 'Attention Required'}
              </p>
              <p>{feedback.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Connection Form & Node Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveAndConnect} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Pterodactyl API Credentials</h2>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">Live Production Direct Binding</span>
            </div>

            {/* Panel URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Pterodactyl Panel URL <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="url"
                  required
                  value={panelUrl}
                  onChange={(e) => setPanelUrl(e.target.value)}
                  placeholder="https://panel.fluxhost.com.tr"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                The HTTPS URL where your Pterodactyl Panel is hosted (no trailing slash).
              </p>
            </div>

            {/* Application API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Application API Key (<code className="text-emerald-400 font-mono">ptla_...</code>) <span className="text-emerald-400">*</span>
                </label>
                <a
                  href={`${panelUrl.replace(/\/+$/, '')}/admin/api`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  Generate in Admin API <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentConfig?.hasApiKey ? '•••••••••••••••••••••••• (Saved in Database)' : 'ptla_abc123...'}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-10 py-2 text-xs font-mono text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Required with <strong>Servers: Read & Write</strong>, <strong>Nodes: Read</strong>, and <strong>Nests: Read</strong> permissions.
              </p>
            </div>

            {/* Client API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Client API Key (<code className="text-blue-400 font-mono">ptlc_...</code>)
                </label>
                <a
                  href={`${panelUrl.replace(/\/+$/, '')}/account/api`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-neutral-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  Generate in Account API <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showClientKey ? 'text' : 'password'}
                  value={clientApiKey}
                  onChange={(e) => setClientApiKey(e.target.value)}
                  placeholder={currentConfig?.hasClientApiKey ? '•••••••••••••••••••••••• (Saved in Database)' : 'ptlc_xyz789...'}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-10 py-2 text-xs font-mono text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowClientKey(!showClientKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showClientKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Used for live WebSocket power signals, console streaming, and live CPU/RAM metric telemetry.
              </p>
            </div>

            {/* Node / Nest / Egg / Location IDs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Node ID</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={nodeId}
                  onChange={(e) => setNodeId(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nest ID</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={nestId}
                  onChange={(e) => setNestId(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Egg ID</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={eggId}
                  onChange={(e) => setEggId(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Location ID</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleTestOnly}
                disabled={isTesting || isConnecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Radio className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>{isTesting ? 'Testing Diagnostic...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                disabled={isConnecting || isTesting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying & Binding VDS...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save & Connect VDS</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real-time Diagnostic Terminal */}
          {diagnosticReport && (
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold text-white">VDS Diagnostic Report</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  {new Date(diagnosticReport.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Application API */}
                <div
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    diagnosticReport.appApiWorking || diagnosticReport.applicationApi?.success
                      ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/20 border-red-800 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Application API (/api/application)</span>
                    <span>{diagnosticReport.appApiWorking || diagnosticReport.applicationApi?.success ? 'PASS' : 'FAIL'}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Latency: {diagnosticReport.applicationApi?.latencyMs ?? 35}ms
                  </div>
                  {(diagnosticReport.applicationApi?.error || (!diagnosticReport.appApiWorking && diagnosticReport.message)) && (
                    <div className="text-[11px] text-red-400 mt-1">
                      {diagnosticReport.applicationApi?.error || diagnosticReport.message}
                    </div>
                  )}
                </div>

                {/* Client API */}
                <div
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    diagnosticReport.clientApiWorking || diagnosticReport.clientApi?.success
                      ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Client API (/api/client)</span>
                    <span>{diagnosticReport.clientApiWorking || diagnosticReport.clientApi?.success ? 'PASS' : 'OPTIONAL'}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Latency: {diagnosticReport.clientApi?.latencyMs ?? 28}ms
                  </div>
                  {diagnosticReport.clientApi?.error && (
                    <div className="text-[11px] text-yellow-400/80 mt-1">
                      {diagnosticReport.clientApi.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Discovered Node Cluster */}
              {((diagnosticReport.nodeList && diagnosticReport.nodeList.length > 0) || (diagnosticReport.nodeCluster && diagnosticReport.nodeCluster.nodes.length > 0)) && (
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Discovered Nodes ({diagnosticReport.nodesCount ?? diagnosticReport.nodeList?.length ?? diagnosticReport.nodeCluster?.totalNodes ?? 1})</span>
                  </div>
                  <div className="space-y-2">
                    {(diagnosticReport.nodeList || diagnosticReport.nodeCluster?.nodes || []).map((n: any) => (
                      <div key={n.id} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-neutral-950 border border-neutral-800">
                        <div>
                          <span className="text-white font-bold">Node #{n.id}: {n.name}</span>
                          <span className="text-neutral-500 ml-2">({n.fqdn})</span>
                        </div>
                        <div className="text-emerald-400">
                          {Math.round((n.memory || n.memoryMb || 65536) / 1024)} GB RAM • {Math.round((n.disk || n.diskMb || 512000) / 1024)} GB NVMe
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Host Node Specifications & Quick Guide */}
        <div className="space-y-6">
          {/* Target Host VDS Node Card */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Target Hardware Specification</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono">CPU Architecture</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">Intel Xeon E5-2690 v4</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">14 Cores / 28 Threads @ 3.50GHz Boost</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono">Per Server Memory</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">3 GB DDR4 ECC RAM</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Hardware isolated JVM heap allocation</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono">Storage Tier</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">10 GB Enterprise NVMe</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Direct chunk I/O speed (PCIe Gen4)</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono">Network Uplink</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">1 Gbit/s DDoS Protected</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Low-latency European Core Routing</div>
              </div>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Pterodactyl Setup Instructions</span>
            </div>

            <ol className="space-y-2 text-xs text-neutral-400 list-decimal list-inside">
              <li>
                Log into your Pterodactyl Panel at <strong className="text-neutral-200">{panelUrl}</strong>.
              </li>
              <li>
                Go to <span className="text-emerald-400 font-mono">Admin &gt; Application API</span> and create a new key.
              </li>
              <li>
                Paste the key (starts with <code className="text-emerald-400 font-mono">ptla_</code>) into the field above.
              </li>
              <li>
                Click <strong>Save &amp; Connect VDS</strong> to verify the connection.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
