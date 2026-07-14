let menuData = [];

// Base prices & calories for custom add-ons
const ADD_ONS = {
  milk: {
    "whole": { price: 0.00, calories: 120 },
    "half-half": { price: 0.75, calories: 180 },
    "oat": { price: 0.75, calories: 90 },
    "almond": { price: 0.75, calories: 40 },
    "coconut": { price: 0.75, calories: 50 },
    "none": { price: 0.00, calories: 0 }
  },
  syrup: {
    price: 0.50,
    calories: 80,
    sugar: 19 // grams
  },
  espressoShot: {
    price: 0.75,
    calories: 5,
    caffeine: 75 // mg
  },
  toppings: {
    whippedCream: { price: 0.50, calories: 75, sugar: 5 },
    coldFoam: { price: 0.75, calories: 60, sugar: 6 },
    extraDrizzle: { price: 0.50, calories: 50, sugar: 12 }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  fetchCalculatorData();
});

async function fetchCalculatorData() {
  try {
    const response = await fetch('data/menu.json');
    if (!response.ok) throw new Error('Failed to load menu database.');
    menuData = await response.json();
    populateCategories();
  } catch (error) {
    console.error('Error loading calculator data:', error);
  }
}

function populateCategories() {
  const catSelect = document.getElementById('calc-category');
  if (!catSelect) return;

  const categories = [...new Set(menuData.map(item => item.category))];
  catSelect.innerHTML = `<option value="">-- Choose Category --</option>` + 
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  catSelect.addEventListener('change', handleCategoryChange);
  
  // Set up general event listeners for calculators
  setupCalcListeners();
}

function handleCategoryChange(e) {
  const cat = e.target.value;
  const drinkSelect = document.getElementById('calc-drink');
  if (!drinkSelect) return;

  if (!cat) {
    drinkSelect.innerHTML = `<option value="">-- Select Category First --</option>`;
    resetResults();
    return;
  }

  const drinks = menuData.filter(item => item.category === cat);
  drinkSelect.innerHTML = `<option value="">-- Choose Drink --</option>` +
    drinks.map(d => `<option value="${d.name}">${d.name}</option>`).join('');

  drinkSelect.addEventListener('change', handleDrinkChange);
}

function handleDrinkChange(e) {
  const drinkName = e.target.value;
  const sizeSelect = document.getElementById('calc-size');
  if (!sizeSelect) return;

  if (!drinkName) {
    sizeSelect.innerHTML = `<option value="">-- Select Drink First --</option>`;
    resetResults();
    return;
  }

  const drink = menuData.find(d => d.name === drinkName);
  const sizes = Object.keys(drink.sizes);

  sizeSelect.innerHTML = sizes.map(size => 
    `<option value="${size}">${size.toUpperCase()}</option>`
  ).join('');

  calculateTotal();
}

function setupCalcListeners() {
  const fields = [
    'calc-size', 'calc-milk', 'calc-sugar-free', 
    'calc-syrup-qty', 'calc-shots-qty', 'calc-whip', 
    'calc-coldfoam', 'calc-drizzle'
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', calculateTotal);
      el.addEventListener('input', calculateTotal);
    }
  });
}

function calculateTotal() {
  const drinkName = document.getElementById('calc-drink').value;
  const size = document.getElementById('calc-size').value;

  if (!drinkName || !size) {
    resetResults();
    return;
  }

  const drink = menuData.find(d => d.name === drinkName);
  const sizeInfo = drink.sizes[size] || Object.values(drink.sizes)[0];

  // Base values
  let basePrice = sizeInfo.price;
  let baseCalories = sizeInfo.calories;
  let baseSugar = parseInt(drink.sugar) || 0;
  let baseCaffeine = parseInt(drink.caffeine) || 0;

  // 1. Milk customizations
  const milkType = document.getElementById('calc-milk').value;
  if (milkType && milkType !== 'none') {
    const milkInfo = ADD_ONS.milk[milkType];
    basePrice += milkInfo.price;
    // Scale milk calories slightly by size
    const sizeMultiplier = size === 'small' ? 0.8 : (size === 'large' ? 1.3 : 1.0);
    baseCalories += Math.round(milkInfo.calories * sizeMultiplier);
  }

  // 2. Sugar-free option
  const isSugarFree = document.getElementById('calc-sugar-free').checked;
  if (isSugarFree) {
    // If sugar free, reduce sugar to zero or minimal (e.g. sugar-free syrup used)
    baseSugar = 0;
    // Calories drop roughly 60% for sugary drinks when using sugar-free options
    if (baseCalories > 100) {
      baseCalories = Math.round(baseCalories * 0.35);
    }
  }

  // 3. Extra syrups
  const syrupQty = parseInt(document.getElementById('calc-syrup-qty').value) || 0;
  if (syrupQty > 0) {
    basePrice += syrupQty * ADD_ONS.syrup.price;
    if (!isSugarFree) {
      baseCalories += syrupQty * ADD_ONS.syrup.calories;
      baseSugar += syrupQty * ADD_ONS.syrup.sugar;
    }
  }

  // 4. Extra Espresso Shots
  const shotsQty = parseInt(document.getElementById('calc-shots-qty').value) || 0;
  if (shotsQty > 0) {
    basePrice += shotsQty * ADD_ONS.espressoShot.price;
    baseCalories += shotsQty * ADD_ONS.espressoShot.calories;
    baseCaffeine += shotsQty * ADD_ONS.espressoShot.caffeine;
  }

  // 5. Toppings
  const hasWhip = document.getElementById('calc-whip').checked;
  if (hasWhip) {
    basePrice += ADD_ONS.toppings.whippedCream.price;
    baseCalories += ADD_ONS.toppings.whippedCream.calories;
    baseSugar += ADD_ONS.toppings.whippedCream.sugar;
  }

  const hasColdFoam = document.getElementById('calc-coldfoam').checked;
  if (hasColdFoam) {
    basePrice += ADD_ONS.toppings.coldFoam.price;
    baseCalories += ADD_ONS.toppings.coldFoam.calories;
    baseSugar += ADD_ONS.toppings.coldFoam.sugar;
  }

  const hasDrizzle = document.getElementById('calc-drizzle').checked;
  if (hasDrizzle) {
    basePrice += ADD_ONS.toppings.extraDrizzle.price;
    baseCalories += ADD_ONS.toppings.extraDrizzle.calories;
    baseSugar += ADD_ONS.toppings.extraDrizzle.sugar;
  }

  // Update DOM elements with visual animations
  animateCount('res-calories', baseCalories);
  document.getElementById('res-price').textContent = `$${basePrice.toFixed(2)}`;
  document.getElementById('res-sugar').textContent = `${baseSugar}g`;
  document.getElementById('res-caffeine').textContent = `${baseCaffeine}mg`;

  // Update Visual Cup
  const cupLiquid = document.getElementById('cup-liquid');
  if (cupLiquid) {
    // 600 kcal represents a fully loaded drink
    const heightPercentage = Math.min((baseCalories / 650) * 100, 100);
    cupLiquid.style.height = `${heightPercentage}%`;
    
    // Dynamic color shifting based on calorie range
    if (baseCalories < 120) {
      cupLiquid.style.background = 'linear-gradient(to top, #00f2fe, #4facfe)'; // Light blue refresher
    } else if (baseCalories < 320) {
      cupLiquid.style.background = 'linear-gradient(to top, #f83600, #f9d423)'; // Orange energy
    } else {
      cupLiquid.style.background = 'linear-gradient(to top, #4b3621, #8b5a2b)'; // Rich chocolate mocha
    }
  }

  // Update Health Gauge
  const healthFill = document.getElementById('health-bar-fill');
  const healthLabel = document.getElementById('health-label');
  const healthPercent = document.getElementById('health-percent');
  if (healthFill && healthLabel && healthPercent) {
    const percent = Math.min(Math.round((baseCalories / 650) * 100), 100);
    healthFill.style.width = `${percent}%`;
    healthPercent.textContent = `${percent}% Indulgent`;
    
    if (percent < 20) {
      healthLabel.textContent = 'Healthy Refresher 🍃';
      healthLabel.style.color = '#00f2fe';
      healthFill.style.background = '#00f2fe';
    } else if (percent < 55) {
      healthLabel.textContent = 'Balanced Energizer ⚡';
      healthLabel.style.color = '#ff9900';
      healthFill.style.background = '#ff9900';
    } else {
      healthLabel.textContent = 'Indulgent Treat 🍧';
      healthLabel.style.color = '#ff007f';
      healthFill.style.background = '#ff007f';
    }
  }
}

// Counting Tick Up Animation
function animateCount(id, targetVal) {
  const el = document.getElementById(id);
  if (!el) return;
  const currentVal = parseInt(el.textContent) || 0;
  if (currentVal === targetVal) return;
  
  let start = currentVal;
  const duration = 400; // ms
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.round(start + (targetVal - start) * progress);
    el.textContent = val;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetVal;
    }
  }
  requestAnimationFrame(update);
}

function resetResults() {
  document.getElementById('res-calories').textContent = '0';
  document.getElementById('res-price').textContent = '$0.00';
  document.getElementById('res-sugar').textContent = '0g';
  document.getElementById('res-caffeine').textContent = '0mg';

  const cupLiquid = document.getElementById('cup-liquid');
  if (cupLiquid) cupLiquid.style.height = '0%';

  const healthFill = document.getElementById('health-bar-fill');
  if (healthFill) healthFill.style.width = '0%';

  const healthPercent = document.getElementById('health-percent');
  if (healthPercent) healthPercent.textContent = '0% Indulgent';

  const healthLabel = document.getElementById('health-label');
  if (healthLabel) {
    healthLabel.textContent = 'Healthy Refresher 🍃';
    healthLabel.style.color = 'var(--color-primary)';
  }
}
