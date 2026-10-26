// Employee view of Asset Management. An employee only ever sees their own assets and requests;
// the backend filters by the signed-in employee, never by an id sent from the app.

export type AcknowledgementStatus = "Pending" | "Acknowledged" | "Declined" | "Not Required";

export interface MyAsset {
  assignmentId: number;
  assetCode: string;
  assetTag: string;
  name: string;
  category: string;
  issueDate: string;
  expectedReturnDate: string | null;
  accessories: string;
  condition: string;
  acknowledgement: AcknowledgementStatus;
  declineReason?: string;
  status: "Active" | "Returned" | "Transferred";
  closedOn?: string;
  /** Problems the employee has reported on this asset that are not yet resolved. */
  openReports: number;
}

export const ISSUE_KINDS = ["Fault", "Damage", "Lost", "Stolen"] as const;
export type IssueKind = (typeof ISSUE_KINDS)[number];

export interface AssetIssueInput {
  assignmentId: number;
  kind: IssueKind;
  description: string;
}

export interface AssetIssueReport {
  id: number;
  assignmentId: number;
  assetCode: string;
  assetName: string;
  kind: IssueKind;
  description: string;
  reportedOn: string;
  status: "Open" | "In progress" | "Resolved";
}

export interface RequestableCategory {
  id: number;
  name: string;
}

export type AssetRequestStatus =
  | "Pending Approval"
  | "Info Requested"
  | "Approved"
  | "Reserved"
  | "Issued"
  | "Rejected"
  | "Cancelled";

export interface AssetRequestStep {
  by: string;
  action: string;
  comment: string;
  at: string;
}

export interface MyAssetRequest {
  id: number;
  category: string;
  purpose: string;
  requiredDate: string;
  details: string;
  status: AssetRequestStatus;
  createdOn: string;
  steps: AssetRequestStep[];
}

export interface AssetRequestInput {
  categoryId: number;
  purpose: string;
  requiredDate: string;
  details: string;
}
