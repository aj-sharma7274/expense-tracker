import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, List, PieChart, Settings, LogOut, Wallet } from "lucide-react";

const links = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/add",       icon: PlusCircle,      label: "Add Expense"  },
  { to: "/transactions", icon: List,         label: "Transactions" },
  { to: "/budget",    icon: PieChart,        label: "Budget"       },
  { to: "/settings",  icon: Settings,        label: "Settings"     },
];

export default function Sidebar({ onLock }) {
  return (
    <aside className="w-60 min-h-screen bg-navy-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Expense</p>
          <p className="text-slate-400 text-xs">Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive
                 ? "bg-accent text-white shadow-lg shadow-accent/20"
                 : "text-slate-400 hover:bg-slate-700/60 hover:text-white"}`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Lock */}
      <div className="px-3 pb-6">
        <button onClick={onLock}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={18} />
          Lock App
        </button>
      </div>
    </aside>
  );
}
