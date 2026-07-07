import { TopNav } from "@/components/layout/TopNav";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="py-8">{children}</main>
      <footer className="mt-10 border-t border-slate-200 bg-white/80">
        <div className="mx-auto w-[min(1120px,92vw)] py-4 text-sm text-slate-500">
          FisikaSeru © {new Date().getFullYear()} — Millikan Lab Demo
        </div>
      </footer>
    </div>
  );
}
