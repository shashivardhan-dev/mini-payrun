import request from 'supertest';
import { createTestServer } from './testServer';
import db from '../src/lib/db';

jest.mock('../src/lib/db', () => ({
  __esModule: true,
  default: {
    employee: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const app = createTestServer();

describe('Employees API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of employees', async () => {
    const mockEmployees = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        type: 'hourly',
        baseHourlyRate: 25,
        superRate: 10,
        bank: { bsb: '123456', account: '789012' },
      },
    ];
    (db.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);

    const res = await request(app).get('/employees');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockEmployees);
    expect(db.employee.findMany).toHaveBeenCalled();
  });

  // POST /employees success
  it('should create a new employee', async () => {
    const input = {
      firstName: 'Alice',
      lastName: 'Smith',
      type: 'hourly',
      baseHourlyRate: 25,
      superRate: 10,
      bank: {
        bsb: '123456',
        account: '789012',
      },
    };

    const createdEmployee = { id: '2', ...input };
    (db.employee.create as jest.Mock).mockResolvedValue(createdEmployee);

    const res = await request(app).post('/employees').send(input);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdEmployee);
    expect(db.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Object) }),
    );
  });

  // POST /employees validation fail
  it('should return 400 for invalid employee data', async () => {
    const input = {
      firstName: 'Alice',
      lastName: 'Smith',
      type: 'daily',
      baseHourlyRate: 25,
      superRate: 10,
      bank: {
        bsb: '123456',
        account: '789012',
      },
    };
    const res = await request(app).post('/employees').send(input);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should update an employee', async () => {
    const id = '3';
    const updateData = { firstName: 'Updated' };
    const updatedEmployee = {
      id,
      firstName: 'Updated',
      lastName: 'Smith',
      type: 'hourly',
      baseHourlyRate: 25,
      superRate: 10,
      bank: {
        bsb: '123456',
        account: '789012',
      },
    };

    (db.employee.update as jest.Mock).mockResolvedValue(updatedEmployee);

    const res = await request(app).patch(`/employees/${id}`).send(updateData);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedEmployee);
    expect(db.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.any(Object),
      }),
    );
  });
});
