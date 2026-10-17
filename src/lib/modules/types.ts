/**
 * Kontrak modul FisikaSeru — kontrak typed untuk semua modul eksperimen.
 *
 * Setiap modul (bandul, millikan, parabola, ...) mendaftarkan satu
 * `ModuleConfig` melalui `src/lib/modules/index.ts`. Kontrak ini memisahkan
 * metadata (untuk katalog), spesifikasi variabel simulasi (untuk lab), dan
 * pertanyaan refleksi (untuk loop sokratis PREDICT → EXPERIMENT → ANALYZE →
 * REFLECT), sehingga modul baru cukup menyediakan config + views tanpa
 * menyentuh routing.
 */

/** Jenjang pendidikan target modul. */
export type ModuleLevel = "smp" | "sma" | "kuliah";

/** Status ketersediaan modul di katalog. */
export type ModuleStatus = "active" | "coming" | "pro";

/** Metadata modul untuk katalog, dashboard, dan header halaman. */
export interface ModuleMeta {
  /** Slug unik — juga dipakai sebagai segmen URL `/modules/[moduleSlug]`. */
  slug: string;
  /** Judul modul dalam Bahasa Indonesia. */
  title: string;
  /** Deskripsi singkat konsep fisika yang dieksplorasi. */
  description: string;
  /** Jenjang minimum yang cocok. */
  level: ModuleLevel;
  /** Estimasi durasi pengerjaan (menit). */
  estimatedMinutes: number;
  /** Status rilis modul. */
  status: ModuleStatus;
  /** Warna aksen modul (token hex) untuk kartu katalog & aksen UI. */
  accentColor: string;
}

/** Satu variabel bebas yang bisa dimanipulasi siswa di lab. */
export interface ModuleVariable {
  /** Kunci unik variabel (mis. "v0", "sudut"). */
  key: string;
  /** Label yang ditampilkan ke siswa (Bahasa Indonesia). */
  label: string;
  /** Satuan fisika (mis. "m/s", "°"). */
  unit: string;
  /** Nilai minimum slider. */
  min: number;
  /** Nilai maksimum slider. */
  max: number;
  /** Langkah slider. */
  step: number;
  /** Nilai awal saat modul dibuka. */
  defaultValue: number;
}

/** Spesifikasi simulasi: variabel bebas vs besaran terikat yang diukur. */
export interface SimulationSpec {
  /** Variabel bebas yang dimanipulasi siswa (slider di panel lab). */
  independent: ModuleVariable[];
  /** Besaran terikat yang diamati/direkam (label bebas, mis. "jarak"). */
  dependent: string[];
}

/** Satu pertanyaan refleksi sokratis. */
export interface ReflectionQuestion {
  /** Kunci unik pertanyaan (mis. "q1"). */
  key: string;
  /** Teks pertanyaan. */
  q: string;
}

/** Konfigurasi lengkap satu modul. */
export interface ModuleConfig {
  meta: ModuleMeta;
  /** Pertanyaan refleksi sokratis (loop REFLECT). */
  reflectionQuestions: ReflectionQuestion[];
  /** Konstanta fisika & numerik modul (restitusi, noise, preset g, dst.). */
  constants: Record<string, number>;
  /** Spesifikasi variabel simulasi. */
  simulation: SimulationSpec;
}
