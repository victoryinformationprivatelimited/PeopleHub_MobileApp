import { Platform } from "react-native";
import { apiClient, type ApiResult } from "../client";
import type { PayPeriodReturn, PayslipReturn, ReimbursementReturn, RequestReimbursementReq } from "../../type/payroll";

export const getMyPayPeriods = () =>
  apiClient.get<PayPeriodReturn[]>("/api/Employee/GetMyPayPeriods");

export const getMyPayslip = (payPeriodId: number) =>
  apiClient.get<PayslipReturn>(`/api/Employee/GetMyPayslip?payPeriodId=${payPeriodId}`);

export const getMyReimbursements = () =>
  apiClient.get<ReimbursementReturn[]>("/api/Employee/GetMyReimbursements");

/** Multipart/form-data — same pattern as Attendance's markAttendance (matches the backend's
 * [FromForm] RequestReimbursementReq with an optional IFormFile document). */
export async function requestReimbursement(req: RequestReimbursementReq): Promise<ApiResult<{ reimbursementId: number }>> {
  const form = new FormData();
  form.append("ReimbursementType", req.reimbursementType);
  if (req.description) form.append("Description", req.description);
  if (req.payPeriodId != null) form.append("PayPeriodId", String(req.payPeriodId));
  form.append("Amount", String(req.amount));

  if (req.documentUri) {
    if (Platform.OS === "web") {
      const blob = await (await fetch(req.documentUri)).blob();
      form.append("Document", blob, "receipt.jpg");
    } else {
      form.append("Document", { uri: req.documentUri, name: "receipt.jpg", type: "image/jpeg" } as any);
    }
  }

  return apiClient.post<{ reimbursementId: number }>("/api/Employee/RequestReimbursement", form, { isFormData: true });
}
