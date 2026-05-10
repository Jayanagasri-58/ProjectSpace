import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_super_secret_key_2026';
const JWT_EXPIRY = '7d';

export function signToken(payload: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}
