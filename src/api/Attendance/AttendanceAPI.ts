import { Platform } from "react-native";
import { apiClient, type ApiResult } from "../client";
import type {
  AttendanceRecordReturn, AttendanceSummaryReturn, RosterReturn, RosterEmployeeReturn,
  EmployeeRequestReturn, PendingApprovalReturn, MarkAttendanceReq, RequestAttendanceReq,
} from "../../type/attendance";

export const getMyRoster = (date: string) =>
  apiClient.get<RosterReturn>(`/api/Employee/GetMyRoster?date=${date}`);

export const getMyAttendance = (fromDate: string, toDate: string) =>
  apiClient.get<AttendanceRecordReturn[]>(`/api/Employee/GetMyAttendance?fromDate=${fromDate}&toDate=${toDate}`);

export const getMyAttendanceSummary = (year: number, month: number) =>
  apiClient.get<AttendanceSummaryReturn>(`/api/Employee/GetMyAttendanceSummary?year=${year}&month=${month}`);

export const getRosterEmployees = (date: string) =>
  apiClient.get<RosterEmployeeReturn[]>(`/api/Employee/GetRosterEmployees?date=${date}`);

export const getMyRosterChangeRequests = () =>
  apiClient.get<EmployeeRequestReturn[]>("/api/Employee/GetMyRosterChangeRequests");

export const requestRosterChange = (rosterDate: string, note: string) =>
  apiClient.post<{ requestId: number }>("/api/Employee/RequestRosterChange", { rosterDate, note });

export const requestAttendance = (req: RequestAttendanceReq) =>
  apiClient.post<{ requestId: number }>("/api/Employee/RequestAttendance", req);

export const getMyPendingApprovals = () =>
  apiClient.get<PendingApprovalReturn[]>("/api/Employee/GetMyPendingApprovals");

export const approveEmployeeRequest = (requestId: number, approve: boolean, remarks?: string) =>
  apiClient.post<{ message: string }>("/api/Employee/ApproveEmployeeRequest", { requestId, approve, remarks });

/**
 * Multipart/form-data, matching the backend's [FromForm] MarkAttendanceReq — same reasoning as
 * ESS web's document uploads, not base64-in-JSON. Building the photo part differs between web
 * (verification-only in this environment) and native: web needs the blob: URI fetched into an
 * actual Blob first; native's FormData accepts the {uri, name, type} shape directly.
 */
export async function markAttendance(req: MarkAttendanceReq): Promise<ApiResult<{ requestId: number }>> {
  const form = new FormData();
  form.append("Date", req.date);
  form.append("Time", req.time);
  if (req.note) form.append("Note", req.note);
  form.append("Latitude", String(req.latitude));
  form.append("Longitude", String(req.longitude));

  if (req.photoUri) {
    if (Platform.OS === "web") {
      const blob = await (await fetch(req.photoUri)).blob();
      form.append("Photo", blob, "attendance.jpg");
    } else {
      form.append("Photo", { uri: req.photoUri, name: "attendance.jpg", type: "image/jpeg" } as any);
    }
  }

  return apiClient.post<{ requestId: number }>("/api/Employee/MarkAttendance", form, { isFormData: true });
}
