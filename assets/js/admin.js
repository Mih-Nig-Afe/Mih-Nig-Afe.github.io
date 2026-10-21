/**
 * MTAB Development - Admin Deck Engine
 * Client-side Git-CMS with Web Crypto AES-GCM vault & direct GitHub API commit pipeline.
 */

"use strict";

/* ==========================================================================
   1. Cryptographic Security Engine (Web Crypto API: AES-GCM + PBKDF2)
   ========================================================================== */

const CryptoVault = {
  STORAGE_KEY: "mtab_admin_vault_v1",

  // Convert buffer to hex string
  buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },

  // Convert hex string to Uint8Array buffer
  hex2buf(hexString) {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes;
  },

  // Derive AES-GCM key from password and salt using PBKDF2
  async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt plaintext with password
  async encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(plaintext)
    );

    return {
      salt: this.buf2hex(salt),
      iv: this.buf2hex(iv),
      ciphertext: this.buf2hex(encrypted)
    };
  },

  // Decrypt ciphertext with password
  async decrypt(vaultBundle, password) {
    const salt = this.hex2buf(vaultBundle.salt);
    const iv = this.hex2buf(vaultBundle.iv);
    const ciphertext = this.hex2buf(vaultBundle.ciphertext);
    const key = await this.deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  },

  hasVault() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  },

  saveVault(vaultBundle) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vaultBundle));
  },

  getVault() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearVault() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

/* ==========================================================================
   2. GitHub REST API Direct Commit Engine
   ========================================================================== */

class GitHubGitCMS {
  constructor(owner = "Mih-Nig-Afe", repo = "Mih-Nig-Afe.github.io", branch = "main") {
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.token = null;
    this.user = null;
  }

  setToken(token) {
    this.token = token.trim();
  }

  getHeaders() {
    return {
      "Authorization": `Bearer ${this.token}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
  }

  // Validate token and fetch user
  async authenticate() {
    const res = await fetch("https://api.github.com/user", {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Authentication failed (Status ${res.status})`);
    }
    this.user = await res.json();
    return this.user;
  }

  // Get file content & latest SHA
  async getFile(path) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (res.status === 404) {
      return { exists: false, sha: null, content: null };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch ${path}: ${err.message || res.statusText}`);
    }
    const data = await res.json();
    return {
      exists: true,
      sha: data.sha,
      content: data.content,
      encoding: data.encoding
    };
  }

  // Commit updated file content
  async commitFile(path, content, message, isBase64 = false) {
    let base64Content = "";
    if (isBase64) {
      base64Content = content;
    } else {
      // UTF-8 safe base64 encoding
      base64Content = btoa(unescape(encodeURIComponent(content)));
    }

    // Always fetch latest SHA before commit to prevent conflicts
    const fileInfo = await this.getFile(path);

    const body = {
      message: message,
      content: base64Content,
      branch: this.branch
    };

    if (fileInfo.exists && fileInfo.sha) {
      body.sha = fileInfo.sha;
    }

    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to commit ${path}: ${err.message || res.statusText}`);
    }

    return await res.json();
  }
}

/* ==========================================================================
   3. Admin Application State & Manager
   ========================================================================== */

const AdminApp = {
  cms: new GitHubGitCMS(),
  activeTab: "projects",
  data: {
    projects: [],
    certificates: [],
    profile: {},
    experience: { work: [], accreditations: [] }
  },
  stagedChanges: new Map(), // path -> { type, label, content, isBase64 }

  init() {
    this.bindEvents();
    this.checkSession();
  },

  // Check if session exists or vault is present
  checkSession() {
    const sessionToken = sessionStorage.getItem("mtab_session_pat");
    if (sessionToken) {
      this.cms.setToken(sessionToken);
      this.unlockDeck(false);
    } else {
      this.renderLockScreen();
    }
  },

  renderLockScreen() {
    document.getElementById("deck-view").style.display = "none";
    document.getElementById("lock-screen").style.display = "flex";

    const isFirstSetup = !CryptoVault.hasVault();
    const setupFields = document.getElementById("first-setup-fields");
    const confirmContainer = document.getElementById("confirm-pass-container");
    const unlockTitle = document.getElementById("lock-title");
    const unlockSub = document.getElementById("lock-sub");
    const unlockBtn = document.getElementById("btn-unlock");

    if (isFirstSetup) {
      if (setupFields) setupFields.style.display = "block";
      if (confirmContainer) confirmContainer.style.display = "block";
      unlockTitle.textContent = "Initialize Admin Deck";
      unlockSub.textContent = "Set a Master Password and provide your GitHub Personal Access Token to configure client-side AES-GCM encryption.";
      unlockBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Encrypt & Initialize';
    } else {
      if (setupFields) setupFields.style.display = "none";
      if (confirmContainer) confirmContainer.style.display = "none";
      unlockTitle.textContent = "Welcome Back, Mihretab";
      unlockSub.textContent = "Enter your Master Password to decrypt your session and access the Admin Deck.";
      unlockBtn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock Deck';
    }
  },

  async handleAuthSubmit(e) {
    e.preventDefault();
    const password = document.getElementById("master-password").value;
    const errorEl = document.getElementById("auth-error");
    errorEl.textContent = "";
    errorEl.style.display = "none";

    if (!password) {
      this.showAuthError("Please enter your Master Password.");
      return;
    }

    try {
      if (!CryptoVault.hasVault()) {
        // First-time setup
        const confirmPass = document.getElementById("confirm-password").value;
        const pat = document.getElementById("github-pat").value.trim();

        if (password !== confirmPass) {
          this.showAuthError("Passwords do not match. Please re-enter.");
          return;
        }
        if (!pat) {
          this.showAuthError("GitHub Personal Access Token is required.");
          return;
        }

        // Encrypt and save in vault
        const encryptedBundle = await CryptoVault.encrypt(pat, password);
        CryptoVault.saveVault(encryptedBundle);
        this.cms.setToken(pat);
      } else {
        // Unlock existing vault
        const vault = CryptoVault.getVault();
        const decryptedPat = await CryptoVault.decrypt(vault, password);
        this.cms.setToken(decryptedPat);
      }

      // Verify token with GitHub API
      const user = await this.cms.authenticate();
      sessionStorage.setItem("mtab_session_pat", this.cms.token);
      this.showToast(`Authenticated as @${user.login}`, "success");
      this.unlockDeck(true);

    } catch (err) {
      this.showAuthError(err.message || "Failed to unlock. Incorrect password or invalid token.");
    }
  },

  showAuthError(msg) {
    const errorEl = document.getElementById("auth-error");
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  },

  resetVault() {
    if (confirm("Resetting the vault will erase your encrypted token from this browser. You will need to enter your GitHub PAT again. Proceed?")) {
      CryptoVault.clearVault();
      sessionStorage.removeItem("mtab_session_pat");
      location.reload();
    }
  },

  async unlockDeck(fetchRemote = false) {
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("deck-view").style.display = "block";

    // Set connection status
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    if (statusDot && statusText) {
      statusDot.className = "status-dot online";
      statusText.textContent = `Connected (@${this.cms.user ? this.cms.user.login : "Mih-Nig-Afe"})`;
    }

    await this.loadAllData();
    this.renderCurrentTab();
  },

  logout() {
    sessionStorage.removeItem("mtab_session_pat");
    location.reload();
  },

  // Load all JSON datasets
  async loadAllData() {
    try {
      const [projRes, certRes, profRes, expRes] = await Promise.all([
        fetch("assets/data/projects.json").then(r => r.json()).catch(() => []),
        fetch("assets/data/certificates.json").then(r => r.json()).catch(() => []),
        fetch("assets/data/profile.json").then(r => r.json()).catch(() => ({})),
        fetch("assets/data/experience.json").then(r => r.json()).catch(() => ({ work: [], accreditations: [] }))
      ]);

      this.data.projects = projRes;
      this.data.certificates = certRes;
      this.data.profile = profRes;
      this.data.experience = expRes;

      // Update resume file preview metadata
      this.checkResumeStatus();

    } catch (err) {
      this.showToast("Loaded local datasets with fallback.", "info");
    }
  },

  async checkResumeStatus() {
    const resumeInfoEl = document.getElementById("resume-info");
    if (!resumeInfoEl) return;

    try {
      const res = await fetch("assets/docs/Resume.pdf", { method: "HEAD" });
      if (res.ok) {
        const sizeBytes = res.headers.get("Content-Length");
        const lastMod = res.headers.get("Last-Modified");
        const formattedSize = sizeBytes ? (parseInt(sizeBytes) / 1024).toFixed(1) + " KB" : "Available";
        const formattedDate = lastMod ? new Date(lastMod).toLocaleDateString() : "Present";
        resumeInfoEl.innerHTML = `<strong>Active File:</strong> assets/docs/Resume.pdf &bull; <strong>Size:</strong> ${formattedSize} &bull; <strong>Updated:</strong> ${formattedDate}`;
      } else {
        resumeInfoEl.innerHTML = `<strong>Status:</strong> Resume.pdf active at assets/docs/Resume.pdf`;
      }
    } catch (e) {
      resumeInfoEl.innerHTML = `<strong>Status:</strong> assets/docs/Resume.pdf`;
    }
  },

  /* ========================================================================
     4. Tab Rendering
     ======================================================================== */

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const container = document.getElementById("tab-content-area");
    if (!container) return;

    switch (this.activeTab) {
      case "projects":
        this.renderProjectsTab(container);
        break;
      case "resume":
        this.renderResumeTab(container);
        break;
      case "certificates":
        this.renderCertificatesTab(container);
        break;
      case "profile":
        this.renderProfileTab(container);
        break;
      case "settings":
        this.renderSettingsTab(container);
        break;
      default:
        this.renderProjectsTab(container);
    }
  },

  /* --- TAB: Projects --- */
  renderProjectsTab(container) {
    const projects = this.data.projects;
    container.innerHTML = `
      <div class="admin-card">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 class="font-weight-bold mb-1">Portfolio Projects (${projects.length})</h3>
            <p class="text-muted small mb-0">Manage featured repositories, custom case studies, tags, and demo links.</p>
          </div>
          <button class="btn-cyber-primary" onclick="AdminApp.openProjectModal()">
            <i class="fas fa-plus"></i> Add New Project
          </button>
        </div>

        <div class="mb-3">
          <input type="text" id="project-search-admin" class="admin-input" placeholder="🔍 Filter projects by name, language, or tags..." oninput="AdminApp.filterProjectsList(this.value)">
        </div>

        <div id="projects-list-container">
          ${this.getProjectsListHTML(projects)}
        </div>
      </div>
    `;
  },

  getProjectsListHTML(list) {
    if (!list || list.length === 0) {
      return `<p class="text-center text-muted py-5">No projects found. Click "Add New Project" to get started.</p>`;
    }

    return list.map((p, idx) => `
      <div class="admin-item-row" data-id="${p.id || p.name}">
        <div class="d-flex align-items-center gap-3" style="min-width: 0;">
          <div class="item-thumb d-flex align-items-center justify-content-center" style="font-size: 1.5rem; color: var(--admin-accent);">
            ${p.image ? `<img src="${p.image}" class="item-thumb" alt="${p.name}">` : `<i class="fas fa-folder"></i>`}
          </div>
          <div class="item-info">
            <div class="item-title d-flex align-items-center gap-2">
              <span>${p.name || p.title}</span>
              ${p.featured ? `<span class="badge badge-pill badge-primary" style="font-size: 0.65rem;">Featured</span>` : ''}
              ${p.pinned ? `<span class="badge badge-pill badge-info" style="font-size: 0.65rem;">Pinned</span>` : ''}
              <span class="badge badge-pill badge-secondary" style="font-size: 0.65rem;">${p.language || 'Web'}</span>
            </div>
            <div class="item-sub">${p.description || 'No description'}</div>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn-icon-action" title="Move Up" onclick="AdminApp.moveProject(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button class="btn-icon-action" title="Move Down" onclick="AdminApp.moveProject(${idx}, 1)" ${idx === list.length - 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="btn-icon-action" title="Edit" onclick="AdminApp.openProjectModal('${p.id || p.name}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon-action danger" title="Delete" onclick="AdminApp.deleteProject('${p.id || p.name}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  filterProjectsList(query) {
    const q = query.toLowerCase();
    const filtered = this.data.projects.filter(p =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.language || "").toLowerCase().includes(q) ||
      (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
    );
    const container = document.getElementById("projects-list-container");
    if (container) container.innerHTML = this.getProjectsListHTML(filtered);
  },

  moveProject(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= this.data.projects.length) return;
    const temp = this.data.projects[index];
    this.data.projects[index] = this.data.projects[targetIdx];
    this.data.projects[targetIdx] = temp;
    this.stageFile("assets/data/projects.json", JSON.stringify(this.data.projects, null, 2), "Reorder projects");
    this.renderCurrentTab();
  },

  deleteProject(id) {
    if (confirm(`Are you sure you want to delete project "${id}"?`)) {
      this.data.projects = this.data.projects.filter(p => (p.id || p.name) !== id);
      this.stageFile("assets/data/projects.json", JSON.stringify(this.data.projects, null, 2), `Delete project: ${id}`);
      this.renderCurrentTab();
      this.showToast(`Deleted ${id}`, "info");
    }
  },

  openProjectModal(id = null) {
    const isEdit = id !== null;
    const p = isEdit ? this.data.projects.find(x => (x.id || x.name) === id) || {} : {};

    const modalHTML = `
      <div class="modal fade show" id="adminGenericModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content admin-card" style="border: 1px solid var(--admin-accent);">
            <div class="modal-header border-0 pb-0">
              <h4 class="font-weight-bold">${isEdit ? 'Edit Project' : 'Add New Project'}</h4>
              <button type="button" class="close text-white" onclick="AdminApp.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="project-form" onsubmit="AdminApp.saveProject(event, '${id || ''}')">
                <div class="row">
                  <div class="col-md-8">
                    <label class="admin-label">Project Name *</label>
                    <input type="text" id="proj-name" class="admin-input" required value="${p.name || ''}" placeholder="e.g. Wiz Aroma Platform">
                  </div>
                  <div class="col-md-4">
                    <label class="admin-label">Category</label>
                    <select id="proj-category" class="admin-select">
                      <option value="fullstack" ${p.category === 'fullstack' ? 'selected' : ''}>Full Stack</option>
                      <option value="ai-ml" ${p.category === 'ai-ml' ? 'selected' : ''}>AI/ML & Bots</option>
                      <option value="mobile" ${p.category === 'mobile' ? 'selected' : ''}>Mobile & Flutter</option>
                    </select>
                  </div>
                </div>

                <label class="admin-label">Short Description *</label>
                <textarea id="proj-desc" class="admin-textarea" rows="3" required placeholder="Concise overview of architecture and impact...">${p.description || ''}</textarea>

                <div class="row">
                  <div class="col-md-6">
                    <label class="admin-label">Primary Language / Tech</label>
                    <input type="text" id="proj-lang" class="admin-input" value="${p.language || 'Python'}" placeholder="e.g. Python, TypeScript">
                  </div>
                  <div class="col-md-6">
                    <label class="admin-label">Tags (comma-separated)</label>
                    <input type="text" id="proj-tags" class="admin-input" value="${Array.isArray(p.tags) ? p.tags.join(', ') : ''}" placeholder="ai-agents, fast-api, postgresql">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <label class="admin-label">GitHub Repository URL</label>
                    <input type="url" id="proj-html-url" class="admin-input" value="${p.html_url || ''}" placeholder="https://github.com/Mih-Nig-Afe/...">
                  </div>
                  <div class="col-md-6">
                    <label class="admin-label">Live Demo URL (optional)</label>
                    <input type="url" id="proj-demo-url" class="admin-input" value="${p.homepage || ''}" placeholder="https://...">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-8">
                    <label class="admin-label">Thumbnail Image Path (optional)</label>
                    <input type="text" id="proj-image" class="admin-input" value="${p.image || ''}" placeholder="assets/images/project-page/preview.png">
                  </div>
                  <div class="col-md-4 d-flex align-items-center mt-3">
                    <label class="d-flex align-items-center gap-2 cursor-pointer">
                      <input type="checkbox" id="proj-featured" ${p.featured ? 'checked' : ''}>
                      <span class="small font-weight-bold">Mark as Featured</span>
                    </label>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn-cyber-secondary" onclick="AdminApp.closeModal()">Cancel</button>
                  <button type="submit" class="btn-cyber-primary"><i class="fas fa-save"></i> Save Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("modal-root").innerHTML = modalHTML;
  },

  saveProject(e, existingId) {
    e.preventDefault();
    const name = document.getElementById("proj-name").value.trim();
    const category = document.getElementById("proj-category").value;
    const desc = document.getElementById("proj-desc").value.trim();
    const lang = document.getElementById("proj-lang").value.trim();
    const rawTags = document.getElementById("proj-tags").value;
    const tags = rawTags.split(",").map(t => t.trim()).filter(Boolean);
    const htmlUrl = document.getElementById("proj-html-url").value.trim();
    const demoUrl = document.getElementById("proj-demo-url").value.trim();
    const image = document.getElementById("proj-image").value.trim();
    const featured = document.getElementById("proj-featured").checked;

    const projectObj = {
      id: existingId || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: name,
      description: desc,
      category: category,
      tags: tags.length ? tags : [lang],
      html_url: htmlUrl,
      homepage: demoUrl,
      language: lang,
      image: image,
      featured: featured,
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      const idx = this.data.projects.findIndex(x => (x.id || x.name) === existingId);
      if (idx !== -1) this.data.projects[idx] = { ...this.data.projects[idx], ...projectObj };
    } else {
      this.data.projects.unshift(projectObj);
    }

    this.stageFile("assets/data/projects.json", JSON.stringify(this.data.projects, null, 2), `${existingId ? 'Update' : 'Add'} project: ${name}`);
    this.closeModal();
    this.renderCurrentTab();
    this.showToast(`Saved project: ${name}`, "success");
  },

  /* --- TAB: Resume --- */
  renderResumeTab(container) {
    container.innerHTML = `
      <div class="admin-card">
        <h3 class="font-weight-bold mb-1">Resume Management</h3>
        <p class="text-muted small mb-4">Directly replace and publish your official PDF resume across the entire portfolio.</p>

        <div id="resume-info" class="p-3 mb-4 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid var(--admin-glass-border);">
          Loading resume status...
        </div>

        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="upload-dropzone" id="resume-dropzone" onclick="document.getElementById('resume-file-input').click()">
              <input type="file" id="resume-file-input" accept="application/pdf" style="display:none" onchange="AdminApp.handleResumeSelect(this.files[0])">
              <i class="fas fa-cloud-upload-alt fa-3x mb-3" style="color: var(--admin-accent);"></i>
              <h5 class="font-weight-bold">Upload New Resume (PDF)</h5>
              <p class="text-muted small">Click or drag & drop replacement PDF file here (max 15MB)</p>
              <div id="selected-resume-label" class="mt-2 text-info font-weight-bold small"></div>
            </div>

            <div id="resume-stage-actions" class="mt-3" style="display: none;">
              <button class="btn-cyber-primary w-100" onclick="AdminApp.stageResumeFile()">
                <i class="fas fa-file-pdf"></i> Stage Resume for Publish
              </button>
            </div>
          </div>

          <div class="col-lg-6">
            <h5 class="font-weight-bold mb-3"><i class="fas fa-eye"></i> Active Resume Viewer</h5>
            <div style="width: 100%; height: 420px; border-radius: 12px; overflow: hidden; border: 1px solid var(--admin-glass-border);">
              <iframe src="assets/docs/Resume.pdf" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
          </div>
        </div>
      </div>
    `;

    this.checkResumeStatus();
    this.setupDropzone("resume-dropzone", file => this.handleResumeSelect(file));
  },

  selectedResumeFile: null,

  handleResumeSelect(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.");
      return;
    }
    this.selectedResumeFile = file;
    const label = document.getElementById("selected-resume-label");
    const actions = document.getElementById("resume-stage-actions");
    if (label) label.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (actions) actions.style.display = "block";
  },

  stageResumeFile() {
    if (!this.selectedResumeFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = reader.result.split(",")[1];
      this.stageFile(
        "assets/docs/Resume.pdf",
        base64Content,
        `Update Resume: ${this.selectedResumeFile.name} (${(this.selectedResumeFile.size / 1024).toFixed(1)} KB)`,
        true
      );
      this.showToast("Resume staged! Click 'Review & Publish' to push to GitHub.", "success");
      document.getElementById("selected-resume-label").textContent = `✓ Staged: ${this.selectedResumeFile.name}`;
      document.getElementById("resume-stage-actions").style.display = "none";
    };
    reader.readAsDataURL(this.selectedResumeFile);
  },

  /* --- TAB: Certificates --- */
  renderCertificatesTab(container) {
    const certs = this.data.certificates;
    container.innerHTML = `
      <div class="admin-card">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 class="font-weight-bold mb-1">Certificates & Accreditations (${certs.length})</h3>
            <p class="text-muted small mb-0">Manage certified courses, credentials, verification links, and preview badges.</p>
          </div>
          <button class="btn-cyber-primary" onclick="AdminApp.openCertModal()">
            <i class="fas fa-plus"></i> Add New Certificate
          </button>
        </div>

        <div id="certs-list-container">
          ${this.getCertsListHTML(certs)}
        </div>
      </div>
    `;
  },

  getCertsListHTML(list) {
    if (!list || list.length === 0) {
      return `<p class="text-center text-muted py-5">No certificates found.</p>`;
    }

    return list.map((c, idx) => `
      <div class="admin-item-row" data-id="${c.id || c.title}">
        <div class="d-flex align-items-center gap-3" style="min-width: 0;">
          <img src="${c.previewImage || c.cardImage}" class="item-thumb" alt="${c.title}" onerror="this.src='assets/images/favicon.png'">
          <div class="item-info">
            <div class="item-title d-flex align-items-center gap-2">
              <span>${c.title}</span>
              <span class="badge badge-pill badge-secondary" style="font-size: 0.65rem;">${c.issuer || 'Accreditation'}</span>
            </div>
            <div class="item-sub">${c.cardImage}</div>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn-icon-action" title="Move Up" onclick="AdminApp.moveCert(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button class="btn-icon-action" title="Move Down" onclick="AdminApp.moveCert(${idx}, 1)" ${idx === list.length - 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button class="btn-icon-action" title="Edit" onclick="AdminApp.openCertModal('${c.id || c.title}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon-action danger" title="Delete" onclick="AdminApp.deleteCert('${c.id || c.title}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  moveCert(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= this.data.certificates.length) return;
    const temp = this.data.certificates[index];
    this.data.certificates[index] = this.data.certificates[targetIdx];
    this.data.certificates[targetIdx] = temp;
    this.stageFile("assets/data/certificates.json", JSON.stringify(this.data.certificates, null, 2), "Reorder certificates");
    this.renderCurrentTab();
  },

  deleteCert(id) {
    if (confirm(`Delete certificate "${id}"?`)) {
      this.data.certificates = this.data.certificates.filter(c => (c.id || c.title) !== id);
      this.stageFile("assets/data/certificates.json", JSON.stringify(this.data.certificates, null, 2), `Delete certificate: ${id}`);
      this.renderCurrentTab();
      this.showToast(`Deleted ${id}`, "info");
    }
  },

  openCertModal(id = null) {
    const isEdit = id !== null;
    const c = isEdit ? this.data.certificates.find(x => (x.id || x.title) === id) || {} : {};

    const modalHTML = `
      <div class="modal fade show" id="adminGenericModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content admin-card" style="border: 1px solid var(--admin-accent);">
            <div class="modal-header border-0 pb-0">
              <h4 class="font-weight-bold">${isEdit ? 'Edit Certificate' : 'Add New Certificate'}</h4>
              <button type="button" class="close text-white" onclick="AdminApp.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="cert-form" onsubmit="AdminApp.saveCert(event, '${id || ''}')">
                <div class="row">
                  <div class="col-md-8">
                    <label class="admin-label">Certificate Title *</label>
                    <input type="text" id="cert-title" class="admin-input" required value="${c.title || ''}" placeholder="e.g. Udacity AI Fundamentals">
                  </div>
                  <div class="col-md-4">
                    <label class="admin-label">Issuer / Platform</label>
                    <input type="text" id="cert-issuer" class="admin-input" value="${c.issuer || 'Udacity'}" placeholder="e.g. Coursera, SoloLearn">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <label class="admin-label">Certificate Asset Path (PDF or Image) *</label>
                    <input type="text" id="cert-card-image" class="admin-input" required value="${c.cardImage || ''}" placeholder="assets/images/Education-page/certificate.pdf">
                  </div>
                  <div class="col-md-6">
                    <label class="admin-label">Preview Thumbnail Image</label>
                    <input type="text" id="cert-preview-image" class="admin-input" value="${c.previewImage || ''}" placeholder="assets/images/Education-page/cert-thumbs/thumb.jpg">
                  </div>
                </div>

                <label class="admin-label">Verification / MOOC URL</label>
                <input type="url" id="cert-link" class="admin-input" value="${c.moocLink || '#'}" placeholder="https://...">

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn-cyber-secondary" onclick="AdminApp.closeModal()">Cancel</button>
                  <button type="submit" class="btn-cyber-primary"><i class="fas fa-save"></i> Save Certificate</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("modal-root").innerHTML = modalHTML;
  },

  saveCert(e, existingId) {
    e.preventDefault();
    const title = document.getElementById("cert-title").value.trim();
    const issuer = document.getElementById("cert-issuer").value.trim();
    const cardImage = document.getElementById("cert-card-image").value.trim();
    const previewImage = document.getElementById("cert-preview-image").value.trim() || cardImage;
    const moocLink = document.getElementById("cert-link").value.trim() || "#";

    const certObj = {
      id: existingId || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: title,
      issuer: issuer,
      cardImage: cardImage,
      previewImage: previewImage,
      moocLink: moocLink
    };

    if (existingId) {
      const idx = this.data.certificates.findIndex(x => (x.id || x.title) === existingId);
      if (idx !== -1) this.data.certificates[idx] = certObj;
    } else {
      this.data.certificates.unshift(certObj);
    }

    this.stageFile("assets/data/certificates.json", JSON.stringify(this.data.certificates, null, 2), `${existingId ? 'Update' : 'Add'} certificate: ${title}`);
    this.closeModal();
    this.renderCurrentTab();
    this.showToast(`Saved certificate: ${title}`, "success");
  },

  /* --- TAB: Profile & Roles --- */
  renderProfileTab(container) {
    const prof = this.data.profile;
    const typewriterRoles = prof.typewriter_words || [];

    container.innerHTML = `
      <div class="admin-card">
        <h3 class="font-weight-bold mb-1">Profile & Typewriter Roles</h3>
        <p class="text-muted small mb-4">Edit bio headlines, dynamic typewriter animation phrases, and social coordinates.</p>

        <form id="profile-form" onsubmit="AdminApp.saveProfile(event)">
          <div class="row">
            <div class="col-md-6">
              <label class="admin-label">Full Name</label>
              <input type="text" id="prof-name" class="admin-input" value="${prof.name || 'Mihretab Nigatu'}">
            </div>
            <div class="col-md-6">
              <label class="admin-label">Brand Title</label>
              <input type="text" id="prof-brand" class="admin-input" value="${prof.brand || 'MTAB Development'}">
            </div>
          </div>

          <label class="admin-label">Professional Headline</label>
          <input type="text" id="prof-headline" class="admin-input" value="${prof.headline || ''}">

          <!-- Animated Typewriter Words Manager -->
          <div class="p-3 mb-4 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--admin-glass-border);">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="admin-label mb-0">Animated Typewriter Roles (Homepage Animation)</label>
              <button type="button" class="btn btn-sm btn-outline-info" onclick="AdminApp.addTypewriterRole()">+ Add Role Phrase</button>
            </div>
            <p class="text-muted small mb-3">These phrases dynamically cycle with typing and erasing animations on the homepage.</p>
            <div id="typewriter-roles-list">
              ${typewriterRoles.map((word, idx) => `
                <div class="d-flex gap-2 mb-2 align-items-center role-row">
                  <input type="text" class="admin-input mb-0 role-input" value="${word}" placeholder="Role name...">
                  <button type="button" class="btn-icon-action danger" onclick="this.closest('.role-row').remove()"><i class="fas fa-trash"></i></button>
                </div>
              `).join('')}
            </div>
          </div>

          <label class="admin-label">Bio Summary</label>
          <textarea id="prof-bio" class="admin-textarea" rows="4">${prof.bio || ''}</textarea>

          <div class="row">
            <div class="col-md-6">
              <label class="admin-label">LinkedIn URL</label>
              <input type="url" id="prof-linkedin" class="admin-input" value="${(prof.socials && prof.socials.linkedin) || ''}">
            </div>
            <div class="col-md-6">
              <label class="admin-label">Instagram URL</label>
              <input type="url" id="prof-instagram" class="admin-input" value="${(prof.socials && prof.socials.instagram) || ''}">
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button type="submit" class="btn-cyber-primary"><i class="fas fa-save"></i> Stage Profile Updates</button>
          </div>
        </form>
      </div>
    `;
  },

  addTypewriterRole() {
    const list = document.getElementById("typewriter-roles-list");
    if (!list) return;
    const div = document.createElement("div");
    div.className = "d-flex gap-2 mb-2 align-items-center role-row";
    div.innerHTML = `
      <input type="text" class="admin-input mb-0 role-input" value="" placeholder="New role phrase (e.g. Edge & IoT Architect)...">
      <button type="button" class="btn-icon-action danger" onclick="this.closest('.role-row').remove()"><i class="fas fa-trash"></i></button>
    `;
    list.appendChild(div);
  },

  saveProfile(e) {
    e.preventDefault();
    const name = document.getElementById("prof-name").value.trim();
    const brand = document.getElementById("prof-brand").value.trim();
    const headline = document.getElementById("prof-headline").value.trim();
    const bio = document.getElementById("prof-bio").value.trim();
    const linkedin = document.getElementById("prof-linkedin").value.trim();
    const instagram = document.getElementById("prof-instagram").value.trim();

    const roleInputs = document.querySelectorAll(".role-input");
    const typewriterWords = Array.from(roleInputs).map(i => i.value.trim()).filter(Boolean);

    this.data.profile = {
      ...this.data.profile,
      name,
      brand,
      headline,
      bio,
      typewriter_words: typewriterWords,
      socials: {
        ...(this.data.profile.socials || {}),
        linkedin,
        instagram
      }
    };

    this.stageFile("assets/data/profile.json", JSON.stringify(this.data.profile, null, 2), "Update profile narrative & typewriter roles");
    this.showToast("Profile updates staged for publish!", "success");
  },

  /* --- TAB: Settings --- */
  renderSettingsTab(container) {
    container.innerHTML = `
      <div class="admin-card">
        <h3 class="font-weight-bold mb-1">Security & Vault Settings</h3>
        <p class="text-muted small mb-4">Manage your encrypted vault, re-test GitHub API permissions, and access session controls.</p>

        <div class="p-3 mb-4 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--admin-glass-border);">
          <h5 class="font-weight-bold mb-2"><i class="fas fa-key text-warning"></i> GitHub Connection</h5>
          <p class="small text-muted mb-2">Authenticated User: <strong>@${this.cms.user ? this.cms.user.login : "Mih-Nig-Afe"}</strong></p>
          <p class="small text-muted mb-3">Repository Target: <code>${this.cms.owner}/${this.cms.repo}</code> on branch <code>${this.cms.branch}</code></p>
          <button class="btn-cyber-secondary" onclick="AdminApp.testConnection()"><i class="fas fa-sync"></i> Re-test Connection</button>
        </div>

        <div class="p-3 mb-4 rounded" style="background: rgba(255,82,82,0.06); border: 1px solid rgba(255,82,82,0.25);">
          <h5 class="font-weight-bold text-danger mb-2"><i class="fas fa-exclamation-triangle"></i> Vault Teardown</h5>
          <p class="small text-muted mb-3">Erase the encrypted token vault from this browser. You will need to input your Personal Access Token again to reconfigure.</p>
          <button class="btn-cyber-danger" onclick="AdminApp.resetVault()"><i class="fas fa-trash-alt"></i> Reset Vault & Clear Token</button>
        </div>
      </div>
    `;
  },

  async testConnection() {
    try {
      this.showToast("Testing GitHub API connection...", "info");
      const user = await this.cms.authenticate();
      this.showToast(`Verified! Connected to @${user.login}`, "success");
    } catch (e) {
      this.showToast(`Connection failed: ${e.message}`, "error");
    }
  },

  /* ========================================================================
     5. Staging & Commit Drawer Pipeline
     ======================================================================== */

  stageFile(path, content, label, isBase64 = false) {
    this.stagedChanges.set(path, {
      path,
      content,
      label,
      isBase64,
      timestamp: new Date().toLocaleTimeString()
    });
    this.updateStagingBar();
  },

  updateStagingBar() {
    const bar = document.getElementById("staging-bar");
    const countEl = document.getElementById("staging-count");
    if (!bar || !countEl) return;

    const count = this.stagedChanges.size;
    if (count > 0) {
      bar.style.display = "flex";
      countEl.textContent = `${count} staged file${count > 1 ? 's' : ''}`;
    } else {
      bar.style.display = "none";
    }
  },

  openCommitDrawer() {
    const drawer = document.getElementById("commit-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    const listEl = document.getElementById("drawer-staged-list");
    const msgInput = document.getElementById("commit-message-input");

    if (!drawer || !backdrop || !listEl) return;

    const items = Array.from(this.stagedChanges.values());
    if (items.length === 0) {
      this.showToast("No changes currently staged.", "info");
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="p-3 mb-2 rounded" style="background: rgba(255,255,255,0.04); border: 1px solid var(--admin-glass-border);">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong style="color: var(--admin-cyan); font-size: 0.9rem;">${item.path}</strong>
          <span class="badge badge-pill badge-info" style="font-size: 0.65rem;">${item.isBase64 ? 'Binary Asset' : 'JSON Schema'}</span>
        </div>
        <div class="small text-muted">${item.label}</div>
      </div>
    `).join('');

    if (msgInput) {
      msgInput.value = items.length === 1 ? items[0].label : `Update portfolio content via Admin Deck (${items.length} files)`;
    }

    backdrop.classList.add("active");
    drawer.classList.add("active");
  },

  closeCommitDrawer() {
    const drawer = document.getElementById("commit-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer) drawer.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
  },

  async executeCommitAndPush() {
    const commitBtn = document.getElementById("btn-publish-push");
    const statusBox = document.getElementById("commit-progress-box");
    const message = (document.getElementById("commit-message-input").value || "").trim() || "Update portfolio content via Admin Deck";

    if (!commitBtn || !statusBox) return;

    const items = Array.from(this.stagedChanges.values());
    if (items.length === 0) return;

    commitBtn.disabled = true;
    commitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Committing to GitHub...`;
    statusBox.style.display = "block";
    statusBox.innerHTML = `<div>Starting atomic commit pipeline for ${items.length} file(s)...</div>`;

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        statusBox.innerHTML += `<div>[${i + 1}/${items.length}] Committing <code>${item.path}</code>...</div>`;

        const res = await this.cms.commitFile(item.path, item.content, message, item.isBase64);
        statusBox.innerHTML += `<div class="text-success">&check; Committed ${item.path} (SHA: ${(res.content && res.content.sha || 'ok').substring(0, 7)})</div>`;
      }

      statusBox.innerHTML += `<div class="mt-2 font-weight-bold text-success">&check; All changes published to origin/main! GitHub Pages deployment triggered.</div>`;
      this.stagedChanges.clear();
      this.updateStagingBar();
      this.showToast("Published successfully to GitHub Pages!", "success");

      setTimeout(() => {
        this.closeCommitDrawer();
        commitBtn.disabled = false;
        commitBtn.innerHTML = `<i class="fas fa-rocket"></i> Publish & Push to GitHub`;
        statusBox.style.display = "none";
      }, 2500);

    } catch (err) {
      statusBox.innerHTML += `<div class="mt-2 text-danger font-weight-bold">Error: ${err.message}</div>`;
      commitBtn.disabled = false;
      commitBtn.innerHTML = `<i class="fas fa-redo"></i> Retry Publish`;
      this.showToast(`Commit failed: ${err.message}`, "error");
    }
  },

  /* ========================================================================
     6. UI Helpers & Setup
     ======================================================================== */

  closeModal() {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;
    const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle";
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  setupDropzone(elementId, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    ["dragenter", "dragover", "dragleave", "drop"].forEach(name => {
      el.addEventListener(name, e => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach(name => {
      el.addEventListener(name, () => el.classList.add("dragover"));
    });

    ["dragleave", "drop"].forEach(name => {
      el.addEventListener(name, () => el.classList.remove("dragover"));
    });

    el.addEventListener("drop", e => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) callback(file);
    });
  },

  bindEvents() {
    const authForm = document.getElementById("auth-form");
    if (authForm) {
      authForm.addEventListener("submit", e => this.handleAuthSubmit(e));
    }
  }
};

// Bootstrap Admin Deck on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  AdminApp.init();
});
