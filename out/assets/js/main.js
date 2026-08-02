// Redirect old hash/index URLs to clean permalinks
(function() {
  const hash = window.location.hash;
  const path = window.location.pathname.toLowerCase();
  if (hash === '#deals' || path.endsWith('/deals')) {
    window.location.replace('/7brew-deals');
    return;
  } else if (hash === '#rewards' || path.endsWith('/rewards')) {
    window.location.replace('/7brew-rewards');
    return;
  } else if (path.endsWith('/index.html')) {
    window.location.replace('/');
    return;
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initIntersectionObserver();
  handleUrlScroll();
});

// Sticky Header Scroll Effect
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('header-active');
    } else {
      header.classList.remove('header-active');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Run once on load
}

// Mobile Navigation Drawer Toggle
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    // Change toggle icon if using icon fonts or simple text
    if (menu.classList.contains('active')) {
      toggle.innerHTML = '&#10005;'; // Close symbol (X)
    } else {
      toggle.innerHTML = '&#9776;'; // Hamburger symbol
    }
  });

  // Close menu when clicking outside or on a link
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('active');
      toggle.innerHTML = '&#9776;';
    }
  });
}

// Global Intersection Observer for Fade-in effects
function initIntersectionObserver() {
  const fadeElems = document.querySelectorAll('.fade-in-section');
  if (fadeElems.length === 0) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElems.forEach(el => observer.observe(el));
}

// Global Favorites LocalStorage Helper
const FavoritesManager = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('seven_brew_favorites')) || [];
    } catch {
      return [];
    }
  },

  toggle(drinkName) {
    let current = this.get();
    if (current.includes(drinkName)) {
      current = current.filter(name => name !== drinkName);
    } else {
      current.push(drinkName);
    }
    localStorage.setItem('seven_brew_favorites', JSON.stringify(current));
    return current;
  },

  isFav(drinkName) {
    return this.get().includes(drinkName);
  }
};
window.FavoritesManager = FavoritesManager;

// Interactive 7 Brew Rewards Mockup Logic
window.checkBrewPoints = function() {
  const phoneInput = document.getElementById('rewards-phone');
  if (!phoneInput) return;

  const phone = phoneInput.value.replace(/\D/g, '');
  if (phone.length < 10) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  const inputWrap = document.getElementById('rewards-input-wrapper');
  const resultWrap = document.getElementById('rewards-result-wrapper');
  const pointsVal = document.getElementById('rewards-points-val');
  const progress = document.getElementById('rewards-progress');
  const msg = document.getElementById('rewards-message');

  if (!inputWrap || !resultWrap || !pointsVal || !progress || !msg) return;

  // Simulate point search logic based on phone number digits
  let points = 35;
  if (phone.endsWith('7') || phone.endsWith('77')) {
    points = 95;
  } else if (parseInt(phone.charAt(phone.length - 1)) % 2 === 0) {
    points = 70;
  } else {
    points = 45;
  }

  pointsVal.textContent = points;
  progress.style.width = points + "%";
  
  const remaining = 100 - points;
  msg.textContent = `You are only ${remaining} points away from a FREE medium drink!`;

  inputWrap.style.display = 'none';
  resultWrap.style.display = 'block';
};

window.resetRewardsWidget = function() {
  const inputWrap = document.getElementById('rewards-input-wrapper');
  const resultWrap = document.getElementById('rewards-result-wrapper');
  const phoneInput = document.getElementById('rewards-phone');

  if (inputWrap && resultWrap) {
    inputWrap.style.display = 'block';
    resultWrap.style.display = 'none';
  }
  if (phoneInput) phoneInput.value = '';
};

// Interactive Drink Finder Quiz Logic
let quizAnswers = {};
window.selectQuizOption = function(step, val) {
  quizAnswers[step] = val;

  const currentStepEl = document.getElementById(`quiz-step-${step}`);
  if (currentStepEl) currentStepEl.style.display = 'none';

  if (step < 3) {
    const nextStepEl = document.getElementById(`quiz-step-${step + 1}`);
    if (nextStepEl) nextStepEl.style.display = 'block';
  } else {
    showQuizResult();
  }
};

function showQuizResult() {
  const resultEl = document.getElementById('quiz-result-step');
  const cardEl = document.getElementById('quiz-recommendation-card');
  if (!resultEl || !cardEl) return;

  const energy = quizAnswers[1]; // coffee, energy, caffeine-free
  const profile = quizAnswers[2]; // sweet, fruity, bold
  const temp = quizAnswers[3]; // iced, hot

  let name = "";
  let desc = "";

  if (energy === 'coffee') {
    if (profile === 'sweet') {
      name = temp === 'iced' ? "The Blondie (Iced Breve)" : "Cinnamon Roll (Hot Breve)";
      desc = temp === 'iced' ? "Our legendary cold caramel and vanilla breve coffee." : "A warm blend of brown sugar cinnamon and white chocolate sauce.";
    } else if (profile === 'fruity') {
      name = "The Ninja (Iced Mint Breve)";
      desc = "A cool white chocolate and creme de menthe recipe.";
    } else {
      name = temp === 'iced' ? "House Cold Brew" : "House Drip Brew";
      desc = temp === 'iced' ? "Slow-steeped for 20 hours, very smooth and bold." : "Our medium-roast premium drip coffee served piping hot.";
    }
  } else if (energy === 'energy') {
    name = "Seven Energy Blue Punch";
    desc = "A chilling carbonated energy mixer flavored with blue raspberry, peach, and raspberry syrups.";
  } else {
    // Caffeine free
    if (profile === 'fruity') {
      name = "Electric Berry Lemonade";
      desc = "A tart, refreshing iced lemonade infused with blue raspberry and wildberry.";
    } else if (profile === 'sweet') {
      name = "Sunrise Shake Smoothie";
      desc = "A thick, creamy double-blended strawberry and banana real fruit smoothie.";
    } else {
      name = "Wildberry Fizz";
      desc = "Sparkling water paired with sweet wildberry syrup, served over ice and topped with whipped cream.";
    }
  }

  cardEl.innerHTML = `
    <h4 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 8px;">${name}</h4>
    <p style="color: var(--text-gray); margin-bottom: 16px;">${desc}</p>
    <a href="menu.html" class="btn btn-primary" style="font-size: 0.8rem; padding: 8px 20px;">Order/View Details</a>
  `;

  resultEl.style.display = 'block';
}

window.restartQuiz = function() {
  quizAnswers = {};
  document.querySelectorAll('.quiz-step').forEach(el => el.style.display = 'none');
  
  const step1 = document.getElementById('quiz-step-1');
  if (step1) step1.style.display = 'block';
};

// Auto scroll on clean URL pathnames
function handleUrlScroll() {
  const path = window.location.pathname.toLowerCase();
  let targetId = '';
  if (path.endsWith('/7brew-rewards') || path.endsWith('/rewards')) {
    targetId = 'rewards';
  } else if (path.endsWith('/7brew-deals') || path.endsWith('/deals')) {
    targetId = 'deals';
  }
  
  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }
}


