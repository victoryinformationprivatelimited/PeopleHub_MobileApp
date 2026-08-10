/**
 * Matches HRIS.Model.Leave.DTOs.EssLeaveDtos exactly (Backend/HRIS) — written directly from the
 * backend source, same approach as type/attendance.ts. Leave applications flow through the same
 * EmployeeRequest approval table Phase 5 introduced (RequestType = "LeaveApplication"); there's no
 * separate leave-approval endpoint on mobile, it reuses getMyPendingApprovals/approveEmployeeRequest
 * from AttendanceAPI.ts.
 */

export interface LeaveEntitlementReturn {
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  balanceDays: number;
}

export interface LeaveRequestReturn {
  leaveRequestId: number;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string | null;
  appliedOn: string;
  status: string;

  currentApproverName: string | null;
  currentApproverRole: string | null;

  decisionDate: string | null;
  approvedByName: string | null;
  approvedByRole: string | null;

  rejectedByName: string | null;
  rejectedByRole: string | null;
  rejectReason: string | null;
}

export interface AvailableShiftReturn {
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export interface CoveringPersonReturn {
  employeeId: number;
  employeeName: string;
  roleName: string | null;
}

/** durationType: "FullDay" | "HalfDay" | "ShortLeave" | "Hourly" — matches the backend's own comment. */
export interface ApplyLeaveReq {
  fromDate: string;
  toDate: string;
  shiftId: number;
  leaveTypeId: number;
  durationType: "FullDay" | "HalfDay" | "ShortLeave" | "Hourly";
  hours?: number;
  coveringEmployeeId: number;
  reason?: string;
}
