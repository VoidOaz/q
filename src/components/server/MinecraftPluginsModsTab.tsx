import React, { useState } from 'react';
import {
  Boxes,
  DownloadCloud,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
  ExternalLink,
  Search,
  Zap,
} from 'lucide-react';
import { MinecraftServerInstance } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
  onRefresh: () => void;
}

const PLUGIN_CATALOG = [
  {
    name: 'EssentialsX',
    description: 'The essential plugin suite for Minecraft servers with economy, teleports, warps, and moderation.',
    category: 'Essential',
    version: '2.20.1',
    author: 'EssentialsX Team',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia'],
  },
  {
    name: 'LuckPerms',
    description: 'Industry standard permissions plugin with web editor, groups, and prefixes.',
    category: 'Permissions',
    version: '5.4.102',
    author: 'Luck',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia', 'fabric', 'sponge', 'forge', 'neoforge', 'quilt'],
  },
  {
    name: 'WorldEdit',
    description: 'In-game Minecraft map editor and terraforming tool.',
    category: 'Building',
    version: '7.3.0',
    author: 'EngineHub',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia', 'fabric', 'forge', 'neoforge', 'quilt', 'sponge'],
  },
  {
    name: 'Vault',
    description: 'Standard permissions, chat, & economy API for Bukkit plugins.',
    category: 'API / Economy',
    version: '1.7.3',
    author: 'Sleakes',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia'],
  },
  {
    name: 'CoreProtect',
    description: 'Fast, efficient block logging, rollback and anti-grief tool.',
    category: 'Security',
    version: '22.4',
    author: 'Intelli',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia'],
  },
  {
    name: 'ViaVersion',
    description: 'Allows newer Minecraft client versions to connect to your server.',
    category: 'Compatibility',
    version: '5.0.0',
    author: 'ViaVersion',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia', 'fabric'],
  },
  {
    name: 'GeyserMC',
    description: 'Bedrock Edition bridge enabling iOS, Android, Xbox, PlayStation, and Switch players to join.',
    category: 'Crossplay',
    version: '2.3.0',
    author: 'GeyserMC',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia', 'fabric'],
  },
  {
    name: 'Chunky',
    description: 'Pre-generates world chunks quickly to prevent in-game lag spikes.',
    category: 'Optimization',
    version: '1.4.10',
    author: 'pop4959',
    forLoaders: ['paper', 'purpur', 'spigot', 'pufferfish', 'folia', 'fabric', 'forge'],
  },
  {
    name: 'Lithium',
    description: 'Modern optimization mod providing general-purpose physics and chunk optimizations.',
    category: 'Performance Mod',
    version: '0.12.7',
    author: 'CaffeineMC',
    forLoaders: ['fabric', 'quilt', 'neoforge'],
  },
  {
    name: 'FerriteCore',
    description: 'Significantly reduces Minecraft memory (RAM) usage.',
    category: 'Performance Mod',
    version: '6.0.1',
    author: 'malte0811',
    forLoaders: ['fabric', 'forge', 'neoforge', 'quilt'],
  },
];

export const MinecraftPluginsModsTab: React.FC<Props> = ({ server, onRefresh }) => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [installingName, setInstallingName] = useState<string | null>(null);

  const installedList = server.plugins || [];

  const handleInstall = async (item: any) => {
    setInstallingName(item.name);
    try {
      const res = await fetch(`/api/servers/${server.id}/plugins/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          version: item.version,
          description: item.description,
          author: item.author,
        }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInstallingName(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      const res = await fetch(`/api/servers/${server.id}/plugins/${pluginId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCatalog = PLUGIN_CATALOG.filter(c => {
    const matchesLoader = c.forLoaders.includes(server.loader);
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchesLoader && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-400" />
            {server.loader === 'fabric' || server.loader === 'forge' || server.loader === 'neoforge' || server.loader === 'quilt'
              ? 'Mods Manager & Catalog'
              : 'Plugins Manager & 1-Click Catalog'}
          </h3>
          <p className="text-xs text-neutral-400">
            Official compatible extensions for {server.loader.toUpperCase()} {server.version}.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extensions..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Installed List */}
      {installedList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            Installed ({installedList.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {installedList.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-neutral-900 border border-emerald-500/30 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {p.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    v{p.version} • {p.filename}
                  </div>
                </div>

                <button
                  onClick={() => handleUninstall(p.id)}
                  className="p-1.5 rounded bg-neutral-800 hover:bg-rose-900/30 text-neutral-400 hover:text-rose-400 text-xs transition-all"
                  title="Uninstall"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Catalog */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          Available 1-Click Install Catalog
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCatalog.map((item) => {
            const isInstalled = installedList.some(p => p.name.toLowerCase() === item.name.toLowerCase());
            return (
              <div
                key={item.name}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h5 className="font-bold text-white text-sm">{item.name}</h5>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {item.category} • v{item.version}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">By {item.author}</span>

                  <button
                    onClick={() => handleInstall(item)}
                    disabled={isInstalled || installingName === item.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isInstalled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                      </>
                    ) : installingName === item.name ? (
                      'Installing...'
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" /> 1-Click Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
