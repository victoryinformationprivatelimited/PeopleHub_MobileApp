export type AssetStatus = "Assigned" | "Returned" | "Under Repair";

export interface AssetItem {
  assetId: number;
  assetName: string;
  category: string;
  assetTag: string;
  assignedDate: string;
  status: AssetStatus;
  condition: string;
}
