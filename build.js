const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const csso = require('csso');

const DIST = path.join(__dirname, 'dist');

// Files to process
const jsFiles = ['js/i18n.js', 'js/auth.js', 'js/data.js', 'js/app.js'];
const cssFiles = ['css/style.css'];
const copyFiles = ['robots.txt', 'sitemap.xml', 'manifest.json', 'sw.js', 'privacy.html', 'terms.html', '404.html', 'favicon.ico'];
const copyDirs = ['img'];

async function build() {
  console.log('Building PULZ for production...\n');

  // Clean dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });

  // Minify JS
  let jsSaved = 0;
  for (const file of jsFiles) {
    const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const result = await minify(src, { compress: true, mangle: true });
    const out = path.join(DIST, file);
    fs.writeFileSync(out, result.code);
    const saved = src.length - result.code.length;
    jsSaved += saved;
    console.log(`  JS  ${file}: ${(src.length / 1024).toFixed(1)}KB → ${(result.code.length / 1024).toFixed(1)}KB (-${(saved / 1024).toFixed(1)}KB)`);
  }

  // Minify CSS
  let cssSaved = 0;
  for (const file of cssFiles) {
    const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const result = csso.minify(src);
    const out = path.join(DIST, file);
    fs.writeFileSync(out, result.css);
    const saved = src.length - result.css.length;
    cssSaved += saved;
    console.log(`  CSS ${file}: ${(src.length / 1024).toFixed(1)}KB → ${(result.css.length / 1024).toFixed(1)}KB (-${(saved / 1024).toFixed(1)}KB)`);
  }

  // Process HTML — update script refs if needed
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  console.log(`  HTML index.html: copied`);

  // Build version stamp (forces SW + cache invalidation per deploy)
  const buildId = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12); // YYYYMMDDHHmm

  // Copy static files
  for (const file of copyFiles) {
    const src = path.join(__dirname, file);
    if (!fs.existsSync(src)) continue;
    if (file === 'sw.js') {
      const swSrc = fs.readFileSync(src, 'utf8');
      const stamped = swSrc.replace(/const\s+CACHE\s*=\s*['"][^'"]+['"]/, `const CACHE='pulz-v${buildId}'`);
      fs.writeFileSync(path.join(DIST, file), stamped);
      console.log(`  COPY ${file} (cache: pulz-v${buildId})`);
    } else {
      fs.copyFileSync(src, path.join(DIST, file));
      console.log(`  COPY ${file}`);
    }
  }

  // Copy directories
  for (const dir of copyDirs) {
    const srcDir = path.join(__dirname, dir);
    if (fs.existsSync(srcDir)) {
      fs.cpSync(srcDir, path.join(DIST, dir), { recursive: true });
      console.log(`  COPY ${dir}/`);
    }
  }

  const totalSaved = jsSaved + cssSaved;
  console.log(`\n  Total saved: ${(totalSaved / 1024).toFixed(1)}KB`);
  console.log('  Build complete → dist/\n');
}

build().catch(err => { console.error(err); process.exit(1); });
