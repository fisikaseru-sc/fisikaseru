const fs = require('fs');

const files = [
  "src/app/modules/page.tsx", 
  "src/app/not-found.tsx", 
  "src/components/landing/CTASection.tsx", 
  "src/components/landing/HeroSection.tsx", 
  "src/components/layout/Navbar.tsx", 
  "src/app/dashboard/page.tsx", 
  "src/app/modules/[moduleSlug]/analysis/page.tsx", 
  "src/app/modules/[moduleSlug]/experiment/page.tsx", 
  "src/app/modules/[moduleSlug]/page.tsx", 
  "src/app/modules/[moduleSlug]/reflection/page.tsx"
];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  
  let useClientIdx = lines.findIndex(l => l.includes('"use client"') || l.includes("'use client'"));
  if (useClientIdx > 0) {
    let ucLine = lines.splice(useClientIdx, 1)[0];
    lines.unshift(ucLine);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Fixed use client in " + file);
  }
}
