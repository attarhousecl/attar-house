// ============================================================
// ATTAR HOUSE — Conexión a Supabase
// ============================================================
// Pega aquí los valores de tu proyecto Supabase.
// Los encuentras en: supabase.com → tu proyecto → Settings → API
//
//   SUPABASE_URL  → "Project URL"
//   SUPABASE_ANON → "anon public" (bajo "Project API keys")
// ============================================================

const SUPABASE_URL  = 'https://lplegpsqsraqtumiqape.supabase.co';   // ← reemplaza
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbGVncHNxc3JhcXR1bWlxYXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjEyNDAsImV4cCI6MjA5Njc5NzI0MH0.jQoXVDcw1HGwjSefGEg9T68aaBnxqlVHPqlJ_-NnB2A';    // ← reemplaza

// ── Variables globales del catálogo ──────────────────────────
// Se llenan automáticamente al cargar la página desde Supabase.
let perfumesDB = [];
let designerDB = [];
let arabDB     = [];

const labelsFormatos = {
    'sellado':   'Sellado',
    'decant10':  '10ml',
    'decant5':   '5ml',
    'decant3':   '3ml',
    'Accesorio': 'Accesorio'
};

// ── Accesorios (sin cambios, siguen en el código) ────────────
const accesoriosDB = [
    { id: 'llavero-porta-decant', name: 'Llavero porta decant', description: 'Estuche elegante para transporte seguro.', price: 1500, icon: 'ph ph-briefcase' },
    { id: 'soporte-individual',   name: 'Soporte Individual',   description: 'Base minimalista para lucir decants.',      price: 500,  icon: 'ph ph-codepen-logo' }
];

// ── Cargar catálogo desde Supabase ───────────────────────────
async function loadPerfumes() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/perfumes?order=popularity.desc`,
        {
            headers: {
                'apikey':        SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`
            }
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase error ${res.status}: ${err}`);
    }

    const rows = await res.json();

    // Convertir filas de Supabase al formato que usa la web
    perfumesDB = rows.map(r => ({
        id:          r.id,
        brand:       r.brand,
        name:        r.name,
        gender:      r.gender,
        imageUrl:    r.image_url    || '',
        bottleClass: r.bottle_class || 'bottle-asad',
        notes:       r.notes        || [],
        families:    r.families     || [],
        popularity:  r.popularity   || 80,
        inspiration: r.inspiration  || '',
        description: r.description  || '',
        prices: {
            sellado:  r.price_sellado  || 0,
            decant10: r.price_decant10 || 0,
            decant5:  r.price_decant5  || 0,
            decant3:  r.price_decant3  || 0
        },
        stock: {
            sellado:  r.stock_sellado,
            decant10: r.stock_decant10,
            decant5:  r.stock_decant5,
            decant3:  r.stock_decant3
        }
    }));

    designerDB = perfumesDB.filter(p => p.inspiration === 'Diseñador Original');
    arabDB     = perfumesDB.filter(p => p.inspiration !== 'Diseñador Original');
}
