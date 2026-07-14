let menuData = [];
let activeCategory = 'All';

const slugMap = {
  'Blondie': '7-brew-blondie',
  'Brunette': '7-brew-brunette',
  'Smooth 7': '7-brew-smooth-7',
  'White Mac': '7-brew-white-mac',
  'German Chocolate': '7-brew-german-chocolate',
  'Snickerz': '7-brew-snickerz',
  'Cinnamon Roll': '7-brew-cinnamon-roll',
  'Triple Seven': '7-brew-triple-seven',
  'Ocean Breeze': '7-brew-ocean-breeze-7-energy',
  'Tropic Thunder': '7-brew-tropic-thunder-7-energy',
  'Sunrise': '7-brew-sunrise-7-energy'
};

const categorySlugMap = {
  'All': 'menu',
  '7 Originals': '7orignal',
  '7 Classics': '7classics',
  'Featured Drinks': 'featured-drinks',
  '7 Energy': '7energy',
  '7 Fizz': '7fizz',
  'Teas, Chai & Matcha': 'teas-chai-matcha',
  'Secret Menu': 'secret-menu'
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    setupEventListeners();
  });
} else {
  fetchMenu();
  setupEventListeners();
}

// Fetch menu from JSON database
async function fetchMenu() {
  try {
    const response = await fetch('data/menu.json');
    if (!response.ok) throw new Error('Failed to load menu database.');
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    menuData = JSON.parse(cleanText);
    
    // Check for category filter in URL query, hash, or clean pathnames
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    
    const reverseCategorySlugMap = {
      '7orignal': '7 Originals',
      '7classics': '7 Classics',
      'featured-drinks': 'Featured Drinks',
      '7energy': '7 Energy',
      '7fizz': '7 Fizz',
      'teas-chai-matcha': 'Teas, Chai & Matcha',
      'secret-menu': 'Secret Menu',
      '7brew-secret-menu': 'Secret Menu'
    };
    
    const matchedSlug = Object.keys(reverseCategorySlugMap).find(slug => path.endsWith('/' + slug));
    
    if (catParam) {
      activeCategory = catParam;
    } else if (matchedSlug) {
      activeCategory = reverseCategorySlugMap[matchedSlug];
    } else if (window.location.hash === '#secret-menu' || path.endsWith('/7brew-secret-menu') || path.endsWith('/secret-menu')) {
      activeCategory = 'Secret Menu';
    }
    
    renderCategoryFilterTags();
    applyFilters();
    
    // Handle scrolling to recipes section if requested
    if (window.location.hash === '#recipes' || path.endsWith('/7brew-recipe-maker') || path.endsWith('/recipe-maker')) {
      setTimeout(() => {
        const el = document.getElementById('recipes');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  } catch (error) {
    console.error(error);
    const grid = document.getElementById('menu-grid');
    if (grid) {
      grid.innerHTML = `<p class="error-message">Oops! We couldn't load the menu right now. Please try again later.</p>`;
    }
  }
}

// No need for filter tag rendering in section-based view
function renderCategoryFilterTags() {
  // Empty stub to maintain compatibility with fetchMenu call
}

// Main Render Function for Categorized Sections
function renderMenu(items) {
  const container = document.getElementById('menu-sections-container');
  if (!container) return;

  const searchInput = document.getElementById('menu-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // If search is active, render all matching items in a single grid
  if (query) {
    container.innerHTML = `
      <section class="menu-category-section" style="margin-top: 40px;">
        <h2 class="category-section-title" style="font-size: 2.2rem; font-family: var(--font-heading); margin-bottom: 24px; border-bottom: 2px solid var(--border-glass); padding-bottom: 12px; color: var(--text-white); font-style: italic;">
          Search Results for "${query}"
        </h2>
        <div class="menu-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
          ${items.map(item => renderDrinkCard(item)).join('')}
        </div>
      </section>
    `;
    return;
  }

  // Define the categories and their sections
  const categoryGroups = {
    '7-fizz': { title: '7 Fizz', items: [] },
    '7-classics': { title: 'Classics', items: [] },
    '7-energy': { title: '7 Energy', items: [] },
    'teas': { title: 'Teas, Chai & Matcha', items: [] },
    'smoothies': { title: 'Smoothies', items: [] },
    '7-originals': { title: '7 Originals', items: [] },
    'lemonades': { title: 'Lemonade', items: [] },
    'shakes': { title: '7 Milkshake', items: [] },
    'secret-menu': { title: 'Secret Menu', items: [] },
    'extras': { title: 'Extras & Kids Drinks', items: [] }
  };

  // Group items
  items.forEach(item => {
    const cat = item.category;
    if (cat === '7 Originals') {
      categoryGroups['7-originals'].items.push(item);
    } else if (cat === '7 Classics') {
      categoryGroups['7-classics'].items.push(item);
    } else if (cat === '7 Energy') {
      categoryGroups['7-energy'].items.push(item);
    } else if (cat === '7 Fizz') {
      categoryGroups['7-fizz'].items.push(item);
    } else if (cat === 'Teas, Chai & Matcha') {
      categoryGroups['teas'].items.push(item);
    } else if (cat === 'Lemonades') {
      categoryGroups['lemonades'].items.push(item);
    } else if (cat === 'Smoothies') {
      categoryGroups['smoothies'].items.push(item);
    } else if (cat === 'Shakes') {
      categoryGroups['shakes'].items.push(item);
    } else if (cat === 'Secret Menu') {
      categoryGroups['secret-menu'].items.push(item);
    } else if (cat === 'Kids Drinks' || cat === 'Snacks / Food' || cat === 'Featured Drinks') {
      categoryGroups['extras'].items.push(item);
    }
  });

  // Render each non-empty group as a section
  container.innerHTML = Object.entries(categoryGroups).map(([id, group]) => {
    if (group.items.length === 0) return '';
    return `
      <section id="${id}" class="menu-category-section" style="margin-top: 60px; scroll-margin-top: 100px;">
        <h2 class="category-section-title" style="font-size: 2.2rem; font-family: var(--font-heading); margin-bottom: 24px; border-bottom: 2px solid var(--border-glass); padding-bottom: 12px; color: var(--text-white); font-style: italic;">
          ${group.title}
        </h2>
        <div class="menu-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
          ${group.items.map(item => renderDrinkCard(item)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

// Render individual drink card
function renderDrinkCard(item) {
  const defaultPrice = item.sizes.medium ? item.sizes.medium.price : (item.sizes.small ? item.sizes.small.price : 0);
  const isFav = window.FavoritesManager.isFav(item.name);
  
  return `
    <article class="drink-card" data-name="${item.name}">
      <div class="drink-image-wrap">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop';" loading="lazy">
        <button class="favorite-btn ${isFav ? 'active' : ''}" aria-label="Favorite ${item.name}" onclick="event.stopPropagation(); toggleFavorite('${item.name}', this)">
          &#9829;
        </button>
      </div>
      <div class="drink-info" onclick="openDrinkModal('${item.name}')">
        <span class="drink-category-label">${item.category}</span>
        <h3 class="drink-title">${item.name}</h3>
        <p class="drink-description">${item.description}</p>
        <div class="drink-meta-row">
          <span class="drink-price">$${defaultPrice.toFixed(2)}</span>
          <button class="btn btn-secondary" style="padding: 6px 16px; font-size: 0.75rem;">View Details</button>
        </div>
      </div>
    </article>
  `;
}

// Favorites Toggle Callback
window.toggleFavorite = function(name, btnElement) {
  const currentFavs = window.FavoritesManager.toggle(name);
  if (currentFavs.includes(name)) {
    btnElement.classList.add('active');
  } else {
    btnElement.classList.remove('active');
  }
};

// Open Drink Details Modal Popup
window.openDrinkModal = function(name) {
  const slug = slugMap[name];
  if (slug) {
    window.location.href = slug;
    return;
  }
  const item = menuData.find(d => d.name === name);
  if (!item) return;

  const modal = document.getElementById('drink-modal');
  const modalBody = document.getElementById('modal-body-content');
  if (!modal || !modalBody) return;

  const isFav = window.FavoritesManager.isFav(item.name);

  let sizesHtml = '';
  for (const [size, details] of Object.entries(item.sizes)) {
    sizesHtml += `
      <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-glass);">
        <strong style="text-transform: capitalize; color: var(--color-primary);">${size}</strong><br>
        Price: $${details.price.toFixed(2)}<br>
        Calories: ${details.calories}
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
      <div>
        <img src="${item.image}" alt="${item.name}" style="border-radius: var(--border-radius-md); width: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop';">
      </div>
      <div>
        <span style="color: var(--color-secondary); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">${item.category}</span>
        <h2 style="font-size: 2.2rem; margin: 8px 0 16px 0;">${item.name}</h2>
        <p style="color: var(--text-gray); margin-bottom: 24px;">${item.description}</p>
        
        <h4 style="margin-bottom: 10px; color: var(--text-white);">Sizes & Pricing</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px;">
          ${sizesHtml}
        </div>

        <h4 style="margin-bottom: 10px; color: var(--text-white);">Ingredients</h4>
        <p style="color: var(--text-gray); margin-bottom: 24px;">${item.ingredients.join(', ')}</p>

        <h4 style="margin-bottom: 10px; color: var(--text-white);">Nutrition Facts</h4>
        <ul style="list-style: none; display: flex; gap: 20px; color: var(--text-gray); padding: 0;">
          <li><strong>Caffeine:</strong> ${item.caffeine}</li>
          <li><strong>Sugar:</strong> ${item.sugar}</li>
        </ul>

        <div style="margin-top: 30px; display: flex; gap: 16px;">
          <button class="btn btn-primary" onclick="toggleFavorite('${item.name}', this); this.innerHTML = window.FavoritesManager.isFav('${item.name}') ? 'Favorited &#9829;' : 'Favorite Drink';">
            ${isFav ? 'Favorited &#9829;' : 'Favorite Drink'}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Close Modal Callback
window.closeModal = function() {
  const modal = document.getElementById('drink-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

// Filter, Search, and Sort Logic combined
function applyFilters() {
  let filtered = [...menuData];

  // Category filter
  if (activeCategory !== 'All') {
    filtered = filtered.filter(item => item.category === activeCategory);
  }

  // Search filter
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    const q = searchInput.value.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.ingredients.some(ing => ing.toLowerCase().includes(q))
      );
    }
  }

  // Sort filter
  const sortSelect = document.getElementById('menu-sort');
  if (sortSelect) {
    const sortVal = sortSelect.value;
    if (sortVal === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'price-low') {
      filtered.sort((a, b) => getPriceForSorting(a) - getPriceForSorting(b));
    } else if (sortVal === 'price-high') {
      filtered.sort((a, b) => getPriceForSorting(b) - getPriceForSorting(a));
    } else if (sortVal === 'calories-low') {
      filtered.sort((a, b) => getCaloriesForSorting(a) - getCaloriesForSorting(b));
    } else if (sortVal === 'calories-high') {
      filtered.sort((a, b) => getCaloriesForSorting(b) - getCaloriesForSorting(a));
    }
  }

  renderMenu(filtered);
}

function getPriceForSorting(item) {
  const sizeObj = item.sizes.medium || item.sizes.small || Object.values(item.sizes)[0];
  return sizeObj ? sizeObj.price : 0;
}

function getCaloriesForSorting(item) {
  const sizeObj = item.sizes.medium || item.sizes.small || Object.values(item.sizes)[0];
  return sizeObj ? sizeObj.calories : 0;
}

function setupEventListeners() {
  // Live search keypress
  const search = document.getElementById('menu-search');
  if (search) search.addEventListener('input', applyFilters);

  // Sorting selection
  const sort = document.getElementById('menu-sort');
  if (sort) sort.addEventListener('change', applyFilters);

  // Close modal when clicking dark overlay
  const modal = document.getElementById('drink-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Handle same-page hash changes for smooth scrolling
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Secret Menu Builder Logic
window.generateSecretRecipe = function() {
  const nameInput = document.getElementById('mix-name');
  const baseSelect = document.getElementById('mix-base');
  const topSelect = document.getElementById('mix-top');
  const display = document.getElementById('recipe-card-display');

  if (!nameInput || !baseSelect || !topSelect || !display) return;

  const drinkName = nameInput.value.trim() || "Secret Drink Customizer";
  const baseVal = baseSelect.value;
  const topVal = topSelect.value;

  // Gather checked syrups
  const syrupNodes = document.querySelectorAll('.mix-syrup:checked');
  const syrups = Array.from(syrupNodes).map(node => node.value);

  if (syrups.length === 0) {
    alert("Please select at least 1 Mix-in Syrup for your custom secret recipe!");
    return;
  }

  // Construct Barista Readout
  let syrupPart = syrups.join(' & ');
  let toppingPart = topVal !== 'None' ? `, topped with ${topVal}` : '';
  const orderScript = `I'd like a medium Iced ${baseVal} with ${syrupPart}${toppingPart}, please!`;

  display.innerHTML = `
    <div style="width: 100%; border: 2px dashed var(--color-primary); padding: 20px; border-radius: var(--border-radius-sm); text-align: left; background: var(--bg-card);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; margin-bottom: 16px;">
        <span style="font-family: var(--font-heading); font-weight: 700; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase;">Barista Ticket</span>
        <span style="color: var(--color-accent); font-size: 0.8rem;">#SECRET-MENU</span>
      </div>
      
      <h4 style="font-size: 1.6rem; color: var(--text-white); font-family: var(--font-heading); margin-bottom: 8px;">${drinkName}</h4>
      <p style="color: var(--color-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 16px;">Base: ${baseVal}</p>
      
      <div style="background: var(--bg-primary); padding: 14px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-glass); margin-bottom: 20px;">
        <strong style="display: block; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">How to Order:</strong>
        <p style="color: var(--text-white); font-style: italic; line-height: 1.5; font-size: 0.95rem;">"${orderScript}"</p>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
        <span>Mix-ins: ${syrupPart}</span>
        <span>Topping: ${topVal}</span>
      </div>
    </div>
    
    <button class="btn btn-secondary" style="margin-top: 20px; font-size: 0.75rem; padding: 6px 14px;" onclick="location.reload()">Clear Card</button>
  `;
};

