import Badge from "./Badge";
import { formatTime } from "../lib/utils";

const sourceVariant = {
  social: "accent",
  news: "warning",
  official: "success",
};

export default function FeedCard({ item }) {
  return (
    <div className="card-soft flex flex-col gap-2 p-3 transition-all duration-200 hover:border-slate-700 hover:shadow-xl">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <Badge label={item.source} variant={sourceVariant[item.source] || "neutral"} />
        <span className="font-mono text-[11px] text-slate-500">{formatTime(item.timestamp)}</span>
      </div>
      <p className="line-clamp-2 text-sm text-slate-200">{item.text}</p>
    </div>
  );
}
