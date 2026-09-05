import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, DATA_DIR } from './db.ts';
import { generateCaptcha, verifyCaptcha } from './captcha.ts';
import { generateToken, requireAuth, requireVdsOperator, hasVdsBindingPermission, checkServerPermission, AuthenticatedRequest } from './auth.ts';
import { MINECRAFT_LOADERS, ALL_MINECRAFT_VERSIONS, MinecraftLoader } from './minecraftLoaders.ts';
import { downloadAndDeployMinecraftServer, resolveOfficialJarUrl } from './minecraftDownloader.ts';
import {
  generateInitialServerFiles,
  generateInitialStartupLogs,
  generateMinecraftMetrics,
  executeMinecraftCommand,
  POPULAR_PLUGINS,
  POPULAR_MODS,
} from './minecraftService.ts';
import { testSmtpConnection, sendEmail } from './mailer.ts';
import { pterodactyl } from './pterodactylService.ts';
import {
  User,
  MinecraftServerInstance,
  ServerFileItem,
  MinecraftPluginItem,
  MinecraftModItem,
} from './types.ts';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Support Vercel serverless functions where /api prefix might be stripped or retained
  app.use((req, _res, next) => {
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    next();
  });

// ==================== AUTHENTICATION & USER MANAGEMENT ====================

  // 1. CAPTCHA Endpoint
  app.get('/api/auth/captcha', (req: Request, res: Response) => {
    try {
      const captcha = generateCaptcha();
      res.json({
        id: captcha.id,
        svg: captcha.svg,
        hint: captcha.textHint,
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to generate CAPTCHA' });
    }
  });

  // 2. User Registration (Username + Password only)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, password, captchaId, captchaAnswer } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const cleanUsername = username.trim();

      if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Verify CAPTCHA
      if (!verifyCaptcha(captchaId, captchaAnswer)) {
        return res.status(400).json({ error: 'Invalid or expired CAPTCHA code. Please try again.' });
      }

      // Check existing user
      if (db.findUserByUsername(cleanUsername)) {
        return res.status(400).json({ error: 'Username is already registered.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const isPcbcUser = cleanUsername.toUpperCase() === 'PCBC';
      const fallbackEmail = `${cleanUsername.toLowerCase()}@fluxhost.local`;

      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        username: cleanUsername,
        email: fallbackEmail,
        passwordHash,
        role: isPcbcUser ? 'superadmin' : 'owner',
        isOperator: isPcbcUser,
        permissions: isPcbcUser
          ? ['vds_binding', 'vds_connection_management', 'system_admin', 'manage_servers', 'manage_nodes', 'operator']
          : [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      db.createUser(newUser);

      const token = generateToken(newUser);

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          isOperator: hasVdsBindingPermission(newUser),
          permissions: newUser.permissions || [],
          hasServer: false,
        },
      });
    } catch (e: any) {
      console.error('Registration error:', e);
      res.status(500).json({ error: 'Failed to create user account.' });
    }
  });

  // 3. User Login (Username + Password)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { username, usernameOrEmail, identifier, password } = req.body;
      const targetUser = (username || usernameOrEmail || identifier || '').trim();

      if (!targetUser || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const user = db.findUserByUsernameOrEmail(targetUser);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const match = bcrypt.compareSync(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      db.updateUser(user.id, { lastLogin: new Date().toISOString() });

      const userServer = db.findServerByOwnerId(user.id);
      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isOperator: hasVdsBindingPermission(user),
          permissions: user.permissions || (hasVdsBindingPermission(user) ? ['vds_binding', 'vds_connection_management', 'system_admin'] : []),
          hasServer: Boolean(userServer),
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Internal login error.' });
    }
  });

  // 4. Current User Session
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const userServer = db.findServerByOwnerId(user.id);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isOperator: hasVdsBindingPermission(user),
        permissions: user.permissions || (hasVdsBindingPermission(user) ? ['vds_binding', 'vds_connection_management', 'system_admin'] : []),
        hasServer: Boolean(userServer),
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  });

  // 5. Password Reset Request
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });

      const user = db.findUserByUsernameOrEmail(email);
      if (!user) {
        return res.json({ success: true, message: 'If the email exists, a password reset link has been dispatched.' });
      }

      const token = crypto.randomBytes(24).toString('hex');
      db.saveResetToken(user.email, token, Date.now() + 3600 * 1000);

      await sendEmail({
        to: user.email,
        subject: 'Flux Hosting - Password Reset Link',
        type: 'password_reset',
        body: `Hello ${user.username},\n\nYou requested a password reset for your Flux Hosting Minecraft account.\nYour verification code is: ${token}\n\nThis token will expire in 1 hour.`,
      });

      res.json({ success: true, message: 'If the email exists, a password reset link has been dispatched.' });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to process password reset.' });
    }
  });

  // 6. Complete Password Reset
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'Email, token, and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const isValid = db.verifyResetToken(email, token);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }

      const user = db.findUserByUsernameOrEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(newPassword, salt);

      db.updateUser(user.id, { passwordHash });
      db.consumeResetToken(email, token);

      res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  });

  // ==================== MINECRAFT LOADERS & VERSIONS ====================

  // 7. Get All Supported Minecraft Loaders
  app.get('/api/minecraft/loaders', (req: Request, res: Response) => {
    res.json(MINECRAFT_LOADERS);
  });

  // 8. Get All Minecraft Versions (1.12.2 to 26.2)
  app.get('/api/minecraft/versions', (req: Request, res: Response) => {
    const loader = req.query.loader as MinecraftLoader;
    if (loader) {
      const filtered = ALL_MINECRAFT_VERSIONS.filter(v => v.supportedLoaders.includes(loader));
      return res.json(filtered);
    }
    res.json(ALL_MINECRAFT_VERSIONS);
  });

  // 9. Probe & Resolve Official Jar Download URL
  app.get('/api/minecraft/resolve-jar', async (req: Request, res: Response) => {
    try {
      const loader = (req.query.loader as MinecraftLoader) || 'paper';
      const version = (req.query.version as string) || '1.21.4';
      const result = await resolveOfficialJarUrl(loader, version);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 10. Single Host VDS Status & Resource Information
  app.get('/api/vds-node/status', (req: Request, res: Response) => {
    const totalServers = db.getAllServers().length;
    const onlineServers = db.getAllServers().filter(s => s.status === 'online').length;

    res.json({
      nodeName: 'Flux Dedicated Node #1 (Frankfurt)',
      hostIp: '194.26.183.40',
      cpuModel: 'Intel Xeon E5-2690 v4 @ 3.50GHz',
      totalCpuCores: 28, // 14 Cores / 28 Threads
      allocatedCpuCores: totalServers * 2,
      totalRamMb: 65536, // 64 GB DDR4 ECC
      allocatedRamMb: totalServers * 3072, // 3 GB per server
      availableRamMb: Math.max(0, 65536 - totalServers * 3072),
      storageType: 'Enterprise NVMe RAID-1',
      totalStorageGb: 1000,
      allocatedStorageGb: totalServers * 10,
      networkBandwidth: '1 Gbit/s Dedicated Uplink',
      status: 'healthy',
      totalServers,
      onlineServers,
      uptimeSeconds: 1428500,
    });
  });

  // ==================== MINECRAFT SERVER MANAGEMENT ====================

  // 10. List Servers for User
  app.get('/api/servers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const userServers = db.getServersForUser(userId);
    res.json(userServers);
  });

  // 11. Get Current User's Minecraft Server (Max 1)
  app.get('/api/servers/my-server', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const server = db.findServerByOwnerId(userId);

    if (!server) {
      return res.status(404).json({ error: 'No Minecraft server provisioned yet.' });
    }

    const metrics = generateMinecraftMetrics(server);
    res.json({
      ...server,
      metrics,
      isOwner: true,
    });
  });

  // 12. Create New Minecraft Server (Strict 1 Server Limit Per Account)
  app.post('/api/servers/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const existing = db.findServerByOwnerId(userId);

      // RULE ENFORCEMENT: Max 1 server per account
      if (existing) {
        return res.status(400).json({
          error: 'Maximum 1 Minecraft server allowed per account. Please manage your existing server.',
          existingServerId: existing.id,
        });
      }

      const { name, loader, version } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Server name is required.' });
      }

      // Format clean subdomain
      const cleanSubdomain = name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 24);

      if (cleanSubdomain.length < 3) {
        return res.status(400).json({ error: 'Server name must contain at least 3 alphanumeric characters.' });
      }

      // Check subdomain availability
      if (db.findServerBySubdomain(cleanSubdomain)) {
        return res.status(400).json({ error: `Domain '${cleanSubdomain}.fluxhost.com.tr' is already taken. Please choose another name.` });
      }

      const validLoaders: MinecraftLoader[] = [
        'vanilla', 'paper', 'purpur', 'fabric', 'forge', 'neoforge', 'pufferfish', 'folia', 'sponge', 'spigot', 'quilt'
      ];
      const selectedLoader: MinecraftLoader = validLoaders.includes(loader) ? loader : 'paper';
      const selectedVersion = (version || '1.21.4').trim();

      // Allocate dedicated server port
      const allocatedPort = db.getNextAvailablePort();
      const rconPort = allocatedPort + 1000;
      const rconPassword = `flux_${crypto.randomBytes(8).toString('hex')}`;

      // Java version auto-selection
      let javaVersion: 'Java 21' | 'Java 17' | 'Java 11' | 'Java 8' = 'Java 21';
      if (selectedVersion.startsWith('1.12') || selectedVersion.startsWith('1.13') || selectedVersion.startsWith('1.14') || selectedVersion.startsWith('1.15')) {
        javaVersion = 'Java 8';
      } else if (selectedVersion.startsWith('1.16')) {
        javaVersion = 'Java 11';
      } else if (selectedVersion.startsWith('1.17') || selectedVersion.startsWith('1.18') || selectedVersion.startsWith('1.19') || selectedVersion === '1.20' || selectedVersion === '1.20.1' || selectedVersion === '1.20.2' || selectedVersion === '1.20.3' || selectedVersion === '1.20.4') {
        javaVersion = 'Java 17';
      }

      const serverId = `mc_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
      const serverDir = path.join(DATA_DIR, 'servers', serverId);

      // 1. Check & Provision on Pterodactyl Panel if API is configured
      let pteroResult: any = null;
      let pteroError: string | null = null;
      const pteroConfig = pterodactyl.getConfig();

      if (pteroConfig.isConfigured) {
        try {
          console.log(`[Pterodactyl API] Creating server ${name.trim()} (${selectedLoader} ${selectedVersion}) on node ${pteroConfig.nodeId}...`);
          pteroResult = await pterodactyl.createServer({
            name: name.trim(),
            subdomain: cleanSubdomain,
            userEmail: req.user!.email,
            username: req.user!.username,
            loader: selectedLoader,
            version: selectedVersion,
            javaVersion,
            memoryMb: 3072, // 3 GB DDR4 RAM
            diskMb: 10240, // 10 GB NVMe SSD
            cpuLimit: 200, // 200% (2 vCPUs)
            port: allocatedPort,
          });
          console.log(`[Pterodactyl API] Server created with ID: ${pteroResult.serverId}, Identifier: ${pteroResult.identifier}`);
        } catch (err: any) {
          console.warn('[Pterodactyl API] Server creation notice:', err.message);
          pteroError = err.message;
        }
      }

      // 2. Download official server jar for fallback and binary tracking
      console.log(`[Minecraft Installer] Downloading official ${selectedLoader} ${selectedVersion} jar for ${cleanSubdomain}...`);
      const downloadResult = await downloadAndDeployMinecraftServer(selectedLoader, selectedVersion, serverDir);

      // Generate standard files
      const initialFiles = generateInitialServerFiles(
        name.trim(),
        cleanSubdomain,
        pteroResult?.port || allocatedPort,
        rconPort,
        rconPassword,
        selectedLoader,
        selectedVersion
      );

      // Add downloaded server.jar entry
      initialFiles.unshift({
        id: 'f_server_jar',
        name: 'server.jar',
        path: '/server.jar',
        type: 'file',
        sizeBytes: downloadResult.fileSizeBytes || 45000000,
        permissions: '0755',
        owner: 'mcuser',
        group: 'mcuser',
        updatedAt: new Date().toISOString(),
      });

      const newServer: MinecraftServerInstance = {
        id: serverId,
        ownerId: userId,
        name: name.trim(),
        subdomain: cleanSubdomain,
        domain: `${cleanSubdomain}.fluxhost.com.tr`,
        port: pteroResult?.port || allocatedPort,
        rconPort,
        rconPassword,
        loader: selectedLoader,
        version: selectedVersion,
        javaVersion,
        status: 'online',
        specs: {
          ramMb: 3072, // 3 GB DDR4 RAM
          vCpu: 2, // Xeon E5-2690 v4
          cpuModel: 'Intel Xeon E5-2690 v4 @ 3.50GHz',
          diskGb: 10, // 10 GB NVMe SSD
          networkBandwidth: '1 Gbit/s',
        },
        vdsNode: {
          name: 'Flux Dedicated Node #1 (Frankfurt)',
          ip: pteroResult?.ip || '194.26.183.40',
          cpu: 'Intel Xeon E5-2690 v4',
          totalRamGb: 64,
          nvmeStorage: 'Enterprise NVMe RAID-1',
        },
        motd: `Flux Hosting | ${name.trim()} [${selectedVersion}]`,
        maxPlayers: 20,
        onlinePlayersCount: 0,
        onlinePlayers: [],
        ops: [req.user!.username],
        whitelist: [],
        whitelistEnabled: false,
        bannedPlayers: [],
        properties: {
          motd: `Flux Hosting | ${name.trim()} [${selectedVersion}]`,
          'server-port': pteroResult?.port || allocatedPort,
          'max-players': 20,
          gamemode: 'survival',
          difficulty: 'normal',
          pvp: true,
          'allow-flight': false,
          'enable-command-block': true,
          'online-mode': true,
          'view-distance': 10,
          'simulation-distance': 8,
          'spawn-protection': 0,
          hardcore: false,
          'white-list': false,
        },
        files: initialFiles,
        plugins: [],
        mods: [],
        worlds: [
          {
            name: 'world',
            folderName: 'world',
            sizeMb: 14.2,
            environment: 'normal',
            lastModified: new Date().toISOString(),
          },
          {
            name: 'world_nether',
            folderName: 'world_nether',
            sizeMb: 4.8,
            environment: 'nether',
            lastModified: new Date().toISOString(),
          },
          {
            name: 'world_the_end',
            folderName: 'world_the_end',
            sizeMb: 2.1,
            environment: 'the_end',
            lastModified: new Date().toISOString(),
          },
        ],
        consoleLogs: [],
        consoleHistory: [],
        activityLogs: [
          {
            id: `act_${Date.now()}`,
            userId: req.user!.id,
            username: req.user!.username,
            action: 'SERVER_PROVISIONED',
            details: `Created Minecraft Server: ${cleanSubdomain}.fluxhost.com.tr (${selectedLoader.toUpperCase()} ${selectedVersion}) with 3 GB DDR4 RAM on Intel Xeon E5-2690 v4${pteroResult ? ` [Pterodactyl ID: ${pteroResult.serverId}]` : ''}`,
            ipAddress: '127.0.0.1',
            timestamp: new Date().toISOString(),
          },
        ],
        members: [],
        pterodactylServerId: pteroResult?.serverId,
        pterodactylIdentifier: pteroResult?.identifier,
        pterodactylUuid: pteroResult?.uuid,
        pterodactylAllocationId: pteroResult?.allocationId,
        pterodactylNodeId: pteroResult?.nodeId,
        pterodactylConnected: Boolean(pteroResult?.identifier),
        createdAt: new Date().toISOString(),
        uptimeStart: Date.now(),
      };

      // Add initial startup logs
      newServer.consoleLogs = generateInitialStartupLogs(newServer);

      db.createServer(newServer);

      // Send confirmation email
      sendEmail({
        to: req.user!.email,
        subject: `Your Minecraft Server ${newServer.domain} is Ready!`,
        type: 'server_alert',
        body: `Hello ${req.user!.username},\n\nYour Minecraft Server '${newServer.name}' has been successfully deployed on Flux Hosting!\n\nConnection Details:\n- Domain: ${newServer.domain}\n- Direct Port: ${newServer.port}\n- Server Software: ${selectedLoader.toUpperCase()} ${selectedVersion}\n- Allocated Resources: 3 GB DDR4 RAM, Intel Xeon E5-2690 v4, 10 GB NVMe\n\nYou can access your live web console and file manager at anytime in the Flux Hosting dashboard.`,
      });

      res.status(201).json(newServer);
    } catch (e: any) {
      console.error('Server creation error:', e);
      res.status(500).json({ error: `Failed to provision Minecraft server: ${e.message}` });
    }
  });

  // 13. Power Actions (Start, Stop, Restart, Kill)
  app.post('/api/servers/:id/power', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'power')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { action } = req.body;
    const validActions = ['start', 'stop', 'restart', 'kill'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    // 1. Forward action to Pterodactyl Panel if linked
    let pteroSynced = false;
    if (server.pterodactylIdentifier) {
      try {
        await pterodactyl.sendPowerAction(server.pterodactylIdentifier, action);
        pteroSynced = true;
      } catch (err: any) {
        console.warn(`[Pterodactyl] Power signal error:`, err.message);
      }
    }

    const ts = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

    db.updateServer(server.id, (s) => {
      if (action === 'start') {
        s.status = 'online';
        s.uptimeStart = Date.now();
        s.consoleLogs.push({
          id: `log_${Date.now()}`,
          timestamp: ts(),
          level: 'server',
          message: `[Flux Host] Starting Minecraft server ${s.name} (${s.domain}:${s.port})${pteroSynced ? ' on Pterodactyl node' : ''}...`,
        });
      } else if (action === 'stop') {
        s.status = 'offline';
        s.onlinePlayers = [];
        s.onlinePlayersCount = 0;
        s.consoleLogs.push({
          id: `log_${Date.now()}`,
          timestamp: ts(),
          level: 'info',
          thread: 'Server thread',
          message: `Saving chunks and world data. Server stopped cleanly.`,
        });
      } else if (action === 'restart') {
        s.status = 'online';
        s.uptimeStart = Date.now();
        s.consoleLogs.push({
          id: `log_${Date.now()}`,
          timestamp: ts(),
          level: 'server',
          message: `[Flux Host] Restarting server container on Intel Xeon E5-2690 v4...`,
        });
      } else if (action === 'kill') {
        s.status = 'offline';
        s.onlinePlayers = [];
        s.onlinePlayersCount = 0;
        s.consoleLogs.push({
          id: `log_${Date.now()}`,
          timestamp: ts(),
          level: 'warn',
          message: `[Flux Host] SIGKILL issued. Process terminated immediately.`,
        });
      }

      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: `POWER_${action.toUpperCase()}`,
        details: `Issued ${action.toUpperCase()} signal to server${pteroSynced ? ' (Pterodactyl Synced)' : ''}`,
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
    });

    res.json({ success: true, status: server.status, pterodactylSynced: pteroSynced, message: `Server ${action} command dispatched.` });
  });

  // 14. Live Minecraft Console & Log Stream
  app.get('/api/servers/:id/console', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'console')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    res.json({
      status: server.status,
      logs: server.consoleLogs.slice(-150),
      history: server.consoleHistory.slice(-20),
      pterodactylIdentifier: server.pterodactylIdentifier,
      pterodactylConnected: Boolean(server.pterodactylConnected),
    });
  });

  // 14b. Pterodactyl WebSocket Connection Details for Real-Time Console Streaming
  app.get('/api/servers/:id/websocket', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'console')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    if (!server.pterodactylIdentifier) {
      return res.json({
        supported: false,
        message: 'Pterodactyl identifier not linked. Using built-in local console stream.',
      });
    }

    try {
      const wsDetails = await pterodactyl.getWebsocketDetails(server.pterodactylIdentifier);
      res.json({
        supported: true,
        token: wsDetails.token,
        socket: wsDetails.socket,
        identifier: server.pterodactylIdentifier,
      });
    } catch (err: any) {
      res.json({
        supported: false,
        error: err.message,
        message: 'Could not generate Pterodactyl WebSocket token. Falling back to local console.',
      });
    }
  });

  // 15. Send Console Command
  app.post('/api/servers/:id/command', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'console')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command string is required.' });
    }

    // Forward to Pterodactyl API if linked
    if (server.pterodactylIdentifier) {
      try {
        await pterodactyl.sendCommand(server.pterodactylIdentifier, command);
      } catch (err: any) {
        console.warn(`[Pterodactyl] Command dispatch error:`, err.message);
      }
    }

    const result = executeMinecraftCommand(server, command);

    db.updateServer(server.id, (s) => {
      s.consoleLogs.push(result.logEntry);
      if (s.consoleLogs.length > 300) s.consoleLogs.shift();

      s.consoleHistory.unshift({
        id: `cmd_${Date.now()}`,
        command,
        output: result.output,
        exitCode: result.exitCode,
        timestamp: new Date().toISOString(),
      });
      if (s.consoleHistory.length > 50) s.consoleHistory.pop();
    });

    res.json(result);
  });

  // 16. Live Server Metrics
  app.get('/api/servers/:id/metrics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    let metrics = generateMinecraftMetrics(server);

    // If connected to Pterodactyl, query live telemetry from panel
    if (server.pterodactylIdentifier) {
      try {
        const pteroLive = await pterodactyl.getServerResources(server.pterodactylIdentifier);
        const usedRamMb = Math.round(pteroLive.memoryBytes / (1024 * 1024));
        const usedDiskGb = Number((pteroLive.diskBytes / (1024 * 1024 * 1024)).toFixed(2));
        const cpu = Math.round(pteroLive.cpuAbsolute);

        metrics = {
          ...metrics,
          cpuUsagePercent: cpu,
          ramUsedMb: usedRamMb || metrics.ramUsedMb,
          diskUsedGb: usedDiskGb || metrics.diskUsedGb,
          networkInMbps: Number((pteroLive.networkRxBytes / (1024 * 1024)).toFixed(2)),
          networkOutMbps: Number((pteroLive.networkTxBytes / (1024 * 1024)).toFixed(2)),
          uptimeSeconds: Math.round(pteroLive.uptimeMs / 1000) || metrics.uptimeSeconds,
        };

        const stateMap: Record<string, string> = {
          running: 'online',
          offline: 'offline',
          starting: 'starting',
          stopping: 'stopping',
        };
        if (stateMap[pteroLive.currentState] && server.status !== stateMap[pteroLive.currentState]) {
          db.updateServer(server.id, (s) => {
            s.status = stateMap[pteroLive.currentState] as any;
          });
        }
      } catch (err: any) {
        // Continue with metrics
      }
    }

    res.json(metrics);
  });

  // 17. Server Properties Management
  app.get('/api/servers/:id/properties', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });
    res.json(server.properties || {});
  });

  app.put('/api/servers/:id/properties', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'settings')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { properties } = req.body;
    if (!properties || typeof properties !== 'object') {
      return res.status(400).json({ error: 'Properties object is required.' });
    }

    db.updateServer(server.id, (s) => {
      s.properties = { ...s.properties, ...properties };
      if (properties.motd) s.motd = String(properties.motd);
      if (properties['max-players']) s.maxPlayers = Number(properties['max-players']);

      // Update server.properties file in file manager
      const propFileIdx = s.files.findIndex(f => f.name === 'server.properties');
      if (propFileIdx !== -1) {
        let content = `# Minecraft server properties\n# Modified via Flux Hosting Control Panel\n`;
        for (const [key, val] of Object.entries(s.properties)) {
          content += `${key}=${val}\n`;
        }
        s.files[propFileIdx].content = content;
        s.files[propFileIdx].sizeBytes = Buffer.byteLength(content, 'utf8');
        s.files[propFileIdx].updatedAt = new Date().toISOString();
      }

      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: 'PROPERTIES_UPDATED',
        details: 'Updated server.properties configuration',
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
    });

    res.json({ success: true, message: 'Server properties saved successfully.' });
  });

  // 18. Player Management (Ops, Whitelist, Bans)
  app.get('/api/servers/:id/players', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    res.json({
      onlinePlayers: server.onlinePlayers || [],
      onlineCount: server.onlinePlayersCount || 0,
      maxPlayers: server.maxPlayers || 20,
      ops: server.ops || [],
      whitelist: server.whitelist || [],
      whitelistEnabled: Boolean(server.whitelistEnabled),
      bannedPlayers: server.bannedPlayers || [],
    });
  });

  app.post('/api/servers/:id/players/action', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'players')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { action, username, reason } = req.body;
    if (!action || !username) return res.status(400).json({ error: 'Action and username are required.' });

    const cleanUser = String(username).trim();

    db.updateServer(server.id, (s) => {
      if (action === 'op') {
        if (!s.ops.includes(cleanUser)) s.ops.push(cleanUser);
      } else if (action === 'deop') {
        s.ops = s.ops.filter(o => o.toLowerCase() !== cleanUser.toLowerCase());
      } else if (action === 'whitelist_add') {
        if (!s.whitelist.includes(cleanUser)) s.whitelist.push(cleanUser);
      } else if (action === 'whitelist_remove') {
        s.whitelist = s.whitelist.filter(w => w.toLowerCase() !== cleanUser.toLowerCase());
      } else if (action === 'whitelist_toggle') {
        s.whitelistEnabled = !s.whitelistEnabled;
      } else if (action === 'kick') {
        s.onlinePlayers = s.onlinePlayers.filter(p => p.username.toLowerCase() !== cleanUser.toLowerCase());
        s.onlinePlayersCount = s.onlinePlayers.length;
      } else if (action === 'ban') {
        s.bannedPlayers = s.bannedPlayers.filter(b => b.username.toLowerCase() !== cleanUser.toLowerCase());
        s.bannedPlayers.push({
          username: cleanUser,
          reason: reason || 'Banned by operator',
          bannedAt: new Date().toISOString(),
          bannedBy: req.user!.username,
        });
        s.onlinePlayers = s.onlinePlayers.filter(p => p.username.toLowerCase() !== cleanUser.toLowerCase());
        s.onlinePlayersCount = s.onlinePlayers.length;
      } else if (action === 'unban') {
        s.bannedPlayers = s.bannedPlayers.filter(b => b.username.toLowerCase() !== cleanUser.toLowerCase());
      }

      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: `PLAYER_${action.toUpperCase()}`,
        details: `${action.toUpperCase()} player: ${cleanUser}`,
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
    });

    res.json({ success: true, message: `Player action ${action} completed.` });
  });

  // 19. Plugins Catalog & Management
  app.get('/api/servers/:id/plugins', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    res.json({
      installed: server.plugins || [],
      catalog: POPULAR_PLUGINS,
    });
  });

  app.post('/api/servers/:id/plugins/install', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { pluginName } = req.body;
    const target = POPULAR_PLUGINS.find(p => p.name.toLowerCase() === pluginName?.toLowerCase());
    if (!target) return res.status(404).json({ error: 'Plugin not found in catalog.' });

    db.updateServer(server.id, (s) => {
      const existingIdx = s.plugins.findIndex(p => p.name.toLowerCase() === target.name.toLowerCase());
      if (existingIdx === -1) {
        s.plugins.push({
          id: `pl_${Date.now()}`,
          name: target.name,
          version: target.version,
          author: target.author,
          description: target.description,
          fileName: target.fileName,
          enabled: true,
          category: target.category,
        });

        s.files.push({
          id: `f_plugin_${Date.now()}`,
          name: target.fileName,
          path: `/plugins/${target.fileName}`,
          type: 'file',
          sizeBytes: 1024 * 512,
          permissions: '0644',
          owner: 'mcuser',
          group: 'mcuser',
          updatedAt: new Date().toISOString(),
        });
      }
    });

    res.json({ success: true, message: `Installed plugin ${target.name}` });
  });

  // 20. Mods Catalog & Management
  app.get('/api/servers/:id/mods', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    res.json({
      installed: server.mods || [],
      catalog: POPULAR_MODS,
    });
  });

  app.post('/api/servers/:id/mods/install', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { modName } = req.body;
    const target = POPULAR_MODS.find(m => m.name.toLowerCase() === modName?.toLowerCase());
    if (!target) return res.status(404).json({ error: 'Mod not found in catalog.' });

    db.updateServer(server.id, (s) => {
      const existingIdx = s.mods.findIndex(m => m.name.toLowerCase() === target.name.toLowerCase());
      if (existingIdx === -1) {
        s.mods.push({
          id: `mod_${Date.now()}`,
          name: target.name,
          version: target.version,
          fileName: target.fileName,
          enabled: true,
          side: target.side,
          description: target.description,
        });

        s.files.push({
          id: `f_mod_${Date.now()}`,
          name: target.fileName,
          path: `/mods/${target.fileName}`,
          type: 'file',
          sizeBytes: 1024 * 768,
          permissions: '0644',
          owner: 'mcuser',
          group: 'mcuser',
          updatedAt: new Date().toISOString(),
        });
      }
    });

    res.json({ success: true, message: `Installed mod ${target.name}` });
  });

  // 21. File Manager API
  app.get('/api/servers/:id/files', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const currentPath = (req.query.path as string) || '/';

    // If server is linked to Pterodactyl, query panel files
    if (server.pterodactylIdentifier) {
      try {
        const pteroFiles = await pterodactyl.listFiles(server.pterodactylIdentifier, currentPath);
        const mappedFiles: ServerFileItem[] = pteroFiles.map(f => ({
          id: `ptero_${f.name}_${Date.now()}`,
          name: f.name,
          path: currentPath === '/' ? `/${f.name}` : `${currentPath}/${f.name}`,
          type: f.isFile ? 'file' : 'directory',
          sizeBytes: f.size,
          permissions: f.mode,
          owner: 'pterodactyl',
          group: 'pterodactyl',
          updatedAt: f.modifiedAt || new Date().toISOString(),
        }));

        return res.json({
          currentPath,
          items: mappedFiles,
          source: 'pterodactyl',
        });
      } catch (err: any) {
        console.warn('[Pterodactyl] Live file listing fallback:', err.message);
      }
    }

    res.json({
      currentPath,
      items: server.files || [],
      source: 'local',
    });
  });

  app.get('/api/servers/:id/files/content', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const filePath = req.query.path as string;

    if (server.pterodactylIdentifier) {
      try {
        const content = await pterodactyl.getFileContents(server.pterodactylIdentifier, filePath);
        return res.json({
          path: filePath,
          name: filePath.split('/').pop() || 'file',
          content: content,
          permissions: '0644',
          sizeBytes: Buffer.byteLength(content, 'utf8'),
          updatedAt: new Date().toISOString(),
          source: 'pterodactyl',
        });
      } catch (err: any) {
        console.warn('[Pterodactyl] File content fetch fallback:', err.message);
      }
    }

    const file = server.files.find(f => f.path === filePath || f.name === filePath);
    if (!file) return res.status(404).json({ error: 'File not found.' });

    res.json({
      path: file.path,
      name: file.name,
      content: file.content || '',
      permissions: file.permissions,
      sizeBytes: file.sizeBytes,
      updatedAt: file.updatedAt,
      source: 'local',
    });
  });

  app.post('/api/servers/:id/files', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { name, path: filePath, type, content, permissions } = req.body;
    const targetPath = filePath || `/${name}`;
    const targetType = type === 'directory' ? 'directory' : 'file';
    const now = new Date().toISOString();
    const size = targetType === 'directory' ? 4096 : Buffer.byteLength(content || '', 'utf8');

    if (server.pterodactylIdentifier && targetType === 'file') {
      try {
        await pterodactyl.writeFileContents(server.pterodactylIdentifier, targetPath, content || '');
      } catch (err: any) {
        console.warn('[Pterodactyl] Live file write error:', err.message);
      }
    } else if (server.pterodactylIdentifier && targetType === 'directory') {
      try {
        const parentDir = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const dirName = targetPath.split('/').pop() || 'folder';
        await pterodactyl.createFolder(server.pterodactylIdentifier, parentDir, dirName);
      } catch (err: any) {
        console.warn('[Pterodactyl] Live folder create error:', err.message);
      }
    }

    db.updateServer(server.id, (s) => {
      const idx = s.files.findIndex(f => f.path === targetPath);
      const fileName = name || targetPath.split('/').pop() || 'file';

      if (idx !== -1) {
        s.files[idx].content = content;
        s.files[idx].sizeBytes = size;
        if (permissions) s.files[idx].permissions = permissions;
        s.files[idx].updatedAt = now;
      } else {
        s.files.push({
          id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: fileName,
          path: targetPath,
          type: targetType,
          sizeBytes: size,
          permissions: permissions || (targetType === 'directory' ? '0755' : '0644'),
          owner: 'mcuser',
          group: 'mcuser',
          updatedAt: now,
          content: targetType === 'file' ? (content || '') : undefined,
        });
      }

      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: targetType === 'directory' ? 'DIR_CREATED' : 'FILE_SAVED',
        details: `${targetType === 'directory' ? 'Created directory' : 'Saved file'}: ${targetPath}`,
        ipAddress: '127.0.0.1',
        timestamp: now,
      });
    });

    res.json({ success: true, message: `Successfully saved ${targetPath}` });
  });

  app.delete('/api/servers/:id/files', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (!checkServerPermission(server, req.user!.id, 'files')) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { path: bodyPath } = req.body || {};
    const queryPath = req.query.path as string;
    const filePath = bodyPath || queryPath;

    if (!filePath) return res.status(400).json({ error: 'File path is required.' });

    if (server.pterodactylIdentifier) {
      try {
        const rootDir = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
        const targetFile = filePath.split('/').pop() || filePath;
        await pterodactyl.deleteFiles(server.pterodactylIdentifier, rootDir, [targetFile]);
      } catch (err: any) {
        console.warn('[Pterodactyl] Live file delete error:', err.message);
      }
    }

    db.updateServer(server.id, (s) => {
      s.files = s.files.filter(f => f.path !== filePath && !f.path.startsWith(filePath + '/'));
      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: 'FILE_DELETE',
        details: `Deleted: ${filePath}`,
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
    });

    res.json({ success: true, message: `Deleted ${filePath}` });
  });

  // 22. Worlds & Backups
  app.get('/api/servers/:id/worlds', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });
    res.json(server.worlds || []);
  });

  app.post('/api/servers/:id/worlds/reset-dimension', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    const { dimension } = req.body;
    if (!dimension || (dimension !== 'nether' && dimension !== 'the_end')) {
      return res.status(400).json({ error: 'Invalid dimension. Must be nether or the_end.' });
    }

    db.updateServer(server.id, (s) => {
      s.consoleLogs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        level: 'info',
        message: `[Flux Host] Resetting ${dimension.toUpperCase()} dimension chunks and regenerating terrain seed.`,
      });

      s.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: req.user!.id,
        username: req.user!.username,
        action: 'WORLD_RESET_DIMENSION',
        details: `Reset ${dimension.toUpperCase()} dimension`,
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
    });

    res.json({ success: true, message: `Successfully reset ${dimension} dimension.` });
  });

  // 23. Delete Server
  app.delete('/api/servers/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const server = db.findServerById(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found.' });

    if (server.ownerId !== req.user!.id && req.user!.role !== 'owner') {
      return res.status(403).json({ error: 'Only the server owner can delete this server.' });
    }

    if (server.pterodactylServerId) {
      try {
        await pterodactyl.deleteServer(server.pterodactylServerId);
      } catch (err: any) {
        console.warn('[Pterodactyl] Panel server deletion notice:', err.message);
      }
    }

    db.deleteServer(server.id);

    res.json({ success: true, message: 'Minecraft server terminated and resources released back to VDS node.' });
  });

  // ==================== PTERODACTYL VDS BINDING & CONNECTION MANAGEMENT ====================

  // Dedicated Operator VDS Binding Endpoint (/admin/vds/connect)
  app.post('/api/admin/vds/connect', requireAuth, requireVdsOperator, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { panelUrl, apiKey, clientApiKey, nodeId, nestId, eggId, locationId } = req.body;

      if (!panelUrl || !apiKey) {
        return res.status(400).json({
          error: 'Panel URL and Application API Key (ptla_...) are required to bind the VDS.',
        });
      }

      const cleanPanelUrl = String(panelUrl).trim().replace(/\/+$/, '');
      const cleanApiKey = String(apiKey).trim();
      const cleanClientKey = clientApiKey ? String(clientApiKey).trim() : cleanApiKey;

      // Run comprehensive diagnostic test against the Pterodactyl panel
      const testResult = await pterodactyl.testConnection({
        panelUrl: cleanPanelUrl,
        apiKey: cleanApiKey,
        clientApiKey: cleanClientKey,
      });

      if (!testResult.appApiWorking && !testResult.clientApiWorking && !testResult.success) {
        return res.status(400).json({
          error: `VDS Connection Test Failed: ${testResult.message || 'Unable to reach Pterodactyl panel'}`,
          diagnostic: testResult,
        });
      }

      // Permanently save to application database
      const updated = db.updatePterodactylConfig({
        panelUrl: cleanPanelUrl,
        apiKey: cleanApiKey,
        clientApiKey: cleanClientKey,
        nodeId: nodeId !== undefined ? Number(nodeId) : 1,
        nestId: nestId !== undefined ? Number(nestId) : 1,
        eggId: eggId !== undefined ? Number(eggId) : 1,
        locationId: locationId !== undefined ? Number(locationId) : 1,
        isConfigured: true,
        status: 'connected',
        lastChecked: new Date().toISOString(),
        errorMessage: undefined,
      });

      res.json({
        success: true,
        verified: true,
        message: 'Pterodactyl VDS successfully bound and verified. All Minecraft server deployments will now target this VDS node.',
        config: {
          panelUrl: updated.panelUrl,
          nodeId: updated.nodeId,
          nestId: updated.nestId,
          eggId: updated.eggId,
          locationId: updated.locationId,
          isConfigured: updated.isConfigured,
          status: updated.status,
          hasApiKey: true,
          hasClientApiKey: Boolean(updated.clientApiKey),
          lastChecked: updated.lastChecked,
        },
        diagnostic: testResult,
      });
    } catch (err: any) {
      console.error('VDS Connect Error:', err);
      res.status(500).json({ error: err.message || 'Failed to establish VDS connection.' });
    }
  });

  // Dedicated Operator VDS Status Endpoint (/admin/vds/status)
  app.get('/api/admin/vds/status', requireAuth, requireVdsOperator, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const config = pterodactyl.getConfig();
      let nodes: any[] = [];
      let nests: any[] = [];

      if (config.isConfigured && config.apiKey) {
        try {
          nodes = await pterodactyl.getNodes();
        } catch (e) {
          // ignore error if offline
        }
        try {
          nests = await pterodactyl.getNestsAndEggs();
        } catch (e) {
          // ignore error
        }
      }

      res.json({
        config: {
          panelUrl: config.panelUrl,
          apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}` : '',
          hasApiKey: Boolean(config.apiKey),
          clientApiKey: config.clientApiKey ? `${config.clientApiKey.slice(0, 8)}...${config.clientApiKey.slice(-4)}` : '',
          hasClientApiKey: Boolean(config.clientApiKey),
          nodeId: config.nodeId,
          nestId: config.nestId,
          eggId: config.eggId,
          locationId: config.locationId,
          isConfigured: config.isConfigured,
          status: config.status,
          lastChecked: config.lastChecked,
          errorMessage: config.errorMessage,
        },
        nodes,
        nests,
        operator: {
          username: req.user!.username,
          hasPermission: true,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve VDS status.' });
    }
  });

  // VDS Disconnect / Unbind Endpoint
  app.post('/api/admin/vds/disconnect', requireAuth, requireVdsOperator, (req: AuthenticatedRequest, res: Response) => {
    const updated = db.updatePterodactylConfig({
      apiKey: '',
      clientApiKey: '',
      isConfigured: false,
      status: 'unconfigured',
      errorMessage: undefined,
    });
    res.json({ success: true, message: 'VDS configuration unlinked successfully.', config: updated });
  });

  // Alias & Standard Pterodactyl settings endpoints
  app.get('/api/pterodactyl/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const config = pterodactyl.getConfig();
    res.json({
      panelUrl: config.panelUrl,
      apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}` : '',
      hasApiKey: Boolean(config.apiKey),
      clientApiKey: config.clientApiKey ? `${config.clientApiKey.slice(0, 8)}...${config.clientApiKey.slice(-4)}` : '',
      hasClientApiKey: Boolean(config.clientApiKey),
      nodeId: config.nodeId,
      nestId: config.nestId,
      eggId: config.eggId,
      locationId: config.locationId,
      isConfigured: config.isConfigured,
      status: config.status,
      lastChecked: config.lastChecked,
      errorMessage: config.errorMessage,
    });
  });

  app.post('/api/pterodactyl/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { panelUrl, apiKey, clientApiKey, nodeId, nestId, eggId, locationId } = req.body;

    const current = pterodactyl.getConfig();
    const updated = db.updatePterodactylConfig({
      panelUrl: panelUrl !== undefined ? String(panelUrl).trim() : current.panelUrl,
      ...(apiKey ? { apiKey: String(apiKey).trim() } : {}),
      ...(clientApiKey ? { clientApiKey: String(clientApiKey).trim() } : {}),
      nodeId: nodeId !== undefined ? Number(nodeId) : current.nodeId,
      nestId: nestId !== undefined ? Number(nestId) : current.nestId,
      eggId: eggId !== undefined ? Number(eggId) : current.eggId,
      locationId: locationId !== undefined ? Number(locationId) : current.locationId,
      isConfigured: Boolean((apiKey || current.apiKey) && (panelUrl || current.panelUrl)),
    });

    res.json({ success: true, config: updated });
  });

  app.post('/api/pterodactyl/test', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { panelUrl, apiKey, clientApiKey } = req.body || {};
    const result = await pterodactyl.testConnection({
      ...(panelUrl ? { panelUrl: String(panelUrl).trim() } : {}),
      ...(apiKey ? { apiKey: String(apiKey).trim() } : {}),
      ...(clientApiKey ? { clientApiKey: String(clientApiKey).trim() } : {}),
    });
    res.json(result);
  });

  app.get('/api/pterodactyl/nodes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const nodes = await pterodactyl.getNodes();
    res.json(nodes);
  });

  app.get('/api/pterodactyl/nests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const nests = await pterodactyl.getNestsAndEggs();
    res.json(nests);
  });

  // ==================== SMTP SETTINGS & LOGS ====================

  app.get('/api/smtp/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const config = db.getSmtpConfig();
    res.json({
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      isConfigured: config.isConfigured,
    });
  });

  app.post('/api/smtp/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
    const updated = db.updateSmtpConfig({
      host,
      port: Number(port) || 587,
      secure: Boolean(secure),
      user,
      ...(pass ? { pass } : {}),
      fromName,
      fromEmail,
      isConfigured: Boolean(host && user),
    });

    res.json({ success: true, config: updated });
  });

  app.post('/api/smtp/test', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { testEmail } = req.body;
    const target = testEmail || req.user!.email;
    const result = await testSmtpConnection(target);
    res.json(result);
  });

  app.get('/api/smtp/logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json(db.getEmailLogs());
  });


  return app;
}

export const app = createApp();
export default app;
