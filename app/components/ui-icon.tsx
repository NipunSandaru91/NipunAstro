import type { SVGProps } from "react";

export type IconName = "home" | "chart" | "settings" | "sun" | "career" | "money" | "heart" | "timeline" | "clock" | "arrow" | "plus" | "menu";
const paths: Record<IconName, string> = {
  home: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  chart: "M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z",
  settings: "m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2",
  career: "M8 6V3h8v3M3 6h18v15H3ZM3 11l9 3 9-3M12 12v4",
  money: "M3 6c0-5 18-5 18 0s-18 5-18 0v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0",
  heart: "M12 21 3 12C-3 3 9-1 12 6c3-7 15-3 9 6Z",
  timeline: "M3 12h5c6 0 3-8 10-8M8 12c6 0 3 8 10 8M21 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M21 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v7l4 3",
  arrow: "m9 5 7 7-7 7", plus: "M12 4v16M4 12h16", menu: "M3 5h18M3 12h18M3 19h18",
};
export default function UiIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
