import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import ChartNameEditor from "@/app/components/chart-name-editor";
import DeleteChartButton from "@/app/components/delete-chart-button";
import PersonalPredictionTabs, { type PersonalTopic } from "@/app/components/personal-prediction-tabs";

type Props = {
  calculationId: string;
  subjectName: string | null;
  relationshipLabel: string | null;
  topics: PersonalTopic[];
  timezone: string;
  saved?: string;
};

export default function PersonalChartView(props: Props) {
  return <><AppNav active="chart" /><main className="astro-shell min-h-screen px-4 py-6 pb-28 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl">
    <header className="personal-chart-hero"><div><p className="eyebrow">Personal · N Astro</p><h1 className="serif mt-2 text-4xl text-[#176b4a]">{props.subjectName || "උපන් කේන්දරය"}</h1><ChartNameEditor calculationId={props.calculationId} initialName={props.subjectName ?? ""} />{props.relationshipLabel ? <p className="mt-2 text-sm text-[#566c5e]">සම්බන්ධය: {props.relationshipLabel}</p> : null}{props.saved ? <p className="mt-2 text-xs text-[#176b4a]">නම යාවත්කාලීන කර ඇත.</p> : null}</div><span className="personal-mode-chip">PERSONAL READING</span></header>
    <PersonalPredictionTabs topics={props.topics} timezone={props.timezone} />
    <section className="mt-7 flex flex-wrap gap-3"><Link href="/my-chart" className="cosmic-secondary">මගේ කේන්දර</Link><Link href="/chart/new" className="cosmic-primary">නව කේන්දරයක්</Link><DeleteChartButton calculationId={props.calculationId} label="කේන්දරය මකන්න" /></section>
  </div></main></>;
}
