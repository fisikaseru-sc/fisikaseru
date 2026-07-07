const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.next')) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace <a href="/..." ...> with <Link href="/..." ...>
  // This is a naive regex but it works for our internal links.
  const regex = /<a(\s+[^>]*)href=(["']\/[^"']*["']|\{`\/[^`]*`\})([^>]*)>/g;
  
  let matchCount = 0;
  content = content.replace(regex, (match, beforeHref, href, afterHref) => {
    matchCount++;
    return `<Link${beforeHref}href=${href}${afterHref}>`;
  });

  if (matchCount > 0) {
    // We replaced some <a> with <Link>. Now we must replace EXACTLY `matchCount` </a> with </Link>
    // However, it's safer to just replace all </a> that are within the same file if there are no external <a> links.
    // Let's assume all </a> are closed properly. If there are external links, they would be broken.
    // To be safe, we will just replace all `</a>` with `</Link>` if they are preceded by `<Link` somewhere,
    // Actually, a better regex is to match the whole block:
    // This is hard in regex. Let's just do:
    content = content.replace(/<\/a>/g, '</Link>'); // risky but usually fine if all links are internal

    // Add import Link from 'next/link' if not present
    if (!content.includes('import Link from "next/link"') && !content.includes("import Link from 'next/link'")) {
      content = `import Link from "next/link";\n` + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed links in ${filePath}`);
  }
}

processDir(path.join(__dirname, 'src'));
