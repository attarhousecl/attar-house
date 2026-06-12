-- ============================================================
-- ATTAR HOUSE — Setup Supabase
-- ============================================================
-- Cómo usar:
--   1. Entra a tu proyecto en supabase.com
--   2. Ve a "SQL Editor" → "New query"
--   3. Pega todo este texto y presiona "Run"
-- ============================================================


-- ── 1. CREAR TABLA ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfumes (
  id             TEXT PRIMARY KEY,
  brand          TEXT NOT NULL,
  name           TEXT NOT NULL,
  gender         TEXT NOT NULL,
  image_url      TEXT    DEFAULT '',
  bottle_class   TEXT    DEFAULT 'bottle-asad',
  notes          JSONB   DEFAULT '[]',
  families       JSONB   DEFAULT '[]',
  popularity     INTEGER DEFAULT 80,
  inspiration    TEXT    DEFAULT '',
  description    TEXT    DEFAULT '',
  price_sellado  INTEGER DEFAULT 0,
  price_decant10 INTEGER DEFAULT 0,
  price_decant5  INTEGER DEFAULT 0,
  price_decant3  INTEGER DEFAULT 0,
  stock_sellado  BOOLEAN DEFAULT true,
  stock_decant10 BOOLEAN DEFAULT true,
  stock_decant5  BOOLEAN DEFAULT true,
  stock_decant3  BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ── 2. SEGURIDAD (Row Level Security) ────────────────────────
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer el catálogo
DROP POLICY IF EXISTS "Lectura pública" ON perfumes;
CREATE POLICY "Lectura pública" ON perfumes
  FOR SELECT USING (true);

-- El service_role key (usado en admin.html) tiene acceso total
-- automáticamente — no requiere política adicional.


-- ── 2b. TIEMPO REAL (Realtime) ────────────────────────────────
-- Permite que la web pública reciba los cambios al instante
-- (sin recargar) cuando se actualiza stock/precio desde admin.html.
ALTER TABLE perfumes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE perfumes;
-- Si ves el error "relation already member of publication", ignóralo:
-- significa que Realtime ya estaba habilitado para esta tabla.


-- ── 3. DATOS — insertar todos los perfumes ───────────────────
-- Si corres esto más de una vez, salta los que ya existen.

INSERT INTO perfumes (
  id, brand, name, gender, image_url, bottle_class,
  notes, families, popularity, inspiration, description,
  price_sellado, price_decant10, price_decant5, price_decant3,
  stock_sellado, stock_decant10, stock_decant5, stock_decant3
) VALUES

-- ── DISEÑADOR ─────────────────────────────────────────────────

('prada-lhomme', 'Prada', 'Prada L''Homme', 'Masculino',
 'prada-lhomme.png', 'bottle-club',
 '["Iris","Neroli","Ámbar"]', '["Fresco","Amaderado"]',
 95, 'Diseñador Original',
 'La definición absoluta de "oler a limpio". Una obra maestra del iris jabonoso, pulcro y sumamente elegante. Es el perfume definitivo para la oficina, reuniones o el día a día cuando quieres proyectar una imagen impecable, profesional y con muchísima clase.',
 0, 13000, 7000, 5000,
 false, true, true, true),

('swy-powerfully', 'Giorgio Armani', 'Stronger With You Powerfully', 'Masculino',
 'swy-powerfully.png', 'bottle-brun',
 '["Castaña","Lavanda","Vainilla"]', '["Dulce","Especiado"]',
 94, 'Diseñador Original',
 'Una explosión dulce, cálida y envolvente. La nota icónica de castaña glaseada junto a una dosis extra de lavanda y extracto de vainilla crean un aura altamente adictiva y súper atractiva. Pensada para conquistar en el clima frío y brillar como nunca en salidas nocturnas.',
 0, 13000, 7000, 5000,
 false, true, true, true),

('gentleman-edp', 'Givenchy', 'Gentleman EDP', 'Masculino',
 'gentleman-edp.png', 'bottle-asad',
 '["Iris","Pimienta Negra","Vainilla"]', '["Amaderado","Especiado"]',
 93, 'Diseñador Original',
 'Un perfume oscuro, seductor y sumamente sofisticado. El iris se mezcla a la perfección con especias cálidas, vainilla y bálsamo de Tolú, creando un aura de misterio y elegancia. Es tu mejor carta para citas nocturnas, cenas formales y ocasiones donde vistes de traje o muy arreglado.',
 0, 10000, 6000, 3000,
 false, true, true, true),

-- ── ÁRABE ─────────────────────────────────────────────────────

('eclaire', 'Lattafa', 'Eclaire', 'Femenino',
 'eclaire.png', 'bottle-brun',
 '["Caramelo","Leche","Vainilla"]', '["Dulce"]',
 98, 'Bianco Latte de Giardini di Toscana',
 'Un deleite absoluto. Huele a un postre cremoso de caramelo y vainilla, con un toque cálido de leche y miel. Es una fragancia súper acogedora, dulce y adictiva que deja una estela deliciosa por donde pasas. Ideal para el clima frío o cuando quieres oler literalmente a un postre irresistible.',
 30000, 5000, 3000, 2000,
 true, true, true, true),

('khamrah-qahwa', 'Lattafa', 'Khamrah Qahwa', 'Unisex',
 'khamrah-qahwa.png', 'bottle-asad',
 '["Café","Praliné","Canela"]', '["Dulce","Especiado"]',
 96, 'Angels'' Share de By Kilian (con café)',
 'El exitoso ADN dulce y acaramelado de Khamrah, pero mejorado con un toque profundo y adictivo de café tostado. Notas de praliné, canela y vainilla se mezclan creando un aroma espectacular, cálido e ideal para la noche, fiestas o citas donde quieres proyectar misterio y dulzura.',
 30000, 5000, 3000, 2000,
 true, true, true, true),

('atlantis-extrait', 'French Avenue', 'Atlantis Extrait', 'Unisex',
 'atlantis-extrait.png', 'bottle-club',
 '["Sandía","Coco","Ámbar Gris"]', '["Frutal","Fresco"]',
 92, 'Wavechild de Room 1015',
 'Una explosión tropical vibrante. Destaca una jugosa nota de sandía como dulce de caramelo junto a un sutil toque de coco cremoso, todo envuelto en una vibra salada y fresca gracias al ámbar gris. Es un perfume alegre y con un rendimiento espectacular para los días de calor.',
 41000, 6000, 4000, 3000,
 true, true, true, true),

('musamam', 'Lattafa', 'Musamam', 'Masculino',
 'musamam.png', 'bottle-club',
 '["Azafrán","Cuero","Incienso"]', '["Amaderado","Especiado"]',
 85, 'Gucci Guilty Absolute / Bvlgari Kobraa',
 'Una fragancia imponente, oscura y muy elegante. Abre con notas de azafrán y mandarina, para dar paso a un corazón ahumado de incienso y un fondo fuertemente marcado por el cuero y maderas profundas. Hecho para el hombre que busca proyectar carácter, madurez y sofisticación.',
 32000, 5000, 3000, 2000,
 true, true, true, true),

('pisa', 'Lattafa', 'Pisa', 'Masculino',
 'pisa.png', 'bottle-club',
 '["Mandarina","Bergamota","Sándalo"]', '["Cítrico","Fresco"]',
 87, 'Tygar de Bvlgari / Afternoon Swim',
 'Una apertura cítrica sumamente vibrante y natural donde destaca la mandarina y la bergamota jugosa, evolucionando rápidamente hacia un fondo rico y masculino en madera de sándalo y ámbar. Fresco, limpio y perfecto para el verano, como un viaje a la costa italiana.',
 45000, 6000, 4000, 3000,
 true, true, true, true),

('liquid-brun', 'French Avenue', 'Liquid Brun', 'Masculino',
 'liquid-brun.png', 'bottle-brun',
 '["Vainilla","Canela","Praliné"]', '["Dulce","Especiado"]',
 98, 'Althaïr de Parfums de Marly',
 'Un aroma cálido y sumamente acogedor donde la vainilla, la canela y el praliné se combinan para darte un aire de elegancia inconfundible. Es esa clase de perfume que deja una estela dulce pero madura por donde pasas. Perfecto para usar de noche, en citas o cuando simplemente quieres destacar sin parecer que te esforzaste demasiado.',
 31000, 5000, 3000, 2000,
 true, true, true, true),

('vulcan-feu', 'French Avenue', 'Vulcan Feu', 'Unisex',
 'perfume_attar_house.png', 'bottle-club',
 '["Mango","Jengibre","Limón"]', '["Frutal","Cítrico"]',
 88, 'God of Fire de S.H. Lucas',
 'Una explosión tropical dominada por un mango jugoso y realista, equilibrado con el toque picante y fresco del jengibre. No es el típico aroma frutal aburrido; tiene muchísima personalidad y un fondo amaderado que lo hace súper versátil. Es tu mejor aliado para llamar la atención en cualquier salida informal o durante el día a día.',
 42000, 6000, 4000, 3000,
 true, true, true, true),

('honor-glory', 'Lattafa', 'Honor & Glory', 'Unisex',
 'honor-glory.png', 'bottle-brun',
 '["Piña","Crème Brûlée"]', '["Dulce","Frutal"]',
 96, 'Tribeca de Bond No 9',
 'Imagina el contraste perfecto entre la frescura ácida de una piña recién cortada y el dulzor tostado de una crème brûlée. Este es un perfume cremoso, magnético y que literalmente hace que la gente pregunte qué llevas puesto. Ideal para usar todo el año cuando quieres proyectar una vibra alegre, atractiva y muy original.',
 26000, 4000, 2500, 1500,
 true, true, true, true),

('amber-oud-dubai', 'Al Haramain', 'Amber Oud Dubai Night', 'Masculino',
 'amber-oud-dubai.png', 'bottle-club',
 '["Bergamota","Oud","Vainilla"]', '["Amaderado","Especiado"]',
 82, 'Arabians Tonka de Montale',
 'Madera de oud, especias cálidas y vainilla en su versión más lujosa y potente. Es un perfume oscuro, imponente y con un rendimiento bestial que dura todo el día en tu piel. Está diseñado exclusivamente para ocasiones especiales, eventos formales o cuando quieres que tu presencia se note en el momento exacto en que entras a la habitación.',
 50000, 7000, 5000, 4000,
 false, true, true, true),

('asad-bourbon', 'Lattafa', 'Asad Bourbon', 'Masculino',
 'bourbon.png', 'bottle-asad',
 '["Café","Vainilla"]', '["Especiado","Dulce"]',
 95, 'Azzaro The Most Wanted',
 'El dulzor oscuro e intenso del café tostado se mezcla a la perfección con una vainilla muy masculina y toques especiados. Es un aroma misterioso, con mucho carácter y altamente adictivo. Si buscas una fragancia ganadora para citas nocturnas, fiestas o salidas donde la intención es seducir, esta es una apuesta segura.',
 30000, 5000, 3000, 2000,
 true, true, true, true),

('yara', 'Lattafa', 'Yara', 'Femenino',
 'yara.png', 'bottle-brun',
 '["Orquídea","Vainilla"]', '["Dulce"]',
 100, 'Poison Girl de Dior',
 'Completamente femenino, cremoso y muy dulce. Es el famoso aroma viral que huele a un delicioso batido de frutillas, orquídeas y mucha vainilla. Tiene una textura suave y atalcada que resulta súper reconfortante. Es el perfume perfecto para usar todos los días, ir al trabajo o simplemente oler increíble y delicada en todo momento.',
 25000, 4000, 2500, 1500,
 true, true, true, true),

('yara-candy', 'Lattafa', 'Yara Candy', 'Femenino',
 'yara-candy.png', 'bottle-brun',
 '["Dulces","Frutos Rojos"]', '["Dulce","Frutal"]',
 92, 'Pink Me Up',
 'Una versión mucho más juguetona, vibrante y golosa que el Yara clásico. Aquí los protagonistas son los frutos rojos jugosos y unos dulces intensos que te envuelven por completo. Es una fragancia juvenil, magnética y súper divertida, ideal para salidas con amigas, tardes relajadas o cuando necesitas un extra de energía en tu día.',
 25000, 4000, 2500, 1500,
 true, true, true, true),

('hawas-fire', 'Rasasi', 'Hawas Fire', 'Masculino',
 'hawas-fire.png', 'bottle-asad',
 '["Manzana"]', '["Especiado"]',
 92, 'Imperial Valley',
 'Una salida potente de manzana crujiente que rápidamente evoluciona hacia especias cálidas y un fondo de maderas fuertes. Es una fragancia con muchísima presencia y una proyección que llena cualquier espacio. Totalmente recomendada para quienes buscan proyectar seguridad, carácter y masculinidad en su entorno laboral o en eventos importantes.',
 45000, 6000, 4000, 3000,
 true, true, true, true),

('tropical-vibe', 'Rayhaan', 'Tropical Vibe', 'Unisex',
 'tropical-vibe.png', 'bottle-asad',
 '["Frutas"]', '["Frutal"]',
 89, 'Summer Hammer de Lorenzo Pazzaglia',
 'Un verdadero cóctel embotellado de frutas tropicales que resulta súper fresco, pero con el dulzor exacto para no pasar desapercibido. Te transporta de inmediato a un ambiente de playa y relajo, sin perder la calidad de un buen perfume. Es la opción número uno para los días de calor, vacaciones o para levantar el ánimo cualquier mañana.',
 39000, 6000, 4000, 3000,
 true, true, true, true),

('art-universe', 'Lattafa', 'Art Of Universe', 'Unisex',
 'art-of-universe.png', 'bottle-asad',
 '["Bergamota"]', '["Cítrico"]',
 89, 'Blue Talisman',
 'Cítricos limpios, brillantes y modernos que huelen a puro lujo y sofisticación desde el primer spray. Tiene una evolución fresca y muy pulcra que te hace sentir impecable durante horas. Es tan versátil y elegante que funciona perfecto como tu perfume firma, ese que usas todos los días, ya sea para ir a la oficina o salir a cenar.',
 42000, 6000, 4000, 3000,
 false, true, true, true),

('his-confession', 'Lattafa', 'His Confession', 'Masculino',
 'his-confession.png', 'bottle-asad',
 '["Iris"]', '["Amaderado"]',
 84, 'Dior Homme Intense',
 'La elegancia indiscutible de la nota de iris combinada con un fondo amaderado muy sólido. Es un aroma formal, maduro, seductor y con esa clase que atrapa miradas al instante sin necesidad de gritar. Guárdalo para ocasiones donde vistes bien, reuniones de negocios o esas noches donde buscas dejar una impresión inolvidable y sofisticada.',
 34000, 5000, 3000, 2000,
 true, true, true, true),

('hawas-tropical', 'Rasasi', 'Hawas Tropical', 'Unisex',
 'hawas-tropical.png', 'bottle-asad',
 '["Piña"]', '["Frutal"]',
 90, 'JPG Paradise Garden',
 'Pura frescura dominada por una piña ácida y jugosa que se siente extremadamente natural y chispeante. Es un aroma súper enérgico, limpio y muy fácil de llevar, pero con una duración excelente para ser tan fresco. Ideal para destacar de día, ir al gimnasio, o soportar las jornadas más calurosas oliendo como recién salido de la ducha.',
 42000, 6000, 4000, 3000,
 true, true, true, true),

('philos-pura', 'Maison Alhambra', 'Philos Pura', 'Unisex',
 'philos-pura.png', 'bottle-brun',
 '["Frutas","Almizcle"]', '["Frutal","Cítrico"]',
 87, 'Xerjoff Erba Pura',
 'Una verdadera bomba de frutas cítricas y dulces sostenida por una base de almizcle muy potente. Huele a limpio, a ropa nueva y a lujo, con una proyección brutal que garantiza que la fragancia dure horas y horas en la piel. Es una opción todoterreno, llamativa y alegre que funciona excelente tanto en hombres como en mujeres.',
 23000, 4000, 2500, 1500,
 false, false, false, false),

('tag-him', 'Armaf', 'Tag-Him Rosso', 'Masculino',
 'tag-him.png', 'bottle-club',
 '["Cardamomo","Tonka"]', '["Dulce","Especiado"]',
 85, 'Invictus Victory',
 'Una mezcla adictiva de especias dulces, cardamomo y haba tonka diseñada exclusivamente para brillar en la noche. Es un perfume atrevido, moderno y hecho específicamente para generar reacciones y recibir cumplidos continuos. Llévalo a fiestas, bares o discotecas; es una fragancia que compite cara a cara con el humo y la música fuerte.',
 30000, 5000, 3000, 2000,
 false, true, true, true),

('sceptre-malachite', 'Maison Alhambra', 'Sceptre Malachite', 'Unisex',
 'mlachite.png', 'bottle-club',
 '["Mango","Especias"]', '["Frutal","Especiado"]',
 86, 'God of Fire',
 'Una propuesta frutal totalmente fuera de lo común donde destaca un mango verde, ligeramente ácido y muy especiado. Es un aroma muy fresco, exótico y que rompe con los típicos perfumes comerciales. Si eres de las personas que odian oler igual al resto y buscas un sello personal único e intrigante, esta tiene que ser tu elección.',
 32000, 5000, 3000, 2000,
 true, true, true, true),

('turathi-blue', 'Afnan', 'Turathi Blue', 'Masculino',
 'turathi-blue.png', 'bottle-club',
 '["Pomelo","Ámbar","Almizcle"]', '["Cítrico","Amaderado"]',
 88, 'Le Gemme Tygar de Bvlgari',
 'Una explosión de pomelo frío y brillante que atrapa desde el primer spray. Limpio, elegante y con una base de ámbar y almizcle que le da una masculinidad sólida sin perder frescura. Es ese tipo de fragancia que funciona igual de bien en una reunión importante que en una salida casual. Versátil, con proyección notable y la duración que te exige el día.',
 32000, 5000, 3000, 2000,
 false, false, false, false),

('nitro-white', 'Dumont', 'Nitro White', 'Masculino',
 'nitro-white.png', 'bottle-club',
 '["Vainilla","Miel","Cuero"]', '["Dulce","Especiado"]',
 87, 'Stronger With You de Armani',
 'Dulce pero con carácter. Nitro White abre con bayas de enebro y ciprés que le dan un inicio fresco y resinoso, para luego evolucionar hacia un corazón de mirra y pachulí que introduce profundidad y misterio. El fondo de miel, vainilla, ámbar y cuero es adictivo y dura horas en la piel. Una fragancia para noches donde quieres dejar huella sin necesidad de decir nada.',
 32000, 5000, 3000, 2000,
 true, true, true, true),

('afeef', 'Lattafa', 'Afeef', 'Femenino',
 'afeef.png', 'bottle-brun',
 '["Durazno","Nardo","Sándalo"]', '["Frutal","Dulce"]',
 89, 'New York Nights de Bond No. 9',
 'Femenino sin ser predecible. Abre con un durazno jugoso, pimienta rosa y bergamota que te atrapa desde el primer momento. En el corazón, el nardo y el jazmín despliegan una elegancia floral cremosa e hipnótica. El fondo de sándalo, ámbar y praliné lo convierte en un aroma que permanece en la memoria de quienes te rodean. Ideal para quienes buscan sofisticación sin esfuerzo.',
 38000, 6000, 4000, 3000,
 true, true, true, true),

('hawas-malibu', 'Rasasi', 'Hawas Malibu', 'Masculino',
 'hawas-malibu.png', 'bottle-asad',
 '["Piña","Lavanda","Tonka"]', '["Frutal","Fresco"]',
 88, 'Le Beau Le Parfum de JPG',
 'Huele exactamente como se siente el primer día de vacaciones. La piña, la naranja y el pomelo explotan con energía tropical en la salida, y la lavanda con el iris le dan una elegancia aromática que te distingue del montón. El fondo de haba tonka y cachemira lo convierte en algo más que un perfume de verano: es una experiencia. Para los días que simplemente quieres oler increíble.',
 45000, 6000, 4000, 3000,
 true, true, true, true),

('odyssey-aqua', 'Armaf', 'Odyssey Aqua', 'Masculino',
 'odyssey-aqua.png', 'bottle-club',
 '["Pomelo","Menta","Ciprés"]', '["Cítrico","Fresco"]',
 86, 'Invictus Platinum de Paco Rabanne',
 'Un aroma ganador. Pomelo, naranja y artemisa se combinan en una salida fresca y energética que despierta los sentidos al instante. La menta y la lavanda del corazón le añaden un carácter aromático limpio y moderno. El ambroxán en el fondo le da esa firma que perdura. Perfecto para la oficina, el día a día o cualquier ocasión donde quieras proyectar confianza sin esfuerzo.',
 40000, 6000, 4000, 3000,
 true, true, true, true),

('jean-lowe-vibe', 'Maison Alhambra', 'Jean Lowe Vibe', 'Unisex',
 'jean-lowe-vibe.png', 'bottle-brun',
 '["Menta","Cítricos","Higo"]', '["Cítrico","Fresco"]',
 87, 'Pacific Chill de Louis Vuitton',
 'Fresco, luminoso y con una personalidad que no pide permiso. La menta y los cítricos explotan con una vivacidad que recuerda a un cóctel recién servido, mientras la albahaca y la rosa de mayo añaden un toque herbal sofisticado. El fondo de higo, dátiles y almizcle ambreta lo convierte en algo cálido y distintivo. Para quienes disfrutan de lo diferente sin complicarse.',
 25000, 4000, 2500, 1500,
 true, true, true, true),

('opulent-dubai', 'Lattafa', 'Opulent Dubai', 'Unisex',
 'opulent-dubai.png', 'bottle-asad',
 '["Mango","Jazmín","Ámbar Gris"]', '["Frutal","Amaderado"]',
 90, 'God of Fire de Stéphane Humbert Lucas',
 'La opulencia embotellada. Un mango exótico y jugoso abre paso a un corazón de jazmín, cedro y violeta que huele a lujo sin disculparse. El fondo de ámbar gris, benjuí y musgo de roble crea una estela profunda y magnética que deja presencia real. Si buscas una fragancia que impresione sin necesitar explicación, Opulent Dubai es exactamente eso.',
 30000, 5000, 3000, 2000,
 true, true, true, true),

('obsidian', 'Rayhaan', 'Obsidian', 'Masculino',
 'obsidian.png', 'bottle-asad',
 '["Iris","Cuero","Sándalo"]', '["Amaderado","Especiado"]',
 91, 'Dior Homme Intense',
 'Oscuro, pulido y con una elegancia que no necesita alzar la voz. El iris abre con una frescura empolvada y sofisticada que evoluciona hacia un corazón de cuero suave, íntimo y muy masculino. El fondo de sándalo, cedro y oud crea una base cálida y envolvente que dura en la piel durante horas. Para quienes saben que la elegancia verdadera no se anuncia, simplemente se siente.',
 40000, 6000, 4000, 3000,
 true, true, true, true),

('terra', 'Rayhaan', 'Terra', 'Masculino',
 'terra.png', 'bottle-asad',
 '["Cardamomo","Azafrán","Oud"]', '["Especiado","Amaderado"]',
 89, 'Amouage Guidance',
 'Una fragancia que va más allá del perfume árabe típico. Cardamomo, pimienta de Sichuan y bergamota crean una apertura especiada y vibrante. El corazón de azafrán, pachulí y flor de azahar añade una riqueza oriental profunda e intrigante. El fondo de oud, incienso y ámbar hace de Terra una experiencia sensorial completa, pensada para quienes buscan algo verdaderamente especial.',
 38000, 6000, 4000, 3000,
 true, true, true, true),

('aquatica', 'Rayhaan', 'Aquatica', 'Masculino',
 'aquatica.png', 'bottle-club',
 '["Coco","Lima","Tonka"]', '["Frutal","Fresco"]',
 90, 'Very Irresistible Water de Givenchy',
 'Cierra los ojos y es verano instantáneo. La lima y el coco abren con una cremosidad tropical que se siente increíblemente natural y refrescante. El corazón de jazmín y gardenia le añade un brillo floral sutil, y el ron con la haba tonka en el fondo lo convierten en algo más cálido y seductor de lo que parece a primera vista. El perfume de playa que querrás llevar contigo a todas partes.',
 40000, 6000, 4000, 3000,
 true, true, true, true)

ON CONFLICT (id) DO NOTHING;

-- ── LISTO ────────────────────────────────────────────────────
-- Si ves "Success. No rows returned" o similar, todo salió bien.
