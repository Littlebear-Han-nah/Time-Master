"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, Loader2, BookOpen, Layers } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

export default function LoginPage() {
  const router = useRouter();
  const { updateProfile } = useProfile();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleAuth = (e: React.FormEvent, isSSO: boolean = false) => {
    e.preventDefault();
    if (!username && !isSSO) return;
    
    setIsLoading(true);
    setLoadingText(isLogin ? "Authenticating..." : "Creating Account...");

    // Simulate 1.5s authentication & syllabus fetching
    setTimeout(() => {
      setLoadingText("Fetching Syllabus & Events...");
      
      setTimeout(() => {
        // Save mock user data
        updateProfile({ 
          nickname: isSSO ? "XJTLU Scholar" : username.split("@")[0] || "Freshman",
          major: "Computer Science"
        });
        
        // Redirect to Dashboard
        router.push("/dashboard");
      }, 800);

    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex bg-orange-50 font-sans overflow-hidden">
      
      {/* Left Column: Branding (Hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 relative overflow-hidden">
        
        {/* Abstract background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none">UniFlow</h2>
            <p className="text-orange-100/80 text-xs font-semibold tracking-wider uppercase mt-1">Your Virtual Co-founder</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 max-w-lg">
            Turn campus chaos into perfect clarity.
          </h1>
          <p className="text-orange-100/80 text-lg font-medium max-w-md">
            Seamlessly sync your modules, deadlines, and social life into one intelligent AI time-blocker.
          </p>
        </motion.div>

        <div className="relative z-10">
          <p className="text-orange-200/60 font-medium text-sm">© 2026 UniFlow Inc.</p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Subtle background glow for mobile */}
        <div className="absolute lg:hidden top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-200/50 to-transparent pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-white/60 shadow-2xl shadow-orange-900/5 bg-white/70 backdrop-blur-xl relative z-10"
        >
          <div className="mb-8 text-center">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={isLogin ? "login-title" : "signup-title"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-extrabold text-orange-950 mb-2 tracking-tight"
              >
                {isLogin ? "Sign In" : "Create an Account"}
              </motion.h2>
            </AnimatePresence>
            <p className="text-orange-900/60 text-sm font-semibold">Enter your details to access your AI assistant.</p>
          </div>

          <form onSubmit={(e) => handleAuth(e, false)} className="flex flex-col gap-5">
            
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-orange-950 uppercase tracking-wider pl-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-white/80 border border-orange-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-orange-950 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-orange-950 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/80 border border-orange-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-orange-950 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <button type="button" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">Forgot Password?</button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2 group overflow-hidden relative"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></span>
              
              {isLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                  <span className="text-sm">{loadingText}</span>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isLogin ? "btn-signin" : "btn-signup"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </AnimatePresence>
              )}
            </button>

            {/* Toggle Login/Signup */}
            <div className="text-center mt-1">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="text-sm font-semibold text-orange-950/60 hover:text-orange-600 transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-orange-600">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-orange-600">Sign in</span></>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-orange-200"></div>
              <span className="flex-shrink-0 mx-4 text-orange-900/40 text-xs font-bold uppercase">or</span>
              <div className="flex-grow border-t border-orange-200"></div>
            </div>

            {/* XJTLU E-Bridge SSO Button */}
            <button 
              type="button"
              onClick={(e) => handleAuth(e, true)}
              disabled={isLoading}
              className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold py-3.5 rounded-2xl shadow-sm transition-all flex justify-center items-center gap-3 group"
            >
              <ShieldCheck className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Sign in with XJTLU E-Bridge</span>
            </button>

          </form>
        </motion.div>
      </div>

    </div>
  );
}
