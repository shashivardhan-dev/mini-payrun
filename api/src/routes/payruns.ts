import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { PayrunRequestSchema } from '../domain/types';
import { calcHours, calcPay } from '../domain/calc';
import { handleError } from '../lib/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { EmployeeType } from '@prisma/client';
import { recordError } from '../routes/metrics';

export const payruns = Router();

payruns.get('/', async (_req: Request, res: Response) => {
  try {
    const payruns = await db.payrun.findMany({
      omit: {
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!payruns) {
      recordError('No payruns found');
      return res.status(404).json({ error: 'No payruns found' });
    }
    return res.status(200).json(payruns);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});

payruns.get('/:id', async (req: Request, res: Response) => {
  try {
    const payruns = await db.payrun.findUnique({
      where: { id: req.params.id },
      select: {
        payrunRequest: true,
      },
    });

    if (!payruns) {
      recordError('Payrun not found');
      return res.status(404).json({ error: 'Payrun not found' });
    }

    const employees = [];

    for (const employeeId of payruns.payrunRequest.employeeIds) {
      const employee = await db.employee.findUnique({
        where: {
          id: employeeId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bank: true,
        },
      });
      employees.push(employee);
    }

    const response = {
      periodStart: payruns.payrunRequest.periodStart,
      periodEnd: payruns.payrunRequest.periodEnd,
      employees,
    };

    return res.status(200).json(response);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});

payruns.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = PayrunRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      recordError(`Validation failed: ${z.treeifyError(parsed.error)}`);
      return res.status(400).json({
        error: 'Validation failed',
        details: z.treeifyError(parsed.error),
      });
    }

    const { periodStart, periodEnd, employeeSubset } = parsed.data;

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    let type = null;

    if (employeeSubset === 'hourly') {
      type = 'hourly';
    }

    if (startDate >= endDate) {
      recordError('periodStart must be before periodEnd');
      return res.status(400).json({
        error: 'periodStart must be before periodEnd',
      });
    }

    const result = await db.$transaction(async (tx) => {
      const payrunId = uuidv4();

      const timesheets = await tx.timesheet.findMany({
        where: {
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
          ...(type && { employee: { type: type as EmployeeType } }),
        },
        include: {
          entries: true,
          employee: true,
        },
      });

      let totals = { gross: 0, tax: 0, super: 0, net: 0 };
      const payslipsData = [];

      for (const t of timesheets) {
        const hours = calcHours(t.entries);
        const result = calcPay({
          hours,
          baseRate: t.employee.baseHourlyRate,
          allowances: t.allowances,
          superRate: t.employee.superRate,
        });

        totals.gross += result.gross;
        totals.tax += result.tax;
        totals.super += result.super;
        totals.net += result.net;

        payslipsData.push({
          payrunId: payrunId,
          employeeId: t.employeeId,
          normalHours: result.normal,
          overtimeHours: result.overtime,
          gross: result.gross,
          tax: result.tax,
          super: result.super,
          net: result.net,
        });
      }

      // Round totals to 2 decimal places
      totals = {
        gross: Math.round(totals.gross * 100) / 100,
        tax: Math.round(totals.tax * 100) / 100,
        super: Math.round(totals.super * 100) / 100,
        net: Math.round(totals.net * 100) / 100,
      };

      if (totals.net <= 0) {
        return {
          status: 404,
        };
      }

      const payrunRequest = await tx.payrunRequest.create({
        data: {
          periodStart: startDate,
          periodEnd: endDate,
          employeeIds: timesheets.map((t) => t.employeeId),
        },
        select: { id: true },
      });

      // Create payrun
      const payrun = await tx.payrun.create({
        data: {
          id: payrunId,
          payrunRequestId: payrunRequest.id,
          periodStart: startDate,
          periodEnd: endDate,
          totals,
        },
        select: { id: true },
      });

      // Create payslips in bulk
      await tx.payslip.createMany({
        data: payslipsData.map((p) => ({
          ...p,
          payrunId: payrun.id,
        })),
      });

      return {
        status: 201,
        payrun,
        totals,
        payslipsCount: payslipsData.length,
      };
    });

    if (result.status === 404) {
      recordError('Payrun ran but no entries found');
      return res.status(404).json({
        error: 'Payrun ran but no entries found',
      });
    } else if (result.status === 201) {
      return res.status(201).json({
        id: result?.payrun?.id,
        periodStart,
        periodEnd,
        totals: result.totals,
        payslipsCount: result.payslipsCount,
      });
    }
  } catch (err: unknown) {
    return handleError(err, res);
  }
});
