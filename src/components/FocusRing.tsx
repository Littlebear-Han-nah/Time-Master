"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface FocusRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function FocusRing({ progress, size = 160, strokeWidth = 14 }: FocusRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Ring */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          className="text-[var(--color-bg-light)]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <motion.circle
          className="text-[var(--color-brand-mint)] drop-shadow-md"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Inner Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {progress >= 100 ? (
            <CheckCircle2 className="w-10 h-10 text-[var(--color-brand-mint)] mb-1" />
          ) : (
            <>
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
                {progress}%
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Goal Met
              </span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
