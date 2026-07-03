import { SignJWT, jwtVerify } from 'jose';

// Ensure this is securely set in your .env.local
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_development_secret_only');

export async function signAccessToken(payload, expiresIn = '24h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}