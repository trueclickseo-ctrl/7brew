// 7 Brew Locations DOM Filtering Script
// Filters statically pre-rendered cards in locations.html for SEO-friendliness.

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function applyFilters() {
  const searchInput = document.getElementById('location-search');
  const stateSelect = document.getElementById('location-state-filter');
  
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedState = stateSelect ? stateSelect.value : 'All';
  
  const cards = document.querySelectorAll('#locations-grid .drink-card');
  const stateHeaders = document.querySelectorAll('#locations-grid > div');
  
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    
    // Check state from the card label (e.g. "Springdale, AR" or "Tulsa, OK")
    const labelEl = card.querySelector('.drink-category-label');
    const labelText = labelEl ? labelEl.textContent.toLowerCase() : '';
    
    // Map selected state name (e.g. "Arkansas") to state codes (e.g. "ar")
    let stateCode = '';
    if (selectedState === 'Arkansas') stateCode = 'ar';
    else if (selectedState === 'Missouri') stateCode = 'mo';
    else if (selectedState === 'Oklahoma') stateCode = 'ok';
    else if (selectedState === 'Kansas') stateCode = 'ks';
    
    const matchesSearch = text.includes(query);
    const matchesState = (selectedState === 'All' || labelText.includes(stateCode) || labelText.includes(selectedState.toLowerCase()));
    
    if (matchesSearch && matchesState) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Hide the hub headers when filters are active to prevent empty category headers
  if (query || selectedState !== 'All') {
    stateHeaders.forEach(header => {
      header.style.display = 'none';
    });
  } else {
    stateHeaders.forEach(header => {
      header.style.display = 'block';
    });
  }
}

function setupEventListeners() {
  const search = document.getElementById('location-search');
  if (search) search.addEventListener('input', applyFilters);
  
  const stateSelect = document.getElementById('location-state-filter');
  if (stateSelect) {
    stateSelect.addEventListener('change', applyFilters);
  }
}
