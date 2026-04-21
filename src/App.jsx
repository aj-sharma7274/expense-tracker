import React, { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import PinLock from "./pages/PinLock";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Settings from "./pages/Settings";
import "./index.css";

function Layout({ onLock }) {
  return (
    <div className="flex min-h-screen bg-navy-900">
      <Sidebar onLock={onLock} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/add"          element={<AddExpense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget"       element={<Budget />} />
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />;

  return (
    <AppProvider>
      <HashRouter>
        <Layout onLock={() => setUnlocked(false)} />
      </HashRouter>
    </AppProvider>
  );
}
