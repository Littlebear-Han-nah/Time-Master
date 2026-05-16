"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, MapPin, CalendarDays, ArrowLeft, GripVertical, Sparkles, BrainCircuit, CheckCircle2, Circle, X, PartyPopper, ShieldCheck, DownloadCloud } from "lucide-react";
import Link from "next/link";

// --- Types ---
interface Task {
  id: string;
  title: string;
  duration: number; // in hours
  location?: string;
  deadline?: string;
  priority: "High" | "Medium" | "Low";
  isVerified?: boolean; // Represents hyper-local/API synced data
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
const DAY_START = 8.0; // 08:00 AM
const DAY_END = 22.0;  // 10:00 PM

const formatTime = (num: number) => {
  const hours = Math.floor(num);
  const mins = Math.round((num - hours) * 60);
  const period = hours >= 12 && hours < 24 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
};

// HYPER-LOCAL MOCK DATA (XJTLU)
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
  // Academic / Focus
  { title: "Review notes at Learning Mall Core (Low 🟢)", duration: 1.0, category: "Academic", isVerified: true },
  { title: "Practice presentation in empty CB G11", duration: 0.5, category: "Academic", isVerified: true },
  { title: "Drop by Professor's office hour (FB Building)", duration: 1.0, category: "Academic", isVerified: true },
  // Wellness / Destress
  { title: "Grab coffee at SIP Campus Canteen", duration: 0.5, category: "Wellness", isVerified: true },
  { title: "30-min Jog around XJTLU South Campus", duration: 0.5, category: "Wellness", isVerified: true },
  { title: "Quick rest at Student Activity Centre", duration: 0.5, category: "Wellness", isVerified: true },
  // Social / Extracurricular
  { title: "Upcoming XJTLU Tech Club Seminar (SA)", duration: 1.0, category: "Social", isVerified: true },
  { title: "Check E-Bridge for society updates", duration: 0.5, category: "Social", isVerified: true },
];

export default function InteractivePlanning() {
  const [unplannedTasks, setUnplannedTasks] = useState<Task[]>(initialTasks);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialEvents);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Sync / Import State
  const [isSyncing, setIsSyncing] = useState(false);

  // AI Explore State
  const [exploreSlotId, setExploreSlotId] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("1");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");

  // Modal State
  const [taskForCompletion, setTaskForCompletion] = useState<TimelineEvent | null>(null);
  const [actualDuration, setActualDuration] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Derived State: Gap Calculation ---
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

  // --- Handlers ---
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
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedTaskId(null);
  };

  const handleDrop = (e: React.DragEvent, slotStart: number, slotDuration: number) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col font-sans relative">
      
      {/* Completion Modal Overlay */}
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
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden border border-orange-100"
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

      {/* Header & AI Explore */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm text-orange-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
              Interactive Planning
            </h1>
            <p className="text-orange-900/60 font-medium text-sm mt-1">Real-time scheduling with time-blocking algorithms.</p>
          </div>
        </div>

        {/* AI Explore Time Module */}
        <div className="glass-card px-6 py-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-orange-200/50 shadow-orange-100/50 shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" /> Explore Free Time
            </span>
            <select 
              value={exploreSlotId} 
              onChange={(e) => setExploreSlotId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-orange-950 outline-none cursor-pointer max-w-[200px]"
            >
              <option value="" disabled>Select an empty gap...</option>
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
            className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>
            <Sparkles className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Exploring..." : "AI Suggestion"}
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
        
        {/* Left Column: Task Form & Pool */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
          
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
            
            {/* Sync Syllabus Button */}
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

        {/* Right Column: Dynamic Timeline */}
        <div className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm">
            <h2 className="text-xl font-bold text-orange-950 mb-8 flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Clock className="w-5 h-5"/></div>
              Smart Timeline
            </h2>
            
            <div className="relative border-l-[3px] border-orange-200/50 ml-16 pl-6 space-y-2">
              <AnimatePresence>
                {displayTimeline.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative pb-4"
                  >
                    {/* Time Label */}
                    <div className="absolute -left-[90px] top-4 text-xs font-bold text-orange-600/80 text-right w-16 uppercase tracking-wider">
                      {formatTime(item.startTime)}
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-5 w-3 h-3 rounded-full bg-orange-300 border-2 border-white shadow-sm z-10" />
                    
                    {/* Event Blocks */}
                    {item.type === "fixed" && (
                      <div className="p-4 rounded-2xl bg-slate-100/50 border border-slate-200/60 flex items-center gap-3 text-slate-500 opacity-80">
                        <div className="w-1.5 h-8 bg-slate-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-700">{item.title}</h4>
                            {item.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-indigo-400 opacity-70" />
                            )}
                          </div>
                          <p className="text-xs font-semibold mt-0.5">{item.duration} hrs • Fixed</p>
                        </div>
                      </div>
                    )}

                    {item.type === "empty" && (
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, item.startTime, item.duration)}
                        className={`p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center min-h-[60px] cursor-crosshair ${
                          draggedTaskId ? "border-orange-400 bg-orange-50/80 shadow-inner" : "border-orange-200 bg-white/20 hover:bg-orange-50"
                        }`}
                        style={{ height: Math.max(60, item.duration * 40) }} // visual height scaling
                      >
                        <span className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                          {item.duration} hrs free • Drop task here
                        </span>
                      </div>
                    )}

                    {item.type === "task" && (
                      <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                        item.isCompleted 
                          ? "bg-emerald-50 border-emerald-200 opacity-80" 
                          : "border-orange-300 bg-orange-50 shadow-sm"
                      }`}>
                        <div className={`w-1.5 h-8 rounded-full ${item.isCompleted ? "bg-emerald-400" : "bg-orange-500"}`}></div>
                        
                        <button 
                          onClick={() => !item.isCompleted && openCompletionModal(item)}
                          disabled={item.isCompleted}
                          className={`shrink-0 transition-colors ${item.isCompleted ? "text-emerald-500" : "text-orange-300 hover:text-orange-500 cursor-pointer"}`}
                        >
                          {item.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`font-bold text-sm ${item.isCompleted ? "text-emerald-900 line-through" : "text-orange-950"}`}>
                              {item.title}
                            </h4>
                            {item.isVerified && !item.isCompleted && (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                                <ShieldCheck className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-semibold mt-0.5 ${item.isCompleted ? "text-emerald-700" : "text-orange-700"}`}>
                            {item.duration} hrs • Scheduled
                          </p>
                        </div>
                      </div>
                    )}

                    {item.type === "ai_suggested" && (
                      <div className={`p-4 rounded-2xl border-0 flex items-center gap-3 transition-colors ${
                        item.isCompleted
                          ? "bg-emerald-100 border border-emerald-200 text-emerald-800"
                          : "bg-gradient-to-r from-rose-500 to-orange-500 shadow-md shadow-rose-200 text-white"
                      }`}>
                        <div className={`w-1.5 h-8 rounded-full ${item.isCompleted ? "bg-emerald-400" : "bg-white/50"}`}></div>
                        
                        <button 
                          onClick={() => !item.isCompleted && openCompletionModal(item)}
                          disabled={item.isCompleted}
                          className={`shrink-0 transition-colors ${item.isCompleted ? "text-emerald-600" : "text-white/60 hover:text-white cursor-pointer"}`}
                        >
                          {item.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>

                        <div className="flex-1">
                          <h4 className={`font-bold text-sm flex items-center gap-2 ${item.isCompleted ? "line-through" : ""}`}>
                            {!item.isCompleted && <Sparkles className="w-4 h-4 text-rose-200" />} 
                            {item.title}
                            {item.isVerified && !item.isCompleted && (
                              <ShieldCheck className="w-4 h-4 text-rose-200 ml-auto" />
                            )}
                          </h4>
                          <p className={`text-xs font-semibold mt-0.5 ${item.isCompleted ? "text-emerald-600" : "text-rose-100"}`}>
                            {item.duration} hrs • AI Recommended
                          </p>
                        </div>
                      </div>
                    )}

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
