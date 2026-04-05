import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './auth';
import { AuthenticationError, AuthorizationError } from './errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function withAuth(request: NextRequest): Promise<{ user: any; response: null } | { user: null; response: NextResponse }> {
  const token = extractToken(request.headers.get('authorization') || '');

  if (!token) {
    const error = new AuthenticationError('Missing authorization token');
    return {
      user: null,
      response: NextResponse.json(
        {
          status: error.statusCode,
          code: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      ),
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    const error = new AuthenticationError('Invalid or expired token');
    return {
      user: null,
      response: NextResponse.json(
        {
          status: error.statusCode,
          code: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      ),
    };
  }

  return {
    user: {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    response: null,
  };
}

/**
 * Middleware to check user role
 */
export function requireRole(...roles: string[]) {
  return (userRole: string): boolean => roles.includes(userRole);
}

/**
 * Get error response for authorization failure
 */
export function getUnauthorizedResponse() {
  const error = new AuthorizationError('You do not have permission to access this resource');
  return NextResponse.json(
    {
      status: error.statusCode,
      code: error.code,
      message: error.message,
    },
    { status: error.statusCode }
  );
}
