// Los datos del catálogo viven en perfumes.js
// (cargado antes que este script en index.html)

let cart = JSON.parse(localStorage.getItem('attar_cart')) || [];
let reviews = JSON.parse(localStorage.getItem('attar_reviews')) || {};
let currentSort = 'default', currentGender = 'all', currentBrand = 'all', currentAroma = 'all', currentSearch = '';
let selectedReviewRating = 0;

// ==========================================
// NAVEGACIÓN Y MENÚS
// ==========================================
function navigateTo(pId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(pId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-target') === pId));
    document.getElementById('navLinks').classList.remove('show');
    window.scrollTo(0,0);
    // Actualizar historial del navegador
    history.pushState({ page: pId }, '', '#' + pId);
}

// Manejar botón atrás del navegador
window.addEventListener('popstate', (e) => {
    const pId = e.state?.page || 'inicio';
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(pId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-target') === pId));
    window.scrollTo(0,0);
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('show');
    });
});

// ROTACIÓN DE ANUNCIOS
function rotateAnnouncements() {
    const list = [
        "✨ Envío gratis a todo Chile sobre $60.000 ✨", 
        "🎁 ¡Llevate un DECANT DE REGALO por compras sobre $15.000 en decants! 🎁",
    ];
    // ... resto del código
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
    document.getElementById('count-all').innerText = arabDB.length;
    document.getElementById('count-fem').innerText = arabDB.filter(p => p.gender === 'Femenino').length;
    document.getElementById('count-masc').innerText = arabDB.filter(p => p.gender === 'Masculino').length;
    document.getElementById('count-uni').innerText = arabDB.filter(p => p.gender === 'Unisex').length;

    document.getElementById('count-aroma-all').innerText = arabDB.length;
    document.getElementById('count-aroma-dulce').innerText = arabDB.filter(p => p.families.includes('Dulce')).length;
    document.getElementById('count-aroma-fresco').innerText = arabDB.filter(p => p.families.includes('Fresco')).length;
    document.getElementById('count-aroma-amaderado').innerText = arabDB.filter(p => p.families.includes('Amaderado')).length;
    document.getElementById('count-aroma-especiado').innerText = arabDB.filter(p => p.families.includes('Especiado')).length;
    document.getElementById('count-aroma-frutal').innerText = arabDB.filter(p => p.families.includes('Frutal')).length;
    document.getElementById('count-aroma-citrico').innerText = arabDB.filter(p => p.families.includes('Cítrico')).length;

    const brands = [...new Set(arabDB.map(p => p.brand))].sort();
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

function renderDesigner() {
    const grid = document.getElementById('designer-grid');
    if(!grid) return;
    grid.innerHTML = '';
    designerDB.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `product-card designer-card`;
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => openDetail(p.id, 'disenador');
        card.innerHTML = `
            <div class="card-image-area">
                <span class="designer-badge-card">✦ Diseñador</span>
                <div class="product-image-container">
                    ${p.imageUrl
                        ? `<img src="${p.imageUrl}" alt="${p.name}" class="real-img" onerror="handleImageError(this, '${p.bottleClass}')">`
                        : `<div class="arch-frame"><div class="bottle ${p.bottleClass}"></div></div>`
                    }
                </div>
            </div>
            <div class="card-body">
                <div class="product-brand">${p.brand}</div>
                <h3 class="product-title serif">${p.name}</h3>
                <span class="gender-tag">${p.gender}</span>
                <div class="notes-tags">${p.notes.slice(0,3).map(n => `<span class="note-tag">${n}</span>`).join('')}</div>
                <div class="card-price">Decant desde <strong>$${p.prices.decant3.toLocaleString('es-CL')}</strong></div>
                <button class="btn-view-detail">Ver Detalles</button>
            </div>`;
        grid.appendChild(card);
    });
}

// ==========================================
// RENDERIZADO PRINCIPAL
// ==========================================
function renderCatalog() {
    const grid = document.getElementById('catalogo-grid'); 
    grid.innerHTML = '';
    
    let filtered = arabDB.filter(p => {
        const matchBrand = currentBrand === 'all' || p.brand === currentBrand;
        const matchGender = currentGender === 'all' || p.gender === currentGender;
        const matchAroma = currentAroma === 'all' || p.families.includes(currentAroma);
        const matchSearch = currentSearch === '' || 
            p.name.toLowerCase().includes(currentSearch) || 
            p.brand.toLowerCase().includes(currentSearch) ||
            p.notes.some(n => n.toLowerCase().includes(currentSearch)) ||
            p.families.some(f => f.toLowerCase().includes(currentSearch));
        return matchBrand && matchGender && matchAroma && matchSearch;
    });

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.prices.decant3 - b.prices.decant3);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.prices.decant3 - a.prices.decant3);
    } else if (currentSort === 'popularity') {
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    if(filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; margin-top: 40px; padding: 40px;">
            <i class="ph ph-magnifying-glass" style="font-size:2rem; display:block; margin-bottom:10px; color: var(--border-gold);"></i>
            No encontramos perfumes con esos filtros.
        </p>`;
        return;
    }

    filtered.forEach((p, index) => {
        const isOut = !p.stock.decant3;
        const isPopular = p.popularity >= 95;
        
        const card = document.createElement('div');
        card.className = `product-card ${isOut ? 'card-disabled' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => openDetail(p.id);
        
        card.innerHTML = `
            <div class="card-image-area">
                ${isOut ? '<span class="sold-out-badge">Agotado</span>' : ''}
                <div class="product-image-container">
                    ${p.imageUrl 
                        ? `<img src="${p.imageUrl}" alt="Decant de perfume árabe ${p.name} en Valdivia" class="real-img" onerror="handleImageError(this, '${p.bottleClass}')">`
                        : `<div class="arch-frame"><div class="bottle ${p.bottleClass}"></div></div>`
                    }
                </div>
            </div>
            <div class="card-body">
                ${isPopular && !isOut ? '<span class="popularity-badge">⭐ Popular</span>' : ''}
                <div class="product-brand">${p.brand}</div>
                <h3 class="product-title serif">${p.name}</h3>
                <span class="gender-tag">${p.gender}</span>
                <div class="notes-tags">${p.notes.slice(0,3).map(n => `<span class="note-tag">${n}</span>`).join('')}</div>
                <div class="card-price">Desde <strong>$${p.prices.decant3.toLocaleString('es-CL')}</strong></div>
                <button class="btn-view-detail">${isOut ? 'No Disponible' : 'Ver Detalles'}</button>
            </div>`;
        
        grid.appendChild(card);
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

function getStarsHTML(rating, interactive = false, prefix = '') {
    let html = '<div class="stars">';
    for(let i = 1; i <= 5; i++) {
        if(interactive) {
            html += `<i class="ph ph-star star ${i <= rating ? 'filled' : ''}" onclick="setReviewRating(${i})" data-val="${i}"></i>`;
        } else {
            html += `<i class="ph ${i <= Math.round(rating) ? 'ph-star-fill' : 'ph-star'} star ${i <= Math.round(rating) ? 'filled' : ''}"></i>`;
        }
    }
    html += '</div>';
    return html;
}

function getAvgRating(perfumeId) {
    const r = reviews[perfumeId] || [];
    if(r.length === 0) return 0;
    return r.reduce((a,b) => a + b.rating, 0) / r.length;
}

function renderReviews(perfumeId) {
    const r = reviews[perfumeId] || [];
    const avg = getAvgRating(perfumeId);
    
    const summaryHTML = r.length > 0 ? `
        <div class="reviews-summary">
            <div class="reviews-avg">${avg.toFixed(1)}</div>
            <div>
                ${getStarsHTML(avg)}
                <div class="reviews-count">${r.length} reseña${r.length !== 1 ? 's' : ''}</div>
            </div>
        </div>
    ` : '';
    
    const reviewsListHTML = r.map(rv => `
        <div class="review-card">
            <div class="review-card-header">
                <div>
                    <div class="review-author">${rv.author}</div>
                    ${getStarsHTML(rv.rating)}
                </div>
                <div class="review-date">${rv.date}</div>
            </div>
            <div class="review-text">${rv.text}</div>
        </div>
    `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:15px;">Sé el primero en dejar una reseña.</p>';

    return `
        <div class="reviews-section">
            <h4>Reseñas</h4>
            ${summaryHTML}
            ${reviewsListHTML}
            <div class="review-form">
                <h5>Deja tu opinión</h5>
                <div class="review-form-stars" id="review-stars-${perfumeId}">
                    ${[1,2,3,4,5].map(i => `<span class="review-form-star" onclick="setReviewRating('${perfumeId}',${i})">★</span>`).join('')}
                </div>
                <input type="text" class="review-name-input" id="review-name-${perfumeId}" placeholder="Tu nombre" maxlength="40">
                <textarea class="review-text-input" id="review-text-${perfumeId}" placeholder="¿Qué te pareció esta fragancia?" rows="3" maxlength="300"></textarea>
                <button class="btn-submit-review" onclick="submitReview('${perfumeId}')">Publicar Reseña</button>
            </div>
        </div>
    `;
}

function setReviewRating(perfumeId, val) {
    selectedReviewRating = val;
    const stars = document.querySelectorAll(`#review-stars-${perfumeId} .review-form-star`);
    stars.forEach((s, i) => {
        s.style.color = i < val ? 'var(--gold-primary)' : 'var(--gold-dark)';
    });
}

function submitReview(perfumeId) {
    const name = document.getElementById(`review-name-${perfumeId}`).value.trim();
    const text = document.getElementById(`review-text-${perfumeId}`).value.trim();
    if(!name || !text || selectedReviewRating === 0) {
        showToast('⚠️ Completa todos los campos y selecciona una puntuación.');
        return;
    }
    if(!reviews[perfumeId]) reviews[perfumeId] = [];
    reviews[perfumeId].unshift({
        author: name,
        rating: selectedReviewRating,
        text: text,
        date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
    });
    localStorage.setItem('attar_reviews', JSON.stringify(reviews));
    selectedReviewRating = 0;
    showToast('✓ ¡Gracias por tu reseña!');
    openDetail(perfumeId, perfumesDB.find(x=>x.id===perfumeId)?.inspiration === 'Diseñador Original' ? 'disenador' : 'catalogo');
}

function openDetail(id, origen = 'catalogo') {
    const p = perfumesDB.find(x => x.id === id);
    const container = document.getElementById('detalle-container');
    const tagsHTML = p.notes.map(n => `<span class="note-tag">${n}</span>`).join('');
    
    let opts = ''; 
    for(let k in p.prices) { 
        const nombreFormato = labelsFormatos[k] || k;
        // Saltar opciones con precio 0 (ej. sellado de diseñador)
        if(p.prices[k] === 0) continue;
        if(p.stock[k] !== false) opts += `<option value="${k}|${p.prices[k]}">${nombreFormato} - $${p.prices[k].toLocaleString('es-CL')}</option>`;
        else opts += `<option disabled>${nombreFormato} - AGOTADO</option>`;
    }

    const esDisenador = p.inspiration === 'Diseñador Original';
    const seccionOrigen = esDisenador ? 'disenador' : origen;
    const labelVolver = esDisenador ? 'Volver a Diseñador' : 'Volver al catálogo';

    container.innerHTML = `
        <button class="btn-back" onclick="navigateTo('${seccionOrigen}')"><i class="ph ph-arrow-left"></i> ${labelVolver}</button>
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
                ${renderReviews(p.id)}
            </div>
            <div class="detail-action-col">
                <div class="purchase-box">
                    <h4 style="margin-bottom:15px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--gold-primary); border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">Elige tu formato</h4>
                    <select class="format-select" id="format-detail-${p.id}">${opts}</select>
                    <button class="btn-add-cart-gold" onclick="addToCart('${p.id}', 'format-detail-${p.id}')">
                        <i class="ph ph-shopping-cart" style="font-size: 1.2rem;"></i> Añadir al Carrito
                    </button>
                    <div style="margin-top: 18px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.8;">
                        <p>✓ Autenticidad Garantizada</p>
                        <p>✓ Envíos a todo Chile por Starken</p>
                    </div>
                </div>
            </div>
        </div>`;
    if (!document.getElementById('detalle-perfume').classList.contains('active')) {
        navigateTo('detalle-perfume');
    }
}

// ==========================================
// CONTROL DEL CARRITO Y PEDIDOS
// ==========================================
function addToCart(perfumeId, sid) {
    const sel = document.getElementById(sid);
    if(!sel || !sel.value) return;
    const [fmt, price] = sel.value.split('|');
    if(!fmt || !price) return;
    // Buscar nombre real desde la DB usando el id
    const perfume = perfumesDB.find(p => p.id === perfumeId);
    const name = perfume ? perfume.name : perfumeId;
    const exist = cart.find(i => i.name === name && i.format === fmt);
    const formatLabel = labelsFormatos[fmt] || fmt;
    if(exist) {
        exist.quantity++;
        showToast(`<i class="ph ph-check-circle"></i> +1 ${name} (${formatLabel})`);
    } else {
        cart.push({name, format: fmt, price: parseInt(price), quantity: 1});
        showToast(`<i class="ph ph-check-circle"></i> ¡Añadido! ${name} (${formatLabel})`);
    }
    updateCartUI(); 
}

function addAccesorioToCart(id) {
    const acc = accesoriosDB.find(x => x.id === id);
    const exist = cart.find(i => i.name === acc.name);
    if(exist) exist.quantity++; else cart.push({ name: acc.name, format: 'Accesorio', price: acc.price, quantity: 1 });
    showToast(`<i class="ph ph-check-circle"></i> ¡Añadido! ${acc.name}`);
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
        prog.style.cssText = 'display:block; background:rgba(212,175,55,0.05); padding:15px 20px; text-align:center; font-size:0.85rem; border-bottom:1px solid rgba(212,175,55,0.2); color:var(--text-muted); line-height:1.6;';
        let giftMsg = '';
        let shipMsg = '';

        if(dTotal >= 15000) {
            giftMsg = `<div style='color: var(--gold-primary); font-weight: 600;'><i class='ph ph-gift'></i> ¡Ganaste un decant de regalo!</div>`;
            giftBox.style.display = 'block';
        } else {
            let dLeft = 15000 - dTotal;
            giftMsg = `<div style="font-size:0.82rem;">Agrega <strong style="color: var(--gold-primary);">$${dLeft.toLocaleString('es-CL')} en decants</strong> y gana un 🎁 gratis.</div>`;
            giftBox.style.display = 'none';
        }

        if(total >= 60000) {
            shipMsg = `<div style="margin-top: 6px; color: #25D366; font-weight: bold;"><i class="ph ph-check-circle"></i> ¡Envío gratis alcanzado!</div>`;
        } else {
            let shipLeft = 60000 - total;
            shipMsg = `<div style="margin-top: 6px; font-size:0.82rem;">Faltan <strong style="color: var(--gold-primary);">$${shipLeft.toLocaleString('es-CL')}</strong> para envío gratis 🚚.</div>`;
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
    
    // Cambiamos los %0A por saltos de línea reales (\n) para codificarlos después
    let t = "¡Hola Attar House! Me gustaría realizar el siguiente pedido:\n\n";
    
    let total = 0;
    cart.forEach(i => { 
        let sub = i.price * i.quantity;
        total += sub;
        
        const displayFormat = labelsFormatos[i.format] || i.format;
        t += `▪ ${i.quantity}x ${i.name} (${displayFormat}) - $${sub.toLocaleString('es-CL')}\n`;
    });
    
    t += `\n*Total Estimado: $${total.toLocaleString('es-CL')}*\n`;

    if(total >= 60000) t += `🚚 *¡Mi pedido califica para ENVÍO GRATIS!*\n`;
    if(document.getElementById('free-gift-container').style.display === 'block') {
        t += `🎁 *Mi pedido incluye un regalo: ${document.getElementById('free-gift-select').value}*\n`;
    }
    
    t += `\nQuedo atento/a para coordinar el pago y la entrega.`;
    
    // AQUÍ ESTÁ LA MAGIA: encodeURIComponent() traduce los espacios y emojis a un formato web seguro
    const urlSegura = `https://wa.me/56632249728?text=${encodeURIComponent(t)}`;
    window.open(urlSegura, '_blank');
}

// ==========================================
// ==========================================
// UTILIDADES Y EVENTOS DE VENTANA
// ==========================================
function toggleCart() { document.getElementById('main-cart').classList.toggle('open'); }
function toggleSidebar() { 
    document.getElementById('catalog-sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
}
function toggleFaq(el) { el.classList.toggle('active'); }

// Toast notification
function showToast(msg) {
    let toast = document.getElementById('global-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Mejorar addToCart con toast
const _origAddToCart = addToCart;


// ── Spinner CSS ────────────────────────────────────────────────
(function() {
    const s = document.createElement('style');
    s.textContent = '@keyframes ah-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
})();

function loadingHTML(size = 32) {
    return `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
        <div style="width:${size}px;height:${size}px;border:2px solid #333;border-top-color:var(--gold-primary);border-radius:50%;animation:ah-spin 0.8s linear infinite;margin:0 auto 16px;"></div>
        <p style="font-size:0.85rem;">Cargando catálogo...</p>
    </div>`;
}

// ── Inicialización async (espera a Supabase) ───────────────────
window.onload = async () => {
    // Mostrar spinners mientras llegan los datos
    const cGrid = document.getElementById('catalogo-grid');
    const dGrid = document.getElementById('designer-grid');
    if (cGrid) cGrid.innerHTML = loadingHTML(32);
    if (dGrid) dGrid.innerHTML = loadingHTML(24);

    try {
        await loadPerfumes();
    } catch (e) {
        console.error('Error al cargar Supabase:', e);
        if (cGrid) cGrid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;color:#c0392b;padding:40px;font-size:0.9rem;">
                ⚠️ No se pudo conectar al catálogo.<br>
                <span style="color:#666;font-size:0.8rem;">Verifica tu URL y clave en perfumes.js y recarga la página.</span>
            </p>`;
        return;
    }

    initSidebar();
    renderDesigner();
    renderCatalog();
    renderAccesorios();
    rotateAnnouncements();
    updateCartUI();
    populateGiftSelect();

    history.replaceState({ page: 'inicio' }, '', '#inicio');

    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('catalog-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('show');
    });

    // ── Suscripción en tiempo real a cambios en Supabase ──────
    subscribeToPerfumeChanges(async () => {
        try {
            await loadPerfumes();
        } catch (e) {
            console.error('Error al refrescar catálogo en tiempo real:', e);
            return;
        }
        initSidebar();
        renderDesigner();
        renderCatalog();
        populateGiftSelect();

        // Si el usuario está viendo el detalle de un perfume, refrescarlo
        const detalle = document.getElementById('detalle-perfume');
        if (detalle.classList.contains('active')) {
            const idMatch = document.querySelector('#detalle-container [id^="format-detail-"]');
            if (idMatch) {
                const perfumeId = idMatch.id.replace('format-detail-', '');
                if (perfumesDB.find(p => p.id === perfumeId)) {
                    openDetail(perfumeId);
                }
            }
        }
    });
};

function populateGiftSelect() {
    const giftSelect = document.getElementById('free-gift-select');
    giftSelect.innerHTML = '';
    arabDB.forEach(p => {
        giftSelect.innerHTML += `<option value="${p.name} (Decant 3ml)">${p.name} - Decant 3ml</option>`;
    });
}
