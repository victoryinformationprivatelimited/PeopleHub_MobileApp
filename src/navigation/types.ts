import type { SectionId } from "../type/profile";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ProfileList: undefined;
  ProfileSection: { sectionId: SectionId; label: string };
  AttendanceHome: undefined;
  MarkAttendance: undefined;
  PendingApprovals: undefined;
};
