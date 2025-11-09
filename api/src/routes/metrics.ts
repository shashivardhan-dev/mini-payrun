import { Router, Request, Response } from "express";

export const metrics = Router();

let requests = 0;
const errors: { message: string; time: string }[] = [];
const startTime = Date.now();

export function countRequest() {
  requests++;
}

export function recordError(error: Error | string) {
  errors.push({
    message: typeof error === "string" ? error : error.message,
    time: new Date().toISOString(),
  });

  if (errors.length > 100) errors.shift();
}

 metrics.get("/", (_req:Request, res:Response)=> {
  const now = Date.now();
  const uptimeSeconds = Math.round((now - startTime) / 1000);
  const memory = process.memoryUsage();

  return res.status(200).json({ 
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    requestsTotal: requests,
    errors, 
    memoryUsageMb: Math.round(memory.rss / 1024 / 1024),
  });
})
