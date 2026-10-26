import type { ApiResult } from "../client";
import type {
  AssetIssueInput,
  AssetIssueReport,
  AssetRequestInput,
  AssetRequestStatus,
  MyAsset,
  MyAssetRequest,
  RequestableCategory,
} from "../../type/assets";

/** TEMPORARY in-memory implementation until the backend ships the employee asset endpoints. Every
 * function returns the ApiResult envelope the real calls will, so swapping in apiClient.get / post
 * leaves the screens untouched. Same data and rules as the ESS web app's AssetsAPI, so both behave
 * identically. The backend must scope every call to the signed-in employee; nothing here takes an
 * employee id. */

const ymd = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowIso = () => new Date().toISOString();

interface Store {
  assets: MyAsset[];
  reports: AssetIssueReport[];
  requests: MyAssetRequest[];
  nextReport: number;
  nextRequest: number;
}

const seed = (): Store => ({
  assets: [
    { assignmentId: 1, assetCode: "LAP-000001", assetTag: "VIC-LT-0231", name: "Dell Latitude 5440", category: "Laptop", issueDate: ymd(-380), expectedReturnDate: null, accessories: "Charger, laptop bag", condition: "Good", acknowledgement: "Acknowledged", status: "Active", openReports: 0 },
    { assignmentId: 2, assetCode: "MON-000001", assetTag: "VIC-MN-0559", name: "Dell 24in Monitor", category: "Monitor", issueDate: ymd(-380), expectedReturnDate: null, accessories: "", condition: "Good", acknowledgement: "Acknowledged", status: "Active", openReports: 1 },
    { assignmentId: 3, assetCode: "LAP-000006", assetTag: "VIC-LT-0405", name: "MacBook Pro 14", category: "Laptop", issueDate: ymd(-3), expectedReturnDate: null, accessories: "Charger, USB-C dock", condition: "New", acknowledgement: "Pending", status: "Active", openReports: 0 },
    { assignmentId: 4, assetCode: "VEH-000002", assetTag: "VIC-VH-0008", name: "Suzuki Alto (CAZ-9015)", category: "Vehicle", issueDate: ymd(-40), expectedReturnDate: ymd(5), accessories: "Spare key", condition: "Good", acknowledgement: "Acknowledged", status: "Active", openReports: 0 },
    { assignmentId: 5, assetCode: "ACC-000003", assetTag: "VIC-AC-1182", name: "Access Card", category: "Access Equipment", issueDate: ymd(-60), expectedReturnDate: ymd(-4), accessories: "", condition: "Good", acknowledgement: "Acknowledged", status: "Active", openReports: 0 },
    { assignmentId: 6, assetCode: "MOB-000004", assetTag: "VIC-MB-0071", name: "Samsung Galaxy A52", category: "Mobile Phone", issueDate: ymd(-700), expectedReturnDate: null, accessories: "Case", condition: "Fair", acknowledgement: "Acknowledged", status: "Returned", closedOn: ymd(-250), openReports: 0 },
  ],
  reports: [
    { id: 1, assignmentId: 2, assetCode: "MON-000001", assetName: "Dell 24in Monitor", kind: "Fault", description: "Flickers after an hour of use", reportedOn: ymd(-2), status: "In progress" },
  ],
  requests: [
    { id: 11, category: "Laptop", purpose: "Second machine for client demos", requiredDate: ymd(10), details: "", status: "Pending Approval", createdOn: ymd(-1), steps: [{ by: "You", action: "Submitted", comment: "", at: nowIso() }] },
    {
      id: 10, category: "Mobile Phone", purpose: "Field work phone", requiredDate: ymd(14), details: "", status: "Info Requested", createdOn: ymd(-5),
      steps: [
        { by: "You", action: "Submitted", comment: "", at: nowIso() },
        { by: "Ravi Shankar", action: "Returned for information", comment: "Is this to replace the Galaxy you returned in March?", at: nowIso() },
      ],
    },
    {
      id: 8, category: "Monitor", purpose: "Dual screen setup", requiredDate: ymd(-60), details: "", status: "Issued", createdOn: ymd(-75),
      steps: [
        { by: "You", action: "Submitted", comment: "", at: nowIso() },
        { by: "Ravi Shankar", action: "Approved", comment: "", at: nowIso() },
        { by: "Asset desk", action: "Issued", comment: "MON-000001 issued", at: nowIso() },
      ],
    },
  ],
  nextReport: 2,
  nextRequest: 12,
});

let store: Store = seed();

/** Puts the demo data back to its starting state (used by the logic check script). */
export function resetAssetsMock(): void {
  store = seed();
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const ok = <T,>(data: T, message = "OK", status = 200): ApiResult<T> => ({ success: true, data: clone(data), message, status });
const fail = <T = never,>(message: string, status = 400): ApiResult<T> => ({ success: false, data: null, message, status });

export const REQUESTABLE_CATEGORIES: RequestableCategory[] = [
  { id: 2, name: "Laptop" }, { id: 3, name: "Desktop" }, { id: 4, name: "Monitor" }, { id: 6, name: "Mobile Phone" },
  { id: 7, name: "Office Furniture" }, { id: 9, name: "Access Equipment" },
];

export async function getMyAssets(): Promise<ApiResult<MyAsset[]>> {
  return ok(store.assets);
}

export async function acknowledgeAsset(assignmentId: number): Promise<ApiResult<MyAsset>> {
  const a = store.assets.find((x) => x.assignmentId === assignmentId);
  if (!a) return fail("Asset not found.", 404);
  if (a.status !== "Active") return fail("This asset is no longer assigned to you.");
  if (a.acknowledgement !== "Pending" && a.acknowledgement !== "Declined") return fail("There is nothing to acknowledge for this asset.");
  a.acknowledgement = "Acknowledged";
  a.declineReason = undefined;
  return ok(a, `Thanks. You have acknowledged ${a.name}.`);
}

export async function declineAsset(assignmentId: number, reason: string): Promise<ApiResult<MyAsset>> {
  const a = store.assets.find((x) => x.assignmentId === assignmentId);
  if (!a) return fail("Asset not found.", 404);
  if (a.status !== "Active") return fail("This asset is no longer assigned to you.");
  if (a.acknowledgement !== "Pending") return fail("This handover has already been answered.");
  if (!reason.trim()) return fail("Tell us why you are declining.");
  a.acknowledgement = "Declined";
  a.declineReason = reason.trim();
  return ok(a, "Declined. The asset team will follow up with you.");
}

export async function reportAssetIssue(input: AssetIssueInput): Promise<ApiResult<AssetIssueReport>> {
  const a = store.assets.find((x) => x.assignmentId === input.assignmentId);
  if (!a || a.status !== "Active") return fail("Choose an asset you currently hold.");
  if (!input.description.trim()) return fail("Describe what happened.");
  const report: AssetIssueReport = {
    id: store.nextReport++, assignmentId: a.assignmentId, assetCode: a.assetCode, assetName: a.name, kind: input.kind,
    description: input.description.trim(), reportedOn: ymd(0), status: "Open",
  };
  store.reports.unshift(report);
  a.openReports += 1;
  const lost = input.kind === "Lost" || input.kind === "Stolen";
  return ok(report, lost ? "Reported. The asset team has been alerted; please also tell your manager." : "Reported. The asset team will be in touch.", 201);
}

export async function getMyIssueReports(): Promise<ApiResult<AssetIssueReport[]>> {
  return ok(store.reports);
}

export async function getRequestableCategories(): Promise<ApiResult<RequestableCategory[]>> {
  return ok(REQUESTABLE_CATEGORIES);
}

export async function getMyAssetRequests(): Promise<ApiResult<MyAssetRequest[]>> {
  return ok([...store.requests].sort((a, b) => b.id - a.id));
}

export async function submitAssetRequest(input: AssetRequestInput): Promise<ApiResult<MyAssetRequest>> {
  const cat = REQUESTABLE_CATEGORIES.find((c) => c.id === input.categoryId);
  if (!cat) return fail("Choose what you need.");
  if (!input.purpose.trim()) return fail("Tell us what it is for.");
  if (!input.requiredDate) return fail("Choose the date you need it by.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.requiredDate) || Number.isNaN(Date.parse(input.requiredDate))) return fail("Enter the date as YYYY-MM-DD.");
  if (input.requiredDate < ymd(0)) return fail("The date you need it by cannot be in the past.");
  const req: MyAssetRequest = {
    id: store.nextRequest++, category: cat.name, purpose: input.purpose.trim(), requiredDate: input.requiredDate, details: input.details.trim(),
    status: "Pending Approval", createdOn: ymd(0), steps: [{ by: "You", action: "Submitted", comment: "", at: nowIso() }],
  };
  store.requests.push(req);
  return ok(req, `Request #${req.id} sent for approval.`, 201);
}

export async function answerAssetRequest(id: number, comment: string): Promise<ApiResult<MyAssetRequest>> {
  const r = store.requests.find((x) => x.id === id);
  if (!r) return fail("Request not found.", 404);
  if (r.status !== "Info Requested") return fail("This request is not waiting for your reply.");
  if (!comment.trim()) return fail("Type your reply first.");
  r.status = "Pending Approval";
  r.steps.push({ by: "You", action: "Replied", comment: comment.trim(), at: nowIso() });
  return ok(r, "Reply sent. Your request is back with the approver.");
}

export async function cancelAssetRequest(id: number): Promise<ApiResult<MyAssetRequest>> {
  const r = store.requests.find((x) => x.id === id);
  if (!r) return fail("Request not found.", 404);
  const cancellable: AssetRequestStatus[] = ["Pending Approval", "Info Requested", "Approved", "Reserved"];
  if (!cancellable.includes(r.status)) return fail(`A request that is "${r.status}" cannot be cancelled.`);
  r.status = "Cancelled";
  r.steps.push({ by: "You", action: "Cancelled", comment: "", at: nowIso() });
  return ok(r, "Request cancelled.");
}
