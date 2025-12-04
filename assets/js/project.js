/**
 * Dynamic Project Loader - GitHub Integration
 * Loads projects dynamically from GitHub API with search, filter, and sort
 */

AOS.init();

class ProjectLoader {
  constructor() {
    this.github = githubService;
    this.allRepos = [];
    this.filteredRepos = [];
    this.currentFilter = 'all';
    this.currentSort = 'updated';
    this.searchQuery = '';
  }

  /**
   * Show loading skeleton
   */
  showLoading() {
    const projectcards = document.querySelector(".projectcards");
    if (!projectcards) return;

    let skeletonHTML = '';
    for (let i = 0; i < 6; i++) {
      skeletonHTML += `
                <div class="column skill-card card skeleton-card" style="margin: 15px">
                    <div class="skeleton-wrapper">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text short"></div>
                            <div class="skeleton-tags">
                                <div class="skeleton-tag"></div>
                                <div class="skeleton-tag"></div>
                                <div class="skeleton-tag"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }
    projectcards.innerHTML = skeletonHTML;
  }

  /**
   * Show error state
   */
  showError(message = 'Unable to load projects from GitHub. Please try again later.') {
    const projectcards = document.querySelector(".projectcards");
    if (!projectcards) return;

    projectcards.innerHTML = `
            <div class="error-container">
                <div class="error-icon">
                    <i class="fab fa-github" style="font-size: 64px; opacity: 0.3;"></i>
                </div>
                <h3>Oops!</h3>
                <p>${message}</p>
                <button onclick="projectLoader.loadProjects()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
  }

  /**
   * Generate project card HTML
   */
  createProjectCard(repo) {
    const language = repo.language || 'Code';
    const languageColor = this.github.getLanguageColor(language);
    const updatedTime = this.github.formatRelativeTime(repo.updated_at);
    const description = repo.description || 'No description available';

    // Get topics as tags (limited to 5)
    const topics = repo.topics ? repo.topics.slice(0, 5) : [];
    const tagsHTML = topics.map(topic =>
      `<span class="project-tag">${topic}</span>`
    ).join('');

    return `
            <div class="column skill-card card" style="margin: 15px" 
                 data-aos="zoom-in-up" data-aos-easing="linear" 
                 data-aos-delay="300" data-aos-duration="600"
                 data-language="${language.toLowerCase()}"
                 data-name="${repo.name.toLowerCase()}">
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card-link">
                <div class="wrapper project-card-modern">
                    <div class="card-header">
                        <div class="repo-icon">
                            <i class="fas fa-folder"></i>
                        </div>
                        <div class="card-actions">
                            <span class="card-link" title="View on GitHub">
                                <i class="fab fa-github"></i>
                            </span>
                            ${repo.homepage ? `
                                <span class="card-link card-link-demo" data-url="${repo.homepage}" title="Live Demo">
                                    <i class="fas fa-external-link-alt"></i>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="card-content">
                        <h2 class="project-title">
                            ${repo.name}
                        </h2>
                        <p class="project-description">${description}</p>
                        
                        ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
                        
                        <div class="card-footer">
                            <div class="project-stats">
                                ${repo.language ? `
                                    <span class="stat-item">
                                        <span class="language-dot" style="background-color: ${languageColor}"></span>
                                        ${language}
                                    </span>
                                ` : ''}
                                <span class="stat-item">
                                    <i class="fas fa-star"></i>
                                    ${repo.stargazers_count}
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-code-branch"></i>
                                    ${repo.forks_count}
                                </span>
                            </div>
                            <div class="project-updated">
                                Updated ${updatedTime}
                            </div>
                        </div>
                    </div>
                </div>
                </a>
            </div>
        `;
  }

  /**
   * Filter and sort repositories
   */
  filterAndSort() {
    // Apply language filter
    this.filteredRepos = this.currentFilter === 'all'
      ? [...this.allRepos]
      : this.allRepos.filter(repo =>
        repo.language && repo.language.toLowerCase() === this.currentFilter.toLowerCase()
      );

    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredRepos = this.filteredRepos.filter(repo =>
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(query)))
      );
    }

    // Apply sort
    switch (this.currentSort) {
      case 'stars':
        this.filteredRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'forks':
        this.filteredRepos.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'name':
        this.filteredRepos.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'updated':
      default:
        this.filteredRepos.sort((a, b) =>
          new Date(b.updated_at) - new Date(a.updated_at)
        );
    }
  }

  /**
   * Render projects
   */
  renderProjects() {
    const projectcards = document.querySelector(".projectcards");
    if (!projectcards) return;

    if (this.filteredRepos.length === 0) {
      projectcards.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 48px; opacity: 0.3; margin-bottom: 20px;"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your filters or search query</p>
                </div>
            `;
      return;
    }

    const output = this.filteredRepos.map(repo => this.createProjectCard(repo)).join('');
    projectcards.innerHTML = output;

    // Add click handlers for demo links
    document.querySelectorAll('.card-link-demo').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = link.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank', 'noopener');
        }
      });
    });

    // Re-initialize AOS
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }

  /**
   * Set up filter controls
   */
  setupControls() {
    // Get unique languages
    const languages = new Set(['all']);
    this.allRepos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });

    // Create filter buttons
    const filterContainer = document.querySelector('#project-filters');
    if (filterContainer) {
      const filterHTML = Array.from(languages).map(lang => `
                <button class="filter-btn ${lang === 'all' ? 'active' : ''}" 
                        data-filter="${lang.toLowerCase()}">
                    ${lang === 'all' ? 'All' : lang}
                </button>
            `).join('');
      filterContainer.innerHTML = filterHTML;

      // Add click handlers
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.currentFilter = e.target.dataset.filter;
          this.filterAndSort();
          this.renderProjects();
        });
      });
    }

    // Setup search
    const searchInput = document.querySelector('#project-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.filterAndSort();
        this.renderProjects();
      });
    }

    // Setup sort
    const sortSelect = document.querySelector('#project-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.filterAndSort();
        this.renderProjects();
      });
    }
  }

  /**
   * Load projects from GitHub
   */
  async loadProjects() {
    try {
      this.showLoading();

      const repos = await this.github.fetchRepositories();
      this.allRepos = repos;
      this.filteredRepos = [...repos];

      this.filterAndSort();
      this.setupControls();
      this.renderProjects();

    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError();
    }
  }
}

// Initialize project loader
const projectLoader = new ProjectLoader();

// Load projects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  projectLoader.loadProjects();
});
