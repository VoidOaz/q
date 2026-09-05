import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, MinecraftServerInstance, SmtpConfig, EmailLog, PterodactylConfig } from './types.ts';

export const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'flux_data')
  : path.join(process.cwd(), 'data');
export const DB_FILE = path.join(DATA_DIR, 'flux_mc_db.json');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'flux_hosting_master_aes256_key_32chars!';

// Pre-registered Operator / Super Administrator User PCBC
const SEED_PCBC_USER: User = {
  id: 'usr_pcbc_superadmin',
  username: 'PCBC',
  email: 'pcbc@fluxhost.local',
  passwordHash: bcrypt.hashSync('PCBCAdmin123!', 10),
  role: 'superadmin',
  isOperator: true,
  permissions: [
    'vds_binding',
    'vds_connection_management',
    'system_admin',
    'manage_servers',
    'manage_nodes',
    'operator',
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export function encryptString(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch {
    return text;
  }
}

export function decryptString(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText;
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText;
  }
}

interface DatabaseSchema {
  users: User[];
  servers: MinecraftServerInstance[];
  smtp: SmtpConfig;
  pterodactyl: PterodactylConfig;
  emailLogs: EmailLog[];
  resetTokens: { email: string; token: string; expiresAt: number }[];
}

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Database] DATA_DIR creation notice:', err);
  }
}

function getInitialDatabase(): DatabaseSchema {
  const defaultSmtp: SmtpConfig = {
    host: 'smtp.fluxhosting.io',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: 'Flux Hosting - Minecraft',
    fromEmail: 'noreply@fluxhosting.io',
    isConfigured: false,
  };

  const defaultPterodactyl: PterodactylConfig = {
    panelUrl: 'https://panel.fluxhost.com.tr',
    apiKey: '',
    clientApiKey: '',
    nodeId: 1,
    nestId: 1,
    eggId: 1,
    locationId: 1,
    isConfigured: false,
    status: 'unconfigured',
  };

  return {
    users: [SEED_PCBC_USER],
    servers: [],
    smtp: defaultSmtp,
    pterodactyl: defaultPterodactyl,
    emailLogs: [],
    resetTokens: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDir();
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      let fileToRead = DB_FILE;
      if (!fs.existsSync(fileToRead)) {
        const bundledFile = path.join(process.cwd(), 'data', 'flux_mc_db.json');
        if (fs.existsSync(bundledFile)) {
          fileToRead = bundledFile;
        }
      }

      if (fs.existsSync(fileToRead)) {
        const raw = fs.readFileSync(fileToRead, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.servers)) {
          const schema: DatabaseSchema = {
            users: parsed.users,
            servers: parsed.servers,
            smtp: parsed.smtp || getInitialDatabase().smtp,
            pterodactyl: parsed.pterodactyl || getInitialDatabase().pterodactyl,
            emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
            resetTokens: Array.isArray(parsed.resetTokens) ? parsed.resetTokens : [],
          };

          // Ensure pre-registered Superadmin / Operator PCBC always exists with VDS Binding permissions
          const pcbcIdx = schema.users.findIndex(u => u.username.toLowerCase() === 'pcbc');
          if (pcbcIdx === -1) {
            schema.users.push(SEED_PCBC_USER);
          } else {
            schema.users[pcbcIdx].role = 'superadmin';
            schema.users[pcbcIdx].isOperator = true;
            schema.users[pcbcIdx].permissions = [
              'vds_binding',
              'vds_connection_management',
              'system_admin',
              'manage_servers',
              'manage_nodes',
              'operator',
            ];
          }

          return schema;
        }
      }
    } catch (e) {
      console.warn('Initializing fresh production Minecraft database:', e);
    }

    const initData = getInitialDatabase();
    this.save(initData);
    return initData;
  }

  private save(dataToSave?: DatabaseSchema): void {
    ensureDataDir();
    const data = dataToSave || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing flux_mc_db.json:', err);
    }
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByUsername(username: string): User | undefined {
    const clean = username.toLowerCase().trim();
    return this.data.users.find(u => u.username.toLowerCase() === clean);
  }

  public findUserByUsernameOrEmail(identifier: string): User | undefined {
    const clean = identifier.toLowerCase().trim();
    return this.data.users.find(u => u.username.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean));
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, partial: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...partial };
    this.save();
    return this.data.users[idx];
  }

  // --- Minecraft Servers ---
  public getAllServers(): MinecraftServerInstance[] {
    return this.data.servers;
  }

  public getServersForUser(userId: string): MinecraftServerInstance[] {
    return this.data.servers.filter(s => {
      if (s.ownerId === userId) return true;
      return s.members?.some(m => m.userId === userId);
    });
  }

  public findServerByOwnerId(ownerId: string): MinecraftServerInstance | undefined {
    return this.data.servers.find(s => s.ownerId === ownerId);
  }

  public findServerById(id: string): MinecraftServerInstance | undefined {
    return this.data.servers.find(s => s.id === id);
  }

  public findServerBySubdomain(subdomain: string): MinecraftServerInstance | undefined {
    return this.data.servers.find(s => s.subdomain.toLowerCase() === subdomain.toLowerCase());
  }

  public getNextAvailablePort(): number {
    const usedPorts = new Set(this.data.servers.map(s => s.port));
    let startPort = 25565;
    while (usedPorts.has(startPort)) {
      startPort++;
    }
    return startPort;
  }

  public createServer(server: MinecraftServerInstance): MinecraftServerInstance {
    this.data.servers.push(server);
    this.save();
    return server;
  }

  public updateServer(id: string, updater: (server: MinecraftServerInstance) => void): MinecraftServerInstance | undefined {
    const srv = this.data.servers.find(s => s.id === id);
    if (!srv) return undefined;
    updater(srv);
    this.save();
    return srv;
  }

  public deleteServer(id: string): boolean {
    const initialLen = this.data.servers.length;
    this.data.servers = this.data.servers.filter(s => s.id !== id);
    if (this.data.servers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- SMTP Settings ---
  public getSmtpConfig(): SmtpConfig {
    return this.data.smtp;
  }

  public updateSmtpConfig(config: Partial<SmtpConfig>): SmtpConfig {
    this.data.smtp = { ...this.data.smtp, ...config };
    this.save();
    return this.data.smtp;
  }

  // --- Pterodactyl Settings ---
  public getPterodactylConfig(): PterodactylConfig {
    return this.data.pterodactyl;
  }

  public updatePterodactylConfig(config: Partial<PterodactylConfig>): PterodactylConfig {
    this.data.pterodactyl = { ...this.data.pterodactyl, ...config };
    this.save();
    return this.data.pterodactyl;
  }

  // --- Email Logs ---
  public getEmailLogs(): EmailLog[] {
    return this.data.emailLogs;
  }

  public addEmailLog(log: Omit<EmailLog, 'id' | 'sentAt'> & { id?: string; sentAt?: string }): EmailLog {
    const fullLog: EmailLog = {
      id: log.id || `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: log.sentAt || new Date().toISOString(),
      to: log.to,
      subject: log.subject,
      type: log.type,
      status: log.status,
      errorMessage: log.errorMessage,
      previewBody: log.previewBody,
    };
    this.data.emailLogs.unshift(fullLog);
    if (this.data.emailLogs.length > 100) {
      this.data.emailLogs.pop();
    }
    this.save();
    return fullLog;
  }

  // --- Reset Tokens ---
  public saveResetToken(email: string, token: string, expiresAt: number): void {
    this.data.resetTokens = this.data.resetTokens.filter(t => t.email !== email);
    this.data.resetTokens.push({ email, token, expiresAt });
    this.save();
  }

  public verifyResetToken(email: string, token: string): boolean {
    const record = this.data.resetTokens.find(t => t.email === email && t.token === token);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.data.resetTokens = this.data.resetTokens.filter(t => t !== record);
      this.save();
      return false;
    }
    return true;
  }

  public consumeResetToken(email: string, token: string): void {
    this.data.resetTokens = this.data.resetTokens.filter(t => !(t.email === email && t.token === token));
    this.save();
  }
}

export const db = new Database();
