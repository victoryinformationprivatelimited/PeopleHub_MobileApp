import type { ApiResult } from "../client";
import type { AssetItem } from "../../type/assets";

/** Dummy data until the backend team ships the real GetMyAssets endpoint — shaped as an
 * ApiResult so the screen already consumes it the same way it will consume the live call,
 * and swapping in the real apiClient.get(...) later is a one-line change. */
const DUMMY_ASSETS: AssetItem[] = [
  { assetId: 1, assetName: "Dell Latitude 5440", category: "Laptop", assetTag: "VIC-LT-0231", assignedDate: "2024-03-12", status: "Assigned", condition: "Good" },
  { assetId: 2, assetName: "Dell 24\" Monitor", category: "Monitor", assetTag: "VIC-MN-0559", assignedDate: "2024-03-12", status: "Assigned", condition: "Good" },
  { assetId: 3, assetName: "Logitech MX Master 3", category: "Mouse", assetTag: "VIC-AC-1180", assignedDate: "2024-05-02", status: "Assigned", condition: "Good" },
  { assetId: 4, assetName: "iPhone 13", category: "Mobile Phone", assetTag: "VIC-MB-0092", assignedDate: "2023-11-20", status: "Returned", condition: "Fair" },
  { assetId: 5, assetName: "HP LaserJet Printer", category: "Printer", assetTag: "VIC-PR-0044", assignedDate: "2024-01-08", status: "Under Repair", condition: "Needs Service" },
];

export async function getMyAssets(): Promise<ApiResult<AssetItem[]>> {
  return { success: true, data: DUMMY_ASSETS, message: "OK", status: 200 };
}
