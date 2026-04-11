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
    },
    {
        id: 'turathi-blue', brand: 'Afnan', name: 'Turathi Blue', gender: 'Masculino', imageUrl: 'turathi-blue.png', bottleClass: 'bottle-club', notes: ['Pomelo', 'Ámbar', 'Almizcle'], families: ['Cítrico', 'Amaderado'], popularity: 88, inspiration: 'Le Gemme Tygar de Bvlgari',
        description: 'Una explosión de pomelo frío y brillante que atrapa desde el primer spray. Limpio, elegante y con una base de ámbar y almizcle que le da una masculinidad sólida sin perder frescura. Es ese tipo de fragancia que funciona igual de bien en una reunión importante que en una salida casual. Versátil, con proyección notable y la duración que te exige el día.',
        prices: { sellado: 32000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'nitro-white', brand: 'Dumont', name: 'Nitro White', gender: 'Masculino', imageUrl: 'nitro-white.png', bottleClass: 'bottle-club', notes: ['Vainilla', 'Miel', 'Cuero'], families: ['Dulce', 'Especiado'], popularity: 87, inspiration: 'Stronger With You de Armani',
        description: 'Dulce pero con carácter. Nitro White abre con bayas de enebro y ciprés que le dan un inicio fresco y resinoso, para luego evolucionar hacia un corazón de mirra y pachulí que introduce profundidad y misterio. El fondo de miel, vainilla, ámbar y cuero es adictivo y dura horas en la piel. Una fragancia para noches donde quieres dejar huella sin necesidad de decir nada.',
        prices: { sellado: 28000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'afeef', brand: 'Lattafa', name: 'Afeef', gender: 'Femenino', imageUrl: 'afeef.png', bottleClass: 'bottle-brun', notes: ['Durazno', 'Nardo', 'Sándalo'], families: ['Frutal', 'Dulce'], popularity: 89, inspiration: 'New York Nights de Bond No. 9',
        description: 'Femenino sin ser predecible. Abre con un durazno jugoso, pimienta rosa y bergamota que te atrapa desde el primer momento. En el corazón, el nardo y el jazmín despliegan una elegancia floral cremosa e hipnótica. El fondo de sándalo, ámbar y praliné lo convierte en un aroma que permanece en la memoria de quienes te rodean. Ideal para quienes buscan sofisticación sin esfuerzo.',
        prices: { sellado: 27000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'hawas-malibu', brand: 'Rasasi', name: 'Hawas Malibu', gender: 'Unisex', imageUrl: 'hawas-malibu.png', bottleClass: 'bottle-asad', notes: ['Piña', 'Lavanda', 'Tonka'], families: ['Frutal', 'Fresco'], popularity: 88, inspiration: 'Le Beau Le Parfum de JPG',
        description: 'Huele exactamente como se siente el primer día de vacaciones. La piña, la naranja y el pomelo explotan con energía tropical en la salida, y la lavanda con el iris le dan una elegancia aromática que te distingue del montón. El fondo de haba tonka y cachemira lo convierte en algo más que un perfume de verano: es una experiencia. Para los días que simplemente quieres oler increíble.',
        prices: { sellado: 38000, decant10: 6000, decant5: 4000, decant3: 3000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'odyssey-aqua', brand: 'Armaf', name: 'Odyssey Aqua Edition', gender: 'Masculino', imageUrl: 'odyssey-aqua.png', bottleClass: 'bottle-club', notes: ['Pomelo', 'Menta', 'Ciprés'], families: ['Cítrico', 'Fresco'], popularity: 86, inspiration: 'Invictus Platinum de Paco Rabanne',
        description: 'Un aroma ganador. Pomelo, naranja y artemisa se combinan en una salida fresca y energética que despierta los sentidos al instante. La menta y la lavanda del corazón le añaden un carácter aromático limpio y moderno. El ambroxán en el fondo le da esa firma que perdura. Perfecto para la oficina, el día a día o cualquier ocasión donde quieras proyectar confianza sin esfuerzo.',
        prices: { sellado: 30000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'jean-lowe-vibe', brand: 'Maison Alhambra', name: 'Jean Lowe Vibe', gender: 'Unisex', imageUrl: 'jean-lowe-vibe.png', bottleClass: 'bottle-brun', notes: ['Menta', 'Cítricos', 'Higo'], families: ['Cítrico', 'Fresco'], popularity: 87, inspiration: 'Pacific Chill de Louis Vuitton',
        description: 'Fresco, luminoso y con una personalidad que no pide permiso. La menta y los cítricos explotan con una vivacidad que recuerda a un cóctel recién servido, mientras la albahaca y la rosa de mayo añaden un toque herbal sofisticado. El fondo de higo, dátiles y almizcle ambreta lo convierte en algo cálido y distintivo. Para quienes disfrutan de lo diferente sin complicarse.',
        prices: { sellado: 25000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'opulent-dubai', brand: 'Lattafa', name: 'Opulent Dubai', gender: 'Unisex', imageUrl: 'opulent-dubai.png', bottleClass: 'bottle-asad', notes: ['Mango', 'Jazmín', 'Ámbar Gris'], families: ['Frutal', 'Amaderado'], popularity: 90, inspiration: 'God of Fire de Stéphane Humbert Lucas',
        description: 'La opulencia embotellada. Un mango exótico y jugoso abre paso a un corazón de jazmín, cedro y violeta que huele a lujo sin disculparse. El fondo de ámbar gris, benjuí y musgo de roble crea una estela profunda y magnética que deja presencia real. Si buscas una fragancia que impresione sin necesitar explicación, Opulent Dubai es exactamente eso.',
        prices: { sellado: 24000, decant10: 4000, decant5: 2500, decant3: 1500 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'obsidian', brand: 'Rayhaan', name: 'Obsidian', gender: 'Masculino', imageUrl: 'obsidian.png', bottleClass: 'bottle-asad', notes: ['Iris', 'Cuero', 'Sándalo'], families: ['Amaderado', 'Especiado'], popularity: 91, inspiration: 'Dior Homme Intense',
        description: 'Oscuro, pulido y con una elegancia que no necesita alzar la voz. El iris abre con una frescura empolvada y sofisticada que evoluciona hacia un corazón de cuero suave, íntimo y muy masculino. El fondo de sándalo, cedro y oud crea una base cálida y envolvente que dura en la piel durante horas. Para quienes saben que la elegancia verdadera no se anuncia, simplemente se siente.',
        prices: { sellado: 28000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'terra', brand: 'Rayhaan', name: 'Terra', gender: 'Masculino', imageUrl: 'terra.png', bottleClass: 'bottle-asad', notes: ['Cardamomo', 'Azafrán', 'Oud'], families: ['Especiado', 'Amaderado'], popularity: 89, inspiration: 'Amouage Guidance',
        description: 'Una fragancia que va más allá del perfume árabe típico. Cardamomo, pimienta de Sichuan y bergamota crean una apertura especiada y vibrante. El corazón de azafrán, pachulí y flor de azahar añade una riqueza oriental profunda e intrigante. El fondo de oud, incienso y ámbar hace de Terra una experiencia sensorial completa, pensada para quienes buscan algo verdaderamente especial.',
        prices: { sellado: 30000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
    },
    {
        id: 'aquatica', brand: 'Rayhaan', name: 'Aquatica', gender: 'Masculino', imageUrl: 'aquatica.png', bottleClass: 'bottle-club', notes: ['Coco', 'Lima', 'Tonka'], families: ['Frutal', 'Fresco'], popularity: 90, inspiration: 'Very Irresistible Water de Givenchy',
        description: 'Cierra los ojos y es verano instantáneo. La lima y el coco abren con una cremosidad tropical que se siente increíblemente natural y refrescante. El corazón de jazmín y gardenia le añade un brillo floral sutil, y el ron con la haba tonka en el fondo lo convierten en algo más cálido y seductor de lo que parece a primera vista. El perfume de playa que querrás llevar contigo a todas partes.',
        prices: { sellado: 30000, decant10: 5000, decant5: 3000, decant3: 2000 }, stock: { sellado: true, decant10: true, decant5: true, decant3: true }
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

document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});

// ROTACIÓN DE ANUNCIOS
function rotateAnnouncements() {
    const list = [
        "✨ Envío gratis a todo Chile sobre $60.000 ✨", 
        "🎁 ¡Llevate un DECANT DE REGALO por compras sobre $15.000 en decants! 🎁",
        "🛍️ ¡REGALO SEGURO en compras sobre $70.000 total! 🛍️"
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
    const grid = document.getElementById('catalogo-grid'); 
    grid.innerHTML = '';
    
    let filtered = perfumesDB.filter(p => {
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
    openDetail(perfumeId); // re-render
}

function openDetail(id) {
    const p = perfumesDB.find(x => x.id === id); const container = document.getElementById('detalle-container');
    const tagsHTML = p.notes.map(n => `<span class="note-tag">${n}</span>`).join('');
    
    let opts = ''; 
    for(let k in p.prices) { 
        const nombreFormato = labelsFormatos[k] || k;
        if(p.stock[k] !== false) opts += `<option value="${k}|${p.prices[k]}">${nombreFormato} - $${p.prices[k].toLocaleString('es-CL')}</option>`;
        else opts += `<option disabled>${nombreFormato} - AGOTADO</option>`;
    }

    const isWished = false; // wishlist removed

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
                ${renderReviews(p.id)}
            </div>
            <div class="detail-action-col">
                <div class="purchase-box">
                    <h4 style="margin-bottom:15px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--gold-primary); border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">Elige tu formato</h4>
                    <select class="format-select" id="format-detail-${p.id}">${opts}</select>
                    <button class="btn-add-cart-gold" onclick="addToCart('${p.name}', 'format-detail-${p.id}')">
                        <i class="ph ph-shopping-cart" style="font-size: 1.2rem;"></i> Añadir al Carrito
                    </button>
                    <div style="margin-top: 18px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.8;">
                        <p>✓ Autenticidad Garantizada</p>
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


window.onload = () => {
    initSidebar(); 
    renderCatalog(); 
    renderAccesorios();
    rotateAnnouncements(); 
    updateCartUI();

    // Inicializar historial para que el botón atrás funcione bien
    history.replaceState({ page: 'inicio' }, '', '#inicio');
    
    const giftSelect = document.getElementById('free-gift-select');
    perfumesDB.forEach(p => {
        giftSelect.innerHTML += `<option value="${p.name} (Decant 3ml)">${p.name} - Decant 3ml</option>`;
    });

    // Cerrar sidebar con overlay
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('catalog-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('show');
    });
};
