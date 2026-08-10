import type { SectionId } from "../type/profile";

/** Every pushable screen, grouped conceptually by which bottom tab's stack renders it. Kept as
 * one flat list (rather than four separate per-tab param-list types) so every screen component's
 * existing `NativeStackScreenProps<RootStackParamList, "X">` typing keeps working unchanged —
 * React Navigation doesn't require a nested stack's param list to be exhaustive of what it
 * renders, only that each `<Stack.Screen name="X">` name exists as a key here. */
export type RootStackParamList = {
  Home: undefined;

  AttendanceHome: undefined;
  MarkAttendance: undefined;
  PendingApprovals: undefined;
  LeaveHome: undefined;
  LeaveRequests: { status: "Pending" | "Approved" | "Rejected" };
  ApplyLeave: undefined;

  PayrollHome: undefined;
  Payslip: { payPeriodId: number; label: string };
  Reimbursements: undefined;
  RequestReimbursement: undefined;

  ProfileList: undefined;
  ProfileSection: { sectionId: SectionId; label: string };
  CompanyHierarchy: undefined;
};

/** The outer navigator: unauthenticated Login, or the authenticated bottom-tab shell. */
export type RootNavParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  AttendanceTab: undefined;
  PayrollTab: undefined;
  ProfileTab: undefined;
};
