import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tokenManager } from "../api/tokenManager";

interface AuthState {
  isAuthenticated: boolean;
  checked: boolean;
}

const initialState: AuthState = { isAuthenticated: false, checked: false };

/** Checks SecureStore for an existing session on app launch — can't read it synchronously
 * (unlike web's js-cookie), so this is a thunk resolved once on startup. */
export const checkExistingSession = createAsyncThunk("auth/checkExistingSession", async () => {
  return tokenManager.hasSession();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    setLoggedOut(state) {
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkExistingSession.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload;
      state.checked = true;
    });
  },
});

export const { setAuthenticated, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
