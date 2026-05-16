import { WelcomeArea } from "@/components/WelcomeArea";
import { FocusRing } from "@/components/FocusRing";
import { DynamicSchedule } from "@/components/DynamicSchedule";
import { SmartNudge } from "@/components/SmartNudge";
import Link from "next/link";
import { CalendarDays, Cpu, Settings, LineChart } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col">
      <WelcomeArea />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 mt-6">
        
        {/* Left Column - Focus & Nudges */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Focus Ring Card */}
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-6 w-full text-left">Daily Progress</h3>
            <FocusRing progress={75} size={200} strokeWidth={18} />
            <p className="text-center text-sm text-slate-500 mt-6 font-medium">
              Keep it up! You're on track to finish your goals before 6 PM.
            </p>
          </div>

          {/* Smart Nudges Card */}
          <div className="flex flex-col gap-4">
            <SmartNudge 
              type="alert"
              message="You have a SAT102 presentation in 2 days. AI has allocated a 2-hour block tonight for rehearsal."
              delay={0.6}
            />
            <SmartNudge 
              type="info"
              message="Learning Mall Core is currently quiet (Low Capacity). I've shifted your heavy reading there at 9 AM tomorrow."
              delay={0.8}
            />
          </div>
          
        </div>

        {/* Right Column - Schedule */}
        <div className="md:col-span-8 flex flex-col h-[600px] md:h-auto">
          <DynamicSchedule />
        </div>

      </div>
    </main>
  );
}
