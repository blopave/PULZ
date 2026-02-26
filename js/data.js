/**
 * PULZ — Race Data
 * 
 * Data structure per race:
 *   n: name, d: date (YYYY-MM-DD), l: location
 *   c: categories (array), t: type (asfalto|trail)
 *   w: website URL, i: iconic (0|1)
 * 
 * HOW TO UPDATE:
 *   1. Add new race objects to the appropriate country array
 *   2. Keep dates in YYYY-MM-DD format
 *   3. Set i:1 for iconic/major races
 *   4. Provide website URL when available
 * 
 * SOURCES for updates:
 *   Argentina: corro.com.ar, sportsfacilities.com.ar
 *   Chile:     tusdesafios.com, corre.cl
 *   Brasil:    brasilquecorre.com, ahotu.com
 *   Colombia:  soymaratonista.com, ahotu.com
 *   Peru:      running4peru.com, ahotu.com
 *   Uruguay:   ahotu.com
 */

const countries = [
    { id: 'argentina', flag: '🇦🇷', name: 'Argentina' },
    { id: 'chile',     flag: '🇨🇱', name: 'Chile' },
    { id: 'brasil',    flag: '🇧🇷', name: 'Brasil' },
    { id: 'uruguay',   flag: '🇺🇾', name: 'Uruguay' },
    { id: 'colombia',  flag: '🇨🇴', name: 'Colombia' },
    { id: 'peru',      flag: '🇵🇪', name: 'Perú' }
];

const R = {
argentina: [
    {n:"Trail Lolog",d:"2026-01-11",l:"Lago Lolog, Neuquén",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Cruce de los Andes",d:"2026-02-21",l:"Bariloche, Río Negro",c:["50K","Ultra","Trail"],t:"trail",w:"",i:0},
    {n:"BRUT Bariloche",d:"2026-02-27",l:"Bariloche, Río Negro",c:["Trail","Ultra"],t:"trail",w:"",i:1},
    {n:"Ushuaia Trail",d:"2026-02-28",l:"Ushuaia, Tierra del Fuego",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Circuito Estaciones (Otoño)",d:"2026-03-01",l:"Buenos Aires, CABA",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Women Night Run",d:"2026-03-07",l:"Vicente López, Buenos Aires",c:["8K","3K"],t:"asfalto",w:"",i:0},
    {n:"Epic Patagonia",d:"2026-03-14",l:"Villa La Angostura, Neuquén",c:["70K","Trail"],t:"trail",w:"",i:0},
    {n:"21K de Carlos Paz",d:"2026-03-15",l:"Villa Carlos Paz, Córdoba",c:["21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"10K Buenos Aires NB",d:"2026-03-15",l:"Palermo, Buenos Aires",c:["10K"],t:"asfalto",w:"",i:0},
    {n:"21K de Mendoza",d:"2026-03-22",l:"Parque Central, Mendoza",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"21K de Salta",d:"2026-03-29",l:"Salta",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Patagonia Run",d:"2026-04-08",l:"San Martín de los Andes, Neuquén",c:["Ultra","Trail"],t:"trail",w:"https://patagoniarun.com",i:1},
    {n:"10K Adidas Supernova",d:"2026-04-12",l:"Vicente López, Buenos Aires",c:["10K"],t:"asfalto",w:"",i:0},
    {n:"21K Buenos Aires",d:"2026-04-19",l:"Buenos Aires, CABA",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Media Maratón Puerto Madryn",d:"2026-04-26",l:"Puerto Madryn, Chubut",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Maratón Patria",d:"2026-05-24",l:"Santiago del Estero",c:["42K","21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Fiestas Mayas 10K",d:"2026-05-25",l:"Buenos Aires, CABA",c:["10K","3K"],t:"asfalto",w:"",i:0},
    {n:"15K Adidas Adizero",d:"2026-06-07",l:"Buenos Aires, CABA",c:["15K"],t:"asfalto",w:"",i:0},
    {n:"21K de La Plata",d:"2026-06-14",l:"La Plata, Buenos Aires",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Maratón Int. de la Bandera",d:"2026-06-28",l:"Rosario, Santa Fe",c:["42K","10K"],t:"asfalto",w:"",i:1},
    {n:"NB 42K Córdoba",d:"2026-07-05",l:"Córdoba",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:1},
    {n:"21K de Buenos Aires",d:"2026-08-23",l:"Buenos Aires, CABA",c:["21K"],t:"asfalto",w:"https://www.corro.com.ar/carreras/21k-de-buenos-aires",i:1},
    {n:"Maratón de Buenos Aires",d:"2026-09-20",l:"Buenos Aires, CABA",c:["42K"],t:"asfalto",w:"https://www.maratondebuenosaires.com/",i:1},
    {n:"UTACCH Ultra Trail",d:"2026-10-10",l:"Córdoba",c:["15K","26K","55K","85K","120K","165K"],t:"trail",w:"",i:0},
    {n:"10K San Isidro",d:"2026-10-25",l:"San Isidro, Buenos Aires",c:["10K"],t:"asfalto",w:"",i:0},
    {n:"10K Night Run",d:"2026-11-28",l:"Buenos Aires, CABA",c:["10K"],t:"asfalto",w:"",i:0}
],
chile: [
    {n:"Sollipulli Challenge",d:"2026-02-06",l:"Melipeuco, Araucanía",c:["Trail"],t:"trail",w:"",i:0},
    {n:"El Morro Trail Running",d:"2026-02-07",l:"Bahía Inglesa, Atacama",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Coya Trail Running",d:"2026-02-07",l:"Coya, O'Higgins",c:["21K","10K","5K"],t:"trail",w:"",i:0},
    {n:"Desafío Chiloé",d:"2026-02-14",l:"Ancud, Los Lagos",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Aguas Andinas Trail Run",d:"2026-03-01",l:"Santiago",c:["Trail"],t:"trail",w:"",i:0},
    {n:"La Gran Travesía",d:"2026-03-21",l:"Santiago",c:["Trail"],t:"trail",w:"",i:0},
    {n:"STGO21K by ASICS",d:"2026-03-29",l:"Santiago",c:["21K"],t:"asfalto",w:"https://santiago21k.cl/",i:0},
    {n:"Media Maratón de Concón",d:"2026-03-29",l:"Concón, Valparaíso",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Pampa Perdiz Trail",d:"2026-04-04",l:"Alto Hospicio",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Trail Malalcahuello",d:"2026-04-10",l:"Araucanía",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Doñihue Trail Race",d:"2026-04-11",l:"Doñihue, O'Higgins",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Trail La Fragua",d:"2026-04-12",l:"Valparaíso",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Maratón de Santiago",d:"2026-04-26",l:"Santiago",c:["42K","21K","10K"],t:"asfalto",w:"https://maratondesantiago.cl/",i:1},
    {n:"Trail del Cañi",d:"2026-05-01",l:"Pucón, Araucanía",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Desafío Quillayquén",d:"2026-05-02",l:"Coltauco, O'Higgins",c:["Trail"],t:"trail",w:"",i:0},
    {n:"Torrencial Chile by UTMB",d:"2026-06-15",l:"Valdivia, Los Ríos",c:["97K","65K","44K","21K","12K"],t:"trail",w:"",i:1},
    {n:"Volcano Marathon",d:"2026-06-26",l:"Hanga Roa, Rapa Nui",c:["42K","21K","10K"],t:"asfalto",w:"",i:1},
    {n:"STGO21K (2da ed.)",d:"2026-08-30",l:"Las Condes, Santiago",c:["21K","10K","5K"],t:"asfalto",w:"https://santiago21k.cl/",i:0},
    {n:"Patagonian Int. Marathon",d:"2026-09-05",l:"Torres del Paine, Magallanes",c:["42K","30K","21K","15K","10K"],t:"trail",w:"https://www.patagonianinternationalmarathon.com/",i:1},
    {n:"Ultra Paine",d:"2026-09-27",l:"Puerto Natales, Magallanes",c:["80K","50K","42K","35K","21K","14K","7K"],t:"trail",w:"",i:1}
],
brasil: [
    {n:"Meia Maratona Int. São Paulo",d:"2026-01-25",l:"São Paulo, SP",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Trail Brasília",d:"2026-01-25",l:"Brasília, DF",c:["7K","12K","21K","43K"],t:"trail",w:"",i:0},
    {n:"Maratona Meio do Mundo",d:"2026-03-14",l:"Macapá, AP",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Maratona de Teresina",d:"2026-03-14",l:"Teresina, PI",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Trail Mar de Minas",d:"2026-03-07",l:"Prados, MG",c:["10K","21K","35K"],t:"trail",w:"",i:0},
    {n:"Maratona de Manaus",d:"2026-04-05",l:"Manaus, AM",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"21K Salvador",d:"2026-04-05",l:"Salvador, BA",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Maratona Int. São Paulo",d:"2026-04-12",l:"São Paulo, SP",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:1},
    {n:"Maratona de Fortaleza",d:"2026-04-12",l:"Fortaleza, CE",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Maratona de Cascavel",d:"2026-04-12",l:"Cascavel, PR",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Paraty Brazil by UTMB",d:"2026-05-15",l:"Paraty, RJ",c:["108K","58K","35K","25K"],t:"trail",w:"https://paraty.utmb.world/",i:1},
    {n:"Maratona Int. Porto Alegre",d:"2026-05-31",l:"Porto Alegre, RS",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Corrida das Pontes",d:"2026-06-07",l:"Recife, PE",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Meia de Florianópolis",d:"2026-06-07",l:"Florianópolis, SC",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Maratona do Rio de Janeiro",d:"2026-06-22",l:"Rio de Janeiro, RJ",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:1},
    {n:"Maratona FILA",d:"2026-08-15",l:"São Paulo, SP",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Maratona Int. de Floripa",d:"2026-08-30",l:"Florianópolis, SC",c:["42K","21K","5K"],t:"asfalto",w:"",i:0},
    {n:"Maratona de Niterói",d:"2026-09-14",l:"Niterói, RJ",c:["42K","15K","6K"],t:"asfalto",w:"",i:0}
],
uruguay: [
    {n:"Ironman 70.3 Punta del Este",d:"2026-03-15",l:"Punta del Este",c:["Triatlón"],t:"asfalto",w:"",i:0},
    {n:"Maratón de Montevideo",d:"2026-05-10",l:"Montevideo",c:["42K","21K","10K"],t:"asfalto",w:"https://worldsmarathons.com/marathon/maraton-montevideo",i:1},
    {n:"Half Marathon Montevideo",d:"2026-08-09",l:"Montevideo",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Corre Bosco",d:"2026-08-16",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Marathon Punta del Este",d:"2026-09-06",l:"Punta del Este",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Policía Científica",d:"2026-09-15",l:"Montevideo",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Montevideo 15K",d:"2026-11-29",l:"Montevideo",c:["15K"],t:"asfalto",w:"",i:0}
],
colombia: [
    {n:"Media Maratón del Mar",d:"2026-02-22",l:"Cartagena, Bolívar",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Carrera de las Rosas",d:"2026-02-22",l:"Barranquilla, Atlántico",c:["21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Vuelta Atlética Isla San Andrés",d:"2026-04-26",l:"San Andrés",c:["32K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Corre por los Héroes",d:"2026-04-26",l:"Bogotá D.C.",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Maratón de Cali",d:"2026-05-03",l:"Cali, Valle del Cauca",c:["42K","21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Silvia Trail Ancestral",d:"2026-05-15",l:"Silvia, Cauca",c:["42.6K","22.1K","13.2K"],t:"trail",w:"",i:0},
    {n:"21K Coveñas",d:"2026-05-17",l:"Coveñas, Sucre",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Carrera de las Rosas Bogotá",d:"2026-05-24",l:"Bogotá D.C.",c:["15K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Maratón Dulima",d:"2026-06-07",l:"Ibagué, Tolima",c:["42K","21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Media Maratón Córdoba",d:"2026-06-07",l:"Montería, Córdoba",c:["21K"],t:"asfalto",w:"",i:0},
    {n:"Chicamocha Canyon Race",d:"2026-06-15",l:"San Gil, Santander",c:["165K","80K","46K","23K","10K"],t:"trail",w:"",i:1},
    {n:"Media Maratón Sincelejo",d:"2026-06-28",l:"Sincelejo, Sucre",c:["21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Media Maratón Cali",d:"2026-06-28",l:"Cali, Valle del Cauca",c:["21K","10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Ultra Valle de Tenza",d:"2026-07-15",l:"Guateque, Boyacá",c:["79K","43K","21K","9K"],t:"trail",w:"",i:0},
    {n:"Media Maratón de Bogotá",d:"2026-07-27",l:"Bogotá D.C.",c:["21K","10K"],t:"asfalto",w:"",i:1},
    {n:"La Carrera del Pacífico",d:"2026-08-30",l:"Santiago de Cali",c:["10K"],t:"asfalto",w:"",i:0},
    {n:"Maratón de Medellín",d:"2026-09-06",l:"Medellín, Antioquia",c:["42K","21K","10K","5K"],t:"asfalto",w:"https://maratonmedellin.com/",i:1},
    {n:"Carrera de la Mujer",d:"2026-09-06",l:"Bogotá D.C.",c:["10K","5K"],t:"asfalto",w:"",i:0},
    {n:"Ultra La Mesa",d:"2026-09-20",l:"La Mesa, Cundinamarca",c:["80K","43K","23K","11K"],t:"trail",w:"",i:0},
    {n:"Media Maratón del Café",d:"2026-10-04",l:"Caldas",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Media Maratón Valledupar",d:"2026-10-11",l:"Valledupar, Cesar",c:["21K","10K"],t:"asfalto",w:"",i:0},
    {n:"Frontera Endurance Run",d:"2026-10-15",l:"Jardín, Antioquia",c:["55K","21K","12K"],t:"trail",w:"",i:0},
    {n:"Media Maratón Bucaramanga",d:"2026-10-18",l:"Bucaramanga, Santander",c:["21K","10.5K","5K"],t:"asfalto",w:"",i:0}
],
peru: [
    {n:"Santa María 7.5K Run",d:"2026-01-24",l:"Santa María del Mar, Lima",c:["7.5K","3K"],t:"asfalto",w:"",i:0},
    {n:"Mercedes-Benz Corporate Games",d:"2026-01-25",l:"Lima",c:["Corporate"],t:"asfalto",w:"",i:0},
    {n:"IRONMAN 70.3 Perú",d:"2026-04-26",l:"Lima",c:["Triatlón"],t:"asfalto",w:"",i:0},
    {n:"Wings for Life World Run",d:"2026-05-10",l:"Lima",c:["Open"],t:"asfalto",w:"",i:0},
    {n:"Maratón adidas Rímac Lima 42K",d:"2026-05-24",l:"Lima",c:["42K","21K"],t:"asfalto",w:"https://www.running4peru.com/",i:1},
    {n:"Inca Trail Marathon",d:"2026-05-24",l:"Machu Picchu, Cusco",c:["42K","21K","10K"],t:"trail",w:"",i:1},
    {n:"Cordillera Blanca Ultra Trail",d:"2026-07-02",l:"Huaraz, Áncash",c:["70K","50K","25K","12K","5K"],t:"trail",w:"",i:0},
    {n:"KIA Media Maratón de Lima",d:"2026-08-23",l:"Lima",c:["21K","10K"],t:"asfalto",w:"https://www.running4peru.com/",i:1},
    {n:"Machu Picchu Trail",d:"2026-08-24",l:"Machu Picchu, Cusco",c:["42K","25.7K"],t:"trail",w:"",i:0}
]
};
