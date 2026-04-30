/**
 * PULZ — Data Layer v4.0
 * R is initialized with hardcoded data (always available).
 * Supabase replaces it async when ready.
 */

/* Safe localStorage helpers — prevent quota / SecurityError in private mode */
function safeLS(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(e){/* quota exceeded or private mode */}}
function setLS(key,val){try{localStorage.setItem(key,val);}catch(e){/* quota exceeded or private mode */}}
function getLS(key,fallback){try{const v=localStorage.getItem(key);return v===null?(fallback===undefined?null:fallback):v;}catch(e){return fallback===undefined?null:fallback;}}
function rmLS(key){try{localStorage.removeItem(key);}catch(e){/* private mode */}}

const countries=[
    {id:'argentina',code:'AR',name:'Argentina'},
    {id:'chile',code:'CL',name:'Chile'},
    {id:'brasil',code:'BR',name:'Brasil'},
    {id:'uruguay',code:'UY',name:'Uruguay'},
    {id:'colombia',code:'CO',name:'Colombia'},
    {id:'peru',code:'PE',name:'Perú'},
    {id:'mexico',code:'MX',name:'México'}
];

let R={
argentina:[
// — Enero —
{n:"Lolog E-Ko Trail",d:"2026-01-11",l:"San Martín de los Andes, Neuquén",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// — Febrero —
{n:"La Misión",d:"2026-02-19",l:"Villa La Angostura, Neuquén",c:["200K","160K","120K","80K","60K","40K"],t:"trail",w:"",i:1,s:"c",desc:"Carrera de trekking y autosuficiencia en montaña con 20 ediciones. Recorrido por bosques y montañas de la Patagonia.",source:"pulz"},
{n:"Aconcagua Ultra Trail",d:"2026-02-21",l:"Los Penitentes, Mendoza",c:["70K","50K","42K","25K","15K","6K"],t:"trail",w:"https://aconcaguaultratrail.com/",i:1,s:"c",desc:"Una de las carreras más altas del continente, partiendo a más de 2500 msnm con máxima de 4000 m en el Parque Provincial Aconcagua.",source:"pulz"},
{n:"El Paso Austral",d:"2026-02-27",l:"Bariloche, Río Negro",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"La Villa Trail Race",d:"2026-02-28",l:"Villa General Belgrano, Córdoba",c:["24K","12K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// — Marzo —
{n:"Circuito Estaciones (Otoño)",d:"2026-03-01",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"https://www.clubdecorredores.com/",i:1,s:"c",desc:"El principal circuito de running en América Latina, con 4 etapas anuales representando cada estación del año.",source:"pulz"},
{n:"Mar del Plata Trail Run",d:"2026-03-01",l:"Mar del Plata, Buenos Aires",c:["Trail"],t:"trail",w:"https://mardelplatatrailrun.com.ar/",i:0,s:"c",source:"pulz"},
{n:"Ultra Alpina",d:"2026-03-06",l:"Villa Alpina, Córdoba",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Women Night Run",d:"2026-03-07",l:"Vicente López, Buenos Aires",c:["8K","3K"],t:"asfalto",w:"https://wnr.com.ar/2026/",i:0,s:"c",source:"pulz"},
{n:"Desafío Arrayanes",d:"2026-03-07",l:"Villa La Angostura, Neuquén",c:["22K","12K"],t:"trail",w:"",i:0,s:"c",desc:"Carrera por senderos de la Península de Quetrihué, cruzando el mítico Bosque de Arrayanes en el Parque Nacional Los Arrayanes.",source:"pulz"},
{n:"Carrera de la Mujer",d:"2026-03-08",l:"Necochea, Buenos Aires",c:["12K","6K","3K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Bariloche 100 Ultra Trail",d:"2026-03-13",l:"Bariloche, Río Negro",c:["100K","Ultra"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Sunset Run",d:"2026-03-14",l:"Vicente López, Buenos Aires",c:["8K","3K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K de Carlos Paz",d:"2026-03-15",l:"Villa Carlos Paz, Córdoba",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"NB 10K Buenos Aires",d:"2026-03-15",l:"Palermo, Buenos Aires",c:["10K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:0,s:"c",desc:"El primer 10K del calendario NB Race Series 2026.",source:"pulz"},
{n:"Ushuaia by UTMB",d:"2026-03-18",l:"Ushuaia, Tierra del Fuego",c:["130K","85K","50K","32K","24K","13K"],t:"trail",w:"https://ushuaia.utmb.world/",i:1,s:"c",desc:"Tercera edición de la serie UTMB en el fin del mundo. Recorrido por bosques, montañas y costas del extremo sur de la Patagonia argentina.",source:"pulz"},
{n:"La Carrera de Miguel",d:"2026-03-22",l:"Buenos Aires, CABA",c:["8K","3K"],t:"asfalto",w:"",i:0,s:"c",desc:"Homenaje al atleta y poeta Miguel Sánchez, desaparecido durante la última dictadura. Institucionalizada por ley de la Legislatura porteña.",source:"pulz"},
{n:"21K de Mendoza",d:"2026-03-22",l:"Parque Central, Mendoza",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Tafí Trail",d:"2026-03-22",l:"El Mollar, Tafí del Valle, Tucumán",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"NB 21K Salta",d:"2026-03-29",l:"Salta",c:["21K","10K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:0,s:"c",desc:"Evento del circuito NB Race Series en el norte argentino con clima ideal para correr.",source:"pulz"},
{n:"Festival Farmacity",d:"2026-03-29",l:"Buenos Aires, CABA",c:["10K","3K","1K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// — Abril —
{n:"Patagonia Run",d:"2026-04-08",l:"San Martín de los Andes, Neuquén",c:["100Mi","110K","70K","42K","21K","10K"],t:"trail",w:"https://patagoniarun.com",i:1,s:"c",desc:"El festival de trail y ultra trail running más grande de América. Recorrido por bosques patagónicos, lagos cristalinos y senderos de montaña con vistas al volcán Lanín.",price:"USD 120 – 280",source:"pulz"},
{n:"10K Adidas Supernova",d:"2026-04-12",l:"Vicente López, Buenos Aires",c:["10K"],t:"asfalto",w:"https://supernova10k.com.ar/",i:0,s:"c",source:"pulz"},
{n:"15K Puerto Norte",d:"2026-04-12",l:"Rosario, Santa Fe",c:["15K","10K","4K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Extremo 42K La Sala",d:"2026-04-18",l:"Yerba Buena, Tucumán",c:["42K","30K","21K","10K"],t:"trail",w:"https://extremotucuman.com.ar/",i:0,s:"c",desc:"Carrera de trail en las sierras tucumanas que busca posicionar a Tucumán como referente nacional del trail running.",source:"pulz"},
{n:"Maratón de Mar del Plata",d:"2026-04-19",l:"Mar del Plata, Buenos Aires",c:["42K","21K","10K"],t:"asfalto",w:"https://www.newbalance.com.ar/42k-mar-del-plata-2026/race-series-mdp-42k.html",i:1,s:"c",desc:"Una de las maratones más emblemáticas del país. Circuito costero que conecta con el mar.",source:"pulz"},
{n:"FILA Race",d:"2026-04-19",l:"Palermo, Buenos Aires",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de la Defensoría",d:"2026-04-19",l:"La Plata, Buenos Aires",c:["10K","3K","1K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"A Pampa Traviesa",d:"2026-04-19",l:"Santa Rosa, La Pampa",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.santarosa.gob.ar/a-pampa-traviesa-2026/",i:1,s:"c",desc:"Clásico argentino del atletismo de fondo con proyección internacional, organizado por la Municipalidad de Santa Rosa. 41ª edición.",source:"pulz"},
{n:"Maratana",d:"2026-04-26",l:"Puerto Madero, Buenos Aires",c:["15K","10K","3K"],t:"asfalto",w:"",i:0,s:"c",desc:"Evento que celebra los orígenes italianos en la población argentina, con largada en Costanera Sur.",source:"pulz"},
{n:"Maratón de Formosa",d:"2026-04-26",l:"Formosa",c:["42K","21K","10K"],t:"asfalto",w:"https://maratonformosa.tierrarojasoft.com/",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Puerto Madryn",d:"2026-04-26",l:"Puerto Madryn, Chubut",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// — Mayo —
{n:"Champa Ultra Race",d:"2026-05-01",l:"San Javier, Córdoba",c:["60K","42K","30K","24K","16K","10K"],t:"trail",w:"https://champaultrarace.com.ar/",i:1,s:"c",desc:"11ª edición en el corazón del Cerro Champaquí. Circuitos 100% trail con cumbres, filos, senderos y bosques. Otorga puntos ITRA y UTMB Index.",source:"pulz"},
{n:"Maratón de Mendoza",d:"2026-05-03",l:"Mendoza",c:["42K","21K","10K","4K"],t:"asfalto",w:"https://maratondemendoza.com/",i:1,s:"c",desc:"Maratón internacional por paisajes de montaña y atracciones turísticas de Mendoza.",source:"pulz"},
{n:"Valhöll Ultra Trail",d:"2026-05-08",l:"Villa General Belgrano, Córdoba",c:["50K","35K","21K","12K"],t:"trail",w:"https://tyr.com.ar/valholl2026",i:1,s:"c",desc:"7ª edición. Recorrido técnico y desafiante por las sierras del Valle de Calamuchita con filos, senderos, bosques, ríos y cumbres.",source:"pulz"},
{n:"21K de Rosario",d:"2026-05-10",l:"Rosario, Santa Fe",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"NB 25K Buenos Aires",d:"2026-05-17",l:"Buenos Aires, CABA",c:["25K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:0,s:"c",desc:"La distancia de ruta oficial que faltaba en el país. Parte del NB Race Series.",source:"pulz"},
{n:"Fiambalá Desert Trail",d:"2026-05-20",l:"Fiambalá, Catamarca",c:["110K etapas","50K","35K","25K","15K"],t:"trail",w:"",i:1,s:"c",desc:"La mayor carrera en geografía de desierto y montaña de Sudamérica. 11ª edición entre las dunas más altas del mundo al pie de la Cordillera.",source:"pulz"},
{n:"Maratón Patria",d:"2026-05-24",l:"Santiago del Estero",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Fiestas Mayas / Carrera Maya",d:"2026-05-25",l:"Buenos Aires, CABA",c:["10K","3K"],t:"asfalto",w:"https://fiestasmayas.com.ar/",i:1,s:"c",desc:"50ª edición del evento atlético más tradicional de Argentina. Organizado por Club de Corredores.",price:"ARS 45.000",source:"pulz"},
// — Junio —
{n:"15K Adidas Adizero",d:"2026-06-07",l:"Buenos Aires, CABA",c:["15K"],t:"asfalto",w:"https://adizero15k.com.ar/",i:0,s:"c",desc:"Carrera de adidas en el Autódromo de Buenos Aires, circuito controlado ideal para la velocidad.",source:"pulz"},
{n:"NB 21K La Plata",d:"2026-06-14",l:"La Plata, Buenos Aires",c:["21K","10K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:0,s:"c",desc:"Debut de New Balance en La Plata combinando deporte y cultura por las calles de la ciudad.",source:"pulz"},
{n:"Circuito Estaciones (Invierno)",d:"2026-06-28",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"https://www.clubdecorredores.com/",i:0,s:"c",source:"pulz"},
{n:"Maratón Int. de la Bandera",d:"2026-06-28",l:"Rosario, Santa Fe",c:["42K","10K"],t:"asfalto",w:"https://42krosario.com.ar/2026/",i:1,s:"c",desc:"Maratón internacional que recorre los rincones más icónicos de Rosario. Sede del 47° Campeonato Nacional de Maratón.",source:"pulz"},
// — Julio —
{n:"NB 42K Córdoba",d:"2026-07-05",l:"Córdoba",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:1,s:"c",desc:"Evento multidistancia del NB Race Series por calles históricas y paisajes de Córdoba.",source:"pulz"},
{n:"NB 30K Buenos Aires",d:"2026-07-19",l:"Buenos Aires, CABA",c:["30K","10K"],t:"asfalto",w:"https://raceseries.newbalance.com.ar/",i:0,s:"c",desc:"La antesala perfecta para preparar la maratón. Circuito plano y rápido.",source:"pulz"},
{n:"Maratón Int. de San Juan",d:"2026-07-26",l:"San Juan",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratondesanjuan.com/",i:1,s:"c",desc:"10ª edición. Recorrido desde el Dique Punta Negra por los paisajes más emblemáticos de San Juan hasta el Teatro del Bicentenario.",source:"pulz"},
// — Agosto —
{n:"21K de Buenos Aires",d:"2026-08-23",l:"Buenos Aires, CABA",c:["21K"],t:"asfalto",w:"https://www.maratondebuenosaires.com/medio-maraton-de-buenos-aires-21k.html",i:1,s:"c",desc:"La media maratón más rápida de América y #1 de Latinoamérica, con más de 22.000 participantes. Pasa por el Planetario, Rosedal, Teatro Colón, Obelisco y Casa Rosada.",price:"ARS 100.000 / USD 100",source:"pulz"},
// — Septiembre —
{n:"Circuito Estaciones (Primavera)",d:"2026-09-06",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"https://www.clubdecorredores.com/",i:0,s:"c",source:"pulz"},
{n:"Maratón de Buenos Aires",d:"2026-09-20",l:"Buenos Aires, CABA",c:["42K"],t:"asfalto",w:"https://www.maratondebuenosaires.com/",i:1,s:"c",desc:"La maratón más grande de Latinoamérica. Recorre los barrios más emblemáticos de la ciudad con más de 15.000 corredores de todo el mundo. Largada en Figueroa Alcorta y Dorrego.",price:"ARS 120.000 / USD 120",source:"pulz"},
// — Octubre —
{n:"UTACCH Ultra Trail",d:"2026-10-03",l:"San Javier y Yacanto, Córdoba",c:["100Mi","100K","75K","55K","38K","26K","15K"],t:"trail",w:"https://www.utacchultratrail.com/",i:1,s:"c",desc:"La carrera de trail más desafiante de Argentina. 100 millas non-stop cruzando las Sierras Grandes de los Comechingones con el Cerro Champaquí como hito. Clasificatoria para Western States 100.",source:"pulz"},
{n:"21K La Gaceta Tucumán",d:"2026-10-18",l:"San Miguel de Tucumán",c:["21K","10K","3K"],t:"asfalto",w:"https://21k.lagaceta.com.ar/",i:0,s:"e",desc:"Importante media maratón del NOA organizada por el diario La Gaceta.",source:"pulz"},
{n:"McDonald's Run",d:"2026-10-25",l:"Vicente López, Buenos Aires",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// — Noviembre —
{n:"ASICS K42 Villa La Angostura",d:"2026-11-06",l:"Villa La Angostura, Neuquén",c:["42K","21K","10K","GrandK"],t:"trail",w:"https://argentina.kseries.com.ar/",i:1,s:"c",desc:"Adventure marathon por senderos de montaña y bosques patagónicos en Villa La Angostura. Final del circuito K Series.",source:"pulz"},
{n:"BRUT Bariloche",d:"2026-11-28",l:"Bariloche, Río Negro",c:["60K","42K","32K","22K","10K"],t:"trail",w:"https://brut.run/",i:1,s:"e",desc:"Bariloche Running Ultra Trail. Evento de trail running con múltiples distancias por los senderos de montaña de San Carlos de Bariloche.",source:"pulz"},
// — Diciembre —
{n:"El Cruce Saucony",d:"2026-12-05",l:"Bariloche, Río Negro",c:["100K en 3 etapas"],t:"trail",w:"https://elcruce.com.ar/",i:1,s:"c",desc:"24ª edición. La carrera de trail por etapas más grande de América. 100 km en 3 días cruzando los Andes con campamentos junto a lagos.",source:"pulz"},
{n:"Circuito Estaciones (Verano)",d:"2026-12-20",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"https://www.clubdecorredores.com/",i:0,s:"c",source:"pulz"},
{n:"San Silvestre Buenos Aires",d:"2026-12-31",l:"Buenos Aires, CABA",c:["8K"],t:"asfalto",w:"https://sansilvestrebuenosaires.com/",i:1,s:"e",desc:"La carrera que despide el año. 8K por el centro porteño pasando por la Casa Rosada, el Cabildo y sitios icónicos, en un ambiente festivo.",source:"pulz"}
],
chile:[
// Marzo
{n:"Maratón de Temuco",d:"2026-03-14",l:"Temuco, Araucanía",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.passline.com/eventos/maraton-de-temuco-2026-448984",i:1,s:"c",desc:"Sede del Campeonato Sudamericano de Ruta 2026. Única maratón de Chile con 4 distancias certificadas por World Athletics. Más de 7.000 corredores en el Estadio Germán Becker.",price:"CLP 25.000 – 45.000",source:"pulz"},
{n:"Tipaume Trail Race",d:"2026-03-14",l:"Pichilemu, O'Higgins",c:["18K","7K","2K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"STGO 10K (Fecha 1)",d:"2026-03-15",l:"Santiago, Metropolitana",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corrida de Peñalolén",d:"2026-03-15",l:"Peñalolén, Santiago",c:["15K","10K","6K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón del Valle Antuco",d:"2026-03-20",l:"Antuco, Biobío",c:["42K","21K","10K","5K","2K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"La Gran Travesía",d:"2026-03-21",l:"Santiago, Metropolitana",c:["100K","50K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Sunset Trail Curacaví",d:"2026-03-21",l:"Curacaví, Metropolitana",c:["12K","8K","6K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Laguna Trail",d:"2026-03-21",l:"San Fernando, O'Higgins",c:["15K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Aguas Andinas Trail Run",d:"2026-03-21",l:"Santiago, Metropolitana",c:["9K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Women's Night Out",d:"2026-03-21",l:"Santiago, Metropolitana",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"STGO21K by ASICS (Fecha 1)",d:"2026-03-29",l:"Santiago, Metropolitana",c:["21K","10.5K","5K"],t:"asfalto",w:"https://santiago21k.cl/",i:1,s:"c",desc:"La media maratón más rápida de Chile. Circuito urbano premium organizado por SportHub con recorrido por Las Condes y Vitacura. Dos fechas al año.",price:"CLP 31.000 – 40.000",source:"pulz"},
{n:"Medio Maratón de Viña",d:"2026-03-29",l:"Viña del Mar, Valparaíso",c:["21K","5K","1.6K"],t:"asfalto",w:"https://mediomaratonvina.cl/",i:1,s:"c",desc:"Sede del Campeonato Sudamericano de Ruta 2026. Circuito costero certificado, conocido como la ruta más rápida de Chile. Organizado por Prokart Producciones.",source:"pulz"},
{n:"Run Frutillar",d:"2026-03-29",l:"Frutillar, Los Lagos",c:["21K","10.5K","5K","2K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Abril
{n:"Pampa Perdiz Trail",d:"2026-04-04",l:"Alto Hospicio, Tarapacá",c:["30K","22K","13K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Bosque Vivo Trail Run",d:"2026-04-04",l:"Araucanía",c:["14K","7K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Trail Malalcahuello by Corralco",d:"2026-04-10",l:"Malalcahuello, Araucanía",c:["30K","15K","7K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Corrida Día del Deporte",d:"2026-04-11",l:"Todo Chile (16 regiones)",c:["5K","3K"],t:"asfalto",w:"https://www.diadeldeporte.cl/",i:1,s:"c",desc:"La corrida más grande de Chile, organizada por el Ministerio del Deporte e IND. Se corre simultáneamente en todas las capitales regionales del país. Gratuita y para toda la familia.",price:"Gratis",source:"pulz"},
{n:"Doñihue Trail Race",d:"2026-04-11",l:"Doñihue, O'Higgins",c:["14K","2K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Epic Trail Nocturno",d:"2026-04-11",l:"Concepción, Biobío",c:["21K","12K","7K","3.5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"New Balance 15K Santiago",d:"2026-04-12",l:"Santiago, Metropolitana",c:["15K","10K"],t:"asfalto",w:"https://runchile.cl/new-balance-15k-santiago-confirma-fecha-para-2026/",i:0,s:"c",desc:"Carrera urbana New Balance con recorrido por Ñuñoa. Ambiente festivo con música y activaciones de marca.",price:"CLP 28.000 – 32.000",source:"pulz"},
{n:"Trail La Fragua (Fecha 1)",d:"2026-04-12",l:"Santiago, Metropolitana",c:["20K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón del Maule",d:"2026-04-12",l:"Curicó, Maule",c:["90K","42K","21K","10K"],t:"asfalto",w:"https://maratondelmaule.cl/",i:1,s:"c",desc:"Maratón con debut de distancia ultra de 90K por la precordillera maulina. Organizada por la Corporación de Deportes de Curicó con recorridos que combinan asfalto y senderos.",price:"CLP 37.100 – 106.000",source:"pulz"},
{n:"Antuco Trail Ruta del Cóndor",d:"2026-04-18",l:"Antuco, Biobío",c:["46K","36K","21K","10K","2K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"10K Valparaíso Curauma",d:"2026-04-19",l:"Valparaíso",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Monardez Trail Experience",d:"2026-04-19",l:"Coquimbo",c:["21K","10K","3K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Ultra Fiord",d:"2026-04-25",l:"Torres del Paine, Magallanes",c:["136K","115K","95K","80K","60K","50K","42K","21K"],t:"trail",w:"https://www.ultrafiord.com/en/",i:1,s:"c",desc:"Ultra trail internacional en el extremo sur de la Patagonia chilena. Cruces de montaña, glaciares, bosques prístinos y vistas a fiordos en Torres del Paine. Corredores de más de 30 países.",price:"USD 150 – 350",source:"pulz"},
{n:"Maratón de Santiago",d:"2026-04-26",l:"Santiago, Metropolitana",c:["42K","21K","10K"],t:"asfalto",w:"https://maratondesantiago.cl/",i:1,s:"c",desc:"El evento deportivo más masivo de Chile. Miles de corredores recorren las principales avenidas de Santiago con la Cordillera de los Andes como telón de fondo. Certificada por World Athletics y AIMS.",price:"CLP 30.000 – 53.000",source:"pulz"},
// Mayo
{n:"Trail del Cañi",d:"2026-05-01",l:"Pucón, Araucanía",c:["30K","15K","6K","KMV"],t:"trail",w:"",i:0,s:"c",desc:"Trail por el Santuario El Cañi, reserva de bosques milenarios de araucarias y coigües cerca de Pucón.",source:"pulz"},
{n:"Desafío Quillayquén",d:"2026-05-02",l:"Coltauco, O'Higgins",c:["21K","11K","6K","2K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Patagonia Camp Cup",d:"2026-05-02",l:"Torres del Paine, Magallanes",c:["42K","21K","15K","5K"],t:"trail",w:"https://www.patagoniacamp.com/camp-cup-26",i:1,s:"c",desc:"9ª edición en territorio privado de 34.000 hectáreas junto al Parque Nacional Torres del Paine. Bosques de lengas y coigües otoñales con el macizo Paine de fondo. Incluye asado patagónico y música en vivo.",source:"pulz"},
{n:"Desafío Trail Parque Fray Jorge",d:"2026-05-09",l:"Ovalle, Coquimbo",c:["35K","21K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Tricahue Trail Experience",d:"2026-05-09",l:"Maule",c:["21K","12K","6K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Wings for Life World Run",d:"2026-05-10",l:"Santiago, Metropolitana",c:["Run"],t:"asfalto",w:"https://www.wingsforlifeworldrun.com/en/locations/santiago",i:1,s:"c",desc:"Carrera solidaria global de Red Bull a beneficio de la investigación de lesiones de médula espinal. Formato único: todos arrancan a la misma hora mundial y el Catcher Car te persigue hasta atraparte.",price:"CLP 20.000",source:"pulz"},
{n:"Biosfera Trail Run Olmué",d:"2026-05-16",l:"Olmué, Valparaíso",c:["23K","16K","9K","4K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Desafío PARQUEMET Caja Los Andes",d:"2026-05-17",l:"Santiago, Metropolitana",c:["23K","10K","5K"],t:"trail",w:"https://huellasports.cl/trail_parquemet/",i:0,s:"c",desc:"Trail running por el Cerro San Cristóbal (Parque Metropolitano). Punto más alto en el Cerro El Carbón con vistas panorámicas. Máximo 1.000 participantes.",price:"CLP 12.000 – 30.000",source:"pulz"},
{n:"One Run Chile Papudo",d:"2026-05-23",l:"Papudo, Valparaíso",c:["21K","10K","5K","1K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Desafío Lo Orozco",d:"2026-05-24",l:"O'Higgins",c:["15K","7K","4K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"21K Valle del Elqui",d:"2026-05-31",l:"Vicuña, Coquimbo",c:["21K","10K","3K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"STGO 10K (Fecha 2)",d:"2026-05-31",l:"Santiago, Metropolitana",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Junio
{n:"Torrencial Chile by UTMB",d:"2026-05-29",l:"Valdivia, Los Ríos",c:["98K","53K","37K","27K","12K","6K"],t:"trail",w:"https://torrencial.utmb.world/",i:1,s:"c",desc:"Parte de la UTMB World Series. La única carrera de invierno de Chile, atravesando el bosque valdiviano bajo lluvia, viento y frío. Top 3 clasifica a CCC y OCC en UTMB Mont-Blanc. 10 años de historia.",price:"CLP 30.000 – 120.000",source:"pulz"},
{n:"Maratón Monte Verde",d:"2026-06-06",l:"Curacautín, Araucanía",c:["42K","28K","18K","12K","5K"],t:"trail",w:"https://welcu.com/los-volcanes/maraton-monte-verde-2026",i:0,s:"c",desc:"5ª edición. Festival de trail running en el sector San Nicolás con senderos rodeados de bosques y barro. Cierre de la Araucanía Trail Series.",source:"pulz"},
{n:"Volcano Marathon",d:"2026-06-26",l:"Hanga Roa, Rapa Nui (Isla de Pascua)",c:["42K","21K","10K"],t:"asfalto",w:"https://www.volcanomarathon.com/",i:1,s:"c",desc:"Maratón en Isla de Pascua. Partida en Playa Anakena con terreno volcánico y vistas al cráter Rano Kau. Programa de 5 días con inmersión en cultura Rapa Nui y estatuas Moai.",price:"USD 3.300+",source:"pulz"},
{n:"Maratón del Desierto",d:"2026-06-27",l:"Huara, Tarapacá",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://avatasport.evently.cl/MARATON-DEL-DESIERTO-MAS-ARIDO-DEL-MUNDO-27-06-2026",i:1,s:"c",desc:"Épica carrera por la Ruta A-412, cruzando 5 oficinas salitreras abandonadas de 1960. Se promociona como la maratón en el desierto más árido del mundo.",source:"pulz"},
{n:"Corrida Santa María del Mar",d:"2026-06-27",l:"Valparaíso",c:["12K","6K","1K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Julio
{n:"Desafío Trail Pichidangui",d:"2026-07-05",l:"Pichidangui, Coquimbo",c:["25K","13K","5.5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"STGO 10K (Fecha 3)",d:"2026-07-12",l:"Santiago, Metropolitana",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Invernal Chome",d:"2026-07-18",l:"Chome, Biobío",c:["42K","21K","11K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Agosto
{n:"Putaendo Trail Run",d:"2026-08-01",l:"Putaendo, Valparaíso",c:["50K","35K","21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"ASICS Golden Run Santiago",d:"2026-08-02",l:"Ñuñoa, Santiago",c:["21K","10K"],t:"asfalto",w:"https://asicsgolden.run/",i:1,s:"c",desc:"Carrera urbana ASICS con circuito diseñado para el rendimiento en Campos de Deportes, Ñuñoa. Evento premium con kit de primer nivel.",source:"pulz"},
{n:"Los Ñadis Trail Running",d:"2026-08-01",l:"Valdivia, Los Ríos",c:["21K","15K","10K","5K","3K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón La Serena",d:"2026-08-16",l:"La Serena, Coquimbo",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.maratonlaserena.cl/",i:1,s:"c",desc:"1ª edición del Maratón 42K de La Serena. Recorrido con epicentro en el Faro Monumental y la Av. del Mar. Apunta a reunir 6.000 corredores. Premios por más de CLP 5 millones.",source:"pulz"},
{n:"Nahuelbuta All In CMPC",d:"2026-08-29",l:"Angol, Araucanía",c:["42K","21K","12K","6K","2K"],t:"trail",w:"https://www.cmpc.com/en/a-successful-close-to-the-third-annual-nahuelbuta-all-in/",i:1,s:"c",desc:"Campeonato Nacional de Trail Running organizado por CMPC y FEDACHI en el Parque Junquillar de Angol. Selectivo para competencias internacionales.",source:"pulz"},
{n:"Media Maratón de Concón",d:"2026-08-30",l:"Concón, Valparaíso",c:["21K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Medio Maratón de Santiago (Mujeres)",d:"2026-08-30",l:"Santiago, Metropolitana",c:["21K","7K"],t:"asfalto",w:"https://mediomaratonsantiago.cl/",i:1,s:"c",desc:"Media maratón exclusiva para mujeres en Santiago. Patrocinada por Itaú, celebra el running femenino en la capital.",source:"pulz"},
{n:"STGO21K by ASICS (Fecha 2)",d:"2026-11-30",l:"Santiago, Metropolitana",c:["21K","10.5K","5K"],t:"asfalto",w:"https://santiago21k.cl/",i:0,s:"c",source:"pulz"},
// Septiembre
{n:"Junquillar Ultra Extremo",d:"2026-09-05",l:"Arauco, Biobío",c:["50K","30K","21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Patagonian Int. Marathon",d:"2026-09-05",l:"Torres del Paine, Magallanes",c:["42K","30K","21K","15K","10K"],t:"trail",w:"https://www.patagonianinternationalmarathon.com/en/",i:1,s:"c",desc:"Desde 2012, la primera maratón en Torres del Paine. Ruta por caminos de ripio del Parque Nacional con vistas a Paine Grande y Cuernos del Paine. Base en Puerto Natales. Corredores de 50+ países.",price:"USD 120 – 200",source:"pulz"},
{n:"Media Maratón TPS Valparaíso",d:"2026-09-06",l:"Valparaíso",c:["21K","10K","2K"],t:"asfalto",w:"https://www.mediamaratontps.cl/",i:1,s:"c",desc:"14ª edición. Recorrido único por el interior del Terminal Pacífico Sur y las zonas más emblemáticas del puerto. En vez de medallas, invierten en proyectos para la comunidad de Valparaíso.",source:"pulz"},
{n:"Ultra Pachamanka",d:"2026-09-12",l:"O'Higgins",c:["80K","50K","25K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Ultra Paine",d:"2026-09-26",l:"Torres del Paine, Magallanes",c:["50K","35K","21K","14K","5K"],t:"trail",w:"https://www.ultrapaine.com/",i:1,s:"c",desc:"12ª edición del primer evento de trail running en Torres del Paine y la Patagonia Austral (desde 2014). Paisajes panorámicos hacia las torres principales del macizo. Meta en Villa Río Serrano. Corredores de 50 países.",price:"USD 80 – 180",source:"pulz"},
// Octubre
{n:"Cascada Trail",d:"2026-10-03",l:"Santiago, Metropolitana",c:["30K","21K","12K","6K","3K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Viña del Mar",d:"2026-10-04",l:"Reñaca, Viña del Mar, Valparaíso",c:["42K","21K","10K"],t:"asfalto",w:"https://maratonvina.cl/",i:1,s:"c",desc:"Maratón costera con partida en Reñaca. Una de las maratones más icónicas de Chile con recorrido panorámico por el litoral de Viña del Mar.",source:"pulz"},
{n:"Corriendo entre Montañas",d:"2026-10-04",l:"Biobío",c:["21K","10K","6K","3K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Festival Vista Baker",d:"2026-10-17",l:"Cochrane, Aysén",c:["32K","21K","14K","7K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"STGO 10K (Fecha 4)",d:"2026-10-18",l:"Santiago, Metropolitana",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Noviembre
{n:"GTVUT Las Trancas",d:"2026-11-14",l:"Las Trancas, Ñuble",c:["50K","30K","18K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Columbia Trail Challenge Huilo Huilo",d:"2026-11-21",l:"Huilo Huilo, Los Ríos",c:["60K","45K","20K","10K","6K","2K"],t:"trail",w:"https://www.nimbusoutdoor.com/columbia-trail-challenge/",i:1,s:"c",desc:"Trail running por la Reserva Biológica Huilo Huilo, reconocida mundialmente por su biodiversidad. Parte del circuito Columbia Trail Challenge de Nimbus Outdoor.",source:"pulz"},
{n:"Maratón Pucón",d:"2026-11-22",l:"Pucón, Araucanía",c:["42K","21K","10K"],t:"asfalto",w:"https://triatletas.cl/runman-marathon-pucon-2026/",i:1,s:"c",desc:"Runman Marathon Pucón, maratón en el corazón de la zona lacustre de La Araucanía. Recorrido rodeado de volcanes y lagos con clima primaveral.",source:"pulz"},
// Diciembre
{n:"Vulcano Ultra Trail",d:"2026-12-06",l:"Parque Nacional Vicente Pérez Rosales, Los Lagos",c:["103K","55K","37K","21K","13K","9K"],t:"trail",w:"https://puelcheproducciones.com/spp/vulcano/",i:1,s:"c",desc:"El evento de trail running más emblemático de Chile y uno de los más reconocidos de Sudamérica. Recorrido por el Parque Nacional Vicente Pérez Rosales con opciones desde 9K hasta ultra de 103K.",source:"pulz"},
{n:"Media Maratón del Trueno",d:"2026-12-06",l:"Maule",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Mataquito",d:"2026-12-13",l:"Licantén, Maule",c:["42K","21K","11K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"}
],
brasil:[
// Janeiro
{n:"19ª Meia Maratona Int. de São Paulo",d:"2026-01-25",l:"Itaquera, São Paulo, SP",c:["21K","10K","5K"],t:"asfalto",w:"https://www.yescom.com.br/meiasp/2026/",i:1,s:"c",desc:"Meia maratona tradicional organizada pela Yescom com largada no Shopping Metrô Itaquera. Uma das maiores do Brasil.",source:"pulz"},
{n:"Trail Brasília",d:"2026-01-25",l:"São Sebastião, Brasília, DF",c:["7K","12K","21K","43K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
// Fevereiro
{n:"Corre Salvador Folia",d:"2026-02-01",l:"Salvador, BA",c:["6K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Março
{n:"Trail Mar de Minas",d:"2026-03-07",l:"Prados, MG",c:["10K","21K","35K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Meia Maratona do Recife",d:"2026-03-08",l:"Recife, PE",c:["21K","10K","5K"],t:"asfalto",w:"https://www.ticketsports.com.br/en/meia-maratona-do-recife-2026-72545",i:0,s:"c",source:"pulz"},
{n:"Santander Meia de Curita",d:"2026-03-08",l:"Curitiba, PR",c:["21K","10K","5K"],t:"asfalto",w:"https://globalvita.com.br/meiadecurita/",i:0,s:"c",desc:"Principal meia maratona de Curitiba com largada no Centro Cívico. Percurso desafiador com subidas e descidas por parques e ruas históricas.",source:"pulz"},
{n:"Maratona Meio do Mundo",d:"2026-03-14",l:"Macapá, AP",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona de Teresina",d:"2026-03-14",l:"Teresina, PI",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Salvador 10 Milhas",d:"2026-03-29",l:"Salvador, BA",c:["10Mi"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Circuito adidas MDR Curitiba",d:"2026-03-29",l:"Curitiba, PR",c:["12K","10K","6K","5K"],t:"asfalto",w:"https://www.godream.com.br/evento/circuito-adidas-mdr-curitiba-2026-3806584",i:0,s:"c",source:"pulz"},
// Abril
{n:"Maratona de Manaus",d:"2026-04-05",l:"Manaus, AM",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"30ª Maratona Int. de São Paulo",d:"2026-04-12",l:"São Paulo, SP",c:["42K","21K","10K","7K"],t:"asfalto",w:"https://www.yescom.com.br/maratonasp/2026/",i:1,s:"c",desc:"A maior e mais tradicional maratona do Brasil, na 30ª edição. Largada no Obelisco do Ibirapuera com percurso pelos principais pontos da cidade. Selo Gold da CBAt.",price:"R$ 250 – 450",source:"pulz"},
{n:"Maratona Int. de Fortaleza",d:"2026-04-12",l:"Fortaleza, CE",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonadefortaleza.com.br/",i:1,s:"c",desc:"Primeira maratona oficial de Fortaleza, celebrando os 300 anos da cidade. Percurso à beira-mar com clima tropical.",source:"pulz"},
{n:"Maratona de Cascavel",d:"2026-04-12",l:"Cascavel, PR",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Mountain Do Praia do Rosa",d:"2026-04-25",l:"Praia do Rosa, SC",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
{n:"21K Salvador",d:"2026-04-26",l:"Salvador, BA",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"26ª Meia Maratona Int. da Cidade de São Paulo",d:"2026-04-26",l:"São Paulo, SP",c:["21K","15K","5K"],t:"asfalto",w:"https://www.meiamaratonasaopaulo.com.br/",i:1,s:"c",desc:"Percurso inédito saindo do Obelisco do Ibirapuera em direção ao centro histórico. Uma das meias mais tradicionais do país.",source:"pulz"},
// Maio
{n:"Meia Maratona Int. de Florianópolis Oakberry",d:"2026-05-03",l:"Florianópolis, SC",c:["21K","10K","5K"],t:"asfalto",w:"https://www.ticketsports.com.br/en/meia-maratona-internacional-de-florianopolis-oakberry-2026-73962",i:0,s:"c",desc:"Largada na Beira Mar Norte com percurso à beira do mar. Uma das meias mais bonitas do Sul do Brasil.",source:"pulz"},
{n:"Desafio das Torres Brasília",d:"2026-05-03",l:"Brasília, DF",c:["21K"],t:"asfalto",w:"https://desafiodastorres.com.br/",i:0,s:"c",source:"pulz"},
{n:"1ª Maratona Oficial de Belo Horizonte",d:"2026-05-17",l:"Belo Horizonte, MG",c:["42K","5K"],t:"asfalto",w:"https://www.ticketsports.com.br/e/maratona-oficial-de-belo-horizonte-2026-74110",i:1,s:"c",desc:"Primeira maratona oficial de BH. Percurso de 42 km cruzando seis regionais da capital mineira, passando por ruas históricas e construções emblemáticas. Vila da Maratona no Parque Municipal.",price:"R$ 200 – 400",source:"pulz"},
{n:"ASICS Golden Run São Paulo",d:"2026-05-17",l:"Parque do Povo, São Paulo, SP",c:["21K","10K"],t:"asfalto",w:"https://asicsgoldenrun.com.br/",i:0,s:"c",source:"pulz"},
{n:"Corridas de Montanha Chapada dos Veadeiros",d:"2026-05-17",l:"Cavalcante, GO",c:["21K","14K","7K"],t:"trail",w:"https://minhasinscricoes.com.br/Evento/CORRIDASDEMONTANHA-CHAPADADOSVEADEIROS2026",i:0,s:"c",source:"pulz"},
{n:"Maratona Farol a Farol",d:"2026-05-24",l:"Salvador, BA",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:1,s:"c",desc:"A corrida de rua mais tradicional da Bahia. Percurso conectando os faróis da Barra e de Itapuã pela orla de Salvador.",source:"pulz"},
{n:"41ª Maratona Int. de Porto Alegre",d:"2026-05-31",l:"Porto Alegre, RS",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonadeportoalegre.com.br/",i:1,s:"c",desc:"A maratona mais antiga do Brasil na 41ª edição. Percurso plano pela orla do Guaíba com mais de R$ 530 mil em premiação. Uma das provas mais rápidas do país.",price:"R$ 180 – 350",source:"pulz"},
{n:"Corrida das Pontes do Recife",d:"2026-05-31",l:"Recife, PE",c:["21K","10K","5K"],t:"asfalto",w:"https://www.corridadaspontesdorecife.com.br/",i:1,s:"c",desc:"Corrida icônica passando pelas pontes históricas do Recife. 21ª edição da prova mais emblemática de Pernambuco.",source:"pulz"},
// Junho
{n:"Maratona do Rio de Janeiro",d:"2026-06-04",l:"Rio de Janeiro, RJ",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonadorio.com.br/",i:1,s:"c",desc:"A maratona mais famosa do Brasil, no feriado de Corpus Christi. Quatro dias de corrida com provas de 5K a 42K. Percurso pela orla carioca com vista para o Pão de Açúcar e Cristo Redentor. Selo World Athletics.",price:"R$ 300 – 600",source:"pulz"},
{n:"ASICS Run Challenge Belo Horizonte",d:"2026-06-14",l:"Belo Horizonte, MG",c:["15K","7K","4K"],t:"asfalto",w:"https://runchallenge.com.br/",i:0,s:"c",source:"pulz"},
{n:"Mountain Do Desafio Pedra Branca",d:"2026-06-14",l:"São José, SC",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
// Julho
{n:"ASICS Golden Run Rio de Janeiro",d:"2026-07-12",l:"Rio de Janeiro, RJ",c:["21K","10K"],t:"asfalto",w:"https://asicsgoldenrun.com.br/",i:0,s:"c",source:"pulz"},
{n:"Mountain Do Costão do Santinho",d:"2026-07-25",l:"Florianópolis, SC",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
{n:"Nike SP City Marathon",d:"2026-07-26",l:"São Paulo, SP",c:["42K","21K"],t:"asfalto",w:"https://iguanasports.com.br/products/sp-city-marathon-2026",i:1,s:"c",desc:"Maratona patrocinada pela Nike celebrando 10 anos. Percurso técnico passando por 18 bairros de São Paulo. Selo Gold CBAt e homologação World Athletics. Expo no Pavilhão da Bienal, Ibirapuera.",price:"R$ 280 – 500",source:"pulz"},
{n:"ASICS Run Challenge Brasília",d:"2026-07-27",l:"Brasília, DF",c:["15K","7K","4K"],t:"asfalto",w:"https://runchallenge.com.br/",i:0,s:"c",source:"pulz"},
// Agosto
{n:"LIVE!42K Brasília",d:"2026-08-02",l:"Brasília, DF",c:["42K","21K"],t:"asfalto",w:"https://www.liverun.com.br/etapa/live42k-brasilia",i:1,s:"c",desc:"Maratona com largada na Esplanada dos Ministérios ao amanhecer. Percurso monumental passando pelos principais cartões-postais da capital federal.",source:"pulz"},
{n:"ASICS Run Challenge Fortaleza",d:"2026-08-02",l:"Fortaleza, CE",c:["15K","7K","4K"],t:"asfalto",w:"https://runchallenge.com.br/",i:0,s:"c",source:"pulz"},
{n:"Mountain Do Selva Amazônica",d:"2026-08-08",l:"Amapá, AP",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
{n:"28ª Meia Maratona Int. do Rio",d:"2026-08-16",l:"Rio de Janeiro, RJ",c:["21K","10K","5K"],t:"asfalto",w:"https://www.yescom.com.br/meiadorio/2026/",i:1,s:"c",desc:"Uma das meias mais tradicionais do Brasil, organizada pela Yescom. Percurso pela orla carioca com entrega de kits na Marina da Glória.",source:"pulz"},
{n:"Maratona FILA",d:"2026-08-23",l:"Cidade Universitária USP, São Paulo, SP",c:["42K","21K"],t:"asfalto",w:"https://www.fila.com.br/maratona",i:0,s:"c",desc:"Maratona na Cidade Universitária da USP. Formato individual (42K) ou em equipes (duplas de 21K ou quartetos de 10,5K).",price:"R$ 234",source:"pulz"},
{n:"Mountain Do Campos do Jordão",d:"2026-08-23",l:"Campos do Jordão, SP",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
{n:"Maratona Int. de Floripa Fibra",d:"2026-08-30",l:"Florianópolis, SC",c:["42K","21K","5K"],t:"asfalto",w:"https://www.ticketsports.com.br/e/maratona-internacional-de-floripa-fibra-2026-72611",i:1,s:"c",desc:"Uma das maratonas mais rápidas do Brasil com percurso 80% plano ao nível do mar. Infraestrutura de alto nível em Florianópolis.",price:"R$ 250 – 450",source:"pulz"},
// Setembro
{n:"Mountain Do Fernando de Noronha",d:"2026-09-05",l:"Fernando de Noronha, PE",c:["21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:1,s:"c",desc:"Trail run no paraíso brasileiro de Fernando de Noronha. Percurso por trilhas com vistas deslumbrantes do arquipélago.",source:"pulz"},
{n:"ASICS Run Challenge Salvador",d:"2026-09-13",l:"Salvador, BA",c:["15K","7K","4K"],t:"asfalto",w:"https://runchallenge.com.br/",i:0,s:"c",source:"pulz"},
{n:"Maratona de Niterói",d:"2026-09-14",l:"Niterói, RJ",c:["42K","15K","6K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Paraty Brazil by UTMB",d:"2026-09-19",l:"Paraty, RJ",c:["108K","58K","34K","25K","7K"],t:"trail",w:"https://paraty.utmb.world/",i:1,s:"c",desc:"Etapa brasileira do circuito UTMB World Series. Ultra trail pela Serra da Bocaina com percursos de 7K a 108K entre mata atlântica, praias e montanhas de Paraty.",price:"R$ 200 – 900",source:"pulz"},
{n:"ASICS Run Challenge Recife",d:"2026-09-20",l:"Recife, PE",c:["15K","7K","4K"],t:"asfalto",w:"https://runchallenge.com.br/",i:0,s:"c",source:"pulz"},
{n:"Maratona Salvador",d:"2026-09-27",l:"Salvador, BA",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.ticketsports.com.br/e/maratona-salvador-2026-74554",i:1,s:"c",desc:"Principal corrida de rua da Bahia com selo World Athletics. Dois dias de evento pela orla e centro histórico de Salvador.",price:"R$ 180 – 350",source:"pulz"},
// Outubro
{n:"Mountain Do Chapada dos Veadeiros",d:"2026-10-31",l:"Alto Paraíso de Goiás, GO",c:["42K","21K","10K","5K"],t:"trail",w:"https://mountaindo.com.br/",i:0,s:"c",source:"pulz"},
// Novembro
{n:"Ultra Trail Chapada Diamantina",d:"2026-11-21",l:"Mucugê, BA",c:["82K","65K","45K","22K","15K","7K"],t:"trail",w:"https://www.ticketsports.com.br/en/ultra-trail-chapada-diamantina-2026-74480",i:1,s:"c",desc:"A primeira ultramaratona de montanha da Bahia. Percurso desafiador com singletracks, travessias de rios, cachoeiras e campos de pedra pelo centro histórico de Mucugê, patrimônio do IPHAN.",price:"R$ 250 – 600",source:"pulz"},
{n:"Maratona Monumental de Brasília",d:"2026-11-22",l:"Brasília, DF",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.maratonamonumentalbsb.com.br/",i:1,s:"c",desc:"Maratona passando pelos principais monumentos da capital federal. Uma das únicas maratonas do mundo inteiramente dentro de uma cidade Patrimônio da UNESCO. Largada na Esplanada dos Ministérios.",price:"R$ 200 – 400",source:"pulz"},
// Dezembro
{n:"27ª Volta Int. da Pampulha",d:"2026-12-06",l:"Belo Horizonte, MG",c:["18K"],t:"asfalto",w:"https://www.yescom.com.br/voltadapampulha/2026/",i:1,s:"c",desc:"Corrida clássica de 18K ao redor da Lagoa da Pampulha em Belo Horizonte. Largada e chegada no Mineirão. Uma das provas mais tradicionais de Minas Gerais.",source:"pulz"},
{n:"101ª Corrida Int. de São Silvestre",d:"2026-12-31",l:"São Paulo, SP",c:["15K"],t:"asfalto",w:"https://www.saosilvestre.com.br/",i:1,s:"c",desc:"A corrida de rua mais icônica do Brasil e uma das mais tradicionais do mundo, na 101ª edição. 15 km pela região central de São Paulo na manhã de 31 de dezembro.",price:"R$ 358",source:"pulz"}
],
uruguay:[
// Marzo
{n:"Montevideo Beach Run",d:"2026-03-14",l:"Montevideo",c:["15K","8K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Ironman 70.3 Punta del Este",d:"2026-03-15",l:"Punta del Este, Maldonado",c:["Triatlón"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corré Montevideo",d:"2026-03-29",l:"Montevideo",c:["21K","10K","5K"],t:"asfalto",w:"https://prodeporte.com.uy/corremontevideo/",i:0,s:"c",source:"pulz"},
// Abril
{n:"Wine Run",d:"2026-04-03",l:"Maldonado",c:["21K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Carrera Teletón",d:"2026-04-12",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón de Piriápolis",d:"2026-04-12",l:"Piriápolis, Maldonado",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"30K Montevideo",d:"2026-04-19",l:"Montevideo",c:["30K","15K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Desafío Campanero",d:"2026-04-26",l:"Lavalleja",c:["27K","18K","9K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Mayo
{n:"50K San José",d:"2026-05-01",l:"San José",c:["50K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Montevideo",d:"2026-05-10",l:"Montevideo",c:["42K","21K","10K"],t:"asfalto",w:"https://montevideo.gub.uy/maraton-montevideo-2026",i:1,s:"c",desc:"Certificada por World Athletics. Recorrido por más de 25 barrios icónicos de Montevideo, desde el Palacio Legislativo hasta el Parque Rodó. Combina costanera, sitios históricos y energía urbana.",source:"pulz"},
{n:"UTDS Ultra Trail de la Sierra",d:"2026-05-24",l:"Maldonado",c:["Ultra"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Junio
{n:"Cerros de San Juan Trail",d:"2026-06-07",l:"Colonia",c:["21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón de Colonia",d:"2026-06-28",l:"Colonia del Sacramento, Colonia",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Agosto
{n:"Half Marathon Montevideo",d:"2026-08-09",l:"Montevideo",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corre Bosco",d:"2026-08-16",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",desc:"Carrera solidaria Talleres Don Bosco. Tradicional en Montevideo.",source:"pulz"},
// Septiembre
{n:"Maratón de Punta del Este",d:"2026-09-06",l:"Punta del Este, Maldonado",c:["42K","21K","10K","5K","2K"],t:"asfalto",w:"https://maratondepuntadeleste.com.uy/",i:1,s:"c",desc:"17.ª edición. La distancia reina en la ciudad más linda. Premios de más de USD 6.000. Kit delivery en Enjoy Punta del Este Casino & Resort.",source:"pulz"},
{n:"Villa Serrana Trail",d:"2026-09-13",l:"Villa Serrana, Lavalleja",c:["21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Enfoque Bimbo",d:"2026-09-27",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Octubre
{n:"Hombre de Hierro",d:"2026-10-25",l:"Cerro Largo",c:["60K","30K","7K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Noviembre
{n:"San Felipe y Santiago de Montevideo",d:"2026-11-14",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",desc:"Carrera conmemorativa de la fundación de Montevideo.",source:"pulz"},
{n:"Media Maratón de Fray Bentos",d:"2026-11-22",l:"Fray Bentos, Río Negro",c:["21K","7K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Montevideo 15K",d:"2026-11-29",l:"Montevideo",c:["21K","15K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Diciembre
{n:"Ultra Maua",d:"2026-12-06",l:"Cerro Largo",c:["45K","25K","7K"],t:"trail",w:"",i:0,s:"c",source:"pulz"}
],
colombia:[
// Febrero
{n:"Media Maratón del Mar",d:"2026-02-22",l:"Cartagena, Bolívar",c:["21K","10K","5K"],t:"asfalto",w:"https://mediamaratondelmar.com/",i:1,s:"c",desc:"Considerada la carrera más bonita de Colombia. El recorrido cruza el puerto de Cartagena y atraviesa la ciudad amurallada al amanecer, con vistas al Caribe.",price:"COP 140.000 / USD 35",source:"pulz"},
{n:"Carrera de las Rosas",d:"2026-02-22",l:"Barranquilla, Atlántico",c:["21K","10K","5K"],t:"asfalto",w:"https://carreradelasrosas.com/barranquilla/",i:0,s:"c",source:"pulz"},
// Marzo
{n:"Carrera Farmatodo",d:"2026-03-01",l:"Bogotá D.C.",c:["12K","6K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Internacional de Barranquilla",d:"2026-03-15",l:"Barranquilla, Atlántico",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.maratonbarranquilla.com/",i:1,s:"c",desc:"Décima edición de la maratón que reúne 10.000 corredores. Recorrido que incluye el Ecoparque Ciénaga de Mallorquín y las playas de Puerto Mocho.",source:"pulz"},
{n:"Media Maratón del Huila",d:"2026-03-15",l:"Neiva, Huila",c:["21K","12K","6K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corre por Amor",d:"2026-03-15",l:"Medellín, Antioquia",c:["12K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Carrera Verde Cali",d:"2026-03-15",l:"Cali, Valle del Cauca",c:["10K","5K","2K"],t:"asfalto",w:"https://carreraverdecolombia.com/",i:0,s:"c",source:"pulz"},
{n:"Media Maratón del Quindío",d:"2026-03-22",l:"Armenia, Quindío",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Internacional Metropolitana de Cúcuta",d:"2026-03-22",l:"Cúcuta, Norte de Santander",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratoncucutametropolitana.com/",i:1,s:"c",desc:"Primera maratón de 42 kilómetros del oriente colombiano, certificada por World Athletics. Incluye el Campeonato Nacional de Ruta.",source:"pulz"},
{n:"Media Maratón de Pasto",d:"2026-03-22",l:"Pasto, Nariño",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Night Race 10K",d:"2026-03-22",l:"Bogotá D.C.",c:["10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Abril
{n:"Carrera Verde Bogotá",d:"2026-04-19",l:"Bogotá D.C.",c:["10K","5K","3K"],t:"asfalto",w:"https://carreraverdecolombia.com/",i:0,s:"c",desc:"XI edición. Combina deporte con acción ambiental. Parque Simón Bolívar. Incluye feria ambiental con más de 35 iniciativas sostenibles.",source:"pulz"},
{n:"Corre Mi Tierra Medellín",d:"2026-04-19",l:"Medellín, Antioquia",c:["21K","15K","10K","5K"],t:"asfalto",w:"https://corremitierra.com/",i:0,s:"c",source:"pulz"},
{n:"Vuelta Atlética Isla San Andrés",d:"2026-04-26",l:"San Andrés Isla",c:["32K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Mayo
{n:"Quindío Trail Colombia by UTMB",d:"2026-05-02",l:"Buenavista, Quindío",c:["122K","84K","52K","24K","14K"],t:"trail",w:"https://quindio.utmb.world/",i:1,s:"c",desc:"Parte del circuito mundial UTMB. Recorrido por el corazón del Eje Cafetero atravesando 12 municipios del Quindío, entre cafetales, bosques de niebla y paisaje cultural cafetero (Patrimonio UNESCO).",source:"pulz"},
{n:"Maratón de Cali",d:"2026-05-03",l:"Cali, Valle del Cauca",c:["42K","15K","4.2K"],t:"asfalto",w:"https://maratondecali.co/",i:1,s:"c",desc:"Primera maratón de América Latina con Sello Élite de World Athletics. La Capital de la Salsa vibra con un ambiente festivo único en las calles históricas de Cali.",source:"pulz"},
{n:"Silvia Trail Ancestral",d:"2026-05-19",l:"Silvia, Cauca",c:["42K","21K","13K","7K"],t:"trail",w:"https://www.montanaancestral.com/silviatrail/",i:0,s:"e",desc:"Carrera de montaña por territorio Misak-Guambiano. Ruta llena de historia y sabiduría ancestral en los Andes del Cauca.",source:"pulz"},
{n:"Carrera de las Rosas Bogotá",d:"2026-05-24",l:"Bogotá D.C.",c:["15K","10K","5K"],t:"asfalto",w:"https://carreradelasrosas.com/",i:0,s:"c",source:"pulz"},
// Junio
{n:"Maratón Dulima",d:"2026-06-07",l:"Ibagué, Tolima",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Córdoba",d:"2026-06-07",l:"Montería, Córdoba",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón de Cali",d:"2026-06-28",l:"Cali, Valle del Cauca",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Julio
{n:"Media Maratón de Floridablanca",d:"2026-07-05",l:"Floridablanca, Santander",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Chicamocha Canyon Race",d:"2026-07-17",l:"San Gil, Santander",c:["100Mi","80K","42K","21K"],t:"trail",w:"https://chicamochacanyonrace.com/",i:1,s:"c",desc:"14.ª edición. 4 días y 3 noches de competencia non-stop. Más de 1.200 corredores de distintas nacionalidades recorren 10 municipios de Santander. Votada mejor carrera trail de Colombia en 2024.",source:"pulz"},
{n:"Ultra Valle de Tenza",d:"2026-07-23",l:"Guateque, Boyacá",c:["79K","43K","21K","9K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Media Maratón de Bogotá",d:"2026-07-26",l:"Bogotá D.C.",c:["21K","10K"],t:"asfalto",w:"https://www.mediamaratonbogota.com/",i:1,s:"c",desc:"La carrera atlética #1 de Colombia. Sello Platinum de World Athletics. 40.000 corredores a 2.600 msnm. Conocida como 'El Monstruo'.",source:"pulz"},
// Agosto
{n:"10K La Carrera del Pacífico",d:"2026-08-09",l:"Cali, Valle del Cauca",c:["10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Ciudad Bonita",d:"2026-08-16",l:"Bucaramanga, Santander",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Septiembre
{n:"Carrera de la Mujer",d:"2026-09-06",l:"Bogotá D.C.",c:["10K","8K","4K","2K"],t:"asfalto",w:"",i:1,s:"c",desc:"Una de las carreras femeninas más importantes de América Latina.",source:"pulz"},
{n:"Maratón de Medellín",d:"2026-09-06",l:"Medellín, Antioquia",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonmedellin.com/",i:1,s:"c",desc:"La maratón pionera de los 42K en Colombia. Certificada por AIMS y clasificatoria para Boston. Clima primaveral a 1.500 msnm. Salida y meta en Parques del Río.",source:"pulz"},
{n:"Ultra La Mesa 'Ruta de Los Miradores'",d:"2026-09-27",l:"La Mesa, Cundinamarca",c:["55K","22K","10K","3K"],t:"trail",w:"https://www.ultralamesa.com/",i:0,s:"e",source:"pulz"},
{n:"Bimbo Global Race",d:"2026-09-27",l:"Bogotá D.C.",c:["10K","5K"],t:"asfalto",w:"https://www.bimboglobalracecolombia.com/",i:0,s:"c",source:"pulz"},
// Octubre
{n:"Media Maratón del Café",d:"2026-10-04",l:"Pereira, Risaralda",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón del Meta",d:"2026-10-04",l:"Villavicencio, Meta",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Frontera Endurance Run",d:"2026-10-06",l:"Jardín, Antioquia",c:["55K","21K","12K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Media Maratón de Bucaramanga FCV",d:"2026-10-18",l:"Bucaramanga, Santander",c:["21K","10.5K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
// Noviembre
{n:"Media Maratón Internacional de Cúcuta",d:"2026-11-15",l:"Cúcuta, Norte de Santander",c:["21K","10K","5K"],t:"asfalto",w:"https://www.mediamaratoncucuta.com/",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Bambuquera",d:"2026-11-22",l:"Neiva, Huila",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corre Mi Tierra Bogotá",d:"2026-11-22",l:"Bogotá D.C.",c:["21K","15K","10K","5K"],t:"asfalto",w:"https://corremitierra.com/",i:0,s:"c",source:"pulz"},
{n:"42K VChallenges Maratón Bogotá",d:"2026-11-29",l:"Bogotá D.C.",c:["42K","21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Del Mar a La Cima",d:"2026-11-30",l:"Santa Marta, Magdalena",c:["110K","81.5K","41.6K","24.5K","12K"],t:"trail",w:"https://delmaralacima.com/",i:1,s:"e",desc:"La carrera de montaña más exótica del planeta. Desde la playa hasta la Sierra Nevada de Santa Marta, la montaña costera más alta del mundo.",source:"pulz"}
],
peru:[
// Enero
{n:"Maratón Internacional de Lambayeque",d:"2026-01-25",l:"Lambayeque",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Ultra Kuélap",d:"2026-01-31",l:"Luya, Amazonas",c:["Ultra","42K","21K"],t:"trail",w:"",i:0,s:"e",desc:"Trail en la región de la fortaleza de Kuélap, en la selva alta de Amazonas.",source:"pulz"},
// Febrero
{n:"Media Maratón de Trujillo",d:"2026-02-08",l:"Trujillo, La Libertad",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Desafío Chilina",d:"2026-02-08",l:"Cayma, Arequipa",c:["21K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Marzo
{n:"Carrera de Mujeres Perú",d:"2026-03-08",l:"Miraflores, Lima",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Int. Virgen de la Candelaria de Cayma",d:"2026-03-15",l:"Cayma, Arequipa",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",desc:"XXXIX edición. Una de las maratones más tradicionales de Arequipa.",source:"pulz"},
{n:"Lima Ultramaratón",d:"2026-03-27",l:"Lima",c:["Ultra"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Lachay Trail",d:"2026-03-29",l:"Huaral, Lima",c:["21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
// Abril
{n:"Andes Trail Peru",d:"2026-04-05",l:"Písac, Cusco",c:["42K","21K","10K"],t:"trail",w:"",i:0,s:"c",desc:"Trail running por el Valle Sagrado de los Incas, Písac.",source:"pulz"},
{n:"Gorilla Trail Chiguata",d:"2026-04-12",l:"Chiguata, Arequipa",c:["42K","21K","10K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Inca Trail",d:"2026-04-19",l:"Cusco",c:["42K","30K"],t:"trail",w:"",i:0,s:"c",desc:"Trail running por los caminos incas en la región de Cusco.",source:"pulz"},
// Mayo
{n:"Sierra Andina - Chavín Trail",d:"2026-05-03",l:"Huaraz, Áncash",c:["43.7K","21.4K","12.6K"],t:"trail",w:"https://sierraandinaoutdoors.com",i:1,s:"c",desc:"Trail por senderos ancestrales de Chavín de Huántar en la Cordillera Blanca. Paso de montaña Punta Yanashallah a 4.700 msnm.",source:"pulz"},
{n:"Wings for Life World Run Lima",d:"2026-05-10",l:"Lima",c:["Open"],t:"asfalto",w:"https://www.wingsforlifeworldrun.com/en/locations/lima",i:0,s:"c",desc:"Carrera global donde todos arrancan al mismo tiempo. El 100% de las inscripciones se destina a investigación de lesiones de médula espinal.",source:"pulz"},
{n:"Inca Wildmarathon",d:"2026-05-24",l:"Machu Picchu Pueblo, Cusco",c:["42K","21K","10K"],t:"trail",w:"https://wildmarathon.com/inca-marathon-3/",i:1,s:"c",desc:"Carrera trail de 6 días entre los valles de Salkantay y Machu Picchu. Incluye programa de aclimatación, alojamiento y comidas.",price:"USD 2.290 – 2.490",source:"pulz"},
{n:"Maratón adidas Rímac Lima 42K",d:"2026-05-24",l:"Lima",c:["42K","21K"],t:"asfalto",w:"https://lima42k.com.pe/",i:1,s:"c",desc:"La maratón más grande del Perú. Organizada por adidas y Rímac.",source:"pulz"},
// Junio
{n:"Ultra Machu Picchu Qhapac Ñan",d:"2026-06-20",l:"Cusco",c:["103K","65K","42K","21K"],t:"trail",w:"https://ultramachupicchu.com/",i:1,s:"c",desc:"Ultramaratón de alta montaña inspirada en el Qhapaq Ñan (sistema vial inca). Senderos ancestrales, bosques nublados, lagunas cristalinas y terrazas de Chinchero. 5.808 m+ de desnivel.",price:"desde USD 259",source:"pulz"},
// Julio
{n:"Maratón Internacional de Pacasmayo",d:"2026-07-05",l:"Pacasmayo, La Libertad",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",desc:"Conocida como 'La maratón más dura del Perú'. Combina vistas del Pacífico, caminos de tierra y desierto.",source:"pulz"},
{n:"Machu Picchu Trail Adventure",d:"2026-07-05",l:"Cusco",c:["126K","97K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Sierra Andina Mountain Trail",d:"2026-07-19",l:"Huamachuco, La Libertad",c:["48.1K","30.8K","15.4K"],t:"trail",w:"https://sierraandinaoutdoors.com",i:0,s:"e",source:"pulz"},
// Agosto
{n:"KIA Media Maratón de Lima & 10K",d:"2026-08-23",l:"Lima",c:["21K","10K"],t:"asfalto",w:"https://mediamaratondelima.com.pe/",i:1,s:"c",desc:"117.ª edición. La media maratón más antigua del mundo. Sale de la Plaza de Armas de Lima y termina en el Circuito Mágico del Agua. 23.000 corredores.",source:"pulz"},
{n:"Inca Trail Marathon",d:"2026-08-24",l:"Machu Picchu, Cusco",c:["42K","21K"],t:"trail",w:"https://www.eriksadventures.com/inca-trail-marathon-race-to-machu-picchu-peru/",i:1,s:"c",desc:"Maratón oficial por el Camino Inca hasta Machu Picchu. 26.2 millas por senderos ancestrales a más de 4.200 msnm.",source:"pulz"},
// Diciembre
{n:"Marcona Wind Trail",d:"2026-12-06",l:"San Juan de Marcona, Ica",c:["100K","65K","42K","35K","21K","10K"],t:"trail",w:"https://www.marconawindtrail.com/",i:1,s:"c",desc:"Séptima edición en la capital del viento. Una hora al sur de Nasca. Distancias desde 10K hasta 100K con carrera nocturna de 35K.",source:"pulz"}
],
mexico:[
// — Enero —
{n:"Maratón de Mérida Banorte",d:"2026-01-04",l:"Mérida, Yucatán",c:["42K","21K","10K","3K"],t:"asfalto",w:"https://marathonmerida.dashport.run",i:0,s:"c",desc:"Maratón insignia del sureste mexicano. Organizado por el Gobierno de Yucatán e IDEY.",source:"pulz"},
// — Febrero —
{n:"UTMX Desafío en las Nubes",d:"2026-02-21",l:"Xicotepec de Juárez, Puebla",c:["Trail"],t:"trail",w:"https://utmex.com",i:1,s:"c",desc:"Primera fecha del circuito Ultra-Trail® de México 2026 en la sierra norte poblana.",source:"pulz"},
{n:"Maratón Internacional Guadalajara Electrolit",d:"2026-02-22",l:"Guadalajara, Jalisco",c:["42K","21K"],t:"asfalto",w:"http://www.maratonguadalajara.org",i:1,s:"c",desc:"40ª edición. Cupo de 23.000 corredores agotado. Una de las maratones más tradicionales de México.",source:"pulz"},
{n:"Ultra Caballo Blanco",d:"2026-02-28",l:"Urique, Barrancas del Cobre, Chihuahua",c:["100M","80K","42K","21K"],t:"trail",w:"https://www.coppercanyons.com",i:1,s:"c",desc:"La carrera más mítica de México. Honra a los Rarámuri y a Micah True. +1.200 corredores de 20 países en la Sierra Tarahumara.",source:"pulz"},
// — Marzo —
{n:"Maratón Internacional Lala",d:"2026-03-01",l:"Torreón, Coahuila",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonlala.org",i:1,s:"c",desc:"37ª edición. Maratón insignia de la región Lagunera, organizado por Grupo LALA.",source:"pulz"},
{n:"Bonafont 5K Mujeres",d:"2026-03-15",l:"Paseo de la Reforma, CDMX",c:["5K"],t:"asfalto",w:"",i:1,s:"c",desc:"La carrera de mujeres más grande del mundo, con ~36.000 corredoras sobre Reforma. Organizada por Bonafont (Danone) en alianza con ONU Mujeres.",source:"pulz"},
// — Abril —
{n:"21K Electrolit Monterrey",d:"2026-04-05",l:"Monterrey, Nuevo León",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"21K El Gigante de México",d:"2026-04-18",l:"Aguascalientes",c:["21K"],t:"asfalto",w:"https://www.agssports.com",i:0,s:"c",desc:"Medio maratón con miles de corredores en el marco de la Feria Nacional de San Marcos.",source:"pulz"},
// — Mayo —
{n:"Medio Maratón Internacional Tijuana",d:"2026-05-10",l:"Tijuana, Baja California",c:["21K","10K"],t:"asfalto",w:"https://tjrun.com.mx",i:0,s:"e",desc:"Edición con causa organizada por la Fundación Castro-Limón a beneficio de niños con cáncer.",source:"pulz"},
{n:"Medio Maratón Internacional Zapopan",d:"2026-05-17",l:"Zapopan, Jalisco",c:["21K"],t:"asfalto",w:"https://www.marcate.com.mx",i:1,s:"c",desc:"37ª edición. Avalado por la FMAA. Una de las medias maratones más prestigiosas del occidente mexicano.",source:"pulz"},
// — Julio —
{n:"Medio Maratón CDMX BBVA",d:"2026-07-26",l:"Ciudad de México",c:["21K"],t:"asfalto",w:"https://21k.cdmx.gob.mx",i:1,s:"c",desc:"Más de 30.000 corredores en una de las medias maratones más grandes de Latam. Organizado por INDEPORTE CDMX.",source:"pulz"},
// — Agosto —
{n:"UTMX Tepec Trail",d:"2026-08-08",l:"Zapotitlán Salinas, Puebla",c:["Trail"],t:"trail",w:"https://utmex.com",i:0,s:"c",desc:"Fecha del circuito UTMX en la Reserva de la Biósfera Tehuacán-Cuicatlán.",source:"pulz"},
{n:"Maratón CDMX Telcel",d:"2026-08-30",l:"Ciudad de México",c:["42K"],t:"asfalto",w:"https://maraton.cdmx.gob.mx",i:1,s:"c",desc:"~30.000 corredores. Maratón a 2.240 msnm, una de las más altas del mundo. Organizado por INDEPORTE CDMX.",source:"pulz"},
// — Octubre —
{n:"Querétaro Maratón",d:"2026-10-04",l:"Querétaro",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.queretaromaraton.com.mx",i:1,s:"c",desc:"~20.000 corredores. Avalado por la FMAA y la Asociación Queretana de Atletismo.",source:"pulz"},
// — Noviembre —
{n:"UTMX Travesía 3 Culturas",d:"2026-11-14",l:"Pantepec, Puebla",c:["Trail"],t:"trail",w:"https://utmex.com",i:1,s:"c",desc:"Cierre del circuito UTMX. Recorrido por territorio totonaco, otomí y nahua en la sierra norte poblana.",source:"pulz"},
// — Diciembre —
{n:"Maratón Powerade Monterrey",d:"2026-12-13",l:"Monterrey, Nuevo León",c:["42K"],t:"asfalto",w:"https://maratonmonterrey.mx",i:1,s:"c",desc:"Cupo de 10.000 corredores. Maratón emblemático del norte de México, organizado por Powerade.",source:"pulz"}
]
};


/* Fallback if Supabase fails — use hardcoded data */
function loadFallbackData(){
    if(typeof buildDD==='function')buildDD();
    if(activeCountry&&typeof buildCountryContent==='function')buildCountryContent(activeCountry);
}

/* ============================================
   SUPABASE DATA LOADER
   ============================================ */
async function loadRacesFromDB(){
    if(!sbClient) return;
    try {
        const {data:dbCountries,error:cErr}=await sbClient.from('countries').select('*').order('sort_order');
        if(!cErr&&dbCountries&&dbCountries.length>0){
            countries.length=0;
            dbCountries.forEach(c=>countries.push({id:c.id,code:c.code,name:c.name,name_en:c.name_en,name_pt:c.name_pt}));
        }
        const {data:races,error:rErr}=await sbClient.from('races').select('*').eq('moderation_status','approved').order('date');
        if(rErr) return;
        if(!races||races.length===0) return; /* No DB races — keep hardcoded fallback */
        const newR={};countries.forEach(c=>newR[c.id]=[]);
        races.forEach(race=>{const mapped=mapRaceFromDB(race);if(newR[race.country_id])newR[race.country_id].push(mapped);});
        R=newR; /* Only replace after successful build */
        /* races loaded from Supabase */
        if(typeof buildDD==='function')buildDD();
        if(typeof updateOrgStats==='function')updateOrgStats();
        if(activeCountry&&typeof buildCountryContent==='function')buildCountryContent(activeCountry);
    } catch(e){ /* Supabase load failed — using fallback data */ }
}

function mapRaceFromDB(row){
    return {_id:row.id,n:row.name,d:row.date,l:row.location,c:row.categories||[],t:row.type==='road'?'asfalto':'trail',w:row.website||'',i:row.is_iconic?1:0,s:row.status==='confirmed'?'c':'e',desc:row.description??null,price:row.price??null,source:row.source||'pulz',start_time:row.start_time??null,start_point:row.start_point??null,registration_url:row.registration_url??null,logo_url:row.logo_url??null,banner_url:row.banner_url??null,elevation_gain:row.elevation_gain??null,kit_description:row.kit_description??null,contact_email:row.contact_email??null,social_ig:row.social_ig??null,organizer_id:row.organizer_id??null,created_by:row.created_by??null,latitude:row.latitude??null,longitude:row.longitude??null,results_url:row.results_url??null};
}

/* ============================================
   FAVORITES
   ============================================ */
let favorites=[];
async function loadFavorites(){
    if(!sbClient||!currentUser){try{favorites=JSON.parse(localStorage.getItem('pulz_favs')||'[]');}catch(e){favorites=[];}return;}
    try{const{data,error}=await sbClient.from('favorites').select('race_id').eq('user_id',currentUser.id);if(!error&&data)favorites=data.map(f=>f.race_id);}catch(e){try{favorites=JSON.parse(localStorage.getItem('pulz_favs')||'[]');}catch(e2){favorites=[];}}
}
function isFavorite(favId){return favorites.includes(favId);}
async function toggleFav(favId){
    if(!currentUser){openAuthModal('signup');setTimeout(()=>{const sub=document.querySelector('.auth-subtitle');if(sub)sub.textContent=T[lang].favLogin;},120);return;}
    const idx=favorites.indexOf(favId);
    if(idx>-1){
        favorites.splice(idx,1);
        if(sbClient)sbClient.from('favorites').delete().eq('user_id',currentUser.id).eq('race_id',favId).then(({error})=>{if(error){favorites.push(favId);safeLS('pulz_favs',favorites);if(typeof showToast==='function')showToast(T[lang].favError||'Error al guardar','error');}}).catch(()=>{favorites.push(favId);safeLS('pulz_favs',favorites);});
    } else {
        favorites.push(favId);
        if(sbClient)sbClient.from('favorites').insert({user_id:currentUser.id,race_id:favId}).then(({error})=>{if(error){favorites=favorites.filter(id=>id!==favId);safeLS('pulz_favs',favorites);if(typeof showToast==='function')showToast(T[lang].favError||'Error al guardar','error');}}).catch(()=>{favorites=favorites.filter(id=>id!==favId);safeLS('pulz_favs',favorites);});
        if(typeof track==='function')track('add_favorite',{race_id:favId});
    }
    safeLS('pulz_favs',favorites);
    // Update fav count locally
    if(idx>-1){favCounts[favId]=Math.max(0,(favCounts[favId]||0)-1);}
    else{favCounts[favId]=(favCounts[favId]||0)+1;}
    if(activeCountry)renderRaces(activeCountry);
    // Update drawer button (icon + label) in place
    const drawerFavBtn=document.getElementById('drawerFavBtn');
    if(drawerFavBtn){
        const isFav=favorites.includes(favId);
        drawerFavBtn.classList.toggle('active',isFav);
        const t=typeof T!=='undefined'&&T[lang]?T[lang]:{};
        drawerFavBtn.innerHTML=`${isFav
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
        }<span>${isFav?(t.seasonAdded||'En mi temporada'):(t.seasonAdd||'Agregar a mi temporada')}</span>`;
    }
    document.querySelectorAll('.fav-btn').forEach(btn=>btn.classList.remove('fav-pop'));
    setTimeout(()=>{document.querySelectorAll('.fav-btn.fav-active').forEach(btn=>btn.classList.add('fav-pop'));},10);
    // Refresh the active profile section so stats and lists stay in sync
    if(document.body.classList.contains('profile-mode')&&typeof profileNav==='function'&&typeof _profileSection!=='undefined'){
        profileNav(_profileSection||'home');
    }
}

/* ============================================
   RACE CRUD
   ============================================ */
async function createRace(raceData){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    const isOrg=!!(currentUserOrg&&currentUserOrg.id);
    const payload={name:raceData.name,date:raceData.date,country_id:raceData.country_id,location:raceData.location,categories:raceData.categories,type:raceData.type,website:raceData.website||null,description:raceData.description||null,start_time:raceData.start_time||null,start_point:raceData.start_point||null,price:raceData.price||null,registration_url:raceData.registration_url||null,logo_url:raceData.logo_url||null,elevation_gain:raceData.elevation_gain||null,kit_description:raceData.kit_description||null,contact_email:raceData.contact_email||null,social_ig:raceData.social_ig||null,social_fb:raceData.social_fb||null,max_participants:raceData.max_participants||null,latitude:raceData.latitude||null,longitude:raceData.longitude||null,results_url:raceData.results_url||null,is_iconic:false,status:'confirmed',source:isOrg?'organizer':'community',created_by:currentUser.id,organizer_id:isOrg?currentUserOrg.id:null,moderation_status:isOrg?'approved':'pending'};
    const{data,error}=await sbClient.from('races').insert(payload).select().single();
    if(!error&&data){const mapped=mapRaceFromDB(data);if(R[data.country_id])R[data.country_id].push(mapped);if(activeCountry===data.country_id)buildCountryContent(activeCountry);}
    return{data,error};
}
async function updateRace(raceId,updates){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    const{data,error}=await sbClient.from('races').update(updates).eq('id',raceId).eq('created_by',currentUser.id).select().single();
    if(!error&&data){const mapped=mapRaceFromDB(data);if(R[data.country_id]){const idx=R[data.country_id].findIndex(r=>r._id===data.id);if(idx>-1)R[data.country_id][idx]=mapped;}if(activeCountry===data.country_id)buildCountryContent(activeCountry);}
    return{data,error};
}
async function deleteRace(raceId){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    const{error}=await sbClient.from('races').delete().eq('id',raceId).eq('created_by',currentUser.id);
    if(!error){for(const cid of Object.keys(R))R[cid]=R[cid].filter(r=>r._id!==raceId);if(activeCountry)buildCountryContent(activeCountry);}
    return{error};
}
/* ============================================
   FAVORITES COUNT (public)
   ============================================ */
let favCounts={};

async function loadFavCounts(){
    if(!sbClient)return;
    try{
        const{data,error}=await sbClient.rpc('get_favorites_count');
        if(!error&&data){
            favCounts={};
            data.forEach(r=>favCounts[r.race_id]=parseInt(r.fav_count,10)||0);
        }
    }catch(e){/* fav counts failed */}
}

function getFavCount(raceId){return favCounts[raceId]||0;}

/* ============================================
   RACE ALERTS
   ============================================ */
let alerts=[];
async function loadAlerts(){
    if(!sbClient||!currentUser){try{alerts=JSON.parse(localStorage.getItem('pulz_alerts')||'[]');}catch(e){alerts=[];}return;}
    try{const{data,error}=await sbClient.from('race_alerts').select('race_id').eq('user_id',currentUser.id);if(!error&&data)alerts=data.map(a=>a.race_id);}catch(e){try{alerts=JSON.parse(localStorage.getItem('pulz_alerts')||'[]');}catch(e2){alerts=[];}}
}
function isAlertActive(raceId){return alerts.includes(raceId);}
async function toggleAlert(raceId){
    if(!currentUser){openAuthModal('signup');return;}
    const idx=alerts.indexOf(raceId);
    if(idx>-1){
        alerts.splice(idx,1);
        if(sbClient)sbClient.from('race_alerts').delete().eq('user_id',currentUser.id).eq('race_id',raceId).then(({error})=>{if(error){alerts.push(raceId);safeLS('pulz_alerts',alerts);if(typeof showToast==='function')showToast(T[lang].favError||'Error al guardar','error');}}).catch(()=>{alerts.push(raceId);safeLS('pulz_alerts',alerts);});
        if(typeof showToast==='function')showToast(T[lang].alertOff||'Alerta desactivada','info');
    } else {
        alerts.push(raceId);
        if(sbClient)sbClient.from('race_alerts').insert({user_id:currentUser.id,race_id:raceId}).then(({error})=>{if(error){alerts=alerts.filter(id=>id!==raceId);safeLS('pulz_alerts',alerts);if(typeof showToast==='function')showToast(T[lang].favError||'Error al guardar','error');}}).catch(()=>{alerts=alerts.filter(id=>id!==raceId);safeLS('pulz_alerts',alerts);});
        if(typeof showToast==='function')showToast(T[lang].alertActive||'Alerta activa','success');
        if(typeof track==='function')track('set_alert',{race_id:raceId});
    }
    safeLS('pulz_alerts',alerts);
    // Update alert button in drawer
    const btn=document.getElementById('drawerAlertBtn');
    if(btn){
        const active=alerts.includes(raceId);
        btn.classList.toggle('alert-active',active);
        const span=btn.querySelector('span');
        if(span)span.textContent=active?(T[lang].alertActive||'Alerta activa'):(T[lang].alertActivate||'Activar alerta');
    }
}

/* ============================================
   TEAM RACES (Running Teams → Races)
   ============================================ */
let teamRaces=[];
async function loadTeamRaces(){
    if(!sbClient||!currentUser||currentProfile?.role!=='team'){try{teamRaces=JSON.parse(localStorage.getItem('pulz_team_races')||'[]');}catch(e){teamRaces=[];}return;}
    try{const{data,error}=await sbClient.from('team_races').select('race_id').eq('team_id',currentUser.id);if(!error&&data){teamRaces=data.map(tr=>tr.race_id);safeLS('pulz_team_races',teamRaces);}}catch(e){try{teamRaces=JSON.parse(localStorage.getItem('pulz_team_races')||'[]');}catch(e2){teamRaces=[];}}
}
function isTeamRace(raceId){return teamRaces.includes(raceId);}
async function toggleTeamRace(raceId){
    if(!currentUser||currentProfile?.role!=='team')return;
    const idx=teamRaces.indexOf(raceId);
    if(idx>-1){
        teamRaces.splice(idx,1);
        if(sbClient)sbClient.from('team_races').delete().eq('team_id',currentUser.id).eq('race_id',raceId).then(({error})=>{if(error){teamRaces.push(raceId);if(typeof showToast==='function')showToast(T[lang].favError||'Error','error');}}).catch(()=>{teamRaces.push(raceId);});
        if(typeof showToast==='function')showToast(T[lang].teamRemoved||'Carrera removida','info');
        if(typeof track==='function')track('team_race_removed',{race_id:raceId});
    } else {
        teamRaces.push(raceId);
        if(sbClient)sbClient.from('team_races').insert({team_id:currentUser.id,race_id:raceId}).then(({error})=>{if(error){teamRaces=teamRaces.filter(id=>id!==raceId);if(typeof showToast==='function')showToast(T[lang].favError||'Error','error');}}).catch(()=>{teamRaces=teamRaces.filter(id=>id!==raceId);});
        if(typeof showToast==='function')showToast(T[lang].teamGoing||'¡Vamos!','success');
        if(typeof track==='function')track('team_race_added',{race_id:raceId});
    }
    safeLS('pulz_team_races',teamRaces);
    // Update button in drawer
    const btn=document.getElementById('drawerTeamGoBtn');
    if(btn){
        const active=teamRaces.includes(raceId);
        btn.classList.toggle('team-going-active',active);
        btn.classList.toggle('is-remove',active);
        const span=btn.querySelector('span');
        if(span)span.textContent=active
            ?(T[lang].teamRaceRemoveBtn||'Quitar del calendario')
            :(T[lang].teamRaceAddBtn||'Agregar al calendario');
    }
}

/* ============================================
   TEAM QUERIES (for drawer)
   ============================================ */
async function getTeamsForRace(raceId){
    if(!sbClient||!raceId)return[];
    try{
        const{data,error}=await sbClient.from('team_races').select('team_id').eq('race_id',raceId);
        if(error||!data||!data.length)return[];
        const teamIds=data.map(tr=>tr.team_id);
        const{data:teams,error:tErr}=await sbClient.from('teams').select('id,handle,team_name,team_city,team_country,team_modality,team_instagram,team_contact,team_recruiting,avatar_url').in('id',teamIds);
        if(tErr||!teams)return[];
        return teams;
    }catch(e){return[];}
}

async function getTeamsInCity(city){
    if(!sbClient||!city)return[];
    try{
        // Extract first part of location (city name before comma)
        const cityName=city.split(',')[0].trim().replace(/[%_]/g,'');
        if(!cityName)return[];
        const{data,error}=await sbClient.from('teams').select('id,handle,team_name,team_city,team_country,team_modality,team_instagram,team_contact,team_recruiting,avatar_url').ilike('team_city','%'+cityName+'%');
        if(error||!data)return[];
        return data;
    }catch(e){return[];}
}

async function getTeamsByCountry(countryId){
    if(!sbClient||!countryId)return[];
    try{
        const{data,error}=await sbClient.from('teams').select('id,handle,team_name,team_city,team_country,team_modality,team_instagram,team_contact,team_recruiting,avatar_url').eq('team_country',countryId);
        if(error||!data)return[];
        return data;
    }catch(e){return[];}
}

async function getAllTeams(){
    if(!sbClient)return[];
    try{
        const{data,error}=await sbClient.from('teams').select('id,handle,team_name,team_city,team_country,team_modality,team_instagram,team_contact,team_recruiting,avatar_url').order('team_name');
        if(error||!data)return[];
        return data;
    }catch(e){return[];}
}

/* ============================================
   ORGANIZER QUERIES
   ============================================ */
async function getOrgsByCountry(countryId){
    if(!sbClient||!countryId)return[];
    try{
        const{data,error}=await sbClient.from('organizations').select('id,handle,org_name,org_website,org_country,org_social_ig,org_social_fb,org_logo_url,org_description').eq('org_country',countryId);
        if(error||!data)return[];
        // Mantener compat: `display_name` lo derivamos del org_name
        return data.map(o=>({...o,display_name:o.org_name}));
    }catch(e){return[];}
}

async function getAllOrgs(){
    if(!sbClient)return[];
    try{
        const{data,error}=await sbClient.from('organizations').select('id,handle,org_name,org_website,org_country,org_social_ig,org_social_fb,org_logo_url,org_description').order('org_name');
        if(error||!data)return[];
        return data.map(o=>({...o,display_name:o.org_name}));
    }catch(e){return[];}
}

/* ============================================
   MULTI-CONTEXT (cuenta unificada)
   El runner es la persona base. Puede admin múltiples teams (1:N) y una org (1:1).
   ============================================ */
let currentUserTeams = []; // array de teams donde el user es creator
let currentUserOrg = null; // organization donde el user es creator (1:1)

async function loadMyTeams(){
    if(!sbClient||!currentUser){currentUserTeams=[];return[];}
    try{
        const{data,error}=await sbClient.from('teams').select('*').eq('creator_id',currentUser.id).order('created_at',{ascending:true});
        if(error||!data){currentUserTeams=[];return[];}
        currentUserTeams=data;
        return data;
    }catch(e){currentUserTeams=[];return[];}
}

async function loadMyOrganization(){
    if(!sbClient||!currentUser){currentUserOrg=null;return null;}
    try{
        const{data,error}=await sbClient.from('organizations').select('*').eq('creator_id',currentUser.id).maybeSingle();
        if(error||!data){currentUserOrg=null;return null;}
        currentUserOrg=data;
        // Compat con código viejo que lee display_name
        currentUserOrg.display_name=data.org_name;
        return currentUserOrg;
    }catch(e){currentUserOrg=null;return null;}
}

async function loadTeamById(teamId){
    if(!sbClient||!teamId)return null;
    try{
        const{data,error}=await sbClient.from('teams').select('*').eq('id',teamId).maybeSingle();
        if(error||!data)return null;
        return data;
    }catch(e){return null;}
}

async function loadOrganizationById(orgId){
    if(!sbClient||!orgId)return null;
    try{
        const{data,error}=await sbClient.from('organizations').select('*').eq('id',orgId).maybeSingle();
        if(error||!data)return null;
        return {...data,display_name:data.org_name};
    }catch(e){return null;}
}

async function loadTeamByHandle(handle){
    if(!sbClient||!handle)return null;
    try{
        const{data,error}=await sbClient.from('teams').select('*').eq('handle',handle).maybeSingle();
        if(error||!data)return null;
        return data;
    }catch(e){return null;}
}

async function loadOrganizationByHandle(handle){
    if(!sbClient||!handle)return null;
    try{
        const{data,error}=await sbClient.from('organizations').select('*').eq('handle',handle).maybeSingle();
        if(error||!data)return null;
        return {...data,display_name:data.org_name};
    }catch(e){return null;}
}

async function createTeam(teamData){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    const payload={...teamData,creator_id:currentUser.id};
    const{data,error}=await sbClient.from('teams').insert(payload).select().single();
    if(!error&&data){
        currentUserTeams=[...(currentUserTeams||[]),data];
    }
    return{data,error};
}

async function updateTeam(teamId,updates){
    if(!sbClient||!currentUser||!teamId)return{error:'Not authenticated'};
    const{data,error}=await sbClient.from('teams').update(updates).eq('id',teamId).eq('creator_id',currentUser.id).select().single();
    if(!error&&data){
        currentUserTeams=(currentUserTeams||[]).map(t=>t.id===teamId?data:t);
    }
    return{data,error};
}

async function deleteTeam(teamId){
    if(!sbClient||!currentUser||!teamId)return{error:'Not authenticated'};
    const{error}=await sbClient.from('teams').delete().eq('id',teamId).eq('creator_id',currentUser.id);
    if(!error){
        currentUserTeams=(currentUserTeams||[]).filter(t=>t.id!==teamId);
    }
    return{error};
}

async function createOrganization(orgData){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    if(currentUserOrg)return{error:'Ya tenés una organización registrada'};
    const payload={...orgData,creator_id:currentUser.id};
    const{data,error}=await sbClient.from('organizations').insert(payload).select().single();
    if(!error&&data){
        currentUserOrg={...data,display_name:data.org_name};
    }
    return{data,error};
}

async function updateOrganization(updates){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    if(!currentUserOrg)return{error:'No tenés organización'};
    const{data,error}=await sbClient.from('organizations').update(updates).eq('id',currentUserOrg.id).eq('creator_id',currentUser.id).select().single();
    if(!error&&data){
        currentUserOrg={...data,display_name:data.org_name};
    }
    return{data,error};
}

async function deleteOrganization(){
    if(!sbClient||!currentUser||!currentUserOrg)return{error:'No hay organización'};
    const{error}=await sbClient.from('organizations').delete().eq('id',currentUserOrg.id).eq('creator_id',currentUser.id);
    if(!error){currentUserOrg=null;}
    return{error};
}

/* Validación de handle disponible (cross-tabla: profiles.username + teams.handle + organizations.handle) */
async function checkHandleAvailable(handle){
    if(!sbClient||!handle)return{available:false,reason:'invalid'};
    const norm=(handle||'').toLowerCase().trim();
    if(!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(norm))return{available:false,reason:'format'};
    try{
        const[p,t,o]=await Promise.all([
            sbClient.from('profiles').select('id').eq('username',norm).maybeSingle(),
            sbClient.from('teams').select('id').eq('handle',norm).maybeSingle(),
            sbClient.from('organizations').select('id').eq('handle',norm).maybeSingle()
        ]);
        if(p.data||t.data||o.data)return{available:false,reason:'taken'};
        return{available:true};
    }catch(e){return{available:false,reason:'error'};}
}

/* ============================================
   TEAM MEMBERSHIPS (Runner ↔ Team)
   Two-state model: a runner postulates (status=pending), the team approves
   (status=member). teamFollows now holds confirmed memberships; teamPendings
   holds postulations awaiting team approval.
   ============================================ */
let teamFollows=(function(){try{return JSON.parse(localStorage.getItem('pulz_team_follows')||'[]');}catch(e){return[];}})();
let teamPendings=(function(){try{return JSON.parse(localStorage.getItem('pulz_team_pendings')||'[]');}catch(e){return[];}})();

async function loadTeamFollows(){
    if(!sbClient||!currentUser){
        try{teamFollows=JSON.parse(localStorage.getItem('pulz_team_follows')||'[]');}catch(e){teamFollows=[];}
        try{teamPendings=JSON.parse(localStorage.getItem('pulz_team_pendings')||'[]');}catch(e){teamPendings=[];}
        return;
    }
    try{
        const{data,error}=await sbClient.from('team_members').select('team_id,status').eq('user_id',currentUser.id).in('status',['member','pending']);
        if(!error&&data){
            teamFollows=data.filter(r=>r.status==='member').map(r=>r.team_id);
            teamPendings=data.filter(r=>r.status==='pending').map(r=>r.team_id);
            safeLS('pulz_team_follows',teamFollows);
            safeLS('pulz_team_pendings',teamPendings);
        }
    }catch(e){
        try{teamFollows=JSON.parse(localStorage.getItem('pulz_team_follows')||'[]');}catch(e2){teamFollows=[];}
        try{teamPendings=JSON.parse(localStorage.getItem('pulz_team_pendings')||'[]');}catch(e2){teamPendings=[];}
    }
}

function isFollowingTeam(teamId){return teamFollows.includes(teamId);}
function hasPendingTeamApplication(teamId){return teamPendings.includes(teamId);}
function getTeamMembershipStatus(teamId){
    if(teamFollows.includes(teamId))return 'member';
    if(teamPendings.includes(teamId))return 'pending';
    return null;
}

async function toggleTeamFollow(teamId){
    if(!currentUser){openAuthModal('signup');return;}
    const status=getTeamMembershipStatus(teamId);
    const t=T[lang]||{};

    // Already a member → leave the team (soft delete, status='removed')
    if(status==='member'){
        teamFollows=teamFollows.filter(id=>id!==teamId);
        safeLS('pulz_team_follows',teamFollows);
        if(sbClient){
            sbClient.from('team_members').update({status:'removed',decided_at:new Date().toISOString()}).eq('user_id',currentUser.id).eq('team_id',teamId)
                .then(({error})=>{if(error){teamFollows.push(teamId);safeLS('pulz_team_follows',teamFollows);}});
        }
        if(typeof showToast==='function')showToast(t.teamUnfollowed||'Saliste del equipo','info');
        return;
    }

    // Pending application → cancel it (soft delete)
    if(status==='pending'){
        teamPendings=teamPendings.filter(id=>id!==teamId);
        safeLS('pulz_team_pendings',teamPendings);
        if(sbClient){
            sbClient.from('team_members').update({status:'removed',decided_at:new Date().toISOString()}).eq('user_id',currentUser.id).eq('team_id',teamId)
                .then(({error})=>{if(error){teamPendings.push(teamId);safeLS('pulz_team_pendings',teamPendings);}});
        }
        if(typeof showToast==='function')showToast(t.teamApplicationCancelled||'Postulación cancelada','info');
        return;
    }

    // No relation → postulate (status='pending')
    teamPendings.push(teamId);
    safeLS('pulz_team_pendings',teamPendings);
    if(sbClient){
        // Upsert handles the case where a previous 'removed' record exists for the same pair
        sbClient.from('team_members').upsert({user_id:currentUser.id,team_id:teamId,status:'pending',decided_at:null,updated_at:new Date().toISOString()},{onConflict:'user_id,team_id'})
            .then(({error})=>{if(error){teamPendings=teamPendings.filter(id=>id!==teamId);safeLS('pulz_team_pendings',teamPendings);}});
    }
    if(typeof showToast==='function')showToast(t.teamApplicationSent||'Postulación enviada','success');
    if(typeof track==='function')track('apply_team',{team_id:teamId});
}

async function getTeamFollowerCount(teamId){
    if(!sbClient||!teamId)return 0;
    try{
        const{count,error}=await sbClient.from('team_members').select('*',{count:'exact',head:true}).eq('team_id',teamId).eq('status','member');
        if(!error&&count!=null)return count;
    }catch(e){}
    return 0;
}

/* Count of pending postulations the current team owner has yet to review.
   Updated by loadTeamPendings and by approve/reject helpers, used to show the
   header avatar badge for team accounts. */
let teamPendingsCount = 0;

/* Pending postulations awaiting this team's approval (callable only by the team owner) */
async function loadTeamPendings(){
    if(!sbClient||!currentUser||currentProfile?.role!=='team'){teamPendingsCount=0;return[];}
    try{
        const{data,error}=await sbClient.from('team_members').select('id,user_id,created_at,decided_at,status').eq('team_id',currentUser.id).eq('status','pending').order('created_at',{ascending:false});
        if(!error&&data){
            teamPendingsCount=data.length;
            if(data.length){
                const userIds=data.map(p=>p.user_id);
                const{data:profs}=await sbClient.from('profiles').select('id,display_name,username,team_country').in('id',userIds);
                const profById={};(profs||[]).forEach(p=>{profById[p.id]=p;});
                return data.map(r=>({...r,profile:profById[r.user_id]||{}}));
            }
            return [];
        }
    }catch(e){}
    return[];
}

async function approveTeamMember(userId){
    if(!sbClient||!currentUser)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_members').update({status:'member',decided_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('team_id',currentUser.id).eq('user_id',userId).eq('status','pending');
        if(!error)teamPendingsCount=Math.max(0,teamPendingsCount-1);
        return{error};
    }catch(e){return{error:e};}
}

async function rejectTeamMember(userId){
    if(!sbClient||!currentUser)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_members').update({status:'removed',decided_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('team_id',currentUser.id).eq('user_id',userId).eq('status','pending');
        if(!error)teamPendingsCount=Math.max(0,teamPendingsCount-1);
        return{error};
    }catch(e){return{error:e};}
}

/* ============================================
   RACE REVIEWS
   ============================================ */
let reviewsCache={};

async function loadRaceReviews(raceId){
    if(!sbClient)return[];
    if(reviewsCache[raceId])return reviewsCache[raceId];
    try{
        const{data,error}=await sbClient.rpc('get_race_reviews',{p_race_id:raceId});
        if(!error&&data){
            reviewsCache[raceId]=data;
            return data;
        }
    }catch(e){/* reviews load failed */}
    return[];
}

async function submitReview(raceId,rating,category,finishTime,comment){
    if(!sbClient||!currentUser)return{error:'Not authenticated'};
    try{
        const{data,error}=await sbClient.from('race_reviews').upsert({
            race_id:raceId,user_id:currentUser.id,rating,
            category:category||null,finish_time:finishTime||null,comment:comment||null
        },{onConflict:'user_id,race_id'}).select().single();
        if(!error){
            delete reviewsCache[raceId];
            if(typeof showToast==='function')showToast(T[lang].reviewThanks,'success');
        }
        return{data,error};
    }catch(e){return{error:e.message||'Network error'};}
}

/* ============================================
   RACE COMPLETIONS (Runner marks race done)
   ============================================ */
let completions={};

async function loadCompletions(){
    let stored={};try{stored=JSON.parse(localStorage.getItem('pulz_completions')||'{}');}catch(e){stored={};}
    completions=stored;
    if(!sbClient||!currentUser)return;
    try{
        const{data,error}=await sbClient.from('race_completions').select('race_id,finish_time,distance_run,effort,notes,weather,would_repeat').eq('user_id',currentUser.id);
        if(!error&&data){
            completions={};
            data.forEach(c=>{completions[c.race_id]={finish_time:c.finish_time||'',distance_run:c.distance_run||'',effort:c.effort||0,notes:c.notes||'',weather:c.weather||'',would_repeat:c.would_repeat};});
            safeLS('pulz_completions',completions);
        }
    }catch(e){/* completions load failed */}
}

function isCompleted(raceId){return raceId in completions;}
function getCompletionTime(raceId){const c=completions[raceId];return(c&&typeof c==='object')?(c.finish_time||''):(c||'');}
function getCompletionData(raceId){const c=completions[raceId];if(!c)return null;return(typeof c==='object')?c:{finish_time:c||'',distance_run:'',effort:0,notes:'',weather:'',would_repeat:null};}

async function toggleCompletion(raceId,finishTime){
    if(!currentUser){if(typeof openAuthModal==='function')openAuthModal('signup');return;}
    if(isCompleted(raceId)){
        const prev=completions[raceId];
        delete completions[raceId];
        if(sbClient)sbClient.from('race_completions').delete().eq('user_id',currentUser.id).eq('race_id',raceId).then(({error})=>{if(error){completions[raceId]=prev;safeLS('pulz_completions',completions);}}).catch(()=>{completions[raceId]=prev;safeLS('pulz_completions',completions);});
        if(typeof showToast==='function')showToast(T[lang].completionRemoved||'Marca removida','info');
    }else{
        completions[raceId]={finish_time:finishTime||'',distance_run:'',effort:0,notes:'',weather:'',would_repeat:null};
        if(sbClient)sbClient.from('race_completions').upsert({user_id:currentUser.id,race_id:raceId,finish_time:finishTime||null},{onConflict:'user_id,race_id'}).then(({error})=>{if(error){delete completions[raceId];safeLS('pulz_completions',completions);}}).catch(()=>{delete completions[raceId];safeLS('pulz_completions',completions);});
        if(typeof showToast==='function')showToast(T[lang].completionAdded||'¡Carrera completada!','success');
        if(typeof track==='function')track('complete_race',{race_id:raceId});
    }
    safeLS('pulz_completions',completions);
}

async function saveCompletionDetails(raceId,details){
    if(!currentUser||!isCompleted(raceId))return;
    const prev=completions[raceId];
    completions[raceId]={...(prev&&typeof prev==='object'?prev:{finish_time:prev||''}),...details};
    safeLS('pulz_completions',completions);
    if(sbClient){
        const payload={user_id:currentUser.id,race_id:raceId,finish_time:completions[raceId].finish_time||null,distance_run:details.distance_run||null,effort:details.effort||null,notes:details.notes||null,weather:details.weather||null,would_repeat:details.would_repeat!=null?details.would_repeat:null};
        sbClient.from('race_completions').upsert(payload,{onConflict:'user_id,race_id'}).then(({error})=>{if(error){completions[raceId]=prev;safeLS('pulz_completions',completions);}});
    }
    if(typeof showToast==='function')showToast(T[lang].logSave||'Guardado','success');
}

/* ============================================
   RACE CLICKS (track registration link clicks)
   ============================================ */
let clickCounts={};

async function trackRaceClick(raceId){
    if(!sbClient||!raceId)return;
    const payload={race_id:raceId,user_id:currentUser?currentUser.id:null};
    sbClient.from('race_clicks').insert(payload).then(({error})=>{
        if(error){console.warn('[trackRaceClick]',error);return;}
        clickCounts[raceId]=(clickCounts[raceId]||0)+1;
    }).catch(e=>console.warn('[trackRaceClick]',e));
    if(typeof track==='function')track('click_registration',{race_id:raceId,role:(currentProfile&&currentProfile.role)||'guest'});
}

async function loadClickCounts(raceIds){
    if(!sbClient||!raceIds||!raceIds.length)return;
    try{
        const{data,error}=await sbClient.from('race_clicks').select('race_id').in('race_id',raceIds);
        if(!error&&data){
            const counts={};
            data.forEach(r=>{counts[r.race_id]=(counts[r.race_id]||0)+1;});
            Object.assign(clickCounts,counts);
        }
    }catch(e){/* click counts failed */}
}

function getClickCount(raceId){return clickCounts[raceId]||0;}

/* ============================================
   TEAM MEMBERS (followers with stats)
   ============================================ */
async function loadTeamMembers(){
    if(!sbClient||!currentUser||currentProfile?.role!=='team')return[];
    try{
        const{data,error}=await sbClient.rpc('get_team_members_stats',{p_team_id:currentUser.id});
        if(!error&&data)return data;
    }catch(e){/* team members load failed */}
    return[];
}

/* Get which team races each member has saved (as favorites) */
async function loadMemberFavorites(memberIds){
    if(!sbClient||!memberIds.length)return{};
    try{
        // Get favorites for these users that match team races
        const{data,error}=await sbClient.from('favorites').select('user_id,race_id').in('user_id',memberIds);
        if(!error&&data){
            const byUser={};
            data.forEach(f=>{
                if(!byUser[f.user_id])byUser[f.user_id]=[];
                byUser[f.user_id].push(f.race_id);
            });
            return byUser;
        }
    }catch(e){/* member favorites load failed */}
    return{};
}

/* Load public profile by username */
async function loadPublicProfile(username){
    if(!sbClient||!username)return null;
    try{
        const{data,error}=await sbClient.from('profiles').select('id,display_name,role,username,created_at,team_name,team_instagram,pid_show_badges,pid_show_stats,pid_show_history').eq('username',username).single();
        if(!error&&data)return data;
    }catch(e){}
    return null;
}

/* Load completions for a public profile */
async function loadPublicCompletions(userId){
    if(!sbClient||!userId)return[];
    try{
        const{data,error}=await sbClient.from('race_completions').select('race_id,finish_time,distance_run,effort,weather').eq('user_id',userId);
        if(!error&&data)return data;
    }catch(e){}
    return[];
}

/* Check if username is available */
async function checkUsernameAvailable(username){
    if(!sbClient||!username)return false;
    try{
        const{data,error}=await sbClient.from('profiles').select('id').eq('username',username).maybeSingle();
        if(error)return false;
        if(!data)return true;
        // Available if it's the current user's own username
        return data.id===currentUser?.id;
    }catch(e){return false;}
}

/* Load organizer notifications for a race */
async function loadRaceNotifications(raceId){
    if(!sbClient||!raceId)return[];
    try{
        const{data,error}=await sbClient.from('race_notifications').select('message,created_at').eq('race_id',raceId).order('created_at',{ascending:false}).limit(2);
        if(!error&&data)return data;
    }catch(e){}
    return[];
}

/* Get race completions for team members */
async function loadMemberCompletions(memberIds){
    if(!sbClient||!memberIds.length)return{};
    try{
        const{data,error}=await sbClient.from('race_completions').select('user_id,race_id,finish_time,distance_run,effort').in('user_id',memberIds);
        if(!error&&data){
            const byUser={};
            data.forEach(c=>{
                if(!byUser[c.user_id])byUser[c.user_id]=[];
                byUser[c.user_id].push(c);
            });
            return byUser;
        }
    }catch(e){/* member completions load failed */}
    return{};
}

/* ============================================
   BATCH TEAM RACES (bulk add/remove)
   ============================================ */
async function batchToggleTeamRaces(addIds,removeIds){
    if(!currentUser||currentProfile?.role!=='team')return;
    // Remove
    if(removeIds.length){
        teamRaces=teamRaces.filter(id=>!removeIds.includes(id));
        if(sbClient){
            for(const rid of removeIds){
                await sbClient.from('team_races').delete().eq('team_id',currentUser.id).eq('race_id',rid);
            }
        }
    }
    // Add
    if(addIds.length){
        const newIds=addIds.filter(id=>!teamRaces.includes(id));
        teamRaces.push(...newIds);
        if(sbClient&&newIds.length){
            const rows=newIds.map(rid=>({team_id:currentUser.id,race_id:rid}));
            await sbClient.from('team_races').upsert(rows,{onConflict:'team_id,race_id'});
        }
    }
    safeLS('pulz_team_races',teamRaces);
}

/* ============================================
   INVITATIONS — TEAM invita por PULZ ID, RUNNER acepta o rechaza
   ============================================ */

/**
 * Invita a un runner por su PULZ ID. Llama al RPC invite_runner_by_pulz_id.
 * @param {string} pulzId
 * @returns {Promise<{ok?:boolean, error?:string, runner_name?:string, invitation_id?:string}>}
 */
async function inviteRunnerByPulzId(pulzId){
    if(!sbClient||!currentUser)return{error:'no_session'};
    if(!pulzId||!pulzId.trim())return{error:'empty_pulz_id'};
    try{
        const{data,error}=await sbClient.rpc('invite_runner_by_pulz_id',{p_pulz_id:pulzId.trim().toLowerCase()});
        if(error)return{error:error.message||'rpc_error'};
        return data||{error:'no_data'};
    }catch(e){return{error:e.message||'unknown'};}
}

/** Lista invitaciones que el team mandó (con filtros opcionales por status) */
async function loadSentInvitations(statusFilter){
    if(!sbClient||!currentUser)return[];
    try{
        let q=sbClient.from('team_invitations').select('id,runner_id,status,created_at,decided_at').eq('team_id',currentUser.id).order('created_at',{ascending:false});
        if(statusFilter)q=q.eq('status',statusFilter);
        const{data,error}=await q;
        if(error||!data)return[];
        if(!data.length)return[];
        const userIds=[...new Set(data.map(r=>r.runner_id))];
        const{data:profs}=await sbClient.from('profiles').select('id,display_name,username,dorsal_number').in('id',userIds);
        const profById={};(profs||[]).forEach(p=>{profById[p.id]=p;});
        return data.map(r=>({...r,runner:profById[r.runner_id]||{}}));
    }catch(e){return[];}
}

/** Lista invitaciones que el runner recibió (con filtros opcionales por status) */
async function loadReceivedInvitations(statusFilter){
    if(!sbClient||!currentUser)return[];
    try{
        let q=sbClient.from('team_invitations').select('id,team_id,status,created_at,decided_at').eq('runner_id',currentUser.id).order('created_at',{ascending:false});
        if(statusFilter)q=q.eq('status',statusFilter);
        const{data,error}=await q;
        if(error||!data)return[];
        if(!data.length)return[];
        const teamIds=[...new Set(data.map(r=>r.team_id))];
        const{data:profs}=await sbClient.from('profiles').select('id,display_name,team_name,team_city,team_modality,username,dorsal_number').in('id',teamIds);
        const profById={};(profs||[]).forEach(p=>{profById[p.id]=p;});
        return data.map(r=>({...r,team:profById[r.team_id]||{}}));
    }catch(e){return[];}
}

async function acceptInvitation(invitationId){
    if(!sbClient||!currentUser||!invitationId)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_invitations').update({status:'accepted',decided_at:new Date().toISOString()}).eq('id',invitationId).eq('runner_id',currentUser.id).eq('status','pending');
        return{error};
    }catch(e){return{error:e.message||'unknown'};}
}

async function rejectInvitation(invitationId){
    if(!sbClient||!currentUser||!invitationId)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_invitations').update({status:'rejected',decided_at:new Date().toISOString()}).eq('id',invitationId).eq('runner_id',currentUser.id).eq('status','pending');
        return{error};
    }catch(e){return{error:e.message||'unknown'};}
}

async function cancelInvitation(invitationId){
    if(!sbClient||!currentUser||!invitationId)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_invitations').update({status:'cancelled',decided_at:new Date().toISOString()}).eq('id',invitationId).eq('team_id',currentUser.id).eq('status','pending');
        return{error};
    }catch(e){return{error:e.message||'unknown'};}
}

/* ============================================
   NOTIFICATIONS — sistema unificado para los 3 roles
   ============================================ */

let unreadNotificationsCount=0;

async function loadNotifications(opts){
    if(!sbClient||!currentUser)return[];
    const limit=(opts&&opts.limit)||50;
    try{
        const{data,error}=await sbClient.from('notifications').select('id,type,payload,read_at,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(limit);
        if(error||!data)return[];
        return data;
    }catch(e){return[];}
}

async function loadUnreadNotificationsCount(){
    if(!sbClient||!currentUser){unreadNotificationsCount=0;return 0;}
    try{
        const{data,error}=await sbClient.rpc('get_unread_notifications_count');
        if(!error&&typeof data==='number'){unreadNotificationsCount=data;return data;}
    }catch(e){}
    return 0;
}

async function markNotificationRead(notifId){
    if(!sbClient||!currentUser||!notifId)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('notifications').update({read_at:new Date().toISOString()}).eq('id',notifId).eq('user_id',currentUser.id).is('read_at',null);
        if(!error)unreadNotificationsCount=Math.max(0,unreadNotificationsCount-1);
        return{error};
    }catch(e){return{error:e.message||'unknown'};}
}

async function markAllNotificationsRead(){
    if(!sbClient||!currentUser)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',currentUser.id).is('read_at',null);
        if(!error)unreadNotificationsCount=0;
        return{error};
    }catch(e){return{error:e.message||'unknown'};}
}

/* ============================================
   TEAM TRAININGS — Cronograma semanal del team
   day_of_week: 0=Lunes … 6=Domingo
   shift: 'morning' | 'afternoon' | 'night'
   ============================================ */
let teamSchedule = []; // cache local del team owner

async function loadTeamSchedule(teamId){
    if(!sbClient||!teamId)return[];
    try{
        const{data,error}=await sbClient.from('team_trainings')
            .select('*').eq('team_id',teamId)
            .order('day_of_week',{ascending:true})
            .order('time_local',{ascending:true});
        if(error)return[];
        return data||[];
    }catch(e){return[];}
}

async function loadMyTeamSchedule(){
    if(!currentUser||currentProfile?.role!=='team'){teamSchedule=[];return[];}
    teamSchedule=await loadTeamSchedule(currentUser.id);
    return teamSchedule;
}

async function createTrainingSlot(slot){
    if(!sbClient||!currentUser||currentProfile?.role!=='team')return{error:'no_session'};
    if(!slot||typeof slot.day_of_week!=='number'||!slot.activity_type||!slot.time_local||!slot.location)return{error:'missing_fields'};
    const track=(slot.track==='extra'||slot.track==='tip')?slot.track:'training';
    try{
        const payload={
            team_id:currentUser.id,
            day_of_week:slot.day_of_week,
            track,
            activity_type:slot.activity_type,
            time_local:slot.time_local,
            location:slot.location,
            focus:slot.focus||null,
            duration_min:slot.duration_min||null,
            notes:slot.notes||null
        };
        const{data,error}=await sbClient.from('team_trainings').insert(payload).select().single();
        if(error)return{error:error.message||'insert_failed'};
        teamSchedule.push(data);
        return{data};
    }catch(e){return{error:e.message||'unknown'};}
}

async function updateTrainingSlot(id,updates){
    if(!sbClient||!currentUser||!id)return{error:'no_session'};
    try{
        const{data,error}=await sbClient.from('team_trainings').update(updates).eq('id',id).eq('team_id',currentUser.id).select().single();
        if(error)return{error:error.message||'update_failed'};
        const idx=teamSchedule.findIndex(s=>s.id===id);
        if(idx>-1)teamSchedule[idx]=data;
        return{data};
    }catch(e){return{error:e.message||'unknown'};}
}

async function deleteTrainingSlot(id){
    if(!sbClient||!currentUser||!id)return{error:'no_session'};
    try{
        const{error}=await sbClient.from('team_trainings').delete().eq('id',id).eq('team_id',currentUser.id);
        if(error)return{error:error.message||'delete_failed'};
        teamSchedule=teamSchedule.filter(s=>s.id!==id);
        return{ok:true};
    }catch(e){return{error:e.message||'unknown'};}
}

/* Helper: encuentra el próximo turno desde "now" (Lunes-Domingo cíclico).
   Devuelve {slot, dt:Date, diffMs} o null si no hay turnos. */
function findNextTrainingSlot(slots, now){
    if(!Array.isArray(slots)||!slots.length)return null;
    now=now||new Date();
    // En Date, getDay() devuelve 0=Domingo. Convertimos a 0=Lunes...6=Domingo.
    const todayJS=now.getDay();
    const todayMon0=todayJS===0?6:todayJS-1;
    let best=null;
    slots.forEach(s=>{
        const [hh,mm]=(s.time_local||'00:00').split(':').map(Number);
        // Calcular fecha del próximo turno
        let dayOffset=s.day_of_week-todayMon0;
        const candidate=new Date(now);
        if(dayOffset<0)dayOffset+=7;
        if(dayOffset===0){
            // Mismo día: solo cuenta si la hora aún no pasó
            const slotMs=new Date(now);
            slotMs.setHours(hh||0,mm||0,0,0);
            if(slotMs<=now)dayOffset=7; // siguiente semana
        }
        candidate.setDate(now.getDate()+dayOffset);
        candidate.setHours(hh||0,mm||0,0,0);
        const diffMs=candidate-now;
        if(!best||diffMs<best.diffMs)best={slot:s,dt:candidate,diffMs};
    });
    return best;
}

/* ============================================
   SUBSCRIPTION & TRIAL — base de la monetización
   tier: 'trial' | 'free' | 'pro'
   - trial: 60 días iniciales, acceso pro completo
   - free: post-trial con límites por rol
   - pro: pago activo
   Helpers + feature gates. Hoy todos devuelven true (trial activo);
   cuando se active el paywall, las funciones canX() chequean el límite.
   ============================================ */

/* Devuelve el profile a usar — pasado como arg o el currentProfile global. */
function _resolveProfile(profile) {
    if (profile) return profile;
    return (typeof currentProfile !== 'undefined') ? currentProfile : null;
}

/* True si el trial todavía está vigente (con buffer de 1s para clock skew). */
function isTrialActive(profile) {
    const p = _resolveProfile(profile);
    if (!p || !p.trial_ends_at) return false;
    return new Date(p.trial_ends_at).getTime() > Date.now();
}

/* True si el user tiene acceso completo: pago activo o trial vigente. */
function isPro(profile) {
    const p = _resolveProfile(profile);
    if (!p) return false;
    if (p.subscription_tier === 'pro') {
        // si tiene fecha de expiración, chequear; si no, asumir activo
        if (p.subscription_expires_at) {
            return new Date(p.subscription_expires_at).getTime() > Date.now();
        }
        return true;
    }
    if (p.subscription_tier === 'trial') return isTrialActive(p);
    return false;
}

/* True solo si paga (no incluye trial). Sirve para badges y CTA de upgrade. */
function isPaidUser(profile) {
    const p = _resolveProfile(profile);
    if (!p || p.subscription_tier !== 'pro') return false;
    if (p.subscription_expires_at) {
        return new Date(p.subscription_expires_at).getTime() > Date.now();
    }
    return true;
}

/* Días restantes del trial. Devuelve 0 si ya expiró. */
function daysUntilTrialEnds(profile) {
    const p = _resolveProfile(profile);
    if (!p || !p.trial_ends_at) return 0;
    const ms = new Date(p.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
}

/* Tier "efectivo" combinando estado real con expiración. Útil para UI. */
function getEffectiveTier(profile) {
    const p = _resolveProfile(profile);
    if (!p) return 'free';
    if (isPro(p)) {
        return (p.subscription_tier === 'pro') ? 'pro' : 'trial';
    }
    return 'free';
}

/* Límites por rol cuando un user pasa a 'free' (post-trial sin pago).
   Pro y trial activo no tienen límites. Cambiar acá si querés ajustar el plan. */
const PULZ_FREE_LIMITS = {
    runner: {
        favorites_max: 3,        // carreras en mi temporada
        trainings_per_month: 10,
        passport_full: false,    // passport básico, no detallado
        pdf_export: false
    },
    team: {
        members_max: 5,
        schedule_per_day: 3,     // actividades por día en el cronograma
        pdf_export: false,
        calendar_export: false   // .ics
    },
    organizer: {
        // Modelo distinto: revenue share por click convertido, no SaaS.
        // No hay tier free real — todos los organizers tienen acceso a publicar.
        races_max: null,
        analytics_full: false    // analytics avanzados solo en plan featured
    }
};

/* ====== FEATURE GATES — devuelven { ok: boolean, reason?: string, limit?: number } ====== */

/* Runner intenta marcar otra carrera en su temporada. */
function canAddRaceToSeason(profile, currentCount) {
    const p = _resolveProfile(profile);
    if (isPro(p)) return { ok: true };
    const limit = PULZ_FREE_LIMITS.runner.favorites_max;
    if (typeof currentCount === 'number' && currentCount >= limit) {
        return { ok: false, reason: 'limit_reached', limit };
    }
    return { ok: true, limit, remaining: Math.max(0, limit - (currentCount || 0)) };
}

/* Runner intenta cargar un training más este mes. */
function canLogTraining(profile, currentMonthCount) {
    const p = _resolveProfile(profile);
    if (isPro(p)) return { ok: true };
    const limit = PULZ_FREE_LIMITS.runner.trainings_per_month;
    if (typeof currentMonthCount === 'number' && currentMonthCount >= limit) {
        return { ok: false, reason: 'limit_reached', limit };
    }
    return { ok: true, limit, remaining: Math.max(0, limit - (currentMonthCount || 0)) };
}

/* Team intenta invitar un miembro más. */
function canInviteMember(profile, currentMembersCount) {
    const p = _resolveProfile(profile);
    if (isPro(p)) return { ok: true };
    const limit = PULZ_FREE_LIMITS.team.members_max;
    if (typeof currentMembersCount === 'number' && currentMembersCount >= limit) {
        return { ok: false, reason: 'limit_reached', limit };
    }
    return { ok: true, limit, remaining: Math.max(0, limit - (currentMembersCount || 0)) };
}

/* Team intenta agregar otra actividad al cronograma de un día específico. */
function canAddScheduleActivity(profile, currentDayCount) {
    const p = _resolveProfile(profile);
    if (isPro(p)) return { ok: true };
    const limit = PULZ_FREE_LIMITS.team.schedule_per_day;
    if (typeof currentDayCount === 'number' && currentDayCount >= limit) {
        return { ok: false, reason: 'limit_reached', limit };
    }
    return { ok: true, limit, remaining: Math.max(0, limit - (currentDayCount || 0)) };
}

/* Generic feature flag para descarga de PDF mensual. */
function canExportPDF(profile) {
    return { ok: isPro(profile) };
}

/* Generic feature flag para export de calendario .ics (team). */
function canExportCalendar(profile) {
    return { ok: isPro(profile) };
}
