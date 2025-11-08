import { calcHours, calcOvertime, calcTax, calcPay } from '../src/domain/calc';

describe('Payrun Calculations', () => {
  test('calculates total worked hours correctly', () => {
    const entries = [
      { start: '09:00', end: '17:00', unpaidBreakMins: 30 }, // 7.5 hours
      { start: '10:00', end: '14:00', unpaidBreakMins: 0 }, // 4 hours
    ];
    const hours = calcHours(entries);
    console.log(hours);
    expect(hours).toBe("11.50");
  });

  test('splits normal vs overtime hours', () => {
    const { normal, overtime } = calcOvertime("45");
    expect(normal).toBe(38);
    expect(overtime).toBe(7);
  });

  test('calculates tax correctly for mid bracket', () => {
    const tax = calcTax(1000);

    expect(tax).toBeCloseTo(72, 3);
  });

  test('calculates gross, net and super correctly', () => {
    const result = calcPay({
      hours: "45",
      baseRate: 25,
      allowances: 50,
      superRate: 11.5
    });

    expect(result.normal).toBe(38);
    expect(result.overtime).toBe(7);

    const expectedGross = 38 * 25 + 7 * 25 * 1.5 + 50;
    expect(result.gross).toBeCloseTo(expectedGross, 3);

    const expectedSuper = expectedGross * 0.115;
    expect(result.super).toBeCloseTo(expectedSuper, 3);

    // net + tax should roughly equal gross
    expect(result.net + result.tax).toBeCloseTo(result.gross, 3);
  });
});
