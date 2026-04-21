import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchTransactions, fetchBudget, defaultBudget } from "../utils/github";
import dayjs from "dayjs";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget]             = useState(defaultBudget());
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txs, bud] = await Promise.all([fetchTransactions(), fetchBudget()]);
      setTransactions(txs);
      setBudget(bud);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ── derived: transactions for selected month ──────────────────
  const monthlyTransactions = transactions.filter((t) =>
    dayjs(t.date).format("YYYY-MM") === selectedMonth
  );

  // ── derived: budget rows with actuals ────────────────────────
  const budgetWithActuals = budget.map((row) => {
    const spent = monthlyTransactions
      .filter((t) => t.category === row.category)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { ...row, spent, remaining: row.budget - spent };
  });

  const totalBudget  = budget.reduce((s, r) => s + r.budget, 0);
  const totalSpent   = monthlyTransactions.reduce((s, t) => s + Number(t.amount), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <AppContext.Provider value={{
      transactions, setTransactions,
      budget, setBudget,
      loading, error, reload,
      selectedMonth, setSelectedMonth,
      monthlyTransactions,
      budgetWithActuals,
      totalBudget, totalSpent, totalRemaining,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
