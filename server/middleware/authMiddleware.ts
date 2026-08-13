import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store';

const JWT_SECRET = process.env.JWT_SECRET || 'safecity_super_secret_jwt_key_2026_university_project';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await dbStore.getUserById(decoded.id || decoded._id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      console.warn(`JWT Auth Warning: ${error.message}`);
    } else {
      console.error('JWT Verification error:', error);
    }
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
