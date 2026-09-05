import { MinecraftLoader, LoaderInfo, MinecraftVersionItem } from '../server/minecraftLoaders.ts';

export type { MinecraftLoader, LoaderInfo, MinecraftVersionItem };

export type MinecraftServerStatus = 'online' | 'offline' | 'starting' | 'stopping' | 'installing' | 'restarting' | 'error';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'owner' | 'member' | 'superadmin' | 'operator';
  isOperator?: boolean;
  permissions?: string[];
  createdAt?: string;
  lastLogin?: string;
  hasServer?: boolean;
}

export interface MinecraftServerSpecs {
  ramMb: number; // 3072 MB (3 GB DDR4)
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

export interface MinecraftFileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
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
  name: string;
  subdomain: string;
  domain: string;
  port: number;
  rconPort: number;
  rconPassword: string;
  loader: MinecraftLoader;
  version: string;
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
  isOwner?: boolean;
}

export interface PterodactylConfigFrontend {
  panelUrl: string;
  apiKey: string;
  hasApiKey: boolean;
  clientApiKey: string;
  hasClientApiKey: boolean;
  nodeId: number;
  nestId: number;
  eggId: number;
  locationId: number;
  isConfigured: boolean;
  status: 'unconfigured' | 'connected' | 'error';
  lastChecked?: string;
  errorMessage?: string;
}

export interface PterodactylTestResult {
  success: boolean;
  message: string;
  panelUrl?: string;
  applicationApiOk?: boolean;
  clientApiOk?: boolean;
  nodesCount?: number;
  nestsCount?: number;
  rawError?: string;
  nodes?: { id: number; name: string; memory: number; disk: number; fqdn: string }[];
}

export interface MinecraftServerMetrics {
  cpuUsagePercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  tps: number;
  mspt: number;
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
  pass?: string;
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
