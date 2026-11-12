#!/usr/bin/env node
/**
 * Analisis Hasil Uji Manusia — FisikaSeru
 * ---------------------------------------------------------------
 * Status: ALAT BANTU. Skrip ini tidak melakukan uji manusia; dia hanya
 * merangkum angka yang sudah diisi manusia pada lembar observasi.
 *
 * Jalankan:
 *   node docs/human-testing/analisis-hasil.js <file.csv> [--ringkas]
 *
 * Contoh (data contoh, BUKAN hasil uji nyata):
 *   node docs/human-testing/analisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv
 *
 * -------------------------------------------------------------------------
 * SKEMA KOLOM CSV (WAJIB dipatuhi — urutan kolom bebas, nama harus sama)
 * -------------------------------------------------------------------------
 * id_responden     : kode pseudonim. Guru G1..G5, siswa S1..S8. Boleh G10/S12 bila bertambah.
 * peran            : guru | siswa
 * skenario         : H1 | H2 | H3 | H4 | H5   (lihat docs/HUMAN-TESTING-PROTOCOL.md)
 * tanggal          : YYYY-MM-DD
 * durasi_menit     : durasi sesi, angka bulat
 * status           : LULUS | GAGAL | SEBAGIAN  (hasil skenario, bukan nilai ujian)
 * skor_pre         : skor pre-test modul terkait, 0..20 (lihat pretest-posttest.md)
 * skor_post        : skor post-test modul terkait, 0..20
 * d1_kemenjelasan  : skala Likert 1..5 — kejelasan instruksi
 * d2_pemahaman     : skala Likert 1..5 — pemahaman konsep (makin tinggi makin paham)
 * d3_beban_kognitif: skala Likert 1..5 — beban kognitif (5 = ringan, tidak membebani)
 * d4_umpan_balik   : skala Likert 1..5 — kegunaan umpan balik
 * d5_keterlacakan  : skala Likert 1..5 — keterlacakan percobaan (selalu jelas apa yang terjadi)
 * d6_keterbacaan   : skala Likert 1..5 — keterbacaan grafik & angka
 * d7_eksplorasi    : skala Likert 1..5 — keterlibatan eksplorasi / rasa menemukan sendiri
 * d8_kepuasan      : skala Likert 1..5 — kepuasan umum
 * sumber_data      : CONTOH | NYATA  (wajib diisi; CONTOH akan memicu peringatan di bawah)
 * catatan          : teks bebas, boleh dikosongkan. WAJIB diapit tanda kutip bila memuat koma.
 *
 * Aturan isi:
 * - Baris = satu sesi uji (satu peserta + satu skenario).
 * - Angka kosong (tidak diisi) DIABAIKAN, bukan dianggap 0.
 * - Baris pertama boleh diawali baris judul Bernoulli, contoh:
 *     DATA CONTOH — BUKAN HASIL UJI NYATA
 *   Baris seperti itu dilewati dan skrip akan menampilkan PERINGATAN.
 * - Tidak ada dependensi eksternal. Hanya modul bawaan Node.js.
 * -------------------------------------------------------------------------
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SKEMA = [
  'id_responden',
  'peran',
  'skenario',
  'tanggal',
  'durasi_menit',
  'status',
  'skor_pre',
  'skor_post',
  'd1_kemenjelasan',
  'd2_pemahaman',
  'd3_beban_kognitif',
  'd4_umpan_balik',
  'd5_keterlacakan',
  'd6_keterbacaan',
  'd7_eksplorasi',
  'd8_kepuasan',
  'sumber_data',
  'catatan',
];

const LABEL_DIMENSI = {
  d1_kemenjelasan: 'Kejelasan instruksi',
  d2_pemahaman: 'Pemahaman konsep',
  d3_beban_kognitif: 'Beban kognitif (5 = ringan)',
  d4_umpan_balik: 'Kegunaan umpan balik',
  d5_keterlacakan: 'Keterlacakan percobaan',
  d6_keterbacaan: 'Keterbacaan grafik & angka',
  d7_eksplorasi: 'Keterlibatan eksplorasi',
  d8_kepuasan: 'Kepuasan umum',
};

const SKENARIO_VALID = ['H1', 'H2', 'H3', 'H4', 'H5'];
const STATUS_VALID = ['LULUS', 'GAGAL', 'SEBAGIAN'];

/* ---------- util CSV sederhana (tanpa dependensi) ---------- */

function parseCsv(teks) {
  const baris = [];
  let sel = [];
  let nilai = '';
  let diDalamKutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (diDalamKutip) {
      if (c === '"') {
        if (teks[i + 1] === '"') {
          nilai += '"';
          i++;
        } else {
          diDalamKutip = false;
        }
      } else {
        nilai += c;
      }
      continue;
    }
    if (c === '"') {
      diDalamKutip = true;
    } else if (c === ',') {
      sel.push(nilai);
      nilai = '';
    } else if (c === '\n') {
      sel.push(nilai);
      baris.push(sel);
      sel = [];
      nilai = '';
    } else if (c === '\r') {
      // abaikan
    } else {
      nilai += c;
    }
  }
  if (nilai !== '' || sel.length > 0) {
    sel.push(nilai);
    baris.push(sel);
  }
  return baris.filter((b) => b.some((x) => x.trim() !== ''));
}

/* ---------- statistik sederhana ---------- */

function keAngka(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function rerata(list) {
  if (!list.length) return null;
  const total = list.reduce((a, b) => a + b, 0);
  return total / list.length;
}

function fmt(n, desimal = 2) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '  -  ';
  return n.toFixed(desimal);
}

function fmtRapi(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return String(Math.round(n * 100) / 100);
}

/** Selisih dengan tanda eksplisit, mis. +5.4 atau -2.1 */
function tandaDelta(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return (n >= 0 ? '+' : '') + fmtRapi(n);
}

/* ---------- program utama ---------- */

function jalankan() {
  const argumen = process.argv.slice(2);
  const ringkas = argumen.includes('--ringkas');
  const jalur = argumen.filter((a) => !a.startsWith('--'))[0];

  const larik = [
    'Analisis Hasil Uji Manusia — FisikaSeru',
    '='.repeat(64),
    '',
    'Peringatan umum: angka di bawah hanya bermakna sebagai hasil uji bila',
    'baris sumber_data bernilai NYATA. Data CONTOH tidak boleh dilaporkan',
    'sebagai bukti kemampuannya.',
    '',
  ];

  if (!jalur) {
    larik.push('Cara pakai:');
    larik.push('  node docs/human-testing/analisis-hasil.js <file.csv>');
    larik.push('');
    larik.push('Contoh data (dummy):');
    larik.push('  node docs/human-testing/analisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv');
    console.log(larik.join('\n'));
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(jalur)) {
    console.error('File tidak ditemukan: ' + jalur);
    process.exitCode = 1;
    return;
  }

  const isi = fs.readFileSync(jalur, 'utf8');
  const semuaBaris = parseCsv(isi);

  // Deteksi baris judul Bernoulli di baris pertama.
  let judulBaris = null;
  if (semuaBaris.length && semuaBaris[0].length === 1) {
    judulBaris = semuaBaris[0][0].trim();
  }
  const barisData = judulBaris !== null ? semuaBaris.slice(1) : semuaBaris;

  larik.push('File sumber : ' + path.relative(process.cwd(), jalur));
  larik.push('Waktu baca  : ' + new Date().toISOString().slice(0, 10));
  larik.push('');

  if (judulBaris) {
    larik.push('*** PERINGATAN: BARIS JUDUL PADA FILE SUMBER ***');
    larik.push('    "' + judulBaris + '"');
    larik.push('    Jika ini file contoh, angka di bawah ini BUKAN hasil uji nyata.');
    larik.push('');
  }

  if (!barisData.length) {
    larik.push('Tidak ada baris data.');
    console.log(larik.join('\n'));
    process.exitCode = 1;
    return;
  }

  const header = barisData[0].map((h) => h.trim().toLowerCase());
  const baris = barisData.slice(1);

  // Validasi skema.
  const kolomWajib = ['id_responden', 'peran', 'skenario', 'status', 'skor_pre', 'skor_post'];
  const hilang = kolomWajib.filter((k) => !header.includes(k));
  const dimensiHilang = Object.keys(LABEL_DIMENSI).filter((k) => !header.includes(k));

  if (hilang.length) {
    larik.push('*** PERINGATAN: KOLOM WAJIB TIDAK ADA: ' + hilang.join(', '));
  }
  if (dimensiHilang.length) {
    larik.push('*** PERINGATAN: KOLOM DIMENSI TIDAK ADA (rata-rata dimensi dilewati): ' + dimensiHilang.join(', '));
  }
  if (hilang.length || dimensiHilang.length) {
    larik.push('');
  }

  const indeks = {};
  header.forEach((h, i) => {
    if (!(h in indeks)) indeks[h] = i;
  });

  const ambil = (row, key) => {
    const i = indeks[key];
    if (i === undefined) return '';
    return (row[i] === undefined ? '' : String(row[i])).trim();
  };

  const catatanBaris = [];
  const barisValid = [];

  baris.forEach((row, no) => {
    const nomorBaris = no + 2; // +2 untuk header dan baris judul bila ada
    const id = ambil(row, 'id_responden');
    const skenario = ambil(row, 'skenario').toUpperCase();
    const status = ambil(row, 'status').toUpperCase();
    const pre = keAngka(ambil(row, 'skor_pre'));
    const post = keAngka(ambil(row, 'skor_post'));
    const sumber = ambil(row, 'sumber_data').toUpperCase();

    const masalah = [];
    if (!id) masalah.push('id_responden kosong');
    if (skenario && !SKENARIO_VALID.includes(skenario)) masalah.push('skenario tidak dikenal: ' + skenario);
    if (status && !STATUS_VALID.includes(status)) masalah.push('status tidak dikenal: ' + status);
    if (pre !== null && (pre < 0 || pre > 20)) masalah.push('skor_pre di luar 0..20: ' + pre);
    if (post !== null && (post < 0 || post > 20)) masalah.push('skor_post di luar 0..20: ' + post);

    const dimensi = {};
    for (const key of Object.keys(LABEL_DIMENSI)) {
      const n = keAngka(ambil(row, key));
      if (n !== null && (n < 1 || n > 5)) masalah.push(key + ' di luar 1..5: ' + n);
      dimensi[key] = n;
    }

    if (masalah.length) {
      catatanBaris.push({ nomorBaris, id, masalah });
    }

    barisValid.push({
      nomorBaris,
      id,
      peran: ambil(row, 'peran').toLowerCase(),
      skenario,
      tanggal: ambil(row, 'tanggal'),
      durasi: keAngka(ambil(row, 'durasi_menit')),
      status,
      pre,
      post,
      dimensi,
      sumber,
      catatan: ambil(row, 'catatan'),
    });
  });

  // Ringkasan sumber data.
  const nContoh = barisValid.filter((b) => b.sumber === 'CONTOH').length;
  const nNyata = barisValid.filter((b) => b.sumber === 'NYATA').length;
  const nTanpaLabel = barisValid.filter((b) => b.sumber !== 'CONTOH' && b.sumber !== 'NYATA').length;

  larik.push('Ringkasan berkas');
  larik.push('  Baris data terbaca        : ' + barisValid.length);
  larik.push('  Responden unik            : ' + new Set(barisValid.map((b) => b.id).filter(Boolean)).size);
  larik.push('  Baris sumber_data = CONTOH: ' + nContoh);
  larik.push('  Baris sumber_data = NYATA : ' + nNyata);
  larik.push('  Baris tanpa label sumber : ' + nTanpaLabel);
  larik.push('');

  if (nContoh > 0) {
    larik.push('*** PERINGATAN: ' + nContoh + ' baris ditandai CONTOH.');
    larik.push('    Angka di bawah ini adalah data fiktif untuk latihan.');
    larik.push('    JANGAN dipindahkan ke laporan hasil uji.');
    larik.push('');
  }
  if (nTanpaLabel > 0) {
    larik.push('*** PERINGATAN: ' + nTanpaLabel + ' baris tidak punya sumber_data (CONTOH/NYATA).');
    larik.push('    Isi kolom itu agar tidak tertukar dengan data latihan.');
    larik.push('');
  }

  if (catatanBaris.length) {
    larik.push('Baris bermasalah (tidak dihitung dalam angka, tapi tetap ditampilkan):');
    for (const c of catatanBaris) {
      larik.push('  baris ' + c.nomorBaris + ' (' + (c.id || 'tanpa id') + '): ' + c.masalah.join('; '));
    }
    larik.push('');
  }

  // ---- Status per skenario ----
  larik.push('1. Status skenario per skenario');
  larik.push('   ' + 'Skenario'.padEnd(10) + 'LULUS'.padStart(8) + 'GAGAL'.padStart(8) + 'SEBAGIAN'.padStart(11) + 'Total'.padStart(8));
  for (const s of SKENARIO_VALID) {
    const rows = barisValid.filter((b) => b.skenario === s);
    if (!rows.length) continue;
    const hitung = (st) => rows.filter((b) => b.status === st).length;
    larik.push(
      '   ' + s.padEnd(10) +
      String(hitung('LULUS')).padStart(8) +
      String(hitung('GAGAL')).padStart(8) +
      String(hitung('SEBAGIAN')).padStart(11) +
      String(rows.length).padStart(8)
    );
  }
  larik.push('');

  // ---- Rata-rata dimensi ----
  larik.push('2. Rata-rata skala Likert per dimensi (skala 1..5)');
  larik.push('   Dimensi'.padEnd(34) + 'Rerata'.padStart(8) + 'Nilai'.padStart(8) + ' _min  _max');
  const rerataDimensi = {};
  for (const key of Object.keys(LABEL_DIMENSI)) {
    const vals = barisValid.map((b) => b.dimensi[key]).filter((v) => v !== null && v !== undefined);
    const r = rerata(vals);
    rerataDimensi[key] = r;
    if (!vals.length) {
      larik.push('   ' + LABEL_DIMENSI[key].padEnd(34) + '   -    ' + String(vals.length).padStart(6) + '   (tidak ada data)');
      continue;
    }
    larik.push(
      '   ' + LABEL_DIMENSI[key].padEnd(34) +
      fmt(r).padStart(8) +
      String(vals.length).padStart(8) +
      '   ' + Math.min(...vals) + '    ' + Math.max(...vals)
    );
  }
  larik.push('');

  if (!ringkas) {
    // ---- Rata-rata dimensi per skenario ----
    larik.push('3. Rata-rata dimensi per skenario');
    const skenarioAda = SKENARIO_VALID.filter((s) => barisValid.some((b) => b.skenario === s));
    if (!skenarioAda.length) {
      larik.push('   (tidak ada data per skenario)');
    } else {
      larik.push('   ' + 'Dimensi'.padEnd(34) + skenarioAda.map((s) => s.padStart(8)).join(''));
      for (const key of Object.keys(LABEL_DIMENSI)) {
        const cells = skenarioAda.map((s) => {
          const vals = barisValid
            .filter((b) => b.skenario === s)
            .map((b) => b.dimensi[key])
            .filter((v) => v !== null && v !== undefined);
          return fmt(rerata(vals)).padStart(8);
        });
        larik.push('   ' + LABEL_DIMENSI[key].padEnd(34) + cells.join(''));
      }
    }
    larik.push('');
  }

  // ---- Pre/post ----
  larik.push((ringkas ? '3' : '4') + '. Pre-test vs post-test (skor 0..20 per modul)');
  larik.push('   Skenario'.padEnd(10) + 'Rata-rata pre'.padStart(15) + 'Rata-rata post'.padStart(16) + 'Selisih'.padStart(10) + 'N'.padStart(5));
  const deltaPerSkenario = {};
  for (const s of SKENARIO_VALID) {
    const rows = barisValid.filter((b) => b.skenario === s && b.pre !== null && b.post !== null);
    if (!rows.length) continue;
    const pre = rerata(rows.map((b) => b.pre));
    const post = rerata(rows.map((b) => b.post));
    const delta = post - pre;
    deltaPerSkenario[s] = { pre, post, delta, n: rows.length };
    larik.push(
      '   ' + s.padEnd(10) +
      fmt(pre).padStart(15) +
      fmt(post).padStart(16) +
      tandaDelta(delta).padStart(10) +
      String(rows.length).padStart(5)
    );
  }

  const semuaPasangan = barisValid.filter((b) => b.pre !== null && b.post !== null);
  if (semuaPasangan.length) {
    const pre = rerata(semuaPasangan.map((b) => b.pre));
    const post = rerata(semuaPasangan.map((b) => b.post));
    const naik = semuaPasangan.filter((b) => b.post > b.pre).length;
    const sama = semuaPasangan.filter((b) => b.post === b.pre).length;
    const turun = semuaPasangan.filter((b) => b.post < b.pre).length;
    larik.push('   ' + 'SEMUA'.padEnd(10) + fmt(pre).padStart(15) + fmt(post).padStart(16) +
      tandaDelta(post - pre).padStart(10) + String(semuaPasangan.length).padStart(5));
    larik.push('');
    larik.push('   Arah perubahan: naik ' + naik + ' / sama ' + sama + ' / turun ' + turun +
      ' (dari ' + semuaPasangan.length + ' pasangan pre/post yang terisi)');
    larik.push('   Catatan: "naik" di sini hanya berarti skor post lebih tinggi.');
    larik.push('   Itu belum otomatis berarti hasil belajar lebih baik — angka ini harus dibaca');
    larik.push('   catatan observasi (lihat rubrik-analisis.md).');
  } else {
    larik.push('   (tidak ada pasangan pre/post yang terisi)');
  }
  larik.push('');

  // ---- Durasi ----
  const durasi = barisValid.map((b) => b.durasi).filter((v) => v !== null && v !== undefined);
  if (durasi.length) {
    larik.push((ringkas ? '4' : '5') + '. Durasi sesi (menit)');
    larik.push('   Rerata ' + fmt(rerata(durasi), 1) + ' | terpendek ' + Math.min(...durasi) + ' | terpanjang ' + Math.max(...durasi));
    larik.push('');
  }

  larik.push('='.repeat(64));
  larik.push('Akhir laporan. Angka di atas tidak lebih kuat daripada cara data dikumpulkan.');
  larik.push('Jangan menyimpulkan lebih dari jumlah peserta dan mutu catatan yang ada.');
  larik.push('Lihat rubrik-analisis.md untuk aturan pelaporan.');

  console.log(larik.join('\n'));
}

jalankan();
