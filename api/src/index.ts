import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { employees } from './routes/employees';
import { timesheets } from './routes/timesheets';
import { payruns } from './routes/payruns';
import { payslips } from './routes/payslips';
import authenticate from './middleware';
import { login } from './routes/login';
import { countRequest , metrics} from './routes/metrics';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).send('OK');
});

app.use("/metrics", metrics);

// Count every request
app.use((req, res, next) => {
  countRequest();
  next();
});



app.use("/login", login);
app.use('/employees', authenticate, employees);
app.use('/timesheets', authenticate, timesheets);
app.use('/payruns', authenticate, payruns);
app.use('/payslips', authenticate, payslips);

// Local development
if (process.env.NODE_ENV !== "production") {
  app.listen(4000, () => console.log("API running on http://localhost:4000"));
}

export default app;
