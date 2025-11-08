import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

export function handleError(err: unknown, res: Response) {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Duplicate record' });
      case 'P2003':
        return res.status(409).json({ error: 'Foreign key constraint failed' });
      case 'P2025':
        return res.status(404).json({ error: 'Record not found' });
      case 'P2023':
        return res.status(400).json({ error: 'Bad request' });
      default:
        return res.status(400).json({ error: `Database error (${err.code})` });
    }
  }

  // Default for non-Prisma errors
  return res.status(500).json({
    error: 'Internal server error',
    details: err instanceof Error ? err.message : 'Unknown error',
  });
}
