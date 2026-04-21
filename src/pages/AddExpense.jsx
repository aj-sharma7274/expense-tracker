import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { addTransaction } from "../utils/github";
import { CheckCircle, PlusCircle, Loader2 } from "lucide-react";
import dayjs from "dayjs";

const CATEGORIES = [
  "Saving & Investment","Housing Expense","Term Insurance","Health Insurance",
  "Transportation","Groceries","Food/Dining Out","Clothing & Accessories",
  "Personal care (Grooming)","Subscription/Recharge","Miscellaneous",
  "Wants/Dreams","Credit Card Bill",
];

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm";
const labelCls = "block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5";

export default function AddExpense() {
  const { setTransactions, reload } = useApp();
  const [form, setForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    description: "",
    category: "",
    amount: "",
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

  const submit = async () => {
    if (!form.date)        return setError("Please select a date.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.category)    return setError("Please select a category.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
                           return setError("Enter a valid amount.");

    setSaving(true);
    setError("");
    try {
      const updated = await addTransaction({
        date:        form.date,
        description: form.description.trim(),
        category:    form.category,
        amount:      Number(form.amount),
      });
      setTransactions(updated);
      setSuccess(true);
      setForm({ date: dayjs().format("YYYY-MM-DD"), description: "", category: "", amount: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Add Expense</h1>
        <p className="text-slate-400 text-sm mt-0.5">Record a new transaction</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5">

        {/* Date */}
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
            className={inputCls} />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <input type="text" placeholder="e.g. Groceries from DMart" value={form.description}
            onChange={(e) => set("description", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={inputCls} />
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)}
            className={inputCls + " cursor-pointer"}>
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className={labelCls}>Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
            <input type="number" placeholder="0.00" value={form.amount} min="0" step="0.01"
              onChange={(e) => set("amount", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={inputCls + " pl-8"} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} /> Expense saved successfully!
          </div>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={saving}
          className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
          {saving
            ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
            : <><PlusCircle size={18} /> Add Expense</>}
        </button>
      </div>

      {/* Quick tip */}
      <p className="text-slate-600 text-xs text-center">
        💡 Press Enter after filling amount to submit quickly
      </p>
    </div>
  );
}
