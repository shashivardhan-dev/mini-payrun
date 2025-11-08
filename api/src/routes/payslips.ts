import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { handleError } from '../lib/errorHandler';

export const payslips = Router();

payslips.get('/:employeeId/:payrunId', async (req: Request, res: Response) => {
  try {
    const { employeeId, payrunId } = req.params;
    console.log(employeeId, payrunId)
    const slip = await db.payslip.findFirst({
      where: { employeeId, payrunId },
    });
    return res.status(200).json(slip);
  } catch (err: unknown) {
    return handleError(err, res);
  }
});
