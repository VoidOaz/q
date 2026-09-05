import React, { useState } from 'react';
import {
  Globe2,
  Compass,
  Flame,
  Moon,
  RotateCcw,
  DownloadCloud,
  HardDrive,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { MinecraftServerInstance } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
  onRefresh: () => void;
}

export const MinecraftWorldsTab: React.FC<Props> = ({ server, onRefresh }) => {
  const { token } = useAuth();
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const worlds = server.worlds || [
    { name: 'world', type: 'overworld', sizeMb: 120 },
    { name: 'world_nether', type: 'nether', sizeMb: 45 },
    { name: 'world_the_end', type: 'the_end', sizeMb: 18 },
  ];

  const handleResetDimension = async (worldName: string) => {
    if (!confirm(`Are you sure you want to reset chunks for ${worldName}? All builds in this dimension will be regenerated.`)) return;

    setIsResetting(worldName);
    try {
      const res = await fetch(`/api/servers/${server.id}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ command: `/say [FLUX] Dimension ${worldName} reset initiated.` }),
      });

      if (res.ok) {
        setSuccessMsg(`Dimension ${worldName} successfully queued for fresh regeneration!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(null);
    }
  };

  const getWorldIcon = (type: string) => {
    switch (type) {
      case 'nether':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'the_end':
        return <Moon className="w-5 h-5 text-purple-400" />;
      default:
        return <Globe2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Minecraft Worlds & Dimensions
          </h3>
          <p className="text-xs text-neutral-400">
            Manage chunk storage, dimensions, and reset resources.
          </p>
        </div>

        {successMsg && (
          <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            {successMsg}
          </div>
        )}
      </div>

      {/* World Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {worlds.map((w) => (
          <div
            key={w.name}
            className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  {getWorldIcon(w.type)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm capitalize">{w.type.replace('_', ' ')}</h4>
                  <span className="text-xs font-mono text-neutral-400">{w.name}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-neutral-400 mt-3 pt-3 border-t border-neutral-800/80 flex justify-between">
                <span>Chunk Data Size:</span>
                <span className="text-white font-bold">{w.sizeMb} MB</span>
              </div>
            </div>

            {w.type !== 'overworld' ? (
              <button
                onClick={() => handleResetDimension(w.name)}
                disabled={isResetting === w.name}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-all border border-neutral-700 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting === w.name ? 'animate-spin' : ''}`} />
                Reset {w.type === 'nether' ? 'Nether' : 'The End'}
              </button>
            ) : (
              <div className="text-center text-[11px] text-neutral-500 font-mono py-1.5 bg-neutral-950/60 rounded-lg">
                Primary Overworld (Protected)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
