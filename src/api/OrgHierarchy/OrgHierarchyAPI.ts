import { apiClient } from "../client";
import type { TeamMemberReturn } from "../../type/orgHierarchy";

export const getMyTeam = () =>
  apiClient.get<TeamMemberReturn[]>("/api/Employee/GetMyTeam");

export const getMyManagers = () =>
  apiClient.get<TeamMemberReturn[]>("/api/Employee/GetMyManagers");
