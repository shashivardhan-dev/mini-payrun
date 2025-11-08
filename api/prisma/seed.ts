import { PrismaClient } from '@prisma/client';
import employees from './employees.json';
import timesheets from './timesheets.json';
import { EmployeeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    for (const emp of employees) {
      await prisma.employee.upsert({
        where: { id: emp.id },
        update: {},
        create: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          type: EmployeeType['hourly'],
          baseHourlyRate: emp.baseHourlyRate,
          superRate: emp.superRate,
          bank: {
            bsb: emp.bank?.bsb,
            account: emp.bank?.account,
          },
        },
      });
    }

    for (const ts of timesheets) {
      const t = await prisma.timesheet.create({
        data: {
          employeeId: ts.employeeId,
          periodStart: new Date(ts.periodStart),
          periodEnd: new Date(ts.periodEnd),
          allowances: ts.allowances,
        },
      });

      for (const entry of ts.entries) {
        await prisma.timesheetEntry.create({
          data: {
            timesheetId: t.id,
            date: new Date(entry.date),
            start: entry.start,
            end: entry.end,
            unpaidBreakMins: entry.unpaidBreakMins,
          },
        });
      }
    }
    console.log('Seed complete');
  } catch (e) {
    console.error(e);
  }
}

main().finally(() => prisma.$disconnect());
