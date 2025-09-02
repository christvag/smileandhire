import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { prisma } from '@worky-happy/database';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // const user = await prisma.user.findUnique({
    //   where: { id: decoded.userId },
    //   select: { id: true, role: true, email: true, isBanned: true, isVerified: true }
    // });

    // if (!user) {
    //   return res.status(401).json({ error: 'User not found' });
    // }

    // if (user.isBanned) {
    //   return res.status(403).json({ error: 'Account has been banned' });
    // }

    // if (!user.isVerified) {
    //   return res.status(403).json({ error: 'Account not verified' });
    // }

    // req.user = {
    //   id: user.id,
    //   role: user.role,
    //   email: user.email,
    // };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};