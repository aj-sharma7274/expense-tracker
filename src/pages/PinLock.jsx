import React, { useState } from "react";
import { Lock, Delete } from "lucide-react";

const CORRECT_PIN = process.env.REACT_APP_PIN || "1234";

export default function PinLock({ onUnlock }) {
  const [pin, setPin]     = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const press = (digit) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === CORRECT_PIN.length) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          onUnlock();
        } else {
          setShake(true);
          setError(true);
          setTimeout(() => { setPin(""); setShake(false); }, 600);
        }
      }, 100);
    }
  };

  const del = () => setPin((p) => p.slice(0, -1));

  const digits = [1,2,3,4,5,6,7,8,9,null,0,"del"];

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center">
      {/* Card */}
      <div className="bg-slate-800 rounded-3xl p-10 w-80 flex flex-col items-center gap-8 shadow-2xl border border-slate-700">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Lock className="text-accent" size={28} />
        </div>

        <div className="text-center">
          <h1 className="text-white text-2xl font-semibold">Expense Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-4 ${shake ? "animate-[shake_0.3s_ease-in-out]" : ""}`}>
          {Array.from({ length: CORRECT_PIN.length }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150
              ${i < pin.length
                ? error ? "bg-red-500 border-red-500" : "bg-accent border-accent"
                : "border-slate-500"}`}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-sm -mt-4">Incorrect PIN. Try again.</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {digits.map((d, i) => {
            if (d === null) return <div key={i} />;
            if (d === "del") return (
              <button key={i} onClick={del}
                className="h-14 rounded-2xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors">
                <Delete size={20} className="text-slate-300" />
              </button>
            );
            return (
              <button key={i} onClick={() => press(String(d))}
                className="h-14 rounded-2xl bg-slate-700 hover:bg-accent/80 active:scale-95 text-white text-xl font-medium transition-all">
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
