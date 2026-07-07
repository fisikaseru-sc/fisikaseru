import { AppNav } from "@/components/layout/AppNav";
import { TopNav } from "@/components/layout/TopNav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="py-6">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <AppNav />
          <section>{children}</section>
        </div>
      </main>
    </div>
  );
}
