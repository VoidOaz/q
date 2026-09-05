import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Ban,
  UserX,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { MinecraftServerInstance } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
  onRefresh: () => void;
}

export const MinecraftPlayersTab: React.FC<Props> = ({ server, onRefresh }) => {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'online' | 'ops' | 'whitelist' | 'bans'>('online');

  // Input states
  const [opInput, setOpInput] = useState('');
  const [whitelistInput, setWhitelistInput] = useState('');
  const [banInput, setBanInput] = useState('');
  const [banReason, setBanReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayerAction = async (action: string, username: string, reason?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/players/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, username, reason }),
      });

      if (res.ok) {
        onRefresh();
        setOpInput('');
        setWhitelistInput('');
        setBanInput('');
        setBanReason('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'online', label: `Online Players (${server.onlinePlayersCount || 0})`, icon: Users },
          { id: 'ops', label: `Operators (${server.ops?.length || 0})`, icon: Shield },
          { id: 'whitelist', label: `Whitelist (${server.whitelist?.length || 0})`, icon: UserCheck },
          { id: 'bans', label: `Banned Players (${server.bannedPlayers?.length || 0})`, icon: Ban },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
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

      {/* 1. ONLINE PLAYERS SUBTAB */}
      {activeSubTab === 'online' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Current Active Players</h3>
            <span className="text-xs text-neutral-400 font-mono">
              Max Slots: {server.maxPlayers}
            </span>
          </div>

          {server.onlinePlayers?.length === 0 ? (
            <div className="p-8 rounded-xl bg-neutral-900/50 border border-neutral-800 text-center space-y-2">
              <Users className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">No players currently connected to the server.</p>
              <p className="text-xs text-neutral-500 font-mono">
                Connect via Minecraft: <strong className="text-emerald-400">{server.domain}:{server.port}</strong>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {server.onlinePlayers.map((player) => (
                <div
                  key={player.username}
                  className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center font-mono font-bold text-emerald-400">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{player.username}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">Ping: {player.ping}ms</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePlayerAction('kick', player.username)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 text-xs font-mono transition-all"
                    >
                      Kick
                    </button>
                    <button
                      onClick={() => handlePlayerAction('ban', player.username, 'Banned via control panel')}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 text-xs font-mono transition-all"
                    >
                      Ban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. OPERATORS SUBTAB */}
      {activeSubTab === 'ops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Server Operators (OPs)</h3>
              <p className="text-xs text-neutral-400">
                Operators have full administrator command permissions in-game.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (opInput.trim()) handlePlayerAction('op', opInput.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={opInput}
                onChange={(e) => setOpInput(e.target.value)}
                placeholder="Minecraft Username..."
                className="bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500"
              />
              <button
                type="submit"
                disabled={!opInput.trim() || isLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add OP
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {server.ops?.map((op) => (
              <div
                key={op}
                className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-white">{op}</span>
                </div>
                <button
                  onClick={() => handlePlayerAction('deop', op)}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                  title="Remove Operator Status"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WHITELIST SUBTAB */}
      {activeSubTab === 'whitelist' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-white">Whitelist Protection</div>
                <div className="text-xs text-neutral-400">
                  {server.whitelistEnabled
                    ? 'Whitelist is currently ACTIVE. Only approved players can join.'
                    : 'Whitelist is currently DISABLED. Anyone can join.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlayerAction('whitelist_toggle', 'system')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                server.whitelistEnabled
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300'
              }`}
            >
              {server.whitelistEnabled ? 'Whitelist ON' : 'Whitelist OFF'}
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (whitelistInput.trim()) handlePlayerAction('whitelist_add', whitelistInput.trim());
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={whitelistInput}
              onChange={(e) => setWhitelistInput(e.target.value)}
              placeholder="Add player to whitelist..."
              className="bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 flex-1 sm:flex-none sm:w-64"
            />
            <button
              type="submit"
              disabled={!whitelistInput.trim() || isLoading}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Whitelist Player
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {server.whitelist?.map((p) => (
              <div
                key={p}
                className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
              >
                <span className="text-xs font-mono text-white">{p}</span>
                <button
                  onClick={() => handlePlayerAction('whitelist_remove', p)}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BAN LIST SUBTAB */}
      {activeSubTab === 'bans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Banned Players</h3>
              <p className="text-xs text-neutral-400">Prevent malicious accounts from connecting.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (banInput.trim()) handlePlayerAction('ban', banInput.trim(), banReason.trim());
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                type="text"
                value={banInput}
                onChange={(e) => setBanInput(e.target.value)}
                placeholder="Username..."
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white w-32"
              />
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason (optional)..."
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white w-40"
              />
              <button
                type="submit"
                disabled={!banInput.trim() || isLoading}
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" />
                Ban Player
              </button>
            </form>
          </div>

          {server.bannedPlayers?.length === 0 ? (
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
              No players are currently banned on this server.
            </div>
          ) : (
            <div className="space-y-2">
              {server.bannedPlayers.map((ban) => (
                <div
                  key={ban.username}
                  className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-rose-400">{ban.username}</span>
                    <span className="text-neutral-400 ml-2">Reason: {ban.reason}</span>
                  </div>
                  <button
                    onClick={() => handlePlayerAction('unban', ban.username)}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono"
                  >
                    Pardon / Unban
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
