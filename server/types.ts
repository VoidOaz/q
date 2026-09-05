import { MinecraftLoader } from './minecraftLoaders.ts';

export type MinecraftServerStatus = 'online' | 'offline' | 'starting' | 'stopping' | 'installing' | 'restarting' | 'error';

export interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  role: 'owner' | 'member' | 'superadmin' | 'operator';
  isOperator?: boolean;
  permissions?: string[];
  createdAt: string;
  lastLogin?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface MinecraftServerSpecs {
  ramMb: number; // 3072 MB (3 GB DDR4 RAM)
  vCpu: number; // 2 Cores
  cpuModel: string; // Intel Xeon E5-2690 v4
  diskGb: number; // 10 GB NVMe SSD
  networkBandwidth: string; // 1 Gbit Network
}

export interface MinecraftPlayer {
  username: string;
  uuid: string;
  ping: number;
  joinedAt: string;
}

export interface BannedPlayer {
  username: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}

export interface MinecraftPluginItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  fileName: string;
  enabled: boolean;
  category: 'performance' | 'administration' | 'economy' | 'protection' | 'world' | 'chat';
}

export interface MinecraftModItem {
  id: string;
  name: string;
  version: string;
  fileName: string;
  enabled: boolean;
  side: 'server' | 'both';
  description: string;
}

export interface MinecraftWorld {
  name: string;
  folderName: string;
  sizeMb: number;
  environment: 'normal' | 'nether' | 'the_end';
  lastModified: string;
}

export interface ServerFileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  permissions: string;
  owner: string;
  group: string;
  updatedAt: string;
  content?: string;
}

export interface MinecraftConsoleLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'server' | 'cmd';
  thread?: string;
  message: string;
}

export interface ServerActivity {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface ServerMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: 'owner' | 'member';
  permissions: {
    canPower: boolean;
    canConsole: boolean;
    canFiles: boolean;
    canPlayers: boolean;
    canSettings: boolean;
  };
  addedAt: string;
}

export interface MinecraftServerInstance {
  id: string;
  ownerId: string;
  name: string; // User chosen name e.g. "hypixel-smp"
  subdomain: string; // e.g. "hypixelsmp"
  domain: string; // e.g. "hypixelsmp.fluxhost.com.tr"
  port: number; // e.g. 25565
  rconPort: number; // e.g. 25575
  rconPassword: string;
  loader: MinecraftLoader;
  version: string; // e.g. "1.21.4", "26.2"
  javaVersion: 'Java 21' | 'Java 17' | 'Java 11' | 'Java 8';
  status: MinecraftServerStatus;
  specs: MinecraftServerSpecs;
  vdsNode: {
    name: string;
    ip: string;
    cpu: string;
    totalRamGb: number;
    nvmeStorage: string;
  };
  motd: string;
  maxPlayers: number;
  onlinePlayersCount: number;
  onlinePlayers: MinecraftPlayer[];
  ops: string[];
  whitelist: string[];
  whitelistEnabled: boolean;
  bannedPlayers: BannedPlayer[];
  properties: Record<string, string | number | boolean>;
  files: ServerFileItem[];
  plugins: MinecraftPluginItem[];
  mods: MinecraftModItem[];
  worlds: MinecraftWorld[];
  consoleLogs: MinecraftConsoleLog[];
  consoleHistory: { id: string; command: string; output: string; exitCode: number; timestamp: string }[];
  activityLogs: ServerActivity[];
  members: ServerMember[];
  pterodactylServerId?: number;
  pterodactylIdentifier?: string;
  pterodactylUuid?: string;
  pterodactylAllocationId?: number;
  pterodactylNodeId?: number;
  pterodactylConnected?: boolean;
  createdAt: string;
  uptimeStart: number;
}

export interface PterodactylConfig {
  panelUrl: string;
  apiKey: string; // Application API Key (ptla_...)
  clientApiKey: string; // Client API Key (ptlc_...)
  nodeId: number;
  nestId: number;
  eggId: number;
  locationId?: number;
  isConfigured: boolean;
  lastChecked?: string;
  status?: 'connected' | 'error' | 'unconfigured';
  errorMessage?: string;
}

export interface PterodactylNodeInfo {
  id: number;
  name: string;
  fqdn: string;
  scheme: string;
  memory: number;
  disk: number;
  allocatedMemory: number;
  allocatedDisk: number;
  daemonListen: number;
  public: boolean;
}

export interface PterodactylEggInfo {
  id: number;
  nestId: number;
  name: string;
  author: string;
  description: string;
  dockerImage: string;
  startup: string;
}

export interface PterodactylAllocationInfo {
  id: number;
  ip: string;
  alias?: string;
  port: number;
  assigned: boolean;
}

export interface MinecraftServerMetrics {
  cpuUsagePercent: number;
  ramUsedMb: number;
  ramTotalMb: number; // 3072
  diskUsedGb: number;
  diskTotalGb: number; // 10
  tps: number; // 20.0
  mspt: number; // 12.4 ms
  networkInMbps: number;
  networkOutMbps: number;
  uptimeSeconds: number;
  history: {
    time: string;
    cpu: number;
    ram: number;
    tps: number;
  }[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  isConfigured: boolean;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'verification' | 'password_reset' | 'server_alert' | 'member_invite' | 'test';
  status: 'sent' | 'failed';
  errorMessage?: string;
  sentAt: string;
  previewBody?: string;
}
