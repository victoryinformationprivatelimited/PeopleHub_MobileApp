import { apiClient, type ApiResult } from "../client";
import { SECTION_META } from "../../type/sectionMeta";
import type { SectionId, SectionPayload } from "../../type/profile";
import { mapSectionPayload } from "./sectionMappers";

/** Self-scoped only — no employeeId is ever sent by the client, matching web's ProfileAPI.ts. */
export async function getSection(sectionId: SectionId): Promise<ApiResult<SectionPayload>> {
  const meta = SECTION_META[sectionId];
  const result = await apiClient.get<unknown>(`/api/Employee/${meta.route}`);
  const data = result.success && result.data != null ? mapSectionPayload(sectionId, result.data) : null;
  return { ...result, data };
}
