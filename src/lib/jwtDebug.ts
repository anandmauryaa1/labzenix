/**
 * JWT Debugging Utility
 * Use this in the browser console to verify and decode JWT tokens
 */

export function decodeJWT(token: string) {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode header
    const header = JSON.parse(atob(parts[0]));
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));

    return {
      header,
      payload,
      signature: parts[2],
      decoded: {
        algorithm: header.alg,
        type: header.typ,
        userId: payload.id,
        role: payload.role,
        username: payload.username,
        name: payload.name,
        email: payload.email,
        permissions: payload.permissions,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isExpired: Date.now() > payload.exp * 1000,
      },
    };
  } catch (error: any) {
    console.error('Failed to decode JWT:', error.message);
    return null;
  }
}

/**
 * Get JWT from cookies
 */
export function getJWTFromCookie(): string | null {
  const name = 'admin_token';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Verify and display JWT info in console
 */
export function verifyJWT() {
  const token = getJWTFromCookie();
  if (!token) {
    console.log('❌ No JWT token found in cookies');
    return null;
  }

  const decoded = decodeJWT(token);
  if (!decoded) {
    console.log('❌ Failed to decode JWT');
    return null;
  }

  console.log('✅ JWT Token Valid');
  console.log('📋 Token Info:', {
    user: `${decoded.decoded.name} (${decoded.decoded.username})`,
    role: decoded.decoded.role,
    email: decoded.decoded.email,
    permissions: decoded.decoded.permissions,
    issuedAt: decoded.decoded.issuedAt,
    expiresAt: decoded.decoded.expiresAt,
    isExpired: decoded.decoded.isExpired ? '❌ EXPIRED' : '✅ VALID',
  });

  return decoded;
}

/**
 * Display JWT in browser console
 * Usage in browser console: displayJWT()
 */
export function displayJWT() {
  const token = getJWTFromCookie();
  if (!token) {
    console.log('❌ No JWT token found');
    return;
  }

  console.log('%c JWT Token ', 'background: #222; color: #bada55; padding: 5px;');
  console.log(token);
  console.log('');

  verifyJWT();
}
