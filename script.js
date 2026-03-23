// ==========================================
// BASE DE DATOS COMPLETA DE PERFUMES
// ==========================================
const perfumesDB = [
    { 
        id: 'liquid-brun', brand: 'French Avenue', name: 'Liquid Brun', gender: 'Unisex', imageUrl: 'liquid-brun.png', bottleClass: 'bottle-brun', notes: ['Vainilla', 'Canela', 'Praliné'], families: ['Dulce', 'Especiado'], popularity: 98, inspiration: 'Althaïr de Parfums de Marly', 
        description: 'Un aroma cálido y sumamente acogedor donde la vainilla, la canela y el praliné se combinan para darte un aire de elegancia inconfundible. Es esa clase de perfume que deja una estela dulce pero madura por donde pasas. Perfecto para usar de noche, en citas o cuando simplemente quieres destacar sin parecer que te esforzaste demasiado.', 
        prices: { sellado: 31000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'vulcan-feu', brand: 'French Avenue', name: 'Vulcan Feu', gender: 'Masculino', imageUrl: 'perfume_attar_house.png', bottleClass: 'bottle-club', notes: ['Mango', 'Jengibre', 'Limón'], families: ['Frutal', 'Cítrico'], popularity: 88, inspiration: 'God of Fire de S.H. Lucas', 
        description: 'Una explosión tropical dominada por un mango jugoso y realista, equilibrado con el toque picante y fresco del jengibre. No es el típico aroma frutal aburrido; tiene muchísima personalidad y un fondo amaderado que lo hace súper versátil. Es tu mejor aliado para llamar la atención en cualquier salida informal o durante el día a día.', 
        prices: { sellado: 40000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'honor-glory', brand: 'Lattafa', name: 'Honor & Glory', gender: 'Unisex', imageUrl: 'honor-glory.png', bottleClass: 'bottle-brun', notes: ['Piña', 'Crème Brûlée'], families: ['Dulce', 'Frutal'], popularity: 96, inspiration: 'Tribeca de Bond No 9', 
        description: 'Imagina el contraste perfecto entre la frescura ácida de una piña recién cortada y el dulzor tostado de una crème brûlée. Este es un perfume cremoso, magnético y que literalmente hace que la gente pregunte qué llevas puesto. Ideal para usar todo el año cuando quieres proyectar una vibra alegre, atractiva y muy original.', 
        prices: { sellado: 26000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'amber-oud-dubai', brand: 'Al Haramain', name: 'Amber Oud Dubai Night', gender: 'Unisex', imageUrl: 'amber-oud-dubai.png', bottleClass: 'bottle-club', notes: ['Bergamota', 'Oud', 'Vainilla'], families: ['Amaderado', 'Especiado'], popularity: 82, inspiration: 'Arabians Tonka de Montale', 
        description: 'Madera de oud, especias cálidas y vainilla en su versión más lujosa y potente. Es un perfume oscuro, imponente y con un rendimiento bestial que dura todo el día en tu piel. Está diseñado exclusivamente para ocasiones especiales, eventos formales o cuando quieres que tu presencia se note en el momento exacto en que entras a la habitación.', 
        prices: { sellado: 50000, decant10: 7000, decant5: 5000, decant3: 4000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'asad-bourbon', brand: 'Lattafa', name: 'Asad Bourbon', gender: 'Masculino', imageUrl: 'bourbon.png', bottleClass: 'bottle-asad', notes: ['Café', 'Vainilla'], families: ['Especiado', 'Dulce'], popularity: 95, inspiration: 'Azzaro The Most Wanted', 
        description: 'El dulzor oscuro e intenso del café tostado se mezcla a la perfección con una vainilla muy masculina y toques especiados. Es un aroma misterioso, con mucho carácter y altamente adictivo. Si buscas una fragancia ganadora para citas nocturnas, fiestas o salidas donde la intención es seducir, esta es una apuesta segura.', 
        prices: { sellado: 30000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'yara', brand: 'Lattafa', name: 'Yara', gender: 'Femenino', imageUrl: 'yara.png', bottleClass: 'bottle-brun', notes: ['Orquídea', 'Vainilla'], families: ['Dulce'], popularity: 100, inspiration: 'Poison Girl de Dior', 
        description: 'Completamente femenino, cremoso y muy dulce. Es el famoso aroma viral que huele a un delicioso batido de frutillas, orquídeas y mucha vainilla. Tiene una textura suave y atalcada que resulta súper reconfortante. Es el perfume perfecto para usar todos los días, ir al trabajo o simplemente oler increíble y delicada en todo momento.', 
        prices: { sellado: 25000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'yara-candy', brand: 'Lattafa', name: 'Yara Candy', gender: 'Femenino', imageUrl: 'yara-candy.png', bottleClass: 'bottle-brun', notes: ['Dulces', 'Frutos Rojos'], families: ['Dulce', 'Frutal'], popularity: 92, inspiration: 'Pink Me Up', 
        description: 'Una versión mucho más juguetona, vibrante y golosa que el Yara clásico. Aquí los protagonistas son los frutos rojos jugosos y unos dulces intensos que te envuelven por completo. Es una fragancia juvenil, magnética y súper divertida, ideal para salidas con amigas, tardes relajadas o cuando necesitas un extra de energía en tu día.', 
        prices: { sellado: 25000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'hawas-fire', brand: 'Rasasi', name: 'Hawas Fire', gender: 'Masculino', imageUrl: 'hawas-fire.png', bottleClass: 'bottle-asad', notes: ['Manzana'], families: ['Especiado'], popularity: 92, inspiration: 'Imperial Valley', 
        description: 'Una salida potente de manzana crujiente que rápidamente evoluciona hacia especias cálidas y un fondo de maderas fuertes. Es una fragancia con muchísima presencia y una proyección que llena cualquier espacio. Totalmente recomendada para quienes buscan proyectar seguridad, carácter y masculinidad en su entorno laboral o en eventos importantes.', 
        prices: { sellado: 44000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'tropical-vibe', brand: 'Rayhaan', name: 'Tropical Vibe', gender: 'Unisex', imageUrl: 'tropical-vibe.png', bottleClass: 'bottle-asad', notes: ['Frutas'], families: ['Frutal'], popularity: 89, inspiration: 'Summer Hammer de Lorenzo Pazzaglia', 
        description: 'Un verdadero cóctel embotellado de frutas tropicales que resulta súper fresco, pero con el dulzor exacto para no pasar desapercibido. Te transporta de inmediato a un ambiente de playa y relajo, sin perder la calidad de un buen perfume. Es la opción número uno para los días de calor, vacaciones o para levantar el ánimo cualquier mañana.', 
        prices: { sellado: 39000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'art-universe', brand: 'Lattafa', name: 'Art Of Universe', gender: 'Unisex', imageUrl: 'art-of-universe.png', bottleClass: 'bottle-asad', notes: ['Bergamota'], families: ['Cítrico'], popularity: 89, inspiration: 'Blue Talisman', 
        description: 'Cítricos limpios, brillantes y modernos que huelen a puro lujo y sofisticación desde el primer spray. Tiene una evolución fresca y muy pulcra que te hace sentir impecable durante horas. Es tan versátil y elegante que funciona perfecto como tu perfume firma, ese que usas todos los días, ya sea para ir a la oficina o salir a cenar.', 
        prices: { sellado: 42000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'his-confession', brand: 'Lattafa', name: 'His Confession', gender: 'Masculino', imageUrl: 'his-confession.png', bottleClass: 'bottle-asad', notes: ['Iris'], families: ['Amaderado'], popularity: 84, inspiration: 'Dior Homme Intense', 
        description: 'La elegancia indiscutible de la nota de iris combinada con un fondo amaderado muy sólido. Es un aroma formal, maduro, seductor y con esa clase que atrapa miradas al instante sin necesidad de gritar. Guárdalo para ocasiones donde vistes bien, reuniones de negocios o esas noches donde buscas dejar una impresión inolvidable y sofisticada.', 
        prices: { sellado: 34000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'hawas-tropical', brand: 'Rasasi', name: 'Hawas Tropical', gender: 'Unisex', imageUrl: 'hawas-tropical.png', bottleClass: 'bottle-asad', notes: ['Piña'], families: ['Frutal'], popularity: 90, inspiration: 'JPG Paradise Garden', 
        description: 'Pura frescura dominada por una piña ácida y jugosa que se siente extremadamente natural y chispeante. Es un aroma súper enérgico, limpio y muy fácil de llevar, pero con una duración excelente para ser tan fresco. Ideal para destacar de día, ir al gimnasio, o soportar las jornadas más calurosas oliendo como recién salido de la ducha.', 
        prices: { sellado: 42000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'philos-pura', brand: 'Maison Alhambra', name: 'Philos Pura', gender: 'Unisex', imageUrl: 'philos-pura.png', bottleClass: 'bottle-brun', notes: ['Frutas', 'Almizcle'], families: ['Frutal', 'Cítrico'], popularity: 87, inspiration: 'Xerjoff Erba Pura', 
        description: 'Una verdadera bomba de frutas cítricas y dulces sostenida por una base de almizcle muy potente. Huele a limpio, a ropa nueva y a lujo, con una proyección brutal que garantiza que la fragancia dure horas y horas en la piel. Es una opción todoterreno, llamativa y alegre que funciona excelente tanto en hombres como en mujeres.', 
        prices: { sellado: 23000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'tag-him', brand: 'Armaf', name: 'Tag-Him Rosso', gender: 'Masculino', imageUrl: 'tag-him.png', bottleClass: 'bottle-club', notes: ['Cardamomo', 'Tonka'], families: ['Dulce', 'Especiado'], popularity: 85, inspiration: 'Invictus Victory', 
        description: 'Una mezcla adictiva de especias dulces, cardamomo y haba tonka diseñada exclusivamente para brillar en la noche. Es un perfume atrevido, moderno y hecho específicamente para generar reacciones y recibir cumplidos continuos. Llévalo a fiestas, bares o discotecas; es una fragancia que compite cara a cara con el humo y la música fuerte.', 
        prices: { sellado: 30000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    },
    { 
        id: 'sceptre-malachite', brand: 'Maison Alhambra', name: 'Sceptre Malachite', gender: 'Unisex', imageUrl: 'mlachite.png', bottleClass: 'bottle-club', notes: ['Mango', 'Especias'], families: ['Frutal', 'Especiado'], popularity: 86, inspiration: 'God of Fire', 
        description: 'Una propuesta frutal totalmente fuera de lo común donde destaca un mango verde, ligeramente ácido y muy especiado. Es un aroma muy fresco, exótico y que rompe con los típicos perfumes comerciales. Si eres de las personas que odian oler igual al resto y buscas un sello personal único e intrigante, esta tiene que ser tu elección.', 
        prices: { sellado: 35000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true } 
    }
];

// BASE DE DATOS DE ACCESORIOS
const accesoriosDB = [
    { id: 'porta-decant', name: 'Porta Decant', description: 'Estuche elegante para transporte seguro.', price: 5000, icon: 'ph ph-briefcase' },
    { id: 'soporte-individual', name: 'Soporte Individual', description: 'Base minimalista para lucir decants.', price: 3000, icon: 'ph ph-codepen-logo' }
];

// MODIFICADO: Definimos un "mapa" global para convertir claves técnicas en nombres bonitos.
const labelsFormatos = {
    'sellado': 'Sellado',
    'decant10': '10ml',
    'decant5': '5ml',
    'decant3': '3ml',
    'Accesorio': 'Accesorio' // Para mantener consistencia con accesorios
};

let cart = JSON.parse(localStorage.getItem('attar_cart')) || [];
let currentSort = 'default', currentGender = 'all', currentBrand = 'all', currentAroma = 'all', currentSearch = '';

// ==========================================
// NAVEGACIÓN Y MENÚS
// ==========================================
function navigateTo(pId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(pId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-target') === pId));
    document.getElementById('navLinks').classList.remove('show');
    window.scrollTo(0,0);
}

document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});

// ROTACIÓN DE ANUNCIOS
function rotateAnnouncements() {
    const list = ["✨ Envío gratis a todo Chile sobre $60.000 ✨", "🎁 Regalo sobre $15.000 en decants o $70.000 total 🎁"];
    let idx = 0; const el = document.getElementById('announcement-text');
    setInterval(() => {
        el.classList.add('fade-out');
        setTimeout(() => {
            idx = (idx + 1) % list.length; el.innerText = list[idx]; el.classList.remove('fade-out');
        }, 400);
    }, 5000);
}

// ==========================================
// FUNCIONES DE FALLBACK VISUAL (BOTELLAS CSS)
// ==========================================
function handleImageError(img, bc) {
    const f = document.createElement('div'); f.className = 'arch-frame';
    f.innerHTML = `<div class="bottle ${bc}"></div>`; img.parentNode.replaceChild(f, img);
}

function handleDetailImageError(img, bc) {
    const f = document.createElement('div'); f.className = 'detail-arch';
    f.innerHTML = `<div class="bottle ${bc}"></div>`; img.parentNode.replaceChild(f, img);
}

// ==========================================
// INICIALIZACIÓN DEL SIDEBAR Y FILTROS
// ==========================================
function initSidebar() {
    document.getElementById('count-all').innerText = perfumesDB.length;
    document.getElementById('count-fem').innerText = perfumesDB.filter(p => p.gender === 'Femenino').length;
    document.getElementById('count-masc').innerText = perfumesDB.filter(p => p.gender === 'Masculino').length;
    document.getElementById('count-uni').innerText = perfumesDB.filter(p => p.gender === 'Unisex').length;

    document.getElementById('count-aroma-all').innerText = perfumesDB.length;
    document.getElementById('count-aroma-dulce').innerText = perfumesDB.filter(p => p.families.includes('Dulce')).length;
    document.getElementById('count-aroma-fresco').innerText = perfumesDB.filter(p => p.families.includes('Fresco')).length;
    document.getElementById('count-aroma-amaderado').innerText = perfumesDB.filter(p => p.families.includes('Amaderado')).length;
    document.getElementById('count-aroma-especiado').innerText = perfumesDB.filter(p => p.families.includes('Especiado')).length;
    document.getElementById('count-aroma-frutal').innerText = perfumesDB.filter(p => p.families.includes('Frutal')).length;
    document.getElementById('count-aroma-citrico').innerText = perfumesDB.filter(p => p.families.includes('Cítrico')).length;

    const brands = [...new Set(perfumesDB.map(p => p.brand))].sort();
    const list = document.getElementById('brand-list');
    list.innerHTML = `<button class="brand-btn active" onclick="setBrand('all', this)">Todas</button>`;
    brands.forEach(b => list.innerHTML += `<button class="brand-btn" onclick="setBrand('${b}', this)">${b}</button>`);
}

function setBrand(v, el) { 
    document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active')); 
    el.classList.add('active'); currentBrand = v; renderCatalog(); 
    if(window.innerWidth <= 768) toggleSidebar();
}

function setSort(v, el) {
    document.querySelectorAll('#sort-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active'); currentSort = v; renderCatalog();
}

function setAroma(v, el) {
    document.querySelectorAll('#aroma-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active'); currentAroma = v; renderCatalog();
    if(window.innerWidth <= 768) toggleSidebar();
}

function setGender(v, el) {
    document.querySelectorAll('#gender-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active'); currentGender = v; renderCatalog();
    if(window.innerWidth <= 768) toggleSidebar();
}

function searchCatalog() { currentSearch = document.getElementById('searchInput').value.toLowerCase(); renderCatalog(); }

// ==========================================
// RENDERIZADO PRINCIPAL
// ==========================================
function renderCatalog() {
    const grid = document.getElementById('catalogo-grid'); grid.innerHTML = '';
    
    let filtered = perfumesDB.filter(p => {
        return (currentBrand === 'all' || p.brand === currentBrand) &&
               (currentGender === 'all' || p.gender === currentGender) &&
               (currentAroma === 'all' || p.families.includes(currentAroma)) &&
               (currentSearch === '' || p.name.toLowerCase().includes(currentSearch) || p.brand.toLowerCase().includes(currentSearch));
    });

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.prices.decant3 - b.prices.decant3);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.prices.decant3 - a.prices.decant3);
    } else if (currentSort === 'popularity') {
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    if(filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; margin-top: 40px;">No encontramos perfumes con esos filtros.</p>`;
        return;
    }

   filtered.forEach(p => {
        const isOut = !p.stock.decant3;
        grid.innerHTML += `
            <div class="product-card ${isOut ? 'card-disabled' : ''}" onclick="openDetail('${p.id}')">
                ${isOut ? '<span class="sold-out-badge">Agotado</span>' : ''}
                <div class="product-image-container">
                    ${p.imageUrl ? `<img src="${p.imageUrl}" alt="Decant de perfume árabe ${p.name} en Valdivia" class="real-img" onerror="handleImageError(this, '${p.bottleClass}')">` : `<div class="arch-frame"><div class="bottle ${p.bottleClass}"></div></div>`}
                </div>
                <div class="product-brand">${p.brand}</div>
                <h3 class="product-title serif">${p.name}</h3>
                <button class="btn-view-detail">${isOut ? 'No Disponible' : `A partir de $${p.prices.decant3.toLocaleString('es-CL')}`}</button>
            </div>`;
    });
}

function renderAccesorios() {
    const grid = document.getElementById('accesorios-grid');
    if(!grid) return;
    grid.innerHTML = '';
    accesoriosDB.forEach(acc => {
        grid.innerHTML += `
            <div class="product-card" style="cursor:default;">
                <div class="product-image-container"><i class="${acc.icon}" style="font-size:3rem; color:var(--gold-primary);"></i></div>
                <h3 class="product-title">${acc.name}</h3>
                <p style="font-size:0.8rem; color:#888; margin-bottom:10px;">${acc.description}</p>
                <div style="font-weight:bold; color:var(--gold-primary); margin-bottom:15px;">$${acc.price.toLocaleString('es-CL')}</div>
                <button class="btn-add-cart" onclick="addAccesorioToCart('${acc.id}')">Añadir al Carrito</button>
            </div>`;
    });
}

// ==========================================
// VISTA DE DETALLE DEL PERFUME
// ==========================================
function openDetail(id) {
    const p = perfumesDB.find(x => x.id === id); const container = document.getElementById('detalle-container');
    const tagsHTML = p.notes.map(n => `<span class="note-tag">${n}</span>`).join('');
    
    // MODIFICADO: Generación de opciones del select usando el mapa de nombres bonitos.
    let opts = ''; 
    for(let k in p.prices) { 
        // Usamos labelsFormatos[k] para obtener 'Sellado', '10ml', etc.
        const nombreFormato = labelsFormatos[k] || k;
        if(p.stock[k] !== false) opts += `<option value="${k}|${p.prices[k]}">${nombreFormato} - $${p.prices[k].toLocaleString('es-CL')}</option>`;
        else opts += `<option disabled>${nombreFormato} - AGOTADO</option>`;
    }

    container.innerHTML = `
        <button class="btn-back" onclick="navigateTo('catalogo')"><i class="ph ph-arrow-left"></i> Volver al catálogo</button>
        <div class="detail-grid">
            <div class="detail-image-col">
                ${p.imageUrl ? `<img src="${p.imageUrl}" class="real-img" onerror="handleDetailImageError(this, '${p.bottleClass}')">` : `<div class="detail-arch"><div class="bottle ${p.bottleClass}"></div></div>`}
            </div>
            <div class="detail-info-col">
                <div class="detail-brand">${p.brand} | ${p.gender}</div>
                <h2 class="detail-title serif">${p.name}</h2>
                <div class="inspiration-badge">Inspirado en: <strong>${p.inspiration}</strong></div>
                <p class="detail-desc">${p.description}</p>
                <div class="detail-notes"><h4>Notas Olfativas Principales</h4><div class="notes-tags" style="justify-content: flex-start;">${tagsHTML}</div></div>
            </div>
            <div class="detail-action-col">
                <div class="purchase-box">
                    <h4 style="margin-bottom:15px; font-size:0.9rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">ELIGE TU FORMATO</h4>
                    <select class="format-select" id="format-detail-${p.id}">${opts}</select>
                    <button class="btn-add-cart-gold" onclick="addToCart('${p.name}', 'format-detail-${p.id}')">
                        <i class="ph ph-shopping-cart" style="font-size: 1.4rem;"></i> Añadir al Carrito
                    </button>
                    <div style="margin-top: 20px; font-size: 0.75rem; color: #888;">
                        <p style="margin-bottom: 5px;">✓ Autenticidad Garantizada</p>
                        <p>✓ Envíos a todo Chile por Starken</p>
                    </div>
                </div>
            </div>
        </div>`;
    navigateTo('detalle-perfume');
}

// ==========================================
// CONTROL DEL CARRITO Y PEDIDOS
// ==========================================
function addToCart(name, sid) {
    const sel = document.getElementById(sid); const [fmt, price] = sel.value.split('|');
    const exist = cart.find(i => i.name === name && i.format === fmt);
    if(exist) exist.quantity++; else cart.push({name, format: fmt, price: parseInt(price), quantity: 1});
    updateCartUI(); document.getElementById('main-cart').classList.add('open');
}

function addAccesorioToCart(id) {
    const acc = accesoriosDB.find(x => x.id === id);
    const exist = cart.find(i => i.name === acc.name);
    if(exist) exist.quantity++; else cart.push({ name: acc.name, format: 'Accesorio', price: acc.price, quantity: 1 });
    updateCartUI();
    toggleCart();
}

function updateQty(idx, mod) {
    cart[idx].quantity += mod; if(cart[idx].quantity <= 0) cart.splice(idx, 1);
    updateCartUI();
}

function updateCartUI() {
    const items = document.getElementById('cart-items'); localStorage.setItem('attar_cart', JSON.stringify(cart));
    items.innerHTML = ''; let total = 0, dTotal = 0;
    
    cart.forEach((i, idx) => {
        let sub = i.price * i.quantity; 
        total += sub; 
        
        // MODIFICADO: Cálculo de total en decants usando la clave técnica ('decant') antes de formatear
        if(i.format.startsWith('decant')) dTotal += sub;
        
        // MODIFICADO: Usamos el mapa labelsFormatos para mostrar 'Sellado', '10ml' en el HTML del carrito
        const displayFormat = labelsFormatos[i.format] || i.format;

        items.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info"><h4>${i.name}</h4><p>${displayFormat}</p><b>$${sub.toLocaleString('es-CL')}</b></div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQty(${idx}, -1)">-</button><span>${i.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button>
                    <button class="remove-btn" onclick="updateQty(${idx}, -999)"><i class="ph ph-trash"></i></button>
                </div>
            </div>`;
    });
    
    document.getElementById('cart-total-price').innerText = total.toLocaleString('es-CL');
    document.getElementById('cart-badge').innerText = cart.reduce((a,b)=>a+b.quantity,0);
    
    const prog = document.getElementById('shipping-progress-container');
    const giftBox = document.getElementById('free-gift-container');
    
    if(cart.length > 0) {
        prog.style.display = 'block';
        let giftMsg = '';
        let shipMsg = '';

        if(dTotal >= 15000 || total >= 70000) {
            giftMsg = `<div class='shipping-success' style='color: var(--gold-primary); font-weight: 600;'><i class='ph ph-gift'></i> ¡Ganaste un decant de regalo!</div>`;
            giftBox.style.display = 'block';
        } else {
            let dLeft = 15000 - dTotal; let tLeft = 70000 - total;
            giftMsg = `<div>Agrega <strong style="color: var(--gold-primary);">$${dLeft.toLocaleString('es-CL')} en decants</strong> o <strong style="color: var(--gold-primary);">$${tLeft.toLocaleString('es-CL')} al total</strong> para tu 🎁.</div>`;
            giftBox.style.display = 'none';
        }

        if(total >= 60000) {
            shipMsg = `<div class="shipping-success" style="margin-top: 8px; color: #25D366; font-weight: bold;"><i class="ph ph-check-circle" style="font-size: 1.1rem; vertical-align: middle;"></i> ¡Envío gratis alcanzado!</div>`;
        } else {
            let shipLeft = 60000 - total;
            shipMsg = `<div style="margin-top: 8px; font-size: 0.85rem;">Faltan <strong style="color: var(--gold-primary);">$${shipLeft.toLocaleString('es-CL')}</strong> para envío gratis.</div>`;
        }

        prog.innerHTML = `${giftMsg}${shipMsg}`;
    } else {
        prog.style.display = 'none'; giftBox.style.display = 'none';
        items.innerHTML = '<p style="text-align:center; color:#555; margin-top:20px;">Tu carrito está vacío</p>';
    }
}

// ENVIAR POR WHATSAPP
function sendWhatsAppOrder() {
    if(cart.length === 0) return alert("Tu carrito está vacío.");
    let t = "¡Hola Attar House! Me gustaría realizar el siguiente pedido:%0A%0A";
    
    let total = 0;
    cart.forEach(i => { 
        let sub = i.price * i.quantity;
        total += sub;
        
        // MODIFICADO: Usamos el mapa labelsFormatos para que el mensaje de WhatsApp diga 'Sellado', '10ml'
        const displayFormat = labelsFormatos[i.format] || i.format;
        t += `▪ ${i.quantity}x ${i.name} (${displayFormat}) - $${sub.toLocaleString('es-CL')}%0A`;
    });
    
    t += `%0A*Total Estimado: $${total.toLocaleString('es-CL')}*%0A`;

    if(total >= 60000) t += `🚚 *¡Mi pedido califica para ENVÍO GRATIS!*%0A`;
    if(document.getElementById('free-gift-container').style.display === 'block') {
        t += `🎁 *Mi pedido incluye un regalo: ${document.getElementById('free-gift-select').value}*%0A`;
    }
    
    t += `%0AQuedo atento/a para coordinar el pago y la entrega.`;
    window.open(`https://wa.me/56930679481?text=${t}`, '_blank');
}

// ==========================================
// ==========================================
// UTILIDADES Y EVENTOS DE VENTANA
// ==========================================
function toggleCart() { document.getElementById('main-cart').classList.toggle('open'); }
function toggleSidebar() { document.getElementById('catalog-sidebar').classList.toggle('open'); }
function toggleFaq(el) { el.classList.toggle('active'); }

window.onload = () => {
    initSidebar(); 
    renderCatalog(); 
    renderAccesorios();
    rotateAnnouncements(); 
    updateCartUI();
    
    const giftSelect = document.getElementById('free-gift-select');
    
    // MODIFICADO: Agregamos " - Decant 3ml" al texto visible y al valor que se envía por WhatsApp
    perfumesDB.forEach(p => {
        giftSelect.innerHTML += `<option value="${p.name} (Decant 3ml)">${p.name} - Decant 3ml</option>`;
    });
};
