import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { saveBudget } from "../utils/github";
import MonthPicker from "../components/MonthPicker";
import Loader from "../components/Loader";
import { Edit3, Save, X, Loader2 } from "lucide-react";

const INR = (v) => "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function Budget() {
  const { loading, error, budget, setBudget, budgetWithActuals, totalBudget, totalSpent, totalRemaining } = useApp();
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving]   = useState(false);

  const startEdit = (cat, current) => { setEditing(cat); setEditVal(String(current)); };
  const cancelEdit = () => { setEditing(null); setEditVal(""); };

  const saveEdit = async () => {
    const val = Number(editVal);
    if (isNaN(val) || val < 0) return;
    const updated = budget.map((r) => r.category === editing ? { ...r, budget: val } : r);
    setSaving(true);
    try {
      await saveBudget(updated);
      setBudget(updated);
      setEditing(null);
    } catch (e) {
      alert("Failed to save budget: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading budget..." />;
  if (error)   return <div className="text-red-400 p-6">Error: {error}</div>;

  const overCount = budgetWithActuals.filter(r => r.budget > 0 && r.spent > r.budget).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Budget</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Click ✏️ to edit any budget · Auto-refreshes each month
          </p>
        </div>
        <MonthPicker />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Budget",   value: INR(totalBudget),    color: "text-white"       },
          { label: "Total Spent",    value: INR(totalSpent),     color: "text-red-400"     },
          { label: "Remaining",      value: INR(totalRemaining), color: totalRemaining >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {overCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          ⚠️ {overCount} {overCount === 1 ? "category has" : "categories have"} exceeded budget this month.
        </div>
      )}

      {/* Budget Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-700 bg-slate-700/40">
          {[["col-span-4","Category"],["col-span-2 text-right","Budget (₹)"],
            ["col-span-2 text-right","Spent (₹)"],["col-span-2 text-right","Remaining (₹)"],
            ["col-span-2","Progress"]].map(([cls, h]) => (
            <div key={h} className={`text-slate-400 text-xs font-semibold uppercase tracking-wider ${cls}`}>{h}</div>
          ))}
        </div>

        {budgetWithActuals.map((row, idx) => {
          const pct = row.budget > 0 ? Math.min((row.spent / row.budget) * 100, 100) : 0;
          const over = row.budget > 0 && row.spent > row.budget;
          const isEditing = editing === row.category;

          return (
            <div key={row.category}
              className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors
                ${idx % 2 === 0 ? "" : "bg-slate-700/10"}`}>
              <div className="col-span-4 text-white text-sm font-medium">{row.category}</div>

              {/* Budget cell — editable */}
              <div className="col-span-2 text-right">
                {isEditing ? (
                  <div className="flex items-center gap-1 justify-end">
                    <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                      className="w-24 bg-slate-700 border border-accent rounded-lg px-2 py-1 text-white text-sm text-right focus:outline-none"
                      autoFocus />
                    <button onClick={saveEdit} disabled={saving}
                      className="text-emerald-400 hover:text-emerald-300 p-0.5 disabled:opacity-40">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    </button>
                    <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-300 p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 justify-end group">
                    <span className="text-slate-300 text-sm">{INR(row.budget)}</span>
                    <button onClick={() => startEdit(row.category, row.budget)}
                      className="text-slate-600 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                      <Edit3 size={13} />
                    </button>
                  </div>
                )}
              </div>

              <div className={`col-span-2 text-right text-sm font-medium ${row.spent > 0 ? "text-red-400" : "text-slate-500"}`}>
                {INR(row.spent)}
              </div>

              <div className={`col-span-2 text-right text-sm font-semibold
                ${over ? "text-red-400" : row.remaining === row.budget ? "text-slate-500" : "text-emerald-400"}`}>
                {INR(row.remaining)}
              </div>

              <div className="col-span-2">
                {row.budget > 0 ? (
                  <div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-accent"}`}
                        style={{ width: pct + "%" }} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 text-right">{Math.round(pct)}%</p>
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs text-center">—</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center bg-slate-700/40 border-t border-slate-600">
          <div className="col-span-4 text-white font-bold text-sm">TOTAL</div>
          <div className="col-span-2 text-right text-white font-bold text-sm">{INR(totalBudget)}</div>
          <div className="col-span-2 text-right text-red-400 font-bold text-sm">{INR(totalSpent)}</div>
          <div className={`col-span-2 text-right font-bold text-sm ${totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {INR(totalRemaining)}
          </div>
          <div className="col-span-2">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${totalSpent > totalBudget ? "bg-red-500" : "bg-accent"}`}
                style={{ width: Math.min((totalSpent/totalBudget)*100, 100) + "%" }} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-xs text-center">
        💡 Hover any Budget cell and click ✏️ to edit · Changes are saved to your private repo
      </p>
    </div>
  );
}
