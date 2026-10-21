# Mih-Nig-Afe.github.io

Personal developer portfolio website of **Mihretab Nigatu** (Systems Futurist, Web Specialist, Full-Stack Developer & AI Engineer).

**Live Portfolio:** [https://mih-nig-afe.github.io](https://mih-nig-afe.github.io)

---

## Preview

![Homepage Preview](Screenshots/Screenshot%202026-01-07%20at%2016.23.08.png)
![Homepage Dark Mode](Screenshots/Screenshot%202026-01-07%20at%2016.24.53.png)

---

## Key Features & Visual Design

- **Interactive Constellation Canvas**: Dynamic particle mesh powered by `particles.js` with real-time responsive cursor interaction.
- **Typewriter Role Cycler**: Animated multi-role text cycler highlighting core competencies across AI/ML agents, Telegram bots, and full-stack systems.
- **Liquid Glass Glassmorphism**: Frosted glass panels, dynamic blur filters, and glowing accents calibrated for both dark and light modes.
- **Atom Electron Preloader**: Smooth CSS orbital preloader animation for clean first-contentful-paint transitions.
- **Illustrated Vector Scenes**: Custom SVG artwork illustrating engineering workstations across Projects and Experience pages.
- **Custom Hardware-Accelerated Cursor**: Cursor follower with `@media (pointer: fine)` scoping and automatic mobile touch fallback.
- **Structured Data & SEO**: Comprehensive Schema.org JSON-LD (Person, WebSite, Breadcrumbs), Open Graph, and Twitter metadata.
- **Single-Source Analytics**: Streamlined Google Analytics (`G-M11CMZ12Q`) with zero duplicate tags.
- **API Quota Protection**: GitHub service caching with rate-limit protection for project showcases.

---

## Page Catalog

- [`index.html`](index.html) — Hero showcase, animated role cycler, MTAB brand avatar, social links, and particles mesh.
- [`projects.html`](projects.html) — Featured projects showcase with interactive category filtering and GitHub repository links.
- [`experience.html`](experience.html) — Professional biography, core competency breakdown, and verified credentials.
- [`education.html`](education.html) — Academic history, timeline milestones, and certified MOOC accreditations.
- [`404.html`](404.html) — Custom animated 404 error page with direct navigation back to home.

---

## Directory Structure

```text
.
├── 404.html                     # Custom 404 error page
├── education.html               # Academic timeline & certifications
├── experience.html              # Bio, experience & skill matrix
├── index.html                   # Homepage & hero experience
├── manifest.json                # PWA web app manifest
├── projects.html                # Project portfolio with filtering
├── robots.txt                   # Search crawler directives
├── sitemap.xml                  # XML sitemap for SEO
├── assets/
│   ├── css/                     # Liquid glass, theme, and page stylesheets
│   ├── docs/                    # Resume and academic documentation
│   ├── fonts/                   # Signature font (Agustina)
│   ├── images/                  # Favicons, project previews, brand assets
│   └── js/                      # Particles, dynamic titles, GitHub services
└── Screenshots/                 # Light & dark theme visual comps
```

---

## Running Locally

This is a zero-build static site that runs in any browser:

### Option A: Python HTTP Server (Recommended)

```bash
# Start a local static server on port 4321
python3 -m http.server 4321
```

Then visit:
- **Home**: [http://localhost:4321/index.html](http://localhost:4321/index.html)
- **Projects**: [http://localhost:4321/projects.html](http://localhost:4321/projects.html)
- **Experience**: [http://localhost:4321/experience.html](http://localhost:4321/experience.html)
- **Education**: [http://localhost:4321/education.html](http://localhost:4321/education.html)

### Option B: Node.js / npx serve

```bash
npx serve .
```

---

## Deployment to GitHub Pages

This repository is configured for standard **GitHub Pages** deployment directly from the `main` branch root:

1. Push commits to `main`:
   ```bash
   git push origin main
   ```
2. In GitHub repository settings: **Settings → Pages**:
   - **Source**: Deploy from a branch
   - **Branch**: `main` / `/(root)`
3. Site updates automatically at [https://mih-nig-afe.github.io](https://mih-nig-afe.github.io).

---

## Author

**Mihretab Nigatu (MTAB Development)**
- **GitHub**: [@Mih-Nig-Afe](https://github.com/Mih-Nig-Afe)
- **LinkedIn**: [in/mih-nig-afe](https://www.linkedin.com/in/mih-nig-afe/)
- **Instagram**: [@mih_nig_afe](https://www.instagram.com/mih_nig_afe/)
