import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:4000";

type Employee = {
  id?: string;
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




const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  // If token missing or expired → logout
  if (!token || !expiry || Date.now() > parseInt(expiry)) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    window.location.href = "/";
    throw new Error("Token expired or missing");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  // Handle 401 (unauthorized)
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    window.location.href = "/";
    throw new Error("Unauthorized — token invalid or expired");
  }

  return response;
};


const employeesAPI = {
  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    return response.json();
  },

  create: async (employee: Employee) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error("Failed to create employee");
    return response.json();
  },

  update: async (id: string, employee: Employee) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error("Failed to update employee");
    return response.json();
  },
};

const timesheetsAPI = {
  create: async (timesheet: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/timesheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(timesheet),
    });
    if (!response.ok) throw new Error("Failed to create timesheet");
    return response.json();
  },
};

const payrunsAPI = {
  create: async (payrun: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payruns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payrun),
    });
    if (!response.ok) throw new Error("Failed to create payrun");
    return response.json();
  },

  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payruns`);
    if (!response.ok) throw new Error("Failed to fetch Payrun Summary");
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payruns/${id}`);
    if (!response.ok) throw new Error("Failed to fetch Payrun Summary");
    return response.json();
  },
};

const payslipAPI = {
  getById: async (employeeId: string, payrunId: string) => {
    console.log("coming");
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payslips/${employeeId}/${payrunId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch Payslip");
    return response.json();
  },
};

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeesAPI.getAll,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesAPI.create,
    onSuccess: (newEmployee) => {
      // update cache instantly (optimistic update)
      queryClient.setQueryData(["employees"], (old: any) =>
        old ? [...old, newEmployee] : [newEmployee]
      );
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employee }: { id: string; employee: Employee }) =>
      employeesAPI.update(id, employee),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(["employees"], (old: any) =>
        old
          ? old.map((emp: any) =>
              emp.id === updatedEmployee.id ? updatedEmployee : emp
            )
          : [updatedEmployee]
      );
    },
  });
};

export const useCreateTimesheet = () => {
  return useMutation({
    mutationFn: timesheetsAPI.create,
  });
};

export const useCreatePayrun = () => {
  return useMutation({
    mutationFn: payrunsAPI.create,
  });
};

export const usePayrun = () => {
  return useQuery({
    queryKey: ["payruns"],
    queryFn: payrunsAPI.getAll,
  });
};

export const useGetByIdPayrunDataWithEmployee = (id: string) => {
  return useQuery({
    queryKey: ["payrun", id],
    queryFn: () => payrunsAPI.getById(id),
    enabled: !!id,
  });
};

export const useGetByIdPayslip = (employeeId: string, payrunId: string) => {
  console.log("coming");
  return useQuery({
    queryKey: ["payslip", employeeId, payrunId],
    queryFn: () => payslipAPI.getById(employeeId, payrunId),
    enabled: !!employeeId && !!payrunId,
  });
};
