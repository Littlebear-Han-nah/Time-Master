"use client";

import { motion } from "framer-motion";
import { Clock, BookOpen, UserCircle, Coffee } from "lucide-react";

const scheduleData = [
  {
    id: 1,
    title: "SAT102 Entrepreneurial Skills",
    time: "09:00 AM - 10:30 AM",
    type: "lecture",
    icon: <BookOpen className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 2,
    title: "AI Deep Work: Essay Draft",
    time: "11:00 AM - 01:00 PM",
    type: "focus",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 3,
    title: "Lunch @ SIP Campus Canteen",
    time: "01:00 PM - 02:00 PM",
    type: "break",
    icon: <Coffee className="w-4 h-4" />,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: 4,
    title: "Tech Club Seminar @ SA Bldg",
    time: "03:00 PM - 04:00 PM",
    type: "meeting",
    icon: <UserCircle className="w-4 h-4" />,
    color: "bg-rose-100 text-rose-700",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function DynamicSchedule() {
  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-orange-950">Today's Flow</h3>
        <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
          AI Optimized
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar"
      >
        {scheduleData.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="group relative flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white/40 hover:bg-white/60 transition-colors shadow-sm"
          >
            {/* Timeline connector */}
            {index !== scheduleData.length - 1 && (
              <div className="absolute left-9 top-14 bottom-[-16px] w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors" />
            )}

            <div className={`p-2.5 rounded-xl shrink-0 z-10 ${item.color}`}>
              {item.icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="font-semibold text-orange-950 truncate">{item.title}</h4>
              <p className="text-sm text-orange-700/70 mt-0.5">{item.time}</p>
            </div>
            
            {item.type === "focus" && (
              <div className="absolute right-4 top-4 hidden md:block">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
