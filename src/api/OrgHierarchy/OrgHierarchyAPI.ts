import { apiClient } from "../client";
import type { TeamMemberReturn, OrgEntityNode, EntityHead, OrgRoleNode, MyOrgPosition } from "../../type/orgHierarchy";

export const getMyTeam = () =>
  apiClient.get<TeamMemberReturn[]>("/api/Employee/GetMyTeam");

export const getMyManagers = () =>
  apiClient.get<TeamMemberReturn[]>("/api/Employee/GetMyManagers");

// Ported from ESS's OrganizationAPI.ts — same self-service endpoints (EmployeeSelfServiceController),
// used by the "Company Structure" and "Designation Hierarchy" tabs.

export const getEntityTree = () =>
  apiClient.get<OrgEntityNode[]>("/api/Employee/GetMyCompanyStructure");

export const getEntityHeads = () =>
  apiClient.get<EntityHead[]>("/api/Employee/GetMyCompanyStructureHeads");

export const getRoleTree = () =>
  apiClient.get<OrgRoleNode[]>("/api/Employee/GetMyDesignationHierarchy");

export const getMyOrgPosition = () =>
  apiClient.get<MyOrgPosition>("/api/Employee/GetMyOrgPosition");
