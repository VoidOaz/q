import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Send,
  Trash2,
  Download,
  Play,
  RotateCw,
  Clock,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { MinecraftServerInstance, MinecraftConsoleLog } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
  onRefresh: () => void;
}

const QUICK_COMMANDS = [
  { label: 'Check TPS', cmd: '/tps' },
  { label: 'Player List', cmd: '/list' },
  { label: 'Time Day', cmd: '/time set day' },
  { label: 'Clear Weather', cmd: '/weather clear' },
  { label: 'Reload Plugins', cmd: '/reload' },
  { label: 'View Seed', cmd: '/seed' },
];

export const MinecraftConsoleTab: React.FC<Props> = ({ server, onRefresh }) => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<MinecraftConsoleLog[]>(server.consoleLogs || []);
  const [commandInput, setCommandInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll live logs every 3 seconds
  useEffect(() => {
    let interval: any = null;
    const fetchConsoleLogs = async () => {
      try {
        const res = await fetch(`/api/servers/${server.id}/console`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        // silent
      }
    };

    fetchConsoleLogs();
    interval = setInterval(fetchConsoleLogs, 3000);
    return () => clearInterval(interval);
  }, [server.id, token]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSendCommand = async (cmdToSend?: string) => {
    const cmd = (cmdToSend || commandInput).trim();
    if (!cmd || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ command: cmd }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.logEntry) {
          setLogs(prev => [...prev, data.logEntry]);
        }
        setCommandInput('');
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.thread || 'Server'}/${(l.level || 'INFO').toUpperCase()}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flux-mc-${server.subdomain}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'warn':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'error':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      case 'server':
        return <span className="text-emerald-400 font-bold">[HOST]</span>;
      default:
        return <span className="text-blue-400">[INFO]</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Console Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Minecraft Server Web Console
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
            RCON Port: {server.rconPort}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 transition-all border ${
              autoScroll
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleDownloadLogs}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-mono flex items-center gap-1 transition-all"
            title="Download full log file"
          >
            <Download className="w-3.5 h-3.5" />
            Export Logs
          </button>

          <button
            onClick={() => setLogs([])}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 border border-neutral-700 text-xs font-mono flex items-center gap-1 transition-all"
            title="Clear console buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 min-h-[360px] max-h-[460px] overflow-y-auto space-y-1 shadow-inner scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-neutral-500 italic text-center py-12">
            No console output recorded yet. Server is {server.status.toUpperCase()}.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={log.id || index} className="leading-relaxed flex items-start gap-2 hover:bg-neutral-900/50 py-0.5 px-1 rounded">
              <span className="text-neutral-600 select-none text-[11px]">
                {log.timestamp}
              </span>
              <div className="flex-1 whitespace-pre-wrap break-all">
                {getLogBadge(log.level)}{' '}
                {log.thread && <span className="text-neutral-500">[{log.thread}]: </span>}
                <span className={log.level === 'error' ? 'text-rose-300' : log.level === 'warn' ? 'text-amber-300' : 'text-neutral-200'}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Quick Command Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider whitespace-nowrap">
          Quick Actions:
        </span>
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => handleSendCommand(qc.cmd)}
            disabled={server.status !== 'online' || isSending}
            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendCommand();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-sm select-none">
            /
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={server.status !== 'online'}
            placeholder={
              server.status === 'online'
                ? "Type a Minecraft command (e.g. op username, gamemode creative, whitelist add player, tps)..."
                : "Server is offline. Start the server to execute commands."
            }
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono placeholder-neutral-500 disabled:opacity-50 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={server.status !== 'online' || !commandInput.trim() || isSending}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Execute
        </button>
      </form>
    </div>
  );
};
