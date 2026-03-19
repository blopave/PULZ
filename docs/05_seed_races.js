#!/usr/bin/env node
/**
 * PULZ — Seed Script
 * Reads hardcoded races from data.js and generates SQL INSERT statements
 * for the Supabase races table.
 *
 * Usage: node docs/05_seed_races.js > docs/05_seed_races.sql
 */

const fs = require('fs');
const path = require('path');

// Read data.js and extract the R object
const dataJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');

// Extract R = { ... }; block
const rMatch = dataJs.match(/let R=(\{[\s\S]*?\n\});/);
if (!rMatch) {
  console.error('Could not find R object in data.js');
  process.exit(1);
}

// Evaluate R safely by wrapping in a function
let R;
try {
  R = new Function(`return ${rMatch[1]}`)();
} catch (e) {
  console.error('Failed to parse R object:', e.message);
  process.exit(1);
}

// Map type values
function mapType(t) {
  return t === 'asfalto' ? 'road' : 'trail';
}

// Escape single quotes for SQL
function esc(s) {
  if (!s) return null;
  return s.replace(/'/g, "''");
}

// Generate SQL
const lines = [];
lines.push('-- ============================================================');
lines.push('-- PULZ — Seed Races (auto-generated, safe to re-run)');
lines.push(`-- Generated: ${new Date().toISOString().slice(0, 10)}`);
lines.push(`-- Run in Supabase SQL Editor`);
lines.push('-- Skips races that already exist (same name + date + country)');
lines.push('-- ============================================================');
lines.push('');
lines.push('-- Ensure countries exist first');
lines.push(`INSERT INTO countries (id, code, name, name_en, name_pt, sort_order) VALUES`);
lines.push(`  ('argentina', 'AR', 'Argentina', 'Argentina', 'Argentina', 1),`);
lines.push(`  ('chile', 'CL', 'Chile', 'Chile', 'Chile', 2),`);
lines.push(`  ('brasil', 'BR', 'Brasil', 'Brazil', 'Brasil', 3),`);
lines.push(`  ('uruguay', 'UY', 'Uruguay', 'Uruguay', 'Uruguai', 4),`);
lines.push(`  ('colombia', 'CO', 'Colombia', 'Colombia', 'Colômbia', 5),`);
lines.push(`  ('peru', 'PE', 'Perú', 'Peru', 'Peru', 6)`);
lines.push(`ON CONFLICT (id) DO NOTHING;`);
lines.push('');
lines.push('-- Add unique constraint to prevent duplicates (safe if already exists)');
lines.push(`ALTER TABLE races ADD CONSTRAINT races_name_date_country_unique UNIQUE (name, date, country_id);`);
lines.push('');
lines.push('-- ============================================================');
lines.push('-- RACES (uses ON CONFLICT to skip existing)');
lines.push('-- ============================================================');
lines.push('');

let totalCount = 0;

for (const [countryId, races] of Object.entries(R)) {
  if (!races || !races.length) continue;

  lines.push(`-- ${countryId.toUpperCase()} (${races.length} races)`);
  lines.push('');

  for (const race of races) {
    const name = esc(race.n);
    const date = race.d;
    const location = esc(race.l);
    const categories = `ARRAY[${race.c.map(c => `'${esc(c)}'`).join(',')}]::text[]`;
    const type = mapType(race.t);
    const website = race.w ? `'${esc(race.w)}'` : 'NULL';
    const description = race.desc ? `'${esc(race.desc)}'` : 'NULL';
    const price = race.price ? `'${esc(race.price)}'` : 'NULL';
    const isIconic = race.i === 1 ? 'TRUE' : 'FALSE';
    const status = race.s === 'c' ? 'confirmed' : 'estimated';
    const source = race.source || 'pulz';

    lines.push(`INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)`);
    lines.push(`VALUES ('${name}', '${date}', '${countryId}', '${location}', ${categories}, '${type}', ${website}, ${description}, ${price}, ${isIconic}, '${status}', '${source}', 'approved')`);
    lines.push(`ON CONFLICT (name, date, country_id) DO NOTHING;`);
    lines.push('');
    totalCount++;
  }
}

lines.push(`-- Total: ${totalCount} races seeded`);

console.log(lines.join('\n'));
