import { z } from 'zod';

export const EmployeeSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    type: z.enum(['hourly']),
    baseHourlyRate: z.number(),
    superRate: z.number(),
    bank: z
      .object({
        bsb: z.string().nullable().optional(),
        account: z.string().nullable().optional(),
      })
      .refine(
        (bank) =>
          (!bank.bsb && !bank.account) ||
          (typeof bank.bsb === 'string' && typeof bank.account === 'string'),
        {
          message: "Both 'bsb' and 'account' must be provided together, or both omitted/null.",
          path: ['bank'],
        },
      )
      .optional(),
  })
  .strict();

export const TimesheetEntrySchema = z
  .object({
    date: z.string(),
    start: z.string(),
    end: z.string(),
    unpaidBreakMins: z.number(),
  })
  .strict();

export const TimesheetSchema = z
  .object({
    employeeId: z.uuid({ version: 'v4' }),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    entries: z.array(TimesheetEntrySchema),
    allowances: z.number().default(0),
  })
  .strict();

export const PayrunRequestSchema = z
  .object({
    periodStart: z.string(),
    periodEnd: z.string(),
    employeeSubset: z.string(),
  })
  .strict();
