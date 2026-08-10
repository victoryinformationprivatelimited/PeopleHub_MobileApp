/**
 * Matches HRIS.Model.Attendance.DTOs.EssAttendanceDtos exactly (Backend/HRIS) — written directly
 * from the backend source, not ported from ESS web's AttendanceAPI.ts, since that was built
 * against mocks and never verified against the real backend (unlike these shapes, which were
 * verified live while building Phase 5 itself). camelCase here matches ASP.NET's default JSON
 * casing, same as every other DTO in this app.
 */

export interface AttendanceRecordReturn {
  date: string;
  status: string;
  rosterStartTime: string | null;
  rosterEndTime: string | null;
  actualOnTime: string | null;
  actualOffTime: string | null;
  workedHours: number | null;
}

export interface AttendanceSummaryReturn {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalWorkedHours: number;
}

export interface RosterReturn {
  date: string;
  workPatternName: string | null;
  rosterStartTime: string | null;
  rosterEndTime: string | null;
  unitEntityName: string | null;
  isHoliday: boolean;
  isWeekend: boolean;
}

export interface RosterEmployeeReturn {
  employeeId: number;
  employeeName: string;
  workPatternName: string | null;
  rosterStartTime: string | null;
  rosterEndTime: string | null;
}

export interface EmployeeRequestReturn {
  requestId: number;
  requestType: string;
  rosterDate: string | null;
  note: string | null;
  status: string;
  requestedOn: string;
  targetEmployeeId: number | null;
  targetEmployeeName: string | null;
}

export interface PendingApprovalReturn {
  requestId: number;
  requestType: string;
  employeeId: number;
  employeeName: string;
  payloadJson: string;
  requestedOn: string;
}

export interface MarkAttendanceReq {
  date: string;
  time: string;
  note?: string;
  latitude: number;
  longitude: number;
  photoUri?: string;
}

export interface RequestAttendanceReq {
  date: string;
  time: string;
  reason: string;
}
