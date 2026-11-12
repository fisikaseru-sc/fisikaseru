import { chromium } from "playwright";
const browser = await chromium.launch();

const PAGES = [
  ["/", "beranda"], ["/modules", "katalog"],
  ["/modules/parabola/predict", "parabola-predict"], ["/modules/parabola/experiment", "parabola-exp"],
  ["/modules/parabola/analysis", "parabola-analisis"], ["/modules/parabola/reflection", "parabola-refleksi"],
  ["/modules/bandul/experiment", "bandul-exp"], ["/modules/bandul/analysis", "bandul-analisis"],
  ["/modules/millikan/experiment", "millikan-exp"], ["/modules/millikan/analysis", "millikan-analisis"],
  ["/modules/millikan/reflection", "millikan-refleksi"], ["/dashboard", "dashboard"],
];

const AUDIT = `(() => {
  const res = { overflowX: null, offenders: [], tiny: [], smallTargets: [], headings: [], noAlt: [], noName: [], contrast: [], clipped: [] };
  const de = document.documentElement;
  res.overflowX = de.scrollWidth > de.clientWidth + 1 ? { scroll: de.scrollWidth, client: de.clientWidth } : null;
  // 1) elemen yang melewati lebar viewport
  const vw = de.clientWidth;
  document.querySelectorAll("body *").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 2 || r.left < -2)) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") return;
      res.offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className||"").toString().slice(0,60), right: Math.round(r.right), left: Math.round(r.left) });
    }
  });
  res.offenders = res.offenders.slice(0, 6);
  // 2) teks terlalu kecil
  document.querySelectorAll("body *").forEach(el => {
    if (!el.childNodes.length) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) return;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs && fs < 11 && el.offsetParent !== null) res.tiny.push({ tag: el.tagName.toLowerCase(), fs: fs, text: el.textContent.trim().slice(0, 30) });
  });
  res.tiny = res.tiny.slice(0, 5);
  // 3) target sentuh kecil
  document.querySelectorAll("button, a[href], input, select, [role=button]").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (el.closest("[aria-hidden='true']")) return;
    if (r.height < 32 || r.width < 32) res.smallTargets.push({ tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 28) });
  });
  res.smallTargets = res.smallTargets.slice(0, 8);
  // 4) hierarki heading
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(h => res.headings.push({ lvl: +h.tagName[1], text: h.textContent.trim().slice(0, 34) }));
  // 5) gambar tanpa alt
  document.querySelectorAll("img").forEach(i => { if (!i.hasAttribute("alt")) res.noAlt.push(i.src.slice(-40)); });
  // 6) kontrol tanpa nama aksesibel
  document.querySelectorAll("button, a[href], [role=button], input:not([type=hidden])").forEach(el => {
    if (el.closest("[aria-hidden='true']")) return;
    const name = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim();
    const labelled = el.getAttribute("aria-labelledby") || (el.id && document.querySelector('label[for="'+el.id+'"]'));
    const wrapping = el.closest("label");
    if (!name && !labelled && !wrapping) res.noName.push({ tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", html: el.outerHTML.slice(0, 70) });
  });
  res.noName = res.noName.slice(0, 6);
  // 7) kontras teks vs background efektif
  const lum = (r,g,b) => { const a=[r,g,b].map(v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; };
  const parse = (c) => { const m=c.match(/[\\d.]+/g); return m ? m.map(Number) : null; };
  const bgOf = (el) => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; const p = c && parse(c); if (p && (p[3] === undefined || p[3] > 0.85)) return p; n = n.parentElement; } return [255,255,255]; };
  const seen = new Set();
  document.querySelectorAll("p, span, li, td, th, label, a, button, h1, h2, h3, h4, div").forEach(el => {
    const t = [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim());
    if (!t || el.offsetParent === null) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0") return;
    const fg = parse(cs.color); if (!fg) return;
    const bg = bgOf(el);
    const l1 = lum(fg[0],fg[1],fg[2]), l2 = lum(bg[0],bg[1],bg[2]);
    const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const fs = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const large = fs >= 24 || (fs >= 18.66 && bold);
    const min = large ? 3 : 4.5;
    if (ratio < min) {
      const key = cs.color + "|" + bg.join(",");
      if (seen.has(key)) return; seen.add(key);
      res.contrast.push({ ratio: Math.round(ratio*100)/100, min, fs, color: cs.color, bg: "rgb("+bg.join(",")+")", text: el.textContent.trim().slice(0,34), cls: (el.className||"").toString().slice(0,50) });
    }
  });
  res.contrast = res.contrast.sort((a,b)=>a.ratio-b.ratio).slice(0, 8);
  return res;
})()`;

const report = {};
for (const [vp, vw, vh] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, hasTouch: vp === "mobile", isMobile: vp === "mobile" });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", e => consoleErrors.push("pageerror: " + e.message.slice(0,90)));
  page.on("console", m => { if (m.type() === "error") consoleErrors.push("console: " + m.text().slice(0,90)); });
  for (const [path, name] of PAGES) {
    consoleErrors.length = 0;
    await page.goto("http://localhost:3000" + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const a = await page.evaluate(AUDIT);
    a.consoleErrors = [...consoleErrors];
    report[`${vp}:${name}`] = a;
  }
  await ctx.close();
}
console.log(JSON.stringify(report, null, 1));
await browser.close();
