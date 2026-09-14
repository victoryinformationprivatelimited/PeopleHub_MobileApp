/**
 * Matches HRIS.Model.RBAC.DTOs.TeamMemberReturn exactly (Backend/HRIS) — shared shape for both
 * GetMyTeam and GetMyManagers. Both are structural proxies built from the Role hierarchy and
 * Entity.HeadId chain, not a literal personal reporting relationship (no such field exists in the
 * data model) — see Design/ESS-Phase4-Backend-Changelog.md §3.
 */
/** The 4 Company Hierarchy destinations, ported as 4 dedicated ESS pages/routes (each with its
 * own sidebar item) rather than tabs of one screen — mobile mirrors that as 4 cards on a menu
 * screen navigating to one shared detail screen parameterized by this key. */
export type OrgHierarchyView = "myTeam" | "myManagers" | "companyStructure" | "designationHierarchy";

export interface TeamMemberReturn {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  roleId: number | null;
  roleName: string;
  roleLevel: number | null;
  unitEntityId: number | null;
  unitEntityName: string;
  /** Already-resolved absolute URL (e.g. https://peoplehubapi.h2so4.lk/api/Employee/image/{file}), or null. */
  employeeImage: string | null;
}

/**
 * Ported from PeopleHub-ESS's src/type/orgHierarchy.ts — same real backend DTOs (EntityResult /
 * GetMyCompanyStructure and GetMyDesignationHierarchy), both flat lists nested client-side via
 * buildTree() below using parentId, exactly as ESS's OrgTree/NodeDiagram already do.
 */
export interface UnitEmployee {
  employeeId: number;
  employeeName: string;
  roleName: string;
  isMe?: boolean;
}

export interface OrgEntityNode {
  entityId: number;
  entityName: string;
  parentId: number | null;
  parentName: string | null;
  level: number;
  typeId?: number | null;
  typeName?: string | null;
  isRootEtity?: boolean;
  /** UI-only, populated client-side from EntityHead[] by matching entityId — not part of the raw DTO. */
  headEmployeeName?: string;
  headDesignation?: string;
  employees?: UnitEmployee[];
}

/** Maps to GetMyCompanyStructureHeads — every entity's resolved head, matched onto OrgEntityNode by entityId. */
export interface EntityHead {
  entityId: number;
  headEmployeeId: number | null;
  headEmployeeName: string | null;
  headDesignation: string | null;
}

export interface OrgRoleNode {
  roleId: number;
  roleName: string;
  parentId: number | null;
  level: number;
  employees?: UnitEmployee[];
}

/** Maps to GetMyOrgPosition — the caller's own entityId/roleId, used for "You are here" highlighting. */
export interface MyOrgPosition {
  entityId: number;
  employeeRoleId: number;
}

export interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
}

export function buildTree<T extends { parentId: number | null }>(
  flat: T[],
  getId: (item: T) => number,
): TreeNode<T>[] {
  const byId = new Map<number, TreeNode<T>>();
  flat.forEach((item) => byId.set(getId(item), { data: item, children: [] }));

  const roots: TreeNode<T>[] = [];
  flat.forEach((item) => {
    const node = byId.get(getId(item))!;
    if (item.parentId != null && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
