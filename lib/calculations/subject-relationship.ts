export const SUBJECT_RELATIONSHIPS = [
  { value: "SELF", label: "මගේ" },
  { value: "PARTNER", label: "සහකරු/සහකාරිය" },
  { value: "MOTHER", label: "මව" },
  { value: "FATHER", label: "පියා" },
  { value: "SIBLING", label: "සහෝදර/සහෝදරියන්" },
  { value: "OTHER", label: "වෙනත්" },
] as const;

export type SubjectRelationship = typeof SUBJECT_RELATIONSHIPS[number]["value"];

export function parseSubjectRelationship(value: unknown): SubjectRelationship | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return SUBJECT_RELATIONSHIPS.find((item) => item.value === normalized)?.value ?? null;
}

export function subjectRelationshipLabel(value: unknown) {
  const relationship = parseSubjectRelationship(value);
  return SUBJECT_RELATIONSHIPS.find((item) => item.value === relationship)?.label ?? null;
}
