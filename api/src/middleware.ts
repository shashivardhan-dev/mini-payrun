import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';

const authenticate = (req:Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Missing token" });

  const JWT_SECRET = process.env.JWT_SECRET || "";

  jwt.verify(token, JWT_SECRET, (err:unknown) => {
    if (err) return res.status(401).json({ message: "Invalid or expired token" });
    next();
  });
};

export default authenticate