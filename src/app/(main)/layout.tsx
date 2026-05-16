import { Sidebar } from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      {/* 
        The sidebar is 64 (16rem = 256px) wide and fixed. 
        We add a left margin to the main content area so it's not hidden behind the sidebar.
      */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
