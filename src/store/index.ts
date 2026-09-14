import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import profileReducer from "./profileSlice";
import orgReducer from "./orgSlice";
import leaveReducer from "./leaveSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    org: orgReducer,
    leave: leaveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
