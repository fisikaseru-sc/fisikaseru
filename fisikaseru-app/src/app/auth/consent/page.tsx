"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear(); // 2026

const consentSchema = zod.object({
  birthYear: zod
    .number()
    .min(1900, "Tahun lahir tidak valid.")
    .max(currentYear, "Tahun lahir tidak bisa melebihi tahun sekarang."),
  acceptTerms: zod
    .boolean()
    .refine((val) => val === true, {
      message: "Anda wajib menyetujui Kebijakan Data UU PDP untuk lanjut.",
    }),
});

type ConsentFormValues = zod.infer<typeof consentSchema>;

export default function ConsentPage() {
  const [step, setStep] = useState<"evaluate" | "parent-email" | "parent-sent" | "success">("evaluate");
  const [isMinor, setIsMinor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
  });

  const onSubmitConsent = (data: ConsentFormValues) => {
    setIsLoading(true);
    const age = currentYear - data.birthYear;
    
    if (age < 13) {
      setIsMinor(true);
      setStep("parent-email");
      setIsLoading(false);
    } else {
      setIsMinor(false);
      // Persist consent to local storage for offline MVP reference
      const consentObj = {
        consent_at: new Date().toISOString(),
        consent_version: "v1.0",
        birth_year: data.birthYear,
        is_minor: false,
      };
      localStorage.setItem("fisikaseru:consent", JSON.stringify(consentObj));
      setStep("success");
      setIsLoading(false);
    }
  };

  const handleParentEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      setErrorMsg("Format email orang tua tidak valid. Coba lagi.");
      setIsLoading(false);
      return;
    }

    // Persist parent verifier details to local storage
    const consentObj = {
      consent_at: new Date().toISOString(),
      consent_version: "v1.0",
      birth_year: 2015, // under 13 example
      is_minor: true,
      parent_email: parentEmail,
      parent_verified: false,
    };
    localStorage.setItem("fisikaseru:parent_consent", JSON.stringify(consentObj));
    setStep("parent-sent");
    setIsLoading(false);
  };

  const completeConsent = () => {
    window.location.href = "/modules";
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-cobalt/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-border-default shadow-depth p-8 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-3 border border-teal/20">
            <ShieldCheck className="w-6 h-6 text-teal" />
          </div>
          <h2 className="font-display text-xl font-bold text-primary-navy">Kepatuhan Data & UU PDP</h2>
          <p className="text-xs text-text-muted mt-1 text-center leading-relaxed">
            FisikaSeru berkomitmen melindungi data pribadi minor dan mematuhi regulasi perlindungan data Indonesia.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Age Evaluation & General Consent */}
          {step === "evaluate" && (
            <motion.form
              key="evaluate-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmitConsent)}
              className="space-y-5"
            >
              {/* Year of birth input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block" htmlFor="birth-year-input">
                  Tahun Lahir Anda
                </label>
                <input
                  id="birth-year-input"
                  type="number"
                  placeholder="Contoh: 2008"
                  disabled={isLoading}
                  onChange={(e) => setValue("birthYear", parseInt(e.target.value))}
                  className={cn(
                    "w-full h-11 px-4 rounded-xl border border-border-default bg-white/60 text-sm focus:outline-none focus:ring-2 transition-all font-mono",
                    errors.birthYear ? "border-rose-400 focus:ring-rose-400/20" : "focus:ring-accent-cobalt/20 focus:border-accent-cobalt"
                  )}
                  aria-invalid={errors.birthYear ? "true" : "false"}
                />
                {errors.birthYear && (
                  <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.birthYear.message}</span>
                  </p>
                )}
              </div>

              {/* UU PDP Consent box */}
              <div className="p-4 bg-gray-50 border border-border-default/80 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="accept-terms-checkbox"
                    {...register("acceptTerms")}
                    className="w-4 h-4 mt-0.5 rounded border-border-default text-accent-cobalt focus:ring-accent-cobalt/20 cursor-pointer"
                  />
                  <label htmlFor="accept-terms-checkbox" className="text-xs text-text-primary leading-normal cursor-pointer select-none">
                    Saya menyetujui penyimpanan alamat email, catatan data trial simulasi, dan analisis kognitif saya untuk keperluan laporan belajar pribadi.
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.acceptTerms.message}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 cursor-pointer font-display font-semibold text-sm"
              >
                {isLoading ? "Memproses..." : "Konfirmasi & Lanjut"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.form>
          )}

          {/* Step 2: Parent Verification Required (<13) */}
          {step === "parent-email" && (
            <motion.form
              key="parent-email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleParentEmailSubmit}
              className="space-y-5"
            >
              <div className="bg-amber/5 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-display font-semibold text-primary-navy">Verifikasi Orang Tua Wajib</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-1">
                    Berdasarkan UU PDP, pengguna berusia di bawah 13 tahun membutuhkan persetujuan wali/orang tua untuk menggunakan layanan ini.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block" htmlFor="parent-email-input">
                  Alamat Email Orang Tua / Wali
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="parent-email-input"
                    type="email"
                    placeholder="email.orangtua@wali.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-default bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt transition-all font-body"
                    required
                  />
                </div>
                {errorMsg && (
                  <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 cursor-pointer font-display font-semibold text-sm"
              >
                Kirim Tautan Verifikasi
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.form>
          )}

          {/* Step 3: Parent Verification Email Sent */}
          {step === "parent-sent" && (
            <motion.div
              key="parent-sent-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-2 border border-amber/20">
                <Mail className="w-8 h-8 text-amber" />
              </div>
              <h3 className="font-display font-bold text-lg text-primary-navy">Verifikasi Terkirim!</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                Tautan persetujuan kognitif sains telah dikirimkan ke email orang tua Anda: <strong className="text-text-primary">{parentEmail}</strong>.
              </p>
              <div className="bg-gray-50 border border-border-default/60 rounded-xl p-3.5 text-[11px] text-text-muted leading-relaxed max-w-xs mx-auto">
                *Minta orang tua Anda untuk mengklik tautan verifikasi agar Anda bisa mulai ber-eksperimen sains.*
              </div>
              <Button
                size="lg"
                onClick={completeConsent}
                className="w-full mt-2 cursor-pointer font-display font-semibold text-sm"
              >
                Lanjut ke Katalog (Read-Only Mode)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 4: Direct Consent Success (>= 13) */}
          {step === "success" && (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2 border border-success/20">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg text-primary-navy">Consent Ter-verifikasi!</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                Profil Anda telah mematuhi protokol kepatuhan data nasional. Anda memiliki akses penuh ke seluruh katalog simulasi.
              </p>
              <Button
                size="lg"
                onClick={completeConsent}
                className="w-full mt-2 cursor-pointer font-display font-semibold text-sm"
              >
                Mulai Eksperimen Sains
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
