import express from 'express';
import { employees } from '../src/routes/employees';

export function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use('/employees', employees);
  return app;
}
