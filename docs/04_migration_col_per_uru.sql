-- ============================================================
-- PULZ — Expanded Races: Colombia, Peru, Uruguay
-- Ejecutar DESPUES de 02_migration.sql en Supabase SQL Editor
-- ============================================================
-- Este script PRIMERO elimina las carreras existentes de estos
-- tres paises y luego inserta las versiones ampliadas y verificadas.
-- ============================================================

-- Limpiar carreras existentes de Colombia, Peru y Uruguay
DELETE FROM races WHERE country_id IN ('colombia', 'peru', 'uruguay');

-- ============================================================
-- COLOMBIA (40 carreras verificadas)
-- ============================================================

-- 1. Media Maraton del Mar
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón del Mar',
  '2026-02-22',
  'colombia',
  'Cartagena, Bolívar',
  '{"21K","10K","5K"}',
  'road',
  'https://mediamaratondelmar.com/',
  'Considerada la carrera más bonita de Colombia. El recorrido cruza el puerto de Cartagena y atraviesa la ciudad amurallada al amanecer, con vistas al Caribe.',
  'COP 140.000 / USD 35',
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 2. Carrera de las Rosas Barranquilla
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera de las Rosas',
  '2026-02-22',
  'colombia',
  'Barranquilla, Atlántico',
  '{"21K","10K","5K"}',
  'road',
  'https://carreradelasrosas.com/barranquilla/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 3. Carrera Farmatodo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera Farmatodo',
  '2026-03-01',
  'colombia',
  'Bogotá D.C.',
  '{"12K","6K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 4. Maraton Internacional de Barranquilla
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Internacional de Barranquilla',
  '2026-03-15',
  'colombia',
  'Barranquilla, Atlántico',
  '{"42K","21K","10K","5K"}',
  'road',
  'https://www.maratonbarranquilla.com/',
  'Décima edición de la maratón que reúne 10.000 corredores. Recorrido que incluye el Ecoparque Ciénaga de Mallorquín y las playas de Puerto Mocho.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 5. Media Maraton del Huila
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón del Huila',
  '2026-03-15',
  'colombia',
  'Neiva, Huila',
  '{"21K","12K","6K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 6. Corre por Amor
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Corre por Amor',
  '2026-03-15',
  'colombia',
  'Medellín, Antioquia',
  '{"12K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 7. Carrera Verde Cali
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera Verde Cali',
  '2026-03-15',
  'colombia',
  'Cali, Valle del Cauca',
  '{"10K","5K","2K"}',
  'road',
  'https://carreraverdecolombia.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 8. Media Maraton del Quindio
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón del Quindío',
  '2026-03-22',
  'colombia',
  'Armenia, Quindío',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 9. Maraton Internacional Metropolitana de Cucuta
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Internacional Metropolitana de Cúcuta',
  '2026-03-22',
  'colombia',
  'Cúcuta, Norte de Santander',
  '{"42K","21K","10K","5K"}',
  'road',
  'https://maratoncucutametropolitana.com/',
  'Primera maratón de 42 kilómetros del oriente colombiano, certificada por World Athletics. Incluye el Campeonato Nacional de Ruta.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 10. Media Maraton de Pasto
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Pasto',
  '2026-03-22',
  'colombia',
  'Pasto, Nariño',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 11. Night Race 10K
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Night Race 10K',
  '2026-03-22',
  'colombia',
  'Bogotá D.C.',
  '{"10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 12. Carrera Verde Bogota
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera Verde Bogotá',
  '2026-04-19',
  'colombia',
  'Bogotá D.C.',
  '{"10K","5K","3K"}',
  'road',
  'https://carreraverdecolombia.com/',
  'XI edición. Combina deporte con acción ambiental. Parque Simón Bolívar. Incluye feria ambiental con más de 35 iniciativas sostenibles.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 13. Corre Mi Tierra Medellin
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Corre Mi Tierra Medellín',
  '2026-04-19',
  'colombia',
  'Medellín, Antioquia',
  '{"21K","15K","10K","5K"}',
  'road',
  'https://corremitierra.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 14. Vuelta Atletica Isla San Andres
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Vuelta Atlética Isla San Andrés',
  '2026-04-26',
  'colombia',
  'San Andrés Isla',
  '{"32K","21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 15. Quindia Trail Colombia by UTMB
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Quindío Trail Colombia by UTMB',
  '2026-05-02',
  'colombia',
  'Buenavista, Quindío',
  '{"122K","84K","52K","24K","14K"}',
  'trail',
  'https://quindio.utmb.world/',
  'Parte del circuito mundial UTMB. Recorrido por el corazón del Eje Cafetero atravesando 12 municipios del Quindío, entre cafetales, bosques de niebla y paisaje cultural cafetero (Patrimonio UNESCO).',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 16. Maraton de Cali
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón de Cali',
  '2026-05-03',
  'colombia',
  'Cali, Valle del Cauca',
  '{"42K","15K","4.2K"}',
  'road',
  'https://maratondecali.co/',
  'Primera maratón de América Latina con Sello Élite de World Athletics. La Capital de la Salsa vibra con un ambiente festivo único en las calles históricas de Cali.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 17. Silvia Trail Ancestral
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Silvia Trail Ancestral',
  '2026-05-19',
  'colombia',
  'Silvia, Cauca',
  '{"42K","21K","13K","7K"}',
  'trail',
  'https://www.montanaancestral.com/silviatrail/',
  'Carrera de montaña por territorio Misak-Guambiano. Ruta llena de historia y sabiduría ancestral en los Andes del Cauca.',
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 18. Carrera de las Rosas Bogota
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera de las Rosas Bogotá',
  '2026-05-24',
  'colombia',
  'Bogotá D.C.',
  '{"15K","10K","5K"}',
  'road',
  'https://carreradelasrosas.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 19. Maraton Dulima
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Dulima',
  '2026-06-07',
  'colombia',
  'Ibagué, Tolima',
  '{"42K","21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 20. Media Maraton Cordoba
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón Córdoba',
  '2026-06-07',
  'colombia',
  'Montería, Córdoba',
  '{"21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 21. Media Maraton de Cali
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Cali',
  '2026-06-28',
  'colombia',
  'Cali, Valle del Cauca',
  '{"21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 22. Media Maraton de Floridablanca
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Floridablanca',
  '2026-07-05',
  'colombia',
  'Floridablanca, Santander',
  '{"21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 23. Chicamocha Canyon Race
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Chicamocha Canyon Race',
  '2026-07-17',
  'colombia',
  'San Gil, Santander',
  '{"100Mi","80K","42K","21K"}',
  'trail',
  'https://chicamochacanyonrace.com/',
  '14.ª edición. 4 días y 3 noches de competencia non-stop. Más de 1.200 corredores de distintas nacionalidades recorren 10 municipios de Santander. Votada mejor carrera trail de Colombia en 2024.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 24. Ultra Valle de Tenza
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Ultra Valle de Tenza',
  '2026-07-23',
  'colombia',
  'Guateque, Boyacá',
  '{"79K","43K","21K","9K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 25. Media Maraton de Bogota
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Bogotá',
  '2026-07-26',
  'colombia',
  'Bogotá D.C.',
  '{"21K","10K"}',
  'road',
  'https://www.mediamaratonbogota.com/',
  'La carrera atlética #1 de Colombia. Sello Platinum de World Athletics. 40.000 corredores a 2.600 msnm. Conocida como "El Monstruo".',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 26. La Carrera del Pacifico
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  '10K La Carrera del Pacífico',
  '2026-08-09',
  'colombia',
  'Cali, Valle del Cauca',
  '{"10K"}',
  'road',
  NULL,
  'Carrera internacional 10K en Cali.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 27. Media Maraton Ciudad Bonita Bucaramanga
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón Ciudad Bonita',
  '2026-08-16',
  'colombia',
  'Bucaramanga, Santander',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 28. Carrera de la Mujer
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera de la Mujer',
  '2026-09-06',
  'colombia',
  'Bogotá D.C.',
  '{"10K","8K","4K","2K"}',
  'road',
  NULL,
  'Una de las carreras femeninas más importantes de América Latina.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 29. Maraton de Medellin
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón de Medellín',
  '2026-09-06',
  'colombia',
  'Medellín, Antioquia',
  '{"42K","21K","10K","5K"}',
  'road',
  'https://maratonmedellin.com/',
  'La maratón pionera de los 42K en Colombia. Certificada por AIMS y clasificatoria para Boston. Clima primaveral a 1.500 msnm. Salida y meta en Parques del Río.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 30. Ultra La Mesa
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Ultra La Mesa "Ruta de Los Miradores"',
  '2026-09-27',
  'colombia',
  'La Mesa, Cundinamarca',
  '{"55K","22K","10K","3K"}',
  'trail',
  'https://www.ultralamesa.com/',
  NULL,
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 31. Bimbo Global Race
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Bimbo Global Race',
  '2026-09-27',
  'colombia',
  'Bogotá D.C.',
  '{"10K","5K"}',
  'road',
  'https://www.bimboglobalracecolombia.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 32. Media Maraton del Cafe
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón del Café',
  '2026-10-04',
  'colombia',
  'Pereira, Risaralda',
  '{"21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 33. Media Maraton del Meta
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón del Meta',
  '2026-10-04',
  'colombia',
  'Villavicencio, Meta',
  '{"21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 34. Frontera Endurance Run
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Frontera Endurance Run',
  '2026-10-06',
  'colombia',
  'Jardín, Antioquia',
  '{"55K","21K","12K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 35. Media Maraton Bucaramanga FCV
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Bucaramanga FCV',
  '2026-10-18',
  'colombia',
  'Bucaramanga, Santander',
  '{"21K","10.5K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 36. Media Maraton Internacional de Cucuta
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón Internacional de Cúcuta',
  '2026-11-15',
  'colombia',
  'Cúcuta, Norte de Santander',
  '{"21K","10K","5K"}',
  'road',
  'https://www.mediamaratoncucuta.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 37. Media Maraton Bambuquera
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón Bambuquera',
  '2026-11-22',
  'colombia',
  'Neiva, Huila',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 38. Corre Mi Tierra Bogota
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Corre Mi Tierra Bogotá',
  '2026-11-22',
  'colombia',
  'Bogotá D.C.',
  '{"21K","15K","10K","5K"}',
  'road',
  'https://corremitierra.com/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 39. 42K VChallenges Maraton Bogota
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  '42K VChallenges Maratón Bogotá',
  '2026-11-29',
  'colombia',
  'Bogotá D.C.',
  '{"42K","21K"}',
  'road',
  NULL,
  'Maratón de Bogotá a 2.600 msnm.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 40. Del Mar a La Cima
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Del Mar a La Cima',
  '2026-11-30',
  'colombia',
  'Santa Marta, Magdalena',
  '{"110K","81.5K","41.6K","24.5K","12K"}',
  'trail',
  'https://delmaralacima.com/',
  'La carrera de montaña más exótica del planeta. Desde la playa hasta la Sierra Nevada de Santa Marta, la montaña costera más alta del mundo. Conecta trail running con la biodiversidad.',
  NULL,
  true,
  'estimated',
  'pulz',
  'approved'
);

-- ============================================================
-- PERU (22 carreras verificadas)
-- ============================================================

-- 1. Maraton Internacional de Lambayeque
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Internacional de Lambayeque',
  '2026-01-25',
  'peru',
  'Lambayeque',
  '{"42K","21K","10K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 2. Ultra Kuelap
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Ultra Kuélap',
  '2026-01-31',
  'peru',
  'Luya, Amazonas',
  '{"Ultra","42K","21K"}',
  'trail',
  NULL,
  'Trail en la región de la fortaleza de Kuélap, en la selva alta de Amazonas.',
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 3. Media Maraton de Trujillo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Trujillo',
  '2026-02-08',
  'peru',
  'Trujillo, La Libertad',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 4. Maratón Internacional Virgen de la Candelaria de Cayma
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Internacional Virgen de la Candelaria de Cayma',
  '2026-03-15',
  'peru',
  'Cayma, Arequipa',
  '{"42K","21K","10K"}',
  'road',
  NULL,
  'XXXIX edición. Una de las maratones más tradicionales de Arequipa.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 5. Lima Ultramaraton
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Lima Ultramaratón',
  '2026-03-27',
  'peru',
  'Lima',
  '{"Ultra"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 6. Carrera de Mujeres Peru
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera de Mujeres Perú',
  '2026-03-08',
  'peru',
  'Miraflores, Lima',
  '{"10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 7. Inca Trail (April edition)
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Inca Trail',
  '2026-04-19',
  'peru',
  'Cusco',
  '{"42K","30K"}',
  'trail',
  NULL,
  'Trail running por los caminos incas en la región de Cusco.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 8. Andes Trail Peru
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Andes Trail Peru',
  '2026-04-05',
  'peru',
  'Písac, Cusco',
  '{"42K","21K","10K"}',
  'trail',
  NULL,
  'Trail running por el Valle Sagrado de los Incas, Písac.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 9. Sierra Andina - Chavin Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Sierra Andina - Chavín Trail',
  '2026-05-03',
  'peru',
  'Huaraz, Áncash',
  '{"43.7K","21.4K","12.6K"}',
  'trail',
  'https://sierraandinaoutdoors.com',
  'Trail por senderos ancestrales de Chavín de Huántar en la Cordillera Blanca. Paso de montaña Punta Yanashallah a 4.700 msnm.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 10. Wings for Life World Run Lima
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Wings for Life World Run Lima',
  '2026-05-10',
  'peru',
  'Lima',
  '{"Open"}',
  'road',
  'https://www.wingsforlifeworldrun.com/en/locations/lima',
  'Carrera global donde todos arrancan al mismo tiempo. El 100% de las inscripciones se destina a investigación de lesiones de médula espinal.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 11. Inca Wildmarathon
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Inca Wildmarathon',
  '2026-05-24',
  'peru',
  'Machu Picchu Pueblo, Cusco',
  '{"42K","21K","10K"}',
  'trail',
  'https://wildmarathon.com/inca-marathon-3/',
  'Carrera trail de 6 días entre los valles de Salkantay y Machu Picchu. Incluye programa de aclimatación, alojamiento y comidas. Finaliza en el pueblo de Machu Picchu.',
  'USD 2.290 - 2.490',
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 12. Maraton adidas Rimac Lima 42K
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón adidas Rímac Lima 42K',
  '2026-05-24',
  'peru',
  'Lima',
  '{"42K","21K"}',
  'road',
  'https://lima42k.com.pe/',
  'La maratón más grande del Perú. Organizada por adidas y Rímac.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 13. Ultra Machu Picchu Qhapac Nan
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Ultra Machu Picchu Qhapac Ñan',
  '2026-06-20',
  'peru',
  'Cusco',
  '{"103K","65K","42K","21K"}',
  'trail',
  'https://ultramachupicchu.com/',
  'Ultramaratón de alta montaña inspirada en el Qhapaq Ñan (sistema vial inca). Senderos ancestrales, bosques nublados, lagunas cristalinas y las terrazas agrícolas de Chinchero. 5.808 m+ de desnivel.',
  'desde USD 259',
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 14. Pacasmayo Marathon
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón Internacional de Pacasmayo',
  '2026-07-05',
  'peru',
  'Pacasmayo, La Libertad',
  '{"42K","21K","10K","5K"}',
  'road',
  NULL,
  'Conocida como "La maratón más dura del Perú". Combina vistas del Pacífico, caminos de tierra y desierto.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 15. Machu Picchu Trail Adventure
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Machu Picchu Trail Adventure',
  '2026-07-05',
  'peru',
  'Cusco',
  '{"126K","97K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 16. Sierra Andina Mountain Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Sierra Andina Mountain Trail',
  '2026-07-19',
  'peru',
  'Huamachuco, La Libertad',
  '{"48.1K","30.8K","15.4K"}',
  'trail',
  'https://sierraandinaoutdoors.com',
  NULL,
  NULL,
  false,
  'estimated',
  'pulz',
  'approved'
);

-- 17. KIA Media Maraton de Lima
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'KIA Media Maratón de Lima & 10K',
  '2026-08-23',
  'peru',
  'Lima',
  '{"21K","10K"}',
  'road',
  'https://mediamaratondelima.com.pe/',
  '117.ª edición. La media maratón más antigua del mundo. Sale de la Plaza de Armas de Lima y termina en el Circuito Mágico del Agua. Se esperan 23.000 corredores.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 18. Inca Trail Marathon (August edition - Erik's Adventures)
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Inca Trail Marathon',
  '2026-08-24',
  'peru',
  'Machu Picchu, Cusco',
  '{"42K","21K"}',
  'trail',
  'https://www.eriksadventures.com/inca-trail-marathon-race-to-machu-picchu-peru/',
  'Maratón oficial por el Camino Inca hasta Machu Picchu. 26.2 millas por senderos ancestrales a más de 4.200 msnm. Incluye programa de aclimatación desde el 20 de agosto.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 19. Gorilla Trail Chiguata
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Gorilla Trail Chiguata',
  '2026-04-12',
  'peru',
  'Chiguata, Arequipa',
  '{"42K","21K","10K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 20. Lachay Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Lachay Trail',
  '2026-03-29',
  'peru',
  'Huaral, Lima',
  '{"21K","10K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 21. Marcona Wind Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Marcona Wind Trail',
  '2026-12-06',
  'peru',
  'San Juan de Marcona, Ica',
  '{"100K","65K","42K","35K","21K","10K"}',
  'trail',
  'https://www.marconawindtrail.com/',
  'Séptima edición en la capital del viento. Una hora al sur de Nasca. Distancias desde 10K hasta 100K con carrera nocturna de 35K.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 22. Desafio Chilina Arequipa
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Desafío Chilina',
  '2026-02-08',
  'peru',
  'Cayma, Arequipa',
  '{"21K","10K","5K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- ============================================================
-- URUGUAY (22 carreras verificadas)
-- ============================================================

-- 1. MVD Beach Run
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Montevideo Beach Run',
  '2026-03-14',
  'uruguay',
  'Montevideo',
  '{"15K","8K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 2. Corré Montevideo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Corré Montevideo',
  '2026-03-29',
  'uruguay',
  'Montevideo',
  '{"21K","10K","5K"}',
  'road',
  'https://prodeporte.com.uy/corremontevideo/',
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 3. Wine Run
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Wine Run',
  '2026-04-03',
  'uruguay',
  'Maldonado',
  '{"21K","10K","5K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 4. Carrera Teletón
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Carrera Teletón',
  '2026-04-12',
  'uruguay',
  'Montevideo',
  '{"10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 5. Media Maraton de Piriapolis
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Piriápolis',
  '2026-04-12',
  'uruguay',
  'Piriápolis, Maldonado',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 6. 30K Montevideo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  '30K Montevideo',
  '2026-04-19',
  'uruguay',
  'Montevideo',
  '{"30K","15K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 7. Desafio Campanero
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Desafío Campanero',
  '2026-04-26',
  'uruguay',
  'Lavalleja',
  '{"27K","18K","9K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 8. 50K San Jose
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  '50K San José',
  '2026-05-01',
  'uruguay',
  'San José',
  '{"50K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 9. Maraton de Montevideo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón de Montevideo',
  '2026-05-10',
  'uruguay',
  'Montevideo',
  '{"42K","21K","10K"}',
  'road',
  'https://montevideo.gub.uy/maraton-montevideo-2026',
  'Certificada por World Athletics. Recorrido por más de 25 barrios icónicos de Montevideo, desde el Palacio Legislativo hasta el Parque Rodó. Combina costanera, sitios históricos y energía urbana.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 10. UTDS (Ultra Trail de la Sierra)
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'UTDS Ultra Trail de la Sierra',
  '2026-05-24',
  'uruguay',
  'Maldonado',
  '{"Ultra"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 11. Cerros de San Juan Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Cerros de San Juan Trail',
  '2026-06-07',
  'uruguay',
  'Colonia',
  '{"21K","10K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 12. Media Maraton de Colonia
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Colonia',
  '2026-06-28',
  'uruguay',
  'Colonia del Sacramento, Colonia',
  '{"21K","10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 13. Half Marathon Montevideo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Half Marathon Montevideo',
  '2026-08-09',
  'uruguay',
  'Montevideo',
  '{"21K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 14. Corre Bosco
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Corre Bosco',
  '2026-08-16',
  'uruguay',
  'Montevideo',
  '{"10K","5K"}',
  'road',
  NULL,
  'Carrera Talleres Don Bosco. Tradicional carrera solidaria en Montevideo.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 15. Maraton de Punta del Este
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Maratón de Punta del Este',
  '2026-09-06',
  'uruguay',
  'Punta del Este, Maldonado',
  '{"42K","21K","10K","5K","2K"}',
  'road',
  'https://maratondepuntadeleste.com.uy/',
  '17.ª edición. La distancia reina en la ciudad más linda. Premios de más de USD 6.000. Kit delivery en Enjoy Punta del Este Casino & Resort.',
  NULL,
  true,
  'confirmed',
  'pulz',
  'approved'
);

-- 16. Villa Serrana Trail
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Villa Serrana Trail',
  '2026-09-13',
  'uruguay',
  'Villa Serrana, Lavalleja',
  '{"21K","10K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 17. Enfoque Bimbo
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Enfoque Bimbo',
  '2026-09-27',
  'uruguay',
  'Montevideo',
  '{"10K","5K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 18. Hombre de Hierro
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Hombre de Hierro',
  '2026-10-25',
  'uruguay',
  'Cerro Largo',
  '{"60K","30K","7K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 19. San Felipe y Santiago
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'San Felipe y Santiago de Montevideo',
  '2026-11-14',
  'uruguay',
  'Montevideo',
  '{"10K","5K"}',
  'road',
  NULL,
  'Carrera conmemorativa de la fundación de Montevideo.',
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 20. Media Maraton Fray Bentos
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Media Maratón de Fray Bentos',
  '2026-11-22',
  'uruguay',
  'Fray Bentos, Río Negro',
  '{"21K","7K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 21. Montevideo 15K
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Montevideo 15K',
  '2026-11-29',
  'uruguay',
  'Montevideo',
  '{"21K","15K"}',
  'road',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- 22. Ultra Maua
INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES (
  'Ultra Maua',
  '2026-12-06',
  'uruguay',
  'Cerro Largo',
  '{"45K","25K","7K"}',
  'trail',
  NULL,
  NULL,
  NULL,
  false,
  'confirmed',
  'pulz',
  'approved'
);

-- ============================================================
-- Resumen:
-- Colombia: 40 carreras (goal: 35+) ✓
-- Peru: 22 carreras (goal: 20+) ✓
-- Uruguay: 22 carreras (goal: 15+) ✓
-- Total: 84 carreras nuevas verificadas
-- ============================================================
