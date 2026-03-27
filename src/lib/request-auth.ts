import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

type AuthContext = {
  userId: string;
  email?: string;
};

const fallbackUserId = '000000000000000000000000';

const getTokenFromRequest = (req: NextRequest) => {
  const bearerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (bearerToken) {
    return bearerToken;
  }

  return req.cookies.get('token')?.value || '';
};

export const getAuthContext = (req: NextRequest): AuthContext => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { userId: fallbackUserId };
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '1234567890');
    return {
      userId: decoded.userId || decoded.id || fallbackUserId,
      email: decoded.email,
    };
  } catch {
    return { userId: fallbackUserId };
  }
};
