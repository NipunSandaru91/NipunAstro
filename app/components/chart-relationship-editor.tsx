import { updateChartSubjectRelationship } from "@/app/calculations/actions";
import {
  SUBJECT_RELATIONSHIPS,
  parseSubjectRelationship,
} from "@/lib/calculations/subject-relationship";

type Props = {
  calculationId: string;
  currentRelationship: string | null;
  saved?: boolean;
  error?: string;
};

export default function ChartRelationshipEditor({
  calculationId,
  currentRelationship,
  saved,
  error,
}: Props) {
  const selected = parseSubjectRelationship(currentRelationship) ?? "";

  return (
    <div className="mt-3 max-w-sm">
      <form action={updateChartSubjectRelationship} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="calculation_id" value={calculationId} />
        <label className="grid flex-1 gap-1 text-xs text-[#566c5e]">
          කේන්දරයට ඇති සම්බන්ධය
          <select
            key={selected || "unset"}
            name="subject_relationship"
            defaultValue={selected}
            required
            className="rounded-lg border border-[#d7e5da] bg-white px-3 py-2 text-sm text-[#18372a]"
          >
            <option value="" disabled>සම්බන්ධය තෝරන්න</option>
            {SUBJECT_RELATIONSHIPS.map((relationship) => (
              <option key={relationship.value} value={relationship.value}>
                {relationship.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg border border-[#b9d8c3] bg-[#176b4a] px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          සුරකින්න
        </button>
      </form>
      {saved ? <p className="mt-2 text-xs text-[#176b4a]">සම්බන්ධය යාවත්කාලීන කර ඇත.</p> : null}
      {error ? <p className="mt-2 text-xs text-[#8b3c35]">සම්බන්ධය සුරැකීමට නොහැකි විය. නැවත උත්සාහ කරන්න.</p> : null}
    </div>
  );
}
