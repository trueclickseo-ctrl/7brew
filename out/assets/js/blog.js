let blogArticles = [];
let filteredArticles = [];
let currentCategory = 'All';
let currentPage = 1;
const articlesPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  fetchBlogData();
  setupEventListeners();
});

async function fetchBlogData() {
  try {
    const response = await fetch('/data/blog.json?v=1.0.1');
    if (!response.ok) throw new Error('Failed to load blog database.');
    blogArticles = await response.json();
    
    // Default filter list is all articles
    filteredArticles = [...blogArticles];
    
    renderFeaturedArticle();
    renderBlogList();
    renderPagination();
    renderCategoryFilterTags();
  } catch (error) {
    console.error('Error fetching blog data:', error);
    const grid = document.getElementById('blog-grid');
    if (grid) {
      grid.innerHTML = `<p class="error-message">Oops! We could not load the blog right now. Please try again later.</p>`;
    }
  }
}

function renderFeaturedArticle() {
  const featuredArea = document.getElementById('featured-blog-area');
  if (!featuredArea || blogArticles.length === 0) return;

  // Let first article be the featured article
  const article = blogArticles[0];

  featuredArea.innerHTML = `
    <div class="featured-blog-card" style="cursor: pointer;" onclick="openBlogModal(${article.id})">
      <img src="${article.image}" alt="${article.title}" class="featured-blog-img" onerror="this.src='https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=800&auto=format&fit=crop';">
      <div class="featured-blog-body">
        <span class="blog-card-category" style="font-size: 0.9rem;">Featured • ${article.category}</span>
        <h2 style="font-size: 2.2rem; margin: 12px 0 16px 0; font-family: var(--font-heading);">${article.title}</h2>
        <p style="color: var(--text-gray); margin-bottom: 24px;">${article.metaDescription}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.9rem;">
          <span>By ${article.author} • ${article.date}</span>
          <span>Read Time: ${article.readingTime}</span>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryFilterTags() {
  const container = document.getElementById('blog-category-tags');
  if (!container) return;

  const categories = ['All', ...new Set(blogArticles.map(item => item.category))];
  
  container.innerHTML = categories.map(cat => `
    <button class="category-tag ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');

  container.querySelectorAll('.category-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.category-tag').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      currentPage = 1;
      applyFilters();
    });
  });
}

function renderBlogList() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  if (filteredArticles.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 40px 0;">No articles match your search.</div>`;
    return;
  }

  // Calculate start/end indices for pagination
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const pageItems = filteredArticles.slice(startIndex, endIndex);

  grid.innerHTML = pageItems.map(article => `
    <article class="blog-card" style="cursor: pointer;" onclick="openBlogModal(${article.id})">
      <img src="${article.image}" alt="${article.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=800&auto=format&fit=crop';" loading="lazy">
      <div class="blog-card-body">
        <span class="blog-card-category">${article.category}</span>
        <h3 class="blog-card-title">${article.title}</h3>
        <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${article.metaDescription}
        </p>
        <div class="blog-card-meta">
          <span>By ${article.author}</span>
          <span>${article.date}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPagination() {
  const container = document.getElementById('blog-pagination');
  if (!container) return;

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }
  container.innerHTML = html;
}

window.goToPage = function(page) {
  currentPage = page;
  renderBlogList();
  renderPagination();
  // Scroll to blog list container top
  const blogListEl = document.getElementById('blog-list-section');
  if (blogListEl) {
    blogListEl.scrollIntoView({ behavior: 'smooth' });
  }
};

window.openBlogModal = function(id) {
  const article = blogArticles.find(a => a.id === id);
  if (!article) return;

  const modal = document.getElementById('blog-modal');
  const modalBody = document.getElementById('blog-modal-body-content');
  if (!modal || !modalBody) return;

  // Find related articles (same category, excluding current)
  const related = blogArticles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  let relatedHtml = '';
  if (related.length > 0) {
    relatedHtml = `
      <h4 style="margin-top: 40px; margin-bottom: 20px; border-top: 1px solid var(--border-glass); padding-top: 30px; color: var(--text-white);">Related Articles</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
        ${related.map(r => `
          <div style="background: var(--bg-primary); border-radius: var(--border-radius-sm); border: 1px solid var(--border-glass); overflow: hidden; cursor: pointer;" onclick="closeBlogModal(); setTimeout(() => openBlogModal(${r.id}), 300)">
            <img src="${r.image}" alt="${r.title}" style="height: 100px; width: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop';">
            <div style="padding: 12px;">
              <span style="color: var(--color-primary); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">${r.category}</span>
              <h5 style="font-size: 0.95rem; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.title}</h5>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  modalBody.innerHTML = `
    <article style="max-width: 800px; margin: 0 auto;">
      <span style="color: var(--color-secondary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">${article.category}</span>
      <h2 style="font-size: 2.5rem; margin: 12px 0 20px 0; font-family: var(--font-heading); line-height: 1.2;">${article.title}</h2>
      
      <div style="display: flex; gap: 16px; align-items: center; color: var(--text-gray); margin-bottom: 30px; font-size: 0.9rem;">
        <span style="font-weight: 600; color: var(--text-white);">By ${article.author}</span>
        <span>•</span>
        <span>Published on ${article.date}</span>
        <span>•</span>
        <span>${article.readingTime} read</span>
      </div>

      <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 380px; object-fit: cover; border-radius: var(--border-radius-md); margin-bottom: 30px;" onerror="this.src='https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop';">

      <div class="blog-rich-content" style="color: var(--text-gray); line-height: 1.8; font-size: 1.1rem;">
        ${article.content}
      </div>

      <div style="margin-top: 40px; border-top: 1px solid var(--border-glass); padding-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <strong style="color: var(--text-white);">Share:</strong>
          <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.75rem;" onclick="shareArticle('twitter', '${encodeURIComponent(article.title)}')">Twitter</button>
          <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.75rem;" onclick="shareArticle('facebook', '${encodeURIComponent(article.title)}')">Facebook</button>
          <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText(window.location.href); alert('Article link copied to clipboard!');">Copy Link</button>
        </div>
      </div>

      ${relatedHtml}
    </article>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeBlogModal = function() {
  const modal = document.getElementById('blog-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

window.shareArticle = function(platform, title) {
  const url = encodeURIComponent(window.location.href);
  let shareUrl = '';
  if (platform === 'twitter') {
    shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
  } else if (platform === 'facebook') {
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

function applyFilters() {
  let filtered = [...blogArticles];

  // Category filter
  if (currentCategory !== 'All') {
    filtered = filtered.filter(item => item.category === currentCategory);
  }

  // Search filter
  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    const q = searchInput.value.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.metaDescription.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      );
    }
  }

  filteredArticles = filtered;
  renderBlogList();
  renderPagination();
}

function setupEventListeners() {
  const search = document.getElementById('blog-search');
  if (search) search.addEventListener('input', applyFilters);

  const modal = document.getElementById('blog-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBlogModal();
    });
  }
}
