import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { fetchTransactions, saveTransactions } from "../utils/github";
import { Download, Upload, RefreshCw, Loader2, Shield } from "lucide-react";

export default function Settings() {
  const { reload, transactions } = useApp();
  const [syncing, setSyncing]   = useState(false);
  const [msg, setMsg]           = useState("");

  const syncNow = async () => {
    setSyncing(true);
    try { await reload(); setMsg("✅ Synced successfully!"); }
    catch (e) { setMsg("❌ Sync failed: " + e.message); }
    finally { setSyncing(false); setTimeout(() => setMsg(""), 3000); }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transactions-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        await saveTransactions(data);
        await reload();
        setMsg(`✅ Imported ${data.length} transactions!`);
      } catch (err) {
        setMsg("❌ Import failed: " + err.message);
      }
      setTimeout(() => setMsg(""), 4000);
    };
    reader.readAsText(file);
  };

  const owner = process.env.REACT_APP_GITHUB_OWNER || "—";
  const repo  = process.env.REACT_APP_GITHUB_REPO  || "—";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your data and configuration</p>
      </div>

      {/* Connection info */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-accent" />
          <h2 className="text-white font-semibold">Data Storage</h2>
        </div>
        <div className="space-y-3 text-sm">
          {[["GitHub Owner", owner],["Private Repo", repo],["Data Path","data/transactions.json"]].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded text-xs">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs">
          🔒 Your data is stored in your private GitHub repository. It is never shared with anyone.
        </div>
      </div>

      {/* Actions */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-3">
        <h2 className="text-white font-semibold mb-4">Actions</h2>

        <button onClick={syncNow} disabled={syncing}
          className="w-full flex items-center gap-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all">
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Sync Data from GitHub
        </button>

        <button onClick={exportJSON}
          className="w-full flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all">
          <Download size={16} />
          Export Transactions as JSON
        </button>

        <label className="w-full flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer">
          <Upload size={16} />
          Import Transactions from JSON
          <input type="file" accept=".json" className="hidden" onChange={importJSON} />
        </label>

        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm ${msg.startsWith("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">Stats</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-700/50">
            <span className="text-slate-400">Total Transactions</span>
            <span className="text-white font-semibold">{transactions.length}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">App Version</span>
            <span className="text-white font-mono text-xs">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
