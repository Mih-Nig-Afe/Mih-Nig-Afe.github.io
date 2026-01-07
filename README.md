<!--
 * @Author: Mih-Nig-Afe 90252194+Mih-Nig-Afe@users.noreply.github.com
 * @Date: 2025-12-04 14:22:51
 * @LastEditors: Mih-Nig-Afe 90252194+Mih-Nig-Afe@users.noreply.github.com
 * @LastEditTime: 2026-01-07 16:36:49
 * @FilePath: /Mih-Nig-Afe.github.io/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# Mih-Nig-Afe.github.io

Personal portfolio website (GitHub Pages) showcasing my work, experience, projects, and education.

**Live:** [mih-nig-afe.github.io](https://mih-nig-afe.github.io/)

## Preview

![Homepage preview](Screenshots/Screenshot%202026-01-07%20at%2016.23.08.png)

![Homepage preview (alternate)](Screenshots/Screenshot%202026-01-07%20at%2016.24.53.png)

## Pages

- `index.html` — Home
- `projects.html` — Projects
- `experience.html` — About
- `education.html` — Education
- `404.html` — Not found page

## What’s Inside

- Responsive, static site (HTML/CSS/JS)
- Custom styling and page-specific stylesheets under `assets/css/`
- JavaScript modules and page scripts under `assets/js/`
- Assets (images, icons, fonts) under `assets/`
- SEO files: `robots.txt`, `sitemap.xml`
- PWA basics: `manifest.json`

## Run Locally

This is a static site — no build step required.

Option A (quick):

- Open `index.html` in your browser

Option B (recommended: local server):

```bash
python3 -m http.server 5173
```

Then open:

- [http://localhost:5173](http://localhost:5173)

## Deploy

This repo is designed for **GitHub Pages**.

- Push to `main`
- In GitHub → **Settings → Pages**, select:
  - Source: "Deploy from a branch"
  - Branch: `main` / root

## License

See [LICENSE](LICENSE).
