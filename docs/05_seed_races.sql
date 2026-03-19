-- ============================================================
-- PULZ — Seed Races (auto-generated, safe to re-run)
-- Generated: 2026-03-19
-- Run in Supabase SQL Editor
-- Skips races that already exist (same name + date + country)
-- ============================================================

-- Ensure countries exist first
INSERT INTO countries (id, code, name, name_en, name_pt, sort_order) VALUES
  ('argentina', 'AR', 'Argentina', 'Argentina', 'Argentina', 1),
  ('chile', 'CL', 'Chile', 'Chile', 'Chile', 2),
  ('brasil', 'BR', 'Brasil', 'Brazil', 'Brasil', 3),
  ('uruguay', 'UY', 'Uruguay', 'Uruguay', 'Uruguai', 4),
  ('colombia', 'CO', 'Colombia', 'Colombia', 'Colômbia', 5),
  ('peru', 'PE', 'Perú', 'Peru', 'Peru', 6)
ON CONFLICT (id) DO NOTHING;

-- Add unique constraint to prevent duplicates (safe if already exists)
ALTER TABLE races ADD CONSTRAINT races_name_date_country_unique UNIQUE (name, date, country_id);

-- ============================================================
-- RACES (uses ON CONFLICT to skip existing)
-- ============================================================

-- ARGENTINA (58 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Lolog E-Ko Trail', '2026-01-11', 'argentina', 'San Martín de los Andes, Neuquén', ARRAY['Trail']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('La Misión', '2026-02-19', 'argentina', 'Villa La Angostura, Neuquén', ARRAY['200K','160K','120K','80K','60K','40K']::text[], 'trail', NULL, 'Carrera de trekking y autosuficiencia en montaña con 20 ediciones. Recorrido por bosques y montañas de la Patagonia.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Aconcagua Ultra Trail', '2026-02-21', 'argentina', 'Los Penitentes, Mendoza', ARRAY['70K','50K','42K','25K','15K','6K']::text[], 'trail', 'https://aconcaguaultratrail.com/', 'Una de las carreras más altas del continente, partiendo a más de 2500 msnm con máxima de 4000 m en el Parque Provincial Aconcagua.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('El Paso Austral', '2026-02-27', 'argentina', 'Bariloche, Río Negro', ARRAY['Trail']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('La Villa Trail Race', '2026-02-28', 'argentina', 'Villa General Belgrano, Córdoba', ARRAY['24K','12K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Circuito Estaciones (Otoño)', '2026-03-01', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','5K']::text[], 'road', 'https://www.clubdecorredores.com/', 'El principal circuito de running en América Latina, con 4 etapas anuales representando cada estación del año.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mar del Plata Trail Run', '2026-03-01', 'argentina', 'Mar del Plata, Buenos Aires', ARRAY['Trail']::text[], 'trail', 'https://mardelplatatrailrun.com.ar/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Alpina', '2026-03-06', 'argentina', 'Villa Alpina, Córdoba', ARRAY['Trail']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Women Night Run', '2026-03-07', 'argentina', 'Vicente López, Buenos Aires', ARRAY['8K','3K']::text[], 'road', 'https://wnr.com.ar/2026/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Arrayanes', '2026-03-07', 'argentina', 'Villa La Angostura, Neuquén', ARRAY['22K','12K']::text[], 'trail', NULL, 'Carrera por senderos de la Península de Quetrihué, cruzando el mítico Bosque de Arrayanes en el Parque Nacional Los Arrayanes.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera de la Mujer', '2026-03-08', 'argentina', 'Necochea, Buenos Aires', ARRAY['12K','6K','3K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Bariloche 100 Ultra Trail', '2026-03-13', 'argentina', 'Bariloche, Río Negro', ARRAY['100K','Ultra']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Sunset Run', '2026-03-14', 'argentina', 'Vicente López, Buenos Aires', ARRAY['8K','3K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K de Carlos Paz', '2026-03-15', 'argentina', 'Villa Carlos Paz, Córdoba', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 10K Buenos Aires', '2026-03-15', 'argentina', 'Palermo, Buenos Aires', ARRAY['10K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'El primer 10K del calendario NB Race Series 2026.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ushuaia by UTMB', '2026-03-18', 'argentina', 'Ushuaia, Tierra del Fuego', ARRAY['130K','85K','50K','32K','24K','13K']::text[], 'trail', 'https://ushuaia.utmb.world/', 'Tercera edición de la serie UTMB en el fin del mundo. Recorrido por bosques, montañas y costas del extremo sur de la Patagonia argentina.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('La Carrera de Miguel', '2026-03-22', 'argentina', 'Buenos Aires, CABA', ARRAY['8K','3K']::text[], 'road', NULL, 'Homenaje al atleta y poeta Miguel Sánchez, desaparecido durante la última dictadura. Institucionalizada por ley de la Legislatura porteña.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K de Mendoza', '2026-03-22', 'argentina', 'Parque Central, Mendoza', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Tafí Trail', '2026-03-22', 'argentina', 'El Mollar, Tafí del Valle, Tucumán', ARRAY['Trail']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 21K Salta', '2026-03-29', 'argentina', 'Salta', ARRAY['21K','10K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'Evento del circuito NB Race Series en el norte argentino con clima ideal para correr.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Festival Farmacity', '2026-03-29', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','3K','1K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Patagonia Run', '2026-04-08', 'argentina', 'San Martín de los Andes, Neuquén', ARRAY['100Mi','110K','70K','42K','21K','10K']::text[], 'trail', 'https://patagoniarun.com', 'El festival de trail y ultra trail running más grande de América. Recorrido por bosques patagónicos, lagos cristalinos y senderos de montaña con vistas al volcán Lanín.', 'USD 120 – 280', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('10K Adidas Supernova', '2026-04-12', 'argentina', 'Vicente López, Buenos Aires', ARRAY['10K']::text[], 'road', 'https://supernova10k.com.ar/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('15K Puerto Norte', '2026-04-12', 'argentina', 'Rosario, Santa Fe', ARRAY['15K','10K','4K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Extremo 42K La Sala', '2026-04-18', 'argentina', 'Yerba Buena, Tucumán', ARRAY['42K','30K','21K','10K']::text[], 'trail', 'https://extremotucuman.com.ar/', 'Carrera de trail en las sierras tucumanas que busca posicionar a Tucumán como referente nacional del trail running.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Mar del Plata', '2026-04-19', 'argentina', 'Mar del Plata, Buenos Aires', ARRAY['42K','21K','10K']::text[], 'road', 'https://www.newbalance.com.ar/42k-mar-del-plata-2026/race-series-mdp-42k.html', 'Una de las maratones más emblemáticas del país. Circuito costero que conecta con el mar.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('FILA Race', '2026-04-19', 'argentina', 'Palermo, Buenos Aires', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de la Defensoría', '2026-04-19', 'argentina', 'La Plata, Buenos Aires', ARRAY['10K','3K','1K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('A Pampa Traviesa', '2026-04-19', 'argentina', 'Santa Rosa, La Pampa', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.santarosa.gob.ar/a-pampa-traviesa-2026/', 'Clásico argentino del atletismo de fondo con proyección internacional, organizado por la Municipalidad de Santa Rosa. 41ª edición.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratana', '2026-04-26', 'argentina', 'Puerto Madero, Buenos Aires', ARRAY['15K','10K','3K']::text[], 'road', NULL, 'Evento que celebra los orígenes italianos en la población argentina, con largada en Costanera Sur.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Formosa', '2026-04-26', 'argentina', 'Formosa', ARRAY['42K','21K','10K']::text[], 'road', 'https://maratonformosa.tierrarojasoft.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón Puerto Madryn', '2026-04-26', 'argentina', 'Puerto Madryn, Chubut', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Champa Ultra Race', '2026-05-01', 'argentina', 'San Javier, Córdoba', ARRAY['60K','42K','30K','24K','16K','10K']::text[], 'trail', 'https://champaultrarace.com.ar/', '11ª edición en el corazón del Cerro Champaquí. Circuitos 100% trail con cumbres, filos, senderos y bosques. Otorga puntos ITRA y UTMB Index.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Mendoza', '2026-05-03', 'argentina', 'Mendoza', ARRAY['42K','21K','10K','4K']::text[], 'road', 'https://maratondemendoza.com/', 'Maratón internacional por paisajes de montaña y atracciones turísticas de Mendoza.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Valhöll Ultra Trail', '2026-05-08', 'argentina', 'Villa General Belgrano, Córdoba', ARRAY['50K','35K','21K','12K']::text[], 'trail', 'https://tyr.com.ar/valholl2026', '7ª edición. Recorrido técnico y desafiante por las sierras del Valle de Calamuchita con filos, senderos, bosques, ríos y cumbres.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K de Rosario', '2026-05-10', 'argentina', 'Rosario, Santa Fe', ARRAY['21K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 25K Buenos Aires', '2026-05-17', 'argentina', 'Buenos Aires, CABA', ARRAY['25K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'La distancia de ruta oficial que faltaba en el país. Parte del NB Race Series.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Fiambalá Desert Trail', '2026-05-20', 'argentina', 'Fiambalá, Catamarca', ARRAY['110K etapas','50K','35K','25K','15K']::text[], 'trail', NULL, 'La mayor carrera en geografía de desierto y montaña de Sudamérica. 11ª edición entre las dunas más altas del mundo al pie de la Cordillera.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Patria', '2026-05-24', 'argentina', 'Santiago del Estero', ARRAY['42K','21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Fiestas Mayas / Carrera Maya', '2026-05-25', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','3K']::text[], 'road', 'https://fiestasmayas.com.ar/', '50ª edición del evento atlético más tradicional de Argentina. Organizado por Club de Corredores.', 'ARS 45.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('15K Adidas Adizero', '2026-06-07', 'argentina', 'Buenos Aires, CABA', ARRAY['15K']::text[], 'road', 'https://adizero15k.com.ar/', 'Carrera de adidas en el Autódromo de Buenos Aires, circuito controlado ideal para la velocidad.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 21K La Plata', '2026-06-14', 'argentina', 'La Plata, Buenos Aires', ARRAY['21K','10K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'Debut de New Balance en La Plata combinando deporte y cultura por las calles de la ciudad.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Circuito Estaciones (Invierno)', '2026-06-28', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','5K']::text[], 'road', 'https://www.clubdecorredores.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Int. de la Bandera', '2026-06-28', 'argentina', 'Rosario, Santa Fe', ARRAY['42K','10K']::text[], 'road', 'https://42krosario.com.ar/2026/', 'Maratón internacional que recorre los rincones más icónicos de Rosario. Sede del 47° Campeonato Nacional de Maratón.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 42K Córdoba', '2026-07-05', 'argentina', 'Córdoba', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'Evento multidistancia del NB Race Series por calles históricas y paisajes de Córdoba.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('NB 30K Buenos Aires', '2026-07-19', 'argentina', 'Buenos Aires, CABA', ARRAY['30K','10K']::text[], 'road', 'https://raceseries.newbalance.com.ar/', 'La antesala perfecta para preparar la maratón. Circuito plano y rápido.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Int. de San Juan', '2026-07-26', 'argentina', 'San Juan', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratondesanjuan.com/', '10ª edición. Recorrido desde el Dique Punta Negra por los paisajes más emblemáticos de San Juan hasta el Teatro del Bicentenario.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K de Buenos Aires', '2026-08-23', 'argentina', 'Buenos Aires, CABA', ARRAY['21K']::text[], 'road', 'https://www.maratondebuenosaires.com/medio-maraton-de-buenos-aires-21k.html', 'La media maratón más rápida de América y #1 de Latinoamérica, con más de 22.000 participantes. Pasa por el Planetario, Rosedal, Teatro Colón, Obelisco y Casa Rosada.', 'ARS 100.000 / USD 100', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Circuito Estaciones (Primavera)', '2026-09-06', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','5K']::text[], 'road', 'https://www.clubdecorredores.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Buenos Aires', '2026-09-20', 'argentina', 'Buenos Aires, CABA', ARRAY['42K']::text[], 'road', 'https://www.maratondebuenosaires.com/', 'La maratón más grande de Latinoamérica. Recorre los barrios más emblemáticos de la ciudad con más de 15.000 corredores de todo el mundo. Largada en Figueroa Alcorta y Dorrego.', 'ARS 120.000 / USD 120', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('UTACCH Ultra Trail', '2026-10-03', 'argentina', 'San Javier y Yacanto, Córdoba', ARRAY['100Mi','100K','75K','55K','38K','26K','15K']::text[], 'trail', 'https://www.utacchultratrail.com/', 'La carrera de trail más desafiante de Argentina. 100 millas non-stop cruzando las Sierras Grandes de los Comechingones con el Cerro Champaquí como hito. Clasificatoria para Western States 100.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K La Gaceta Tucumán', '2026-10-18', 'argentina', 'San Miguel de Tucumán', ARRAY['21K','10K','3K']::text[], 'road', 'https://21k.lagaceta.com.ar/', 'Importante media maratón del NOA organizada por el diario La Gaceta.', NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('McDonald''s Run', '2026-10-25', 'argentina', 'Vicente López, Buenos Aires', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS K42 Villa La Angostura', '2026-11-06', 'argentina', 'Villa La Angostura, Neuquén', ARRAY['42K','21K','10K','GrandK']::text[], 'trail', 'https://argentina.kseries.com.ar/', 'Adventure marathon por senderos de montaña y bosques patagónicos en Villa La Angostura. Final del circuito K Series.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('BRUT Bariloche', '2026-11-28', 'argentina', 'Bariloche, Río Negro', ARRAY['60K','42K','32K','22K','10K']::text[], 'trail', 'https://brut.run/', 'Bariloche Running Ultra Trail. Evento de trail running con múltiples distancias por los senderos de montaña de San Carlos de Bariloche.', NULL, TRUE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('El Cruce Saucony', '2026-12-05', 'argentina', 'Bariloche, Río Negro', ARRAY['100K en 3 etapas']::text[], 'trail', 'https://elcruce.com.ar/', '24ª edición. La carrera de trail por etapas más grande de América. 100 km en 3 días cruzando los Andes con campamentos junto a lagos.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Circuito Estaciones (Verano)', '2026-12-20', 'argentina', 'Buenos Aires, CABA', ARRAY['10K','5K']::text[], 'road', 'https://www.clubdecorredores.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('San Silvestre Buenos Aires', '2026-12-31', 'argentina', 'Buenos Aires, CABA', ARRAY['8K']::text[], 'road', 'https://sansilvestrebuenosaires.com/', 'La carrera que despide el año. 8K por el centro porteño pasando por la Casa Rosada, el Cabildo y sitios icónicos, en un ambiente festivo.', NULL, TRUE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- CHILE (71 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Temuco', '2026-03-14', 'chile', 'Temuco, Araucanía', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.passline.com/eventos/maraton-de-temuco-2026-448984', 'Sede del Campeonato Sudamericano de Ruta 2026. Única maratón de Chile con 4 distancias certificadas por World Athletics. Más de 7.000 corredores en el Estadio Germán Becker.', 'CLP 25.000 – 45.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Tipaume Trail Race', '2026-03-14', 'chile', 'Pichilemu, O''Higgins', ARRAY['18K','7K','2K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO 10K (Fecha 1)', '2026-03-15', 'chile', 'Santiago, Metropolitana', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corrida de Peñalolén', '2026-03-15', 'chile', 'Peñalolén, Santiago', ARRAY['15K','10K','6K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón del Valle Antuco', '2026-03-20', 'chile', 'Antuco, Biobío', ARRAY['42K','21K','10K','5K','2K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('La Gran Travesía', '2026-03-21', 'chile', 'Santiago, Metropolitana', ARRAY['100K','50K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Sunset Trail Curacaví', '2026-03-21', 'chile', 'Curacaví, Metropolitana', ARRAY['12K','8K','6K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Laguna Trail', '2026-03-21', 'chile', 'San Fernando, O''Higgins', ARRAY['15K','10K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Aguas Andinas Trail Run', '2026-03-21', 'chile', 'Santiago, Metropolitana', ARRAY['9K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Women''s Night Out', '2026-03-21', 'chile', 'Santiago, Metropolitana', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO21K by ASICS (Fecha 1)', '2026-03-29', 'chile', 'Santiago, Metropolitana', ARRAY['21K','10.5K','5K']::text[], 'road', 'https://santiago21k.cl/', 'La media maratón más rápida de Chile. Circuito urbano premium organizado por SportHub con recorrido por Las Condes y Vitacura. Dos fechas al año.', 'CLP 31.000 – 40.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Medio Maratón de Viña', '2026-03-29', 'chile', 'Viña del Mar, Valparaíso', ARRAY['21K','5K','1.6K']::text[], 'road', 'https://mediomaratonvina.cl/', 'Sede del Campeonato Sudamericano de Ruta 2026. Circuito costero certificado, conocido como la ruta más rápida de Chile. Organizado por Prokart Producciones.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Run Frutillar', '2026-03-29', 'chile', 'Frutillar, Los Lagos', ARRAY['21K','10.5K','5K','2K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Pampa Perdiz Trail', '2026-04-04', 'chile', 'Alto Hospicio, Tarapacá', ARRAY['30K','22K','13K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Bosque Vivo Trail Run', '2026-04-04', 'chile', 'Araucanía', ARRAY['14K','7K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Trail Malalcahuello by Corralco', '2026-04-10', 'chile', 'Malalcahuello, Araucanía', ARRAY['30K','15K','7K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corrida Día del Deporte', '2026-04-11', 'chile', 'Todo Chile (16 regiones)', ARRAY['5K','3K']::text[], 'road', 'https://www.diadeldeporte.cl/', 'La corrida más grande de Chile, organizada por el Ministerio del Deporte e IND. Se corre simultáneamente en todas las capitales regionales del país. Gratuita y para toda la familia.', 'Gratis', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Doñihue Trail Race', '2026-04-11', 'chile', 'Doñihue, O''Higgins', ARRAY['14K','2K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Epic Trail Nocturno', '2026-04-11', 'chile', 'Concepción, Biobío', ARRAY['21K','12K','7K','3.5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('New Balance 15K Santiago', '2026-04-12', 'chile', 'Santiago, Metropolitana', ARRAY['15K','10K']::text[], 'road', 'https://runchile.cl/new-balance-15k-santiago-confirma-fecha-para-2026/', 'Carrera urbana New Balance con recorrido por Ñuñoa. Ambiente festivo con música y activaciones de marca.', 'CLP 28.000 – 32.000', FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Trail La Fragua (Fecha 1)', '2026-04-12', 'chile', 'Santiago, Metropolitana', ARRAY['20K','10K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón del Maule', '2026-04-12', 'chile', 'Curicó, Maule', ARRAY['90K','42K','21K','10K']::text[], 'road', 'https://maratondelmaule.cl/', 'Maratón con debut de distancia ultra de 90K por la precordillera maulina. Organizada por la Corporación de Deportes de Curicó con recorridos que combinan asfalto y senderos.', 'CLP 37.100 – 106.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Antuco Trail Ruta del Cóndor', '2026-04-18', 'chile', 'Antuco, Biobío', ARRAY['46K','36K','21K','10K','2K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('10K Valparaíso Curauma', '2026-04-19', 'chile', 'Valparaíso', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Monardez Trail Experience', '2026-04-19', 'chile', 'Coquimbo', ARRAY['21K','10K','3K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Fiord', '2026-04-25', 'chile', 'Torres del Paine, Magallanes', ARRAY['136K','115K','95K','80K','60K','50K','42K','21K']::text[], 'trail', 'https://www.ultrafiord.com/en/', 'Ultra trail internacional en el extremo sur de la Patagonia chilena. Cruces de montaña, glaciares, bosques prístinos y vistas a fiordos en Torres del Paine. Corredores de más de 30 países.', 'USD 150 – 350', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Santiago', '2026-04-26', 'chile', 'Santiago, Metropolitana', ARRAY['42K','21K','10K']::text[], 'road', 'https://maratondesantiago.cl/', 'El evento deportivo más masivo de Chile. Miles de corredores recorren las principales avenidas de Santiago con la Cordillera de los Andes como telón de fondo. Certificada por World Athletics y AIMS.', 'CLP 30.000 – 53.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Trail del Cañi', '2026-05-01', 'chile', 'Pucón, Araucanía', ARRAY['30K','15K','6K','KMV']::text[], 'trail', NULL, 'Trail por el Santuario El Cañi, reserva de bosques milenarios de araucarias y coigües cerca de Pucón.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Quillayquén', '2026-05-02', 'chile', 'Coltauco, O''Higgins', ARRAY['21K','11K','6K','2K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Patagonia Camp Cup', '2026-05-02', 'chile', 'Torres del Paine, Magallanes', ARRAY['42K','21K','15K','5K']::text[], 'trail', 'https://www.patagoniacamp.com/camp-cup-26', '9ª edición en territorio privado de 34.000 hectáreas junto al Parque Nacional Torres del Paine. Bosques de lengas y coigües otoñales con el macizo Paine de fondo. Incluye asado patagónico y música en vivo.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Trail Parque Fray Jorge', '2026-05-09', 'chile', 'Ovalle, Coquimbo', ARRAY['35K','21K','10K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Tricahue Trail Experience', '2026-05-09', 'chile', 'Maule', ARRAY['21K','12K','6K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Wings for Life World Run', '2026-05-10', 'chile', 'Santiago, Metropolitana', ARRAY['Run']::text[], 'road', 'https://www.wingsforlifeworldrun.com/en/locations/santiago', 'Carrera solidaria global de Red Bull a beneficio de la investigación de lesiones de médula espinal. Formato único: todos arrancan a la misma hora mundial y el Catcher Car te persigue hasta atraparte.', 'CLP 20.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Biosfera Trail Run Olmué', '2026-05-16', 'chile', 'Olmué, Valparaíso', ARRAY['23K','16K','9K','4K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío PARQUEMET Caja Los Andes', '2026-05-17', 'chile', 'Santiago, Metropolitana', ARRAY['23K','10K','5K']::text[], 'trail', 'https://huellasports.cl/trail_parquemet/', 'Trail running por el Cerro San Cristóbal (Parque Metropolitano). Punto más alto en el Cerro El Carbón con vistas panorámicas. Máximo 1.000 participantes.', 'CLP 12.000 – 30.000', FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('One Run Chile Papudo', '2026-05-23', 'chile', 'Papudo, Valparaíso', ARRAY['21K','10K','5K','1K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Lo Orozco', '2026-05-24', 'chile', 'O''Higgins', ARRAY['15K','7K','4K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K Valle del Elqui', '2026-05-31', 'chile', 'Vicuña, Coquimbo', ARRAY['21K','10K','3K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO 10K (Fecha 2)', '2026-05-31', 'chile', 'Santiago, Metropolitana', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Torrencial Chile by UTMB', '2026-05-29', 'chile', 'Valdivia, Los Ríos', ARRAY['98K','53K','37K','27K','12K','6K']::text[], 'trail', 'https://torrencial.utmb.world/', 'Parte de la UTMB World Series. La única carrera de invierno de Chile, atravesando el bosque valdiviano bajo lluvia, viento y frío. Top 3 clasifica a CCC y OCC en UTMB Mont-Blanc. 10 años de historia.', 'CLP 30.000 – 120.000', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Monte Verde', '2026-06-06', 'chile', 'Curacautín, Araucanía', ARRAY['42K','28K','18K','12K','5K']::text[], 'trail', 'https://welcu.com/los-volcanes/maraton-monte-verde-2026', '5ª edición. Festival de trail running en el sector San Nicolás con senderos rodeados de bosques y barro. Cierre de la Araucanía Trail Series.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Volcano Marathon', '2026-06-26', 'chile', 'Hanga Roa, Rapa Nui (Isla de Pascua)', ARRAY['42K','21K','10K']::text[], 'road', 'https://www.volcanomarathon.com/', 'Maratón en Isla de Pascua. Partida en Playa Anakena con terreno volcánico y vistas al cráter Rano Kau. Programa de 5 días con inmersión en cultura Rapa Nui y estatuas Moai.', 'USD 3.300+', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón del Desierto', '2026-06-27', 'chile', 'Huara, Tarapacá', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://avatasport.evently.cl/MARATON-DEL-DESIERTO-MAS-ARIDO-DEL-MUNDO-27-06-2026', 'Épica carrera por la Ruta A-412, cruzando 5 oficinas salitreras abandonadas de 1960. Se promociona como la maratón en el desierto más árido del mundo.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corrida Santa María del Mar', '2026-06-27', 'chile', 'Valparaíso', ARRAY['12K','6K','1K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Trail Pichidangui', '2026-07-05', 'chile', 'Pichidangui, Coquimbo', ARRAY['25K','13K','5.5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO 10K (Fecha 3)', '2026-07-12', 'chile', 'Santiago, Metropolitana', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Invernal Chome', '2026-07-18', 'chile', 'Chome, Biobío', ARRAY['42K','21K','11K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Putaendo Trail Run', '2026-08-01', 'chile', 'Putaendo, Valparaíso', ARRAY['50K','35K','21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Golden Run Santiago', '2026-08-02', 'chile', 'Ñuñoa, Santiago', ARRAY['21K','10K']::text[], 'road', 'https://asicsgolden.run/', 'Carrera urbana ASICS con circuito diseñado para el rendimiento en Campos de Deportes, Ñuñoa. Evento premium con kit de primer nivel.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Los Ñadis Trail Running', '2026-08-01', 'chile', 'Valdivia, Los Ríos', ARRAY['21K','15K','10K','5K','3K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón La Serena', '2026-08-16', 'chile', 'La Serena, Coquimbo', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.maratonlaserena.cl/', '1ª edición del Maratón 42K de La Serena. Recorrido con epicentro en el Faro Monumental y la Av. del Mar. Apunta a reunir 6.000 corredores. Premios por más de CLP 5 millones.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Nahuelbuta All In CMPC', '2026-08-29', 'chile', 'Angol, Araucanía', ARRAY['42K','21K','12K','6K','2K']::text[], 'trail', 'https://www.cmpc.com/en/a-successful-close-to-the-third-annual-nahuelbuta-all-in/', 'Campeonato Nacional de Trail Running organizado por CMPC y FEDACHI en el Parque Junquillar de Angol. Selectivo para competencias internacionales.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Concón', '2026-08-30', 'chile', 'Concón, Valparaíso', ARRAY['21K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Medio Maratón de Santiago (Mujeres)', '2026-08-30', 'chile', 'Santiago, Metropolitana', ARRAY['21K','7K']::text[], 'road', 'https://mediomaratonsantiago.cl/', 'Media maratón exclusiva para mujeres en Santiago. Patrocinada por Itaú, celebra el running femenino en la capital.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO21K by ASICS (Fecha 2)', '2026-11-30', 'chile', 'Santiago, Metropolitana', ARRAY['21K','10.5K','5K']::text[], 'road', 'https://santiago21k.cl/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Junquillar Ultra Extremo', '2026-09-05', 'chile', 'Arauco, Biobío', ARRAY['50K','30K','21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Patagonian Int. Marathon', '2026-09-05', 'chile', 'Torres del Paine, Magallanes', ARRAY['42K','30K','21K','15K','10K']::text[], 'trail', 'https://www.patagonianinternationalmarathon.com/en/', 'Desde 2012, la primera maratón en Torres del Paine. Ruta por caminos de ripio del Parque Nacional con vistas a Paine Grande y Cuernos del Paine. Base en Puerto Natales. Corredores de 50+ países.', 'USD 120 – 200', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón TPS Valparaíso', '2026-09-06', 'chile', 'Valparaíso', ARRAY['21K','10K','2K']::text[], 'road', 'https://www.mediamaratontps.cl/', '14ª edición. Recorrido único por el interior del Terminal Pacífico Sur y las zonas más emblemáticas del puerto. En vez de medallas, invierten en proyectos para la comunidad de Valparaíso.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Pachamanka', '2026-09-12', 'chile', 'O''Higgins', ARRAY['80K','50K','25K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Paine', '2026-09-26', 'chile', 'Torres del Paine, Magallanes', ARRAY['50K','35K','21K','14K','5K']::text[], 'trail', 'https://www.ultrapaine.com/', '12ª edición del primer evento de trail running en Torres del Paine y la Patagonia Austral (desde 2014). Paisajes panorámicos hacia las torres principales del macizo. Meta en Villa Río Serrano. Corredores de 50 países.', 'USD 80 – 180', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Cascada Trail', '2026-10-03', 'chile', 'Santiago, Metropolitana', ARRAY['30K','21K','12K','6K','3K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Viña del Mar', '2026-10-04', 'chile', 'Reñaca, Viña del Mar, Valparaíso', ARRAY['42K','21K','10K']::text[], 'road', 'https://maratonvina.cl/', 'Maratón costera con partida en Reñaca. Una de las maratones más icónicas de Chile con recorrido panorámico por el litoral de Viña del Mar.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corriendo entre Montañas', '2026-10-04', 'chile', 'Biobío', ARRAY['21K','10K','6K','3K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Festival Vista Baker', '2026-10-17', 'chile', 'Cochrane, Aysén', ARRAY['32K','21K','14K','7K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('STGO 10K (Fecha 4)', '2026-10-18', 'chile', 'Santiago, Metropolitana', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('GTVUT Las Trancas', '2026-11-14', 'chile', 'Las Trancas, Ñuble', ARRAY['50K','30K','18K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Columbia Trail Challenge Huilo Huilo', '2026-11-21', 'chile', 'Huilo Huilo, Los Ríos', ARRAY['60K','45K','20K','10K','6K','2K']::text[], 'trail', 'https://www.nimbusoutdoor.com/columbia-trail-challenge/', 'Trail running por la Reserva Biológica Huilo Huilo, reconocida mundialmente por su biodiversidad. Parte del circuito Columbia Trail Challenge de Nimbus Outdoor.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Pucón', '2026-11-22', 'chile', 'Pucón, Araucanía', ARRAY['42K','21K','10K']::text[], 'road', 'https://triatletas.cl/runman-marathon-pucon-2026/', 'Runman Marathon Pucón, maratón en el corazón de la zona lacustre de La Araucanía. Recorrido rodeado de volcanes y lagos con clima primaveral.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Vulcano Ultra Trail', '2026-12-06', 'chile', 'Parque Nacional Vicente Pérez Rosales, Los Lagos', ARRAY['103K','55K','37K','21K','13K','9K']::text[], 'trail', 'https://puelcheproducciones.com/spp/vulcano/', 'El evento de trail running más emblemático de Chile y uno de los más reconocidos de Sudamérica. Recorrido por el Parque Nacional Vicente Pérez Rosales con opciones desde 9K hasta ultra de 103K.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Trueno', '2026-12-06', 'chile', 'Maule', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Mataquito', '2026-12-13', 'chile', 'Licantén, Maule', ARRAY['42K','21K','11K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- BRASIL (50 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('19ª Meia Maratona Int. de São Paulo', '2026-01-25', 'brasil', 'Itaquera, São Paulo, SP', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.yescom.com.br/meiasp/2026/', 'Meia maratona tradicional organizada pela Yescom com largada no Shopping Metrô Itaquera. Uma das maiores do Brasil.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Trail Brasília', '2026-01-25', 'brasil', 'São Sebastião, Brasília, DF', ARRAY['7K','12K','21K','43K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corre Salvador Folia', '2026-02-01', 'brasil', 'Salvador, BA', ARRAY['6K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Trail Mar de Minas', '2026-03-07', 'brasil', 'Prados, MG', ARRAY['10K','21K','35K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Meia Maratona do Recife', '2026-03-08', 'brasil', 'Recife, PE', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.ticketsports.com.br/en/meia-maratona-do-recife-2026-72545', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Santander Meia de Curita', '2026-03-08', 'brasil', 'Curitiba, PR', ARRAY['21K','10K','5K']::text[], 'road', 'https://globalvita.com.br/meiadecurita/', 'Principal meia maratona de Curitiba com largada no Centro Cívico. Percurso desafiador com subidas e descidas por parques e ruas históricas.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Meio do Mundo', '2026-03-14', 'brasil', 'Macapá, AP', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona de Teresina', '2026-03-14', 'brasil', 'Teresina, PI', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Salvador 10 Milhas', '2026-03-29', 'brasil', 'Salvador, BA', ARRAY['10Mi']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Circuito adidas MDR Curitiba', '2026-03-29', 'brasil', 'Curitiba, PR', ARRAY['12K','10K','6K','5K']::text[], 'road', 'https://www.godream.com.br/evento/circuito-adidas-mdr-curitiba-2026-3806584', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona de Manaus', '2026-04-05', 'brasil', 'Manaus, AM', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('30ª Maratona Int. de São Paulo', '2026-04-12', 'brasil', 'São Paulo, SP', ARRAY['42K','21K','10K','7K']::text[], 'road', 'https://www.yescom.com.br/maratonasp/2026/', 'A maior e mais tradicional maratona do Brasil, na 30ª edição. Largada no Obelisco do Ibirapuera com percurso pelos principais pontos da cidade. Selo Gold da CBAt.', 'R$ 250 – 450', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Int. de Fortaleza', '2026-04-12', 'brasil', 'Fortaleza, CE', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratonadefortaleza.com.br/', 'Primeira maratona oficial de Fortaleza, celebrando os 300 anos da cidade. Percurso à beira-mar com clima tropical.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona de Cascavel', '2026-04-12', 'brasil', 'Cascavel, PR', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Praia do Rosa', '2026-04-25', 'brasil', 'Praia do Rosa, SC', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('21K Salvador', '2026-04-26', 'brasil', 'Salvador, BA', ARRAY['21K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('26ª Meia Maratona Int. da Cidade de São Paulo', '2026-04-26', 'brasil', 'São Paulo, SP', ARRAY['21K','15K','5K']::text[], 'road', 'https://www.meiamaratonasaopaulo.com.br/', 'Percurso inédito saindo do Obelisco do Ibirapuera em direção ao centro histórico. Uma das meias mais tradicionais do país.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Meia Maratona Int. de Florianópolis Oakberry', '2026-05-03', 'brasil', 'Florianópolis, SC', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.ticketsports.com.br/en/meia-maratona-internacional-de-florianopolis-oakberry-2026-73962', 'Largada na Beira Mar Norte com percurso à beira do mar. Uma das meias mais bonitas do Sul do Brasil.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafio das Torres Brasília', '2026-05-03', 'brasil', 'Brasília, DF', ARRAY['21K']::text[], 'road', 'https://desafiodastorres.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('1ª Maratona Oficial de Belo Horizonte', '2026-05-17', 'brasil', 'Belo Horizonte, MG', ARRAY['42K','5K']::text[], 'road', 'https://www.ticketsports.com.br/e/maratona-oficial-de-belo-horizonte-2026-74110', 'Primeira maratona oficial de BH. Percurso de 42 km cruzando seis regionais da capital mineira, passando por ruas históricas e construções emblemáticas. Vila da Maratona no Parque Municipal.', 'R$ 200 – 400', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Golden Run São Paulo', '2026-05-17', 'brasil', 'Parque do Povo, São Paulo, SP', ARRAY['21K','10K']::text[], 'road', 'https://asicsgoldenrun.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corridas de Montanha Chapada dos Veadeiros', '2026-05-17', 'brasil', 'Cavalcante, GO', ARRAY['21K','14K','7K']::text[], 'trail', 'https://minhasinscricoes.com.br/Evento/CORRIDASDEMONTANHA-CHAPADADOSVEADEIROS2026', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Farol a Farol', '2026-05-24', 'brasil', 'Salvador, BA', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, 'A corrida de rua mais tradicional da Bahia. Percurso conectando os faróis da Barra e de Itapuã pela orla de Salvador.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('41ª Maratona Int. de Porto Alegre', '2026-05-31', 'brasil', 'Porto Alegre, RS', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratonadeportoalegre.com.br/', 'A maratona mais antiga do Brasil na 41ª edição. Percurso plano pela orla do Guaíba com mais de R$ 530 mil em premiação. Uma das provas mais rápidas do país.', 'R$ 180 – 350', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corrida das Pontes do Recife', '2026-05-31', 'brasil', 'Recife, PE', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.corridadaspontesdorecife.com.br/', 'Corrida icônica passando pelas pontes históricas do Recife. 21ª edição da prova mais emblemática de Pernambuco.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona do Rio de Janeiro', '2026-06-04', 'brasil', 'Rio de Janeiro, RJ', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratonadorio.com.br/', 'A maratona mais famosa do Brasil, no feriado de Corpus Christi. Quatro dias de corrida com provas de 5K a 42K. Percurso pela orla carioca com vista para o Pão de Açúcar e Cristo Redentor. Selo World Athletics.', 'R$ 300 – 600', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Run Challenge Belo Horizonte', '2026-06-14', 'brasil', 'Belo Horizonte, MG', ARRAY['15K','7K','4K']::text[], 'road', 'https://runchallenge.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Desafio Pedra Branca', '2026-06-14', 'brasil', 'São José, SC', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Golden Run Rio de Janeiro', '2026-07-12', 'brasil', 'Rio de Janeiro, RJ', ARRAY['21K','10K']::text[], 'road', 'https://asicsgoldenrun.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Costão do Santinho', '2026-07-25', 'brasil', 'Florianópolis, SC', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Nike SP City Marathon', '2026-07-26', 'brasil', 'São Paulo, SP', ARRAY['42K','21K']::text[], 'road', 'https://iguanasports.com.br/products/sp-city-marathon-2026', 'Maratona patrocinada pela Nike celebrando 10 anos. Percurso técnico passando por 18 bairros de São Paulo. Selo Gold CBAt e homologação World Athletics. Expo no Pavilhão da Bienal, Ibirapuera.', 'R$ 280 – 500', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Run Challenge Brasília', '2026-07-27', 'brasil', 'Brasília, DF', ARRAY['15K','7K','4K']::text[], 'road', 'https://runchallenge.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('LIVE!42K Brasília', '2026-08-02', 'brasil', 'Brasília, DF', ARRAY['42K','21K']::text[], 'road', 'https://www.liverun.com.br/etapa/live42k-brasilia', 'Maratona com largada na Esplanada dos Ministérios ao amanhecer. Percurso monumental passando pelos principais cartões-postais da capital federal.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Run Challenge Fortaleza', '2026-08-02', 'brasil', 'Fortaleza, CE', ARRAY['15K','7K','4K']::text[], 'road', 'https://runchallenge.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Selva Amazônica', '2026-08-08', 'brasil', 'Amapá, AP', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('28ª Meia Maratona Int. do Rio', '2026-08-16', 'brasil', 'Rio de Janeiro, RJ', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.yescom.com.br/meiadorio/2026/', 'Uma das meias mais tradicionais do Brasil, organizada pela Yescom. Percurso pela orla carioca com entrega de kits na Marina da Glória.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona FILA', '2026-08-23', 'brasil', 'Cidade Universitária USP, São Paulo, SP', ARRAY['42K','21K']::text[], 'road', 'https://www.fila.com.br/maratona', 'Maratona na Cidade Universitária da USP. Formato individual (42K) ou em equipes (duplas de 21K ou quartetos de 10,5K).', 'R$ 234', FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Campos do Jordão', '2026-08-23', 'brasil', 'Campos do Jordão, SP', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Int. de Floripa Fibra', '2026-08-30', 'brasil', 'Florianópolis, SC', ARRAY['42K','21K','5K']::text[], 'road', 'https://www.ticketsports.com.br/e/maratona-internacional-de-floripa-fibra-2026-72611', 'Uma das maratonas mais rápidas do Brasil com percurso 80% plano ao nível do mar. Infraestrutura de alto nível em Florianópolis.', 'R$ 250 – 450', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Fernando de Noronha', '2026-09-05', 'brasil', 'Fernando de Noronha, PE', ARRAY['21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', 'Trail run no paraíso brasileiro de Fernando de Noronha. Percurso por trilhas com vistas deslumbrantes do arquipélago.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Run Challenge Salvador', '2026-09-13', 'brasil', 'Salvador, BA', ARRAY['15K','7K','4K']::text[], 'road', 'https://runchallenge.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona de Niterói', '2026-09-14', 'brasil', 'Niterói, RJ', ARRAY['42K','15K','6K']::text[], 'road', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Paraty Brazil by UTMB', '2026-09-19', 'brasil', 'Paraty, RJ', ARRAY['108K','58K','34K','25K','7K']::text[], 'trail', 'https://paraty.utmb.world/', 'Etapa brasileira do circuito UTMB World Series. Ultra trail pela Serra da Bocaina com percursos de 7K a 108K entre mata atlântica, praias e montanhas de Paraty.', 'R$ 200 – 900', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('ASICS Run Challenge Recife', '2026-09-20', 'brasil', 'Recife, PE', ARRAY['15K','7K','4K']::text[], 'road', 'https://runchallenge.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Salvador', '2026-09-27', 'brasil', 'Salvador, BA', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.ticketsports.com.br/e/maratona-salvador-2026-74554', 'Principal corrida de rua da Bahia com selo World Athletics. Dois dias de evento pela orla e centro histórico de Salvador.', 'R$ 180 – 350', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Mountain Do Chapada dos Veadeiros', '2026-10-31', 'brasil', 'Alto Paraíso de Goiás, GO', ARRAY['42K','21K','10K','5K']::text[], 'trail', 'https://mountaindo.com.br/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Trail Chapada Diamantina', '2026-11-21', 'brasil', 'Mucugê, BA', ARRAY['82K','65K','45K','22K','15K','7K']::text[], 'trail', 'https://www.ticketsports.com.br/en/ultra-trail-chapada-diamantina-2026-74480', 'A primeira ultramaratona de montanha da Bahia. Percurso desafiador com singletracks, travessias de rios, cachoeiras e campos de pedra pelo centro histórico de Mucugê, patrimônio do IPHAN.', 'R$ 250 – 600', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratona Monumental de Brasília', '2026-11-22', 'brasil', 'Brasília, DF', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.maratonamonumentalbsb.com.br/', 'Maratona passando pelos principais monumentos da capital federal. Uma das únicas maratonas do mundo inteiramente dentro de uma cidade Patrimônio da UNESCO. Largada na Esplanada dos Ministérios.', 'R$ 200 – 400', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('27ª Volta Int. da Pampulha', '2026-12-06', 'brasil', 'Belo Horizonte, MG', ARRAY['18K']::text[], 'road', 'https://www.yescom.com.br/voltadapampulha/2026/', 'Corrida clássica de 18K ao redor da Lagoa da Pampulha em Belo Horizonte. Largada e chegada no Mineirão. Uma das provas mais tradicionais de Minas Gerais.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('101ª Corrida Int. de São Silvestre', '2026-12-31', 'brasil', 'São Paulo, SP', ARRAY['15K']::text[], 'road', 'https://www.saosilvestre.com.br/', 'A corrida de rua mais icônica do Brasil e uma das mais tradicionais do mundo, na 101ª edição. 15 km pela região central de São Paulo na manhã de 31 de dezembro.', 'R$ 358', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- URUGUAY (23 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Montevideo Beach Run', '2026-03-14', 'uruguay', 'Montevideo', ARRAY['15K','8K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ironman 70.3 Punta del Este', '2026-03-15', 'uruguay', 'Punta del Este, Maldonado', ARRAY['Triatlón']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corré Montevideo', '2026-03-29', 'uruguay', 'Montevideo', ARRAY['21K','10K','5K']::text[], 'road', 'https://prodeporte.com.uy/corremontevideo/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Wine Run', '2026-04-03', 'uruguay', 'Maldonado', ARRAY['21K','10K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera Teletón', '2026-04-12', 'uruguay', 'Montevideo', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Piriápolis', '2026-04-12', 'uruguay', 'Piriápolis, Maldonado', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('30K Montevideo', '2026-04-19', 'uruguay', 'Montevideo', ARRAY['30K','15K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Campanero', '2026-04-26', 'uruguay', 'Lavalleja', ARRAY['27K','18K','9K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('50K San José', '2026-05-01', 'uruguay', 'San José', ARRAY['50K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Montevideo', '2026-05-10', 'uruguay', 'Montevideo', ARRAY['42K','21K','10K']::text[], 'road', 'https://montevideo.gub.uy/maraton-montevideo-2026', 'Certificada por World Athletics. Recorrido por más de 25 barrios icónicos de Montevideo, desde el Palacio Legislativo hasta el Parque Rodó. Combina costanera, sitios históricos y energía urbana.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('UTDS Ultra Trail de la Sierra', '2026-05-24', 'uruguay', 'Maldonado', ARRAY['Ultra']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Cerros de San Juan Trail', '2026-06-07', 'uruguay', 'Colonia', ARRAY['21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Colonia', '2026-06-28', 'uruguay', 'Colonia del Sacramento, Colonia', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Half Marathon Montevideo', '2026-08-09', 'uruguay', 'Montevideo', ARRAY['21K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corre Bosco', '2026-08-16', 'uruguay', 'Montevideo', ARRAY['10K','5K']::text[], 'road', NULL, 'Carrera solidaria Talleres Don Bosco. Tradicional en Montevideo.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Punta del Este', '2026-09-06', 'uruguay', 'Punta del Este, Maldonado', ARRAY['42K','21K','10K','5K','2K']::text[], 'road', 'https://maratondepuntadeleste.com.uy/', '17.ª edición. La distancia reina en la ciudad más linda. Premios de más de USD 6.000. Kit delivery en Enjoy Punta del Este Casino & Resort.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Villa Serrana Trail', '2026-09-13', 'uruguay', 'Villa Serrana, Lavalleja', ARRAY['21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Enfoque Bimbo', '2026-09-27', 'uruguay', 'Montevideo', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Hombre de Hierro', '2026-10-25', 'uruguay', 'Cerro Largo', ARRAY['60K','30K','7K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('San Felipe y Santiago de Montevideo', '2026-11-14', 'uruguay', 'Montevideo', ARRAY['10K','5K']::text[], 'road', NULL, 'Carrera conmemorativa de la fundación de Montevideo.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Fray Bentos', '2026-11-22', 'uruguay', 'Fray Bentos, Río Negro', ARRAY['21K','7K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Montevideo 15K', '2026-11-29', 'uruguay', 'Montevideo', ARRAY['21K','15K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Maua', '2026-12-06', 'uruguay', 'Cerro Largo', ARRAY['45K','25K','7K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- COLOMBIA (40 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Mar', '2026-02-22', 'colombia', 'Cartagena, Bolívar', ARRAY['21K','10K','5K']::text[], 'road', 'https://mediamaratondelmar.com/', 'Considerada la carrera más bonita de Colombia. El recorrido cruza el puerto de Cartagena y atraviesa la ciudad amurallada al amanecer, con vistas al Caribe.', 'COP 140.000 / USD 35', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera de las Rosas', '2026-02-22', 'colombia', 'Barranquilla, Atlántico', ARRAY['21K','10K','5K']::text[], 'road', 'https://carreradelasrosas.com/barranquilla/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera Farmatodo', '2026-03-01', 'colombia', 'Bogotá D.C.', ARRAY['12K','6K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Internacional de Barranquilla', '2026-03-15', 'colombia', 'Barranquilla, Atlántico', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://www.maratonbarranquilla.com/', 'Décima edición de la maratón que reúne 10.000 corredores. Recorrido que incluye el Ecoparque Ciénaga de Mallorquín y las playas de Puerto Mocho.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Huila', '2026-03-15', 'colombia', 'Neiva, Huila', ARRAY['21K','12K','6K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corre por Amor', '2026-03-15', 'colombia', 'Medellín, Antioquia', ARRAY['12K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera Verde Cali', '2026-03-15', 'colombia', 'Cali, Valle del Cauca', ARRAY['10K','5K','2K']::text[], 'road', 'https://carreraverdecolombia.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Quindío', '2026-03-22', 'colombia', 'Armenia, Quindío', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Internacional Metropolitana de Cúcuta', '2026-03-22', 'colombia', 'Cúcuta, Norte de Santander', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratoncucutametropolitana.com/', 'Primera maratón de 42 kilómetros del oriente colombiano, certificada por World Athletics. Incluye el Campeonato Nacional de Ruta.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Pasto', '2026-03-22', 'colombia', 'Pasto, Nariño', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Night Race 10K', '2026-03-22', 'colombia', 'Bogotá D.C.', ARRAY['10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera Verde Bogotá', '2026-04-19', 'colombia', 'Bogotá D.C.', ARRAY['10K','5K','3K']::text[], 'road', 'https://carreraverdecolombia.com/', 'XI edición. Combina deporte con acción ambiental. Parque Simón Bolívar. Incluye feria ambiental con más de 35 iniciativas sostenibles.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corre Mi Tierra Medellín', '2026-04-19', 'colombia', 'Medellín, Antioquia', ARRAY['21K','15K','10K','5K']::text[], 'road', 'https://corremitierra.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Vuelta Atlética Isla San Andrés', '2026-04-26', 'colombia', 'San Andrés Isla', ARRAY['32K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Quindío Trail Colombia by UTMB', '2026-05-02', 'colombia', 'Buenavista, Quindío', ARRAY['122K','84K','52K','24K','14K']::text[], 'trail', 'https://quindio.utmb.world/', 'Parte del circuito mundial UTMB. Recorrido por el corazón del Eje Cafetero atravesando 12 municipios del Quindío, entre cafetales, bosques de niebla y paisaje cultural cafetero (Patrimonio UNESCO).', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Cali', '2026-05-03', 'colombia', 'Cali, Valle del Cauca', ARRAY['42K','15K','4.2K']::text[], 'road', 'https://maratondecali.co/', 'Primera maratón de América Latina con Sello Élite de World Athletics. La Capital de la Salsa vibra con un ambiente festivo único en las calles históricas de Cali.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Silvia Trail Ancestral', '2026-05-19', 'colombia', 'Silvia, Cauca', ARRAY['42K','21K','13K','7K']::text[], 'trail', 'https://www.montanaancestral.com/silviatrail/', 'Carrera de montaña por territorio Misak-Guambiano. Ruta llena de historia y sabiduría ancestral en los Andes del Cauca.', NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera de las Rosas Bogotá', '2026-05-24', 'colombia', 'Bogotá D.C.', ARRAY['15K','10K','5K']::text[], 'road', 'https://carreradelasrosas.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Dulima', '2026-06-07', 'colombia', 'Ibagué, Tolima', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón Córdoba', '2026-06-07', 'colombia', 'Montería, Córdoba', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Cali', '2026-06-28', 'colombia', 'Cali, Valle del Cauca', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Floridablanca', '2026-07-05', 'colombia', 'Floridablanca, Santander', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Chicamocha Canyon Race', '2026-07-17', 'colombia', 'San Gil, Santander', ARRAY['100Mi','80K','42K','21K']::text[], 'trail', 'https://chicamochacanyonrace.com/', '14.ª edición. 4 días y 3 noches de competencia non-stop. Más de 1.200 corredores de distintas nacionalidades recorren 10 municipios de Santander. Votada mejor carrera trail de Colombia en 2024.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Valle de Tenza', '2026-07-23', 'colombia', 'Guateque, Boyacá', ARRAY['79K','43K','21K','9K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Bogotá', '2026-07-26', 'colombia', 'Bogotá D.C.', ARRAY['21K','10K']::text[], 'road', 'https://www.mediamaratonbogota.com/', 'La carrera atlética #1 de Colombia. Sello Platinum de World Athletics. 40.000 corredores a 2.600 msnm. Conocida como ''El Monstruo''.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('10K La Carrera del Pacífico', '2026-08-09', 'colombia', 'Cali, Valle del Cauca', ARRAY['10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón Ciudad Bonita', '2026-08-16', 'colombia', 'Bucaramanga, Santander', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera de la Mujer', '2026-09-06', 'colombia', 'Bogotá D.C.', ARRAY['10K','8K','4K','2K']::text[], 'road', NULL, 'Una de las carreras femeninas más importantes de América Latina.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón de Medellín', '2026-09-06', 'colombia', 'Medellín, Antioquia', ARRAY['42K','21K','10K','5K']::text[], 'road', 'https://maratonmedellin.com/', 'La maratón pionera de los 42K en Colombia. Certificada por AIMS y clasificatoria para Boston. Clima primaveral a 1.500 msnm. Salida y meta en Parques del Río.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra La Mesa ''Ruta de Los Miradores''', '2026-09-27', 'colombia', 'La Mesa, Cundinamarca', ARRAY['55K','22K','10K','3K']::text[], 'trail', 'https://www.ultralamesa.com/', NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Bimbo Global Race', '2026-09-27', 'colombia', 'Bogotá D.C.', ARRAY['10K','5K']::text[], 'road', 'https://www.bimboglobalracecolombia.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Café', '2026-10-04', 'colombia', 'Pereira, Risaralda', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón del Meta', '2026-10-04', 'colombia', 'Villavicencio, Meta', ARRAY['21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Frontera Endurance Run', '2026-10-06', 'colombia', 'Jardín, Antioquia', ARRAY['55K','21K','12K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Bucaramanga FCV', '2026-10-18', 'colombia', 'Bucaramanga, Santander', ARRAY['21K','10.5K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón Internacional de Cúcuta', '2026-11-15', 'colombia', 'Cúcuta, Norte de Santander', ARRAY['21K','10K','5K']::text[], 'road', 'https://www.mediamaratoncucuta.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón Bambuquera', '2026-11-22', 'colombia', 'Neiva, Huila', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Corre Mi Tierra Bogotá', '2026-11-22', 'colombia', 'Bogotá D.C.', ARRAY['21K','15K','10K','5K']::text[], 'road', 'https://corremitierra.com/', NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('42K VChallenges Maratón Bogotá', '2026-11-29', 'colombia', 'Bogotá D.C.', ARRAY['42K','21K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Del Mar a La Cima', '2026-11-30', 'colombia', 'Santa Marta, Magdalena', ARRAY['110K','81.5K','41.6K','24.5K','12K']::text[], 'trail', 'https://delmaralacima.com/', 'La carrera de montaña más exótica del planeta. Desde la playa hasta la Sierra Nevada de Santa Marta, la montaña costera más alta del mundo.', NULL, TRUE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- PERU (22 races)

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Internacional de Lambayeque', '2026-01-25', 'peru', 'Lambayeque', ARRAY['42K','21K','10K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Kuélap', '2026-01-31', 'peru', 'Luya, Amazonas', ARRAY['Ultra','42K','21K']::text[], 'trail', NULL, 'Trail en la región de la fortaleza de Kuélap, en la selva alta de Amazonas.', NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Media Maratón de Trujillo', '2026-02-08', 'peru', 'Trujillo, La Libertad', ARRAY['21K','10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Desafío Chilina', '2026-02-08', 'peru', 'Cayma, Arequipa', ARRAY['21K','10K','5K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Carrera de Mujeres Perú', '2026-03-08', 'peru', 'Miraflores, Lima', ARRAY['10K','5K']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Int. Virgen de la Candelaria de Cayma', '2026-03-15', 'peru', 'Cayma, Arequipa', ARRAY['42K','21K','10K']::text[], 'road', NULL, 'XXXIX edición. Una de las maratones más tradicionales de Arequipa.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Lima Ultramaratón', '2026-03-27', 'peru', 'Lima', ARRAY['Ultra']::text[], 'road', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Lachay Trail', '2026-03-29', 'peru', 'Huaral, Lima', ARRAY['21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Andes Trail Peru', '2026-04-05', 'peru', 'Písac, Cusco', ARRAY['42K','21K','10K']::text[], 'trail', NULL, 'Trail running por el Valle Sagrado de los Incas, Písac.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Gorilla Trail Chiguata', '2026-04-12', 'peru', 'Chiguata, Arequipa', ARRAY['42K','21K','10K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Inca Trail', '2026-04-19', 'peru', 'Cusco', ARRAY['42K','30K']::text[], 'trail', NULL, 'Trail running por los caminos incas en la región de Cusco.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Sierra Andina - Chavín Trail', '2026-05-03', 'peru', 'Huaraz, Áncash', ARRAY['43.7K','21.4K','12.6K']::text[], 'trail', 'https://sierraandinaoutdoors.com', 'Trail por senderos ancestrales de Chavín de Huántar en la Cordillera Blanca. Paso de montaña Punta Yanashallah a 4.700 msnm.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Wings for Life World Run Lima', '2026-05-10', 'peru', 'Lima', ARRAY['Open']::text[], 'road', 'https://www.wingsforlifeworldrun.com/en/locations/lima', 'Carrera global donde todos arrancan al mismo tiempo. El 100% de las inscripciones se destina a investigación de lesiones de médula espinal.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Inca Wildmarathon', '2026-05-24', 'peru', 'Machu Picchu Pueblo, Cusco', ARRAY['42K','21K','10K']::text[], 'trail', 'https://wildmarathon.com/inca-marathon-3/', 'Carrera trail de 6 días entre los valles de Salkantay y Machu Picchu. Incluye programa de aclimatación, alojamiento y comidas.', 'USD 2.290 – 2.490', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón adidas Rímac Lima 42K', '2026-05-24', 'peru', 'Lima', ARRAY['42K','21K']::text[], 'road', 'https://lima42k.com.pe/', 'La maratón más grande del Perú. Organizada por adidas y Rímac.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Ultra Machu Picchu Qhapac Ñan', '2026-06-20', 'peru', 'Cusco', ARRAY['103K','65K','42K','21K']::text[], 'trail', 'https://ultramachupicchu.com/', 'Ultramaratón de alta montaña inspirada en el Qhapaq Ñan (sistema vial inca). Senderos ancestrales, bosques nublados, lagunas cristalinas y terrazas de Chinchero. 5.808 m+ de desnivel.', 'desde USD 259', TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Maratón Internacional de Pacasmayo', '2026-07-05', 'peru', 'Pacasmayo, La Libertad', ARRAY['42K','21K','10K','5K']::text[], 'road', NULL, 'Conocida como ''La maratón más dura del Perú''. Combina vistas del Pacífico, caminos de tierra y desierto.', NULL, FALSE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Machu Picchu Trail Adventure', '2026-07-05', 'peru', 'Cusco', ARRAY['126K','97K']::text[], 'trail', NULL, NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Sierra Andina Mountain Trail', '2026-07-19', 'peru', 'Huamachuco, La Libertad', ARRAY['48.1K','30.8K','15.4K']::text[], 'trail', 'https://sierraandinaoutdoors.com', NULL, NULL, FALSE, 'estimated', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('KIA Media Maratón de Lima & 10K', '2026-08-23', 'peru', 'Lima', ARRAY['21K','10K']::text[], 'road', 'https://mediamaratondelima.com.pe/', '117.ª edición. La media maratón más antigua del mundo. Sale de la Plaza de Armas de Lima y termina en el Circuito Mágico del Agua. 23.000 corredores.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Inca Trail Marathon', '2026-08-24', 'peru', 'Machu Picchu, Cusco', ARRAY['42K','21K']::text[], 'trail', 'https://www.eriksadventures.com/inca-trail-marathon-race-to-machu-picchu-peru/', 'Maratón oficial por el Camino Inca hasta Machu Picchu. 26.2 millas por senderos ancestrales a más de 4.200 msnm.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

INSERT INTO races (name, date, country_id, location, categories, type, website, description, price, is_iconic, status, source, moderation_status)
VALUES ('Marcona Wind Trail', '2026-12-06', 'peru', 'San Juan de Marcona, Ica', ARRAY['100K','65K','42K','35K','21K','10K']::text[], 'trail', 'https://www.marconawindtrail.com/', 'Séptima edición en la capital del viento. Una hora al sur de Nasca. Distancias desde 10K hasta 100K con carrera nocturna de 35K.', NULL, TRUE, 'confirmed', 'pulz', 'approved')
ON CONFLICT (name, date, country_id) DO NOTHING;

-- Total: 264 races seeded
