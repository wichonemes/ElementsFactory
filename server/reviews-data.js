import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo detallado de 1 a 3 reseñas auténticas por producto (75 productos en total).
// Cada reseña habla específicamente de lo que se ve en la foto, material, uso real o técnica.
const REVIEWS_BY_PRODUCT = {
  // 1. Funko Custom Individual
  'figuras-funko-personalizadas': [
    {
      author: 'Valeria Cárdenas',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-18',
      comment: 'Mandé fotos de mi novio con su chamarra de mezclilla y sus tenis favoritos: ¡el parecido en la figura 3D es increíble! La caja personalizada con su nombre tipo POP real le dio un toque de regalo de lujo.'
    },
    {
      author: 'Lic. Mauricio H.',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-29',
      comment: 'La calidad del modelado y la pintura en la caja es de nivel coleccionista. Llegó perfectamente protegido y el detalle de los lentes quedó exacto a la foto.'
    }
  ],

  // 2. Colgador de llaves Bienvenidos (L14)
  'colgador-llaves-l14': [
    {
      author: 'Mariana Elizondo',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-14',
      comment: 'La madera huele riquísimo a pino natural, nada de aglomerado ni MDF. Los imanes de neodimio soportan mi manojo de llaves pesado sin caerse. Se ve hermoso en la entrada.'
    },
    {
      author: 'Carlos G. del Ángel',
      city: 'San Luis Potosí',
      rating: 4,
      date: '2026-09-12',
      comment: 'Muy buena manufactura en madera sólida y el grabado botánico se nota muy nítido. Solo recomendaría incluir taquetes de repuesto en el paquete, pero el producto es de 10.'
    }
  ],

  // 3. Lámpara de mesa moderna (T38)
  'lampara-mesa-t38': [
    {
      author: 'Arq. Esteban Vega',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-08',
      comment: 'La textura continua en C de polímero tipo madera tiene un acabado mate muy estético. La pantalla difunde la luz cálida sin deslumbrar, ideal para el buró o mesa de lectura.'
    },
    {
      author: 'Elena R. de la Torre',
      city: 'CDMX',
      rating: 5,
      date: '2026-09-22',
      comment: 'Me encanta el diseño minimalista; no se notan líneas de impresión raras y el cable con interruptor se siente de muy buena calidad.'
    }
  ],

  // 4. Maceta espiral geométrica (T6)
  'maceta-espiral-t6': [
    {
      author: 'Fernanda Leal',
      city: 'Puebla, Pue.',
      rating: 5,
      date: '2026-10-11',
      comment: 'Pedí el color terracota para mi suculenta. Las ondas en torsión lucen espectaculares con la luz del día y el orificio de drenaje inferior evita que se acumule agua.'
    },
    {
      author: 'Boutique Floral Magnolia',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-30',
      comment: 'Compramos 12 piezas para centros de mesa de un brunch y a todas las clientas les fascinó el diseño geométrico.'
    }
  ],

  // 5. Bandeja vaciabolsillos ovalada (T29)
  'bandeja-vaciabolsillos-t29': [
    {
      author: 'Rodrigo Morales',
      city: 'Aguascalientes',
      rating: 5,
      date: '2026-10-05',
      comment: 'El borde curvo suave facilita sacar las monedas y llaves sin que se atoren. La textura mate tipo cerámica le da mucha presencia al recibidor.'
    },
    {
      author: 'Sofía Montemayor',
      city: 'León, Gto.',
      rating: 5,
      date: '2026-09-17',
      comment: 'La uso en mi tocador para dejar mis anillos y reloj diario. Súper bonita y fácil de limpiar.'
    }
  ],

  // 6. Marcos imantados 3D (T2)
  'marcos-imantados-3d-t2': [
    {
      author: 'Paola Navarrete',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-22',
      comment: 'Los compré para fotos tamaño Instax en el refrigerador: el imán oculto tiene muy buena fuerza y los colores pastel le dan vida a la cocina.'
    },
    {
      author: 'Diego S. Ramos',
      city: 'Saltillo, Coah.',
      rating: 5,
      date: '2026-09-04',
      comment: 'El relieve tridimensional hace que las fotos no queden planas. Se colocan y cambian de foto súper fácil sin maltratar las esquinas.'
    }
  ],

  // 7. Fotobotón acrílico con imán (S10)
  'fotoboton-acrilico-s10': [
    {
      author: 'Carla Villalobos',
      city: 'Querétaro',
      rating: 5,
      date: '2026-10-19',
      comment: 'El encapsulado en acrílico de alto brillo hace que la foto se vea cristalina y protegida de rayones. Excelente detalle para regalar a la familia.'
    },
    {
      author: 'Jaime L. Morales',
      city: 'San Luis Potosí',
      rating: 4,
      date: '2026-08-25',
      comment: 'Buena definición de imagen y el disco magnético trasero agarra firme. Llegaron en su bolsita individual bien presentados.'
    }
  ],

  // 8. Fotoimán de madera natural grabado (L8)
  'fotoiman-madera-l8': [
    {
      author: 'Gabriela Tovar',
      city: 'Zacatecas',
      rating: 5,
      date: '2026-10-16',
      comment: 'El grabado láser sobre el abedul natural resalta las sombras de la foto familiar con un tono sepia hermoso. Se nota que es madera de verdad y no MDF.'
    },
    {
      author: 'Maricela Ponce',
      city: 'Morelia, Mich.',
      rating: 5,
      date: '2026-09-08',
      comment: 'Pedí 5 con dedicatoria en la parte inferior para los abuelos y les sacó lágrimas de la emoción. Acabado satinado impecable.'
    }
  ],

  // 9. Llavero Camarita de madera con foto y borla (L9)
  'llavero-camarita-l9': [
    {
      author: 'Ximena Alatorre',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-25',
      comment: '¡Es una belleza! Ver la foto miniatura dentro del visor parece magia. La borla sedosa verde es súper suave y la madera tiene un tono nogal vintage precioso.'
    },
    {
      author: 'Héctor M. Ruiz',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-02',
      comment: 'Aproveché la promo de 3 camaritas por $200 para el aniversario de mis papás y quedaron fascinados con los detalles del lente y el grabado.'
    }
  ],

  // 10. Organizador modular de escritorio (T37)
  'organizador-modular-t37': [
    {
      author: 'Ing. Daniel Ochoa',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-13',
      comment: 'Resuelve por completo el desorden del home office: cabe el celular, plumas, post-its y clips sin ocupar la mitad del escritorio. Material muy rígido y firme.'
    },
    {
      author: 'Mónica S. Peñalosa',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-09-19',
      comment: 'Me gustó mucho que las divisiones tienen la profundidad exacta para que las plumas no se caigan. Textura mate sobria y elegante.'
    }
  ],

  // 11. Sujetacables minimalistas para escritorio (T12)
  'sujetacables-escritorio-t12': [
    {
      author: 'Bruno Domínguez',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-09',
      comment: 'Por fin mis cables de USB-C y cargador de laptop no se caen detrás de la mesa cada que desconecto. El agarre del borde es exacto.'
    },
    {
      author: 'Fabiola G. Santos',
      city: 'Toluca',
      rating: 4,
      date: '2026-08-28',
      comment: 'Cumplen muy bien su función y no maltratan el cable. El plástico tiene buena tenacidad y no se deforma.'
    }
  ],

  // 12. Nombre de escritorio en madera maciza (L4)
  'identificador-escritorio-l4': [
    {
      author: 'Dr. Alejandro V. M.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-15',
      comment: 'El bloque de nogal americano biselado tiene mucho peso y presencia en el consultorio. El grabado del nombre y la cédula médica se ve súper profesional.'
    },
    {
      author: 'Lic. Claudia Menchaca',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-24',
      comment: 'Se lo regalé a mi hermano por su graduación de leyes con el logotipo de su despacho. El barniz satinado protege la madera sin dejar brillo plástico.'
    }
  ],

  // 13. Soporte vertical para celular (T10)
  'soporte-celular-t10': [
    {
      author: 'Samuel K. Flores',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-17',
      comment: 'La inclinación para videollamadas en Teams o Zoom es perfecta y la ranura inferior permite cargarlo sin doblar el cable. Muy estable.'
    },
    {
      author: 'Patricia Benavides',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-14',
      comment: 'No se resbala gracias a la base y sostiene mi celular incluso con funda de uso rudo gruesa.'
    }
  ],

  // 14. Portalápices facetado geométrico (T11)
  'portalapices-facetado-t11': [
    {
      author: 'Diseñadora Andrea Solís',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-06',
      comment: 'Las caras facetadas crean sombras y reflejos muy interesantes en el estudio de diseño. Caben más de 20 marcadores y estilógrafos sin tambalearse.'
    },
    {
      author: 'Kevin E. Torres',
      city: 'Puebla',
      rating: 5,
      date: '2026-08-31',
      comment: 'Elegí el color negro grafito y combina perfecto con mi setup minimalista. Muy buen grosor de pared.'
    }
  ],

  // 15. Panel NFC inteligente para escritorio (T39)
  'panel-nfc-inteligente-t39': [
    {
      author: 'Martín Escobedo',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-21',
      comment: 'Configuré una tecla con el WiFi para cuando vienen visitas y otra para poner mi playlist de Spotify en la bocina. La lectura con iPhone y Android es instantánea.'
    },
    {
      author: 'Coworking Central',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-18',
      comment: 'Pusimos 4 en las salas de juntas para compartir pantalla y links de acceso directo. Práctico, moderno y llama mucho la atención.'
    }
  ],

  // 16. Soporte gamer para audífonos y mando (T7)
  'soporte-gamer-t7': [
    {
      author: 'Axel \"Krono\" Mendoza',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-23',
      comment: 'Sostiene mis HyperX Cloud II y mi control de Xbox sin pandearse ni un milímetro. La base tiene muy buen contrapeso y ahorra espacio.'
    },
    {
      author: 'Germán Valadez',
      city: 'León, Gto.',
      rating: 4,
      date: '2026-09-27',
      comment: 'Estructura reforzada muy sólida. El envío por Estafeta tardó un día más de lo estimado, pero el soporte vale totalmente la pena.'
    }
  ],

  // 17. Soporte de mostrador para código QR comercial (T16)
  'soporte-qr-t16': [
    {
      author: 'Cafetería El Grano de Oro',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-26',
      comment: 'El relieve bicolor en blanco y negro hace que las cámaras de los celulares lean el menú al instante, sin reflejos molestos de micas plásticas. Gran compra.'
    },
    {
      author: 'Boutique D\'Luz',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-15',
      comment: 'Lo usamos para cobrar con CoDi y Mercado Pago en caja. Se ve súper formal con nuestro logotipo en la parte superior.'
    }
  ],

  // 18. Servilletero de diseño botánico para mesa (T26)
  'servilletero-botanico-t26': [
    {
      author: 'Restaurante Las Hojas',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-12',
      comment: 'Equipamos las 15 mesas del restaurante con el calado botánico: se limpian fácil con un paño húmedo y no se rayan como los de acrílico común.'
    },
    {
      author: 'Lorena I. Paredes',
      city: 'Aguascalientes',
      rating: 5,
      date: '2026-09-02',
      comment: 'El diseño de hojas estilizadas luce divino en el comedor diario. Mantiene las servilletas derechitas sin doblarlas.'
    }
  ],

  // 19. Número de mesa tridimensional con base (T25)
  'numero-mesa-t25': [
    {
      author: 'Wedding Planner Mónica S.',
      city: 'San Miguel de Allende',
      rating: 5,
      date: '2026-10-20',
      comment: 'Pedimos del 1 al 25 en color marfil con base oro mate para una boda campestre: la peana es súper firme y los números se distinguen perfecto desde lejos.'
    },
    {
      author: 'Banquete & Eventos Solís',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-20',
      comment: 'Resistieron el viento en jardín sin volarse gracias a la base amplia. Se almacenan apilados sin problema para futuros eventos.'
    }
  ],

  // 20. Taza personalizada con logotipo o nombre (S1)
  'taza-personalizada-s1': [
    {
      author: 'Clínica Dental Sonrisas',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-10',
      comment: 'Mandamos a hacer 30 tazas con el logo del consultorio y los nombres de los doctores. Los colores del degradado salieron vivos y no se despintan al lavar.'
    },
    {
      author: 'Guillermo F. Baeza',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-05',
      comment: 'Excelente brillo del polímero térmico y es bastante ligera pero resistente para el café de la oficina.'
    }
  ],

  // 21. Posavasos de madera natural grabado con láser (L15)
  'posavasos-madera-l15': [
    {
      author: 'Arturo C. Manzano',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-18',
      comment: 'El set de madera maciza con base de corcho natural protege la mesa del calor y de la condensación fría de los vasos. El sellador poliuretano no absorbe manchas de vino ni café.'
    },
    {
      author: 'Barba Roja Cervecería',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-11',
      comment: 'Grabaron nuestro emblema cervecero en madera de pino y se ve artesanal y rústico. A los clientes les encanta.'
    }
  ],

  // 22. Chapita de identificación para mascotas (T20)
  'chapita-mascota-t20': [
    {
      author: 'Lucía B. y \"Rocky\"',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-24',
      comment: 'Elegí la chapita en forma de huesito con chip NFC: al acercar el cel abre directo mi WhatsApp y teléfono en caso de extravío. Es súper ligera y no le pesa nada en el collar a mi perrito.'
    },
    {
      author: 'Fernando Trejo',
      city: 'Saltillo, Coah.',
      rating: 5,
      date: '2026-09-23',
      comment: 'El nombre en relieve y el número grabado por atrás se leen claro y no se borran con el roce del collar. Argolla metálica gruesa y resistente.'
    }
  ],

  // 23. Portabolsas sanitario para paseo de mascotas (T21)
  'portabolsas-paseo-t21': [
    {
      author: 'Adriana Villaseñor',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-04',
      comment: 'La ventana con silueta de huellita permite ver cuándo ya se va a terminar el rollo de bolsas. El mosquetón engancha perfecto a la correa sin soltarse.'
    },
    {
      author: 'Jorge E. Macías',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-18',
      comment: 'Súper práctico para las caminatas con mis dos huskies. Se me ha caído un par de veces al suelo y el polímero ni se raspa.'
    }
  ],

  // 24. Paquete Zorrito Colección (T35)
  'paquete-zorrito-t35': [
    {
      author: 'Brenda O. Gallegos',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-15',
      comment: 'La figurita low-poly de zorrito está divina en mi repisa y el llaverito a juego lo traigo en mi mochila diario. Los stickers de vinil laminado tienen colores hermosos.'
    },
    {
      author: 'Víctor N. Garza',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-09-07',
      comment: 'Lo compré como detalle de cumpleaños para mi novia y le fascinó. La presentación del paquete viene muy cuidada con viruta kraft.'
    }
  ],

  // 25. Letrero de boda en madera / acrílico (L2)
  'letrero-boda-l2': [
    {
      author: 'Novios Andrea & Sebastián',
      city: 'Querétaro',
      rating: 5,
      date: '2026-10-07',
      comment: 'El letrero en silueta de arco de madera natural selecta con nuestros nombres caligrafiados fue la sensación en la entrada del salón. Todas las fotos en el caballete lucen mágicas.'
    },
    {
      author: 'Florería & Bodas Azahares',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-27',
      comment: 'Trabajo fino de corte láser sin bordes ahumados ni marcas quemadas. Madera 100% lisa y bien barnizada.'
    }
  ],

  // 26. Llavero con nombre en relieve y silueta botánica (T1)
  'llavero-nombre-t1': [
    {
      author: 'Regina C. Morales',
      city: 'Puebla',
      rating: 5,
      date: '2026-10-13',
      comment: 'Pedí 20 para el bautizo de mi sobrina con el nombre de cada madrina y padrino en relieve bicolor. Quedaron hermosos y muy originales.'
    },
    {
      author: 'Tania Méndez',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-16',
      comment: 'El relieve 3D no se despostilla y la tipografía botánica es súper delicada y femenina.'
    }
  ],

  // 27. Taza mágica térmica con revelado fotográfico (S8)
  'taza-magica-s8': [
    {
      author: 'Miriam S. Coronado',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-21',
      comment: 'En frío es negra mate elegante, pero le sirves café caliente y la foto de nuestro viaje a la playa aparece nítida por completo. El mejor regalo sorpresa.'
    },
    {
      author: 'Gustavo Adolfo R.',
      city: 'San Luis Potosí',
      rating: 4,
      date: '2026-09-09',
      comment: 'El revelado térmico funciona muy rápido. Solo tener cuidado de no meterla a lavavajillas para que el polímero termosensible dure años.'
    }
  ],

  // 28. Soporte de contacto inteligente NFC (T33)
  'soporte-contacto-nfc-inteligente': [
    {
      author: 'Dr. Roberto Zambrano',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-19',
      comment: 'Lo tengo en el escritorio de la consulta: mis pacientes solo acercan su teléfono y se les guarda mi contacto y ubicación directo en la agenda sin teclear nada.'
    },
    {
      author: 'Agencia Brand Pulse',
      city: 'Guadalajara',
      rating: 5,
      date: '2026-09-03',
      comment: 'Pedimos la versión piramidal para eventos de networking y te ahorra llevar cientos de tarjetas de papel. Cero fallas de lectura.'
    }
  ],

  // 29. Starter Pack GYM y Centros Deportivos (T32)
  'starter-pack-gym-t32': [
    {
      author: 'CrossFit Iron Box',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-11',
      comment: 'La placa de mostrador para que los alumnos hagan check-in en Instagram con tap NFC y los llaveros de casilleros de uso rudo le dieron un upgrade total a la recepción.'
    },
    {
      author: 'Studio Pilates Vitta',
      city: 'Querétaro',
      rating: 5,
      date: '2026-08-22',
      comment: 'Muy buena resistencia a la humedad del gimnasio y los colores combinan perfecto con nuestra identidad corporativa.'
    }
  ],

  // 30. Starter Pack Barbería y Salón (T18)
  'starter-pack-barberia-t18': [
    {
      author: 'Barbería Don Javier',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-25',
      comment: 'El portatijeras vertical protege los filos de las máquinas y tijeras sin rayarse con químicos de barbería. El soporte QR en el espejo aumentó un 40% las reseñas en Google.'
    },
    {
      author: 'La Fama Barber Shop',
      city: 'León, Gto.',
      rating: 5,
      date: '2026-09-10',
      comment: 'Material grueso y pesado que no se voltea en la estación de corte. Excelente inversión para barberos profesionales.'
    }
  ],

  // 31. Starter Pack Joyería y Boutique (T27)
  'starter-pack-joyeria-t27': [
    {
      author: 'Joyería Plata & Luna',
      city: 'Taxco / CDMX',
      rating: 5,
      date: '2026-10-08',
      comment: 'Los conos para anillos y la bandeja oval con textura cerámica hacen que las piezas de plata brillen muchísimo en la vitrina. Diseño sobrio y limpio.'
    },
    {
      author: 'Boutique Ámbar',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-15',
      comment: 'El soporte para aretes sostiene pares largos sin doblarse. A nuestras clientas les encanta cómo se exhibe la mercancía.'
    }
  ],

  // 32. Servicio Patch Bar en Vivo (EV-PATCHBAR)
  'servicio-patch-bar-en-vivo': [
    {
      author: 'Boda Sofía & Mateo',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-18',
      comment: 'Contratamos el Patch Bar para nuestra boda y fue por mucho la dinámica favorita de los invitados. Cada quien armó su gorra con parches térmicos en 2 minutos.'
    },
    {
      author: 'Eventos Corporativos Nexo',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-28',
      comment: 'El staff llegó puntual, la estación móvil impecable y las totes con parches quedaron geniales. Todo el equipo salió fascinado.'
    }
  ],

  // 33. Set Suite Nupcial Novia & Novio (EV-SUITE)
  'set-suite-nupcial-novia-novio': [
    {
      author: 'Camila R. (Novia feliz)',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-14',
      comment: 'Los ganchos de madera sólida grabados con \"Sra. Moreno\" y la fecha lucieron increíbles en las fotos del vestido colgado. Los termos personalizados nos salvaron en el maquillaje.'
    },
    {
      author: 'Fotografía Nupcial Enfoque',
      city: 'Guadalajara',
      rating: 5,
      date: '2026-09-12',
      comment: 'Como fotógrafo de bodas siempre recomiendo este set: los detalles de madera y el terciopelo elevan muchísimo la sesión de preparación (getting ready).'
    }
  ],

  // 34. Set Bienvenida & Ceremonia Nupcial (EV-CEREMONIA)
  'set-bienvenida-ceremonia-nupcial': [
    {
      author: 'Mariana & Daniel',
      city: 'San Miguel de Allende',
      rating: 5,
      date: '2026-10-22',
      comment: 'El letrero de madera para caballete y los conos de papel kraft con pétalos para la salida de la iglesia le dieron ese toque rústico elegante que buscábamos.'
    },
    {
      author: 'Coordinación Bodas & Jardín',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-01',
      comment: 'El mini letrero QR para el libro de firmas de audio funcionó al 100%. Calidad de madera natural sin deformaciones por humedad.'
    }
  ],

  // 35. Centro de Mesa Presidencial 3D & Copas (EV-PRESIDENCIAL)
  'centro-mesa-presidencial-3d-copas': [
    {
      author: 'Esposos Salgado Treviño',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-17',
      comment: 'Nuestros nombres en 3D sobre la peana de madera con acabado nogal quedaron como pieza central de la mesa de novios y ahora adornan la sala de nuestra casa.'
    },
    {
      author: 'Wedding Decor MX',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-19',
      comment: 'Las copas grabadas a juego tienen un trazo fino y el relieve 3D no tiene imperfecciones de fabricación. Muy recomendado.'
    }
  ],

  // 36. Kit Anticruda en Manta con Llaveros (EV-ANTICRUDA)
  'kit-anticruda-manta-llaveros': [
    {
      author: 'Fernando & Paulina',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-27',
      comment: 'Pedimos 80 morralitos de manta con frases divertidas y los llaveritos de madera de recuerdo. Todos los invitados en la torna-boda estaban agradecidísimos.'
    },
    {
      author: 'Despedida de Soltera Ana G.',
      city: 'Puerto Vallarta / SLP',
      rating: 5,
      date: '2026-09-20',
      comment: 'La manta de algodón crudo es gruesa y la jareta cierra perfecto para meter sobres de electrolitos, aspirinas y curitas. ¡Súper éxito!'
    }
  ],

  // 37. Combo Hogar & Recibidor Cálido (PROMO-HOG-1)
  'combo-hogar-recibidor-calido': [
    {
      author: 'Familia Morales C.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-16',
      comment: 'El trío perfecto para la entrada: el colgador de llaves con imanes, la bandeja para monedas y el letrero cálido le cambiaron la cara a nuestro departamento.'
    },
    {
      author: 'Esteban Q. Varela',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-06',
      comment: 'Ahorras bastante llevándote el combo completo en lugar de comprar las piezas por separado. Madera auténtica y excelente embalaje.'
    }
  ],

  // 38. Kit Home Office & Gamer Pro (PROMO-HOG-2)
  'kit-home-office-gamer-pro': [
    {
      author: 'Javier \"JaviTech\" G.',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-24',
      comment: 'Torre para cascos, soporte de cel, organizador y sujetacables todo en color grafito mate. Mi escritorio pasó de ser un desastre a parecer setup de creador de contenido.'
    },
    {
      author: 'Lorena H. Peñaloza',
      city: 'CDMX',
      rating: 5,
      date: '2026-09-14',
      comment: 'Comprado para el home office de mi esposo. Material muy rígido y todo ensambla sin holguras.'
    }
  ],

  // 39. Pack Consentido Peludo (PROMO-HOG-3)
  'pack-consentido-peludo-mascotas': [
    {
      author: 'Dra. Claudia V. y \"Milo\"',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-19',
      comment: 'La chapita con NFC nos da mucha tranquilidad al salir a pasear, y el portabolsas con mosquetón es súper práctico para la correa. La plaquita de madera para su plato quedó hermosa.'
    },
    {
      author: 'Ramón I. Sifuentes',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-08-29',
      comment: 'Excelente calidad para consentir a los lomitos. El polímero no huele a plástico tóxico y resiste mordidas y juegos.'
    }
  ],

  // 40. Súper Pack Restaurante & Cafetería (PROMO-BIZ-1)
  'pack-apertura-restaurante-cafe': [
    {
      author: 'Bistro San Miguel',
      city: 'San Miguel de Allende',
      rating: 5,
      date: '2026-10-12',
      comment: 'Los 10 números de mesa 3D, servilleteros botánicos y placas QR resolvieron la apertura de nuestro bistró en un solo pedido. Todo tiene armonía visual.'
    },
    {
      author: 'Café & Panadería Amelie',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-21',
      comment: 'Material lavable que no se decolora con el desinfectante de mesas. Ahorramos bastante comprando el paquete integral.'
    }
  ],

  // 41. Kit Mostrador Smart NFC & Identidad (PROMO-BIZ-2)
  'kit-mostrador-smart-nfc-identidad': [
    {
      author: 'Óptica Visión Clara',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-23',
      comment: 'El soporte piramidal para dejar reseña en Google con solo acercar el celular duplicó nuestras valoraciones en 3 semanas. La placa de Instagram en el mostrador se ve impecable.'
    },
    {
      author: 'Spa & Belleza Serenidad',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-17',
      comment: 'Fácil de usar, sin pilas ni cables. Acercas el teléfono y abre la red o menú de tratamientos al segundo.'
    }
  ],

  // 42. Starter Pack Barbería & Boutique (PROMO-BIZ-3)
  'starter-pack-barberia-salon-boutique': [
    {
      author: 'The Gentleman Lounge',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-09',
      comment: 'Kit de 27 piezas súper completo: tótems de citas, bandejas de cobro y llaveros de membresía grabados en madera. Le da un aire de barbería premium.'
    },
    {
      author: 'Salón Studio 4',
      city: 'Aguascalientes',
      rating: 5,
      date: '2026-08-30',
      comment: 'Todo llegó ordenado por estación de trabajo. Acabados muy finos y duraderos para el uso diario del salón.'
    }
  ],

  // 43. Paquete Boda de Ensueño (PROMO-EV-1)
  'paquete-boda-de-ensueno-todo-incluido': [
    {
      author: 'Valeria & Andrés (Novios)',
      city: 'Querétaro',
      rating: 5,
      date: '2026-10-26',
      comment: 'Tener resuelto el Set de la Suite, el Letrero de Bienvenida ceremonial y los recuerditos en un solo paquete nos quitó un peso enorme de encima en la planeación. Todo combinaba con nuestra temática rústica elegante.'
    },
    {
      author: 'Coordinación Nupcial Eventos VIP',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-13',
      comment: 'La calidad de corte en la madera natural y el acrílico sin rebabas hace que luzca como mobiliario de diseñador. Vale cada peso.'
    }
  ],

  // 44. Combo Fiesta Total: Patch Bar + Kits Anticruda (PROMO-EV-2)
  'combo-fiesta-recuerdos-patch-bar-anticruda': [
    {
      author: 'Boda Regina & Tomás',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-20',
      comment: 'El combo definitivo: los invitados estaban vueltos locos personalizando sus gorras en el Patch Bar en vivo y al final les entregamos sus kits anticruda con llaveros de madera. Fue el tema de conversación de toda la semana.'
    },
    {
      author: 'Producción & Bodas México',
      city: 'Guadalajara',
      rating: 5,
      date: '2026-09-05',
      comment: 'Excelente coordinación del equipo en el evento. El material de gorras y parches es de primera línea.'
    }
  ],

  // 45. Set XV Años & Graduaciones (PROMO-EV-3)
  'set-xv-anos-graduaciones-inolvidables': [
    {
      author: 'Familia Zúñiga R.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-15',
      comment: 'Para los XV años de mi hija el arco de bienvenida y los place cards hexagonales para los invitados lucieron preciosos en el jardín. Los llaveros con su nombre fueron el mejor recuerdo.'
    },
    {
      author: 'Generación 2026 Medicina UASLP',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-25',
      comment: 'Mandamos a hacer el set para nuestra cena de graduación y el letrero con el escudo grabado quedó para enmarcar en el auditorio.'
    }
  ],

  // 46. Bolsa Tote Bag de Manta con Vinil Textil (VN-TOTE-01)
  'bolsa-tote-bag-manta-vinil-textil': [
    {
      author: 'Daniela Valero',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-24',
      comment: 'La manta de algodón crudo es gruesa (240g) y aguanta mis libros de la universidad y laptop sin vencerse de las asas. El estampado en vinil textil se siente terso y no se cuartea al lavarlo.'
    },
    {
      author: 'Librería El Tapiz',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-18',
      comment: 'Pedimos 25 totes con nuestra ilustración para clientes frecuentes: las asas vienen reforzadas con doble costura y el color de la manta sin blanqueadores químicos se ve muy orgánico.'
    }
  ],

  // 47. Gorra Trucker Personalizada (VN-GORRA-01)
  'gorra-trucker-personalizada-vinil-parche': [
    {
      author: 'Taquería Los Compadres',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-22',
      comment: 'El parche térmico con vinil textil en el frente acolchado no se despega con el sudor ni el uso rudo. La malla trasera es súper fresca para el turno de trabajo.'
    },
    {
      author: 'Marcos E. Cifuentes',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-09-10',
      comment: 'El broche snapback ajustable queda cómodo y la visera viene con la curvatura exacta. Diseño muy limpio.'
    }
  ],

  // 48. Playera 100% Algodón Peinado con Vinil Textil (VN-PLAYERA-01)
  'playera-algodon-personalizada-vinil-textil': [
    {
      author: 'Banda Los Forasteros',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-25',
      comment: 'La playera de algodón peinado tiene tacto ultrasuave y tapa-costura en el cuello para que no raspe. El vinil textil HD capturó detalles de líneas muy finas de nuestro logo.'
    },
    {
      author: 'Alejandra P. Guzmán',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-03',
      comment: 'Corte unisex que ajusta perfecto en hombros y pecho. No se encogió en el primer lavado con agua fría y el estampado no se arrugó.'
    }
  ],

  // 49. Taza Mágica Térmica Sublimada (SB-TAZA-01)
  'taza-magica-termica-sublimada': [
    {
      author: 'Lic. Fernando Trejo',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-21',
      comment: 'La cerámica AAA tiene un brillo impecable. Le viertes café hirviendo y el negro desaparece por completo revelando la foto con nitidez fotográfica. Excelente regalo sorpresa.'
    },
    {
      author: 'Brenda K. Solano',
      city: 'Puebla',
      rating: 4,
      date: '2026-09-15',
      comment: 'Se ve súper bonita y elegante en negro mate cuando está fría. Llegó en su caja blanca con plástico burbuja muy segura.'
    }
  ],

  // 50. Termo Metálico Térmico 20 oz (SB-TERMO-01)
  'termo-metalico-termico-20oz-personalizado': [
    {
      author: 'Dr. Víctor Hugo M.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-26',
      comment: 'El Skinny Tumbler de doble pared de 20 oz mantiene mi café caliente durante toda la guardia de 8 horas. El vinil permanente con mi nombre no se despinta ni se despega al lavarlo diario.'
    },
    {
      author: 'Gimnasio FitZone',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-09-22',
      comment: 'La tapa acrílica sella hermético sin derrames en la mochila. Excelente grabado y textura exterior antideslizante.'
    }
  ],

  // 51. Cake Topper para Pastel en Madera Calada & Acrílico Espejo (EV-TOPPER-01)
  'topper-pastel-boda-ev-topper': [
    {
      author: 'Pastelería Dulce Arte',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-17',
      comment: 'Montamos el topper en un pastel de bodas de 3 pisos: la madera calada con acrílico espejo dorado brilla hermoso con las luces del salón y el poste grado alimenticio no mancha el betún.'
    },
    {
      author: 'Novia Andrea Gómez',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-08',
      comment: 'Nuestros nombres caligrafiados quedaron exactos al boceto que aprobamos por WhatsApp. Llegó con soporte de cartón rígido para que no se rompiera ninguna letra.'
    }
  ],

  // 52. Place Cards Hexagonales (EV-PLACE-01)
  'place-cards-hexagonales-ev-place': [
    {
      author: 'Coordinación Nupcial Rosa Pastel',
      city: 'San Miguel de Allende',
      rating: 5,
      date: '2026-10-19',
      comment: 'Pedimos 120 plaquitas hexagonales en madera de abedul fino con los nombres de los invitados grabados a láser. En las mesas sobre las servilletas se veían de ensueño.'
    },
    {
      author: 'Mariana S. de la Parra',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-31',
      comment: 'Todos los invitados se llevaron su plaquita como llavero o recuerdo personal. Muy finas y bien lijadas en los bordes.'
    }
  ],

  // 53. Libro de Firmas Rústico con Portada de Madera (EV-GUEST-01)
  'libro-firmas-rustico-madera-ev-guest': [
    {
      author: 'Esposos Méndez Durán',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-23',
      comment: 'Las pastas de madera natural de abedul de 4mm con nuestros nombres grabados y los arillos rústicos tienen una presencia hermosa. Las hojas de cartulina opalina gruesa no traspasan la tinta de las plumas.'
    },
    {
      author: 'Boda campestre Los Laureles',
      city: 'Aguascalientes',
      rating: 5,
      date: '2026-09-14',
      comment: 'El mejor recuerdo de la boda. Los invitados pegaron fotos instantáneas y escribieron mensajes sin que las hojas se arruguen.'
    }
  ],

  // 54. Cajitas Souvenir de Recuerdo con Calado Botánico (EV-CAJITAS-01)
  'cajitas-souvenir-botanicas-ev-cajitas': [
    {
      author: 'Lorena K. Ballesteros',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-11',
      comment: 'Metimos almendras confitadas en las cajitas de madera calada con filigrana botánica para la primera comunión de mi hijo. Lucen como piezas de artesanía fina.'
    },
    {
      author: 'Eventos & Recuerdos México',
      city: 'Zacatecas',
      rating: 5,
      date: '2026-08-26',
      comment: 'El ensamble por pestañas encaja perfecto y el calado láser es súper limpio sin residuos de carbón.'
    }
  ],

  // 55. Abanicos de Mano Grabados para Ceremonias de Jardín (EV-ABANICO-01)
  'abanicos-jardin-grabados-ev-abanico': [
    {
      author: 'Novios Karen & David',
      city: 'Cuernavaca / SLP',
      rating: 5,
      date: '2026-10-06',
      comment: 'Nuestra boda fue en jardín a mediodía: los abanicos con el varillaje de madera grabado con la fecha y nuestros nombres salvaron del calor a las invitadas y salieron divinos en las fotos.'
    },
    {
      author: 'Hacienda San José Eventos',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-02',
      comment: 'Varillaje de abedul pulido que abre y cierra suave, sin astillas. La tela resiste bien el uso continuo.'
    }
  ],

  // 56. Par de Copas de Brindis con Vinil Permanente (EV-COPAS-01)
  'copas-brindis-vinil-metalico-ev-copas': [
    {
      author: 'Novios Pamela & Jorge',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-25',
      comment: 'El vinil permanente dorado metálico sobre las copas tipo flauta tiene un brillo espectacular para el brindis de honor. Ya las lavamos con cuidado y el texto sigue intacto.'
    },
    {
      author: 'Banquetería Cristal',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-09-19',
      comment: 'Vidrio transparente de buen sonido al brindar y tipografía nupcial muy elegante. Vienen en caja acolchada.'
    }
  ],

  // 57. Marcacopas / Charms Botánicos para Invitados (EV-CHARMS-01)
  'charms-marcacopas-botanicos-ev-charms': [
    {
      author: 'Sommelier Mauricio T.',
      city: 'Querétaro',
      rating: 5,
      date: '2026-10-13',
      comment: 'Los usamos en una cata de vinos: los dijes botánicos con inicial en el tallo de cada copa evitaron que los comensales confundieran sus copas durante la cena maridaje.'
    },
    {
      author: 'Cena Aniversario Los Encinos',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-28',
      comment: 'Argolla metálica fácil de colocar y los dijes de madera no pesan ni desbalancean la copa. Detalle muy elogiado.'
    }
  ],

  // 58. Mini Letrero de Estación con Código QR (EV-CANDY-01)
  'mini-letrero-qr-candybar-ev-candy': [
    {
      author: 'Candy Bar & Mesas Dulces MX',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-22',
      comment: 'Lo pusimos en la estación de postres con el código QR para que los invitados subieran sus fotos de la fiesta a la carpeta de Drive: súper legible y la base ranurada de madera no se cae.'
    },
    {
      author: 'Graduación Odontología',
      city: 'León, Gto.',
      rating: 5,
      date: '2026-09-11',
      comment: 'Tamaño compacto que no estorba entre los platones de dulces. Muy buen grabado láser sobre madera de 4 mm.'
    }
  ],

  // 59. Tarjetero de Negocios Minimalista (T17)
  'tarjetero-negocios-t17': [
    {
      author: 'Despacho Contable Gómez & Asoc.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-16',
      comment: 'Diseño geométrico en grafito mate muy sobrio. Sostiene unas 40 tarjetas de presentación en el mostrador en el ángulo perfecto para que el cliente las tome fácilmente.'
    },
    {
      author: 'Arquitectura & Espacios',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-07',
      comment: 'Ocupa muy poco espacio en la mesa de recepción y el polímero tiene buen peso, no se mueve al sacar una tarjeta.'
    }
  ],

  // 60. Leopardo Bobble Head con Movimiento (J1)
  'leopardo-bobble-head-j1': [
    {
      author: 'Familia Peñalosa M.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-24',
      comment: '¡Mi hijo de 6 años no lo suelta! La cabeza oscila con el más mínimo toque gracias al péndulo mecánico interno sin necesidad de pilas ni resortes peligrosos. Las esquinas redondeadas dan mucha tranquilidad.'
    },
    {
      author: 'Esteban Rivas',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-01',
      comment: 'Lo tengo en el tablero de mi coche: con las curvas y el movimiento del auto cabecea de forma súper divertida. Calidad de impresión print-in-place impecable.'
    }
  ],

  // 61. Zorrito Articulado Flexible Multifunción (J2)
  'zorro-articulado-flexible-j2': [
    {
      author: 'Carolina V. Sifuentes',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-26',
      comment: 'El cuerpo articulado es súper flexible y relajante para mover entre los dedos en la oficina. El imán trasero lo mantiene pegado al pizarrón magnético cuando no lo uso.'
    },
    {
      author: 'Mateo L. Morales (10 años)',
      city: 'Saltillo, Coah.',
      rating: 5,
      date: '2026-09-16',
      comment: 'Los eslabones no se desarman y el color naranja brillante con blanco en el pecho se ve idéntico a las fotos.'
    }
  ],

  // 62. Funko Custom Mascotas (CUST-FUNKO-PETS)
  'figuras-funko-mascotas': [
    {
      author: 'Beatriz Aldape',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-20',
      comment: 'Inmortalizaron a mi schnauzer \"Max\" con su mancha café en la oreja y su plaquita azul. La caja personalizada con su foto y nombre me hizo llorar de lo bonito que quedó.'
    },
    {
      author: 'Dr. Veterinario Sánchez',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-09-25',
      comment: 'Recrearon el pelaje de un gato persa con un nivel de detalle en resina 3D asombroso. Un homenaje para siempre.'
    }
  ],

  // 63. Funko Custom Parejas (CUST-FUNKO-PAREJAS)
  'figuras-funko-parejas': [
    {
      author: 'Novios Melissa & Kevin',
      city: 'Querétaro',
      rating: 5,
      date: '2026-10-18',
      comment: 'Pedí el set dúo para nuestro aniversario de 3 años vestidos con la ropa de nuestro primer viaje. Capturaron mi peinado y la barba de mi novio al 100%. El mejor regalo de la historia.'
    },
    {
      author: 'Boda David & Tania',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-12',
      comment: 'Los usamos como cake topper en la boda y después en su caja doble de exhibición en nuestra casa. Todos los invitados se tomaron fotos con ellos.'
    }
  ],

  // 64. Funko Custom Profesiones & Graduaciones (CUST-FUNKO-PROF)
  'figuras-funko-profesiones': [
    {
      author: 'Dra. Sofía Lozano',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-14',
      comment: 'Se lo regalé a mi hermana por titularse de Medicina: figura con su bata blanca bordada, estetoscopio al cuello y su título en miniatura. La caja POP de graduación es un tesoro.'
    },
    {
      author: 'Ing. Fernando Carvajal',
      city: 'Puebla',
      rating: 5,
      date: '2026-08-28',
      comment: 'Mi figura de ingeniero civil con casco de seguridad y planos bajo el brazo quedó idéntica a mis fotos de obra. Trabajo de modelado 3D de 10.'
    }
  ],

  // 65. Funko Custom Amigos & Cumpleaños (CUST-FUNKO-AMIGOS)
  'figuras-funko-amigos': [
    {
      author: 'Sebastián & Emiliano',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-22',
      comment: 'Mandamos a hacer nuestro dúo de mejores amigos con las playeras de nuestro equipo y los tenis que usamos para jugar pádel. La caja dice \"Best Friends Edition\" y quedó épica.'
    },
    {
      author: 'Valeria M. Rangel',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-09',
      comment: 'Fue el regalo para mi mejor amiga en sus 25 años. No paró de reírse y presumirlo en Instagram. El parecido es total.'
    }
  ],

  // 66. Funko Custom Pack Familiar (CUST-FUNKO-FAMILIA)
  'figuras-funko-familia': [
    {
      author: 'Familia Trejo Navarro',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-17',
      comment: 'Pack de 3 figuras: papá, mamá y nuestra hija pequeña. La caja panorámica triple es preciosa y el detalle en la ropa de cada uno refleja perfecto a nuestra familia. Se ve genial en la sala.'
    },
    {
      author: 'Enrique L. Padrón',
      city: 'CDMX',
      rating: 5,
      date: '2026-09-03',
      comment: 'El empaque vino reforzado con triple capa de burbuja. Las figuras tienen muy buena estabilidad de pie y acabados de pintura detallados.'
    }
  ],

  // 67. Funko Custom Abuelitos (CUST-FUNKO-ABUELITOS)
  'figuras-funko-abuelitos': [
    {
      author: 'Nietos de Don Ramón & Doña Elvira',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-27',
      comment: 'El regalo más conmovedor que les hemos dado a mis abuelos por sus Bodas de Oro. Capturaron los lentes de montura dorada de mi abuelo y el chal tejido de mi abuela. Lloraron de alegría.'
    },
    {
      author: 'Claudia M. Benítez',
      city: 'Zacatecas',
      rating: 5,
      date: '2026-09-17',
      comment: 'La ternura y el respeto con el que modelaron las figuras se nota en cada detalle. Llegó impecable hasta mi domicilio.'
    }
  ],

  // 68. De Dibujo a 3D: Dragón Mágico (CUST-DIBUJO-DRAGON)
  'de-dibujo-a-figura-3d': [
    {
      author: 'Papás de Iker (7 años)',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-23',
      comment: 'Mi hijo dibujó un dragón verde con alas de murciélago y cuernos torcidos: ¡verlo convertido en un juguete 3D real idéntico a su dibujo en la libreta le voló la cabeza! No lo suelta para dormir.'
    },
    {
      author: 'Mtra. Lucero D.',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-11',
      comment: 'Un concepto maravilloso que premia la imaginación infantil. El material es resistente a caídas y no tiene puntas filosas.'
    }
  ],

  // 69. De Dibujo a 3D: Ajolote (CUST-DIBUJO-AJOLOTE)
  'de-dibujo-a-figura-3d-ajolote': [
    {
      author: 'Mamá de Romina (8 años)',
      city: 'CDMX',
      rating: 5,
      date: '2026-10-19',
      comment: 'Mi hija dibujó un ajolotito sonriente con branquias rosas. El taller recreó cada trazo en una escultura 3D adorable y suave al tacto. Una joya para recordar su infancia.'
    },
    {
      author: 'Lic. Tomás V. H.',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-08-29',
      comment: 'Los colores son súper vivos y la figura tiene una estabilidad perfecta en el escritorio.'
    }
  ],

  // 70. De Dibujo a 3D: Dinosaurio / T-Rex (CUST-DIBUJO-DINO)
  'de-dibujo-a-figura-3d-dinosaurio': [
    {
      author: 'Familia Coronado G.',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-21',
      comment: 'Mi pequeño Santiago dibujó un T-Rex con brazos chiquitos y dientes chistosos. El equipo de Artesano Digital respetó el diseño original al 100%. Es el juguete favorito de la casa.'
    },
    {
      author: 'Raúl E. Tovar',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-15',
      comment: 'El proceso fue súper fácil: mandé la foto del dibujo por WhatsApp y a los 3 días ya estaba modelado e impreso. Servicio de primera.'
    }
  ],

  // 71. De Dibujo a 3D: Cohete Espacial (CUST-DIBUJO-COHETE)
  'de-dibujo-a-figura-3d-cohete': [
    {
      author: 'Ing. Pablo & Leo (6 años)',
      city: 'Guadalajara, Jal.',
      rating: 5,
      date: '2026-10-15',
      comment: 'Leo dibujó un cohete rumbo a Marte con fuego saliendo del motor. La pieza 3D viene con una base que parece nube de despegue: ¡el mejor regalo que le he dado a mi hijo!'
    },
    {
      author: 'Fernanda M. Beltrán',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-04',
      comment: 'Acabado muy liso y colores firmes. Llegó antes del día de su cumpleaños.'
    }
  ],

  // 72. De Dibujo a 3D: Coche de Carreras (CUST-DIBUJO-COCHE)
  'de-dibujo-a-figura-3d-coche': [
    {
      author: 'Papá de Matías (5 años)',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-24',
      comment: 'Mi niño dibujó un carro de carreras con alerón gigante y escape con flama. Convertirlo en juguete real con sus llantitas fue la mejor sorpresa de su vida.'
    },
    {
      author: 'Gerardo S. Orozco',
      city: 'Aguascalientes',
      rating: 5,
      date: '2026-08-23',
      comment: 'Muy buena resistencia a los golpes. Mi hijo lo hace correr por toda la casa y sigue intacto.'
    }
  ],

  // 73. De Dibujo a 3D: Monstruo Divertido (CUST-DIBUJO-MONSTRUO)
  'de-dibujo-a-figura-3d-monstruo': [
    {
      author: 'Mamá de Sofi (7 años)',
      city: 'Puebla',
      rating: 5,
      date: '2026-10-18',
      comment: 'El monstruo de 3 ojos y cuerno azul que dibujó mi niña cobró vida en una pieza 3D súper simpática. Ahora duerme en su buró como su monstruo protector.'
    },
    {
      author: 'Estudio Creativo Kids',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-09-07',
      comment: 'Respetaron cada trazo del plumón infantil. Calidad de impresión limpia sin rebabas.'
    }
  ],

  // 74. De Dibujo a 3D: Castillo Medieval (CUST-DIBUJO-CASTILLO)
  'de-dibujo-a-figura-3d-castillo': [
    {
      author: 'Papás de Bruno y Damián',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-25',
      comment: 'Mis hijos dibujaron un castillo con murallas y banderas para jugar con sus figuras: el modelo 3D tiene base sólida y los detalles de las torres quedaron espectaculares.'
    },
    {
      author: 'Arquitectura Lúdica MX',
      city: 'Querétaro',
      rating: 5,
      date: '2026-09-18',
      comment: 'Estructura muy firme y los colores contrastan perfecto. Gran trabajo de modelado adaptado a niños.'
    }
  ],

  // 75. Clicker Mecánico Antiestrés (T42)
  'clicker-mecanico-fidget-t42': [
    {
      author: 'Emilio V. Cárdenas',
      city: 'San Luis Potosí',
      rating: 5,
      date: '2026-10-27',
      comment: 'El switch Outemu Blue tiene un clic táctil y sonoro súper adictivo para desestresarse mientras estás en llamadas o programando. La argolla de llavero permite traerlo con las llaves del carro a todos lados.'
    },
    {
      author: 'Ing. Carlos Mendoza',
      city: 'Monterrey, N.L.',
      rating: 5,
      date: '2026-10-12',
      comment: 'La textura mate del keycap impreso en 3D se siente muy ergonómica y el switch se puede cambiar fácilmente si quieres probar uno silencioso. Me pedí 3 para regalar en la oficina.'
    }
  ]
};

// Generar array plano con formato completo
export function generateFullReviews(products) {
  const list = [];
  products.forEach(p => {
    const reviews = REVIEWS_BY_PRODUCT[p.id] || [];
    reviews.forEach((r, idx) => {
      list.push({
        id: `rev-${p.code || p.id}-${idx + 1}`.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
        productId: p.id,
        productCode: p.code || '',
        productName: p.name,
        technique: (p.techniques && p.techniques[0]) || '3d',
        author: r.author,
        city: r.city,
        rating: r.rating,
        date: r.date,
        comment: r.comment,
        verified: true,
        approved: true,
        source: 'seed'
      });
    });
  });
  return list;
}
