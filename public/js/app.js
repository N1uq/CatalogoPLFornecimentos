/**
 * PL FORNECIMENTO — CATÁLOGO DIGITAL PREMIUM
 * Busca Inteligente + Identidade Visual Branco/Verde + Dark Mode System
 */

(function () {
  'use strict';

  // State Management
  let catalogData = [];
  let categoriesData = [];
  let metaData = {};

  let filteredProducts = [];
  let currentPageBatch = 1;
  const BATCH_SIZE = 36;

  let activeState = {
    category: 'all',
    subcategory: 'all',
    type: 'all',
    gender: 'all',
    search: ''
  };

  // Lightbox State
  let currentLightboxProduct = null;
  let currentImageIndex = 0;
  let touchStartX = 0;

  // DOM Elements
  const elements = {
    header: document.getElementById('main-header'),
    navMenu: document.getElementById('nav-menu'),
    btnMobileToggle: document.getElementById('btn-mobile-toggle'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),

    headerSearchContainer: document.getElementById('header-search-container'),
    globalSearchInput: document.getElementById('global-search-input'),
    btnSearchClear: document.getElementById('btn-search-clear'),
    searchDropdown: document.getElementById('search-dropdown'),

    statProducts: document.getElementById('stat-products'),
    statImages: document.getElementById('stat-images'),

    categoriesGrid: document.getElementById('categories-grid'),
    breadcrumbsContainer: document.getElementById('breadcrumbs-container'),

    filterCategoriesRow: document.getElementById('filter-categories-row'),
    filterTeamsRow: document.getElementById('filter-teams-row'),
    filterOptionsRow: document.getElementById('filter-options-row'),

    resultsCountText: document.getElementById('results-count-text'),
    activeFiltersContainer: document.getElementById('active-filters-container'),
    productsGrid: document.getElementById('products-grid'),
    infiniteScrollSentinel: document.getElementById('infinite-scroll-sentinel'),

    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxMeta: document.getElementById('lightbox-meta'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
    lightboxThumbnails: document.getElementById('lightbox-thumbnails'),

    btnBackToTop: document.getElementById('btn-back-to-top')
  };

  // Team Aliases Dictionary
  const TEAM_ALIASES = {
    'manchester united': ['manchester united', 'man united', 'man utd', 'united', 'mufc'],
    'manchester city': ['manchester city', 'man city', 'city', 'mcfc'],
    'real madrid': ['real madrid', 'real', 'madrid', 'rm', 'merengues'],
    'barcelona': ['barcelona', 'barca', 'barça', 'fcb', 'culers'],
    'psg': ['psg', 'paris saint germain', 'paris', 'paris sg'],
    'bayern de munique': ['bayern de munique', 'bayern munique', 'bayern munich', 'bayern munchen', 'bayern', 'bvb', 'bavaria'],
    'inter de milão': ['inter de milao', 'inter milan', 'internazionale', 'inter'],
    'ac milan': ['ac milan', 'milan', 'rossoneri'],
    'juventus': ['juventus', 'juve', 'bianconeri'],
    'atlético de madrid': ['atletico de madrid', 'atletico madrid', 'atletico', 'atm'],
    'borussia dortmund': ['borussia dortmund', 'dortmund', 'bvb'],
    'arsenal': ['arsenal', 'gunners'],
    'chelsea': ['chelsea', 'blues'],
    'liverpool': ['liverpool', 'reds'],
    'tottenham hotspur': ['tottenham', 'spurs', 'tottenham hotspur'],
    'flamengo': ['flamengo', 'fla', 'mengao', 'mengo', 'rubro negro'],
    'corinthians': ['corinthians', 'timao', 'coringao'],
    'palmeiras': ['palmeiras', 'verdao', 'alviverde'],
    'são paulo': ['sao paulo', 'spfc', 'tricolor'],
    'santos': ['santos', 'peixe'],
    'grêmio': ['gremio', 'imortal'],
    'internacional': ['internacional', 'inter rs', 'colorado'],
    'cruzeiro': ['cruzeiro', 'cabuloso'],
    'fluminense': ['fluminense', 'flu', 'tricolor carioca'],
    'vasco da gama': ['vasco da gama', 'vasco', 'gigante da colina'],
    'botafogo': ['botafogo', 'bota', 'fogao'],
    'brasil': ['brasil', 'brazil', 'selecao brasileira', 'canarinho'],
    'argentina': ['argentina', 'hermanos', 'albiceleste'],
    'frança': ['franca', 'frança', 'france', 'les bleus'],
    'alemanha': ['alemanha', 'germany', 'deutschland'],
    'espanha': ['espanha', 'spain', 'la roja'],
    'itália': ['italia', 'itália', 'italy', 'azzurra'],
    'portugal': ['portugal', 'quinas'],
    'japão': ['japao', 'japão', 'japan', 'samurai blue'],
    'inglaterra': ['inglaterra', 'england', 'three lions'],
    'boston celtics': ['boston celtics', 'celtics'],
    'la lakers': ['la lakers', 'lakers', 'los angeles lakers'],
    'golden state warriors': ['golden state warriors', 'warriors', 'gsw'],
    'ferrari': ['ferrari', 'scuderia ferrari']
  };

  // Initialize App
  async function init() {
    setupThemeToggle();
    setupEventListeners();
    setupIntersectionObserver();
    parseURLParams();

    try {
      await loadCatalogData();
      renderFeaturedCategories();
      renderCategoryFilterPills();
      applyFilters();
    } catch (err) {
      console.error('Erro ao carregar dados do catálogo:', err);
      elements.productsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Erro ao carregar catálogo</div>
          <div class="empty-state-desc">Não foi possível carregar os dados. Verifique a conexão com o servidor.</div>
        </div>
      `;
    }
  }

  // Theme Management (Dark/Light)
  function setupThemeToggle() {
    if (!elements.btnThemeToggle) return;

    elements.btnThemeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('pl_theme', newTheme);
    });
  }

  // Load Data Files
  async function loadCatalogData() {
    const [catalogRes, categoriesRes, metaRes] = await Promise.all([
      fetch('/data/catalog.json'),
      fetch('/data/categories.json'),
      fetch('/data/meta.json')
    ]);

    catalogData = await catalogRes.json();
    categoriesData = await categoriesRes.json();
    metaData = await metaRes.json();

    // Update Stats Display
    if (metaData.totalProducts) {
      elements.statProducts.textContent = Number(metaData.totalProducts).toLocaleString('pt-BR');
      elements.statImages.textContent = Number(metaData.totalImages).toLocaleString('pt-BR');
    }
  }

  // Global Image Base URL Strategy & Resilient Loader
  window.IMAGE_BASE_URL = window.IMAGE_BASE_URL || 'https://pub-6d2973b55c1d47578ed242aa628fd9af.r2.dev';
  window.PL_IMAGE_LOGS = window.PL_IMAGE_LOGS || [];

  function logImageError(data) {
    const entry = {
      timestamp: new Date().toISOString(),
      url: data.url,
      productId: data.productId || null,
      productTitle: data.productTitle || null,
      status: data.status || 'ERROR',
      attempts: data.attempts || 1
    };
    window.PL_IMAGE_LOGS.push(entry);
    if (window.PL_IMAGE_LOGS.length > 200) {
      window.PL_IMAGE_LOGS.shift();
    }
  }

  function getProductImageUrl(dir, filename) {
    if (!dir || !filename) return '';
    const cleanDir = dir.toString().split('/').map(encodeURIComponent).join('/');
    const cleanFile = encodeURIComponent(filename.toString());
    const relativePath = `/${cleanDir}/${cleanFile}`;

    if (window.IMAGE_BASE_URL) {
      const baseUrl = window.IMAGE_BASE_URL.replace(/\/+$/, '');
      return `${baseUrl}${relativePath}`;
    }
    return relativePath;
  }

  // Visual Fallback SVG Data URL (matching light & dark theme)
  const FALLBACK_IMAGE_DATA_URL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" fill="#151816" rx="12"/>
      <g transform="translate(150, 120)">
        <circle cx="50" cy="50" r="42" stroke="#20a85e" stroke-width="3" stroke-dasharray="6 6" fill="none" opacity="0.6"/>
        <path d="M35 50L45 60L65 40" stroke="#20a85e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
      </g>
      <text x="50%" y="240" text-anchor="middle" fill="#aeb6b1" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">Imagem Indisponível</text>
      <text x="50%" y="265" text-anchor="middle" fill="#737d76" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12">PL FORNECIMENTO</text>
    </svg>
  `);

  window.handleImageError = function (imgElement, originalUrl, productId, productTitle) {
    if (!imgElement) return;

    let attempt = parseInt(imgElement.getAttribute('data-retry-count') || '0', 10);
    const maxRetries = 3;

    attempt += 1;
    imgElement.setAttribute('data-retry-count', attempt.toString());

    logImageError({
      url: originalUrl || imgElement.src,
      productId: productId,
      productTitle: productTitle,
      status: `RETRY_ATTEMPT_${attempt}`,
      attempts: attempt
    });

    if (attempt <= maxRetries) {
      const delay = attempt === 1 ? 300 : Math.pow(2, attempt - 2) * 1000;
      setTimeout(() => {
        const targetUrl = originalUrl || imgElement.src;
        const cleanUrl = targetUrl.split('?')[0];
        imgElement.src = `${cleanUrl}?_retry=${attempt}_${Date.now()}`;
      }, delay);
    } else {
      imgElement.onerror = null;
      imgElement.src = FALLBACK_IMAGE_DATA_URL;
      imgElement.classList.add('img-fallback-active');
      if (imgElement.parentElement) {
        imgElement.parentElement.classList.add('has-fallback-image');
      }
      logImageError({
        url: originalUrl || imgElement.src,
        productId: productId,
        productTitle: productTitle,
        status: 'FINAL_FALLBACK_APPLIED',
        attempts: attempt
      });
    }
  };

  // Render Category Cards (Featured Section)
  function renderFeaturedCategories() {
    if (!elements.categoriesGrid || !categoriesData.length) return;

    elements.categoriesGrid.innerHTML = categoriesData.map(cat => {
      const parts = cat.cover.split('/');
      const coverUrl = getProductImageUrl(parts[0], parts[1]);
      const safeNameEscaped = escapeHtml(cat.name).replace(/'/g, "\\'");
      return `
        <div class="category-card" data-category-name="${escapeHtml(cat.name)}">
          <img src="${coverUrl}" alt="${escapeHtml(cat.name)}" loading="lazy" onerror="window.handleImageError(this, '${coverUrl}', 'category', '${safeNameEscaped}');" />
          <div class="category-overlay">
            <div class="category-card-name">${escapeHtml(cat.name)}</div>
            <div class="category-card-count">${cat.productCount.toLocaleString('pt-BR')} produtos no catálogo</div>
          </div>
        </div>
      `;
    }).join('');

    elements.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catName = card.getAttribute('data-category-name');
        setCategoryFilter(catName);
        scrollToCatalogSection();
      });
    });
  }

  // Render Main Category Filter Pills
  function renderCategoryFilterPills() {
    const categoriesHtml = `
      <button class="filter-pill ${activeState.category === 'all' ? 'active' : ''}" data-cat-pill="all">
        Todas as Categorias <span class="pill-count">(${catalogData.length.toLocaleString('pt-BR')})</span>
      </button>
      ${categoriesData.map(cat => `
        <button class="filter-pill ${activeState.category === cat.name ? 'active' : ''}" data-cat-pill="${escapeHtml(cat.name)}">
          ${escapeHtml(cat.name)} <span class="pill-count">(${cat.productCount.toLocaleString('pt-BR')})</span>
        </button>
      `).join('')}
    `;

    elements.filterCategoriesRow.innerHTML = `<span class="filter-label">Categorias:</span>` + categoriesHtml;

    elements.filterCategoriesRow.querySelectorAll('[data-cat-pill]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat-pill');
        setCategoryFilter(cat);
      });
    });
  }

  // Render Subcategory (Team) Filter Pills
  function renderTeamFilterPills() {
    if (activeState.category === 'all') {
      elements.filterTeamsRow.style.display = 'none';
      return;
    }

    const categoryObj = categoriesData.find(c => c.name === activeState.category);
    if (!categoryObj || !categoryObj.subcategories) {
      elements.filterTeamsRow.style.display = 'none';
      return;
    }

    const subentries = Object.entries(categoryObj.subcategories)
      .sort((a, b) => b[1] - a[1]);

    if (subentries.length <= 1) {
      elements.filterTeamsRow.style.display = 'none';
      return;
    }

    elements.filterTeamsRow.style.display = 'flex';
    const teamsHtml = `
      <span class="filter-label">Times / Sub:</span>
      <button class="filter-pill ${activeState.subcategory === 'all' ? 'active' : ''}" data-team-pill="all">
        Todos os Times
      </button>
      ${subentries.map(([teamName, count]) => `
        <button class="filter-pill ${activeState.subcategory === teamName ? 'active' : ''}" data-team-pill="${escapeHtml(teamName)}">
          ${escapeHtml(teamName)} <span class="pill-count">(${count})</span>
        </button>
      `).join('')}
    `;

    elements.filterTeamsRow.innerHTML = teamsHtml;

    elements.filterTeamsRow.querySelectorAll('[data-team-pill]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeState.subcategory = btn.getAttribute('data-team-pill');
        applyFilters();
      });
    });
  }

  // Universal String Normalizer
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

  // Controlled Levenshtein Distance for Fuzzy Search
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Calculate Search Relevance Score
  function calculateRelevance(product, normQuery, words) {
    let score = 0;
    const normTitle = product.normTitle || normalize(product.title);
    const normSub = product.normSub || normalize(product.subcategory);
    const normCat = product.normCat || normalize(product.category);

    // Priority 1: Exact Match
    if (normTitle === normQuery || normSub === normQuery) score += 1000;
    // Priority 2: Starts With Match
    else if (normTitle.startsWith(normQuery) || normSub.startsWith(normQuery)) score += 800;
    // Priority 3: Substring Match
    else if (normTitle.includes(normQuery) || normSub.includes(normQuery)) score += 500;
    else {
      // Priority 4: Words Match & Aliases & Fuzzy
      let matchedCount = 0;

      // Check Team Aliases
      let matchedAlias = false;
      if (product.aliases && product.aliases.length > 0) {
        for (const alias of product.aliases) {
          const normAlias = normalize(alias);
          if (normAlias.includes(normQuery) || normQuery.includes(normAlias)) {
            score += 350;
            matchedAlias = true;
            break;
          }
        }
      }

      words.forEach(word => {
        if (word.length < 2) return;

        let wordFound = false;
        if (normTitle.includes(word) || normSub.includes(word) || normCat.includes(word)) {
          score += 150;
          wordFound = true;
        } else if (product.keywords && product.keywords.includes(word)) {
          score += 120;
          wordFound = true;
        } else {
          // Controlled Fuzzy Matching
          const tokens = normTitle.split(' ').concat(normSub.split(' '));
          for (const t of tokens) {
            if (t.length >= 4 && Math.abs(t.length - word.length) <= 2) {
              const dist = levenshtein(t, word);
              const maxAllowedDist = word.length >= 6 ? 2 : 1;
              if (dist <= maxAllowedDist) {
                score += 80;
                wordFound = true;
                break;
              }
            }
          }
        }

        if (wordFound) matchedCount++;
      });

      if (matchedCount === words.length && words.length > 1) {
        score += 300; // Bonus for matching all search words
      }
    }

    return score;
  }

  // Filter Logic & Execution with Ranking
  function applyFilters() {
    let result = catalogData;

    // Filter by Category
    if (activeState.category !== 'all') {
      result = result.filter(p => p.category === activeState.category);
    }

    // Filter by Subcategory/Team
    if (activeState.subcategory !== 'all') {
      result = result.filter(p => p.subcategory === activeState.subcategory);
    }

    // Filter by Type
    if (activeState.type !== 'all') {
      result = result.filter(p => p.type === activeState.type);
    }

    // Filter by Gender
    if (activeState.gender !== 'all') {
      result = result.filter(p => p.gender === activeState.gender);
    }

    // Filter by Search Query with Intelligent Relevance Ranking
    if (activeState.search.trim()) {
      const rawQuery = activeState.search.trim();
      const normQuery = normalize(rawQuery);
      const words = normQuery.split(' ').filter(w => w.length > 0);

      const scoredProducts = [];
      const seenIds = new Set();

      result.forEach(p => {
        const score = calculateRelevance(p, normQuery, words);
        if (score > 0 && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          scoredProducts.push({ product: p, score });
        }
      });

      // Sort by relevance score descending
      scoredProducts.sort((a, b) => b.score - a.score);
      result = scoredProducts.map(sp => sp.product);

      // Toggle Clear Button
      if (elements.btnSearchClear) elements.btnSearchClear.style.display = 'flex';
      saveRecentSearch(rawQuery);
    } else {
      if (elements.btnSearchClear) elements.btnSearchClear.style.display = 'none';
    }

    filteredProducts = result;
    currentPageBatch = 1;

    updateBreadcrumbs();
    updateActiveFiltersSummary();
    renderTeamFilterPills();
    renderProductsGrid();
    updateURLParams();
  }

  // Highlight Matched Query Term in Title
  function highlightMatch(title, query) {
    if (!query || !query.trim()) return escapeHtml(title);
    const normQuery = normalize(query);
    if (!normQuery) return escapeHtml(title);

    const words = normQuery.split(' ').filter(w => w.length >= 2);
    if (words.length === 0) return escapeHtml(title);

    const regex = new RegExp(`(${words.map(w => escapeRegExp(w)).join('|')})`, 'gi');
    return escapeHtml(title).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Render Product Grid Batches
  function renderProductsGrid() {
    const productsToDisplay = filteredProducts.slice(0, currentPageBatch * BATCH_SIZE);
    const totalCount = filteredProducts.length;

    // Counter Text
    if (activeState.search.trim()) {
      elements.resultsCountText.textContent = `${totalCount.toLocaleString('pt-BR')} ${totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'} para "${activeState.search}"`;
    } else {
      elements.resultsCountText.textContent = `Exibindo ${productsToDisplay.length.toLocaleString('pt-BR')} de ${totalCount.toLocaleString('pt-BR')} produtos no catálogo`;
    }

    if (totalCount === 0) {
      elements.productsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Nenhum produto encontrado</div>
          <div class="empty-state-desc">
            Tente pesquisar pelo nome do time, seleção, temporada ou modelo da camisa.
          </div>
          <div class="suggested-pills-row">
            <button class="filter-pill" onclick="window.setQuickSearch('Real Madrid')">Real Madrid</button>
            <button class="filter-pill" onclick="window.setQuickSearch('Brasil')">Brasil</button>
            <button class="filter-pill" onclick="window.setQuickSearch('Barcelona')">Barcelona</button>
            <button class="filter-pill" onclick="window.setQuickSearch('Manchester United')">Manchester United</button>
            <button class="filter-pill" onclick="window.setQuickSearch('Retrô')">Retrô</button>
          </div>
        </div>
      `;
      elements.infiniteScrollSentinel.style.display = 'none';
      return;
    }

    elements.productsGrid.innerHTML = productsToDisplay.map(product => {
      const coverPath = getProductImageUrl(product.dir, product.cover);
      const highlightedTitle = highlightMatch(product.title, activeState.search);
      const safeTitleEscaped = escapeHtml(product.title).replace(/'/g, "\\'");
      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-thumb-container">
            <img src="${coverPath}" alt="${escapeHtml(product.title)}" loading="lazy" onerror="window.handleImageError(this, '${coverPath}', '${product.id}', '${safeTitleEscaped}');" />
            ${product.imageCount > 1 ? `<div class="image-count-badge">📷 ${product.imageCount}</div>` : ''}
          </div>
          <div class="product-info">
            <div class="product-category-tag">${escapeHtml(product.category)} • ${escapeHtml(product.subcategory)}</div>
            <div class="product-title">${highlightedTitle}</div>
            <div class="product-tags-row">
              <span class="mini-badge ${product.type === 'Retrô' ? 'badge-retro' : ''}">${escapeHtml(product.type)}</span>
              ${product.season ? `<span class="mini-badge">${escapeHtml(product.season)}</span>` : ''}
              ${product.gender !== 'Masculino' ? `<span class="mini-badge">${escapeHtml(product.gender)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const prodId = card.getAttribute('data-product-id');
        const prod = catalogData.find(p => p.id === prodId);
        if (prod) openLightbox(prod);
      });
    });

    if (productsToDisplay.length < filteredProducts.length) {
      elements.infiniteScrollSentinel.style.display = 'flex';
    } else {
      elements.infiniteScrollSentinel.style.display = 'none';
    }
  }

  // Quick Search Helper for Empty State Buttons
  window.setQuickSearch = function (term) {
    elements.globalSearchInput.value = term;
    activeState.search = term;
    applyFilters();
  };

  // Load Next Batch on Scroll
  function loadNextBatch() {
    if (currentPageBatch * BATCH_SIZE >= filteredProducts.length) return;
    currentPageBatch++;
    renderProductsGrid();
  }

  // Intersection Observer for Infinite Scroll
  function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadNextBatch();
        }
      }, { rootMargin: '300px' });

      if (elements.infiniteScrollSentinel) {
        observer.observe(elements.infiniteScrollSentinel);
      }
    }
  }

  // Search History (localStorage)
  function getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('pl_recent_searches') || '[]');
    } catch (e) { return []; }
  }

  function saveRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    let searches = getRecentSearches();
    const cleanQ = query.trim();
    searches = searches.filter(s => s.toLowerCase() !== cleanQ.toLowerCase());
    searches.unshift(cleanQ);
    if (searches.length > 5) searches = searches.slice(0, 5);
    localStorage.setItem('pl_recent_searches', JSON.stringify(searches));
  }

  function clearRecentSearches() {
    localStorage.removeItem('pl_recent_searches');
    hideSearchDropdown();
  }

  // Search Suggestions & Dropdown UI
  function showSearchDropdown() {
    if (!elements.searchDropdown) return;
    const query = elements.globalSearchInput.value.trim();
    const recent = getRecentSearches();

    let html = '';

    if (query.length === 0) {
      if (recent.length > 0) {
        html += `
          <div class="dropdown-section-title">
            <span>Pesquisas Recentes</span>
            <button id="btn-clear-search-history">Limpar</button>
          </div>
          ${recent.map(term => `
            <div class="dropdown-item" data-search-term="${escapeHtml(term)}">
              <span class="dropdown-item-icon">🕒</span>
              <span>${escapeHtml(term)}</span>
            </div>
          `).join('')}
        `;
      }
      
      html += `
        <div class="dropdown-section-title">Sugestões Populares</div>
        <div class="dropdown-item" data-search-term="Real Madrid"><span class="dropdown-item-icon">🔥</span> Real Madrid</div>
        <div class="dropdown-item" data-search-term="Brasil"><span class="dropdown-item-icon">🔥</span> Brasil</div>
        <div class="dropdown-item" data-search-term="Barcelona"><span class="dropdown-item-icon">🔥</span> Barcelona</div>
        <div class="dropdown-item" data-search-term="Manchester United"><span class="dropdown-item-icon">🔥</span> Manchester United</div>
        <div class="dropdown-item" data-search-term="PSG"><span class="dropdown-item-icon">🔥</span> PSG</div>
      `;
    } else {
      const normQ = normalize(query);
      const matchingTeams = categoriesData
        .flatMap(c => Object.keys(c.subcategories || {}))
        .filter(t => normalize(t).includes(normQ) || normQ.includes(normalize(t)))
        .slice(0, 5);

      if (matchingTeams.length > 0) {
        html += `<div class="dropdown-section-title">Times Relacionados</div>`;
        html += matchingTeams.map(t => `
          <div class="dropdown-item" data-search-term="${escapeHtml(t)}">
            <span class="dropdown-item-icon">⚽</span>
            <span>${escapeHtml(t)}</span>
          </div>
        `).join('');
      }
    }

    if (html) {
      elements.searchDropdown.innerHTML = html;
      elements.searchDropdown.style.display = 'block';

      // Attach click listeners to dropdown items
      elements.searchDropdown.querySelectorAll('[data-search-term]').forEach(item => {
        item.addEventListener('click', () => {
          const term = item.getAttribute('data-search-term');
          elements.globalSearchInput.value = term;
          activeState.search = term;
          hideSearchDropdown();
          applyFilters();
        });
      });

      const clearHistBtn = document.getElementById('btn-clear-search-history');
      if (clearHistBtn) {
        clearHistBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearRecentSearches();
        });
      }
    } else {
      elements.searchDropdown.style.display = 'none';
    }
  }

  function hideSearchDropdown() {
    if (elements.searchDropdown) {
      elements.searchDropdown.style.display = 'none';
    }
  }

  // Category Selector Helper
  function setCategoryFilter(categoryName) {
    activeState.category = categoryName;
    activeState.subcategory = 'all';

    elements.filterCategoriesRow.querySelectorAll('[data-cat-pill]').forEach(btn => {
      if (btn.getAttribute('data-cat-pill') === categoryName) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    applyFilters();
  }

  // Update Breadcrumb UI
  function updateBreadcrumbs() {
    let breadcrumbHtml = `<span class="breadcrumb-item" data-breadcrumb="home">Início</span>`;
    
    if (activeState.category === 'all') {
      breadcrumbHtml += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-current">Catálogo Completo</span>`;
    } else {
      breadcrumbHtml += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-item" data-breadcrumb="catalogo">Catálogo</span>`;
      
      if (activeState.subcategory === 'all') {
        breadcrumbHtml += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-current">${escapeHtml(activeState.category)}</span>`;
      } else {
        breadcrumbHtml += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-item" data-breadcrumb="cat-item">${escapeHtml(activeState.category)}</span>`;
        breadcrumbHtml += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-current">${escapeHtml(activeState.subcategory)}</span>`;
      }
    }

    elements.breadcrumbsContainer.innerHTML = breadcrumbHtml;

    elements.breadcrumbsContainer.querySelectorAll('[data-breadcrumb]').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.getAttribute('data-breadcrumb');
        if (type === 'home' || type === 'catalogo') setCategoryFilter('all');
        else if (type === 'cat-item') { activeState.subcategory = 'all'; applyFilters(); }
      });
    });
  }

  // Active Filters Summary UI
  function updateActiveFiltersSummary() {
    const tags = [];

    if (activeState.category !== 'all') tags.push({ label: `Categoria: ${activeState.category}`, key: 'category' });
    if (activeState.subcategory !== 'all') tags.push({ label: `Time: ${activeState.subcategory}`, key: 'subcategory' });
    if (activeState.type !== 'all') tags.push({ label: `Edição: ${activeState.type}`, key: 'type' });
    if (activeState.gender !== 'all') tags.push({ label: `Público: ${activeState.gender}`, key: 'gender' });
    if (activeState.search.trim()) tags.push({ label: `Busca: "${activeState.search}"`, key: 'search' });

    if (tags.length === 0) {
      elements.activeFiltersContainer.innerHTML = '';
      return;
    }

    elements.activeFiltersContainer.innerHTML = tags.map(tag => `
      <span class="active-tag">
        ${escapeHtml(tag.label)}
        <button data-remove-filter="${tag.key}">✕</button>
      </span>
    `).join('') + `
      <button class="filter-pill" id="btn-clear-all-filters" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;">Limpar Filtros</button>
    `;

    elements.activeFiltersContainer.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-remove-filter');
        if (key === 'category') setCategoryFilter('all');
        else if (key === 'subcategory') { activeState.subcategory = 'all'; applyFilters(); }
        else if (key === 'type') { setTypeFilter('all'); }
        else if (key === 'gender') { setGenderFilter('all'); }
        else if (key === 'search') {
          activeState.search = '';
          elements.globalSearchInput.value = '';
          applyFilters();
        }
      });
    });

    const clearAllBtn = document.getElementById('btn-clear-all-filters');
    if (clearAllBtn) clearAllBtn.addEventListener('click', resetAllFilters);
  }

  function resetAllFilters() {
    activeState = { category: 'all', subcategory: 'all', type: 'all', gender: 'all', search: '' };
    elements.globalSearchInput.value = '';
    renderCategoryFilterPills();
    applyFilters();
  }

  function setTypeFilter(type) {
    activeState.type = type;
    elements.filterOptionsRow.querySelectorAll('[data-filter-type]').forEach(btn => {
      if (btn.getAttribute('data-filter-type') === type) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    applyFilters();
  }

  function setGenderFilter(gender) {
    activeState.gender = gender;
    elements.filterOptionsRow.querySelectorAll('[data-filter-gender]').forEach(btn => {
      if (btn.getAttribute('data-filter-gender') === gender) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    applyFilters();
  }

  // Lightbox Modal Functionality
  function openLightbox(product) {
    currentLightboxProduct = product;
    currentImageIndex = 0;
    renderLightboxView();
    elements.lightboxModal.classList.add('active');
    elements.lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    elements.lightboxModal.classList.remove('active');
    elements.lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderLightboxView() {
    if (!currentLightboxProduct) return;

    const imgName = currentLightboxProduct.images[currentImageIndex];
    const imgUrl = getProductImageUrl(currentLightboxProduct.dir, imgName);
    const safeTitleEscaped = escapeHtml(currentLightboxProduct.title).replace(/'/g, "\\'");

    elements.lightboxTitle.textContent = currentLightboxProduct.title;
    elements.lightboxMeta.textContent = `${currentLightboxProduct.category} > ${currentLightboxProduct.subcategory} • Foto ${currentImageIndex + 1} de ${currentLightboxProduct.images.length}`;
    elements.lightboxImage.src = imgUrl;
    elements.lightboxImage.onerror = function() {
      window.handleImageError(this, imgUrl, currentLightboxProduct.id, safeTitleEscaped);
    };

    const waBtn = document.getElementById('lightbox-whatsapp-btn');
    if (waBtn) {
      const msg = encodeURIComponent(`Olá! Vim pelo catálogo PL Fornecimento e tenho interesse no modelo:\n📦 ${currentLightboxProduct.title}\n📁 Categoria: ${currentLightboxProduct.category} - ${currentLightboxProduct.subcategory}`);
      waBtn.href = `https://wa.me/5585992528809?text=${msg}`;
    }

    if (currentLightboxProduct.images.length > 1) {
      elements.lightboxPrevBtn.style.display = 'flex';
      elements.lightboxNextBtn.style.display = 'flex';
      elements.lightboxThumbnails.style.display = 'flex';

      elements.lightboxThumbnails.innerHTML = currentLightboxProduct.images.map((img, idx) => {
        const thumbUrl = getProductImageUrl(currentLightboxProduct.dir, img);
        return `
          <div class="lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}" data-thumb-idx="${idx}">
            <img src="${thumbUrl}" alt="Miniatura ${idx + 1}" onerror="window.handleImageError(this, '${thumbUrl}', '${currentLightboxProduct.id}', '${safeTitleEscaped}');" />
          </div>
        `;
      }).join('');

      elements.lightboxThumbnails.querySelectorAll('.lightbox-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          currentImageIndex = parseInt(thumb.getAttribute('data-thumb-idx'), 10);
          renderLightboxView();
        });
      });
    } else {
      elements.lightboxPrevBtn.style.display = 'none';
      elements.lightboxNextBtn.style.display = 'none';
      elements.lightboxThumbnails.style.display = 'none';
    }
  }

  function prevLightboxImage() {
    if (!currentLightboxProduct || currentLightboxProduct.images.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentLightboxProduct.images.length) % currentLightboxProduct.images.length;
    renderLightboxView();
  }

  function nextLightboxImage() {
    if (!currentLightboxProduct || currentLightboxProduct.images.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentLightboxProduct.images.length;
    renderLightboxView();
  }

  // Event Listeners Setup
  function setupEventListeners() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) elements.btnBackToTop.classList.add('visible');
      else elements.btnBackToTop.classList.remove('visible');
    });

    if (elements.btnMobileToggle) {
      elements.btnMobileToggle.addEventListener('click', () => {
        elements.navMenu.classList.toggle('mobile-open');
      });
    }

    // Debounced Search & Dropdown Events
    let searchTimeout;
    elements.globalSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      showSearchDropdown();
      searchTimeout = setTimeout(() => {
        activeState.search = e.target.value;
        applyFilters();
      }, 250); // 250ms Debounce
    });

    elements.globalSearchInput.addEventListener('focus', () => {
      showSearchDropdown();
    });

    // Clear Search Button
    if (elements.btnSearchClear) {
      elements.btnSearchClear.addEventListener('click', () => {
        elements.globalSearchInput.value = '';
        activeState.search = '';
        hideSearchDropdown();
        applyFilters();
      });
    }

    // Hide Search Dropdown on Click Outside
    document.addEventListener('click', (e) => {
      if (elements.headerSearchContainer && !elements.headerSearchContainer.contains(e.target)) {
        hideSearchDropdown();
      }
    });

    // Type & Gender Buttons
    elements.filterOptionsRow.querySelectorAll('[data-filter-type]').forEach(btn => {
      btn.addEventListener('click', () => { setTypeFilter(btn.getAttribute('data-filter-type')); });
    });

    elements.filterOptionsRow.querySelectorAll('[data-filter-gender]').forEach(btn => {
      btn.addEventListener('click', () => { setGenderFilter(btn.getAttribute('data-filter-gender')); });
    });

    // Lightbox Nav
    elements.lightboxCloseBtn.addEventListener('click', closeLightbox);
    elements.lightboxPrevBtn.addEventListener('click', prevLightboxImage);
    elements.lightboxNextBtn.addEventListener('click', nextLightboxImage);

    elements.lightboxModal.addEventListener('click', (e) => {
      if (e.target === elements.lightboxModal || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-main-view')) {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!elements.lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
    });

    elements.lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    elements.lightboxModal.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) prevLightboxImage();
        else nextLightboxImage();
      }
    }, { passive: true });

    elements.btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function scrollToCatalogSection() {
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  }

  function updateURLParams() {
    const params = new URLSearchParams();
    if (activeState.category !== 'all') params.set('category', activeState.category);
    if (activeState.subcategory !== 'all') params.set('team', activeState.subcategory);
    if (activeState.type !== 'all') params.set('type', activeState.type);
    if (activeState.gender !== 'all') params.set('gender', activeState.gender);
    if (activeState.search.trim()) params.set('q', activeState.search.trim());

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }

  function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) activeState.category = params.get('category');
    if (params.has('team')) activeState.subcategory = params.get('team');
    if (params.has('type')) activeState.type = params.get('type');
    if (params.has('gender')) activeState.gender = params.get('gender');
    if (params.has('q')) {
      activeState.search = params.get('q');
      elements.globalSearchInput.value = activeState.search;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
