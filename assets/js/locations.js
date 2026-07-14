let locationsData = [];
let activeState = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchLocations();
  setupEventListeners();
});

async function fetchLocations() {
  try {
    const response = await fetch('data/locations.json');
    if (!response.ok) throw new Error('Failed to load locations database.');
    locationsData = await response.json();
    renderLocations(locationsData);
    populateStateFilter();
    
    // Check URL parameters or clean pathnames for custom filters
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    
    if (filterParam === 'hours' || path.endsWith('/7brew-hours') || path.endsWith('/hours')) {
      setTimeout(() => {
        document.querySelectorAll('.location-hours').forEach(el => {
          el.style.border = '2px solid var(--color-primary)';
          el.style.boxShadow = 'var(--shadow-neon)';
          el.style.padding = '8px';
          el.style.borderRadius = 'var(--border-radius-sm)';
        });
      }, 500);
    } else if (filterParam === 'delivery' || path.endsWith('/7brew-delivery') || path.endsWith('/delivery')) {
      setTimeout(() => {
        const header = document.querySelector('.section-header');
        if (header) {
          const alertEl = document.createElement('div');
          alertEl.style.background = 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))';
          alertEl.style.border = '2px solid var(--color-secondary)';
          alertEl.style.boxShadow = 'var(--shadow-neon-pink)';
          alertEl.style.padding = '20px';
          alertEl.style.borderRadius = 'var(--border-radius-md)';
          alertEl.style.marginTop = '20px';
          alertEl.style.textAlign = 'center';
          alertEl.innerHTML = `<h3 style="color: var(--color-secondary); margin-bottom: 8px;">🚚 Delivery Information</h3><p style="color: var(--text-gray); font-size: 0.95rem; margin: 0;">Get your favorite custom brews delivered directly to your door! Third-party delivery services (DoorDash, UberEats, and Grubhub) are available at most locations below.</p>`;
          header.appendChild(alertEl);
        }
      }, 500);
    }
  } catch (error) {
    console.error(error);
    const container = document.getElementById('locations-grid');
    if (container) {
      container.innerHTML = `<p class="error-message">Oops! We could not load the locations right now. Please try again later.</p>`;
    }
  }
}

function populateStateFilter() {
  const select = document.getElementById('location-state-filter');
  if (!select) return;

  const states = [...new Set(locationsData.map(loc => loc.state))];
  select.innerHTML = `<option value="All">All States</option>` + 
    states.map(state => `<option value="${state}">${state}</option>`).join('');

  select.addEventListener('change', (e) => {
    activeState = e.target.value;
    applyFilters();
  });
}

function renderLocations(locations) {
  const container = document.getElementById('locations-grid');
  if (!container) return;

  if (locations.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary)); border: 2px dashed var(--color-primary); border-radius: var(--border-radius-md); box-shadow: var(--shadow-neon); margin-top: 20px;">
        <span style="font-size: 3rem; margin-bottom: 15px; display: block;">📍</span>
        <h3 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 10px;">Don't see your favorite stand?</h3>
        <p style="color: var(--text-gray); max-width: 600px; margin: 0 auto 24px auto; font-size: 1rem; line-height: 1.5;">
          We currently showcase our top local stands, but there are over 300+ official 7 Brew stands nationwide! Use the official store finder to locate one near you.
        </p>
        <a href="https://7brew.com/locations/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; font-size: 0.9rem;">
          Search All 300+ Official Stands
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = locations.map(loc => `
    <article class="location-card">
      <span class="location-status">${loc.driveThru ? 'Drive-Thru Available' : 'Walk-up Only'}</span>
      <h3 style="font-size: 1.4rem; margin-bottom: 8px;">${loc.name}</h3>
      <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 12px;">${loc.address}</p>
      
      <div class="location-hours">
        <strong>Hours:</strong><br>
        Mon-Fri: ${loc.hours.weekdays}<br>
        Sat-Sun: ${loc.hours.weekends}
      </div>

      <p style="font-size: 0.9rem; margin-bottom: 16px;">
        <strong>Phone:</strong> <a href="tel:${loc.phone.replace(/\D/g,'')}" style="color: var(--color-primary);">${loc.phone}</a>
      </p>

      <div class="location-amenities">
        ${loc.amenities.map(amenity => `<span class="location-amenity-badge">${amenity}</span>`).join('')}
      </div>

      <div style="margin-top: auto; display: flex; gap: 12px;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}" 
           target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 10px;">
          Get Directions
        </a>
      </div>
    </article>
  `).join('');
}

function applyFilters() {
  let filtered = [...locationsData];

  // State filtering
  if (activeState !== 'All') {
    filtered = filtered.filter(loc => loc.state === activeState);
  }

  // Search query
  const searchInput = document.getElementById('location-search');
  if (searchInput) {
    const q = searchInput.value.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.address.toLowerCase().includes(q) || 
        loc.state.toLowerCase().includes(q)
      );
    }
  }

  renderLocations(filtered);
}

function setupEventListeners() {
  const search = document.getElementById('location-search');
  if (search) search.addEventListener('input', applyFilters);
}
