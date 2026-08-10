import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { SectionId, SectionPayload } from "../type/profile";
import { getSection } from "../api/Profile/ProfileAPI";

interface SectionState {
  data: SectionPayload | null;
  loading: boolean;
  error: string | null;
}

interface ProfileState {
  sections: Partial<Record<SectionId, SectionState>>;
}

const initialState: ProfileState = { sections: {} };

export const fetchSection = createAsyncThunk(
  "profile/fetchSection",
  async (sectionId: SectionId, { rejectWithValue }) => {
    const result = await getSection(sectionId);
    if (!result.success) return rejectWithValue({ sectionId, message: result.message });
    return { sectionId, data: result.data };
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSection.pending, (state, action) => {
        state.sections[action.meta.arg] = { data: null, loading: true, error: null };
      })
      .addCase(fetchSection.fulfilled, (state, action) => {
        state.sections[action.payload.sectionId] = { data: action.payload.data, loading: false, error: null };
      })
      .addCase(fetchSection.rejected, (state, action) => {
        const payload = action.payload as { sectionId: SectionId; message: string };
        state.sections[payload.sectionId] = { data: null, loading: false, error: payload.message };
      });
  },
});

export default profileSlice.reducer;
