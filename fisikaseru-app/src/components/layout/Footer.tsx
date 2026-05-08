"use client";

import { FlaskConical, Globe, MessageCircle, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Katalog Modul", href: "/modules" },
    { label: "AI Tutor", href: "#ai-tutor" },
    { label: "Harga", href: "#pricing" },
    { label: "Untuk Guru", href: "/classroom" },
  ],
  Sumber: [
    { label: "Dokumentasi", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "Panduan Mulai", href: "/getting-started" },
    { label: "Changelog", href: "/changelog" },
  ],
  Legal: [
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Syarat Penggunaan", href: "/terms" },
    { label: "Kepatuhan UU PDP", href: "/pdp" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary-navy text-white/80" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent-cobalt flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                FisikaSeru<span className="text-sky-blue ml-0.5 text-sm">3.0</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Platform eksperimen fisika mendalam untuk membangun pemahaman konsep yang sesungguhnya.
            </p>
            <div className="flex items-center gap-3">
              {[MessageCircle, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label={Icon.displayName || "social link"}
                >
                  <Icon className="w-4 h-4 text-white/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-semibold text-sm text-white mb-4 tracking-wide">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FisikaSeru. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-white/40">
            Dibuat dengan ❤️ untuk pendidikan fisika Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
