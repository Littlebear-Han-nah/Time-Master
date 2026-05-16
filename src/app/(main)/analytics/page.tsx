"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, BarChart3, BrainCircuit, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

// --- Dynamic Mock Data Dictionary ---
const MOCK_DATA = {
  Daily: {
    kpi: {
      tasks: 4,
      focus: 5.5,
      efficiency: 88,
      subTextTasks: "3 Academic, 1 Other",
    },
    barData: [
      { name: "Morning", estimated: 1.5, actual: 2.0 },
      { name: "Afternoon", estimated: 2.0, actual: 2.0 },
      { name: "Evening", estimated: 1.0, actual: 1.5 },
      { name: "Night", estimated: 0, actual: 0 },
    ],
    pieData: [
      { name: "Academic", value: 80, color: "#f97316" },
      { name: "Wellness", value: 10, color: "#10b981" },
      { name: "Social", value: 10, color: "#f43f5e" },
    ],
    taskLog: [
      { id: 11, title: "CPT102 Data Structures: Graph Traversals", category: "Academic", est: 1.5, actual: 2.0, status: "Overtime", color: "rose" },
      { id: 12, title: "Java Algorithm Practice: Dijkstra & BFS", category: "Academic", est: 2.0, actual: 2.0, status: "On track", color: "emerald" },
      { id: 13, title: "Quick Gym Session", category: "Wellness", est: 0.5, actual: 0.5, status: "On track", color: "emerald" },
      { id: 14, title: "Check Society Emails", category: "Social", est: 0.5, actual: 1.0, status: "Overtime", color: "rose" },
    ],
  },
  Weekly: {
    kpi: {
      tasks: 24,
      focus: 32,
      efficiency: 92,
      subTextTasks: "16 Academic, 8 Other",
    },
    barData: [
      { name: "Mon", estimated: 4, actual: 3.5 },
      { name: "Tue", estimated: 5, actual: 5.5 },
      { name: "Wed", estimated: 3, actual: 4 },
      { name: "Thu", estimated: 6, actual: 5 },
      { name: "Fri", estimated: 4, actual: 4.5 },
      { name: "Sat", estimated: 5, actual: 6.0 },
      { name: "Sun", estimated: 3, actual: 3.5 },
    ],
    pieData: [
      { name: "Academic", value: 65, color: "#f97316" },
      { name: "Wellness", value: 20, color: "#10b981" },
      { name: "Social", value: 15, color: "#f43f5e" },
    ],
    taskLog: [
      { id: 21, title: "Finish Lanqiao Cup Java Mock Exam", category: "Academic", est: 3.5, actual: 4.0, status: "Overtime", color: "rose" },
      { id: 22, title: "SAT102 Hackathon Presentation Prep", category: "Academic", est: 4.0, actual: 3.0, status: "Fast", color: "emerald" },
      { id: 23, title: "INT104 OOP Lab Report", category: "Academic", est: 2.0, actual: 2.5, status: "Overtime", color: "rose" },
      { id: 24, title: "Jog at SIP Campus Track", category: "Wellness", est: 1.0, actual: 1.0, status: "On track", color: "emerald" },
      { id: 25, title: "Tech Club Meet @ SA", category: "Social", est: 2.0, actual: 2.0, status: "On track", color: "emerald" },
    ],
  },
  Monthly: {
    kpi: {
      tasks: 95,
      focus: 128,
      efficiency: 90,
      subTextTasks: "65 Academic, 30 Other",
    },
    barData: [
      { name: "Week 1", estimated: 25, actual: 28 },
      { name: "Week 2", estimated: 30, actual: 29 },
      { name: "Week 3", estimated: 35, actual: 38 },
      { name: "Week 4", estimated: 30, actual: 33 },
    ],
    pieData: [
      { name: "Academic", value: 60, color: "#f97316" },
      { name: "Wellness", value: 25, color: "#10b981" },
      { name: "Social", value: 15, color: "#f43f5e" },
    ],
    taskLog: [
      { id: 31, title: "Complete Dynamic Programming Assignment", category: "Academic", est: 8.0, actual: 10.0, status: "Overtime", color: "rose" },
      { id: 32, title: "Tech Club E-commerce Project Backend", category: "Academic", est: 15.0, actual: 15.0, status: "On track", color: "emerald" },
      { id: 33, title: "Mid-term Revision for Advanced Calculus", category: "Academic", est: 12.0, actual: 10.0, status: "Fast", color: "emerald" },
      { id: 34, title: "Weekly Badminton Session", category: "Wellness", est: 6.0, actual: 6.0, status: "On track", color: "emerald" },
      { id: 35, title: "Campus Music Festival Rehearsal", category: "Social", est: 8.0, actual: 9.5, status: "Overtime", color: "rose" },
    ],
  }
};

type TabKey = keyof typeof MOCK_DATA;

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("Weekly");

  const currentData = MOCK_DATA[activeTab];

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col font-sans pb-24">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
              Your Time Analytics
            </h1>
            <p className="text-orange-900/60 font-medium text-sm mt-1">
              Review your time-blocking performance.
            </p>
          </div>
        </div>

        {/* Time Range Tabs */}
        <div className="bg-orange-100/50 p-1.5 rounded-full flex gap-1 shadow-inner border border-orange-200/50">
          {(["Daily", "Weekly", "Monthly"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-orange-600 shadow-sm border border-orange-200"
                  : "text-orange-900/60 hover:text-orange-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-3xl p-6 border border-emerald-200/50 shadow-sm relative overflow-hidden bg-white/60">
          <CheckCircle2 className="absolute top-4 right-4 w-12 h-12 text-emerald-100" />
          <div className="text-emerald-600 flex items-center gap-2 mb-2 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Tasks Completed
          </div>
          <div className="text-4xl font-extrabold text-emerald-950">{currentData.kpi.tasks}</div>
          <p className="text-emerald-700/60 text-xs font-semibold mt-2">{currentData.kpi.subTextTasks}</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-orange-200/50 shadow-sm relative overflow-hidden bg-white/60">
          <Clock className="absolute top-4 right-4 w-12 h-12 text-orange-100" />
          <div className="text-orange-600 flex items-center gap-2 mb-2 font-bold text-sm">
            <Clock className="w-4 h-4" /> Focus Hours
          </div>
          <div className="text-4xl font-extrabold text-orange-950">{currentData.kpi.focus}<span className="text-xl text-orange-800/50 ml-1">hrs</span></div>
          <p className="text-orange-700/60 text-xs font-semibold mt-2">Consistent with your goals</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-rose-200/50 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-rose-50">
          <BarChart3 className="absolute top-4 right-4 w-12 h-12 text-rose-100" />
          <div className="text-rose-600 flex items-center gap-2 mb-2 font-bold text-sm">
            <BarChart3 className="w-4 h-4" /> Efficiency Score
          </div>
          <div className="text-4xl font-extrabold text-rose-950">{currentData.kpi.efficiency}<span className="text-xl text-rose-800/50 ml-1">/100</span></div>
          <p className="text-rose-700/60 text-xs font-semibold mt-2">Top 10% of freshmen</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Estimated vs Actual Bar Chart */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm bg-white/80">
          <h3 className="text-lg font-bold text-orange-950 mb-6 flex items-center justify-between">
            Estimated vs. Actual Time (hrs)
            <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-1 rounded-md">{activeTab} View</span>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#c2410c', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#fdba74', fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="estimated" name="Estimated Time" fill="#fdba74" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1000} />
                <Bar dataKey="actual" name="Actual Time" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Allocation Donut Chart */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm bg-white/80">
          <h3 className="text-lg font-bold text-orange-950 mb-6 flex items-center justify-between">
            Time Allocation
            <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-1 rounded-md">{activeTab} View</span>
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentData.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1000}>
                  {currentData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} itemStyle={{ color: '#431407' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-orange-950">100%</span>
              <span className="text-[10px] font-bold text-orange-600/80 uppercase tracking-wider">Output</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {currentData.pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-bold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Task Breakdown Log */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm bg-white/80 mb-8">
        <h3 className="text-lg font-bold text-orange-950 mb-6 flex items-center gap-3">
          Task Breakdown Log
          <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-md">{activeTab} Record</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-200">
                <th className="pb-3 text-xs font-bold text-orange-800 uppercase tracking-wider">Task / Verified Event</th>
                <th className="pb-3 text-xs font-bold text-orange-800 uppercase tracking-wider">Category</th>
                <th className="pb-3 text-xs font-bold text-orange-800 uppercase tracking-wider">Est. Time</th>
                <th className="pb-3 text-xs font-bold text-orange-800 uppercase tracking-wider">Actual Time</th>
                <th className="pb-3 text-xs font-bold text-orange-800 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {currentData.taskLog.map(task => (
                <tr key={task.id} className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-slate-800">{task.title}</td>
                  <td className="py-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{task.category}</span>
                  </td>
                  <td className="py-4 text-sm font-semibold text-slate-500">{task.est} hrs</td>
                  <td className="py-4 text-sm font-semibold text-slate-800">{task.actual} hrs</td>
                  <td className="py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-max ${
                      task.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {task.status === "Overtime" && <AlertCircle className="w-3 h-3" />}
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Card */}
      <motion.div 
        key={`insight-${activeTab}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 border-2 border-rose-200/60 bg-gradient-to-r from-orange-50 to-rose-50 shadow-md flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-400 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-100 z-10">
          <BrainCircuit className="w-8 h-8 text-rose-500" />
        </div>
        
        <div className="flex-1 z-10">
          <h3 className="text-lg font-bold text-rose-950 flex items-center gap-2 mb-2">
            AI Insights & Feedback <Sparkles className="w-4 h-4 text-rose-400" />
          </h3>
          <p className="text-rose-900/80 font-medium leading-relaxed text-sm md:text-base">
            {activeTab === "Daily" && (
              <>"Great job knocking out the <strong className="text-emerald-700 bg-emerald-100 px-1 rounded">Java Algorithm Practice</strong> exactly on time today! However, Graph Traversals took 30 mins longer. I'll add a buffer for tomorrow's data structures study block."</>
            )}
            {activeTab === "Weekly" && (
              <>"You spent a solid block on the <strong className="text-rose-600 bg-rose-100 px-1 rounded">Lanqiao Cup Mock Exam</strong> this week. Since you consistently underestimated INT104 lab times, I have automatically added 30-min buffers to all future programming schedules to reduce rush."</>
            )}
            {activeTab === "Monthly" && (
              <>"An incredible month! You spent 15 hours flawlessly executing the <strong className="text-emerald-700 bg-emerald-100 px-1 rounded">Tech Club Backend Project</strong>. Watch out for the Dynamic Programming assignments next month, as they usually consume 20% more time than you expect."</>
            )}
          </p>
        </div>
      </motion.div>

    </div>
  );
}
