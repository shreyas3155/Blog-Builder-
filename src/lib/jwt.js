import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-please-change';

/**
 * Signs a payload to generate a JWT token.
 * @param {object} payload - The payload to sign (typically { id, email, role }).
 * @returns {string} The signed JWT.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token.
 * @param {string} token - The token to verify.
 * @returns {object|null} The decoded payload if valid, or null.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
