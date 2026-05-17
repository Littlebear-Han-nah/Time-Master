"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, MapPin, CalendarDays, ArrowLeft, GripVertical, Sparkles, BrainCircuit, CheckCircle2, Circle, X, PartyPopper, ShieldCheck, DownloadCloud, ChevronUp } from "lucide-react";
import Link from "next/link";

// --- Types ---
interface Task {
  id: string;
  title: string;
  duration: number;
  location?: string;
  deadline?: string;
  priority: "High" | "Medium" | "Low";
  isVerified?: boolean;
}

interface TimelineEvent {
  id: string;
  startTime: number; 
  endTime: number;
  title: string;
  type: "fixed" | "task" | "ai_suggested";
  duration: number;
  isCompleted?: boolean;
  isVerified?: boolean;
}

interface TimeSlot {
  id: string;
  startTime: number;
  endTime: number;
  type: "empty";
  duration: number;
}

type TimelineItem = TimelineEvent | TimeSlot;

// --- Constants & Helpers ---
const DAY_START = 8.0;
const DAY_END = 22.0;

const formatTime = (num: number) => {
  const hours = Math.floor(num);
  const mins = Math.round((num - hours) * 60);
  const period = hours >= 12 && hours < 24 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
};

const initialTasks: Task[] = [
  { id: "t1", title: "Review EAP115 Vocabulary", duration: 1.5, priority: "Medium", location: "Learning Mall Core", isVerified: true },
  { id: "t2", title: "Tech Club Meeting", duration: 1.0, priority: "Low", location: "SA Building" },
  { id: "t3", title: "Finish INT104 Lab Report", duration: 2.0, priority: "High", deadline: "2026-05-04", isVerified: true },
];

const initialEvents: TimelineEvent[] = [
  { id: "e1", startTime: 9.0, endTime: 10.5, title: "SAT102 Entrepreneurial Skills", type: "fixed", duration: 1.5, isVerified: true },
  { id: "e2", startTime: 13.0, endTime: 14.0, title: "Lunch with study group", type: "fixed", duration: 1.0 },
  { id: "e3", startTime: 19.0, endTime: 21.0, title: "CPT102 Algorithms Practice", type: "fixed", duration: 2.0, isVerified: true },
];

const AI_SUGGESTIONS = [
  { title: "Review notes at Learning Mall Core (Low 🟢)", duration: 1.0, category: "Academic", isVerified: true },
  { title: "Practice presentation in empty CB G11", duration: 0.5, category: "Academic", isVerified: true },
  { title: "Drop by Professor's office hour (FB Building)", duration: 1.0, category: "Academic", isVerified: true },
  { title: "Grab coffee at SIP Campus Canteen", duration: 0.5, category: "Wellness", isVerified: true },
  { title: "30-min Jog around XJTLU South Campus", duration: 0.5, category: "Wellness", isVerified: true },
  { title: "Quick rest at Student Activity Centre", duration: 0.5, category: "Wellness", isVerified: true },
  { title: "Upcoming XJTLU Tech Club Seminar (SA)", duration: 1.0, category: "Social", isVerified: true },
  { title: "Check E-Bridge for society updates", duration: 0.5, category: "Social", isVerified: true },
];

export default function InteractivePlanning() {
  const [unplannedTasks, setUnplannedTasks] = useState<Task[]>(initialTasks);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialEvents);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exploreSlotId, setExploreSlotId] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("1");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskForCompletion, setTaskForCompletion] = useState<TimelineEvent | null>(null);
  const [actualDuration, setActualDuration] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);

  const displayTimeline = useMemo(() => {
    const sorted = [...timelineEvents].sort((a, b) => a.startTime - b.startTime);
    const display: TimelineItem[] = [];
    let currentTime = DAY_START;

    sorted.forEach((ev) => {
      if (ev.startTime > currentTime) {
        display.push({
          id: `gap_${currentTime}_${ev.startTime}`,
          startTime: currentTime,
          endTime: ev.startTime,
          duration: ev.startTime - currentTime,
          type: "empty",
        });
      }
      display.push(ev);
      currentTime = Math.max(currentTime, ev.endTime);
    });

    if (currentTime < DAY_END) {
      display.push({
        id: `gap_${currentTime}_${DAY_END}`,
        startTime: currentTime,
        endTime: DAY_END,
        duration: DAY_END - currentTime,
        type: "empty",
      });
    }

    return display;
  }, [timelineEvents]);

  const emptySlots = displayTimeline.filter((item) => item.type === "empty") as TimeSlot[];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `t_${Date.now()}`,
      title,
      duration: parseFloat(duration) || 1,
      location: location.trim() || undefined,
      deadline: deadline || undefined,
      priority: "Medium",
    };

    setUnplannedTasks([newTask, ...unplannedTasks]);
    setTitle("");
    setDuration("1");
    setLocation("");
    setDeadline("");
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
    // 拖拽时自动关闭 Bottom Sheet，让 Timeline 完全暴露
    setPoolOpen(false);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = (e: React.DragEvent, slotStart: number, slotDuration: number) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const taskToMove = unplannedTasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    if (taskToMove.duration > slotDuration) {
      alert(`Cannot fit a ${taskToMove.duration}h task into a ${slotDuration}h slot.`);
      return;
    }

    setUnplannedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: taskToMove.id,
        startTime: slotStart,
        endTime: slotStart + taskToMove.duration,
        title: taskToMove.title,
        type: "task",
        duration: taskToMove.duration,
        isVerified: taskToMove.isVerified
      },
    ]);
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleAIExplore = () => {
    if (!exploreSlotId || isSimulating) return;
    const targetSlot = emptySlots.find(s => s.id === exploreSlotId);
    if (!targetSlot) return;

    setIsSimulating(true);

    setTimeout(() => {
      const validSuggestions = AI_SUGGESTIONS.filter(s => s.duration <= targetSlot.duration);
      if (validSuggestions.length === 0) {
        alert("Slot too small for AI suggestions.");
        setIsSimulating(false);
        return;
      }
      
      const suggestion = validSuggestions[Math.floor(Math.random() * validSuggestions.length)];
      
      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          startTime: targetSlot.startTime,
          endTime: targetSlot.startTime + suggestion.duration,
          title: suggestion.title,
          type: "ai_suggested",
          duration: suggestion.duration,
          isVerified: suggestion.isVerified
        },
      ]);
      setExploreSlotId("");
      setIsSimulating(false);
    }, 1200);
  };

  const openCompletionModal = (item: TimelineEvent) => {
    setTaskForCompletion(item);
    setActualDuration(item.duration.toString());
  };

  const handleConfirmCompletion = () => {
    if (!taskForCompletion) return;
    setIsCompleting(true);
    
    setTimeout(() => {
      setShowConfetti(true);
      setTimelineEvents(prev => prev.map(ev => 
        ev.id === taskForCompletion.id ? { ...ev, isCompleted: true } : ev
      ));
      
      setTimeout(() => {
        setTaskForCompletion(null);
        setIsCompleting(false);
        setShowConfetti(false);
      }, 1500); 
    }, 800);
  };

  const handleSyncSyllabus = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      const importedTasks: Task[] = [
        { id: `import_${Date.now()}_1`, title: "EAP115 Essay Draft 1", duration: 2.5, priority: "High", deadline: "2026-05-10", isVerified: true },
        { id: `import_${Date.now()}_2`, title: "INT104 Programming Lab", duration: 1.5, priority: "High", location: "CB 113 Mac Lab", isVerified: true },
        { id: `import_${Date.now()}_3`, title: "Complete Learning Mall Quiz", duration: 0.5, priority: "Medium", isVerified: true },
      ];
      setUnplannedTasks(prev => [...importedTasks, ...prev]);
      setIsSyncing(false);
    }, 1500);
  };

  // 渲染 Timeline 项目的函数
  const renderTimelineItem = (item: TimelineItem, isMobile: boolean) => {
    const spacing = isMobile ? 30 : 40;
    
    return (
      <motion.div 
        key={item.id} 
        layout 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pb-3 md:pb-4"
      >
        <div className={`absolute top-3 md:top-4 text-right uppercase tracking-wider ${
          isMobile 
            ? "left-[-72px] text-[10px] font-bold text-orange-600/80 w-14" 
            : "left-[-90px] text-xs font-bold text-orange-600/80 w-16"
        }`}>
          {formatTime(item.startTime)}
        </div>

        <div className={`absolute top-4 md:top-5 rounded-full bg-orange-300 border-2 border-white shadow-sm z-10 ${
          isMobile ? "-left-[23px] w-2.5 h-2.5" : "-left-[31px] w-3 h-3"
        }`} />
        
        {item.type === "fixed" && (
          <div className={`rounded-xl bg-slate-100/50 border border-slate-200/60 flex items-center gap-2 md:gap-3 text-slate-500 opacity-80 ${
            isMobile ? "p-3" : "p-4"
          }`}>
            <div className={`rounded-full shrink-0 ${isMobile ? "w-1 h-6 bg-slate-400" : "w-1.5 h-8 bg-slate-400"}`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-bold text-slate-700 ${isMobile ? "text-xs" : "text-sm"}`}>{item.title}</h4>
                {item.isVerified && (
                  <ShieldCheck className={`text-indigo-400 opacity-70 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                )}
              </div>
              <p className={`font-semibold mt-0.5 ${isMobile ? "text-[10px]" : "text-xs"}`}>{item.duration} hrs • Fixed</p>
            </div>
          </div>
        )}

        {item.type === "empty" && (
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item.startTime, item.duration)}
            className={`rounded-xl border-2 border-dashed transition-all flex items-center justify-center cursor-crosshair ${
              draggedTaskId ? "border-orange-400 bg-orange-50/80 shadow-inner" : "border-orange-200 bg-white/20 hover:bg-orange-50"
            }`}
            style={{ 
              height: Math.max(isMobile ? 50 : 60, item.duration * spacing),
              minHeight: isMobile ? 50 : 60
            }}
          >
            <span className={`font-semibold text-orange-400 flex items-center gap-2 text-center ${
              isMobile ? "text-xs" : "text-sm"
            }`}>
              {item.duration}h free
            </span>
          </div>
        )}

        {item.type === "task" && (
          <div className={`rounded-xl border flex items-center gap-2 md:gap-3 transition-colors ${
            item.isCompleted 
              ? "bg-emerald-50 border-emerald-200 opacity-80" 
              : "border-orange-300 bg-orange-50 shadow-sm"
          } ${isMobile ? "p-3" : "p-4"}`}>
            <div className={`rounded-full shrink-0 ${
              item.isCompleted ? "bg-emerald-400" : "bg-orange-500"
            } ${isMobile ? "w-1 h-6" : "w-1.5 h-8"}`}></div>
            
            <button 
              onClick={() => !item.isCompleted && openCompletionModal(item as TimelineEvent)}
              disabled={item.isCompleted}
              className={`shrink-0 transition-colors ${item.isCompleted ? "text-emerald-500" : "text-orange-300 hover:text-orange-500 cursor-pointer"}`}
            >
              {item.isCompleted ? <CheckCircle2 className={isMobile ? "w-4 h-4" : "w-6 h-6"} /> : <Circle className={isMobile ? "w-4 h-4" : "w-6 h-6"} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 md:gap-2">
                <h4 className={`font-bold ${item.isCompleted ? "text-emerald-900 line-through" : "text-orange-950"} ${
                  isMobile ? "text-xs" : "text-sm"
                }`}>
                  {item.title}
                </h4>
                {item.isVerified && !item.isCompleted && (
                  <span className={`flex items-center gap-0.5 font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 rounded shrink-0 ${
                    isMobile ? "text-[7px] px-1 py-0.5" : "text-[10px] px-1.5 py-0.5"
                  }`}>
                    <ShieldCheck className={isMobile ? "w-2 h-2" : "w-3 h-3"} />
                  </span>
                )}
              </div>
              <p className={`font-semibold mt-0.5 ${item.isCompleted ? "text-emerald-700" : "text-orange-700"} ${
                isMobile ? "text-[10px]" : "text-xs"
              }`}>
                {item.duration}h
              </p>
            </div>
          </div>
        )}

        {item.type === "ai_suggested" && (
          <div className={`rounded-xl border-0 flex items-center gap-2 md:gap-3 transition-colors ${
            item.isCompleted
              ? "bg-emerald-100 border border-emerald-200 text-emerald-800"
              : "bg-gradient-to-r from-rose-500 to-orange-500 shadow-md shadow-rose-200 text-white"
          } ${isMobile ? "p-3" : "p-4"}`}>
            <div className={`rounded-full shrink-0 ${
              item.isCompleted ? "bg-emerald-400" : "bg-white/50"
            } ${isMobile ? "w-1 h-6" : "w-1.5 h-8"}`}></div>
            
            <button 
              onClick={() => !item.isCompleted && openCompletionModal(item as TimelineEvent)}
              disabled={item.isCompleted}
              className={`shrink-0 transition-colors ${item.isCompleted ? "text-emerald-600" : "text-white/60 hover:text-white cursor-pointer"}`}
            >
              {item.isCompleted ? <CheckCircle2 className={isMobile ? "w-4 h-4" : "w-6 h-6"} /> : <Circle className={isMobile ? "w-4 h-4" : "w-6 h-6"} />}
            </button>

            <div className="flex-1 min-w-0">
              <h4 className={`font-bold flex items-center gap-1 ${item.isCompleted ? "line-through" : ""} ${
                isMobile ? "text-xs" : "text-sm"
              }`}>
                {!item.isCompleted && <Sparkles className={isMobile ? "w-3 h-3" : "w-4 h-4"} />} 
                {item.title}
              </h4>
              <p className={`font-semibold mt-0.5 ${item.isCompleted ? "text-emerald-600" : "text-rose-100"} ${
                isMobile ? "text-[10px]" : "text-xs"
              }`}>
                {item.duration}h
              </p>
            </div>
          </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col font-sans relative">
      
      {/* Completion Modal */}
      <AnimatePresence>
        {taskForCompletion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden border border-orange-100"
            >
              {!showConfetti && (
                <button 
                  onClick={() => setTaskForCompletion(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {showConfetti ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-6"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <PartyPopper className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-600">Awesome Job!</h3>
                  <p className="text-sm text-slate-500 mt-2 text-center">Data logged to your analytics.</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Great job!</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    You've finished <strong>{taskForCompletion.title}</strong>. How long did it actually take?
                  </p>
                  
                  <div className="mb-6 relative">
                    <input 
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={actualDuration}
                      onChange={e => setActualDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-center text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">hours</span>
                  </div>

                  <button 
                    onClick={handleConfirmCompletion}
                    disabled={isCompleting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-200 transition-all flex justify-center items-center gap-2"
                  >
                    {isCompleting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Confirm & Log"
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Link href="/" className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm text-orange-600 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
              Interactive Planning
            </h1>
            <p className="text-orange-900/60 font-medium text-xs md:text-sm mt-1">Real-time scheduling with time-blocking algorithms.</p>
          </div>
        </div>

        {/* AI Explore Module */}
        <div className="glass-card px-4 md:px-6 py-3 md:py-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-orange-200/50 shadow-orange-100/50 shadow-lg w-full lg:w-auto">
          <div className="flex flex-col flex-1 sm:flex-none">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" /> Explore
            </span>
            <select 
              value={exploreSlotId} 
              onChange={(e) => setExploreSlotId(e.target.value)}
              className="bg-transparent text-xs md:text-sm font-semibold text-orange-950 outline-none cursor-pointer max-w-full"
            >
              <option value="" disabled>Select gap...</option>
              {emptySlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)} ({slot.duration}h)
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleAIExplore}
            disabled={isSimulating || !exploreSlotId}
            className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>
            <Sparkles className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSimulating ? "Exploring..." : "AI"}</span>
            <span className="sm:hidden">{isSimulating ? "..." : "AI"}</span>
          </button>
        </div>
      </header>

      {/* Desktop Layout (lg及以上) */}
      <div className="hidden lg:grid grid-cols-12 gap-8 flex-1 items-start">
        
        {/* Left Column: Task Form & Pool */}
        <div className="col-span-4 flex flex-col gap-6 sticky top-8">
          
          {/* Add Task Form */}
          <div className="glass-card rounded-3xl p-6 border border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-orange-950 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Plus className="w-4 h-4"/></div>
              Add New Task
            </h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Task Name"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-orange-300 text-orange-900"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    placeholder="Hrs"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-all placeholder-orange-300 text-orange-900"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-all placeholder-orange-300 text-orange-900"
                  />
                </div>
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-orange-900 cursor-pointer"
              />
              <button
                type="submit"
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Add to Pool
              </button>
            </form>
          </div>

          {/* Task Pool */}
          <div className="glass-card rounded-3xl p-6 border border-orange-100 shadow-sm flex flex-col max-h-[60vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-950 flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><CalendarDays className="w-5 h-5"/></div>
                Task Pool
              </h2>
            </div>
            
            <button 
              onClick={handleSyncSyllabus}
              disabled={isSyncing}
              className="mb-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70"
            >
              {isSyncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />
                  Fetching E-Bridge API...
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  Sync Syllabus from XJTLU
                </>
              )}
            </button>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              <AnimatePresence>
                {unplannedTasks.map((task) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={task.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex items-center gap-3 p-4 rounded-2xl border bg-white/80 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all ${
                      task.isVerified ? "border-indigo-200" : "border-orange-200"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-800 truncate">{task.title}</h3>
                        {task.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                            <ShieldCheck className="w-3 h-3" /> API
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {task.duration} hrs</span>
                        {task.location && <span className="flex items-center gap-1 truncate max-w-[80px]"><MapPin className="w-3 h-3"/> {task.location}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {unplannedTasks.length === 0 && (
                  <div className="text-center py-8 text-orange-300">
                    <p className="text-sm font-medium">Pool is empty!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="col-span-8">
          <div className="glass-card rounded-3xl p-8 border border-orange-100 shadow-sm">
            <h2 className="text-xl font-bold text-orange-950 mb-8 flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Clock className="w-5 h-5"/></div>
              Smart Timeline
            </h2>
            
            <div className="relative border-l-[3px] border-orange-200/50 ml-16 pl-6 space-y-2">
              <AnimatePresence>
                {displayTimeline.map((item) => renderTimelineItem(item, false))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Layout (lg以下) */}
      <div className="lg:hidden flex flex-col min-h-screen relative">
        
        {/* Timeline - 主要区域，可滚动 */}
        <div className={`flex-1 overflow-y-auto transition-opacity duration-200 ${
          draggedTaskId ? "pointer-events-none opacity-50" : ""
        }`}>
          <div className="glass-card rounded-3xl p-4 border border-orange-100 shadow-sm mb-20">
            <h2 className="text-base font-bold text-orange-950 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600"><Clock className="w-4 h-4"/></div>
              Timeline
            </h2>
            
            <div className="relative border-l-[3px] border-orange-200/50 ml-12 pl-4 space-y-2">
              <AnimatePresence>
                {displayTimeline.map((item) => renderTimelineItem(item, true))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Sheet - Task Pool */}
        <AnimatePresence>
          {poolOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPoolOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: poolOpen ? 0 : "100%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-orange-200/50 shadow-2xl max-h-[80vh] flex flex-col"
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-orange-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-4 py-2 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-orange-950 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-orange-600"/>
              Task Pool ({unplannedTasks.length})
            </h2>
            <button
              onClick={() => setPoolOpen(false)}
              className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <ChevronUp className="w-5 h-5 text-orange-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {/* Add Task Form */}
            <div className="glass-card rounded-2xl p-3 border border-orange-100 mb-3">
              <h3 className="text-sm font-bold text-orange-950 mb-2 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-orange-600"/>
                Add Task
              </h3>
              <form onSubmit={handleAddTask} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Task Name"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-lg px-3 py-2 text-xs outline-none transition-all placeholder-orange-300 text-orange-900"
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Clock className="w-3 h-3 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      placeholder="Hrs"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none transition-all placeholder-orange-300 text-orange-900"
                    />
                  </div>
                  <div className="relative flex-1">
                    <MapPin className="w-3 h-3 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Loc"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none transition-all placeholder-orange-300 text-orange-900"
                    />
                  </div>
                </div>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-white/60 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-lg px-3 py-1.5 text-xs outline-none transition-all text-orange-900 cursor-pointer"
                />
                <button
                  type="submit"
                  className="mt-1 bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-lg font-bold text-xs shadow-md transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Sync Button */}
            <button 
              onClick={handleSyncSyllabus}
              disabled={isSyncing}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 mb-2"
            >
              {isSyncing ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <DownloadCloud className="w-3 h-3" />
                  Sync
                </>
              )}
            </button>

            {/* Tasks List */}
            <AnimatePresence>
              {unplannedTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex items-center gap-2 p-2.5 rounded-lg border bg-white/80 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all ${
                    task.isVerified ? "border-indigo-200" : "border-orange-200"
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-xs text-slate-800 truncate">{task.title}</h3>
                      {task.isVerified && (
                        <span className="flex items-center gap-0.5 text-[7px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-1 py-0.5 rounded shrink-0">
                          API
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-semibold text-slate-500 mt-0.5">{task.duration}h{task.location ? ` • ${task.location}` : ""}</p>
                  </div>
                </motion.div>
              ))}
              {unplannedTasks.length === 0 && (
                <div className="text-center py-8 text-orange-300">
                  <p className="text-xs font-medium">Pool is empty!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Floating Button 打开 Task Pool */}
        {!poolOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setPoolOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm"
          >
            <CalendarDays className="w-5 h-5" />
            <span>{unplannedTasks.length}</span>
          </motion.button>
        )}

      </div>
    </div>
  );
}
