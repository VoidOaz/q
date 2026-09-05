import { db } from './db.ts';
import {
  PterodactylConfig,
  PterodactylNodeInfo,
  PterodactylEggInfo,
  PterodactylAllocationInfo,
} from './types.ts';
import { MinecraftLoader } from './minecraftLoaders.ts';

export interface PterodactylServerCreationOptions {
  name: string;
  subdomain: string;
  userEmail: string;
  username: string;
  loader: MinecraftLoader;
  version: string;
  javaVersion: string;
  memoryMb?: number; // Default 3072 (3 GB)
  diskMb?: number; // Default 10240 (10 GB)
  cpuLimit?: number; // Default 200
  port?: number;
}

export interface PterodactylServerCreationResult {
  serverId: number;
  uuid: string;
  identifier: string;
  name: string;
  nodeId: number;
  allocationId: number;
  ip: string;
  port: number;
  raw: any;
}

export interface PterodactylLiveResources {
  currentState: 'running' | 'offline' | 'starting' | 'stopping';
  isSuspended: boolean;
  memoryBytes: number;
  memoryLimitBytes: number;
  cpuAbsolute: number;
  diskBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  uptimeMs: number;
}

export class PterodactylService {
  /**
   * Get active config from database
   */
  public getConfig(): PterodactylConfig {
    const dbConfig = db.getPterodactylConfig();
    return {
      panelUrl: (dbConfig.panelUrl || 'https://panel.fluxhost.com.tr').replace(/\/+$/, ''),
      apiKey: dbConfig.apiKey || '',
      clientApiKey: dbConfig.clientApiKey || dbConfig.apiKey || '',
      nodeId: Number(dbConfig.nodeId) || 1,
      nestId: Number(dbConfig.nestId) || 1,
      eggId: Number(dbConfig.eggId) || 1,
      locationId: Number(dbConfig.locationId) || 1,
      isConfigured: Boolean(dbConfig.apiKey && dbConfig.panelUrl),
      status: dbConfig.status || (dbConfig.apiKey ? 'connected' : 'unconfigured'),
      lastChecked: dbConfig.lastChecked,
      errorMessage: dbConfig.errorMessage,
    };
  }

  /**
   * Application API HTTP Request Wrapper (/api/application/*)
   */
  private async requestApplication<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config = this.getConfig();
    if (!config.panelUrl) {
      throw new Error('Pterodactyl Panel URL is not configured.');
    }
    if (!config.apiKey) {
      throw new Error('Pterodactyl Application API Key (ptla_...) is not configured.');
    }

    const url = `${config.panelUrl}/api/application${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey.trim()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'FluxHosting-Pterodactyl-Client/1.0',
    };

    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          errDetail = errorJson.errors.map((e: any) => e.detail || e.code || JSON.stringify(e)).join(', ');
        } else if (errorJson.message) {
          errDetail = errorJson.message;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errDetail += `: ${text.slice(0, 200)}`;
      }
      throw new Error(`Pterodactyl Application API Error: ${errDetail}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  /**
   * Client API HTTP Request Wrapper (/api/client/*)
   */
  private async requestClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config = this.getConfig();
    if (!config.panelUrl) {
      throw new Error('Pterodactyl Panel URL is not configured.');
    }

    const clientKey = config.clientApiKey || config.apiKey;
    if (!clientKey) {
      throw new Error('Pterodactyl Client API Key (ptlc_...) is not configured.');
    }

    const url = `${config.panelUrl}/api/client${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${clientKey.trim()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'FluxHosting-Pterodactyl-Client/1.0',
    };

    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          errDetail = errorJson.errors.map((e: any) => e.detail || e.code || JSON.stringify(e)).join(', ');
        } else if (errorJson.message) {
          errDetail = errorJson.message;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errDetail += `: ${text.slice(0, 200)}`;
      }
      throw new Error(`Pterodactyl Client API Error: ${errDetail}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  /**
   * Test connection to Pterodactyl Panel (App & Client API)
   */
  public async testConnection(overrideConfig?: Partial<PterodactylConfig>): Promise<{
    success: boolean;
    appApiWorking: boolean;
    clientApiWorking: boolean;
    nodesCount: number;
    nestsCount: number;
    serversCount: number;
    nodeList: Array<{ id: number; name: string; fqdn: string; memory: number; disk: number }>;
    message: string;
    details?: any;
  }> {
    const config = { ...this.getConfig(), ...overrideConfig };

    let appApiWorking = false;
    let clientApiWorking = false;
    let nodesCount = 0;
    let nestsCount = 0;
    let serversCount = 0;
    let nodeList: Array<{ id: number; name: string; fqdn: string; memory: number; disk: number }> = [];
    let errMessage = '';

    // 1. Test Application API (Nodes and Nests)
    try {
      const url = `${config.panelUrl}/api/application/nodes`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.apiKey.trim()}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        appApiWorking = true;
        if (data.data && Array.isArray(data.data)) {
          nodesCount = data.data.length;
          nodeList = data.data.map((n: any) => ({
            id: n.attributes.id,
            name: n.attributes.name,
            fqdn: n.attributes.fqdn,
            memory: n.attributes.memory,
            disk: n.attributes.disk,
          }));
        }
      } else {
        errMessage = `App API HTTP ${res.status}`;
      }
    } catch (e: any) {
      errMessage = e.message;
    }

    // 2. Test Nests & Servers count
    if (appApiWorking) {
      try {
        const nestsRes = await this.requestApplication('/nests');
        if (nestsRes.data && Array.isArray(nestsRes.data)) {
          nestsCount = nestsRes.data.length;
        }

        const srvRes = await this.requestApplication('/servers');
        if (srvRes.data && Array.isArray(srvRes.data)) {
          serversCount = srvRes.data.length;
        }
      } catch (e: any) {
        console.warn('Pterodactyl Nests/Servers check warning:', e.message);
      }
    }

    // 3. Test Client API (Account info)
    const clientKey = config.clientApiKey || config.apiKey;
    if (clientKey) {
      try {
        const clientRes = await fetch(`${config.panelUrl}/api/client/account`, {
          headers: {
            Authorization: `Bearer ${clientKey.trim()}`,
            Accept: 'application/json',
          },
        });
        if (clientRes.ok) {
          clientApiWorking = true;
        }
      } catch {
        // client API check failed
      }
    }

    const success = appApiWorking;

    // Update db status
    db.updatePterodactylConfig({
      lastChecked: new Date().toISOString(),
      status: success ? 'connected' : 'error',
      errorMessage: success ? undefined : errMessage,
    });

    return {
      success,
      appApiWorking,
      clientApiWorking,
      nodesCount,
      nestsCount,
      serversCount,
      nodeList,
      message: success
        ? `Successfully connected to Pterodactyl Panel at ${config.panelUrl}. Found ${nodesCount} node(s) and ${nestsCount} nest(s).`
        : `Could not connect to Pterodactyl Panel: ${errMessage || 'Unknown error'}`,
    };
  }

  /**
   * Get all nodes from Pterodactyl Panel
   */
  public async getNodes(): Promise<PterodactylNodeInfo[]> {
    try {
      const res = await this.requestApplication('/nodes');
      if (res.data && Array.isArray(res.data)) {
        return res.data.map((item: any) => ({
          id: item.attributes.id,
          name: item.attributes.name,
          fqdn: item.attributes.fqdn,
          scheme: item.attributes.scheme || 'https',
          memory: item.attributes.memory,
          disk: item.attributes.disk,
          allocatedMemory: item.attributes.allocated_resources?.memory || 0,
          allocatedDisk: item.attributes.allocated_resources?.disk || 0,
          daemonListen: item.attributes.daemon_listen || 8080,
          public: item.attributes.public ?? true,
        }));
      }
      return [];
    } catch (e: any) {
      console.error('Failed to get Pterodactyl nodes:', e);
      return [];
    }
  }

  /**
   * Get all nests and eggs
   */
  public async getNestsAndEggs(): Promise<Array<{ id: number; name: string; description: string; eggs: PterodactylEggInfo[] }>> {
    try {
      const res = await this.requestApplication('/nests?include=eggs');
      if (res.data && Array.isArray(res.data)) {
        return res.data.map((nest: any) => {
          const eggs: PterodactylEggInfo[] = [];
          if (nest.attributes.relationships?.eggs?.data) {
            for (const egg of nest.attributes.relationships.eggs.data) {
              eggs.push({
                id: egg.attributes.id,
                nestId: nest.attributes.id,
                name: egg.attributes.name,
                author: egg.attributes.author,
                description: egg.attributes.description,
                dockerImage: egg.attributes.docker_image,
                startup: egg.attributes.startup,
              });
            }
          }
          return {
            id: nest.attributes.id,
            name: nest.attributes.name,
            description: nest.attributes.description,
            eggs,
          };
        });
      }
      return [];
    } catch (e: any) {
      console.error('Failed to get Pterodactyl nests and eggs:', e);
      return [];
    }
  }

  /**
   * Get free allocations for a node
   */
  public async getNodeAllocations(nodeId: number): Promise<PterodactylAllocationInfo[]> {
    try {
      const res = await this.requestApplication(`/nodes/${nodeId}/allocations`);
      if (res.data && Array.isArray(res.data)) {
        return res.data.map((item: any) => ({
          id: item.attributes.id,
          ip: item.attributes.ip,
          alias: item.attributes.alias,
          port: item.attributes.port,
          assigned: item.attributes.assigned,
        }));
      }
      return [];
    } catch (e: any) {
      console.error(`Failed to get allocations for node ${nodeId}:`, e);
      return [];
    }
  }

  /**
   * Find or create Pterodactyl user by email
   */
  public async findOrCreateUser(userData: { email: string; username: string; firstName?: string; lastName?: string }): Promise<number> {
    const cleanEmail = userData.email.toLowerCase().trim();
    const cleanUsername = userData.username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || `user_${Date.now().toString(36)}`;

    try {
      // 1. Check existing user by email
      const searchRes = await this.requestApplication(`/users?filter[email]=${encodeURIComponent(cleanEmail)}`);
      if (searchRes.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        return searchRes.data[0].attributes.id;
      }

      // 2. Create new user in Pterodactyl
      const createRes = await this.requestApplication('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          username: cleanUsername,
          first_name: userData.firstName || cleanUsername,
          last_name: userData.lastName || 'Flux',
        }),
      });

      if (createRes.attributes && createRes.attributes.id) {
        return createRes.attributes.id;
      }
    } catch (e: any) {
      console.warn('Find or create Pterodactyl user notice:', e.message);
      // If error occurs because user already exists or first user is admin (id 1)
      try {
        const users = await this.requestApplication('/users');
        if (users.data && users.data.length > 0) {
          const match = users.data.find((u: any) => u.attributes.email.toLowerCase() === cleanEmail);
          if (match) return match.attributes.id;
          return users.data[0].attributes.id; // fallback to root admin
        }
      } catch {
        // ignore
      }
    }

    return 1; // Default to root user ID 1
  }

  /**
   * Determine Docker Java Image based on Minecraft version & Java runtime
   */
  public getDockerImageForJava(javaVersion: string): string {
    if (javaVersion.includes('8')) {
      return 'ghcr.io/pterodactyl/yolks:java_8';
    } else if (javaVersion.includes('11')) {
      return 'ghcr.io/pterodactyl/yolks:java_11';
    } else if (javaVersion.includes('17')) {
      return 'ghcr.io/pterodactyl/yolks:java_17';
    }
    return 'ghcr.io/pterodactyl/yolks:java_21';
  }

  /**
   * Create a new Minecraft Server on Pterodactyl
   */
  public async createServer(opts: PterodactylServerCreationOptions): Promise<PterodactylServerCreationResult> {
    const config = this.getConfig();
    const pteroUserId = await this.findOrCreateUser({
      email: opts.userEmail,
      username: opts.username,
    });

    const dockerImage = this.getDockerImageForJava(opts.javaVersion);
    const memory = opts.memoryMb || 3072; // 3 GB RAM
    const disk = opts.diskMb || 10240; // 10 GB Disk
    const cpu = opts.cpuLimit || 200; // 200% (2 vCPUs)

    // Build Pterodactyl server payload
    const payload: any = {
      name: opts.name.trim(),
      user: pteroUserId,
      egg: config.eggId || 1,
      docker_image: dockerImage,
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}',
      environment: {
        SERVER_JARFILE: 'server.jar',
        MINECRAFT_VERSION: opts.version,
        BUILD_NUMBER: 'latest',
        VERSION: opts.version,
        LOADER: opts.loader,
      },
      limits: {
        memory,
        swap: 0,
        disk,
        io: 500,
        cpu,
      },
      feature_limits: {
        databases: 1,
        allocations: 1,
        backups: 1,
      },
      start_on_completion: true,
    };

    // Find available allocation on target node
    let selectedAllocationId: number | undefined;
    let allocatedIp = '194.26.183.40';
    let allocatedPort = opts.port || 25565;

    try {
      const allocations = await this.getNodeAllocations(config.nodeId || 1);
      const freeAllocation = allocations.find(a => !a.assigned);
      if (freeAllocation) {
        selectedAllocationId = freeAllocation.id;
        allocatedIp = freeAllocation.alias || freeAllocation.ip;
        allocatedPort = freeAllocation.port;
      }
    } catch {
      // ignore
    }

    if (selectedAllocationId) {
      payload.allocation = {
        default: selectedAllocationId,
      };
    } else {
      payload.deploy = {
        locations: [config.locationId || 1],
        dedicated_ip: false,
        port_range: [],
      };
    }

    const createRes = await this.requestApplication('/servers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const serverAttr = createRes.attributes;
    const serverId = serverAttr.id;
    const uuid = serverAttr.uuid;
    const identifier = serverAttr.identifier;

    // Get assigned allocation info from response
    if (serverAttr.relationships?.allocations?.data?.[0]?.attributes) {
      const alloc = serverAttr.relationships.allocations.data[0].attributes;
      allocatedIp = alloc.alias || alloc.ip || allocatedIp;
      allocatedPort = alloc.port || allocatedPort;
    }

    return {
      serverId,
      uuid,
      identifier,
      name: serverAttr.name,
      nodeId: serverAttr.node || config.nodeId,
      allocationId: serverAttr.allocation || selectedAllocationId || 1,
      ip: allocatedIp,
      port: allocatedPort,
      raw: serverAttr,
    };
  }

  /**
   * Send power action to server (start, stop, restart, kill)
   */
  public async sendPowerAction(serverIdentifier: string, signal: 'start' | 'stop' | 'restart' | 'kill'): Promise<{ success: boolean; message: string }> {
    await this.requestClient(`/servers/${serverIdentifier}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal }),
    });

    return {
      success: true,
      message: `Successfully sent ${signal} signal to Pterodactyl server ${serverIdentifier}`,
    };
  }

  /**
   * Send console command to server
   */
  public async sendCommand(serverIdentifier: string, command: string): Promise<{ success: boolean; command: string }> {
    await this.requestClient(`/servers/${serverIdentifier}/command`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    });

    return {
      success: true,
      command,
    };
  }

  /**
   * Get server live resources & status
   */
  public async getServerResources(serverIdentifier: string): Promise<PterodactylLiveResources> {
    const res = await this.requestClient(`/servers/${serverIdentifier}/resources`);
    const attr = res.attributes || {};
    const resAttr = attr.resources || {};

    return {
      currentState: attr.current_state || 'offline',
      isSuspended: Boolean(attr.is_suspended),
      memoryBytes: resAttr.memory_bytes || 0,
      memoryLimitBytes: resAttr.memory_limit_bytes || 3072 * 1024 * 1024,
      cpuAbsolute: resAttr.cpu_absolute || 0,
      diskBytes: resAttr.disk_bytes || 0,
      networkRxBytes: resAttr.network_rx_bytes || 0,
      networkTxBytes: resAttr.network_tx_bytes || 0,
      uptimeMs: resAttr.uptime || 0,
    };
  }

  /**
   * Get WebSocket authentication details for real-time console streaming
   */
  public async getWebsocketDetails(serverIdentifier: string): Promise<{ token: string; socket: string }> {
    const res = await this.requestClient(`/servers/${serverIdentifier}/websocket`);
    return {
      token: res.data?.token || '',
      socket: res.data?.socket || '',
    };
  }

  /**
   * List files in directory
   */
  public async listFiles(serverIdentifier: string, directory: string = '/'): Promise<Array<{
    name: string;
    mode: string;
    size: number;
    isFile: boolean;
    isSymlink: boolean;
    mimetype: string;
    createdAt: string;
    modifiedAt: string;
  }>> {
    const cleanDir = directory.startsWith('/') ? directory : `/${directory}`;
    const res = await this.requestClient(`/servers/${serverIdentifier}/files/list?directory=${encodeURIComponent(cleanDir)}`);
    if (res.data && Array.isArray(res.data)) {
      return res.data.map((item: any) => ({
        name: item.attributes.name,
        mode: item.attributes.mode,
        size: item.attributes.size,
        isFile: item.attributes.is_file,
        isSymlink: item.attributes.is_symlink,
        mimetype: item.attributes.mimetype,
        createdAt: item.attributes.created_at,
        modifiedAt: item.attributes.modified_at,
      }));
    }
    return [];
  }

  /**
   * Get file contents as string
   */
  public async getFileContents(serverIdentifier: string, filePath: string): Promise<string> {
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const config = this.getConfig();
    const clientKey = config.clientApiKey || config.apiKey;

    const url = `${config.panelUrl}/api/client/servers/${serverIdentifier}/files/contents?file=${encodeURIComponent(cleanPath)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${clientKey.trim()}`,
        Accept: 'text/plain',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to read file contents from Pterodactyl (HTTP ${res.status})`);
    }

    return res.text();
  }

  /**
   * Write file contents
   */
  public async writeFileContents(serverIdentifier: string, filePath: string, content: string): Promise<void> {
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const config = this.getConfig();
    const clientKey = config.clientApiKey || config.apiKey;

    const url = `${config.panelUrl}/api/client/servers/${serverIdentifier}/files/write?file=${encodeURIComponent(cleanPath)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clientKey.trim()}`,
        'Content-Type': 'text/plain',
      },
      body: content,
    });

    if (!res.ok) {
      throw new Error(`Failed to save file on Pterodactyl (HTTP ${res.status})`);
    }
  }

  /**
   * Delete files or directories
   */
  public async deleteFiles(serverIdentifier: string, rootDir: string, fileNames: string[]): Promise<void> {
    await this.requestClient(`/servers/${serverIdentifier}/files/delete`, {
      method: 'POST',
      body: JSON.stringify({
        root: rootDir || '/',
        files: fileNames,
      }),
    });
  }

  /**
   * Create folder
   */
  public async createFolder(serverIdentifier: string, rootDir: string, folderName: string): Promise<void> {
    await this.requestClient(`/servers/${serverIdentifier}/files/create-folder`, {
      method: 'POST',
      body: JSON.stringify({
        root: rootDir || '/',
        name: folderName,
      }),
    });
  }

  /**
   * Rename file
   */
  public async renameFiles(serverIdentifier: string, rootDir: string, files: Array<{ from: string; to: string }>): Promise<void> {
    await this.requestClient(`/servers/${serverIdentifier}/files/rename`, {
      method: 'PUT',
      body: JSON.stringify({
        root: rootDir || '/',
        files,
      }),
    });
  }

  /**
   * Get file download link
   */
  public async getDownloadUrl(serverIdentifier: string, filePath: string): Promise<string> {
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const res = await this.requestClient(`/servers/${serverIdentifier}/files/download?file=${encodeURIComponent(cleanPath)}`);
    return res.attributes?.url || '';
  }

  /**
   * Delete server from Pterodactyl Panel
   */
  public async deleteServer(pterodactylServerId: number): Promise<void> {
    await this.requestApplication(`/servers/${pterodactylServerId}`, {
      method: 'DELETE',
    });
  }
}

export const pterodactyl = new PterodactylService();
