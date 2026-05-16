"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";

export function WelcomeArea() {
  const [greeting, setGreeting] = useState("Good Morning");
  const { profile } = useProfile();
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17) setGreeting("Good Evening");
  }, []);

  const displayName = profile.nickname.trim() || "Freshman";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-8"
    >
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 mb-2 tracking-tight">
        {greeting}, {displayName}!
      </h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg text-orange-900/60 font-medium"
      >
        You have <span className="text-orange-600 font-bold">3 focused hours</span> today. Let's make them count.
      </motion.p>
    </motion.div>
  );
}
