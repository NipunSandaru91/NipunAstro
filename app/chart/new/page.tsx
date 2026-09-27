import Link from "next/link";
import { createCalculation } from "@/app/calculations/actions";
import LocationSelector from "@/app/components/location-selector";
import CalculationSubmit from "@/app/components/calculation-submit";
import AppNav from "@/app/components/app-nav";

export default function NewChartPage(){
  return (
    <>
      <AppNav />
      <main className="ap-app-shell">
        <div className="ap-form-page">
          <header className="ap-page-title">
            <Link href="/dashboard" aria-label="ආපසු">←</Link>
            <div><h1>ජන්ම විස්තර</h1><span>✦</span></div>
          </header>

          <section className="ap-stepper" aria-label="Chart creation steps">
            <div className="active"><b>1</b><span>විස්තර</span></div>
            <i />
            <div><b>2</b><span>කාලය/ස්ථානය</span></div>
            <i />
            <div><b>3</b><span>තහවුරු</span></div>
          </section>

          <form action={createCalculation} className="ap-form-card">
            <Field label="උපන් දිනය" name="birth_date" type="date"/>
            <Field label="උපන් වේලාව" name="birth_time" type="time"/>
            <LocationSelector />
            <CalculationSubmit />
          </form>

          <p className="ap-form-footnote">Lahiri Sidereal · Whole Sign · සත්‍යාපිත ගණනය</p>
        </div>
      </main>
    </>
  );
}

function Field({label,name,type}:{label:string;name:string;type:"date"|"time"}){
  return (
    <label className="ap-field">
      <span>{label}</span>
      <input required name={name} type={type}/>
    </label>
  );
}
