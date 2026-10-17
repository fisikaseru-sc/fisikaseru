"use client";
import Link from "next/link";

import React, { useState, useEffect } from "react";
import { FlaskConical, ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Katalog Modul", href: "/modules" },
  { label: "Fitur", href: "/#features" },
  { label: "AI Tutor", href: "/#ai-tutor" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-border-default shadow-sm"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Navigasi utama"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="FisikaSeru — Beranda">
          <div className="w-9 h-9 rounded-xl bg-accent-cobalt flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <FlaskConical className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-display font-bold text-lg text-primary-navy tracking-tight">
            FisikaSeru
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary-navy transition-colors rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-accent-cobalt"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" aria-label="Masuk ke akun FisikaSeru">
            <Button variant="ghost" size="sm">Masuk</Button>
          </Link>
          <Link href="/modules" aria-label="Mulai gratis — buka katalog modul">
            <Button size="sm">
              Mulai Gratis <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu — Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display font-bold text-primary-navy">
                <span className="w-7 h-7 rounded-lg bg-accent-cobalt flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-white" aria-hidden="true" />
                </span>
                FisikaSeru
              </SheetTitle>
              <SheetDescription className="sr-only">
                Menu navigasi utama FisikaSeru
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4" aria-label="Navigasi seluler">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-text-muted hover:text-primary-navy rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-accent-cobalt"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 p-4">
              <Badge variant="teal" size="sm" className="self-start mb-1">
                Gratis untuk fitur inti
              </Badge>
              <SheetClose asChild>
                <Link href="/auth/login" className="w-full" aria-label="Masuk ke akun">
                  <Button variant="outline" size="md" className="w-full">Masuk</Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/modules" className="w-full" aria-label="Mulai gratis">
                  <Button size="md" className="w-full">
                    Mulai Gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
