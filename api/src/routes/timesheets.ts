import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { TimesheetSchema } from '../domain/types';
import { handleError } from '../lib/errorHandler';
import { z } from 'zod';

export const timesheets = Router();

timesheets.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = TimesheetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: z.flattenError(parsed.error),
      });
    }

    const data = parsed.data;

    const startDate = data.periodStart;
    const endDate = data.periodEnd;

    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'periodStart must be before periodEnd',
      });
    }

    const ts = await db.$transaction(async (tx) => {
      await tx.timesheet.deleteMany({
        where: {
          employeeId: data.employeeId,
          periodStart: startDate,
          periodEnd: endDate,
        },
      });

      const newTimesheet = await tx.timesheet.create({
        data: {
          employeeId: data.employeeId,
          periodStart: startDate,
          periodEnd: endDate,
          allowances: data.allowances,
          entries: {
            create: data.entries.map((e) => ({
              date: new Date(e.date),
              start: e.start,
              end: e.end,
              unpaidBreakMins: e.unpaidBreakMins,
            })),
          },
        },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
        include: {
          entries: {
            omit: {
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return newTimesheet;
    });
    res.status(201).json(ts);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});
