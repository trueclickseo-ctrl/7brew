# 7 Brew Coffee Inspired Website

A complete, production-ready, SEO-optimized, lightweight, and responsive beverage website inspired by 7 Brew Coffee.

## Features
- **100% Static & Serverless**: Built using HTML5, CSS3, and Vanilla JavaScript. Runs locally by opening `index.html` directly or uploading to shared hosts.
- **Dynamic Database Layer**: Menu items, locations, and blog entries are stored in JSON databases (`data/`) and fetched dynamically via AJAX.
- **Calorie & Cost Calculator**: Customize beverage options (milk alternatives, extra syrup, espresso shots, toppings) and view real-time nutritional metrics.
- **Interactive Menu**: Live filtering by categories, search matching names/ingredients, and sorting by pricing, calorie volumes, and alphabetical order.
- **Locations Finder**: Live filtering by state, text search, operational hour guides, and directions lookup.
- **Complete Blog Feed**: 20 distinct, detailed coffee culture guides with pagination, dynamic article modals, and social share anchors.
- **SEO Ready**: Open Graph headers, robots configuration, and XML sitemaps.

## Project Structure
```
/
├── index.html                  # Landing Page
├── menu.html                   # Beverage Catalog
├── calorie-calculator.html     # Custom Calculator
├── locations.html              # Location Finder
├── blog.html                   # Blog Articles Feed
├── contact.html                # Support Form & FAQs
├── robots.txt                  # Search Engine Directives
├── sitemap.xml                 # XML Site Map
├── README.md                   # Setup Guide
├── data/
│   ├── menu.json               # Menu Data (JSON)
│   ├── blog.json               # Blog Data (JSON)
│   └── locations.json          # Locations Data (JSON)
└── assets/
    ├── css/
    │   └── style.css           # Custom Design stylesheet
    └── js/
        ├── main.js             # Sticky Navigation and shared helpers
        ├── menu.js             # Menu controller
        ├── calculator.js       # Live calculator logic
        ├── locations.js        # Locator filter logic
        └── blog.js             # Blog renderer & modal trigger
```

## Local Testing
To test all functions locally, you can start a simple static file server.
Since browser security rules (CORS) restrict loading JSON files via `fetch()` directly from `file://` protocols, please run a local server:

Using **VS Code Live Server**:
- Open the folder, click **Go Live** at the bottom-right.

Using **Python** (built-in):
- Run `python -m http.server 8000` in the directory, then open `http://localhost:8000`.

## Hostinger / Shared Hosting Deployment
1. Log into your Hostinger control panel (hPanel).
2. Go to the **File Manager** for your domain.
3. Upload all files and folders in this directory directly inside the `public_html/` directory.
4. Set up an SSL certificate for your domain in hPanel.
