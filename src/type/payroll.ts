/**
 * Matches HRIS.Model.Payroll.DTOs.EssPayrollDtos exactly (Backend/HRIS) — written directly from
 * the backend source, same approach as type/attendance.ts and type/leave.ts. Reimbursement
 * requests flow through the same EmployeeRequest approval table as Attendance/Leave.
 *
 * PayrollEngineConfigured is false for every tenant today — there is no salary/compensation
 * calculation engine anywhere in the system, so payslip Earnings/Deductions/GrossPay/NetPay are
 * deliberately empty/zero rather than fabricated. The UI must show the backend's own Note
 * explaining this, not render $0.00 as if it were a real payslip.
 */

export interface PayPeriodReturn {
  payPeriodId: number;
  label: string;
  startDate: string;
  endDate: string;
  payDate: string;
}

export interface PayslipLineItem {
  label: string;
  amount: number;
}

export interface PayslipReturn {
  payPeriodId: number;
  payPeriodLabel: string;
  payDate: string;
  employeeName: string;
  employeeNumber: string;
  designation: string | null;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  payrollEngineConfigured: boolean;
  note: string | null;
}

export interface ReimbursementReturn {
  reimbursementId: number;
  reimbursementType: string;
  description: string | null;
  payPeriodId: number | null;
  payPeriodLabel: string | null;
  amount: number;
  documentName: string | null;
  status: string;
  requestedOn: string;
}

/** reimbursementType: "Travel" | "Medical" | "Meals" | "Communication" | "Other". */
export interface RequestReimbursementReq {
  reimbursementType: "Travel" | "Medical" | "Meals" | "Communication" | "Other";
  description?: string;
  payPeriodId?: number;
  amount: number;
  documentUri?: string;
}
