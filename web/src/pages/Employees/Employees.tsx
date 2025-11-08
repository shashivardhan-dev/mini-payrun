import React, { useState, useEffect } from "react";
import "./Employees.css";
import { useEmployees, useUpdateEmployee, useCreateEmployee } from "../../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Employee = {
  firstName: string;
  lastName: string;
  type: string;
  baseHourlyRate: number;
  superRate: number;
  bank: {
    bsb: string;
    account: string;
  };
};
const EmployeeForm = ({
  employee,
  onSave,
  onCancel,
}: {
  employee?: Employee;
  onSave: (employee: Partial<Employee>) => Promise<void>;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Employee>(
    employee || {
      firstName: "",
      lastName: "",
      type: "hourly",
      baseHourlyRate: 0,
      superRate:11.5,
      bank: { bsb: "", account: "" },
    }
  );

  const [initialData, setInitialData] = useState<Employee | null>(
    employee || null
  );
  // Update form if editing an existing employee
  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setInitialData(employee);
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("bank.")) {
      const bankField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bank: { ...prev.bank, [bankField]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "baseHourlyRate" || name === "superRate"
            ? parseFloat(value) || 0
            : value,
      }));
    }
  };

  const getChangedFields = (): Partial<Employee> => {
    if (!initialData) return formData;

    const changes: Partial<Employee> = {};

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (key === "bank") {
        const bankChanges: Partial<Employee["bank"]> = {};
        if (formData.bank.bsb !== initialData.bank.bsb)
          bankChanges.bsb = formData.bank.bsb;
        if (formData.bank.account !== initialData.bank.account)
          bankChanges.account = formData.bank.account;

        if (Object.keys(bankChanges).length > 0)
          changes.bank = bankChanges as Employee["bank"];
      } else if (formData[key] !== initialData[key]) {
        if (
          typeof formData[key] === "string" ||
          typeof formData[key] === "number"
        ) {
          changes[key] = formData[key];
        }
      }
    });

    return changes;
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = employee ? getChangedFields() : formData;
      await onSave(dataToSend);
    } catch (err: unknown) {
      toast.error("Failed to save employee.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          {employee ? "Edit Employee" : "Add New Employee"}
        </h2>
      </div>

      <div className="employee-form">

        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
            >
              <option value="hourly">Hourly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hourly Rate</label>
            <input
              type="number"
              name="baseHourlyRate"
              value={formData.baseHourlyRate}
              onChange={handleChange}
              placeholder="25"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Super Rate(Percentage)</label>
            <input
              type="number"
              name="superRate"
              value={formData.superRate}
              onChange={handleChange}
  
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Bank BSB</label>
            <input
              type="text"
              name="bank.bsb"
              value={formData.bank.bsb}
              onChange={handleChange}
              placeholder="083-123"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Bank Account</label>
            <input
              type="text"
              name="bank.account"
              value={formData.bank.account}
              onChange={handleChange}
              placeholder="12345678"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-save"
          >
             Save Employee
          </button>
        </div>
      </div>
    </div>
  );
};
type EmployeeWithId = {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  baseHourlyRate: number;
  superRate: number;
  bank: {
    bsb: string;
    account: string;
  };
};

type EmployeeListProps = {
  employees: EmployeeWithId[];
  onEdit: (employee: EmployeeWithId) => void;
  onAddNew: () => void;
};


const EmployeeList = ({ employees, onEdit, onAddNew }: EmployeeListProps) => {
     const nav = useNavigate();

  const onClickTimesheet = (id: string)=>{
  nav(`/timesheets?id=${id}`);
}
  return (
    <div className="employees-container">
      <div className="employees-header">
        <p className="employees-title">Employees</p>
        <button className="add-employee-btn" onClick={onAddNew}>
          <span>+ Add New Employee</span>
        </button>
      </div>

      <div className="employees-table-container">
        <div className="table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Type</th>
                <th>Hourly Rate</th>
                <th>Super Rate</th>
                <th>Bank BSB</th>
                <th>Bank Account</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.firstName}</td>
                  <td>{employee.lastName}</td>
                  <td>{employee.type}</td>
                  <td>{employee.baseHourlyRate}</td>
                  <td>{employee.superRate}</td>
                  <td>{employee.bank.bsb}</td>
                  <td>{employee.bank.account}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(employee)}
                    >
                      Edit
                    </button>
                    <button
                      className="timesheet-btn"
                      onClick={() => onClickTimesheet(employee.id)}
                    >
                      Timesheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Employees = () => {
  const [view, setView] = useState("list");
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithId | null>(null);

   const { data, isLoading, error } = useEmployees();
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();

     useEffect(() => {
    setEmployees(data);
  }, [data]);





  const handleEdit = (employee: EmployeeWithId) => {
    setSelectedEmployee(employee);
    setView("edit");
  };

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setView("create");
  };

  const handleSave = async (employeeData: Employee) => {
    try {
      if (view === "edit" && selectedEmployee) {
        updateEmployee({id:selectedEmployee.id, employee:employeeData});
      } else {
      createEmployee(employeeData);
      }
      setView("list");
      setSelectedEmployee(null);
    } catch (err) {
     toast.error("Failed to save employee.");
    }
  };

  const handleCancel = () => {
    setView("list");
    setSelectedEmployee(null);
  };

      if (isLoading) return <p>Loading employees...</p>;
  if (error) return <p>Error loading employees: {(error as Error).message}</p>; 

  return (
    <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>

      {view === "list" && employees && (
        <EmployeeList
          employees={employees}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
        />
      )}

      {view === "edit" && selectedEmployee && (
        <EmployeeForm
          employee={selectedEmployee}
          onSave={(employee) => handleSave(employee as Employee)}
          onCancel={handleCancel}
        />
      )}

      {view === "create" && !selectedEmployee && (
        <EmployeeForm
          onSave={(employee) => handleSave(employee as Employee)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Employees;
