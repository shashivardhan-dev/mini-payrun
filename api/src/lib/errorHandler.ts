import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { recordError } from "./../routes/metrics";

export function handleError(err: unknown, res: Response) {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        recordError("Duplicate record");
        return res.status(409).json({ error: 'Duplicate record' });
      case 'P2003':
        recordError("Foreign key constraint failed");
        return res.status(409).json({ error: 'Foreign key constraint failed' });
      case 'P2025':
        recordError("Record not found");
        return res.status(404).json({ error: 'Record not found' });
      case 'P2023':
        recordError("Bad request");
        return res.status(400).json({ error: 'Bad request' });
      default:
        recordError(`Database error (${err.code})`);
        return res.status(400).json({ error: `Database error (${err.code})` });
    }
  }

  recordError( err instanceof Error ? err.message : 'Unknown error');

  // Default for non-Prisma errors
  return res.status(500).json({
    error: 'Internal server error',
    details: err instanceof Error ? err.message : 'Unknown error',
  });
}
