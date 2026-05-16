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
        桌面端：左侧侧边栏宽 64 (256px)，内容区加 ml-64
        手机端：顶部栏高 14 (56px)，底部导航高约 64px，内容区加对应 padding
      */}
      <main className="
        w-full min-h-screen flex flex-col relative
        pt-14 pb-20
        lg:pt-0 lg:pb-0 lg:ml-64
      ">
        {children}
      </main>
    </div>
  );
}
