import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@components/Layout";
import ProtectedRoute from "./protectedRoute";
import Login from "@pages/Login";
import Employees from "@pages/Employees";
import Timesheets from "@pages/Timesheets";
import Payrolls from "@pages/Payrun";
import PayrunSummary from "@pages/PayrunSummary";
import  Toaster from "./toaster"

const App = () => {
  return (
    <BrowserRouter>
     <Layout>
       <Routes>
          <Route path="/" element={<Login />} />


          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute>
                <Timesheets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payrun"
            element={
              <ProtectedRoute>
                <Payrolls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pay-run-summary"
            element={
              <ProtectedRoute>
                <PayrunSummary />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
         
        </Routes>
     
      <Toaster />
       </Layout>
    </BrowserRouter>
  );
};

export default App;
