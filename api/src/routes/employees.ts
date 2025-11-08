import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { EmployeeSchema } from '../domain/types';
import { handleError } from '../lib/errorHandler';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const employees = Router();

employees.get('/', async (_req: Request, res: Response) => {
  try {
    const employees = await db.employee.findMany({
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(employees);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});

employees.post('/', async (req: Request, res: Response) => {
  const parsed = EmployeeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: z.flattenError(parsed.error),
    });
  }

  const e = parsed.data;

  try {
    const newEmployee = await db.employee.create({
      data: {
        firstName: e.firstName,
        lastName: e.lastName,
        type: e.type,
        baseHourlyRate: e.baseHourlyRate,
        superRate: e.superRate,
        bank: e.bank
          ? {
              bsb: e.bank.bsb,
              account: e.bank.account,
            }
          : Prisma.JsonNull,
      },

      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(newEmployee);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});

employees.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = EmployeeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: z.flattenError(parsed.error),
    });
  }

  const e = parsed.data;

  try {
    const updatedEmployee = await db.employee.update({
      where: { id },
      data: {
        ...(e.firstName && { firstName: e.firstName }),
        ...(e.lastName && { lastName: e.lastName }),
        ...(e.type && { type: e.type }),
        ...(e.baseHourlyRate && { baseHourlyRate: e.baseHourlyRate }),
        ...(e.superRate && { superRate: e.superRate }),
        ...(e.bank && {
          bank: {
            ...(e.bank.bsb && { bsb: e.bank.bsb }),
            ...(e.bank.account && { account: e.bank.account }),
          },
        }),
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedEmployee);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});

employees.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const employee = await db.employee.findUnique({
      where: { id },
    });
    return res.status(200).json(employee);
  } catch (err: unknown) {
    return handleError(err, res);
  }
  
})
