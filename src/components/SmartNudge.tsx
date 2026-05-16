"use client";

import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";

interface SmartNudgeProps {
  message: string;
  type?: "info" | "alert";
  delay?: number;
}

export function SmartNudge({ message, type = "info", delay = 0 }: SmartNudgeProps) {
  const isAlert = type === "alert";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-2xl p-4 flex items-start gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${
        isAlert ? "border-[var(--color-brand-accent)]/30" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div
        className={`shrink-0 p-2 rounded-xl mt-1 shadow-sm ${
          isAlert
            ? "bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]"
            : "bg-[var(--color-brand-sky-light)]/50 text-[var(--color-brand-sky)]"
        }`}
      >
        {isAlert ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800 mb-1">
          {isAlert ? "Attention Needed" : "AI Insight"}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
