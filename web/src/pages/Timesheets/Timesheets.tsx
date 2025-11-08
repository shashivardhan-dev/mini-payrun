"use client";
import { useState, useEffect } from "react";
import "./Timesheets.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmployees,  useCreateTimesheet } from "../../api";
import { toast } from "react-toastify";

type TimesheetEntry = {
  date: string;
  start: string;
  end: string;
  unpaidBreakMins: number;
};

type Employee = {
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
  bsb: string;
  account: string;
};

const Timesheets = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allowances, setAllowances] = useState("0");
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const { data: employees, isLoading, error } = useEmployees();

  const { mutate: createTimesheet } = useCreateTimesheet();
    useEffect(() => {
    if (!id) {
      navigate("/employees");
      toast.error("Please select an employee");
    }
  }, []);

  useEffect(() => {
    console.log(id);
    const fetchData = async () => {
      if (id) {
        try {
          const data = employees?.find((emp:Employee) => emp.id === id);
          console.log(data);
          setEmployee(data);
        } catch (err) {
          toast.error("Employee not found, redirecting to employees page");
          navigate("/employees");
        }
      }
    };

    fetchData();
  }, [id, employees]);

   if(isLoading) return <p>Loading employees...</p>;
  if(error) return <p>Error loading employees: {(error as Error).message}</p>;


  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date) => {
   return date.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
  };

  const handleWeekSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");

    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek !== 1) {
      toast.error("Please Select Start date from Monday");
      e.target.value = "";
      return;
    }
    const monday = getMonday(selectedDate);
    setSelectedWeekStart(monday);

    const weekEntries = [];
    for (let i = 1; i < 6; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekEntries.push({
        date: formatDate(date),
        start: "00:00",
        end: "00:00",
        unpaidBreakMins: 0,
      });
    }
    setEntries(weekEntries);
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    newEntries[index][field] =
      field === "unpaidBreakMins" ? parseInt(value) || 0 : value;
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const calculateHours = (entry: TimesheetEntry) => {
    if (!entry.start || !entry.end) return "0";
    const [startH, startM] = entry.start.split(":").map(Number);
    const [endH, endM] = entry.end.split(":").map(Number);
    const totalMins =
      endH * 60 + endM - (startH * 60 + startM) - entry.unpaidBreakMins;
    return (totalMins / 60).toFixed(2);
  };

  const calculateTotalHours = () => {
    return entries
      .reduce((sum, entry) => sum + parseFloat(calculateHours(entry)), 0)
      .toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedWeekStart || !employee) {
      toast.error("Please select a week and  employee");
      return;
    }

    for (const entry of entries) {
      if (entry.start !== "00:00" || entry.end !== "00:00") {
        const hours = calculateHours(entry);
        if (Number(hours) < 0) {
          toast.error("Hours cannot be negative!");
          return;
        }
      }
    }

    console.log(selectedWeekStart, "selectedWeekStart");
    const sunday = new Date(selectedWeekStart);
    sunday.setDate(sunday.getDate() + 6);

    console.log(sunday, "sunday");
    const timesheetData = {
      employeeId: employee.id,
      periodStart: formatDate(selectedWeekStart),
      periodEnd: formatDate(sunday),
      entries: entries.filter((e) => e.start !== "00:00" && e.end !== "00:00"),
      allowances: parseFloat(allowances),
    };
    try {
       createTimesheet(timesheetData);
      navigate("/employees");
    } catch (err: unknown) {
      toast.error("Failed to create timesheet");
    }
    toast.success("Timesheet created successfully");
  };

  return (
    <div className="timesheets-container">
      <h1 className="timesheets-title">Timesheets</h1>
      <p className="timesheets-description">
        {`Timesheet for ${employee?.firstName} ${employee?.lastName}`}{" "}
      </p>

      <div className="timesheet-form">
        <div className="form-layout">
          <div className="form-group">
            <label className="form-label">Select Week</label>
            <input
              type="date"
              className="form-input"
              onChange={handleWeekSelect}
              onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
            />
            {selectedWeekStart && (
              <p className="week-info">
                Week: {formatDate(selectedWeekStart)} to{" "}
                {formatDate(
                  new Date(
                    selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
                  )
                )}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Allowances (A$)</label>
            <input
              type="number"
              className="form-input"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
            />
          </div>
        </div>

        {selectedWeekStart && (
          <div className="entries-section">
            <h2 className="section-title">Time Entries</h2>

            <div className="entries-container">
              {entries.map((entry, index) => (
                <div key={index} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-day">{getDayName(entry.date)}</span>
                    <span className="entry-date">{entry.date}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeEntry(index)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="entry-fields">
                    <div className="field-group">
                      <label className="field-label">Start</label>
                      <input
                        type="time"
                        className="time-input"
                        value={entry.start}
                        onChange={(e) =>
                          updateEntry(index, "start", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">End</label>
                      <input
                        type="time"
                        className="time-input"
                        value={entry.end}
                        onChange={(e) =>
                          updateEntry(index, "end", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Break (mins)</label>
                      <input
                        type="number"
                        className="break-input"
                        value={entry.unpaidBreakMins}
                        onChange={(e) =>
                          updateEntry(index, "unpaidBreakMins", e.target.value)
                        }
                        min="0"
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Hours</label>
                      <span className="hours-display">
                        {calculateHours(entry)}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-section">
              <span className="total-label">Total Hours:</span>
              <span className="total-value">{calculateTotalHours()}h</span>
            </div>
          </div>
        )}

        {selectedWeekStart && (
          <button type="button" className="submit-btn" onClick={handleSubmit}>
            Submit Timesheet
          </button>
        )}
      </div>
    </div>
  );
};

export default Timesheets;
