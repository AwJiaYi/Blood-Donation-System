import { verifyToken } from '@/lib/jwt';
import { JwtPayload } from 'jsonwebtoken';

// 🎯 定义具体的 User Payload 结构
export interface AuthUser extends JwtPayload {
  id?: string;
  email?: string;
  role?: string;
}

export function getUserFromRequest(req: Request): AuthUser | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

  if (!token) return null;

  const decoded = verifyToken(token);
  
  // 确保 decoded 存在且是个对象（不是纯 string）
  if (decoded && typeof decoded === 'object') {
    return decoded as AuthUser;
  }

  return null;
}

export function requireAdminOrThrow(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return user;
}