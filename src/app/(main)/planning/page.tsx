"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Clock, MapPin, CalendarDays, ArrowLeft, GripVertical,
  Sparkles, BrainCircuit, CheckCircle2, Circle, X, PartyPopper,
  ShieldCheck, DownloadCloud, ChevronUp
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string; title: string; duration: number;
  location?: string; deadline?: string;
  priority: "High" | "Medium" | "Low"; isVerified?: boolean;
}
interface TimelineEvent {
  id: string; startTime: number; endTime: number; title: string;
  type: "fixed" | "task" | "ai_suggested"; duration: number;
  isCompleted?: boolean; isVerified?: boolean;
}
interface TimeSlot { id: string; startTime: number; endTime: number; type: "empty"; duration: number; }
type TimelineItem = TimelineEvent | TimeSlot;

const DAY_START = 8.0, DAY_END = 22.0;

const formatTime = (num: number) => {
  const h = Math.floor(num), m = Math.round((num - h) * 60);
  const p = h >= 12 ? "PM" : "AM", d = h % 12 === 0 ? 12 : h % 12;
  return `${String(d).padStart(2,"0")}:${String(m).padStart(2,"0")} ${p}`;
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
  { title: "Review notes at Learning Mall Core (Low 🟢)", duration: 1.0, isVerified: true },
  { title: "Practice presentation in CB G11", duration: 0.5, isVerified: true },
  { title: "Professor's office hour (FB Building)", duration: 1.0, isVerified: true },
  { title: "Grab coffee at SIP Canteen", duration: 0.5, isVerified: true },
  { title: "30-min jog around South Campus", duration: 0.5, isVerified: true },
  { title: "Tech Club Seminar (SA)", duration: 1.0, isVerified: true },
];

export default function InteractivePlanning() {
  const [unplannedTasks, setUnplannedTasks] = useState<Task[]>(initialTasks);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialEvents);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exploreSlotId, setExploreSlotId] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("1");
  const [newLocation, setNewLocation] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [taskForCompletion, setTaskForCompletion] = useState<TimelineEvent | null>(null);
  const [actualDuration, setActualDuration] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);

  // Desktop drag
  const [desktopDragId, setDesktopDragId] = useState<string | null>(null);
  const desktopDragRef = useRef<string | null>(null);

  // Mobile touch drag
  const touchDragRef = useRef<string | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [ghostLabel, setGhostLabel] = useState("");
  const [highlightSlotId, setHighlightSlotId] = useState<string | null>(null);

  const displayTimeline = useMemo(() => {
    const sorted = [...timelineEvents].sort((a, b) => a.startTime - b.startTime);
    const result: TimelineItem[] = [];
    let cur = DAY_START;
    sorted.forEach(ev => {
      if (ev.startTime > cur) result.push({ id: `gap_${cur}_${ev.startTime}`, startTime: cur, endTime: ev.startTime, duration: ev.startTime - cur, type: "empty" });
      result.push(ev);
      cur = Math.max(cur, ev.endTime);
    });
    if (cur < DAY_END) result.push({ id: `gap_${cur}_${DAY_END}`, startTime: cur, endTime: DAY_END, duration: DAY_END - cur, type: "empty" });
    return result;
  }, [timelineEvents]);

  const emptySlots = displayTimeline.filter(i => i.type === "empty") as TimeSlot[];

  const dropTask = (taskId: string, slotStart: number, slotDur: number) => {
    const task = unplannedTasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.duration > slotDur) { alert(`Cannot fit ${task.duration}h into ${slotDur}h slot.`); return; }
    setUnplannedTasks(prev => prev.filter(t => t.id !== taskId));
    setTimelineEvents(prev => [...prev, {
      id: task.id, startTime: slotStart, endTime: slotStart + task.duration,
      title: task.title, type: "task", duration: task.duration, isVerified: task.isVerified
    }]);
  };

  // ─── Desktop drag handlers ───
  const onDesktopDragStart = (e: React.DragEvent, id: string) => {
    desktopDragRef.current = id; setDesktopDragId(id);
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("taskId", id);
  };
  const onDesktopDragEnd = () => { desktopDragRef.current = null; setDesktopDragId(null); };
  const onDesktopDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const onDesktopDrop = (e: React.DragEvent, start: number, dur: number) => {
    e.preventDefault();
    const id = desktopDragRef.current || e.dataTransfer.getData("taskId");
    if (id) dropTask(id, start, dur);
    desktopDragRef.current = null; setDesktopDragId(null);
  };

  // ─── Mobile touch handlers ───
  const onTouchStart = (e: React.TouchEvent, task: Task) => {
    e.preventDefault(); // 阻止滚动
    const t = e.touches[0];
    touchDragRef.current = task.id;
    setTouchDragging(true);
    setGhostLabel(`${task.title} · ${task.duration}h`);
    setGhostPos({ x: t.clientX - 80, y: t.clientY - 24 });
    setPoolOpen(false); // 立刻隐藏 Bottom Sheet
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    setGhostPos({ x: t.clientX - 80, y: t.clientY - 24 });
    // 找手指下方的 drop zone
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const zone = el?.closest("[data-slot-id]") as HTMLElement | null;
    setHighlightSlotId(zone ? zone.dataset.slotId || null : null);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const t = e.changedTouches[0];
    const taskId = touchDragRef.current;
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const zone = el?.closest("[data-slot-id]") as HTMLElement | null;
    if (zone) {
      const slot = emptySlots.find(s => s.id === zone.dataset.slotId);
      if (slot) dropTask(taskId, slot.startTime, slot.duration);
    }
    touchDragRef.current = null;
    setTouchDragging(false);
    setHighlightSlotId(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setUnplannedTasks(prev => [{ id: `t_${Date.now()}`, title: newTitle, duration: parseFloat(newDuration) || 1, location: newLocation.trim() || undefined, deadline: newDeadline || undefined, priority: "Medium" }, ...prev]);
    setNewTitle(""); setNewDuration("1"); setNewLocation(""); setNewDeadline("");
  };

  const handleAIExplore = () => {
    if (!exploreSlotId || isSimulating) return;
    const slot = emptySlots.find(s => s.id === exploreSlotId);
    if (!slot) return;
    setIsSimulating(true);
    setTimeout(() => {
      const valid = AI_SUGGESTIONS.filter(s => s.duration <= slot.duration);
      if (!valid.length) { alert("Slot too small."); setIsSimulating(false); return; }
      const s = valid[Math.floor(Math.random() * valid.length)];
      setTimelineEvents(prev => [...prev, { id: `ai_${Date.now()}`, startTime: slot.startTime, endTime: slot.startTime + s.duration, title: s.title, type: "ai_suggested", duration: s.duration, isVerified: s.isVerified }]);
      setExploreSlotId(""); setIsSimulating(false);
    }, 1200);
  };

  const handleConfirmCompletion = () => {
    if (!taskForCompletion) return;
    setIsCompleting(true);
    setTimeout(() => {
      setShowConfetti(true);
      setTimelineEvents(prev => prev.map(ev => ev.id === taskForCompletion.id ? { ...ev, isCompleted: true } : ev));
      setTimeout(() => { setTaskForCompletion(null); setIsCompleting(false); setShowConfetti(false); }, 1500);
    }, 800);
  };

  const handleSync = () => {
    if (isSyncing) return; setIsSyncing(true);
    setTimeout(() => {
      setUnplannedTasks(prev => [
        { id: `i_${Date.now()}_1`, title: "EAP115 Essay Draft 1", duration: 2.5, priority: "High", deadline: "2026-05-10", isVerified: true },
        { id: `i_${Date.now()}_2`, title: "INT104 Programming Lab", duration: 1.5, priority: "High", location: "CB 113", isVerified: true },
        { id: `i_${Date.now()}_3`, title: "Learning Mall Quiz", duration: 0.5, priority: "Medium", isVerified: true },
        ...prev,
      ]); setIsSyncing(false);
    }, 1500);
  };

  // ─── Task Card component ───
  const TaskCard = ({ task, mobile }: { task: Task; mobile: boolean }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      draggable={!mobile}
      onDragStart={!mobile ? (e: any) => onDesktopDragStart(e, task.id) : undefined}
      onDragEnd={!mobile ? onDesktopDragEnd : undefined}
      onTouchStart={mobile ? (e: any) => onTouchStart(e, task) : undefined}
      onTouchMove={mobile ? (e: any) => onTouchMove(e) : undefined}
      onTouchEnd={mobile ? (e: any) => onTouchEnd(e) : undefined}
      className={`group flex items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-xl md:rounded-2xl border bg-white/80 shadow-sm select-none transition-all
        ${mobile ? "cursor-pointer active:scale-95 active:shadow-md" : "cursor-grab active:cursor-grabbing hover:shadow-md"}
        ${task.isVerified ? "border-indigo-200" : "border-orange-200"}`}
    >
      <GripVertical className={`opacity-30 group-hover:opacity-80 text-orange-500 shrink-0 ${mobile ? "w-3.5 h-3.5" : "w-5 h-5"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h3 className={`font-bold text-slate-800 truncate ${mobile ? "text-xs" : "text-sm"}`}>{task.title}</h3>
          {task.isVerified && <span className={`font-bold text-indigo-600 bg-indigo-100 rounded shrink-0 ${mobile ? "text-[7px] px-1 py-0.5" : "text-[10px] px-1.5 py-0.5"}`}>API</span>}
        </div>
        <p className={`text-slate-500 font-semibold mt-0.5 ${mobile ? "text-[9px]" : "text-xs"}`}>{task.duration}h{task.location ? ` · ${task.location}` : ""}</p>
      </div>
    </motion.div>
  );

  // ─── Timeline slot component ───
  const TLSlot = ({ item, mobile }: { item: TimelineItem; mobile: boolean }) => {
    const h = Math.max(mobile ? 50 : 60, item.duration * (mobile ? 30 : 40));
    const isHit = mobile && item.type === "empty" && highlightSlotId === item.id;
    const isDragActive = desktopDragId !== null;

    return (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative pb-3">
        <span className={`absolute font-bold uppercase tracking-wider text-orange-600/80 text-right ${mobile ? "left-[-72px] top-3 text-[10px] w-14" : "left-[-90px] top-4 text-xs w-16"}`}>
          {formatTime(item.startTime)}
        </span>
        <div className={`absolute rounded-full bg-orange-300 border-2 border-white shadow-sm z-10 ${mobile ? "-left-[23px] top-4 w-2.5 h-2.5" : "-left-[31px] top-5 w-3 h-3"}`} />

        {item.type === "fixed" && (
          <div className={`rounded-xl bg-slate-100/50 border border-slate-200/60 flex items-center gap-2 opacity-80 ${mobile ? "p-3" : "p-4"}`}>
            <div className={`bg-slate-400 rounded-full shrink-0 ${mobile ? "w-1 h-6" : "w-1.5 h-8"}`} />
            <div>
              <p className={`font-bold text-slate-700 ${mobile ? "text-xs" : "text-sm"}`}>{item.title}</p>
              <p className={`font-semibold text-slate-500 mt-0.5 ${mobile ? "text-[10px]" : "text-xs"}`}>{item.duration}h · Fixed</p>
            </div>
          </div>
        )}

        {item.type === "empty" && (
          <div
            data-slot-id={item.id}
            onDragOver={onDesktopDragOver}
            onDrop={(e) => onDesktopDrop(e, item.startTime, item.duration)}
            style={{ height: h, minHeight: mobile ? 50 : 60 }}
            className={`rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
              isHit
                ? "border-orange-500 bg-orange-100 scale-[1.02] shadow-lg"
                : isDragActive
                ? "border-orange-400 bg-orange-50/80"
                : "border-orange-200 bg-white/20 hover:bg-orange-50"
            }`}
          >
            <span className={`font-semibold text-orange-400 pointer-events-none ${mobile ? "text-xs" : "text-sm"}`}>
              {isHit ? "✓ 放开添加" : `${item.duration}h free`}
            </span>
          </div>
        )}

        {(item.type === "task" || item.type === "ai_suggested") && (
          <div className={`rounded-xl border flex items-center gap-2 transition-colors ${
            item.isCompleted ? "bg-emerald-50 border-emerald-200 opacity-80"
            : item.type === "ai_suggested" ? "border-0 bg-gradient-to-r from-rose-500 to-orange-500 text-white"
            : "border-orange-300 bg-orange-50"
          } ${mobile ? "p-3" : "p-4"}`}>
            <div className={`rounded-full shrink-0 ${item.isCompleted ? "bg-emerald-400" : item.type === "ai_suggested" ? "bg-white/40" : "bg-orange-500"} ${mobile ? "w-1 h-6" : "w-1.5 h-8"}`} />
            <button onClick={() => !item.isCompleted && setTaskForCompletion(item as TimelineEvent)} disabled={item.isCompleted}
              className={`shrink-0 ${item.isCompleted ? "text-emerald-500" : item.type === "ai_suggested" ? "text-white/60 hover:text-white" : "text-orange-300 hover:text-orange-500"}`}>
              {item.isCompleted ? <CheckCircle2 className={mobile ? "w-4 h-4" : "w-6 h-6"} /> : <Circle className={mobile ? "w-4 h-4" : "w-6 h-6"} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-bold flex items-center gap-1 ${item.isCompleted ? "line-through" : ""} ${item.type === "ai_suggested" && !item.isCompleted ? "text-white" : item.isCompleted ? "text-emerald-900" : "text-orange-950"} ${mobile ? "text-xs" : "text-sm"}`}>
                {item.type === "ai_suggested" && !item.isCompleted && <Sparkles className="w-3 h-3 shrink-0" />}
                {item.title}
              </p>
              <p className={`font-semibold mt-0.5 ${item.isCompleted ? "text-emerald-700" : item.type === "ai_suggested" ? "text-rose-100" : "text-orange-700"} ${mobile ? "text-[10px]" : "text-xs"}`}>
                {item.duration}h {item.type === "ai_suggested" ? "· AI" : "· Scheduled"}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col font-sans">

      {/* Ghost label following finger */}
      {touchDragging && (
        <div style={{ position: "fixed", left: ghostPos.x, top: ghostPos.y, zIndex: 9999, pointerEvents: "none" }}
          className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-2xl opacity-95 max-w-[220px] truncate border-2 border-white">
          {ghostLabel}
        </div>
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {taskForCompletion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-orange-100">
              {!showConfetti && <button onClick={() => setTaskForCompletion(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>}
              {showConfetti ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4"><PartyPopper className="w-10 h-10" /></div>
                  <h3 className="text-xl font-bold text-emerald-600">Awesome Job!</h3>
                  <p className="text-sm text-slate-500 mt-2 text-center">Logged to analytics.</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold mb-2">Great job!</h3>
                  <p className="text-sm text-slate-500 mb-6">Finished <strong>{taskForCompletion.title}</strong>. Actual time?</p>
                  <div className="relative mb-6">
                    <input type="number" step="0.5" min="0.5" value={actualDuration} onChange={e => setActualDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">hours</span>
                  </div>
                  <button onClick={handleConfirmCompletion} disabled={isCompleting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                    {isCompleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm & Log"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/50 hover:bg-white rounded-full shadow-sm text-orange-600 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500">Interactive Planning</h1>
            <p className="text-orange-900/60 text-xs md:text-sm mt-1">Real-time scheduling with time-blocking algorithms.</p>
          </div>
        </div>
        <div className="glass-card px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-orange-200/50 shadow-lg w-full lg:w-auto">
          <div className="flex flex-col flex-1">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3" />Explore</span>
            <select value={exploreSlotId} onChange={e => setExploreSlotId(e.target.value)} className="bg-transparent text-xs md:text-sm font-semibold text-orange-950 outline-none cursor-pointer">
              <option value="" disabled>Select gap...</option>
              {emptySlots.map(s => <option key={s.id} value={s.id}>{formatTime(s.startTime)} – {formatTime(s.endTime)} ({s.duration}h)</option>)}
            </select>
          </div>
          <button onClick={handleAIExplore} disabled={isSimulating || !exploreSlotId} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center">
            <Sparkles className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />{isSimulating ? "..." : "AI Suggest"}
          </button>
        </div>
      </header>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:grid grid-cols-12 gap-8 flex-1 items-start">
        <div className="col-span-4 flex flex-col gap-6 sticky top-8">
          {/* Add Task Form */}
          <div className="glass-card rounded-3xl p-6 border border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-orange-950 mb-4 flex items-center gap-2"><div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Plus className="w-4 h-4" /></div>Add New Task</h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <input type="text" placeholder="Task Name" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-white/60 border border-orange-200 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-2.5 text-sm outline-none placeholder-orange-300 text-orange-900" />
              <div className="flex gap-2">
                <div className="relative flex-1"><Clock className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" step="0.5" min="0.5" required placeholder="Hrs" value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-full bg-white/60 border border-orange-200 focus:ring-2 focus:ring-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none placeholder-orange-300 text-orange-900" /></div>
                <div className="relative flex-1"><MapPin className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full bg-white/60 border border-orange-200 focus:ring-2 focus:ring-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none placeholder-orange-300 text-orange-900" /></div>
              </div>
              <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="bg-white/60 border border-orange-200 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-2.5 text-sm outline-none text-orange-900" />
              <button type="submit" className="mt-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm">Add to Pool</button>
            </form>
          </div>
          {/* Task Pool */}
          <div className="glass-card rounded-3xl p-6 border border-orange-100 shadow-sm flex flex-col max-h-[60vh]">
            <h2 className="text-xl font-bold text-orange-950 mb-4 flex items-center gap-2"><div className="p-2 bg-orange-100 rounded-lg text-orange-600"><CalendarDays className="w-5 h-5" /></div>Task Pool</h2>
            <button onClick={handleSync} disabled={isSyncing} className="mb-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70">
              {isSyncing ? <><div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />Syncing...</> : <><DownloadCloud className="w-4 h-4" />Sync from XJTLU</>}
            </button>
            <div className="flex-1 overflow-y-auto space-y-3">
              <AnimatePresence>{unplannedTasks.map(t => <TaskCard key={t.id} task={t} mobile={false} />)}</AnimatePresence>
              {!unplannedTasks.length && <p className="text-center py-8 text-sm text-orange-300">Pool is empty!</p>}
            </div>
          </div>
        </div>
        <div className="col-span-8">
          <div className="glass-card rounded-3xl p-8 border border-orange-100 shadow-sm">
            <h2 className="text-xl font-bold text-orange-950 mb-8 flex items-center gap-2"><div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Clock className="w-5 h-5" /></div>Smart Timeline</h2>
            <div className="relative border-l-[3px] border-orange-200/50 ml-16 pl-6 space-y-2">
              <AnimatePresence>{displayTimeline.map(item => <TLSlot key={item.id} item={item} mobile={false} />)}</AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="lg:hidden flex flex-col">
        {/* Timeline */}
        <div className="glass-card rounded-3xl p-4 border border-orange-100 shadow-sm mb-28">
          <h2 className="text-base font-bold text-orange-950 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600"><Clock className="w-4 h-4" /></div>
            Timeline
            {touchDragging && <span className="ml-auto text-[10px] text-orange-500 font-bold animate-pulse">拖到空余时间槽放开 ✦</span>}
          </h2>
          <div className="relative border-l-[3px] border-orange-200/50 ml-12 pl-4 space-y-2">
            <AnimatePresence>{displayTimeline.map(item => <TLSlot key={item.id} item={item} mobile={true} />)}</AnimatePresence>
          </div>
        </div>

        {/* Bottom Sheet Backdrop */}
        <AnimatePresence>
          {poolOpen && !touchDragging && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPoolOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          )}
        </AnimatePresence>

        {/* Bottom Sheet */}
        <motion.div
          animate={{ y: poolOpen && !touchDragging ? 0 : "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 130 }}
          style={{ pointerEvents: touchDragging ? "none" : "auto", visibility: touchDragging ? "hidden" : "visible" }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-orange-200/50 shadow-2xl max-h-[82vh] flex flex-col"
        >
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-orange-200 rounded-full" /></div>
          <div className="px-4 py-2 border-b border-orange-100 flex items-center justify-between">
            <span className="text-base font-bold text-orange-950 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-orange-500" />Task Pool ({unplannedTasks.length})</span>
            <button onClick={() => setPoolOpen(false)} className="p-1 rounded-lg hover:bg-orange-50"><ChevronUp className="w-5 h-5 text-orange-600" /></button>
          </div>
          {/* Instruction */}
          <div className="px-4 pt-2 pb-1">
            <p className="text-[11px] text-orange-500 font-semibold bg-orange-50 rounded-lg px-3 py-2 border border-orange-100">
              👆 按住下方任务卡片 → 向上拖到 Timeline 的空余时间槽 → 松手即可添加
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {/* Add Task */}
            <div className="glass-card rounded-2xl p-3 border border-orange-100 mb-3">
              <h3 className="text-sm font-bold text-orange-950 mb-2 flex items-center gap-1"><Plus className="w-3.5 h-3.5 text-orange-600" />Add Task</h3>
              <form onSubmit={handleAddTask} className="flex flex-col gap-2">
                <input type="text" placeholder="Task Name" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-white/60 border border-orange-200 rounded-lg px-3 py-2 text-xs outline-none placeholder-orange-300 text-orange-900" />
                <div className="flex gap-2">
                  <div className="relative flex-1"><Clock className="w-3 h-3 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2" /><input type="number" step="0.5" min="0.5" required placeholder="Hrs" value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-full bg-white/60 border border-orange-200 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none placeholder-orange-300 text-orange-900" /></div>
                  <div className="relative flex-1"><MapPin className="w-3 h-3 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Loc" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full bg-white/60 border border-orange-200 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none placeholder-orange-300 text-orange-900" /></div>
                </div>
                <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="bg-white/60 border border-orange-200 rounded-lg px-3 py-1.5 text-xs outline-none text-orange-900" />
                <button type="submit" className="mt-1 bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-lg font-bold text-xs">Add</button>
              </form>
            </div>
            <button onClick={handleSync} disabled={isSyncing} className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-70 mb-2">
              {isSyncing ? <><div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />Syncing...</> : <><DownloadCloud className="w-3 h-3" />Sync</>}
            </button>
            <AnimatePresence>{unplannedTasks.map(t => <TaskCard key={t.id} task={t} mobile={true} />)}</AnimatePresence>
            {!unplannedTasks.length && <p className="text-center py-6 text-xs text-orange-300">Pool is empty!</p>}
          </div>
        </motion.div>

        {/* FAB */}
        {!poolOpen && !touchDragging && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setPoolOpen(true)}
            className="fixed bottom-24 right-5 z-40 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
            <CalendarDays className="w-5 h-5" />{unplannedTasks.length} Tasks
          </motion.button>
        )}
      </div>
    </div>
  );
}
