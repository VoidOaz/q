import React, { useState, useEffect } from 'react';
import {
  Server,
  Zap,
  Box,
  Layers,
  Cpu,
  Flame,
  Hammer,
  Gauge,
  Compass,
  Wrench,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  HardDrive,
  Globe,
  ShieldCheck,
  ExternalLink,
  DownloadCloud,
  Check,
  AlertTriangle,
  Loader2,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { MINECRAFT_LOADERS, ALL_MINECRAFT_VERSIONS, MinecraftLoader, LoaderInfo, MinecraftVersionItem } from '../../server/minecraftLoaders.ts';
import { MinecraftServerInstance } from '../types.ts';

interface Props {
  onServerCreated: (server: MinecraftServerInstance) => void;
}

export const CreateMinecraftServerWizard: React.FC<Props> = ({ onServerCreated }) => {
  const { token, refreshUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [serverName, setServerName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedLoader, setSelectedLoader] = useState<MinecraftLoader>('paper');
  const [selectedVersion, setSelectedVersion] = useState<string>('1.21.4');

  // Filter states
  const [loaderFilter, setLoaderFilter] = useState<'all' | 'performance' | 'modded' | 'vanilla'>('all');
  const [versionSearch, setVersionSearch] = useState('');
  const [versionCategory, setVersionCategory] = useState<'all' | 'latest' | 'modern' | 'stable' | 'classic'>('all');

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Auto-format subdomain from name
  useEffect(() => {
    const formatted = serverName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 24);
    setSubdomain(formatted);
  }, [serverName]);

  const selectedLoaderObj = MINECRAFT_LOADERS.find(l => l.id === selectedLoader) || MINECRAFT_LOADERS[0];
  const selectedVersionObj = ALL_MINECRAFT_VERSIONS.find(v => v.version === selectedVersion) || ALL_MINECRAFT_VERSIONS[0];

  // Filtered loaders
  const filteredLoaders = MINECRAFT_LOADERS.filter(loader => {
    if (loaderFilter === 'performance') return loader.isPluginCompatible && loader.id !== 'vanilla';
    if (loaderFilter === 'modded') return loader.isModCompatible;
    if (loaderFilter === 'vanilla') return loader.id === 'vanilla';
    return true;
  });

  // Filtered versions compatible with selected loader
  const filteredVersions = ALL_MINECRAFT_VERSIONS.filter(v => {
    const matchesSearch = v.version.toLowerCase().includes(versionSearch.toLowerCase());
    const matchesCategory = versionCategory === 'all' || v.releaseCategory === versionCategory;
    const matchesLoader = v.supportedLoaders.includes(selectedLoader);
    return matchesSearch && matchesCategory && matchesLoader;
  });

  // Handle Deploy
  const handleDeploy = async () => {
    if (!subdomain || subdomain.length < 3) {
      alert('Please enter a valid server name with at least 3 characters.');
      return;
    }

    setStep(4);
    setIsDeploying(true);
    setDeployError(null);
    setDeployStep(1);
    setDeployLogs([
      `[Flux Installer] Connecting to dedicated Host Node (Intel Xeon E5-2690 v4)...`,
      `[Flux Installer] Allocating fixed resources: 3 GB DDR4 RAM, 10 GB NVMe, 1 Gbit Port...`,
    ]);

    try {
      // Step 2 Log
      setTimeout(() => {
        setDeployStep(2);
        setDeployLogs(prev => [
          ...prev,
          `[Flux Installer] Querying official repository for ${selectedLoader.toUpperCase()} version ${selectedVersion}...`,
          `[Flux Installer] Fetching official server binary artifact...`,
        ]);
      }, 900);

      // Step 3 Log
      setTimeout(() => {
        setDeployStep(3);
        setDeployLogs(prev => [
          ...prev,
          `[Flux Installer] Writing eula.txt (eula=true)...`,
          `[Flux Installer] Generating optimized server.properties with Aikar's JVM flags...`,
          `[Flux Installer] Binding domain: ${subdomain}.fluxhost.com.tr`,
        ]);
      }, 1900);

      const res = await fetch('/api/servers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: serverName.trim(),
          loader: selectedLoader,
          version: selectedVersion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to deploy Minecraft server');
      }

      setDeployStep(4);
      setDeployLogs(prev => [
        ...prev,
        `[Flux Installer] Minecraft server instance ready on port ${data.port}!`,
        `[Flux Host] Starting OpenJDK 21 LTS 64-bit Server VM...`,
        `[Flux Host] Server status: ONLINE`,
      ]);

      await refreshUser();

      setTimeout(() => {
        onServerCreated(data);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setDeployError(err.message || 'Deployment error occurred');
      setIsDeploying(false);
    }
  };

  const getLoaderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Scroll': return <Zap className="w-5 h-5" style={{ color }} />;
      case 'Zap': return <Zap className="w-5 h-5" style={{ color }} />;
      case 'Layers': return <Layers className="w-5 h-5" style={{ color }} />;
      case 'Hammer': return <Hammer className="w-5 h-5" style={{ color }} />;
      case 'Flame': return <Flame className="w-5 h-5" style={{ color }} />;
      case 'Box': return <Box className="w-5 h-5" style={{ color }} />;
      case 'Cpu': return <Cpu className="w-5 h-5" style={{ color }} />;
      case 'Gauge': return <Gauge className="w-5 h-5" style={{ color }} />;
      case 'Compass': return <Compass className="w-5 h-5" style={{ color }} />;
      case 'Wrench': return <Wrench className="w-5 h-5" style={{ color }} />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" style={{ color }} />;
      default: return <Server className="w-5 h-5" style={{ color }} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Creation Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            VDS Host Node Online: Intel Xeon E5-2690 v4
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Create Your Minecraft Server
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Allocated dedicated instance (3 GB DDR4 RAM, 10 GB NVMe, 1 Gbit Network) • 1 Server per account
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          {[
            { num: 1, label: 'Name' },
            { num: 2, label: 'Loader' },
            { num: 3, label: 'Version' },
            { num: 4, label: 'Deploy' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  step === s.num
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                    : step > s.num
                    ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden md:inline ${step === s.num ? 'text-white' : 'text-neutral-500'}`}>
                {s.label}
              </span>
              {s.num < 4 && <div className="w-4 h-px bg-neutral-800" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SERVER NAME SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-1">
              1. Choose Your Server Name & Subdomain
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              Your server will be instantly accessible globally through your custom Flux domain.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
                  Server Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="e.g. Hypixel SMP, Survival Realm, CraftWorld"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-4 py-3 text-white placeholder-neutral-500 text-sm transition-all"
                    maxLength={30}
                    autoFocus
                  />
                </div>
              </div>

              {/* Subdomain Preview Banner */}
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Server Public Address:</div>
                    <div className="text-sm font-mono font-bold text-white flex items-center gap-1.5">
                      <span className="text-emerald-400">{subdomain || 'yourserver'}</span>
                      <span className="text-neutral-400">.fluxhost.com.tr</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium ${
                      subdomain.length >= 3
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {subdomain.length >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Min 3 chars'}
                    {subdomain.length >= 3 ? 'Valid Domain' : 'Required'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guaranteed Hardware Specs Allocation Card */}
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Guaranteed Hardware Allocation per Server
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> RAM Memory
                </div>
                <div className="text-lg font-bold font-mono text-white">3 GB DDR4</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">3072 MB ECC Allocated</div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU Processor
                </div>
                <div className="text-lg font-bold font-mono text-white">Xeon E5-2690 v4</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">High single-core boost</div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Storage
                </div>
                <div className="text-lg font-bold font-mono text-white">10 GB NVMe</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Ultra-fast chunk read/write</div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Network
                </div>
                <div className="text-lg font-bold font-mono text-white">1 Gbit/s</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Low-latency DDOS protected</div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (subdomain.length < 3) {
                  alert('Please provide a server name with at least 3 valid characters.');
                  return;
                }
                setStep(2);
              }}
              disabled={subdomain.length < 3}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              Continue to Loader Selection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOADER SELECTION SCREEN */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                2. Select Minecraft Loader
              </h2>
              <p className="text-neutral-400 text-sm">
                Choose your server architecture (all 11 official loaders supported).
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 self-start sm:self-auto">
              {[
                { id: 'all', label: 'All (11)' },
                { id: 'performance', label: 'Plugins / Bukkit' },
                { id: 'modded', label: 'Modded' },
                { id: 'vanilla', label: 'Vanilla' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLoaderFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    loaderFilter === f.id
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of All 11 Loaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoaders.map((loader) => {
              const isSelected = selectedLoader === loader.id;
              return (
                <div
                  key={loader.id}
                  onClick={() => setSelectedLoader(loader.id)}
                  className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center border"
                          style={{
                            backgroundColor: `${loader.accentColor}15`,
                            borderColor: `${loader.accentColor}30`,
                          }}
                        >
                          {getLoaderIcon(loader.iconName, loader.accentColor)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            {loader.name}
                            {loader.recommended && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                                Recommended
                              </span>
                            )}
                          </h3>
                          <span className="text-xs font-mono text-neutral-400">
                            {loader.badge}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-black'
                            : 'border-neutral-700 bg-neutral-950'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 line-clamp-2 mb-3">
                      {loader.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      {loader.isPluginCompatible && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Plugins
                        </span>
                      )}
                      {loader.isModCompatible && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Mods
                        </span>
                      )}
                      {!loader.isPluginCompatible && !loader.isModCompatible && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          Pure Mojang
                        </span>
                      )}
                    </div>

                    <a
                      href={loader.officialSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-emerald-400 flex items-center gap-0.5 text-neutral-500"
                    >
                      Website <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-sm transition-all border border-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/10"
            >
              Continue with {selectedLoaderObj.name}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VERSION SELECTION SCREEN (1.12.2 to 1.21.4) */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                3. Select Minecraft Version for {selectedLoaderObj.name}
              </h2>
              <p className="text-neutral-400 text-sm">
                Official release versions from 1.12.2 to 1.21.4. Auto-downloads official <code className="text-emerald-400 font-mono">server.jar</code>.
              </p>
            </div>

            {/* Version Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
                placeholder="Search version (e.g. 1.21.4, 1.20.1)..."
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Version Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { id: 'all', label: 'All Versions' },
              { id: 'latest', label: '1.21 (Tricky Trials)' },
              { id: 'modern', label: '1.20 & 1.19' },
              { id: 'stable', label: '1.18 - 1.16' },
              { id: 'classic', label: '1.15 - 1.12.2' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setVersionCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  versionCategory === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Versions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto p-1 rounded-xl bg-neutral-950 border border-neutral-800/80">
            {filteredVersions.map((v) => {
              const isSelected = selectedVersion === v.version;
              return (
                <div
                  key={v.version}
                  onClick={() => setSelectedVersion(v.version)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 border-emerald-500 ring-2 ring-emerald-500/20 text-white shadow-md'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm text-white">
                      {v.version}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {v.releaseDate}
                    </div>
                    <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {v.recommendedJava}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box before deployment */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                MC
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{serverName || 'Minecraft Server'}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono font-normal">
                    {selectedLoaderObj.name} {selectedVersion}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  {subdomain}.fluxhost.com.tr • 3 GB DDR4 • Xeon E5-2690 v4 • 10 GB NVMe
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-sm transition-all border border-neutral-800"
              >
                Back
              </button>

              <button
                onClick={handleDeploy}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <DownloadCloud className="w-4 h-4" />
                Deploy & Start Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: AUTOMATIC SERVER.JAR DOWNLOAD & DEPLOYMENT PROGRESS */}
      {step === 4 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              {isDeploying ? (
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              ) : deployError ? (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {isDeploying
                ? `Deploying ${selectedLoaderObj.name} ${selectedVersion}`
                : deployError
                ? 'Deployment Failed'
                : 'Server Deployed Successfully!'}
            </h2>
            <p className="text-neutral-400 text-sm">
              {isDeploying
                ? 'Fetching official server.jar directly from the loader API and provisioning dedicated VDS hardware.'
                : deployError
                ? deployError
                : 'Your Minecraft server is now running and ready to accept player connections.'}
            </p>
          </div>

          {/* Pipeline Stage Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            {[
              { num: 1, title: '1. VDS Hardware Provisioning', desc: 'Allocating 3 GB RAM' },
              { num: 2, title: '2. Official server.jar Download', desc: `Fetching ${selectedLoaderObj.name}` },
              { num: 3, title: '3. Environment Setup', desc: 'eula.txt & server.properties' },
              { num: 4, title: '4. Server Launch', desc: 'OpenJDK 21 Online' },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  deployStep > st.num
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                    : deployStep === st.num
                    ? 'bg-neutral-800 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-0.5">
                  <span>{st.title}</span>
                  {deployStep > st.num ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : deployStep === st.num ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : null}
                </div>
                <div className="text-[11px] opacity-75">{st.desc}</div>
              </div>
            ))}
          </div>

          {/* Live Installer Terminal Stream */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-neutral-500 text-[11px] flex items-center gap-1.5 pb-1 border-b border-neutral-800">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Flux Automated Installer Engine Logs
            </div>
            {deployLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 select-none">&gt;</span>
                <span className={log.includes('ready') || log.includes('ONLINE') ? 'text-emerald-400 font-bold' : ''}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          {deployError && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Go Back and Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
