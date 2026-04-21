import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useApp } from "../context/AppContext";

export default function MonthPicker() {
  const { selectedMonth, setSelectedMonth } = useApp();
  const d = dayjs(selectedMonth + "-01");

  const prev = () => setSelectedMonth(d.subtract(1, "month").format("YYYY-MM"));
  const next = () => {
    const n = d.add(1, "month");
    if (n.isAfter(dayjs(), "month")) return;
    setSelectedMonth(n.format("YYYY-MM"));
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
      <button onClick={prev} className="text-slate-400 hover:text-white transition-colors p-1">
        <ChevronLeft size={16} />
      </button>
      <span className="text-white text-sm font-semibold w-32 text-center">
        {d.format("MMMM YYYY")}
      </span>
      <button onClick={next} className="text-slate-400 hover:text-white transition-colors p-1">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
