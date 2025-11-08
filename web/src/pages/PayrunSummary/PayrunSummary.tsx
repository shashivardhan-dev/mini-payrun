// PayrunSummary.tsx
import { useEffect, useState, useRef } from "react";
import "./PayrunSummary.css";
import { usePayrun, useGetByIdPayrunDataWithEmployee, useGetByIdPayslip } from "../../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {toast } from "react-toastify";
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  bank?: {
    bsb:string,
    account:string
  }
}

interface PayRun {
  id: string;
  periodStart: string;
  periodEnd: string;
}

interface Totals {
  gross: number;
  tax: number;
  super: number;
  net: number;
}

interface Payslip {
    id:  string,
    payrunId: string,
    employeeId: string,
    normalHours: number,
    overtimeHours: number,
    gross: number,
  tax: number,
    super: number,
    net: number,
}
const PayrunSummary = () => {
  const [payruns, setPayruns] = useState<PayRun[]>([]);
  const [selectedPayRunId, setSelectedPayRunId] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [payslipEmployee, setPayslipEmployee] = useState <Employee | null>(null);
  const [payslip, setPayslip] = useState<Payslip |null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = usePayrun();
  const { data: payrunDataWithEmployee, isLoading:loading, refetch } =
    useGetByIdPayrunDataWithEmployee(selectedPayRunId);
  const { data: payslipData, refetch: refetchPayslip } = useGetByIdPayslip(
    payslipEmployee?.id,
    selectedPayRunId
  );

  useEffect(() => {
    setPayruns(data);
  }, [data]);

  useEffect(() => {
    if (payslipData) {
      setPayslip(payslipData);
    }
  }, [payslipData]);

  useEffect( () => {
    if (!selectedPayRunId) return;

    setTotals(data.find((d: PayRun) => selectedPayRunId === d.id).totals);

   refetch(); 
  }, [selectedPayRunId, refetch]);


  useEffect(()=>{
    if(payrunDataWithEmployee) {
   setEmployees(payrunDataWithEmployee?.employees);
    }
  },[payrunDataWithEmployee])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const payrunDate = (id:string) =>{
    const payrun = payruns.find(p => id === p.id)

    if(!payrun){
      return "No dates"
    }

    const startDate = new Date(payrun.periodStart).toLocaleDateString("en-GB");
    const endDate = new Date(payrun.periodEnd).toLocaleDateString("en-GB")
  return `${startDate} to ${endDate}`
  }

  const clickPayslip = (id: string) => {
    console.log("coming")

    const employee = employees.find(e => e.id === id)

    setPayslipEmployee(employee);
    refetchPayslip();
      setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPayslip(null);
  };


  const downloadPayslip = async () => {
    if (!payslipRef.current || !payslipEmployee) return;

    setIsDownloading(true);

    try {
      // Capture the modal content as canvas
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `Payslip_${payslipEmployee.firstName}_${payslipEmployee.lastName}_${payrunDate(selectedPayRunId).replace(/ /g, '_')}.pdf`;
      
      // Download the PDF
      pdf.save(fileName);
      toast.success("Payslip downloaded successfully.");
    } catch (error) {
    toast.error("Failed to download payslip.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && selectedPayRunId ) return <p>Loading employees...</p>;
  if (error) return <p>Error loading employees: {(error as Error).message}</p>;

  return (
    <div className="payrunsummary-container"> 
      <h1 className="payrunsummary-title">Pay Run Summary</h1>

      {/* Dropdown for pay runs */}
      <select
        value={selectedPayRunId}
        onChange={(e) => setSelectedPayRunId(e.target.value)}
        className="payrunsummary-dropdown"
      >
        <option value="">Select Pay Run</option>
        {payruns &&
          payruns.map((run) => (
            <option key={run.id} value={run.id}>
              {formatDate(run.periodStart)} to {formatDate(run.periodEnd)}
            </option>
          ))}
      </select>

      {loading && <p>Loading...</p>}

      {/* Totals Section */}
      {totals && (
        <div className="payrunsummary-totals">
          <p>
            <strong>Pay Run Totals</strong>
          </p>
          <p className="totals-text">
            Gross: ${totals.gross.toLocaleString()} | Tax: $
            {totals.tax.toLocaleString()} | Super: $
            {totals.super.toLocaleString()} | Net: $
            {totals.net.toLocaleString()}
          </p>
        </div>
      )}

      {/* Employee Table */}
      {employees.length > 0 && (
        <table className="payrunsummary-table">
          <thead>
            <tr>
              <th>Employee First Name</th>
              <th>Employee Last Name</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.firstName}</td>
                <td>{emp.lastName}</td>
                <td>
                  <button
                    className="payslip-btn"
                    onClick={() => clickPayslip(emp.id)}
                  >
                    Payslip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && payslip && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payslip Detail</h2>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body" ref={payslipRef}>
              <div className="payslip-section">
                <h3>
                  Employee: { payslipEmployee?.firstName}{" "} {payslipEmployee?.lastName}
                </h3>
                <p className="pay-period">
                  Pay Period: {payrunDate(selectedPayRunId)}
                </p>
              </div>

              <div className="payslip-grid">
                <div className="payslip-item">
                  <span className="label">Normal Hours</span>
                  <span className="value">
                    {payslip.normalHours || "0"}
                  </span>
                </div>
                <div className="payslip-item">
                  <span className="label">Overtime Hours</span>
                  <span className="value">
                    {payslip.overtimeHours || "0"}
                  </span>
                </div>
                <div className="payslip-item">
                  <span className="label">Gross Pay</span>
                  <span className="value">
                    A$ {payslip.gross?.toLocaleString() || "0.00"}
                  </span>
                </div>
                <div className="payslip-item">
                  <span className="label">Tax Withheld</span>
                  <span className="value">
                    A$ {payslip.tax?.toLocaleString() || "0.00"}
                  </span>
                </div>
                <div className="payslip-item">
                  <span className="label">Superannuation</span>
                  <span className="value">
                    A$ {payslip.super?.toLocaleString() || "0.00"}
                  </span>
                </div>
                <div className="payslip-item net-pay">
                  <span className="label">Net Pay</span>
                  <span className="value">
                    A$ {payslip.net?.toLocaleString() || "0.00"}
                  </span>
                </div>
              </div>

              {payslipEmployee?.bank && (
                <div className="bank-details-section">
                  <h3>Bank Details</h3>
                  <div className="bank-info">
                    <div className="bank-item">
                      <span className="label">BSB</span>
                      <span className="value">{payslipEmployee?.bank.bsb}</span>
                    </div>
                    <div className="bank-item">
                      <span className="label">Account</span>
                      <span className="value">
                        {payslipEmployee?.bank.account}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="download-btn" 
                onClick={downloadPayslip}
                disabled={isDownloading}
              >
                {isDownloading ? 'Generating PDF...' : 'Download Payslip PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrunSummary;