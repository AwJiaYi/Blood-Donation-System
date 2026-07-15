import { verifyToken } from './jwt';

export function getTokenFromRequest(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);

  const cookie = req.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('token='));
  if (!match) return null;
  return match.split('=')[1];
}

export function getUserFromRequest(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return payload;
  } catch (err) {
    return null;
  }
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
