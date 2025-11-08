-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('hourly');

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" "EmployeeType" NOT NULL,
    "baseHourlyRate" DOUBLE PRECISION NOT NULL,
    "superRate" DOUBLE PRECISION NOT NULL,
    "bank" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheets" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_entries" (
    "id" UUID NOT NULL,
    "timesheetId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "unpaidBreakMins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrun_requests" (
    "id" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "employeeIds" UUID[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrun_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payruns" (
    "id" UUID NOT NULL,
    "payrunRequestId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payruns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" UUID NOT NULL,
    "payrunId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "normalHours" DOUBLE PRECISION NOT NULL,
    "overtimeHours" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "super" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timesheets_employeeId_idx" ON "timesheets"("employeeId");

-- CreateIndex
CREATE INDEX "timesheets_periodStart_periodEnd_idx" ON "timesheets"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_employeeId_periodStart_periodEnd_key" ON "timesheets"("employeeId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "timesheet_entries_timesheetId_idx" ON "timesheet_entries"("timesheetId");

-- CreateIndex
CREATE UNIQUE INDEX "payruns_payrunRequestId_key" ON "payruns"("payrunRequestId");

-- CreateIndex
CREATE INDEX "payslips_employeeId_idx" ON "payslips"("employeeId");

-- CreateIndex
CREATE INDEX "payslips_payrunId_idx" ON "payslips"("payrunId");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payrunId_employeeId_key" ON "payslips"("payrunId", "employeeId");

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payruns" ADD CONSTRAINT "payruns_payrunRequestId_fkey" FOREIGN KEY ("payrunRequestId") REFERENCES "payrun_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payrunId_fkey" FOREIGN KEY ("payrunId") REFERENCES "payruns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
