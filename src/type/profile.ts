/** Ported (read-only subset) from PeopleHub-ESS/src/type/profile.ts — mobile M1 is read-only
 * per ESS-Mobile-App-Plan.md §6, so the edit-mode/draft types aren't ported yet. */
export type SectionId =
  | "basic" | "contact" | "employment" | "compensation" | "workhistory"
  | "qualifications" | "certifications" | "languages" | "skills" | "visa"
  | "bgcheck" | "agreements" | "disciplinary" | "policy" | "privacy"
  | "engagements" | "hobbies" | "groups" | "recognition" | "documents"
  | "health" | "exit" | "global";

export type BadgeStatus = "pending" | "approved" | "rejected" | "draft" | "info";

export interface FieldItem {
  label: string;
  value: string | null;
  badge?: { status: BadgeStatus; text: string };
}

export interface EntryItem {
  title: string;
  sub?: string;
  badge?: { status: BadgeStatus; text: string };
}

export interface DocumentItem {
  type: string;
  name: string;
  uploadedAt: string;
  sizeLabel: string;
}

export type SectionPayload =
  | { type: "fields"; fields: FieldItem[] }
  | { type: "reveal"; fields: FieldItem[]; revealField: string }
  | { type: "entries"; entries: EntryItem[] }
  | { type: "tags"; tags: string[] }
  | { type: "documents"; documents: DocumentItem[] }
  | { type: "empty"; emptyText?: string };

export interface SectionMeta {
  id: SectionId;
  label: string;
  route: string;
  groupTitle: string;
}
