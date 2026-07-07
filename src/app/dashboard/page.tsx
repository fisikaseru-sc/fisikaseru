"use client";
import Link from "next/link";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, CheckCircle2, ChevronRight, Zap, Info, 
  Play, RefreshCw, Send, Sparkles, BookOpen, Clock, 
  BarChart3, Database, Award, ArrowUpRight, Trash2, HelpCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";

// TypeScript types matching project structures
interface TrialData {
  id: number;
  r: number; // radius in microns
  V: number; // voltage in Volts
  tf: number; // fall time in seconds
  tr: number; // rise time in seconds
  q: number;  // charge in 10^-19 C
  n: number;  // estimated elementary charge multiplier
}

// Preset Q&As for the Socratic AI Tutor
const PRESET_ANSWERS: Record<string, string> = {
  "Bagaimana Sinar-X merubah muatan?": 
    "Sinar-X mengionisasi molekul udara di dalam chamber dengan cara melepaskan elektron dari molekul tersebut. Ketika tetes minyak melintas, ia dapat menangkap elektron bebas ini. Mengapa muatan tetes minyak selalu bertambah atau berkurang dalam kelipatan muatan elementer ($1.6 \\times 10^{-19}\\text{ C}$)? Apakah mungkin droplet menangkap setengah elektron?",
  
  "Apa fungsi gaya hambat Stokes?": 
    "Gaya hambat Stokes ($F_d = 6\\pi\\eta r v$) bertindak sebagai gaya gesek udara yang menahan laju droplet. Tanpa gaya hambat ini, droplet akan terus dipercepat ke bawah oleh gravitasi. Dengan adanya gesekan udara, droplet dengan cepat mencapai kecepatan terminal yang stabil. Mengapa mengukur kecepatan terminal jatuh bebas ($v_f$) ini krusial sebelum medan listrik dinyalakan?",
  
  "Bagaimana menentukan nilai e dari grafik?": 
    "Perhatikan grafik pencaran muatan Anda! Anda akan melihat titik-titik data mengelompok secara horizontal pada tingkat tertentu (sekitar $1.6$, $3.2$, $4.8$, atau $6.4 \\times 10^{-19}\\text{ C}$). Selisih atau Faktor Persekutuan Terbesar (FPB) dari kelompok-kelompok tersebut menunjukkan nilai muatan terkecil yang bisa ditransfer—yaitu muatan elementer elektron ($e$). Mengapa tidak ada droplet dengan muatan $2.5 \\times 10^{-19}\\text{ C}$?"
};

// Socratic custom responder helper
const getSocraticResponse = (msg: string) => {
  const query = msg.toLowerCase();
  if (query.includes("rumus") || query.includes("hitung") || query.includes("persamaan")) {
    return "Untuk menghitung muatan $q$, kita menyeimbangkan gaya listrik, gravitasi efektif, dan gaya hambat Stokes. Pada kecepatan naik terminal: $F_e = W_{\\text{eff}} + F_d$. Dari kesetimbangan ini diperoleh rumus: $q = \\frac{6\\pi\\eta r (v_f + v_r) d}{V}$. Bagaimana cara Anda menentukan jari-jari $r$ terlebih dahulu hanya dengan mengamati gerakan jatuh bebas droplet?";
  }
  if (query.includes("viskositas") || query.includes("stokes") || query.includes("gesek")) {
    return "Gaya Stokes menyatakan hambatan udara terhadap tetes minyak yang sangat kecil: $F_d = 6\\pi\\eta r v$. Karena massa droplet sangat kecil, ia mencapai kecepatan terminal hampir seketika. Mengapa viskositas udara ($\\eta$) dianggap konstan dalam perhitungan kita, dan apa dampaknya jika suhu di dalam chamber meningkat?";
  }
  if (query.includes("tegangan") || query.includes("volt") || query.includes("kapasitor")) {
    return "Tegangan listrik ($V$) menghasilkan medan listrik homogen $E = V/d$ di antara pelat kapasitor. Medan ini menarik droplet bermuatan negatif ke atas menentang gravitasi. Jika droplet melayang diam, apa hubungan antara gaya listrik ($F_e$) dan berat efektif droplet ($W_{\\text{eff}}$)?";
  }
  return "Pertanyaan yang sangat menarik! Mari kita renungkan: bagaimana perubahan jumlah muatan pada droplet memengaruhi waktu naik ($t_r$) droplet tersebut ketika tegangan pelat dijaga konstan? Apa hubungan matematis di antaranya?";
};

// Sample data for demonstration
const SAMPLE_TRIALS: TrialData[] = [
  { id: 1, r: 1.5, V: 320, tf: 8.52, tr: 12.45, q: 3.18, n: 2 },
  { id: 2, r: 1.8, V: 410, tf: 5.92, tr: 18.21, q: 4.83, n: 3 },
  { id: 3, r: 1.2, V: 280, tf: 13.31, tr: 7.84, q: 1.58, n: 1 },
  { id: 4, r: 2.0, V: 450, tf: 4.80, tr: 24.12, q: 6.42, n: 4 },
  { id: 5, r: 1.6, V: 350, tf: 7.48, tr: 14.50, q: 3.21, n: 2 },
  { id: 6, r: 2.2, V: 520, tf: 3.96, tr: 32.10, q: 7.98, n: 5 },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [trials, setTrials] = useState<TrialData[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { 
      sender: "ai", 
      text: "Halo peneliti muda! Saya AI Tutor pendamping lab Anda. Ada kesulitan memahami eksperimen Tetes Minyak Millikan atau ingin menanyakan tentang kuantisasi muatan elektron? Tanyakan saja!" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth guard: check session, redirect to login if not authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  // Prevent hydration mismatch (Next.js SSR safety)
  useEffect(() => {
    if (!authChecked) return;
    setMounted(true);
    const saved = localStorage.getItem("fisikaseru:trials:millikan");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTrials(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [authChecked]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { sender: "user" as const, text };
    setChatMessages((prev) => [...prev, userMsg]);
    
    // Simulate AI response delay
    setTimeout(() => {
      let aiText = "";
      if (PRESET_ANSWERS[text]) {
        aiText = PRESET_ANSWERS[text];
      } else {
        aiText = getSocraticResponse(text);
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
    }, 600);

    if (text === inputMessage) {
      setInputMessage("");
    }
  };

  const handleLoadSampleData = () => {
    localStorage.setItem("fisikaseru:trials:millikan", JSON.stringify(SAMPLE_TRIALS));
    setTrials(SAMPLE_TRIALS);
  };

  const handleClearData = () => {
    localStorage.removeItem("fisikaseru:trials:millikan");
    setTrials([]);
  };

  // Calculations for Millikan stats
  const validTrials = trials.filter((t) => t.n > 0 && t.q > 0);
  const estimatedE = validTrials.length > 0 
    ? (validTrials.reduce((sum, t) => sum + (t.q / t.n), 0) / validTrials.length).toFixed(3)
    : "0.000";
  
  const trueE = 1.602;
  const errorPct = validTrials.length > 0
    ? Math.abs(((parseFloat(estimatedE) - trueE) / trueE) * 100).toFixed(2)
    : "0.00";

  // Check overall lab completion metrics (simulated logic based on stored data)
  const hasMillikan = trials.length > 0;
  const progressPercent = hasMillikan ? 50 : 10;

  if (!authChecked || !mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-cobalt flex items-center justify-center shadow-depth mb-1">
            <FlaskConical className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-accent-cobalt border-t-transparent animate-spin" />
          <span className="text-xs text-text-muted font-mono">
            {!authChecked ? "Memverifikasi sesi..." : "Memuat Dashboard Laboratorium..."}
          </span>
        </div>
      </div>
    );
  }

  // Process data format for Recharts Scatter plot
  const chartData = trials.map((t) => ({
    trial: `Drop ${t.id}`,
    charge: parseFloat(t.q.toFixed(2)),
    n: t.n,
    radius: t.r.toFixed(2),
    voltage: t.V,
  }));

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden font-body">
      {/* Background glow effects for futuristic visual aesthetics */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent-cobalt/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-blue/5 filter blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-24 pb-12">
        
        {/* Dashboard Welcome Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-text-primary font-medium">Overview Lab</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-primary-navy tracking-tight">
              Ruang Kendali Laboratorium 🎛️
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Pantau progress eksperimen fisika Anda, analisis data mentah, dan berdiskusi dengan AI Tutor.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-border-default/60 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-accent-cobalt/5 flex items-center justify-center text-accent-cobalt">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-text-muted font-mono uppercase font-semibold">Tingkat Kemahiran</div>
              <div className="text-sm font-bold text-primary-navy flex items-center gap-1.5">
                Pemula Sains <Badge className="bg-success text-white text-[9px] px-1.5 py-0.5">Aktif</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Global Progress Bar */}
        <section className="bg-white rounded-2xl border border-border-default/60 p-5 mb-8 shadow-card relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
            <div>
              <h2 className="font-display font-bold text-base text-primary-navy">
                Kemajuan Kurikulum Eksperimen
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Selesaikan 6 eksperimen wajib untuk menguasai konsep fisika dasar dan modern.
              </p>
            </div>
            <div className="text-sm font-semibold text-accent-cobalt font-mono bg-accent-cobalt/5 px-3 py-1 rounded-lg">
              {progressPercent}% Selesai
            </div>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent-cobalt to-sky-blue rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-success bg-success/5 border border-success/10 px-2 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">Tetes Millikan</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-slate-50 border border-border-default/50 px-2 py-1.5 rounded-lg">
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400" />
              <span>Bandul Sederhana</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-slate-50 border border-border-default/50 px-2 py-1.5 rounded-lg opacity-70">
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400" />
              <span>Hukum Ohm</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-slate-50 border border-border-default/50 px-2 py-1.5 rounded-lg opacity-50">
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400 animate-pulse-soft" />
              <span>Hukum Boyle</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-slate-50 border border-border-default/50 px-2 py-1.5 rounded-lg opacity-50">
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400" />
              <span>Snellius</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-slate-50 border border-border-default/50 px-2 py-1.5 rounded-lg opacity-50">
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400" />
              <span>Jatuh Bebas</span>
            </div>
          </div>
        </section>

        {/* Dashboard Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT COLUMN: Active Millikan Focus (3/5 width on desktop) */}
          <section className="lg:col-span-3 space-y-8">

            {/* Millikan Active Focus Box */}
            <div className="bg-white rounded-3xl border border-border-default/60 shadow-card overflow-hidden relative">
              {/* Header Accent Line */}
              <div className="h-2 bg-gradient-to-r from-accent-cobalt via-sky-blue to-teal" />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-accent-cobalt flex items-center justify-center text-white">
                      <FlaskConical className="w-5 h-5 animate-float-gentle" />
                    </div>
                    <div>
                      <Badge className="bg-accent-cobalt/5 text-accent-cobalt font-mono border-accent-cobalt/10 text-[9px] mb-0.5">
                        MODUL UTAMA FISIKA MODERN
                      </Badge>
                      <h2 className="font-display font-extrabold text-lg text-primary-navy">
                        Eksperimen Tetes Minyak Millikan
                      </h2>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-accent-cobalt/20 text-accent-cobalt">
                    Fokus Belajar
                  </Badge>
                </div>

                <p className="text-xs text-text-muted leading-relaxed mb-6 font-body">
                  Modul ini memandu Anda mengulang penemuan Robert Millikan pada tahun 1909 untuk membuktikan bahwa muatan listrik terkecil bersifat terkuantisasi (hanya dalam kelipatan bilangan bulat elektron $e$).
                </p>

                {/* Analytical Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/50 text-center">
                    <span className="text-[9px] text-text-muted font-mono block uppercase">Data Tercatat</span>
                    <span className="font-mono text-lg font-extrabold text-primary-navy mt-1 block">
                      {trials.length} <span className="text-xs text-text-muted font-normal font-sans">droplet</span>
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/50 text-center">
                    <span className="text-[9px] text-text-muted font-mono block uppercase">Estimasi $e$</span>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-accent-cobalt mt-1 block">
                      {estimatedE}×10⁻¹⁹ C
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/50 text-center">
                    <span className="text-[9px] text-text-muted font-mono block uppercase">Galat Eksperimen</span>
                    <span className={cn(
                      "font-mono text-lg font-extrabold mt-1 block",
                      validTrials.length === 0 ? "text-text-muted" : parseFloat(errorPct) < 3.0 ? "text-success" : "text-amber-500"
                    )}>
                      {validTrials.length === 0 ? "-" : `${errorPct}%`}
                    </span>
                  </div>
                </div>

                {/* Charge Quantization Scatter Chart */}
                <div className="border border-border-default/50 rounded-2xl p-4 mb-6 bg-slate-950/5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-accent-cobalt" />
                        Bagan Kuantisasi Muatan Listrik $q$
                      </h3>
                      <p className="text-[10px] text-text-muted">
                        Muatan droplet terdistribusi pada kelipatan 1.6 × 10⁻¹⁹ C (1e, 2e, 3e dst).
                      </p>
                    </div>
                    {trials.length > 0 && (
                      <button 
                        onClick={handleClearData}
                        className="flex items-center text-[10px] text-danger hover:underline gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Data
                      </button>
                    )}
                  </div>

                  <div className="h-[220px] w-full text-[9px] font-mono">
                    {trials.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border-default rounded-xl bg-white/70">
                        <Info className="w-8 h-8 text-text-muted/40 mb-2" />
                        <span className="text-xs font-semibold text-text-primary">Belum Ada Data Eksperimen</span>
                        <p className="text-[10px] text-text-muted max-w-xs mt-1">
                          Masuk ke simulator lab dan catat data tetes minyak, atau klik tombol di bawah untuk menyimulasikan data contoh.
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={handleLoadSampleData} className="text-[10px] py-1 cursor-pointer">
                            <RefreshCw className="w-3 h-3 mr-1" /> Simulasi Data Sampel
                          </Button>
                          <Link href="/modules/millikan/experiment">
                            <Button size="sm" variant="outline" className="text-[10px] py-1 cursor-pointer bg-white">
                              Masuk Lab <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 30, bottom: 5, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                          <XAxis 
                            dataKey="trial" 
                            name="Droplet" 
                            stroke="#94A3B8" 
                            tickLine={false} 
                          />
                          <YAxis 
                            dataKey="charge" 
                            name="Muatan (×10⁻¹⁹ C)" 
                            domain={[0, 9]} 
                            stroke="#94A3B8" 
                            tickLine={false}
                            label={{ value: 'Muatan q (10⁻¹⁹ C)', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#475569', fontSize: 9 } }}
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-[9px] shadow-depth font-mono">
                                    <div className="font-bold text-accent-cobalt mb-1">{data.trial}</div>
                                    <div>Radius (r): <span className="text-yellow-400">{data.radius} µm</span></div>
                                    <div>Tegangan (V): <span className="text-yellow-400">{data.voltage} V</span></div>
                                    <div className="border-t border-slate-700/50 mt-1 pt-1 font-bold">
                                      Muatan Terukur: <span className="text-cyan-400">{data.charge} × 10⁻¹⁹ C</span>
                                    </div>
                                    <div>Kelipatan Teoretis (n): <span className="text-cyan-400">{data.n}e</span></div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {/* Ideal Quantization Reference Lines */}
                          <ReferenceLine y={1.602} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 4" label={{ value: '1e', fill: '#10B981', position: 'right', fontSize: 8 }} />
                          <ReferenceLine y={3.204} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 4" label={{ value: '2e', fill: '#10B981', position: 'right', fontSize: 8 }} />
                          <ReferenceLine y={4.806} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 4" label={{ value: '3e', fill: '#10B981', position: 'right', fontSize: 8 }} />
                          <ReferenceLine y={6.408} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 4" label={{ value: '4e', fill: '#10B981', position: 'right', fontSize: 8 }} />
                          <ReferenceLine y={8.010} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 4" label={{ value: '5e', fill: '#10B981', position: 'right', fontSize: 8 }} />
                          
                          <Scatter name="Muatan Droplet" data={chartData} fill="#1B4FD8" line={false} shape="circle" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Forces Diagram Visualizer Panel */}
                <div className="bg-slate-50 border border-border-default/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center mb-6">
                  {/* Visual Drop with Arrows */}
                  <div className="w-[120px] h-[120px] bg-slate-900 border border-slate-800 rounded-xl relative flex items-center justify-center overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 opacity-10 flex flex-col justify-between p-1 font-mono text-[6px] text-white pointer-events-none">
                      <div className="border-b border-white w-full text-center">PELAT ATAS (+)</div>
                      <div className="border-t border-white w-full text-center">PELAT BAWAH (-)</div>
                    </div>
                    {/* Droplet representation */}
                    <div className="w-5 h-5 rounded-full bg-cyan-400 border border-white z-10 flex items-center justify-center shadow-depth animate-float-gentle">
                      <span className="text-[8px] text-slate-950 font-bold font-mono">-q</span>
                    </div>
                    {/* Upwards Force Arrow: Fe */}
                    <div className="absolute top-[18px] flex flex-col items-center">
                      <div className="w-0.5 h-[28px] bg-cyan-400" />
                      <div className="w-0.5 h-0.5 border-t-[4px] border-t-cyan-400 border-x-[3px] border-x-transparent transform rotate-180" />
                      <span className="text-[7px] text-cyan-400 font-bold font-mono mt-0.5">Fe (Listrik)</span>
                    </div>
                    {/* Downwards Force Arrow: Fg + Fd */}
                    <div className="absolute bottom-[14px] flex flex-col items-center">
                      <span className="text-[7px] text-red-400 font-bold font-mono mb-0.5">W_eff + Fd</span>
                      <div className="w-0.5 h-0.5 border-t-[4px] border-t-red-400 border-x-[3px] border-x-transparent" />
                      <div className="w-0.5 h-[28px] bg-red-400" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-xs text-primary-navy mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Keseimbangan Tiga Gaya Utama
                    </h4>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Droplet bermuatan negatif ditarik ke atas oleh medan listrik pelat (<b className="text-cyan-600">Gaya Listrik, Fe</b>), ditarik ke bawah oleh gravitasi bumi (<b className="text-red-600">Gaya Berat Efektif, W_eff</b>), dan dihambat oleh gesekan udara (<b className="text-yellow-600">Gaya Stokes, Fd</b>). Ketika droplet melayang atau bergerak konstan, total gaya ini bernilai nol.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/modules/millikan/experiment" className="flex-1">
                    <Button className="w-full h-11 text-sm font-semibold cursor-pointer">
                      <Play className="w-4 h-4 mr-2" /> Masuk Simulasi Eksperimen
                    </Button>
                  </Link>
                  
                  <Link href="/modules/millikan/analysis" className="flex-1">
                    <Button variant="outline" className="w-full h-11 text-sm font-semibold cursor-pointer bg-white border-border-default" disabled={trials.length < 3}>
                      Lanjut ke Analisis Data <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                {trials.length < 3 && trials.length > 0 && (
                  <p className="text-[10px] text-text-muted text-center mt-2">
                    * Catat minimal 3 droplet di lab untuk mengaktifkan halaman Analisis Data.
                  </p>
                )}
              </div>
            </div>

          </section>

          {/* RIGHT COLUMN: AI Tutor & Other Modules (2/5 width on desktop) */}
          <section className="lg:col-span-2 space-y-8">

            {/* AI Tutor Chat Widget */}
            <div className="bg-white rounded-3xl border border-border-default/60 shadow-card overflow-hidden flex flex-col h-[480px]">
              {/* Header */}
              <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-cobalt flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs">AI Tutor Sokratis</h3>
                    <div className="text-[9px] text-accent-cobalt-light font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Pendamping Lab Aktif
                    </div>
                  </div>
                </div>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed",
                      msg.sender === "ai" 
                        ? "bg-white border border-border-default/80 text-text-primary mr-auto rounded-tl-none shadow-sm"
                        : "bg-accent-cobalt text-white ml-auto rounded-tr-none"
                    )}
                  >
                    <span className="font-mono text-[8px] opacity-60 mb-1 font-semibold uppercase">
                      {msg.sender === "ai" ? "FisikaSeru AI" : "Anda"}
                    </span>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div className="p-3 bg-white border-t border-border-default/50 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-thin">
                {Object.keys(PRESET_ANSWERS).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="px-2.5 py-1.5 rounded-lg border border-border-default hover:border-accent-cobalt/35 text-[10px] text-text-muted hover:text-accent-cobalt bg-slate-50 hover:bg-accent-cobalt/5 transition-all cursor-pointer font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="p-3 bg-white border-t border-border-default flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Tanyakan fisika Millikan di sini..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 h-9 px-3 border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt"
                />
                <button 
                  type="submit"
                  className="w-9 h-9 bg-accent-cobalt hover:bg-accent-cobalt-light text-white rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Other Labs / Modules List */}
            <div className="bg-white rounded-3xl border border-border-default/60 shadow-card p-5">
              <h3 className="font-display font-bold text-xs text-primary-navy mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-text-muted" />
                Modul Eksperimen Lainnya
              </h3>

              <div className="space-y-3">
                {/* Pendulum */}
                <Link 
                  href="/modules/bandul/experiment" 
                  className="flex items-center justify-between p-3 rounded-xl border border-border-default/60 hover:border-accent-cobalt/20 bg-slate-50/30 hover:bg-accent-cobalt/[0.01] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-blue/10 flex items-center justify-center text-sky-blue">
                      <span>⚖️</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-navy group-hover:text-accent-cobalt transition-colors">
                        Gerak Harmonik Bandul
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-text-muted mt-0.5">
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 25 mnt</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><BarChart3 className="w-2.5 h-2.5" /> Lv.2</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-cobalt group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Ohm */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border-default/40 bg-slate-50/20 opacity-80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                      <span>🔌</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-navy">Hukum Ohm</div>
                      <div className="flex items-center gap-2 text-[9px] text-text-muted mt-0.5">
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 20 mnt</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><BarChart3 className="w-2.5 h-2.5" /> Lv.2</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-yellow-200 bg-yellow-50 text-yellow-600">
                    Segera
                  </Badge>
                </div>

                {/* Snellius */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border-default/40 bg-slate-50/20 opacity-80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                      <span>🔦</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-navy">Pembiasan Snellius</div>
                      <div className="flex items-center gap-2 text-[9px] text-text-muted mt-0.5">
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 25 mnt</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><BarChart3 className="w-2.5 h-2.5" /> Lv.3</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-teal-200 bg-teal-50 text-teal">
                    Segera
                  </Badge>
                </div>
              </div>
            </div>

          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
