"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const loginSchema = zod.object({
  email: zod.string().email("Format email tidak valid. Periksa kembali penulisan email Anda."),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/consent`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungkan ke Google Auth. Coba lagi.");
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/consent`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengirimkan Magic Link. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      {/* Floating physics-inspired decorative particles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-cobalt/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />

      {/* Main glass card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-border-default shadow-depth p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 rounded-xl bg-accent-cobalt flex items-center justify-center mb-3 shadow-lg"
          >
            <FlaskConical className="w-6 h-6 text-white animate-pulse" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-primary-navy">FisikaSeru</h2>
          <p className="text-sm text-text-muted mt-1 text-center">
            Pintu gerbang menuju rekonstruksi pemahaman konsep fisika mendalam.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!magicLinkSent ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Google login */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 border-border-default/80 hover:bg-gray-50/50 hover:border-accent-cobalt/30 transition-all font-display font-semibold text-sm cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.37 7.56l3.86 2.99c.96-2.87 3.66-4.51 6.77-4.51z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.84c2.25-2.07 3.59-5.12 3.59-8.66z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.23 10.55c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.37 7.56c-.88 1.76-1.37 3.75-1.37 5.8s.49 4.04 1.37 5.8l3.86-3.01z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.98c-1.07.72-2.45 1.15-4.09 1.15-3.11 0-5.81-1.64-6.77-4.51L1.37 16.7c2 3.88 5.98 6.3 10.63 6.3z"
                  />
                </svg>
                Masuk dengan Google
              </Button>

              {/* Separator */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-border-default/80 flex-1" />
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  atau gunakan email
                </span>
                <div className="h-px bg-border-default/80 flex-1" />
              </div>

              {/* Magic Link Email Form */}
              <form onSubmit={handleSubmit(handleMagicLinkLogin)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary" htmlFor="email-input">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      id="email-input"
                      type="email"
                      placeholder="nama@email.com"
                      disabled={isLoading}
                      {...register("email")}
                      className={cn(
                        "w-full h-11 pl-10 pr-4 rounded-xl border border-border-default bg-white/60 text-sm focus:outline-none focus:ring-2 transition-all font-body",
                        errors.email
                          ? "border-rose-400 focus:ring-rose-400/20"
                          : "focus:ring-accent-cobalt/20 focus:border-accent-cobalt"
                      )}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                  </div>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-rose-500 text-xs flex items-center gap-1.5 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.email.message}</span>
                    </motion.div>
                  )}
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-600 leading-normal">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer font-display font-semibold text-sm"
                >
                  {isLoading ? "Mengirim..." : "Kirim Magic Link"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="magic-link-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg text-primary-navy">Check Email Anda!</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                Tautan masuk ajaib (*Magic Link*) telah dikirimkan ke email Anda. 
                Klik tautan tersebut untuk masuk secara instan dan aman.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMagicLinkSent(false)}
                className="mt-2 text-xs font-semibold cursor-pointer border-border-default/60"
              >
                Ganti Email
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-border-default/80 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Sains • Pemahaman • Eureka
          </span>
        </div>
      </motion.div>
    </div>
  );
}
