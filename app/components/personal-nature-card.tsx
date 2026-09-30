import type { PersonalNatureReading } from "@/lib/prediction/ui/personal-nature-reading.ts";

export default function PersonalNatureCard({ reading }: { reading: PersonalNatureReading }) {
  return <section className="astro-card mt-6 p-5 sm:p-7">
    <p className="eyebrow">ජන්ම ස්වභාවය · D1</p>
    <h2 className="serif mt-2 text-2xl text-[#18372a]">ඔබේ ස්වභාවයේ රේඛාව</h2>
    <p className="mt-1 text-xs font-semibold text-[#176b4a]">{reading.lagnaLabel}</p>
    <p className="mt-4 text-sm leading-8 text-[#40584a]">{reading.overview}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <article className="rounded-2xl bg-[#f6faf7] p-4">
        <h3 className="text-sm font-semibold text-[#176b4a]">ඔබව මෙහෙයවන රටාව</h3>
        <p className="mt-2 text-sm leading-7 text-[#40584a]">{reading.drivingPattern}</p>
      </article>
      <article className="rounded-2xl bg-[#f6faf7] p-4">
        <h3 className="text-sm font-semibold text-[#176b4a]">මනස ප්‍රතිචාර දක්වන ආකාරය</h3>
        <p className="mt-2 text-sm leading-7 text-[#40584a]">{reading.emotionalPattern}</p>
      </article>
    </div>
    <p className="mt-4 rounded-xl border border-[#d7e5da] bg-white p-4 text-xs leading-7 text-[#566c5e]">සමබරව තබාගන්න: {reading.balanceNote}</p>
    <p className="mt-3 text-[11px] leading-6 text-[#6a7c70]">ලග්නය, ලග්නාධිපති, එහි භාව පිහිටීම සහ චන්ද්‍ර රාශිය එකට සලකා සකස් කළ සාම්ප්‍රදායික ජ්‍යෝතිෂ කියවීමකි.</p>
  </section>;
}
