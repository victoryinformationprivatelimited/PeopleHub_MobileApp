import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { LeaveEntitlementReturn, LeaveRequestReturn } from "../type/leave";
import { getMyLeaveEntitlements, getMyPendingLeaves, getMyApprovedLeaves, getMyRejectedLeaves } from "../api/Leave/LeaveAPI";

/** Redux-backed leave data, mirroring profileSlice/orgSlice's cache-first pattern — entitlements
 * and each of the 3 request lists (Pending/Approved/Rejected) fetch once per session and are
 * reused across LeaveHomeScreen and LeaveRequestsScreen instead of refetching on every visit. */

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

interface AsyncSlice<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function idleSlice<T>(): AsyncSlice<T> {
  return { data: null, loading: false, error: null };
}

interface LeaveState {
  entitlements: AsyncSlice<LeaveEntitlementReturn[]>;
  requests: Record<LeaveStatus, AsyncSlice<LeaveRequestReturn[]>>;
}

const initialState: LeaveState = {
  entitlements: idleSlice(),
  requests: {
    Pending: idleSlice(),
    Approved: idleSlice(),
    Rejected: idleSlice(),
  },
};

const REQUEST_FETCHERS: Record<LeaveStatus, () => ReturnType<typeof getMyPendingLeaves>> = {
  Pending: getMyPendingLeaves,
  Approved: getMyApprovedLeaves,
  Rejected: getMyRejectedLeaves,
};

export const fetchLeaveEntitlements = createAsyncThunk(
  "leave/fetchEntitlements",
  async (year: number) => {
    const res = await getMyLeaveEntitlements(year);
    if (!res.success) throw new Error(res.message);
    return res.data ?? [];
  },
  {
    condition: (_year, { getState }) => {
      const slice = (getState() as { leave: LeaveState }).leave.entitlements;
      return !(slice.data != null && !slice.loading && !slice.error);
    },
  },
);

export const fetchLeaveRequests = createAsyncThunk(
  "leave/fetchRequests",
  async (status: LeaveStatus) => {
    const res = await REQUEST_FETCHERS[status]();
    if (!res.success) throw new Error(res.message);
    return { status, data: res.data ?? [] };
  },
  {
    condition: (status, { getState }) => {
      const slice = (getState() as { leave: LeaveState }).leave.requests[status];
      return !(slice.data != null && !slice.loading && !slice.error);
    },
  },
);

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    /** Clears one slice back to idle so a subsequent fetch (skipped by cache-first `condition`
     * otherwise) actually re-hits the API — used for pull-to-refresh. */
    invalidateEntitlements(state) {
      state.entitlements = idleSlice();
    },
    invalidateRequests(state, action: PayloadAction<LeaveStatus>) {
      state.requests[action.payload] = idleSlice();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveEntitlements.pending, (state) => {
        state.entitlements.loading = true;
        state.entitlements.error = null;
      })
      .addCase(fetchLeaveEntitlements.fulfilled, (state, action) => {
        state.entitlements = { data: action.payload, loading: false, error: null };
      })
      .addCase(fetchLeaveEntitlements.rejected, (state, action) => {
        state.entitlements.loading = false;
        state.entitlements.error = action.error.message ?? "Failed to load.";
      })
      .addCase(fetchLeaveRequests.pending, (state, action) => {
        state.requests[action.meta.arg].loading = true;
        state.requests[action.meta.arg].error = null;
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.requests[action.payload.status] = { data: action.payload.data, loading: false, error: null };
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.requests[action.meta.arg].loading = false;
        state.requests[action.meta.arg].error = action.error.message ?? "Failed to load.";
      });
  },
});

export const { invalidateEntitlements, invalidateRequests } = leaveSlice.actions;
export default leaveSlice.reducer;
