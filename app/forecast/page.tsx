import PredictionsPage from "@/app/predictions/page";

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return PredictionsPage({
    searchParams: Promise.resolve({
      ...params,
      view: "forecast",
    }),
  });
}
