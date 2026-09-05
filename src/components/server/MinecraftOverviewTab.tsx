import React, { useState, useEffect } from 'react';
import {
  Zap,
  Cpu,
  HardDrive,
  Globe,
  Gauge,
  Users,
  Copy,
  Check,
  Server,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MinecraftServerInstance, MinecraftServerMetrics } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
}

export const MinecraftOverviewTab: React.FC<Props> = ({ server }) => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<MinecraftServerMetrics | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  useEffect(() => {
    let interval: any = null;
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/servers/${server.id}/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (e) {}
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, [server.id, token]);

  const copyToClipboard = (text: string, type: 'domain' | 'ip') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else {
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const ramUsagePercent = metrics ? Math.round((metrics.ramUsedMb / 3072) * 100) : 0;
  const diskUsagePercent = metrics ? Math.round((metrics.diskUsedGb / 10) * 100) : 15;

  return (
    <div className="space-y-6">
      {/* Top Connection Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/20 rounded-xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              Public Minecraft Server Address
            </div>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-white flex items-center gap-2">
              <span>{server.domain}:{server.port}</span>
              <button
                onClick={() => copyToClipboard(`${server.domain}:${server.port}`, 'domain')}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs"
                title="Copy Server Domain"
              >
                {copiedDomain ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-3">
              <span>Direct Node IP: <strong className="text-neutral-300">{server.vdsNode.ip}:{server.port}</strong></span>
              <button
                onClick={() => copyToClipboard(`${server.vdsNode.ip}:${server.port}`, 'ip')}
                className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {copiedIp ? 'Copied IP!' : 'Copy IP'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="px-3 py-2 rounded-lg bg-neutral-950/80 border border-neutral-800 text-right">
              <div className="text-[11px] text-neutral-400 uppercase font-mono">TPS (Ticks/Sec)</div>
              <div className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <Activity className="w-4 h-4" />
                {server.status === 'online' ? `${metrics?.tps || '20.0'} / 20.0` : '0.0'}
              </div>
            </div>

            <div className="px-3 py-2 rounded-lg bg-neutral-950/80 border border-neutral-800 text-right">
              <div className="text-[11px] text-neutral-400 uppercase font-mono">Players Online</div>
              <div className="text-lg font-mono font-bold text-white flex items-center gap-1 justify-end">
                <Users className="w-4 h-4 text-blue-400" />
                {server.onlinePlayersCount} / {server.maxPlayers}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Hardware Resource Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3 GB DDR4 RAM GAUGE */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-400" />
              Allocated RAM
            </span>
            <span className="font-mono text-white font-bold">{ramUsagePercent}%</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold font-mono text-white">
              {metrics?.ramUsedMb || 0} <span className="text-xs text-neutral-400 font-normal">/ 3,072 MB</span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, ramUsagePercent))}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            3 GB DDR4 ECC Allocated
          </div>
        </div>

        {/* INTEL XEON E5-2690 v4 CPU */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-4 h-4 text-blue-400" />
              Xeon E5-2690 v4
            </span>
            <span className="font-mono text-white font-bold">{metrics?.cpuUsagePercent || 0}%</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold font-mono text-white">
              {metrics?.cpuUsagePercent || 0}% <span className="text-xs text-neutral-400 font-normal">load</span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, metrics?.cpuUsagePercent || 0))}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            2 Cores • Boost up to 3.50 GHz
          </div>
        </div>

        {/* 10 GB NVMe SSD */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-4 h-4 text-purple-400" />
              NVMe SSD Disk
            </span>
            <span className="font-mono text-white font-bold">{diskUsagePercent}%</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold font-mono text-white">
              {metrics?.diskUsedGb || 1.4} <span className="text-xs text-neutral-400 font-normal">/ 10.0 GB</span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, diskUsagePercent))}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            Fast NVMe I/O for smooth chunks
          </div>
        </div>

        {/* 1 GBIT NETWORK */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-4 h-4 text-emerald-400" />
              Network I/O
            </span>
            <span className="font-mono text-emerald-400 font-bold">1 Gbit/s</span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-mono text-neutral-300">
              In: <strong className="text-white">{metrics?.networkInMbps || 0} Mbps</strong> • Out: <strong className="text-white">{metrics?.networkOutMbps || 0} Mbps</strong>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div className="bg-emerald-400 h-full rounded-full w-2/5" />
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            Anti-DDoS Protected Port {server.port}
          </div>
        </div>
      </div>

      {/* Host Node & Instance Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Host VDS Infrastructure
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Host Node:</span>
              <span className="text-white font-bold">{server.vdsNode.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Processor:</span>
              <span className="text-white">Intel Xeon E5-2690 v4 (14C/28T)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Daemon Backend:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                {server.pterodactylIdentifier ? `Pterodactyl [${server.pterodactylIdentifier}]` : 'Pterodactyl VDS Bridge'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Server Software:</span>
              <span className="text-emerald-400 font-bold">{server.loader.toUpperCase()} {server.version}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-400">Java Runtime:</span>
              <span className="text-white">{server.javaVersion} (OpenJDK 64-Bit)</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Server Security & Ports
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Primary Game Port:</span>
              <span className="text-emerald-400 font-bold">{server.port} (TCP/UDP)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">RCON Console Port:</span>
              <span className="text-white">{server.rconPort}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Account Allocation:</span>
              <span className="text-white">1 / 1 Minecraft Server</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-400">EULA Agreement:</span>
              <span className="text-emerald-400 font-bold">Accepted (eula=true)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
