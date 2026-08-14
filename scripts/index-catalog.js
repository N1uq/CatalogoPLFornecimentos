const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(publicDir, 'data');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

console.log('📦 Iniciando escaneamento e indexação inteligente do catálogo PL FORNECIMENTO...');
console.time('⚡ Indexação concluída em');

// Comprehensive Team & Category Mappings with Portuguese and International variants
const teamMappings = [
  // Premier League
  { key: 'manchester united', cat: 'Premier League', sub: 'Manchester United', aliases: ['manchester united', 'man united', 'man utd', 'united', 'mufc'] },
  { key: 'm-u', cat: 'Premier League', sub: 'Manchester United', aliases: ['manchester united', 'man united', 'man utd', 'united', 'mufc'] },
  { key: 'manchester city', cat: 'Premier League', sub: 'Manchester City', aliases: ['manchester city', 'man city', 'city', 'mcfc'] },
  { key: 'chelsea', cat: 'Premier League', sub: 'Chelsea', aliases: ['chelsea', 'the blues', 'blues'] },
  { key: 'arsenal', cat: 'Premier League', sub: 'Arsenal', aliases: ['arsenal', 'gunners'] },
  { key: 'liverpool', cat: 'Premier League', sub: 'Liverpool', aliases: ['liverpool', 'reds'] },
  { key: 'tottenham', cat: 'Premier League', sub: 'Tottenham Hotspur', aliases: ['tottenham', 'spurs', 'tottenham hotspur'] },
  { key: 'aston villa', cat: 'Premier League', sub: 'Aston Villa', aliases: ['aston villa', 'villa'] },
  { key: 'newcastle', cat: 'Premier League', sub: 'Newcastle United', aliases: ['newcastle', 'magpies'] },
  { key: 'everton', cat: 'Premier League', sub: 'Everton', aliases: ['everton', 'toffees'] },
  { key: 'west ham', cat: 'Premier League', sub: 'West Ham', aliases: ['west ham', 'hammers'] },
  { key: 'leicester', cat: 'Premier League', sub: 'Leicester City', aliases: ['leicester', 'foxes'] },
  { key: 'sunderland', cat: 'Premier League', sub: 'Sunderland', aliases: ['sunderland'] },
  { key: 'brighton', cat: 'Premier League', sub: 'Brighton', aliases: ['brighton', 'seagulls'] },
  { key: 'fulham', cat: 'Premier League', sub: 'Fulham', aliases: ['fulham'] },
  { key: 'leeds', cat: 'Premier League', sub: 'Leeds United', aliases: ['leeds', 'leeds united'] },

  // La Liga
  { key: 'real madrid', cat: 'La Liga', sub: 'Real Madrid', aliases: ['real madrid', 'real', 'madrid', 'rm', 'merengues'] },
  { key: 'barcelona', cat: 'La Liga', sub: 'Barcelona', aliases: ['barcelona', 'barca', 'barça', 'fcb', 'culers'] },
  { key: 'atletico madrid', cat: 'La Liga', sub: 'Atlético de Madrid', aliases: ['atletico de madrid', 'atletico madrid', 'atletico', 'atm'] },
  { key: 'atlético madrid', cat: 'La Liga', sub: 'Atlético de Madrid', aliases: ['atletico de madrid', 'atletico madrid', 'atletico', 'atm'] },
  { key: 'betis', cat: 'La Liga', sub: 'Real Betis', aliases: ['real betis', 'betis'] },
  { key: 'sevilla', cat: 'La Liga', sub: 'Sevilla', aliases: ['sevilla'] },
  { key: 'valencia', cat: 'La Liga', sub: 'Valencia', aliases: ['valencia'] },
  { key: 'bilbao', cat: 'La Liga', sub: 'Athletic Bilbao', aliases: ['athletic bilbao', 'athletic club', 'bilbao'] },
  { key: 'celta', cat: 'La Liga', sub: 'Celta de Vigo', aliases: ['celta de vigo', 'celta'] },
  { key: 'villarreal', cat: 'La Liga', sub: 'Villarreal', aliases: ['villarreal', 'submarino amarelo'] },
  { key: 'osasuna', cat: 'La Liga', sub: 'Osasuna', aliases: ['osasuna'] },
  { key: 'mallorca', cat: 'La Liga', sub: 'Mallorca', aliases: ['mallorca'] },
  { key: 'rayo', cat: 'La Liga', sub: 'Rayo Vallecano', aliases: ['rayo vallecano', 'rayo'] },
  { key: 'girona', cat: 'La Liga', sub: 'Girona', aliases: ['girona'] },
  { key: 'elche', cat: 'La Liga', sub: 'Elche', aliases: ['elche'] },
  { key: 'almería', cat: 'La Liga', sub: 'Almería', aliases: ['almeria'] },
  { key: 'almeria', cat: 'La Liga', sub: 'Almería', aliases: ['almeria'] },
  { key: 'granada', cat: 'La Liga', sub: 'Granada', aliases: ['granada'] },

  // Futebol Brasileiro
  { key: 'flamengo', cat: 'Futebol Brasileiro', sub: 'Flamengo', aliases: ['flamengo', 'fla', 'mengao', 'mengo', 'rubro negro'] },
  { key: 'corinthians', cat: 'Futebol Brasileiro', sub: 'Corinthians', aliases: ['corinthians', 'timao', 'coringao'] },
  { key: 'palmeiras', cat: 'Futebol Brasileiro', sub: 'Palmeiras', aliases: ['palmeiras', 'verdao', 'alviverde'] },
  { key: 'são paulo', cat: 'Futebol Brasileiro', sub: 'São Paulo', aliases: ['sao paulo', 'spfc', 'tricolor'] },
  { key: 'sao paulo', cat: 'Futebol Brasileiro', sub: 'São Paulo', aliases: ['sao paulo', 'spfc', 'tricolor'] },
  { key: 'santos', cat: 'Futebol Brasileiro', sub: 'Santos', aliases: ['santos', 'peixe', 'alvinegro praiano'] },
  { key: 'gremio', cat: 'Futebol Brasileiro', sub: 'Grêmio', aliases: ['gremio', 'imortal', 'tricolor gaucho'] },
  { key: 'grêmio', cat: 'Futebol Brasileiro', sub: 'Grêmio', aliases: ['gremio', 'imortal', 'tricolor gaucho'] },
  { key: 'internacional', cat: 'Futebol Brasileiro', sub: 'Internacional', aliases: ['internacional', 'inter rs', 'colorado'] },
  { key: 'cruzeiro', cat: 'Futebol Brasileiro', sub: 'Cruzeiro', aliases: ['cruzeiro', 'cabuloso', 'raposa'] },
  { key: 'fluminense', cat: 'Futebol Brasileiro', sub: 'Fluminense', aliases: ['fluminense', 'flu', 'tricolor carioca'] },
  { key: 'vasco', cat: 'Futebol Brasileiro', sub: 'Vasco da Gama', aliases: ['vasco da gama', 'vasco', 'gigante da colina'] },
  { key: 'botafogo', cat: 'Futebol Brasileiro', sub: 'Botafogo', aliases: ['botafogo', 'bota', 'fogao'] },
  { key: 'bahia', cat: 'Futebol Brasileiro', sub: 'Bahia', aliases: ['bahia', 'esquadrao'] },
  { key: 'atletico mineiro', cat: 'Futebol Brasileiro', sub: 'Atlético Mineiro', aliases: ['atletico mineiro', 'galo'] },
  { key: 'atlético mineiro', cat: 'Futebol Brasileiro', sub: 'Atlético Mineiro', aliases: ['atletico mineiro', 'galo'] },
  { key: 'recife', cat: 'Futebol Brasileiro', sub: 'Sport Recife', aliases: ['sport recife', 'sport'] },
  { key: 'coritiba', cat: 'Futebol Brasileiro', sub: 'Coritiba', aliases: ['coritiba', 'coxa'] },
  { key: 'victoria', cat: 'Futebol Brasileiro', sub: 'Vitória', aliases: ['vitoria', 'leao'] },

  // Seleções
  { key: 'brazil', cat: 'Seleções', sub: 'Brasil', aliases: ['brasil', 'brazil', 'selecao brasileira', 'canarinho'] },
  { key: 'brasil', cat: 'Seleções', sub: 'Brasil', aliases: ['brasil', 'brazil', 'selecao brasileira', 'canarinho'] },
  { key: 'argentina', cat: 'Seleções', sub: 'Argentina', aliases: ['argentina', 'hermanos', 'albiceleste'] },
  { key: 'portugal', cat: 'Seleções', sub: 'Portugal', aliases: ['portugal', 'quinas'] },
  { key: 'spain', cat: 'Seleções', sub: 'Espanha', aliases: ['espanha', 'spain', 'la roja'] },
  { key: 'espanha', cat: 'Seleções', sub: 'Espanha', aliases: ['espanha', 'spain', 'la roja'] },
  { key: 'germany', cat: 'Seleções', sub: 'Alemanha', aliases: ['alemanha', 'germany', 'deutschland'] },
  { key: 'alemanha', cat: 'Seleções', sub: 'Alemanha', aliases: ['alemanha', 'germany', 'deutschland'] },
  { key: 'england', cat: 'Seleções', sub: 'Inglaterra', aliases: ['inglaterra', 'england', 'three lions'] },
  { key: 'inglaterra', cat: 'Seleções', sub: 'Inglaterra', aliases: ['inglaterra', 'england', 'three lions'] },
  { key: 'france', cat: 'Seleções', sub: 'França', aliases: ['franca', 'frança', 'france', 'les bleus'] },
  { key: 'frança', cat: 'Seleções', sub: 'França', aliases: ['franca', 'frança', 'france', 'les bleus'] },
  { key: 'italy', cat: 'Seleções', sub: 'Itália', aliases: ['italia', 'itália', 'italy', 'azzurra'] },
  { key: 'itália', cat: 'Seleções', sub: 'Itália', aliases: ['italia', 'itália', 'italy', 'azzurra'] },
  { key: 'japan', cat: 'Seleções', sub: 'Japão', aliases: ['japao', 'japão', 'japan', 'samurai blue'] },
  { key: 'japão', cat: 'Seleções', sub: 'Japão', aliases: ['japao', 'japão', 'japan', 'samurai blue'] },
  { key: 'mexico', cat: 'Seleções', sub: 'México', aliases: ['mexico', 'méxico', 'el tri'] },
  { key: 'méxico', cat: 'Seleções', sub: 'México', aliases: ['mexico', 'méxico', 'el tri'] },
  { key: 'colombia', cat: 'Seleções', sub: 'Colômbia', aliases: ['colombia', 'colômbia', 'cafeteros'] },
  { key: 'uruguay', cat: 'Seleções', sub: 'Uruguai', aliases: ['uruguai', 'uruguay', 'celeste'] },
  { key: 'netherlands', cat: 'Seleções', sub: 'Holanda', aliases: ['holanda', 'netherlands', 'laranja mecanica'] },
  { key: 'croatia', cat: 'Seleções', sub: 'Croácia', aliases: ['croacia', 'croácia', 'croatia'] },
  { key: 'morocco', cat: 'Seleções', sub: 'Marrocos', aliases: ['marrocos', 'morocco'] },
  { key: 'marrocos', cat: 'Seleções', sub: 'Marrocos', aliases: ['marrocos', 'morocco'] },
  { key: 'algeria', cat: 'Seleções', sub: 'Argélia', aliases: ['argelia', 'algeria'] },
  { key: 'scotland', cat: 'Seleções', sub: 'Escócia', aliases: ['escocia', 'scotland'] },
  { key: 'usa', cat: 'Seleções', sub: 'Estados Unidos', aliases: ['estados unidos', 'usa'] },

  // Serie A Itália
  { key: 'inter milan', cat: 'Serie A Itália', sub: 'Inter de Milão', aliases: ['inter de milao', 'inter milan', 'internazionale', 'inter'] },
  { key: 'ac milan', cat: 'Serie A Itália', sub: 'AC Milan', aliases: ['ac milan', 'milan', 'rossoneri'] },
  { key: 'milan', cat: 'Serie A Itália', sub: 'AC Milan', aliases: ['ac milan', 'milan', 'rossoneri'] },
  { key: 'juventus', cat: 'Serie A Itália', sub: 'Juventus', aliases: ['juventus', 'juve', 'bianconeri'] },
  { key: 'roma', cat: 'Serie A Itália', sub: 'Roma', aliases: ['roma', 'giallorossi'] },
  { key: 'napoli', cat: 'Serie A Itália', sub: 'Napoli', aliases: ['napoli', 'partenopei'] },
  { key: 'lazio', cat: 'Serie A Itália', sub: 'Lazio', aliases: ['lazio', 'biancocelesti'] },
  { key: 'fiorentina', cat: 'Serie A Itália', sub: 'Fiorentina', aliases: ['fiorentina', 'viola'] },
  { key: 'atalanta', cat: 'Serie A Itália', sub: 'Atalanta', aliases: ['atalanta'] },

  // Bundesliga
  { key: 'bayern', cat: 'Bundesliga', sub: 'Bayern de Munique', aliases: ['bayern de munique', 'bayern munique', 'bayern munich', 'bayern munchen', 'bayern', 'bavaria'] },
  { key: 'dortmund', cat: 'Bundesliga', sub: 'Borussia Dortmund', aliases: ['borussia dortmund', 'dortmund', 'bvb'] },
  { key: 'leverkusen', cat: 'Bundesliga', sub: 'Bayer Leverkusen', aliases: ['bayer leverkusen', 'leverkusen'] },
  { key: 'leipzig', cat: 'Bundesliga', sub: 'RB Leipzig', aliases: ['rb leipzig', 'leipzig'] },
  { key: 'frankfurt', cat: 'Bundesliga', sub: 'Eintracht Frankfurt', aliases: ['frankfurt'] },

  // Ligue 1
  { key: 'psg', cat: 'Ligue 1 França', sub: 'PSG', aliases: ['psg', 'paris saint germain', 'paris', 'paris sg'] },
  { key: 'marseille', cat: 'Ligue 1 França', sub: 'Marseille', aliases: ['marseille', 'olympic marseille', 'om'] },
  { key: 'lyon', cat: 'Ligue 1 França', sub: 'Lyon', aliases: ['lyon', 'olympic lyon', 'ol'] },

  // Futebol Sul-Americano & Outros
  { key: 'river', cat: 'Futebol Sul-Americano', sub: 'River Plate', aliases: ['river plate', 'river'] },
  { key: 'boca', cat: 'Futebol Sul-Americano', sub: 'Boca Juniors', aliases: ['boca juniors', 'boca'] },
  { key: 'peñarol', cat: 'Futebol Sul-Americano', sub: 'Peñarol', aliases: ['penarol', 'peñarol'] },
  { key: 'penarol', cat: 'Futebol Sul-Americano', sub: 'Peñarol', aliases: ['penarol', 'peñarol'] },
  { key: 'colo', cat: 'Futebol Sul-Americano', sub: 'Colo-Colo', aliases: ['colo colo', 'colo-colo'] },

  // Outras Ligas
  { key: 'benfica', cat: 'Outras Ligas & Clubes', sub: 'Benfica', aliases: ['benfica', 'slb'] },
  { key: 'porto', cat: 'Outras Ligas & Clubes', sub: 'FC Porto', aliases: ['fc porto', 'porto'] },
  { key: 'sporting', cat: 'Outras Ligas & Clubes', sub: 'Sporting CP', aliases: ['sporting cp', 'sporting'] },
  { key: 'ajax', cat: 'Outras Ligas & Clubes', sub: 'Ajax', aliases: ['ajax', 'afc ajax'] },
  { key: 'psv', cat: 'Outras Ligas & Clubes', sub: 'PSV Eindhoven', aliases: ['psv eindhoven', 'psv'] },
  { key: 'feyenoord', cat: 'Outras Ligas & Clubes', sub: 'Feyenoord', aliases: ['feyenoord'] },
  { key: 'galatasaray', cat: 'Outras Ligas & Clubes', sub: 'Galatasaray', aliases: ['galatasaray'] },
  { key: 'fenerbahce', cat: 'Outras Ligas & Clubes', sub: 'Fenerbahçe', aliases: ['fenerbahce', 'fenerbahçe'] },
  { key: 'besiktas', cat: 'Outras Ligas & Clubes', sub: 'Beşiktaş', aliases: ['besiktas', 'beşiktaş'] },
  { key: 'al nassr', cat: 'Outras Ligas & Clubes', sub: 'Al-Nassr', aliases: ['al nassr', 'al-nassr', 'nassr'] },
  { key: 'al-nassr', cat: 'Outras Ligas & Clubes', sub: 'Al-Nassr', aliases: ['al nassr', 'al-nassr', 'nassr'] },
  { key: 'al hilal', cat: 'Outras Ligas & Clubes', sub: 'Al-Hilal', aliases: ['al hilal', 'al-hilal'] },
  { key: 'inter miami', cat: 'Outras Ligas & Clubes', sub: 'Inter Miami', aliases: ['inter miami', 'miami'] },

  // NBA
  { key: 'celtics', cat: 'NBA & Basquete', sub: 'Boston Celtics', aliases: ['boston celtics', 'celtics'] },
  { key: 'lakers', cat: 'NBA & Basquete', sub: 'LA Lakers', aliases: ['la lakers', 'lakers', 'los angeles lakers'] },
  { key: 'warriors', cat: 'NBA & Basquete', sub: 'Golden State Warriors', aliases: ['golden state warriors', 'warriors', 'gsw'] },
  { key: 'suns', cat: 'NBA & Basquete', sub: 'Phoenix Suns', aliases: ['phoenix suns', 'suns'] },
  { key: 'bucks', cat: 'NBA & Basquete', sub: 'Milwaukee Bucks', aliases: ['milwaukee bucks', 'bucks'] },
  { key: 'heat', cat: 'NBA & Basquete', sub: 'Miami Heat', aliases: ['miami heat', 'heat'] },
  { key: 'bulls', cat: 'NBA & Basquete', sub: 'Chicago Bulls', aliases: ['chicago bulls', 'bulls'] },

  // F1
  { key: 'ferrari', cat: 'Automobilismo & F1', sub: 'Ferrari', aliases: ['ferrari', 'scuderia ferrari'] },
  { key: 'red bull', cat: 'Automobilismo & F1', sub: 'Red Bull Racing', aliases: ['red bull racing', 'red bull'] },
  { key: 'ducati', cat: 'Automobilismo & F1', sub: 'Ducati Racing', aliases: ['ducati racing', 'ducati'] }
];

function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_./]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSeason(text) {
  const match2 = text.match(/\b(20\d{2}[-/]\d{2,4}|\d{2}[-/]\d{2})\b/);
  if (match2) return match2[0];
  const match1 = text.match(/\b(20\d{2})\b/);
  if (match1) return match1[0];
  return '';
}

function cleanTitle(folderName, subcategory) {
  let title = folderName
    .replace(/[\u4e00-\u9fa5]/g, '') // remove Chinese characters
    .replace(/\b\d{8,12}\b/g, '') // remove long product IDs
    .replace(/\bS-(?:XXL|3XL|4XL|5XL|2XL)\b/gi, '')
    .replace(/\bsizes?\s+S-(?:XXL|3XL|4XL|5XL|2XL)\b/gi, '')
    .replace(/\bkids\s*16-28\b/gi, 'Infantil')
    .replace(/_\d+_\d+_/g, ' ')
    .replace(/^\d+_/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.length < 3) {
    title = (subcategory !== 'Geral' ? subcategory : folderName);
  }
  return title;
}

const entries = fs.readdirSync(rootDir, { withFileTypes: true });
const productDirs = entries.filter(d => 
  d.isDirectory() && 
  !d.name.startsWith('.') && 
  d.name !== 'node_modules' && 
  d.name !== 'public' && 
  d.name !== 'scripts'
);

const products = [];
const categoryStats = {};
let totalImageCount = 0;

productDirs.forEach((dir, index) => {
  const folderName = dir.name;
  const folderPath = path.join(rootDir, folderName);
  const lowerName = folderName.toLowerCase();

  const files = fs.readdirSync(folderPath)
    .filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));

  if (files.length === 0) return;

  totalImageCount += files.length;

  let isRetro = lowerName.includes('retro') || lowerName.includes('retrô');
  let category = isRetro ? 'Retrô' : 'Outros';
  let subcategory = 'Geral';
  let teamAliases = [];

  for (const item of teamMappings) {
    if (lowerName.includes(item.key)) {
      if (!isRetro) category = item.cat;
      subcategory = item.sub;
      teamAliases = item.aliases || [];
      break;
    }
  }

  let gender = 'Masculino';
  if (lowerName.includes('woman') || lowerName.includes('women') || lowerName.includes('feminin')) {
    gender = 'Feminino';
  } else if (lowerName.includes('kids') || lowerName.includes('infantil') || lowerName.includes('baby')) {
    gender = 'Infantil';
  }

  let type = 'Torcedor';
  if (lowerName.includes('player')) type = 'Jogador';
  else if (lowerName.includes('training') || lowerName.includes('treino') || lowerName.includes('suit') || lowerName.includes('polo')) type = 'Treino';
  else if (lowerName.includes('jacket') || lowerName.includes('windbreaker') || lowerName.includes('trench') || lowerName.includes('coat')) type = 'Agasalhos & Corta-Vento';
  else if (isRetro) type = 'Retrô';

  const title = cleanTitle(folderName, subcategory);
  const season = extractSeason(folderName);
  const cover = files[0];

  // Normalized Search Fields
  const normTitle = normalize(title);
  const normDir = normalize(folderName);
  const normSub = normalize(subcategory);
  const normCat = normalize(category);

  // Generate Search Tokens
  const searchKeywords = new Set([
    ...normTitle.split(' '),
    ...normDir.split(' '),
    ...normSub.split(' '),
    ...normCat.split(' '),
    ...teamAliases.map(normalize),
    gender.toLowerCase(),
    type.toLowerCase()
  ]);

  if (season) searchKeywords.add(normalize(season));
  if (lowerName.includes('home')) { searchKeywords.add('home'); searchKeywords.add('casa'); searchKeywords.add('principal'); }
  if (lowerName.includes('away')) { searchKeywords.add('away'); searchKeywords.add('fora'); searchKeywords.add('visitante'); }
  if (lowerName.includes('third')) { searchKeywords.add('third'); searchKeywords.add('terceira'); }
  if (lowerName.includes('long sleeve') || lowerName.includes('long-sleeve')) { searchKeywords.add('manga longa'); searchKeywords.add('long sleeve'); }

  const keywordsArr = Array.from(searchKeywords).filter(k => k && k.length > 1);

  const product = {
    id: 'p-' + (index + 1),
    dir: folderName,
    title: title,
    category: category,
    subcategory: subcategory,
    gender: gender,
    type: type,
    season: season,
    cover: cover,
    images: files,
    imageCount: files.length,
    normTitle: normTitle,
    normSub: normSub,
    normCat: normCat,
    keywords: keywordsArr,
    aliases: teamAliases
  };

  products.push(product);

  // Category Tree statistics
  if (!categoryStats[category]) {
    categoryStats[category] = {
      name: category,
      productCount: 0,
      imageCount: 0,
      subcategories: {},
      cover: folderName + '/' + cover
    };
  }

  categoryStats[category].productCount++;
  categoryStats[category].imageCount += files.length;
  if (!categoryStats[category].subcategories[subcategory]) {
    categoryStats[category].subcategories[subcategory] = 0;
  }
  categoryStats[category].subcategories[subcategory]++;
});

// Sort categories by product count
const sortedCategories = Object.values(categoryStats).sort((a, b) => b.productCount - a.productCount);

// Write JSON files
fs.writeFileSync(path.join(dataDir, 'catalog.json'), JSON.stringify(products));
fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(sortedCategories, null, 2));

const metaData = {
  brandName: "PL FORNECIMENTO",
  subtitle: "Catálogo Digital Premium de Roupas e Artigos Esportivos",
  totalProducts: products.length,
  totalImages: totalImageCount,
  indexedAt: new Date().toISOString()
};

fs.writeFileSync(path.join(dataDir, 'meta.json'), JSON.stringify(metaData, null, 2));

console.timeEnd('⚡ Indexação concluída em');
console.log(`✅ Total de produtos indexados com busca inteligente: ${products.length.toLocaleString('pt-BR')}`);
console.log(`📸 Total de imagens processadas: ${totalImageCount.toLocaleString('pt-BR')}`);
