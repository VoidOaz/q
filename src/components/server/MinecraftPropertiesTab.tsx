import React, { useState } from 'react';
import {
  Save,
  Sliders,
  FileCode,
  ShieldAlert,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { MinecraftServerInstance } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
  onRefresh: () => void;
}

export const MinecraftPropertiesTab: React.FC<Props> = ({ server, onRefresh }) => {
  const { token } = useAuth();
  const [props, setProps] = useState<Record<string, any>>(server.properties || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: string, value: any) => {
    setProps(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/servers/${server.id}/properties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ properties: props }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        onRefresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Minecraft Server Settings (server.properties)
          </h3>
          <p className="text-xs text-neutral-400">
            Changes take effect immediately upon next server restart.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-black font-bold text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            Game & World Settings
          </h4>

          {/* MOTD */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Server MOTD (Message of the Day)
            </label>
            <input
              type="text"
              value={props['motd'] || ''}
              onChange={(e) => handleChange('motd', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          {/* Gamemode */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Default Gamemode
            </label>
            <select
              value={props['gamemode'] || 'survival'}
              onChange={(e) => handleChange('gamemode', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="survival">Survival</option>
              <option value="creative">Creative</option>
              <option value="adventure">Adventure</option>
              <option value="spectator">Spectator</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Difficulty
            </label>
            <select
              value={props['difficulty'] || 'normal'}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="peaceful">Peaceful</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Max Player Slots
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={props['max-players'] || 20}
              onChange={(e) => handleChange('max-players', Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            Gameplay & Security Toggles
          </h4>

          {/* PVP */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div>
              <div className="text-xs font-medium text-white">Player vs Player (PvP)</div>
              <div className="text-[11px] text-neutral-500">Allow players to damage each other</div>
            </div>
            <input
              type="checkbox"
              checked={props['pvp'] !== false && props['pvp'] !== 'false'}
              onChange={(e) => handleChange('pvp', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Command Blocks */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div>
              <div className="text-xs font-medium text-white">Enable Command Blocks</div>
              <div className="text-[11px] text-neutral-500">Allow command block execution</div>
            </div>
            <input
              type="checkbox"
              checked={props['enable-command-block'] === true || props['enable-command-block'] === 'true'}
              onChange={(e) => handleChange('enable-command-block', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Allow Flight */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div>
              <div className="text-xs font-medium text-white">Allow Survival Flight</div>
              <div className="text-[11px] text-neutral-500">Prevent kick for flying/gliding mods</div>
            </div>
            <input
              type="checkbox"
              checked={props['allow-flight'] === true || props['allow-flight'] === 'true'}
              onChange={(e) => handleChange('allow-flight', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Online Mode */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div>
              <div className="text-xs font-medium text-white">Online Mode (Mojang Auth)</div>
              <div className="text-[11px] text-neutral-500">Disable for offline/cracked clients</div>
            </div>
            <input
              type="checkbox"
              checked={props['online-mode'] !== false && props['online-mode'] !== 'false'}
              onChange={(e) => handleChange('online-mode', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Hardcore Mode */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div>
              <div className="text-xs font-medium text-white">Hardcore Mode</div>
              <div className="text-[11px] text-neutral-500">Permadeath bans player on death</div>
            </div>
            <input
              type="checkbox"
              checked={props['hardcore'] === true || props['hardcore'] === 'true'}
              onChange={(e) => handleChange('hardcore', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
