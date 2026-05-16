"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, UserCircle, BookOpen, Save, CheckCircle2, Building2, Database, Link as LinkIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { profile, updateProfile } = useProfile();
  
  // Local state for the form
  const [nickname, setNickname] = useState("");
  const [major, setMajor] = useState("");
  const [university, setUniversity] = useState("Xi'an Jiaotong-Liverpool University (XJTLU)");
  const [lmsConnected, setLmsConnected] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Hydrate local state from context when mounted or context changes
  useEffect(() => {
    setNickname(profile.nickname);
    setMajor(profile.major);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    setIsSaved(false);
    
    // Fake delay to show saving animation
    setTimeout(() => {
      updateProfile({ nickname, major });
      setIsSaving(false);
      setIsSaved(true);
      
      // Reset saved state after a few seconds
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
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
              Personal Profile
            </h1>
            <p className="text-orange-900/60 font-medium text-sm mt-1">
              Customize your Virtual Co-founder experience.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Main Settings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-orange-200/50 shadow-sm flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-orange-300 to-rose-300 opacity-20 pointer-events-none" />

          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center mb-8 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 border-4 border-white shadow-md flex items-center justify-center text-orange-400">
              <UserCircle className="w-14 h-14" strokeWidth={1.5} />
            </div>
            <button className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100/50 px-3 py-1 rounded-full transition-colors">
              Change Avatar
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6 relative z-10">
            
            {/* Nickname Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-orange-950 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Alex"
                className="bg-white/70 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-orange-300 text-orange-900"
              />
            </div>

            {/* Major Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-orange-950 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                Major / Program
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science"
                className="bg-white/70 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-orange-300 text-orange-900"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`relative overflow-hidden group px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 min-w-[140px] justify-center ${
                  isSaved 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" 
                    : "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-orange-200"
                }`}
              >
                {!isSaved && <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>}
                
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>

        {/* Data Integrations Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8 border border-orange-200/50 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-orange-100 pb-4">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shadow-sm"><Database className="w-5 h-5"/></div>
            <div>
              <h2 className="text-xl font-bold text-orange-950">Data Integrations</h2>
              <p className="text-xs text-orange-700/60 font-semibold mt-1">Hyper-local sync powered by API</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-orange-950 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                University
              </label>
              <select 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="bg-white/70 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-3 text-sm outline-none transition-all text-orange-900 font-semibold"
              >
                <option value="Xi'an Jiaotong-Liverpool University (XJTLU)">Xi'an Jiaotong-Liverpool University (XJTLU)</option>
                <option value="Duke Kunshan University (DKU)">Duke Kunshan University (DKU)</option>
                <option value="NYU Shanghai">NYU Shanghai</option>
              </select>
            </div>

            <div className="mt-2 bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-4">
              <p className="text-xs font-semibold text-orange-800 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                When connected, AI securely fetches your modules, deadlines, and campus events via API.
              </p>
              
              {/* E-Bridge (Connected) */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">E-Bridge / Student Record</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-0.5">Connected</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Manage</button>
              </div>

              {/* Learning Mall (Toggle) */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-orange-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${lmsConnected ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {lmsConnected ? <CheckCircle2 className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Learning Mall / LMS</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${lmsConnected ? "text-emerald-600" : "text-slate-400"}`}>
                      {lmsConnected ? "Connected" : "Disconnected"}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Button */}
                <button 
                  type="button"
                  onClick={() => setLmsConnected(!lmsConnected)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${lmsConnected ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lmsConnected ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
