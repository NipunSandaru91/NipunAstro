// Official Philippine cities grouped by current PSGC region.
// Reference count: 149 cities (PSA PSGC, current through 30 June 2026).
export const PHILIPPINES_CITIES_BY_REGION: Record<string, string[]> = {
  "National Capital Region (NCR)": [
    "Caloocan","Las Piñas","Makati","Malabon","Mandaluyong","Manila","Marikina","Muntinlupa",
    "Navotas","Parañaque","Pasay","Pasig","Quezon City","San Juan","Taguig","Valenzuela",
  ],
  "Cordillera Administrative Region (CAR)": ["Baguio","Tabuk"],
  "Region I (Ilocos Region)": [
    "Batac","Laoag","Candon","Vigan","San Fernando","Alaminos","Dagupan","San Carlos","Urdaneta",
  ],
  "Region II (Cagayan Valley)": ["Tuguegarao","Cauayan","Ilagan","Santiago"],
  "Region III (Central Luzon)": [
    "Balanga","Baliwag","Malolos","Meycauayan","San Jose del Monte","Cabanatuan","Gapan","Muñoz",
    "Palayan","San Jose City","Mabalacat","San Fernando","Tarlac City","Angeles","Olongapo",
  ],
  "Region IV-A (CALABARZON)": [
    "Batangas City","Calaca","Lipa","Sto. Tomas","Tanauan","Bacoor","Carmona","Cavite City",
    "Dasmariñas","General Trias","Imus","Tagaytay","Trece Martires","Biñan","Cabuyao","Calamba",
    "San Pablo","San Pedro","Santa Rosa","Tayabas","Antipolo","Lucena",
  ],
  "MIMAROPA Region": ["Calapan","Puerto Princesa"],
  "Region V (Bicol Region)": ["Legazpi","Ligao","Tabaco","Iriga","Naga","Masbate","Sorsogon"],
  "Region VI (Western Visayas)": ["Roxas","Passi","Iloilo"],
  "Negros Island Region (NIR)": [
    "Bago","Cadiz","Escalante","Himamaylan","Kabankalan","La Carlota","Sagay","San Carlos","Silay",
    "Sipalay","Talisay","Victorias","Bais","Bayawan","Canlaon","Dumaguete","Guihulngan","Tanjay","Bacolod",
  ],
  "Region VII (Central Visayas)": [
    "Tagbilaran","Bogo","Carcar","Danao","Naga","Talisay","Toledo","Cebu","Lapu-Lapu","Mandaue",
  ],
  "Region VIII (Eastern Visayas)": ["Borongan","Baybay","Ormoc","Calbayog","Catbalogan","Maasin","Tacloban"],
  "Region IX (Zamboanga Peninsula)": ["Dapitan","Dipolog","Pagadian","Zamboanga","Isabela"],
  "Region X (Northern Mindanao)": [
    "Malaybalay","Valencia","Oroquieta","Ozamiz","Tangub","El Salvador","Gingoog","Cagayan de Oro","Iligan",
  ],
  "Region XI (Davao Region)": ["Panabo","Samal","Tagum","Digos","Mati","Davao"],
  "Region XII (SOCCSKSARGEN)": ["Kidapawan","Koronadal","Tacurong","General Santos"],
  "Region XIII (Caraga)": ["Cabadbaran","Bayugan","Surigao","Bislig","Tandag","Butuan"],
  "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)": ["Lamitan","Marawi","Cotabato"],
};

export const PHILIPPINES_REGIONS = Object.keys(PHILIPPINES_CITIES_BY_REGION);

export const PHILIPPINES_CITY_COUNT = Object.values(PHILIPPINES_CITIES_BY_REGION)
  .reduce((count, cities) => count + cities.length, 0);
