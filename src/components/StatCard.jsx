import React from "react";

export default function StatCard({ label, value, sub, icon: Icon, color = "accent", trend }) {
  const colors = {
    accent: "bg-accent/10 text-accent",
    green:  "bg-emerald-500/10 text-emerald-400",
    red:    "bg-red-500/10 text-red-400",
    amber:  "bg-amber-500/10 text-amber-400",
  };
  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
      {trend !== undefined && (
        <div className={`text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}
