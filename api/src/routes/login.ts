import { Router, Response, Request } from 'express';
import jwt from 'jsonwebtoken';

export const login = Router();

login.post('/', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const USER = {
    email: 'demo@gmail.com',
    password: 'Demo@123',
  };

  const JWT_SECRET = process.env.JWT_SECRET || '';

  const TOKEN_EXPIRY = '24h';

  if (email === USER.email && password === USER.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return res.json({
      token,
      expiresIn: 360000,
      user: { email },
    });
  }

  return res.status(401).json({ message: 'Invalid email or password' });
});

