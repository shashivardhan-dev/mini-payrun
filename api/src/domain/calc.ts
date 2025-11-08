export function calcHours(entries: { start: string; end: string; unpaidBreakMins: number }[]) {
  let total = 0;
  for (const e of entries) {
    const [sh, sm] = e.start.split(':').map(Number);
    const [eh, em] = e.end.split(':').map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm) - e.unpaidBreakMins;
    total += mins / 60;
  }
  return total.toFixed(2);
}

export function calcOvertime(hours: string) {
  const normal = Math.min(Number(hours), 38);
  const overtime = Math.max(Number(hours) - 38, 0);
  return { normal, overtime };
}

export function calcTax(gross: number) {
  if (gross <= 370) return 0;
  if (gross <= 900) return (gross - 370) * 0.1;
  if (gross <= 1500) return (900 - 370) * 0.1 + (gross - 900) * 0.19;
  if (gross <= 3000) return (900 - 370) * 0.1 + (1500 - 900) * 0.19 + (gross - 1500) * 0.325;
  if (gross <= 5000)
    return (900 - 370) * 0.1 + (1500 - 900) * 0.19 + (3000 - 1500) * 0.325 + (gross - 3000) * 0.37;
  return (
    (900 - 370) * 0.1 +
    (1500 - 900) * 0.19 +
    (3000 - 1500) * 0.325 +
    (5000 - 3000) * 0.37 +
    (gross - 5000) * 0.45
  );
}

export function calcPay({
  hours,
  baseRate,
  allowances,
  superRate
}: {
  hours: string;
  baseRate: number;
  allowances: number;
  superRate:number
}) {
  const { normal, overtime } = calcOvertime(hours);

  const gross = normal * baseRate + overtime * baseRate * 1.5 + allowances;
  const tax = calcTax(gross); 
  const superAmt = gross * superRate/100;
  const net = gross - tax;

  return { normal, overtime, gross, tax, super: superAmt, net };
}
