import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// Middleware to verify session token (cookie-based)
export const verifySession = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session found, please login'
      });
    }

    const session = await prisma.session.findFirst({
      where: {
        sessionToken,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    if (!session) {
      res.clearCookie('session_token');
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid, please login again'
      });
    }

    req.user = session.user;

    next();

  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware that accepts either JWT or Session
export const authenticate = async (req, res, next) => {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }

  // Fall back to session
  const sessionToken = req.cookies.session_token;
  if (sessionToken) {
    return verifySession(req, res, next);
  }

  // No authentication found
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires ${roles.join(' or ')} role`
      });
    }

    next();
  };
};
