import type { SectionMeta, SectionId } from "./profile";

/** Ported from PeopleHub-ESS/src/type/sectionMeta.ts — same 23 sections/routes, icon/color
 * dropped since mobile UI isn't designed yet. */
export const SECTION_GROUPS: { title: string; items: { id: SectionId; label: string; route: string }[] }[] = [
  { title: "Personal", items: [
    { id: "basic", label: "Basic information", route: "GetMyBasicInfo" },
    { id: "carddetails", label: "Card details", route: "GetMyCardDetails" },
    { id: "contact", label: "Contact information", route: "GetMyContactInfo" },
  ]},
  { title: "Employment", items: [
    { id: "employment", label: "Employment details", route: "GetMyEmploymentDetails" },
    { id: "attendance", label: "Attendance details", route: "GetMyAttendanceDetails" },
    { id: "compensation", label: "Compensation", route: "GetMyCompensationDetails" },
    { id: "workhistory", label: "Work history", route: "GetMyWorkHistory" },
  ]},
  { title: "Qualifications & skills", items: [
    { id: "qualifications", label: "Qualifications", route: "GetMyQualifications" },
    { id: "certifications", label: "Certifications & licenses", route: "GetMyCertifications" },
    { id: "languages", label: "Languages", route: "GetMyLanguages" },
    { id: "skills", label: "Skills", route: "GetMySkills" },
    { id: "visa", label: "Work visa & permits", route: "GetMyWorkVisaDetails" },
  ]},
  { title: "Compliance & records", items: [
    { id: "bgcheck", label: "Background checks", route: "GetMyBackgroundChecks" },
    { id: "agreements", label: "Agreements & contracts", route: "GetMyAgreementsAndContracts" },
    { id: "disciplinary", label: "Disciplinary actions", route: "GetMyDisciplinaryActions" },
    { id: "policy", label: "Policy acknowledgements", route: "GetMyPolicyAcknowledgements" },
    { id: "privacy", label: "Data privacy", route: "GetMyDataPrivacy" },
  ]},
  { title: "Engagement", items: [
    { id: "engagements", label: "Engagements", route: "GetMyEngagements" },
    { id: "hobbies", label: "Hobbies & interests", route: "GetMyHobbiesAndClubs" },
    { id: "groups", label: "Groups", route: "GetMyGroups" },
    { id: "recognition", label: "Recognition & awards", route: "GetMyRecognitionAwards" },
  ]},
  { title: "Documents", items: [
    { id: "documents", label: "Documents", route: "GetMyDocuments" },
  ]},
  { title: "Health & exit", items: [
    { id: "health", label: "Health records", route: "GetMyHealthRecords" },
    { id: "exit", label: "Exit information", route: "GetMyExitInformation" },
    { id: "global", label: "Global considerations", route: "GetMyGlobalConsiderations" },
  ]},
];

export const SECTION_META: Record<string, SectionMeta> = SECTION_GROUPS.reduce(
  (acc, group) => {
    group.items.forEach((item) => {
      acc[item.id] = { id: item.id, label: item.label, route: item.route, groupTitle: group.title };
    });
    return acc;
  },
  {} as Record<string, SectionMeta>,
);
