#!/usr/bin/env node
/**
 * Carga masiva de stock inicial por cantidad (Brief 4).
 *
 * Lee scripts/stock-inicial.csv y actualiza qty_sellado/decant10/decant5/decant3
 * en public.perfumes. Los booleanos stock_* y stock_low se recalculan solos por
 * el trigger de la base — este script solo escribe las cantidades.
 *
 * Uso (desde la raíz del repo):
 *   node scripts/cargar-stock.mjs               # DRY-RUN: solo muestra el diff, no escribe
 *   node scripts/cargar-stock.mjs --apply       # aplica los cambios a Supabase
 *   node scripts/cargar-stock.mjs --csv otra.csv [--apply]
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (las lee de
 * .env.local automáticamente). Usa service role → salta RLS. NO subir la key.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const COLS = ["qty_sellado", "qty_decant10", "qty_decant5", "qty_decant3"];

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const csvArg = args[args.indexOf("--csv") + 1];
const CSV_PATH = args.includes("--csv") && csvArg ? resolve(csvArg) : join(__dirname, "stock-inicial.csv");

// --- Carga de variables de entorno desde .env.local (sin dependencias) ---
function loadEnv() {
  const out = { ...process.env };
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* si no hay .env.local, se usa process.env */ }
  return out;
}

// --- Parser CSV mínimo con soporte de campos entre comillas ---
function parseCSV(text) {
  const rows = [];
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const fields = [];
    let cur = "", inQ = false;
    for (let i = 0; i < rawLine.length; i++) {
      const c = rawLine[i];
      if (inQ) {
        if (c === '"' && rawLine[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { fields.push(cur); cur = ""; }
      else cur += c;
    }
    fields.push(cur);
    rows.push(fields.map((f) => f.trim()));
  }
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

function num(v, ctx) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`Cantidad inválida "${v}" en ${ctx} (debe ser un entero >= 0)`);
  }
  return n;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (revisa .env.local).");
    process.exit(1);
  }

  const rows = parseCSV(readFileSync(CSV_PATH, "utf8"));
  if (!rows.length) { console.error("✗ El CSV no tiene filas."); process.exit(1); }
  console.log(`Leídas ${rows.length} filas de ${CSV_PATH}\n`);

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: current, error } = await sb
    .from("perfumes")
    .select("id, name, qty_sellado, qty_decant10, qty_decant5, qty_decant3");
  if (error) { console.error("✗ Error leyendo el catálogo:", error.message); process.exit(1); }
  const byId = new Map(current.map((p) => [p.id, p]));

  const changes = [];
  const missing = [];
  for (const row of rows) {
    const id = (row.id || "").trim();
    if (!id) continue;
    const cur = byId.get(id);
    if (!cur) { missing.push(id); continue; }
    const next = {};
    let diff = false;
    for (const col of COLS) {
      const v = num(row[col], `${id}.${col}`);
      next[col] = v;
      if (v !== cur[col]) diff = true;
    }
    if (diff) changes.push({ id, name: cur.name, before: cur, after: next });
  }

  if (missing.length) {
    console.log(`⚠ ${missing.length} id(s) del CSV no existen en el catálogo (se ignoran):`);
    console.log("  " + missing.join(", ") + "\n");
  }

  if (!changes.length) {
    console.log("✓ Nada que cambiar: el CSV ya coincide con la base.");
    return;
  }

  console.log(`Cambios detectados (${changes.length}):`);
  for (const c of changes) {
    const parts = COLS
      .filter((col) => c.before[col] !== c.after[col])
      .map((col) => `${col.replace("qty_", "")} ${c.before[col]}→${c.after[col]}`);
    console.log(`  • ${c.name} (${c.id}): ${parts.join(", ")}`);
  }
  console.log("");

  if (!APPLY) {
    console.log("DRY-RUN. No se escribió nada. Corre de nuevo con --apply para aplicar.");
    return;
  }

  let ok = 0;
  for (const c of changes) {
    const { error: upErr } = await sb.from("perfumes").update(c.after).eq("id", c.id);
    if (upErr) console.error(`  ✗ ${c.id}: ${upErr.message}`);
    else ok++;
  }
  console.log(`\n✓ Aplicados ${ok}/${changes.length} cambios.`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
