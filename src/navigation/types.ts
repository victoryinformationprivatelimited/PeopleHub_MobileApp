import type { SectionId } from "../type/profile";

export type RootStackParamList = {
  Login: undefined;
  ProfileList: undefined;
  ProfileSection: { sectionId: SectionId; label: string };
};
