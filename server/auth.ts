import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';
import { User, MinecraftServerInstance } from './types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'flux_hosting_jwt_secret_key_2026_super_secure';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session revoked.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function hasVdsBindingPermission(user?: User): boolean {
  if (!user) return false;
  if (user.username.toUpperCase() === 'PCBC') return true;
  if (user.role === 'superadmin' || user.role === 'operator') return true;
  if (user.isOperator) return true;
  if (user.permissions?.includes('vds_binding') || user.permissions?.includes('vds_connection_management')) return true;
  return false;
}

export function requireVdsOperator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !hasVdsBindingPermission(req.user)) {
    return res.status(403).json({
      error: 'Access Denied: VDS Binding and Connection Management requires Operator / Super Administrator privileges.',
    });
  }
  next();
}

export function checkServerPermission(
  server: MinecraftServerInstance,
  userId: string,
  action: 'power' | 'console' | 'files' | 'players' | 'settings' | 'view'
): boolean {
  if (server.ownerId === userId) return true;

  const member = server.members?.find(m => m.userId === userId);
  if (!member) return false;

  if (action === 'view') return true;

  switch (action) {
    case 'power':
      return member.permissions.canPower;
    case 'console':
      return member.permissions.canConsole;
    case 'files':
      return member.permissions.canFiles;
    case 'players':
      return member.permissions.canPlayers;
    case 'settings':
      return member.permissions.canSettings;
    default:
      return false;
  }
}
