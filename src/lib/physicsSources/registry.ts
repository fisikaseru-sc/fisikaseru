// ============================================================
// FISIKASERU — SHARED PHYSICS SOURCE REGISTRY
// Registri sumber referensi fisika bersama (READ-ONLY).
//
// Arsitektur (lihat docs/PHYSICS-SOURCE-ARCHITECTURE.md):
//   - Dokumen sumber (CP, buku) hidup DI LUAR repo, di
//     `PHYSICS_SOURCE_ROOT` (default: /home/si/AI-Workspace/Physics Source).
//   - FisikaSeru TIDAK menyalin PDF ke dalam repo (hak cipta).
//   - Modul ini hanya: (1) memvalidasi path via env var,
//     (2) menyediakan metadata yang sudah ditelaah auditor
//     (bab/halaman/klaim) — bukan isi dokumen.
//   - Gagal akses sumber TIDAK memengaruhi runtime simulasi;
//     hanya memengaruhi kemampuan verifikasi klaim sumber.
// ============================================================

import { existsSync, statSync } from "fs";
import path from "path";

/** Nama environment variable untuk root sumber bersama. */
export const PHYSICS_SOURCE_ROOT_ENV = "PHYSICS_SOURCE_ROOT";

/** Default absolut — hanya dipakai bila env var tidak di-set. */
const DEFAULT_ROOT = "/home/si/AI-Workspace/Physics Source";

export type SourceType =
  | "CURRICULUM_OFFICIAL"
  | "ASSESSMENT_GUIDANCE"
  | "ATP_OR_TEACHING_PLAN"
  | "TEXTBOOK"
  | "REFERENCE_BOOK"
  | "IMPLEMENTATION_SOURCE"
  | "UNVERIFIED_SOURCE";

export type ReviewStatus =
  | "DISCOVERED"
  | "READABLE"
  | "PARTIALLY_REVIEWED"
  | "REVIEWED"
  | "NEEDS_VERIFICATION"
  | "UNAVAILABLE";

export interface PhysicsSourceMeta {
  source_id: string;
  title: string;
  author_or_institution: string;
  publication_year: string;
  edition: string;
  source_type: SourceType;
  /** Nama file relatif terhadap PHYSICS_SOURCE_ROOT. */
  filename: string;
  /** Bab yang ditelaah (kosong = belum ditelaah). */
  chapter: string;
  /** Rentang halaman yang ditelaah (kosong = belum). */
  page_range: string;
  /** Klaim yang didukung sumber ini (ringkasan, bukan kutipan panjang). */
  claim_supported: string;
  review_status: ReviewStatus;
  verification_date: string;
  /** 16 digit pertama SHA-256 untuk identifikasi versi. */
  source_version_or_hash: string;
  reviewer_or_process: string;
  /** Keterbatasan yang diketahui saat penelaahan. */
  limitations: string;
}

/**
 * Hasil resolusi root sumber: membedakan "sumber tidak dikonfigurasi"
 * dari "sumber dikonfigurasi tapi tidak ada".
 */
export interface SourceRootResolution {
  /** Root yang dipakai (dari env atau default). */
  root: string;
  /** true bila direktori ada dan dapat dibaca. */
  available: boolean;
  /** Pesan error yang membantu bila tidak tersedia. */
  error: string | null;
  /** true bila root berasal dari env var (bukan default). */
  fromEnv: boolean;
}

/**
 * Validasi + resolusi PHYSICS_SOURCE_ROOT.
 * Tidak pernah melempar exception — kegagalan dikembalikan sebagai data
 * agar pemanggil dapat menampilkan pesan tanpa menghentikan aplikasi.
 */
export function resolvePhysicsSourceRoot(env: Record<string, string | undefined> = {}): SourceRootResolution {
  const configured = env[PHYSICS_SOURCE_ROOT_ENV];
  const root = configured && configured.trim() ? configured.trim() : DEFAULT_ROOT;
  const fromEnv = Boolean(configured && configured.trim());
  if (!existsSync(root) || !statIsDirectory(root)) {
    return {
      root,
      available: false,
      error:
        `Direktori sumber fisika bersama tidak ditemukan (atau bukan direktori): "${root}". ` +
        `Atur ${PHYSICS_SOURCE_ROOT_ENV} di .env.local ke lokasi folder "Physics Source" yang benar. ` +
        `Simulasi tetap berjalan; hanya verifikasi klaim sumber yang tidak tersedia.`,
      fromEnv,
    };
  }
  return { root, available: true, error: null, fromEnv };
}

function statIsDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Metadata sumber yang TELAH DITELAAH auditor (bukan sekadar ditemukan).
 * `claim_supported` adalah ringkasan hasil penelaahan aktual;
 * detail bukti ada di docs/PHYSICS-SOURCE-MATRIX.md.
 *
 * Hash = 16 digit pertama SHA-256 file saat audit 17 Okt 2026.
 */
export const REVIEWED_SOURCES: readonly PhysicsSourceMeta[] = [
  {
    source_id: "SRC-CP-IPA-2025",
    title: "Capaian Pembelajaran Ilmu Pengetahuan Alam (IPA)",
    author_or_institution: "Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP), Kemendikdasmen",
    publication_year: "2025",
    edition: "",
    source_type: "CURRICULUM_OFFICIAL",
    filename: "CP_2025_BSKAP_046H_KR_IPA.docx",
    chapter: "Capaian Pembelajaran — Fase E (Pemahaman IPA; Keterampilan Proses)",
    page_range: "",
    claim_supported:
      "CP IPA Fase E memuat 'menganalisis gerak dua dimensi' (Pemahaman IPA) dan enam keterampilan proses (mengamati; mempertanyakan dan memprediksi; merencanakan dan melakukan penyelidikan; memproses dan menganalisis data; mengevaluasi dan refleksi; mengomunikasikan hasil).",
    review_status: "REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:378ae912b22ec0bd",
    reviewer_or_process: "Auditor AI — ekstraksi python-docx penuh (54 paragraf), dibaca seluruhnya",
    limitations:
      "Ekstraksi docx tidak mempertahankan penomoran halaman. Nama file menyebut '046/H/KR/2025'; isi dokumen IPA tidak memuat nomor keputusan yang dapat diverifikasi dari teks ekstraksi.",
  },
  {
    source_id: "SRC-CP-FISIKA-F-2025",
    title: "Capaian Pembelajaran Fisika",
    author_or_institution: "Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP), Kemendikdasmen",
    publication_year: "2025",
    edition: "",
    source_type: "CURRICULUM_OFFICIAL",
    filename: "CP_2025_BSKAP_046H_KR_Fisika_Fase_F.docx",
    chapter: "Capaian Pembelajaran — Fase F (Pemahaman Fisika; Keterampilan Proses)",
    page_range: "",
    claim_supported:
      "CP Fisika Fase F: 'menganalisis teori dasar fisika modern dan pengaruhnya terhadap perkembangan teknologi' (konteks pengayaan Millikan) + keterampilan proses Fase F. Dokumen TIDAK memuat bandul/gerak harmonik secara eksplisit pada rumusan CP.",
    review_status: "REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:5bc5fc48cf54f082",
    reviewer_or_process:
      "Auditor AI — ekstraksi python-docx penuh (35 paragraf), dibaca seluruhnya. Nomor keputusan diverifikasi eksternal oleh pengguna 17 Okt 2026: resmi = 046/H/KR/2025 (salinan keputusan bpmpbabel.kemendikdasmen.go.id + siaran pers Kemendikdasmen 23 Juni 2026); teks '064' di dalam docx = kesalahan dokumen sumber.",
    limitations:
      "DISKREPANSI TERSELESAIKAN (verifikasi eksternal oleh pengguna, 17 Okt 2026): nomor resmi yang benar adalah 046/H/KR/2025 — dikonfirmasi dari salinan keputusan resmi di situs pemerintah (bpmpbabel.kemendikdasmen.go.id, KepKaBSKAP-046_2025-ttg-CP.pdf) dan siaran pers Kemendikdasmen 23 Juni 2026 (Keputusan 020/2026 hanya mengubah CP Agama & Budi Pekerti; mapel lain tetap 046/H/KR/2025). Teks 'NOMOR 064/H/KR/2025' di dalam file docx adalah kesalahan pada dokumen sumber itu sendiri — dokumen sumber TIDAK diubah; catatan bibliografi ini yang dikoreksi. Rumusan CP yang dikutip untuk alignment tidak terpengaruh penomoran.",
  },
  {
    source_id: "SRC-ATP-FISIKA-F-2025",
    title: "Analisis CP Fisika Fase F, TP, dan ATP",
    author_or_institution: "UNKNOWN (dokumen pendukung — verifikasi penulis)",
    publication_year: "2025",
    edition: "",
    source_type: "ATP_OR_TEACHING_PLAN",
    filename: "Analisis_CP_Fisika_Fase_F_TP_ATP.docx",
    chapter: "Tabel 1 (11 TP); Tabel 2 (integrasi keterampilan proses); Tabel 3 (contoh pembelajaran)",
    page_range: "",
    claim_supported:
      "ATP Fase F memuat 11 TP: dinamika gerak; usaha-energi-momentum; fluida; kalor; termodinamika; gelombang mekanik; bunyi & cahaya; listrik DC; elektromagnetik; FISIKA MODERN (radiasi benda hitam, efek fotolistrik, dualisme, model atom, radioaktivitas — no Millikan eksplisit); sistem digital. Tidak ada TP getaran/bandul.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:32b0adcade68717c",
    reviewer_or_process: "Auditor AI — ekstraksi python-docx (29 paragraf + 3 tabel), tabel dibaca penuh",
    limitations:
      "Penulis/lembaga tidak tercantum dalam teks ekstraksi — butuh verifikasi identitas. Bandul TIDAK muncul di ATP Fase F → pemetaan bandul ke Fase F tidak didukung dokumen ini.",
  },
  {
    source_id: "SRC-ATP-IPA-E-2025",
    title: "Analisis CP IPA Fisika Kelas X Fase E",
    author_or_institution: "UNKNOWN (dokumen pendukung — verifikasi penulis)",
    publication_year: "2025",
    edition: "",
    source_type: "ATP_OR_TEACHING_PLAN",
    filename: "Analisis_CP_IPA_Fisika_Kelas_X_Fase_E.docx",
    chapter: "Tabel 1 baris 2 (Gerak Dua Dimensi); Tabel 2; Tabel 3 baris 2; Tabel 4; Tabel 5",
    page_range: "",
    claim_supported:
      "TP Fase E no. 2: 'Murid mampu menganalisis gerak dua dimensi menggunakan representasi matematis, grafik dan eksperimen...' dengan indikator eksplisit 'Menganalisis gerak parabola menggunakan persamaan kinematika', 'Menentukan posisi, kecepatan dan waktu tempuh', 'Menafsirkan grafik'. Contoh aktivitas menyebut 'simulasi PHET serta analisis grafik lintasan'.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:71d17a1d74a82906",
    reviewer_or_process: "Auditor AI — ekstraksi python-docx (32 paragraf + 5 tabel), tabel dibaca penuh",
    limitations:
      "Penulis/lembaga tidak tercantum dalam teks ekstraksi — butuh verifikasi identitas sebelum dipakai sebagai bukti ATP resmi.",
  },
  {
    source_id: "SRC-BS-XI-2022",
    title: "Fisika untuk SMA/MA Kelas XI (buku teks BS)",
    author_or_institution: "Alvius Tinambunan/Kemendikbudristek (2022) — penerbit BS (Kemendikbudristek)",
    publication_year: "2022",
    edition: "",
    source_type: "TEXTBOOK",
    filename: "Fisika_BS_KLS_XI.pdf",
    chapter: "Bab 2 Kinematika — D. Gerak Parabola (hal. 53–57)",
    page_range: "53–57 (terekstraksi pdftotext)",
    claim_supported:
      "Buku siswa memverifikasi: vx = v·cosθ, vy = v·sinθ; kecepatan horizontal konstan; vy = 0 di puncak; waktu tanah-puncak-tanah = 2× waktu ke puncak; penyelidikan jarak horizontal R; peluncuran dari ketinggian meja (h0 > 0) sebagai kasus utama.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:88e3e464ef384b79",
    reviewer_or_process: "Auditor AI — pdftotext penuh (12.232 baris), Bab 2 bagian parabola dibaca terfokus",
    limitations:
      "Telaah terfokus pada subbab gerak parabola saja; bab lain belum ditelaah. Tabel/berntisikit persamaan hilang di ekstraksi teks (dibaca dari konteks prosa dan contoh soal).",
  },
  {
    source_id: "SRC-MIKRA-I",
    title: "Fisika Dasar I",
    author_or_institution: "Mikrajuddin Abdullah",
    publication_year: "",
    edition: "",
    source_type: "REFERENCE_BOOK",
    filename: "Fisika_Dasar_I_Mikrajuddin_Abdullah.pdf",
    chapter: "Bab 7 Osilasi — 7.2 Bandul Matematis Sederhana (hal. 501–503); 13.3 Bandul Simpangan Besar (hal. 1050+)",
    page_range: "501–503; 1050–1056 (terekstraksi)",
    claim_supported:
      "F = −W·sinθ dengan pendekatan sinθ ≈ θ untuk simpangan kecil; f = (1/2π)√(g/l) — hanya bergantung L dan g; bandul Foucault sebagai contoh; Bab 13.3: persamaan nonlinear θ'' = −(g/L)sinθ diselesaikan numerik karena tak analitik untuk simpangan besar.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:a8ab9ab88cc34882",
    reviewer_or_process: "Auditor AI — pdftotext penuh (45.578 baris), Bab 7.2 dan 13.3 dibaca terfokus",
    limitations:
      "Simbol Yunani (θ, π) hilang di ekstraksi — persamaan direkonstruksi dari konteks prosa, struktur rumus terverifikasi. Tahun terbit tidak terbaca dari halaman yang ditelaah.",
  },
  {
    source_id: "SRC-MIKRA-II",
    title: "Fisika Dasar II",
    author_or_institution: "Mikrajuddin Abdullah",
    publication_year: "",
    edition: "",
    source_type: "REFERENCE_BOOK",
    filename: "Fisika_Dasar_II_Mikrajuddin_Abdullah.pdf",
    chapter: "Bab 12 Pengenalan Teori Kuantum Atom — 12.3 Percobaan Millikan (hal. 851–855)",
    page_range: "851–855 (terekstraksi)",
    claim_supported:
      "Skema eksperimen tetes minyak (dua elektroda horizontal, atomizer, teleskop); keseimbangan qE = mg; gaya Stokes F = 6πηrv; laju terminal; r = √(9ηv / 2ρg); kesimpulan muatan kelipatan 1,602×10⁻¹⁹ C.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:5cf18452b6be1679",
    reviewer_or_process: "Auditor AI — pdftotext penuh (48.306 baris), Bab 12.3 dibaca terfokus penuh",
    limitations:
      "Buku menyebut m = ρ·(4/3)πr³ TANPA gaya apung udara (udara diabaikan) — FisikaSeru memakai Δρ (lebih akurat); perbedaan ini dicatat sebagai penguatan, bukan konflik. Cunningham tidak dibahas di bagian ini. Simbol Yunani hilang di ekstraksi.",
  },
  {
    source_id: "SRC-PANDUAN-2025",
    title: "Panduan Pembelajaran dan Asesmen 2025 (Edisi Revisi)",
    author_or_institution: "Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kemendikdasmen RI",
    publication_year: "2025",
    edition: "Edisi Revisi Tahun 2025",
    source_type: "ASSESSMENT_GUIDANCE",
    filename: "Panduan_Pembelajaran_dan_Asesmen_2025.pdf",
    chapter: "Dokumen 159 halaman — dibaca sampul, identitas, dan struktur",
    page_range: "1–3 (identitas); keseluruhan terekstraksi (11.313 baris)",
    claim_supported:
      "Identitas dokumen resmi BSKAP 'Edisi Revisi Tahun 2025' terverifikasi. Tidak memuat topik spesifik (bandul/Millikan/parabola) — panduan pedagogi umum.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:e1465534cb386d03",
    reviewer_or_process: "Auditor AI — pdftotext penuh + grep topik; identitas dokumen dibaca",
    limitations:
      "Isi pedagogi mendalam (rubrik, strategi asesmen) belum ditelaah bab-per-bab; hanya identitas + pemindaian topik.",
  },
  {
    source_id: "SRC-ERLANGGA-XI",
    title: "Mandiri Fisika Jilid 2 untuk SMA/MA Kelas XI",
    author_or_institution: "Ni Ketut Lasmi — Penerbit Erlangga",
    publication_year: "2013 (cetak 2015; K13 Edisi Revisi 2016)",
    edition: "Jilid 2",
    source_type: "TEXTBOOK",
    filename: "Fisika_Kelas_XI_Erlangga.pdf",
    chapter: "Daftar isi (hal. vi): Bab 1 Dinamika Rotasi — Bab 12 Pemanasan Global",
    page_range: "iii–vi (daftar isi via OCR)",
    claim_supported:
      "HANYYA mendukung konteks penerbit/penulis. Daftar isi (12 bab: Dinamika Rotasi, Elastisitas, Fluida Statis/Dinamis, Suhu & Kalor, Termodinamika, Gelombang, Bunyi, Cahaya, Optika Geometri, Pemanasan Global) TIDAK memuat gerak parabola, kinematika, getaran/bandul, maupun listrik statis/Millikan.",
    review_status: "PARTIALLY_REVIEWED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:0a12a1b87508da74",
    reviewer_or_process:
      "Auditor AI — PDF hasil scan (pdftotext kosong); OCR tesseract (eng) halaman judul + daftar isi; halaman isi spot-check",
    limitations:
      "PDF hasil scan penuh — ekstraksi teks tidak dapat dipercaya tanpa OCR per-halaman (bahasa Indonesia data tesseract tidak terpasang). KETERSEDIAAN TOPIK: buku ini TIDAK relevan untuk modul parabola/bandul/Millikan; kandidat dipertimbangkan untuk modul fluida/kalor/gelombang mendatang.",
  },
  {
    source_id: "SRC-FORMAT-MODUL",
    title: "Format Modul Ajar",
    author_or_institution: "UNKNOWN",
    publication_year: "",
    edition: "",
    source_type: "ATP_OR_TEACHING_PLAN",
    filename: "Format_Modul_Ajar.docx",
    chapter: "Struktur template (5 tabel)",
    page_range: "",
    claim_supported: "Hanya format/kosong — tidak mendukung klaim konten fisika.",
    review_status: "DISCOVERED",
    verification_date: "2026-10-17",
    source_version_or_hash: "sha256:194403de7c0c0086",
    reviewer_or_process: "Auditor AI — ekstraksi python-docx (3 paragraf + 5 tabel kosong)",
    limitations: "Template kosong; tidak ada isi untuk diverifikasi.",
  },
] as const;

/**
 * Ambil metadata sumber berdasarkan source_id. Mengembalikan null bila tidak ada.
 */
export function getSourceMeta(sourceId: string): PhysicsSourceMeta | null {
  return REVIEWED_SOURCES.find((s) => s.source_id === sourceId) ?? null;
}

/**
 * Path absolut ke file sumber (tidak membaca isi). Mengembalikan null
 * bila root tidak tersedia — pemanggil wajib menangani null dan tidak
 * boleh fallback ke dokumen lain.
 */
export function getSourcePath(sourceMeta: PhysicsSourceMeta, root: string): string | null {
  return path.join(root, sourceMeta.filename);
}
