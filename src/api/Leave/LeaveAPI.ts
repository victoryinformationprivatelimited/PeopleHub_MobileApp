import { apiClient } from "../client";
import type {
  LeaveEntitlementReturn, LeaveRequestReturn, AvailableShiftReturn, CoveringPersonReturn, ApplyLeaveReq,
} from "../../type/leave";

export const getMyLeaveEntitlements = (year: number) =>
  apiClient.get<LeaveEntitlementReturn[]>(`/api/Employee/GetMyLeaveEntitlements?year=${year}`);

export const getMyPendingLeaves = (fromDate?: string, toDate?: string) =>
  apiClient.get<LeaveRequestReturn[]>(`/api/Employee/GetMyPendingLeaves${dateQuery(fromDate, toDate)}`);

export const getMyApprovedLeaves = (fromDate?: string, toDate?: string) =>
  apiClient.get<LeaveRequestReturn[]>(`/api/Employee/GetMyApprovedLeaves${dateQuery(fromDate, toDate)}`);

export const getMyRejectedLeaves = (fromDate?: string, toDate?: string) =>
  apiClient.get<LeaveRequestReturn[]>(`/api/Employee/GetMyRejectedLeaves${dateQuery(fromDate, toDate)}`);

export const getAvailableShifts = (date: string) =>
  apiClient.get<AvailableShiftReturn[]>(`/api/Employee/GetAvailableShifts?date=${date}`);

export const getCoveringPersons = (date: string) =>
  apiClient.get<CoveringPersonReturn[]>(`/api/Employee/GetCoveringPersons?date=${date}`);

export const applyLeave = (req: ApplyLeaveReq) =>
  apiClient.post<{ requestId: number }>("/api/Employee/ApplyLeave", req);

function dateQuery(fromDate?: string, toDate?: string): string {
  const params = new URLSearchParams();
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
