import jwt, { Secret, SignOptions } from 'jsonwebtoken';

// 确保 JWT_SECRET 有默认回退机制，且明确类型为 Secret
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-default-secret-key';

export function signToken(payload: object, expiresIn: SignOptions['expiresIn'] = '1h') {
  // 将 options 明确断言为 SignOptions，或者给 expiresIn 显式指定正确的 SignOptions['expiresIn'] 类型
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}