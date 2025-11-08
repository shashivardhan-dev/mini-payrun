import React, { useState } from "react";
import "./Payrun.css";
import { useCreatePayrun } from "../../api";
import { toast } from "react-toastify";

type payrunData = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: {
    gross: number;
    tax: number;
    super: number;
    net: number;
  };
  payslipsCount: number;
};
const PayRun = () => {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [employeeSubset, setEmployeeSubset] = useState("All Employees");
  const [payrunData, setPayrunData] = useState<payrunData | null>(null);

  const { mutateAsync: createPayrun } = useCreatePayrun();

  const handleGeneratePayRun = async () => {
    try {
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);

      if (startDate >= endDate) {
        toast.error("Period Start must be before Period End");
        return;
      }

      const result = await createPayrun({
        periodStart,
        periodEnd,
        employeeSubset,
      });
      setPayrunData(result);
      toast.success("Payrun created successfully.");
    } catch (error) {
      toast.error("Failed to create payrun.");
    }
  };

  return (
    <div className="payrun-container">
      <h1 className="payrun-title">Run Pay</h1>

      <div className="payrun-field">
        <label>Pay Period Start Date</label>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="payrun-input"
        />
      </div>

      <div className="payrun-field">
        <label>Pay Period End Date</label>
        <input
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="payrun-input"
        />
      </div>

      <div className="payrun-field">
        <label>Select Employee Subset</label>
        <select
          value={employeeSubset}
          onChange={(e) => setEmployeeSubset(e.target.value)}
          className="payrun-select"
        >
          <option value="all">All Employees</option>
          <option value="hourly">Hourly Employees</option>
        </select>
      </div>

      <button onClick={handleGeneratePayRun} className="generate-btn">
        Generate Pay Run
      </button>

      {payrunData && (
        <div className="payrun-success">
          {payrunData?.payslipsCount > 0 && (
            <div>
              Payrun created successfully!
              <br />
              Total Gross: A${payrunData.totals.gross}
              <br />
              Total Tax: A${payrunData.totals.tax}
              <br />
              Total Super: A${payrunData.totals.super}
              <br />
              Total Net: A${payrunData.totals.net}
              <br />
              Total Payslips: {payrunData.payslipsCount}
            </div>
          )}
          {payrunData?.payslipsCount === 0 && (
            <div>
              Payrun ran successfully!
              <br />
              No timesheets found for the selected period.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayRun;
