export default function ForecastLoading() {
  return (
    <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section
          className="astro-card"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="eyebrow">Daily Forecast</p>
          <h1 className="serif mt-2 text-3xl text-[#176b4a]">
            දෛනික පුරෝකථනය සකස් කරමින්…
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#566c5e]">
            කේන්දරය, වත්මන් දශා සහ අදාල ගෝචර කාල ලක්ෂ්‍ය එකට ගැලපෙමින් පවතී.
          </p>
        </section>
      </div>
    </main>
  );
}
