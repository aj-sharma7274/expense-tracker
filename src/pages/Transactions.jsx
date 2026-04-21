import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { deleteTransaction } from "../utils/github";
import MonthPicker from "../components/MonthPicker";
import Loader from "../components/Loader";
import { Trash2, Search } from "lucide-react";
import dayjs from "dayjs";

const INR = (v) => "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const CATEGORIES = [
  "All","Saving & Investment","Housing Expense","Term Insurance","Health Insurance",
  "Transportation","Groceries","Food/Dining Out","Clothing & Accessories",
  "Personal care (Grooming)","Subscription/Recharge","Miscellaneous","Wants/Dreams","Credit Card Bill",
];

export default function Transactions() {
  const { loading, error, monthlyTransactions, transactions, setTransactions } = useApp();
  const [search, setSearch]     = useState("");
  const [catFilter, setCat]     = useState("All");
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() =>
    monthlyTransactions.filter((t) => {
      const matchCat = catFilter === "All" || t.category === catFilter;
      const q = search.toLowerCase();
      const matchQ = !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    }), [monthlyTransactions, search, catFilter]);

  const total = filtered.reduce((s, t) => s + Number(t.amount), 0);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeleting(id);
    try {
      const updated = await deleteTransaction(id);
      setTransactions(updated);
    } catch (e) {
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loader text="Loading transactions..." />;
  if (error)   return <div className="text-red-400 p-6">Error: {error}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} records · {INR(total)} total</p>
        </div>
        <MonthPicker />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input placeholder="Search transactions…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <select value={catFilter} onChange={(e) => setCat(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-700 bg-slate-700/40">
          {["Date","Description","Category","Amount",""].map((h, i) => (
            <div key={i} className={`text-slate-400 text-xs font-semibold uppercase tracking-wider
              ${i===0?"col-span-2":i===1?"col-span-4":i===2?"col-span-3":i===3?"col-span-2 text-right":"col-span-1"}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0
          ? <div className="text-center py-16 text-slate-500">No transactions found</div>
          : filtered.map((t, idx) => (
            <div key={t.id}
              className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors
                ${idx % 2 === 0 ? "" : "bg-slate-700/10"}`}>
              <div className="col-span-2 text-slate-400 text-sm">{dayjs(t.date).format("DD MMM YY")}</div>
              <div className="col-span-4 text-white text-sm font-medium truncate">{t.description}</div>
              <div className="col-span-3">
                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-lg font-medium">
                  {t.category}
                </span>
              </div>
              <div className="col-span-2 text-right text-red-400 font-semibold text-sm">{INR(t.amount)}</div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1 disabled:opacity-40">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-sm">
            <span className="text-slate-400">Month Total: </span>
            <span className="text-white font-bold">{INR(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
