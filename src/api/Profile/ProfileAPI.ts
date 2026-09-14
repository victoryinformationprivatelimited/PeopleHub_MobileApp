import { apiClient, type ApiResult } from "../client";
import { SECTION_META } from "../../type/sectionMeta";
import type { SectionId, SectionPayload } from "../../type/profile";
import { mapSectionPayload, mapEmploymentDetails, type EmploymentLookups } from "./sectionMappers";

/** Self-scoped only — no employeeId is ever sent by the client, matching web's ProfileAPI.ts. */

// Raw DTO variant of "basic" — ported from ESS's ProfileAPI.getBasicInfoRaw. mapBasicInfo (the
// display-ready SectionPayload from getSection("basic")) drops employeeImage, so callers that
// need the avatar photo (e.g. the home screen hero) must hit this instead.
export interface BasicInfoRaw {
  employeeImage: string | null;
  firstName: string | null;
  lastName: string | null;
}

export function getBasicInfoRaw(): Promise<ApiResult<BasicInfoRaw>> {
  return apiClient.get<BasicInfoRaw>(`/api/Employee/${SECTION_META.basic.route}`);
}

// Session-level memoized cache, ported from ESS's ProfileAPI.ts — GetMyEmploymentLookups is a
// fixed lookup list (roles, categories, types, entities, grades), not per-employee data, so one
// fetch covers the whole session. Failures are NOT cached, so a later retry can succeed.
let employmentLookupsPromise: Promise<ApiResult<EmploymentLookups>> | null = null;

export function getEmploymentLookups(): Promise<ApiResult<EmploymentLookups>> {
  if (!employmentLookupsPromise) {
    employmentLookupsPromise = apiClient.get<EmploymentLookups>("/api/Employee/GetMyEmploymentLookups").then((result) => {
      if (!result.success) employmentLookupsPromise = null;
      return result;
    });
  }
  return employmentLookupsPromise;
}

export async function getSection(sectionId: SectionId): Promise<ApiResult<SectionPayload>> {
  const meta = SECTION_META[sectionId];
  const result = await apiClient.get<unknown>(`/api/Employee/${meta.route}`);
  if (!result.success || result.data == null) return { ...result, data: null };

  if (sectionId === "employment") {
    // GetMyEmploymentLookups may 403 for a non-admin account — swallowed (lookups=null) and
    // mapEmploymentDetails falls back to raw IDs rather than failing the whole section.
    const lookups = await getEmploymentLookups();
    return { ...result, data: mapEmploymentDetails(result.data, lookups.success ? lookups.data : null) };
  }

  return { ...result, data: mapSectionPayload(sectionId, result.data) };
}
