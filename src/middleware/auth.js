import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js';

export const protect = async (req, res, next) => {
  let token;
  token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (token == undefined) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
        },
      });

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized, token failed' });
      }
      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized, token failed',
        error: error.message,
      });
    }
  }
};
