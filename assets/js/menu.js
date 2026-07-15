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
  'Ocean Breeze': '7-brew-ocean-breeze-7-energy',
  'Tropic Thunder': '7-brew-tropic-thunder-7-energy',
  'Sunrise': '7-brew-sunrise-7-energy',
  'Triple 7': '7-brew-triple-seven'
};

const categoryIdMap = {
  '7 Originals': '7-originals',
  '7 Classics': '7-classics',
  '7 Energy': '7-energy',
  '7 Fizz': '7-fizz',
  'Teas, Chai & Matcha': 'teas',
  'Lemonades': 'lemonades',
  'Smoothies': 'smoothies',
  'Shakes': 'shakes',
  'Featured Drinks': 'featured-drinks',
  'Kids Drinks': 'kids-drinks',
  'Secret Menu': 'secret-menu',
  'Snacks / Food': 'extras'
};

document.addEventListener('DOMContentLoaded', () => {
  fetchMenu();
  setupEventListeners();
});

// Fetch menu from JSON database
async function fetchMenu() {
  try {
    const response = await fetch('/data/menu.json');
    if (!response.ok) throw new Error('Failed to load menu database.');
    menuData = await response.json();
    
    // Check for category filter in URL query, hash, or clean pathnames
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    
    if (catParam) {
      activeCategory = catParam;
    } else if (window.location.hash === '#secret-menu' || path.endsWith('/7brew-secret-menu') || path.endsWith('/secret-menu')) {
      activeCategory = 'Secret Menu';
    }
    
    renderCategoryFilterTags();
    applyFilters();
    
    // Handle scrolling to requested hash element (e.g. #7-originals, #7-energy, #recipes)
    if (window.location.hash) {
      const hashVal = window.location.hash;
      setTimeout(() => {
        try {
          const targetId = hashVal.replace('#', '');
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          console.error('Failed to scroll to target:', hashVal, e);
        }
      }, 600);
    } else if (path.endsWith('/7brew-recipe-maker') || path.endsWith('/recipe-maker')) {
      setTimeout(() => {
        const el = document.getElementById('recipes');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
  } catch (error) {
    console.error(error);
    const container = document.getElementById('menu-sections-container');
    if (container) {
      container.innerHTML = `<p class="error-message">Oops! We couldn't load the menu right now. Please try again later.</p>`;
    }
  }
}

// Render dynamic category filter tags
function renderCategoryFilterTags() {
  const container = document.getElementById('category-tags');
  if (!container) return;

  const categories = ['All', ...new Set(menuData.map(item => item.category))];
  container.innerHTML = categories.map(cat => `
    <button class="category-tag ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');

  // Add click events to tag buttons
  container.querySelectorAll('.category-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      applyFilters();
    });
  });
}

// Main Render Function for Grid Cards
function renderMenu(items) {
  const container = document.getElementById('menu-sections-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-gray); padding: 40px 0;">No matching drinks found. Try adjusting your filters!</div>`;
    return;
  }

  // Group items by category
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  // Sort categories or output them in order
  const categoryOrder = [
    '7 Originals',
    '7 Classics',
    'Featured Drinks',
    '7 Energy',
    '7 Fizz',
    'Teas, Chai & Matcha',
    'Lemonades',
    'Smoothies',
    'Shakes',
    'Kids Drinks',
    'Secret Menu',
    'Snacks / Food'
  ];

  let html = '';
  
  // Render categories in order if they exist, or append any others
  const categoriesToRender = categoryOrder.filter(cat => grouped[cat]);
  // Add any categories not in the ordered list
  Object.keys(grouped).forEach(cat => {
    if (!categoriesToRender.includes(cat)) {
      categoriesToRender.push(cat);
    }
  });

  categoriesToRender.forEach(cat => {
    const catItems = grouped[cat];
    const sectionId = categoryIdMap[cat] || cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    html += `
      <section class="menu-category-section" id="${sectionId}" style="margin-bottom: 60px; scroll-margin-top: 120px;">
        <h2 style="font-size: 2.2rem; font-family: var(--font-heading); margin-bottom: 24px; padding-bottom: 10px; border-bottom: 2px solid var(--color-primary); color: var(--text-white); text-shadow: 0 0 10px rgba(0, 225, 255, 0.2);">${cat}</h2>
        <div class="menu-grid">
          ${catItems.map(item => {
            const defaultPrice = item.sizes.medium ? item.sizes.medium.price : (item.sizes.small ? item.sizes.small.price : 0);
            const isFav = window.FavoritesManager.isFav(item.name);
            return `
              <article class="drink-card" data-name="${item.name.replace(/"/g, '&quot;')}">
                <div class="drink-image-wrap">
                  <img src="${item.image}" alt="${item.name.replace(/"/g, '&quot;')}" onerror="this.src='https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop';" loading="lazy">
                  <button class="favorite-btn ${isFav ? 'active' : ''}" aria-label="Favorite" onclick="event.stopPropagation(); toggleFavorite(this.closest('.drink-card').getAttribute('data-name'), this)">
                    &#9829;
                  </button>
                </div>
                <div class="drink-info" onclick="openDrinkModal(this.closest('.drink-card').getAttribute('data-name'))">
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
          }).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;
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
    window.location.href = slug + '.html';
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

  // Handle same-page hash changes for Secret Menu and Recipe Maker
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#secret-menu') {
      activeCategory = 'Secret Menu';
      const container = document.getElementById('category-tags');
      if (container) {
        container.querySelectorAll('.category-tag').forEach(b => {
          if (b.dataset.category === 'Secret Menu') {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      }
      applyFilters();
    } else if (window.location.hash === '#recipes') {
      const el = document.getElementById('recipes');
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

