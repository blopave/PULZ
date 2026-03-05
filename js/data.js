/**
 * PULZ — Data Layer v4.0
 * R is initialized with hardcoded data (always available).
 * Supabase replaces it async when ready.
 */

const countries=[
    {id:'argentina',code:'AR',name:'Argentina'},
    {id:'chile',code:'CL',name:'Chile'},
    {id:'brasil',code:'BR',name:'Brasil'},
    {id:'uruguay',code:'UY',name:'Uruguay'},
    {id:'colombia',code:'CO',name:'Colombia'},
    {id:'peru',code:'PE',name:'Perú'}
];

let R={
argentina:[
{n:"Trail Lolog",d:"2026-01-11",l:"Lago Lolog, Neuquén",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Cruce de los Andes",d:"2026-02-21",l:"Bariloche, Río Negro",c:["50K","Ultra","Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"BRUT Bariloche",d:"2026-03-14",l:"Bariloche, Río Negro",c:["50K","33K","21K","10K"],t:"trail",w:"https://brut.run/",i:1,s:"e",source:"pulz"},
{n:"Ushuaia Trail",d:"2026-02-28",l:"Ushuaia, Tierra del Fuego",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Circuito Estaciones (Otoño)",d:"2026-03-01",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"https://www.corro.com.ar/carreras/circuito-de-las-estaciones",i:0,s:"c",source:"pulz"},
{n:"Women Night Run",d:"2026-03-07",l:"Vicente López, Buenos Aires",c:["8K","3K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Epic Patagonia",d:"2026-03-14",l:"Villa La Angostura, Neuquén",c:["70K","Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"21K de Carlos Paz",d:"2026-03-15",l:"Villa Carlos Paz, Córdoba",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"10K Buenos Aires NB",d:"2026-03-15",l:"Palermo, Buenos Aires",c:["10K"],t:"asfalto",w:"https://www.newbalance.com.ar",i:0,s:"c",source:"pulz"},
{n:"21K de Mendoza",d:"2026-03-22",l:"Parque Central, Mendoza",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K de Salta",d:"2026-03-29",l:"Salta",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Patagonia Run",d:"2026-04-08",l:"San Martín de los Andes, Neuquén",c:["100Mi","110K","70K","42K","21K","10K"],t:"trail",w:"https://patagoniarun.com",i:1,s:"c",desc:"Una de las carreras de ultra trail más importantes de Sudamérica. Recorrido por bosques patagónicos, lagos cristalinos y senderos de montaña con vistas al volcán Lanín.",price:"USD 120 – 280",source:"pulz"},
{n:"10K Adidas Supernova",d:"2026-04-12",l:"Vicente López, Buenos Aires",c:["10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Mar del Plata",d:"2026-04-19",l:"Mar del Plata, Buenos Aires",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K Buenos Aires (FILA)",d:"2026-04-19",l:"Palermo, Buenos Aires",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Puerto Madryn",d:"2026-04-26",l:"Puerto Madryn, Chubut",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Mendoza",d:"2026-05-03",l:"Mendoza",c:["42K","21K","10K","4K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K de Rosario",d:"2026-05-10",l:"Rosario, Santa Fe",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"25K Buenos Aires NB",d:"2026-05-17",l:"Buenos Aires, CABA",c:["25K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Patria",d:"2026-05-24",l:"Santiago del Estero",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Fiestas Mayas 10K",d:"2026-05-25",l:"Buenos Aires, CABA",c:["10K","3K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"15K Adidas Adizero",d:"2026-06-07",l:"Buenos Aires, CABA",c:["15K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K de La Plata",d:"2026-06-14",l:"La Plata, Buenos Aires",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Int. de la Bandera",d:"2026-06-28",l:"Rosario, Santa Fe",c:["42K","10K"],t:"asfalto",w:"https://42krosario.com.ar/2026/",i:1,s:"c",source:"pulz"},
{n:"NB 42K Córdoba",d:"2026-07-05",l:"Córdoba",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://www.newbalance.com.ar/42k-cordoba-2026/race-series-cordoba-42k.html",i:1,s:"c",source:"pulz"},
{n:"30K Buenos Aires NB",d:"2026-07-19",l:"Buenos Aires, CABA",c:["30K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"21K de Buenos Aires",d:"2026-08-23",l:"Buenos Aires, CABA",c:["21K"],t:"asfalto",w:"https://www.maratondebuenosaires.com/",i:1,s:"c",source:"pulz"},
{n:"Maratón de Buenos Aires",d:"2026-09-20",l:"Buenos Aires, CABA",c:["42K"],t:"asfalto",w:"https://www.maratondebuenosaires.com/",i:1,s:"c",desc:"La maratón más grande de Latinoamérica. Recorre los barrios más emblemáticos de la ciudad con más de 15.000 corredores de todo el mundo.",price:"ARS 120 / USD 120",source:"pulz"},
{n:"UTACCH Ultra Trail",d:"2026-10-10",l:"Córdoba",c:["15K","26K","55K","85K","120K","165K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"10K San Isidro",d:"2026-10-25",l:"San Isidro, Buenos Aires",c:["10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"10K Night Run",d:"2026-11-28",l:"Buenos Aires, CABA",c:["10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Patagonia Bariloche by UTMB",d:"2026-11-20",l:"Bariloche, Río Negro",c:["130K","86K","50K","25K"],t:"trail",w:"https://bariloche.utmb.world/",i:1,s:"c",source:"pulz"}
],
chile:[
{n:"Sollipulli Challenge",d:"2026-02-06",l:"Melipeuco, Araucanía",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"El Morro Trail Running",d:"2026-02-07",l:"Bahía Inglesa, Atacama",c:["Trail"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Coya Trail Running",d:"2026-02-07",l:"Coya, O'Higgins",c:["21K","10K","5K"],t:"trail",w:"",i:0,s:"c",source:"pulz"},
{n:"Desafío Chiloé",d:"2026-02-14",l:"Ancud, Los Lagos",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Aguas Andinas Trail Run",d:"2026-03-01",l:"Santiago",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"La Gran Travesía",d:"2026-03-21",l:"Santiago",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"STGO21K by ASICS",d:"2026-03-29",l:"Santiago",c:["21K"],t:"asfalto",w:"https://santiago21k.cl/",i:0,s:"e",source:"pulz"},
{n:"Media Maratón de Concón",d:"2026-03-29",l:"Concón, Valparaíso",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Pampa Perdiz Trail",d:"2026-04-04",l:"Alto Hospicio",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Trail Malalcahuello",d:"2026-04-10",l:"Araucanía",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Doñihue Trail Race",d:"2026-04-11",l:"Doñihue, O'Higgins",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Trail La Fragua",d:"2026-04-12",l:"Valparaíso",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratón de Santiago",d:"2026-04-26",l:"Santiago",c:["42K","21K","10K"],t:"asfalto",w:"https://maratondesantiago.cl/",i:1,s:"c",desc:"El evento deportivo más masivo de Chile. Miles de corredores recorren las principales avenidas de Santiago con la Cordillera de los Andes como telón de fondo.",price:"CLP 25.000 – 49.000",source:"pulz"},
{n:"Trail del Cañi",d:"2026-05-01",l:"Pucón, Araucanía",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Desafío Quillayquén",d:"2026-05-02",l:"Coltauco, O'Higgins",c:["Trail"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Torrencial Chile by UTMB",d:"2026-06-26",l:"Valdivia, Los Ríos",c:["97K","65K","44K","21K","12K","6K"],t:"trail",w:"https://torrencial.utmb.world/",i:1,s:"c",source:"pulz"},
{n:"Volcano Marathon",d:"2026-06-26",l:"Hanga Roa, Rapa Nui",c:["42K","21K","10K"],t:"asfalto",w:"",i:1,s:"e",source:"pulz"},
{n:"STGO21K (2da ed.)",d:"2026-08-30",l:"Las Condes, Santiago",c:["21K","10K","5K"],t:"asfalto",w:"https://santiago21k.cl/",i:0,s:"e",source:"pulz"},
{n:"Patagonian Int. Marathon",d:"2026-09-05",l:"Torres del Paine, Magallanes",c:["42K","30K","21K","15K","10K"],t:"trail",w:"https://www.patagonianinternationalmarathon.com/",i:1,s:"e",source:"pulz"},
{n:"Ultra Paine",d:"2026-09-27",l:"Puerto Natales, Magallanes",c:["80K","50K","42K","35K","21K","14K","7K"],t:"trail",w:"",i:1,s:"e",source:"pulz"}
],
brasil:[
{n:"Meia Maratona Int. São Paulo",d:"2026-01-25",l:"São Paulo, SP",c:["21K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Trail Brasília",d:"2026-01-25",l:"Brasília, DF",c:["7K","12K","21K","43K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Trail Mar de Minas",d:"2026-03-07",l:"Prados, MG",c:["10K","21K","35K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona Meio do Mundo",d:"2026-03-14",l:"Macapá, AP",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona de Teresina",d:"2026-03-14",l:"Teresina, PI",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona de Manaus",d:"2026-04-05",l:"Manaus, AM",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"21K Salvador",d:"2026-04-05",l:"Salvador, BA",c:["21K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona Int. São Paulo",d:"2026-04-12",l:"São Paulo, SP",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:1,s:"c",desc:"A maior maratona do Brasil. Um percurso icônico pela Avenida Paulista e os principais pontos da megalópole mais vibrante da América do Sul.",source:"pulz"},
{n:"Maratona de Fortaleza",d:"2026-04-12",l:"Fortaleza, CE",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona de Cascavel",d:"2026-04-12",l:"Cascavel, PR",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Paraty Brazil by UTMB",d:"2026-05-15",l:"Paraty, RJ",c:["108K","58K","35K","25K"],t:"trail",w:"https://paraty.utmb.world/",i:1,s:"e",source:"pulz"},
{n:"Maratona Int. Porto Alegre",d:"2026-05-31",l:"Porto Alegre, RS",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Corrida das Pontes",d:"2026-06-07",l:"Recife, PE",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Meia de Florianópolis",d:"2026-06-07",l:"Florianópolis, SC",c:["21K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona do Rio de Janeiro",d:"2026-06-07",l:"Rio de Janeiro, RJ",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonadorio.com.br/",i:1,s:"c",source:"pulz"},
{n:"Maratona FILA",d:"2026-08-15",l:"São Paulo, SP",c:["21K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona Int. de Floripa",d:"2026-08-30",l:"Florianópolis, SC",c:["42K","21K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratona de Niterói",d:"2026-09-14",l:"Niterói, RJ",c:["42K","15K","6K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"}
],
uruguay:[
{n:"Ironman 70.3 Punta del Este",d:"2026-03-15",l:"Punta del Este",c:["Triatlón"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratón de Montevideo",d:"2026-05-10",l:"Montevideo",c:["42K","21K","10K"],t:"asfalto",w:"https://worldsmarathons.com/marathon/maraton-montevideo",i:1,s:"e",source:"pulz"},
{n:"Half Marathon Montevideo",d:"2026-08-09",l:"Montevideo",c:["21K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Corre Bosco",d:"2026-08-16",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Marathon Punta del Este",d:"2026-09-06",l:"Punta del Este",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Policía Científica",d:"2026-09-15",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Montevideo 15K",d:"2026-11-29",l:"Montevideo",c:["15K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"}
],
colombia:[
{n:"Media Maratón del Mar",d:"2026-02-22",l:"Cartagena, Bolívar",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Carrera de las Rosas",d:"2026-02-22",l:"Barranquilla, Atlántico",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Vuelta Atlética Isla San Andrés",d:"2026-04-26",l:"San Andrés",c:["32K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Corre por los Héroes",d:"2026-04-26",l:"Bogotá D.C.",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón de Cali",d:"2026-05-03",l:"Cali, Valle del Cauca",c:["42K","21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Silvia Trail Ancestral",d:"2026-05-15",l:"Silvia, Cauca",c:["42.6K","22.1K","13.2K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"21K Coveñas",d:"2026-05-17",l:"Coveñas, Sucre",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Carrera de las Rosas Bogotá",d:"2026-05-24",l:"Bogotá D.C.",c:["15K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Maratón Dulima",d:"2026-06-07",l:"Ibagué, Tolima",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Córdoba",d:"2026-06-07",l:"Montería, Córdoba",c:["21K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Chicamocha Canyon Race",d:"2026-06-15",l:"San Gil, Santander",c:["165K","80K","46K","23K","10K"],t:"trail",w:"",i:1,s:"e",source:"pulz"},
{n:"Media Maratón Sincelejo",d:"2026-06-28",l:"Sincelejo, Sucre",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Cali",d:"2026-06-28",l:"Cali, Valle del Cauca",c:["21K","10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Ultra Valle de Tenza",d:"2026-07-15",l:"Guateque, Boyacá",c:["79K","43K","21K","9K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Media Maratón de Bogotá",d:"2026-07-26",l:"Bogotá D.C.",c:["21K","10K"],t:"asfalto",w:"https://www.mediamaratonbogota.com/",i:1,s:"c",source:"pulz"},
{n:"La Carrera del Pacífico",d:"2026-08-30",l:"Santiago de Cali",c:["10K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratón de Medellín",d:"2026-09-06",l:"Medellín, Antioquia",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonmedellin.com/",i:1,s:"c",desc:"La maratón de la ciudad de la eterna primavera. Recorrido urbano a 1.500 msnm con un clima perfecto para correr y una energía única de la gente paisa.",source:"pulz"},
{n:"Carrera de la Mujer",d:"2026-09-06",l:"Bogotá D.C.",c:["10K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Ultra La Mesa",d:"2026-09-20",l:"La Mesa, Cundinamarca",c:["80K","43K","23K","11K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Media Maratón del Café",d:"2026-10-04",l:"Caldas",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Media Maratón Valledupar",d:"2026-10-11",l:"Valledupar, Cesar",c:["21K","10K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"},
{n:"Frontera Endurance Run",d:"2026-10-15",l:"Jardín, Antioquia",c:["55K","21K","12K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"Media Maratón Bucaramanga",d:"2026-10-18",l:"Bucaramanga, Santander",c:["21K","10.5K","5K"],t:"asfalto",w:"",i:0,s:"c",source:"pulz"}
],
peru:[
{n:"Santa María 7.5K Run",d:"2026-01-24",l:"Santa María del Mar, Lima",c:["7.5K","3K"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Mercedes-Benz Corporate Games",d:"2026-01-25",l:"Lima",c:["Corporate"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"IRONMAN 70.3 Perú",d:"2026-04-26",l:"Lima",c:["Triatlón"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Wings for Life World Run",d:"2026-05-10",l:"Lima",c:["Open"],t:"asfalto",w:"",i:0,s:"e",source:"pulz"},
{n:"Maratón adidas Rímac Lima 42K",d:"2026-05-24",l:"Lima",c:["42K","21K"],t:"asfalto",w:"https://www.running4peru.com/",i:1,s:"e",source:"pulz"},
{n:"Inca Trail Marathon",d:"2026-05-24",l:"Machu Picchu, Cusco",c:["42K","21K","10K"],t:"trail",w:"",i:1,s:"e",desc:"Corré por los caminos ancestrales incas hasta llegar a una de las Siete Maravillas del Mundo. Trail running a más de 2.400 msnm entre ruinas milenarias y selva nublada.",source:"pulz"},
{n:"Cordillera Blanca Ultra Trail",d:"2026-07-02",l:"Huaraz, Áncash",c:["70K","50K","25K","12K","5K"],t:"trail",w:"",i:0,s:"e",source:"pulz"},
{n:"KIA Media Maratón de Lima",d:"2026-08-23",l:"Lima",c:["21K","10K"],t:"asfalto",w:"https://www.running4peru.com/",i:1,s:"e",source:"pulz"},
{n:"Machu Picchu Trail",d:"2026-08-24",l:"Machu Picchu, Cusco",c:["42K","25.7K"],t:"trail",w:"",i:0,s:"e",source:"pulz"}
]
};

let raceMap={};
let dataReady=true;

/* ============================================
   SUPABASE DATA LOADER
   ============================================ */
async function loadRacesFromDB(){
    if(!supabase){ console.warn('Supabase not available'); return; }
    try {
        const {data:dbCountries,error:cErr}=await supabase.from('countries').select('*').order('sort_order');
        if(!cErr&&dbCountries&&dbCountries.length>0){
            countries.length=0;
            dbCountries.forEach(c=>countries.push({id:c.id,code:c.code,name:c.name,name_en:c.name_en,name_pt:c.name_pt}));
        }
        const {data:races,error:rErr}=await supabase.from('races').select('*').eq('moderation_status','approved').order('date');
        if(rErr){ console.error('Error loading races:',rErr); return; }
        R={};countries.forEach(c=>R[c.id]=[]);raceMap={};
        races.forEach(race=>{const mapped=mapRaceFromDB(race);if(R[race.country_id]){R[race.country_id].push(mapped);raceMap[race.id]=mapped;}});
        console.log(`PULZ: ${races.length} races loaded from Supabase`);
        if(typeof buildDD==='function')buildDD();
        if(activeCountry&&typeof buildCountryContent==='function')buildCountryContent(activeCountry);
    } catch(e){ console.error('Supabase load failed:',e); }
}

function mapRaceFromDB(row){
    return {_id:row.id,n:row.name,d:row.date,l:row.location,c:row.categories||[],t:row.type==='road'?'asfalto':'trail',w:row.website||'',i:row.is_iconic?1:0,s:row.status==='confirmed'?'c':'e',desc:row.description||null,price:row.price||null,source:row.source||'pulz',start_time:row.start_time||null,start_point:row.start_point||null,registration_url:row.registration_url||null,logo_url:row.logo_url||null,banner_url:row.banner_url||null,elevation_gain:row.elevation_gain||null,kit_description:row.kit_description||null,contact_email:row.contact_email||null,social_ig:row.social_ig||null,organizer_id:row.organizer_id||null,created_by:row.created_by||null,latitude:row.latitude||null,longitude:row.longitude||null};
}

/* ============================================
   FAVORITES
   ============================================ */
let favorites=[];
async function loadFavorites(){
    if(!supabase||!currentUser){favorites=JSON.parse(localStorage.getItem('pulz_favs')||'[]');return;}
    try{const{data,error}=await supabase.from('favorites').select('race_id').eq('user_id',currentUser.id);if(!error&&data)favorites=data.map(f=>f.race_id);}catch(e){favorites=JSON.parse(localStorage.getItem('pulz_favs')||'[]');}
}
function isFavorite(favId){return favorites.includes(favId);}
async function toggleFav(favId){
    if(!currentUser){openAuthModal('signup');setTimeout(()=>{const sub=document.querySelector('.auth-subtitle');if(sub)sub.textContent=T[lang].favLogin;},120);return;}
    const idx=favorites.indexOf(favId);
    if(idx>-1){favorites.splice(idx,1);if(supabase)supabase.from('favorites').delete().eq('user_id',currentUser.id).eq('race_id',favId).then(()=>{});}
    else{favorites.push(favId);if(supabase)supabase.from('favorites').insert({user_id:currentUser.id,race_id:favId}).then(()=>{});}
    localStorage.setItem('pulz_favs',JSON.stringify(favorites));
    // Update fav count locally
    if(favCounts[favId]!==undefined){if(idx>-1)favCounts[favId]=Math.max(0,favCounts[favId]-1);else favCounts[favId]++;}
    else if(idx===-1){favCounts[favId]=1;}
    if(activeCountry)renderRaces(activeCountry);
    const drawerFavBtn=document.getElementById('drawerFavBtn');
    if(drawerFavBtn){const isFav=favorites.includes(favId);drawerFavBtn.classList.toggle('active',isFav);const svg=drawerFavBtn.querySelector('svg');if(svg)svg.setAttribute('fill',isFav?'currentColor':'none');}
    document.querySelectorAll('.fav-btn').forEach(btn=>btn.classList.remove('fav-pop'));
    setTimeout(()=>{document.querySelectorAll('.fav-btn.fav-active').forEach(btn=>btn.classList.add('fav-pop'));},10);
}

/* ============================================
   RACE CRUD
   ============================================ */
async function createRace(raceData){
    if(!supabase||!currentUser)return{error:'Not authenticated'};
    const payload={name:raceData.name,date:raceData.date,country_id:raceData.country_id,location:raceData.location,categories:raceData.categories,type:raceData.type,website:raceData.website||null,description:raceData.description||null,start_time:raceData.start_time||null,start_point:raceData.start_point||null,price:raceData.price||null,registration_url:raceData.registration_url||null,logo_url:raceData.logo_url||null,elevation_gain:raceData.elevation_gain||null,kit_description:raceData.kit_description||null,contact_email:raceData.contact_email||null,social_ig:raceData.social_ig||null,social_fb:raceData.social_fb||null,max_participants:raceData.max_participants||null,latitude:raceData.latitude||null,longitude:raceData.longitude||null,is_iconic:false,status:'confirmed',source:currentProfile?.role==='organizer'?'organizer':'community',created_by:currentUser.id,organizer_id:currentProfile?.role==='organizer'?currentUser.id:null,moderation_status:currentProfile?.role==='organizer'?'approved':'pending'};
    const{data,error}=await supabase.from('races').insert(payload).select().single();
    if(!error&&data){const mapped=mapRaceFromDB(data);if(R[data.country_id])R[data.country_id].push(mapped);raceMap[data.id]=mapped;if(activeCountry===data.country_id)buildCountryContent(activeCountry);}
    return{data,error};
}
async function updateRace(raceId,updates){
    if(!supabase||!currentUser)return{error:'Not authenticated'};
    const{data,error}=await supabase.from('races').update(updates).eq('id',raceId).select().single();
    if(!error&&data){const mapped=mapRaceFromDB(data);raceMap[data.id]=mapped;if(R[data.country_id]){const idx=R[data.country_id].findIndex(r=>r._id===data.id);if(idx>-1)R[data.country_id][idx]=mapped;}if(activeCountry===data.country_id)buildCountryContent(activeCountry);}
    return{data,error};
}
async function deleteRace(raceId){
    if(!supabase||!currentUser)return{error:'Not authenticated'};
    const{error}=await supabase.from('races').delete().eq('id',raceId);
    if(!error){for(const cid of Object.keys(R))R[cid]=R[cid].filter(r=>r._id!==raceId);delete raceMap[raceId];if(activeCountry)buildCountryContent(activeCountry);}
    return{error};
}
async function submitSuggestion(s){
    if(!supabase||!currentUser)return{error:'Not authenticated'};
    const{data,error}=await supabase.from('race_suggestions').insert({suggested_by:currentUser.id,name:s.name,date:s.date||null,country_id:s.country_id||null,location:s.location||null,website:s.website||null,notes:s.notes||null}).select().single();
    return{data,error};
}

/* ============================================
   FAVORITES COUNT (public)
   ============================================ */
let favCounts={};

async function loadFavCounts(){
    if(!supabase)return;
    try{
        const{data,error}=await supabase.rpc('get_favorites_count');
        if(!error&&data){
            favCounts={};
            data.forEach(r=>favCounts[r.race_id]=parseInt(r.fav_count));
        }
    }catch(e){console.warn('Fav counts load failed:',e);}
}

function getFavCount(raceId){return favCounts[raceId]||0;}

/* ============================================
   RACE REVIEWS
   ============================================ */
let reviewsCache={};

async function loadRaceReviews(raceId){
    if(!supabase)return[];
    if(reviewsCache[raceId])return reviewsCache[raceId];
    try{
        const{data,error}=await supabase.rpc('get_race_reviews',{p_race_id:raceId});
        if(!error&&data){
            reviewsCache[raceId]=data;
            return data;
        }
    }catch(e){console.warn('Reviews load failed:',e);}
    return[];
}

async function submitReview(raceId,rating,category,finishTime,comment){
    if(!supabase||!currentUser)return{error:'Not authenticated'};
    const{data,error}=await supabase.from('race_reviews').upsert({
        race_id:raceId,user_id:currentUser.id,rating,
        category:category||null,finish_time:finishTime||null,comment:comment||null
    },{onConflict:'user_id,race_id'}).select().single();
    if(!error){
        delete reviewsCache[raceId];
        showToast(T[lang].reviewThanks,'success');
    }
    return{data,error};
}
