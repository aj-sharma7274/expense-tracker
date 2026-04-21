import React from "react";
import { useApp } from "../context/AppContext";
import StatCard from "../components/StatCard";
import MonthPicker from "../components/MonthPicker";
import Loader from "../components/Loader";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const INR = (v) => "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const COLORS = [
  "#2D6BE4","#22c55e","#f59e0b","#ef4444","#8b5cf6",
  "#06b6d4","#ec4899","#14b8a6","#f97316","#64748b","#a3e635","#e879f9","#fb923c",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{INR(p.value)}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { loading, error, monthlyTransactions, budgetWithActuals,
          totalBudget, totalSpent, totalRemaining, transactions } = useApp();

  if (loading) return <Loader text="Fetching your data..." />;
  if (error)   return <div className="text-red-400 p-6">Error: {error}</div>;

  // Pie chart data — top categories this month
  const pieData = budgetWithActuals
    .filter((r) => r.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8)
    .map((r) => ({ name: r.category, value: r.spent }));

  // Bar chart — last 6 months spending
  const barData = Array.from({ length: 6 }, (_, i) => {
    const m = dayjs().subtract(5 - i, "month");
    const key = m.format("YYYY-MM");
    const spent = transactions
      .filter((t) => dayjs(t.date).format("YYYY-MM") === key)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { month: m.format("MMM"), spent };
  });

  // Recent 5 transactions
  const recent = [...monthlyTransactions].slice(0, 5);

  const savingsRate = totalBudget > 0
    ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your financial overview</p>
        </div>
        <MonthPicker />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Budget"    value={INR(totalBudget)}    icon={Wallet}      color="accent" />
        <StatCard label="Spent This Month" value={INR(totalSpent)}    icon={TrendingDown} color="red" />
        <StatCard label="Remaining"       value={INR(totalRemaining)} icon={PiggyBank}   color="green" />
        <StatCard label="Savings Rate"    value={savingsRate + "%"}   icon={TrendingUp}  color="amber"
          sub={totalSpent === 0 ? "No expenses yet" : `${monthlyTransactions.length} transactions`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar — 6 months */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Monthly Spending (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => "₹" + (v >= 1000 ? (v/1000).toFixed(0) + "k" : v)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="spent" fill="#2D6BE4" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — category breakdown */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Spending by Category</h2>
          {pieData.length === 0
            ? <div className="flex items-center justify-center h-52 text-slate-500 text-sm">No expenses this month</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="40%" cy="50%" outerRadius={80} innerRadius={48}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => INR(v)} contentStyle={{
                    background:"#1e293b", border:"1px solid #334155", borderRadius:12, fontSize:12
                  }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Budget progress bars */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">Budget Progress — This Month</h2>
        <div className="space-y-3">
          {budgetWithActuals.filter(r => r.budget > 0).map((row) => {
            const pct = Math.min((row.spent / row.budget) * 100, 100);
            const over = row.spent > row.budget;
            return (
              <div key={row.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">{row.category}</span>
                  <span className={over ? "text-red-400 font-semibold" : "text-slate-400"}>
                    {INR(row.spent)} / {INR(row.budget)}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-accent"}`}
                    style={{ width: pct + "%" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">Recent Transactions</h2>
        {recent.length === 0
          ? <p className="text-slate-500 text-sm text-center py-6">No transactions this month</p>
          : (
            <div className="divide-y divide-slate-700">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{t.description}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.category} · {dayjs(t.date).format("DD MMM YYYY")}</p>
                  </div>
                  <p className="text-red-400 font-semibold">-{INR(t.amount)}</p>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
