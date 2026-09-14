import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { TeamMemberReturn, OrgEntityNode, OrgRoleNode, MyOrgPosition } from "../type/orgHierarchy";
import {
  getMyTeam,
  getMyManagers,
  getEntityTree,
  getEntityHeads,
  getRoleTree,
  getMyOrgPosition,
} from "../api/OrgHierarchy/OrgHierarchyAPI";

/** Redux-backed org hierarchy data, mirroring profileSlice's cache-first pattern (and ESS's
 * orgSlice.ts) — each of the 4 Company Hierarchy tabs fetches once per session and reuses the
 * store on subsequent visits instead of re-hitting the API every time the screen mounts. */

interface AsyncSlice<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function idleSlice<T>(): AsyncSlice<T> {
  return { data: null, loading: false, error: null };
}

interface OrgState {
  team: AsyncSlice<TeamMemberReturn[]>;
  managers: AsyncSlice<TeamMemberReturn[]>;
  companyStructure: AsyncSlice<OrgEntityNode[]>;
  designationHierarchy: AsyncSlice<OrgRoleNode[]>;
  myPosition: AsyncSlice<MyOrgPosition>;
}

const initialState: OrgState = {
  team: idleSlice(),
  managers: idleSlice(),
  companyStructure: idleSlice(),
  designationHierarchy: idleSlice(),
  myPosition: idleSlice(),
};

type OrgSliceKey = keyof OrgState;

function cacheFirst<T>(key: keyof OrgState) {
  return (_: unknown, { getState }: { getState: () => unknown }) => {
    const slice = (getState() as { org: OrgState }).org[key] as AsyncSlice<T>;
    return !(slice.data != null && !slice.loading && !slice.error);
  };
}

export const fetchMyTeam = createAsyncThunk(
  "org/fetchMyTeam",
  async () => {
    const res = await getMyTeam();
    if (!res.success) throw new Error(res.message);
    return res.data ?? [];
  },
  { condition: cacheFirst("team") },
);

export const fetchMyManagers = createAsyncThunk(
  "org/fetchMyManagers",
  async () => {
    const res = await getMyManagers();
    if (!res.success) throw new Error(res.message);
    return res.data ?? [];
  },
  { condition: cacheFirst("managers") },
);

/** Merges GetMyCompanyStructureHeads onto the entity tree client-side by entityId — ported
 * from ESS's ProfileAPI/OrganizationAPI convention (see CompanyStructurePage.tsx). */
export const fetchCompanyStructure = createAsyncThunk(
  "org/fetchCompanyStructure",
  async () => {
    const [entitiesRes, headsRes] = await Promise.all([getEntityTree(), getEntityHeads()]);
    if (!entitiesRes.success) throw new Error(entitiesRes.message);
    const entities = entitiesRes.data ?? [];
    const heads = headsRes.success && headsRes.data ? headsRes.data : [];
    const headById = new Map(heads.map((h) => [h.entityId, h]));
    return entities.map((e) => {
      const head = headById.get(e.entityId);
      return {
        ...e,
        headEmployeeName: head?.headEmployeeName ?? undefined,
        headDesignation: head?.headDesignation ?? undefined,
      };
    });
  },
  { condition: cacheFirst("companyStructure") },
);

export const fetchDesignationHierarchy = createAsyncThunk(
  "org/fetchDesignationHierarchy",
  async () => {
    const res = await getRoleTree();
    if (!res.success) throw new Error(res.message);
    return res.data ?? [];
  },
  { condition: cacheFirst("designationHierarchy") },
);

export const fetchMyOrgPosition = createAsyncThunk(
  "org/fetchMyOrgPosition",
  async () => {
    const res = await getMyOrgPosition();
    if (!res.success) throw new Error(res.message);
    return res.data;
  },
  { condition: cacheFirst("myPosition") },
);

function addAsyncCases<T>(
  builder: import("@reduxjs/toolkit").ActionReducerMapBuilder<OrgState>,
  thunk: ReturnType<typeof createAsyncThunk<T, void>>,
  key: OrgSliceKey,
) {
  builder
    .addCase(thunk.pending, (state) => {
      (state[key] as AsyncSlice<T>).loading = true;
      (state[key] as AsyncSlice<T>).error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key] = { data: action.payload, loading: false, error: null } as OrgState[typeof key];
    })
    .addCase(thunk.rejected, (state, action) => {
      (state[key] as AsyncSlice<T>).loading = false;
      (state[key] as AsyncSlice<T>).error = action.error.message ?? "Failed to load.";
    });
}

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    /** Clears one slice back to idle so a subsequent fetch thunk (skipped by cache-first
     * `condition` otherwise) actually re-hits the API — used for pull-to-refresh. */
    invalidate(state, action: PayloadAction<OrgSliceKey>) {
      state[action.payload] = idleSlice() as OrgState[typeof action.payload];
    },
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, fetchMyTeam, "team");
    addAsyncCases(builder, fetchMyManagers, "managers");
    addAsyncCases(builder, fetchCompanyStructure, "companyStructure");
    addAsyncCases(builder, fetchDesignationHierarchy, "designationHierarchy");
    addAsyncCases(builder, fetchMyOrgPosition, "myPosition");
  },
});

export const { invalidate } = orgSlice.actions;
export default orgSlice.reducer;
