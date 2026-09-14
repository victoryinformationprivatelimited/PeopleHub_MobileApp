import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RosterReturn } from "../type/attendance";
import { getMyRosterRange } from "../api/Attendance/AttendanceAPI";

/** Redux-backed roster data, mirroring leaveSlice/orgSlice's cache-first pattern (and
 * PeopleHub-ESS's attendanceSlice.rosterRangeByRange) — each visited month/date-range fetches
 * once and is reused across visits to the roster calendar instead of refetching every time. */

interface AsyncSlice<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function idleSlice<T>(): AsyncSlice<T> {
  return { data: null, loading: false, error: null };
}

interface RosterState {
  rangesByKey: Record<string, AsyncSlice<RosterReturn[]>>;
}

const initialState: RosterState = {
  rangesByKey: {},
};

export function rosterRangeKey(fromDate: string, toDate: string): string {
  return `${fromDate}_${toDate}`;
}

export const fetchRosterRange = createAsyncThunk(
  "roster/fetchRange",
  async (range: { fromDate: string; toDate: string }) => {
    const res = await getMyRosterRange(range.fromDate, range.toDate);
    if (!res.success) throw new Error(res.message);
    return { key: rosterRangeKey(range.fromDate, range.toDate), data: res.data ?? [] };
  },
  {
    condition: (range, { getState }) => {
      const key = rosterRangeKey(range.fromDate, range.toDate);
      const slice = (getState() as { roster: RosterState }).roster.rangesByKey[key];
      const cached = slice != null && slice.data != null && !slice.loading && !slice.error;
      return !cached;
    },
  },
);

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    /** Clears one range back to idle so a subsequent fetch (skipped by cache-first `condition`
     * otherwise) actually re-hits the API — used for pull-to-refresh. */
    invalidateRosterRange(state, action: PayloadAction<string>) {
      state.rangesByKey[action.payload] = idleSlice();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRosterRange.pending, (state, action) => {
        const key = rosterRangeKey(action.meta.arg.fromDate, action.meta.arg.toDate);
        const existing = state.rangesByKey[key];
        state.rangesByKey[key] = { data: existing?.data ?? null, loading: true, error: null };
      })
      .addCase(fetchRosterRange.fulfilled, (state, action) => {
        state.rangesByKey[action.payload.key] = { data: action.payload.data, loading: false, error: null };
      })
      .addCase(fetchRosterRange.rejected, (state, action) => {
        const key = rosterRangeKey(action.meta.arg.fromDate, action.meta.arg.toDate);
        state.rangesByKey[key] = { data: null, loading: false, error: action.error.message ?? "Failed to load." };
      });
  },
});

export const { invalidateRosterRange } = rosterSlice.actions;
export default rosterSlice.reducer;
