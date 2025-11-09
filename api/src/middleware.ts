import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { recordError } from "./routes/metrics";

const authenticate = (req:Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    recordError("Missing token");
     return res.status(401).json({ message: "Missing token" });
  }
  const JWT_SECRET = process.env.JWT_SECRET || "";

  jwt.verify(token, JWT_SECRET, (err:unknown) => {
    if (err) {
      recordError("Invalid or expired token");
       return res.status(401).json({ message: "Invalid or expired token" });
    }
    next();
  });
};

export default authenticate