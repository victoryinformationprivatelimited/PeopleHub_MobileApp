import type { SectionId } from "../type/profile";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ProfileList: undefined;
  ProfileSection: { sectionId: SectionId; label: string };
  AttendanceHome: undefined;
  MarkAttendance: undefined;
  PendingApprovals: undefined;
  LeaveHome: undefined;
  LeaveRequests: { status: "Pending" | "Approved" | "Rejected" };
  ApplyLeave: undefined;
  PayrollHome: undefined;
  Payslip: { payPeriodId: number; label: string };
  Reimbursements: undefined;
  RequestReimbursement: undefined;
  CompanyHierarchy: undefined;
};
