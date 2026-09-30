import {
  parseSubjectRelationship,
  SUBJECT_RELATIONSHIPS,
  subjectRelationshipLabel,
} from "../../lib/calculations/subject-relationship.ts";

Deno.test("chart relationship values cover the six approved choices", () => {
  const values = SUBJECT_RELATIONSHIPS.map((item) => item.value);
  if (values.join(",") !== "SELF,PARTNER,MOTHER,FATHER,SIBLING,OTHER") {
    throw new Error("chart relationship choices changed");
  }
  if (new Set(values).size !== 6) throw new Error("chart relationship values must be unique");
});

Deno.test("chart relationship parser rejects values outside the allowed set", () => {
  if (parseSubjectRelationship(" partner ") !== "PARTNER") {
    throw new Error("relationship parser did not normalize a valid value");
  }
  for (const value of [null, undefined, "", "CHILD", 12]) {
    if (parseSubjectRelationship(value) !== null) {
      throw new Error("invalid chart relationship was accepted");
    }
  }
  if (subjectRelationshipLabel("MOTHER") !== "මව") {
    throw new Error("relationship label is not available in Sinhala");
  }
});
