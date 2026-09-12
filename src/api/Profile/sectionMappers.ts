import type { BadgeStatus, DocumentItem, EntryItem, FieldItem, SectionPayload } from "../../type/profile";

/**
 * Ported directly from PeopleHub-ESS/src/api/Profile/sectionMappers.ts (web) —
 * same real backend DTO shapes, same mapping logic, per ESS-Mobile-App-Plan.md
 * §3 ("don't re-derive the contract twice"). Only mapDocuments differs
 * slightly (mobile's DocumentItem type dropped icon/color, which the web UI
 * needed and mobile's UI doesn't have designed yet).
 */

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatDateRange(from: string | null | undefined, to: string | null | undefined): string {
  const f = formatDate(from) ?? "—";
  const t = formatDate(to) ?? "Present";
  return `${f} – ${t}`;
}

function fields(pairs: FieldItem[]): SectionPayload {
  return { type: "fields", fields: pairs };
}

function entries(items: EntryItem[]): SectionPayload {
  return items.length > 0 ? { type: "entries", entries: items } : { type: "empty" };
}

function statusBadge(status: string | null | undefined): { status: BadgeStatus; text: string } | undefined {
  if (!status) return undefined;
  const s = status.toLowerCase();
  const mapped: BadgeStatus =
    s === "active" || s === "approved" || s === "completed" || s === "acknowledged" ? "approved" :
    s === "expired" || s === "rejected" || s === "inactive" ? "rejected" :
    s === "draft" ? "draft" :
    s === "pending" ? "pending" :
    "info";
  return { status: mapped, text: status };
}

// ---- Personal ----

function mapBasicInfo(dto: any): SectionPayload {
  return fields([
    { label: "First Name", value: dto.firstName ?? null },
    { label: "Middle Name", value: dto.middleName ?? null },
    { label: "Last Name", value: dto.lastName ?? null },
    { label: "Preferred Name/Nickname", value: dto.preferredName ?? null },
    { label: "Employee Number", value: dto.employeeNumber ?? null },
    { label: "Date of Birth", value: formatDate(dto.dateofBirth) },
    { label: "Gender", value: dto.gender ?? null },
    { label: "Nationality", value: dto.nationality ?? null },
    { label: "Ethnicity", value: dto.ethnicity ?? null },
    { label: "Marital Status", value: dto.maritalStatus ?? null },
    { label: "NIC No", value: dto.nicNo ?? null },
    { label: "Passport ID", value: dto.passportId ?? null },
    { label: "License Number", value: dto.licenseNo ?? null },
    { label: "Remarks", value: dto.remarks ?? null },
  ]);
}

function formatAddress(a: any): string | null {
  if (!a) return null;
  return [a.address, a.city, a.district, a.province, a.country, a.postalCode].filter(Boolean).join(", ") || null;
}

const TAX_RESIDENCY_BADGE: Record<string, BadgeStatus> = {
  resident: "approved", "non-resident": "pending", "dual resident": "info",
};

function mapCardDetails(dto: any): SectionPayload {
  return fields([
    { label: "Bank Name", value: dto.bankName ?? null },
    { label: "Branch Name", value: dto.branchName ?? null },
    { label: "Branch Code", value: dto.branchCode ?? null },
    { label: "Account Name", value: dto.accountName ?? null },
    { label: "Account Number", value: dto.accountNumber ?? null },
    { label: "IBAN", value: dto.iban ?? null },
    { label: "SWIFT / BIC Code", value: dto.swiftCode ?? null },
    { label: "Payment Method", value: dto.paymentMethod ?? null },
    {
      label: "Verification Status",
      value: dto.isVerified ? "Verified" : "Not Verified",
      badge: dto.isVerified ? { status: "approved", text: "Verified" } : undefined,
    },
    { label: "Tax Country", value: dto.taxCountry ?? null },
    { label: "Tax Identification Number (TIN)", value: dto.taxIdentificationNumber ?? null },
    { label: "Provident Fund Number", value: dto.providentFundNumber ?? null },
    {
      label: "Tax Residency Status",
      value: dto.taxResidencyStatus ?? null,
      badge: dto.taxResidencyStatus
        ? { status: TAX_RESIDENCY_BADGE[dto.taxResidencyStatus.toLowerCase()] ?? "info", text: dto.taxResidencyStatus }
        : undefined,
    },
    { label: "Tax Remarks", value: dto.taxRemarks ?? null },
  ]);
}

function mapContactInfo(dto: any): SectionPayload {
  const f: FieldItem[] = [
    { label: "Current Address", value: formatAddress(dto.currentAddress) },
    { label: "Permanent Address", value: formatAddress(dto.permanentAddress) },
    { label: "Personal Phone", value: dto.personalPhone ?? null },
    { label: "Residence Phone", value: dto.residencePhone ?? null },
    { label: "Office Phone", value: dto.officePhone ?? null },
    { label: "Personal Email", value: dto.personalEmail ?? null },
    { label: "Office Email", value: dto.officeEmail ?? null },
  ];
  (dto.socialLinks ?? []).forEach((s: any) =>
    f.push({ label: `Social — ${s.socialMediaType}`, value: s.linkorName ?? null }));
  (dto.emergencyContacts ?? []).forEach((c: any, i: number) =>
    f.push({ label: `Emergency Contact ${i + 1}`, value: `${c.name} (${c.relationship}) · ${c.phoneNumber}${c.emailAddress ? ` · ${c.emailAddress}` : ""}` }));
  return fields(f);
}

// ---- Employment ----

export interface EmploymentLookups {
  entities: { entityId: number; entityName: string; location?: string | null }[];
  roles: { employeeRoleId: number; employeeRoleName: string }[];
  categories: { employeeCategoryId: number; employeeCategoryName: string }[];
  types: { employeeTypeId: number; employeeTypeName: string }[];
  grades: { gradeId: number; gradeName: string }[];
}

/**
 * lookups comes from GetMyEmploymentLookups (ported from ESS's ProfileAPI.getEmploymentLookups)
 * since GetMyEmploymentDetails returns raw role/category/type/entity/grade IDs, not names.
 * Falls back to the raw ID if lookups weren't available so the section never goes blank.
 */
function mapEmploymentDetails(dto: any, lookups?: EmploymentLookups | null): SectionPayload {
  const roleName = lookups?.roles.find((r) => r.employeeRoleId === dto.employeeRole)?.employeeRoleName;
  const categoryName = lookups?.categories.find((c) => c.employeeCategoryId === dto.employeeCategory)?.employeeCategoryName;
  const typeName = lookups?.types.find((t) => t.employeeTypeId === dto.employeeType)?.employeeTypeName;
  const entityName = lookups?.entities.find((e) => e.entityId === dto.entity)?.entityName;
  const gradeName = lookups?.grades.find((g) => g.gradeId === dto.employmentGrade)?.gradeName;

  return fields([
    { label: "Role", value: roleName ?? (dto.employeeRole != null ? String(dto.employeeRole) : null) },
    { label: "Category", value: categoryName ?? (dto.employeeCategory != null ? String(dto.employeeCategory) : null) },
    { label: "Type", value: typeName ?? (dto.employeeType != null ? String(dto.employeeType) : null) },
    { label: "Entity", value: entityName ?? (dto.entity != null ? String(dto.entity) : null) },
    { label: "Hire Date", value: formatDate(dto.hireDate) },
    { label: "Employment Status", value: dto.employmentStatus === true ? "Active" : dto.employmentStatus === false ? "Inactive" : null },
    { label: "Employment Grade", value: gradeName ?? (dto.employmentGrade != null ? String(dto.employmentGrade) : null) },
    { label: "Work Location", value: dto.workLocation ?? null },
    { label: "Work Type", value: dto.workType ?? null },
    { label: "Remarks", value: dto.remarks ?? null },
  ]);
}

function mapAttendanceDetails(dto: any): SectionPayload {
  return fields([
    { label: "Attendance ID", value: dto.attendanceId ?? null },
    { label: "Remarks", value: dto.remarks ?? null },
  ]);
}

function mapCompensation(dto: any): SectionPayload {
  return fields([
    { label: "Currency", value: dto.currency ?? null },
    { label: "Payroll Country", value: dto.payrollCountry ?? null },
    { label: "Payroll Frequency", value: dto.payrollFrequency ?? null },
  ]);
}

function mapWorkHistory(dto: any): SectionPayload {
  const items: EntryItem[] = [
    ...((dto.previousPositions ?? []) as any[]).map((p) => ({
      title: `${p.previousRoleName ?? "—"} → ${p.newRoleName ?? "—"}`,
      sub: `${p.previousUnitName ?? "—"} → ${p.newUnitName ?? "—"} · ${formatDateRange(p.fromDate, p.toDate)}`,
      badge: statusBadge(p.typeofChange),
    })),
    ...((dto.externalWorkExperiences ?? []) as any[]).map((e) => ({
      title: `${e.role ?? "—"} at ${e.companyName ?? "—"}`,
      sub: `${formatDateRange(e.startDate, e.endDate)}${e.duration ? ` · ${e.duration}` : ""}`,
    })),
  ];
  return entries(items);
}

// ---- Qualifications & skills ----

function mapQualifications(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((q) => ({
    title: q.qualificationName ?? "—",
    sub: formatDateRange(q.startDate, q.endDate),
    badge: q.isHighestQualification ? { status: "approved" as BadgeStatus, text: "Highest" } : undefined,
  })));
}

function mapCertifications(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((c) => ({
    title: c.name ?? "—",
    sub: `${c.issuingAuthority ?? "—"} · Issued ${formatDate(c.issueDate) ?? "—"}${c.expirationDate ? ` · Expires ${formatDate(c.expirationDate)}` : ""}`,
    badge: statusBadge(c.status),
  })));
}

function mapLanguages(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((l) => ({
    title: l.language ?? "—",
    sub: [l.level, l.remarks].filter(Boolean).join(" · "),
  })));
}

function mapSkills(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((s) => ({
    title: s.skillName ?? "—",
    sub: [s.yearsOfExperience != null ? `${s.yearsOfExperience} yrs` : null, s.applicationContext].filter(Boolean).join(" · "),
  })));
}

function mapWorkVisa(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((v) => ({
    title: `${v.visaType ?? "—"}${v.visaNumber ? ` (${v.visaNumber})` : ""}`,
    sub: `${v.issuingCountry ?? "—"} · ${formatDateRange(v.issuingDate, v.expireDate)}`,
    badge: { status: v.workAuthorizationStatus ? "approved" : "pending", text: v.workAuthorizationStatus ? "Authorized" : "Pending" },
  })));
}

// ---- Compliance & records ----

function mapBackgroundChecks(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((b) => ({
    title: b.type ?? "—",
    sub: `${b.checkProvider ?? "—"} · ${formatDate(b.completionDate) ?? "—"}`,
    badge: statusBadge(b.status),
  })));
}

function mapAgreements(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((a) => ({
    title: a.type ?? "—",
    sub: formatDateRange(a.agreementDate, a.expireDate),
    badge: statusBadge(a.status),
  })));
}

function mapDisciplinary(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((d) => ({
    title: d.incident ?? "—",
    sub: `${d.typeofViolation ?? "—"} · ${formatDate(d.incidentDate) ?? "—"}`,
    badge: statusBadge(d.investigationStatus),
  })));
}

function mapPolicyAcknowledgements(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((p) => ({
    title: p.policyName ?? "—",
    sub: `${p.versionNumber ?? "—"} · Acknowledged ${formatDate(p.acknowledgementDate) ?? "—"}`,
    badge: statusBadge(p.acknowledgementStatus),
  })));
}

function mapDataPrivacy(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((p) => ({
    title: p.dataPrivacyAct ?? "—",
    sub: p.dataSharingPreference ?? "—",
    badge: statusBadge(p.status),
  })));
}

// ---- Engagement ----

function mapEngagements(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((e) => ({
    title: e.programName ?? "—",
    sub: `${e.causeSupported ?? "—"} · ${formatDate(e.dateOfParticipation) ?? "—"}${e.numberOfVolunteerHours != null ? ` · ${e.numberOfVolunteerHours}h` : ""}`,
  })));
}

function mapHobbiesAndClubs(dto: any): SectionPayload {
  const items: EntryItem[] = [
    ...((dto?.hobbyInterests ?? []) as any[]).map((h) => ({
      title: h.hobbyOrInterest ?? "—",
      sub: [h.hobbyCategory, h.participationLevel].filter(Boolean).join(" · "),
    })),
    ...((dto?.clubs ?? []) as any[]).map((c) => ({ title: c.clubName ?? "—" })),
  ];
  return entries(items);
}

function mapGroups(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((g) => ({
    title: g.groupActivityName ?? "—",
    sub: [g.roleInAtivity, g.participationLevel].filter(Boolean).join(" · "),
  })));
}

function mapRecognition(dto: any[]): SectionPayload {
  return entries((dto ?? []).map((r) => ({
    title: r.awardName ?? "—",
    sub: `${r.awardType ?? "—"} · ${formatDate(r.awardDate) ?? "—"}${r.recognitionLevel ? ` · ${r.recognitionLevel}` : ""}`,
  })));
}

// ---- Documents ----

function mapDocuments(dto: any): SectionPayload {
  const docs: any[] = dto?.documents ?? [];
  if (docs.length === 0) return { type: "empty" };
  const items: DocumentItem[] = docs.map((d) => ({
    type: d.documentType ?? "Document",
    name: d.documentName ?? "Untitled",
    uploadedAt: "",
    sizeLabel: "",
  }));
  return { type: "documents", documents: items };
}

// ---- Health & exit ----

function mapHealthRecords(dto: any): SectionPayload {
  return fields([
    { label: "Blood Group", value: dto.bloodGroup ?? null },
    { label: "Special Medical Condition", value: dto.specialMedicalCondition ?? null },
  ]);
}

function mapExitInformation(dto: any): SectionPayload {
  return fields([
    { label: "Resignation/Termination Date", value: formatDate(dto.resignationTerminationDate) },
    { label: "Reason for Exit", value: dto.reasonForExit ?? null },
    { label: "Rehire Eligibility", value: dto.rehireEligibility ?? null },
    { label: "Final Settlement Details", value: dto.finalSettlementDetails ?? null },
    { label: "Exit Interview Notes", value: dto.exitInterviewNotes ?? null },
    { label: "Remarks", value: dto.remarks ?? null },
  ]);
}

function mapGlobalConsiderations(dto: any): SectionPayload {
  return fields([
    { label: "Working Hours Preference", value: dto.workingHoursPreference ?? null },
    { label: "Preferred Holidays", value: dto.preferredHolidays ?? null },
    { label: "Labor Laws", value: dto.laborLaws ?? null },
    { label: "Mandatory Benefits", value: dto.mandatoryBenefits ?? null },
    { label: "Primary Currency", value: dto.primaryCurrency ?? null },
    { label: "Tax Residency", value: dto.taxResidency ?? null },
    { label: "Cross-Border Tax Details", value: dto.crossBorderTaxDetails ?? null },
    { label: "Remarks", value: dto.remarks ?? null },
  ]);
}

const MAPPERS: Partial<Record<string, (dto: any) => SectionPayload>> = {
  basic: mapBasicInfo,
  carddetails: mapCardDetails,
  contact: mapContactInfo,
  employment: mapEmploymentDetails,
  attendance: mapAttendanceDetails,
  compensation: mapCompensation,
  workhistory: mapWorkHistory,
  qualifications: mapQualifications,
  certifications: mapCertifications,
  languages: mapLanguages,
  skills: mapSkills,
  visa: mapWorkVisa,
  bgcheck: mapBackgroundChecks,
  agreements: mapAgreements,
  disciplinary: mapDisciplinary,
  policy: mapPolicyAcknowledgements,
  privacy: mapDataPrivacy,
  engagements: mapEngagements,
  hobbies: mapHobbiesAndClubs,
  groups: mapGroups,
  recognition: mapRecognition,
  documents: mapDocuments,
  health: mapHealthRecords,
  exit: mapExitInformation,
  global: mapGlobalConsiderations,
};

export function mapSectionPayload(sectionId: string, raw: unknown): SectionPayload {
  const mapper = MAPPERS[sectionId];
  return mapper ? mapper(raw) : (raw as SectionPayload);
}

export { mapEmploymentDetails };
