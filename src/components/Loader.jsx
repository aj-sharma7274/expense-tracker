import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-slate-600 border-t-accent animate-spin" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}
