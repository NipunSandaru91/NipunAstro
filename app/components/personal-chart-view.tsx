import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import ChartNameEditor from "@/app/components/chart-name-editor";
import ChartRelationshipEditor from "@/app/components/chart-relationship-editor";
import DeleteChartButton from "@/app/components/delete-chart-button";
import PersonalPredictionTabs, { type PersonalTopic } from "@/app/components/personal-prediction-tabs";
import D1Chart from "@/app/components/d1-chart";
import PersonalNatureCard from "@/app/components/personal-nature-card";
import type { PersonalNatureReading } from "@/lib/prediction/ui/personal-nature-reading.ts";

type Props = {
  calculationId: string;
  lagnaRasiId: number;
  grahas: Array<Record<string, unknown>>;
  rashiNames: string[];
  grahaNames: Record<string, string>;
  natureReading: PersonalNatureReading;
  subjectName: string | null;
  currentRelationship: string | null;
  relationshipSaved?: boolean;
  relationshipError?: string;
  topics: PersonalTopic[];
  timezone: string;
  saved?: string;
};

export default function PersonalChartView(props: Props) {
  return <><AppNav active="chart" /><main className="na-personal-page astro-shell min-h-screen px-4 py-6 pb-28 sm:px-6 sm:py-8"><div className="mx-auto max-w-3xl">
    <header className="personal-chart-hero"><div><p className="eyebrow">Personal · N Astro</p><h1 className="serif mt-2 text-4xl text-[#176b4a]">{props.subjectName || "උපන් කේන්දරය"}</h1><p className="mt-2 text-sm text-[#5d7165]">{props.natureReading.lagnaLabel}</p><details className="mt-3" open={Boolean(props.relationshipError || props.relationshipSaved || props.saved)}><summary className="cursor-pointer py-3 text-sm text-[#175c43]">කේන්දර විස්තර සංස්කරණය</summary><ChartNameEditor calculationId={props.calculationId} initialName={props.subjectName ?? ""} /><ChartRelationshipEditor calculationId={props.calculationId} currentRelationship={props.currentRelationship} saved={props.relationshipSaved} error={props.relationshipError} /></details>{props.saved ? <p className="mt-2 text-xs text-[#176b4a]">නම යාවත්කාලීන කර ඇත.</p> : null}</div><span className="personal-mode-chip">PERSONAL READING</span></header>
    <section className="astro-card mt-6 p-4 sm:p-6"><div className="mb-4"><p className="eyebrow">D1 · Rāśi Chart</p><h2 className="serif mt-1 text-2xl text-[#18372a]">උපන් කේන්දරය</h2><p className="mt-1 text-xs text-[#566c5e]">Lahiri Sidereal · Whole Sign</p></div><D1Chart compact lagnaRasiId={props.lagnaRasiId} grahas={props.grahas} rashiNames={props.rashiNames} grahaNames={props.grahaNames} /></section>
    <PersonalPredictionTabs topics={props.topics} timezone={props.timezone} nature={<PersonalNatureCard reading={props.natureReading} />} />
    <section className="mt-7 flex flex-wrap gap-3"><Link href="/my-chart" className="cosmic-secondary">මගේ කේන්දර</Link><Link href="/chart/new" className="cosmic-primary">නව කේන්දරයක්</Link><DeleteChartButton calculationId={props.calculationId} label="කේන්දරය මකන්න" /></section>
  </div></main></>;
}
