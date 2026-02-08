import Link from "next/link";

import { LogoMark } from "@/components/icons/LogoMark";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/labs", label: "Labs" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/app", label: "App" },
];

export function TopNav() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <div>
            <div className="text-sm font-bold">FisikaSeru</div>
            <div className="text-xs text-slate-500">Virtual Physics Lab</div>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
