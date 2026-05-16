"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Fingerprint, Calculator, CalendarClock, ChevronDown } from "lucide-react";
import Link from "next/link";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AlgorithmPipeline() {
  const [step, setStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStep(0);
    
    // Step 1 sequence
    await delay(500);
    setStep(1); // Show raw text
    await delay(1200);
    setStep(1.5); // Highlight keywords
    await delay(1000);
    setStep(1.8); // Extract tags
    
    // Step 2 sequence
    await delay(1500);
    setStep(2); // Show formula
    await delay(1000);
    setStep(2.5); // Fill progress bar
    await delay(1000);
    setStep(2.8); // Pop P0 tag
    
    // Step 3 sequence
    await delay(1500);
    setStep(3); // Show initial timeline
    await delay(1500);
    setStep(3.5); // Conflict resolution animation
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col font-sans pb-24">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm text-orange-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
              Algorithm Pipeline
            </h1>
            <p className="text-orange-900/60 font-medium text-sm mt-1">
              Step-by-step visualizer of the Virtual Co-founder engine.
            </p>
          </div>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isRunning}
          className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>
          <Play className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`} />
          {isRunning ? "Simulating..." : step >= 3.5 ? "Replay Simulation" : "Simulate Process"}
        </button>
      </header>

      <div className="flex flex-col gap-12 relative">
        {/* Step 1: Entity Extraction */}
        <div className={`transition-opacity duration-700 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shadow-sm border border-orange-200/50"><Fingerprint className="w-5 h-5"/></div>
            <h2 className="text-xl font-bold text-orange-950">Step 1: Entity Extraction</h2>
          </div>
          
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-200/50 shadow-sm flex flex-col items-center">
            <div className="text-lg font-medium text-orange-900 bg-white/40 p-4 rounded-xl border border-orange-100 w-full text-center mb-6">
              "Prof. Smith just moved the 
              <motion.span 
                animate={{ 
                  backgroundColor: step >= 1.5 ? "rgba(251, 113, 133, 0.2)" : "transparent",
                  color: step >= 1.5 ? "#be123c" : "inherit"
                }} 
                className="px-1 rounded transition-colors duration-500 font-bold mx-1"
              >
                Calculus mid-term
              </motion.span> 
              to 
              <motion.span 
                animate={{ 
                  backgroundColor: step >= 1.5 ? "rgba(251, 146, 60, 0.2)" : "transparent",
                  color: step >= 1.5 ? "#c2410c" : "inherit"
                }} 
                className="px-1 rounded transition-colors duration-500 font-bold mx-1"
              >
                tmrw 9 AM
              </motion.span>!"
            </div>

            <div className="h-12 flex items-center justify-center gap-4">
              <AnimatePresence>
                {step >= 1.8 && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-lg font-bold text-sm border border-rose-200 shadow-sm"
                    >
                      Task: Calculus mid-term
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-lg font-bold text-sm border border-orange-200 shadow-sm"
                    >
                      Time: Tomorrow 09:00 AM
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className={`flex justify-center transition-opacity duration-700 ${step >= 2 ? "opacity-100" : "opacity-0"}`}>
          <ChevronDown className="w-8 h-8 text-orange-300 animate-bounce" />
        </div>

        {/* Step 2: Scoring Engine */}
        <div className={`transition-opacity duration-700 ${step >= 2 ? "opacity-100" : "opacity-30"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shadow-sm border border-rose-200/50"><Calculator className="w-5 h-5"/></div>
            <h2 className="text-xl font-bold text-rose-950">Step 2: Scoring Engine</h2>
          </div>
          
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-rose-200/50 shadow-sm flex flex-col items-center">
            <div className="bg-slate-900 text-rose-100 font-mono text-sm px-6 py-3 rounded-xl mb-8 w-full max-w-md text-center border border-slate-800 shadow-inner">
              Priority Score = Importance / Time-to-Deadline
            </div>

            <div className="w-full max-w-md relative h-8 bg-orange-100/50 rounded-full overflow-hidden border border-orange-200/50">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: step >= 2.5 ? "95%" : "0%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-400 to-rose-500"
              />
            </div>
            
            <div className="h-16 mt-6 flex items-center justify-center">
              <AnimatePresence>
                {step >= 2.8 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-rose-500 text-white px-6 py-2 rounded-xl font-extrabold text-lg shadow-lg shadow-rose-500/30 tracking-wide border-2 border-white/20"
                  >
                    P0 - CRITICAL
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className={`flex justify-center transition-opacity duration-700 ${step >= 3 ? "opacity-100" : "opacity-0"}`}>
          <ChevronDown className="w-8 h-8 text-rose-300 animate-bounce" />
        </div>

        {/* Step 3: Conflict Resolution & Time-blocking */}
        <div className={`transition-opacity duration-700 ${step >= 3 ? "opacity-100" : "opacity-30"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shadow-sm border border-orange-200/50"><CalendarClock className="w-5 h-5"/></div>
            <h2 className="text-xl font-bold text-orange-950">Step 3: Conflict Resolution</h2>
          </div>
          
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-orange-200/50 shadow-sm">
            <div className="relative border-l-4 border-orange-200/60 ml-12 pl-6 space-y-4 max-w-lg mx-auto">
              
              {/* Timeline layout containing original and new slots */}
              <div className="relative h-[200px]">
                
                {/* 09:00 AM Label */}
                <div className="absolute -left-[94px] top-4 text-xs font-bold text-orange-400">09:00 AM</div>
                
                {/* 11:00 AM Label */}
                <AnimatePresence>
                  {step >= 3.5 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -left-[94px] top-[104px] text-xs font-bold text-orange-400"
                    >
                      11:00 AM
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Original Free Time (shifts down or disappears) */}
                <motion.div 
                  initial={{ top: 0 }}
                  animate={{ 
                    top: step >= 3.5 ? 100 : 0, 
                    opacity: step >= 3.5 ? 0.6 : 1,
                    scale: step >= 3.5 ? 0.95 : 1
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`absolute left-0 right-0 p-4 rounded-2xl border flex items-center gap-3 ${
                    step >= 3.5 ? "bg-slate-50 border-slate-200" : "bg-orange-50/80 border-orange-200 border-dashed"
                  }`}
                >
                  <div className={`w-1.5 h-8 rounded-full ${step >= 3.5 ? "bg-slate-300" : "bg-orange-300"}`}></div>
                  <div>
                    <h4 className={`font-bold text-sm ${step >= 3.5 ? "text-slate-500 line-through" : "text-orange-600"}`}>
                      {step >= 3.5 ? "Displaced: Free Time" : "Scheduled: Free Time"}
                    </h4>
                  </div>
                </motion.div>

                {/* New Incoming Task */}
                <AnimatePresence>
                  {step >= 3.5 && (
                    <motion.div 
                      initial={{ x: -100, opacity: 0, top: 0 }}
                      animate={{ x: 0, opacity: 1, top: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="absolute left-0 right-0 p-4 rounded-2xl border border-rose-200 bg-rose-50 shadow-lg shadow-rose-100/50 flex items-center gap-3 z-10"
                    >
                      <div className="w-1.5 h-8 bg-rose-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-rose-950">Calculus mid-term</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">P0 - Critical</span>
                          <span className="text-xs text-rose-700 font-semibold">Auto-inserted</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
