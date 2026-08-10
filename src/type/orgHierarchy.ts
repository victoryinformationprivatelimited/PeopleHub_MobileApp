/**
 * Matches HRIS.Model.RBAC.DTOs.TeamMemberReturn exactly (Backend/HRIS) — shared shape for both
 * GetMyTeam and GetMyManagers. Both are structural proxies built from the Role hierarchy and
 * Entity.HeadId chain, not a literal personal reporting relationship (no such field exists in the
 * data model) — see Design/ESS-Phase4-Backend-Changelog.md §3.
 */
export interface TeamMemberReturn {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  roleId: number | null;
  roleName: string;
  roleLevel: number | null;
  unitEntityId: number | null;
  unitEntityName: string;
}
