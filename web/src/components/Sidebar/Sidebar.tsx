import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, DollarSign, File, Sheet  } from "lucide-react";
import "./Sidebar.css"; // Import the CSS file

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "employees", label: "Employees", icon: <Users />, path: "/employees" },
    { id: "timesheets", label: "Timesheets", icon: <Sheet  />, path: "/timesheets" },
    { id: "payrun", label: "Run Pay", icon: <DollarSign />, path: "/payrun" },
    { id: "payrunsummary", label: "Payrun Summary", icon: <File />, path: "/pay-run-summary" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Payroo</h2>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <div className="sidebar-icon">{item.icon}</div>
            <p className="sidebar-label">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
