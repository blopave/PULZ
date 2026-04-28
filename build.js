const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const csso = require('csso');

const DIST = path.join(__dirname, 'dist');

// Files to process
const jsFiles = ['js/i18n.js', 'js/auth.js', 'js/data.js', 'js/app.js'];
const cssFiles = ['css/style.css'];
const htmlFiles = ['index.html', 'privacy.html', 'terms.html', '404.html'];
const copyFiles = ['robots.txt', 'sitemap.xml', 'manifest.json', 'sw.js', 'favicon.ico'];
const copyDirs = ['img'];

// Adds ?v=<buildId> to refs like href="css/x.css", src="js/x.js" (with or without leading slash).
// Skips already-versioned URLs and external URLs.
function versionAssetRefs(text, buildId) {
  return text.replace(
    /(href|src)=("|')(\/?(?:css|js)\/[^"'?]+)\2/g,
    (_m, attr, q, url) => `${attr}=${q}${url}?v=${buildId}${q}`
  );
}

// Versions the URLs inside the SW precache list (single-quoted paths to /css or /js).
function versionSwAssets(text, buildId) {
  return text.replace(
    /'(\/(?:css|js)\/[^']+)'/g,
    (_m, url) => `'${url}?v=${buildId}'`
  );
}

async function build() {
  console.log('Building PULZ for production...\n');

  // Build version stamp (forces SW + cache invalidation per deploy)
  const buildId = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12); // YYYYMMDDHHmm
  console.log(`  Build ID: ${buildId}\n`);

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

  // Process HTML — version every css/js asset ref so each deploy busts browser cache
  for (const file of htmlFiles) {
    const src = path.join(__dirname, file);
    if (!fs.existsSync(src)) continue;
    const html = fs.readFileSync(src, 'utf8');
    const versioned = versionAssetRefs(html, buildId);
    fs.writeFileSync(path.join(DIST, file), versioned);
    console.log(`  HTML ${file}: versioned`);
  }

  // Copy static files (sw.js gets cache name + asset URLs stamped with buildId)
  for (const file of copyFiles) {
    const src = path.join(__dirname, file);
    if (!fs.existsSync(src)) continue;
    if (file === 'sw.js') {
      let swSrc = fs.readFileSync(src, 'utf8');
      swSrc = swSrc.replace(/const\s+CACHE\s*=\s*['"][^'"]+['"]/, `const CACHE='pulz-v${buildId}'`);
      swSrc = versionSwAssets(swSrc, buildId);
      fs.writeFileSync(path.join(DIST, file), swSrc);
      console.log(`  COPY ${file} (cache: pulz-v${buildId}, assets versioned)`);
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

  // Post-build smoke check: every script/link to local css/js must carry ?v=
  const checkPattern = /(href|src)=("|')(\/?(?:css|js)\/[^"'?]+)\2/g;
  for (const file of htmlFiles) {
    const out = path.join(DIST, file);
    if (!fs.existsSync(out)) continue;
    const html = fs.readFileSync(out, 'utf8');
    const unversioned = [...html.matchAll(checkPattern)];
    if (unversioned.length > 0) {
      console.error(`\n  ✗ Build check failed: ${file} has ${unversioned.length} unversioned asset ref(s):`);
      unversioned.forEach(m => console.error(`      ${m[0]}`));
      process.exit(1);
    }
  }
  console.log(`  ✓ Build check: all HTML asset refs versioned with ?v=${buildId}`);

  const totalSaved = jsSaved + cssSaved;
  console.log(`\n  Total saved: ${(totalSaved / 1024).toFixed(1)}KB`);
  console.log('  Build complete → dist/\n');
}

build().catch(err => { console.error(err); process.exit(1); });
