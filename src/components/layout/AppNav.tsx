import Link from "next/link";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/labs", label: "Labs" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  return (
    <aside className="panel h-fit p-4">
      <div className="mb-3 text-sm font-semibold text-slate-600">Workspace</div>
      <div className="flex gap-2 md:flex-col">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
