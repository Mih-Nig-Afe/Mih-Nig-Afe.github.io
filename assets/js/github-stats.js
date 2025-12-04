/**
 * GitHub Statistics Component
 * Renders real-time GitHub stats, language charts, and signal bars
 */

class GitHubStats {
  constructor(githubService) {
    this.github = githubService;
  }

  /**
   * Render stats cards (repos, followers, stars, etc.)
   * @param {Object} userData - GitHub user data
   * @param {Array} repos - Repository array
   */
  async renderStatsCards(userData, repos) {
    const totalStars = this.github.getTotalStars(repos);
    const totalForks = this.github.getTotalForks(repos);

    return `
            <div class="stats-grid">
                <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
                    <div class="stat-icon"><i class="fas fa-code-branch"></i></div>
                    <div class="stat-value">${userData.public_repos}</div>
                    <div class="stat-label">Repositories</div>
                </div>
                
                <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-value">${userData.followers}</div>
                    <div class="stat-label">Followers</div>
                </div>
                
                <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
                    <div class="stat-icon"><i class="fas fa-star"></i></div>
                    <div class="stat-value">${totalStars}</div>
                    <div class="stat-label">Total Stars</div>
                </div>
                
                <div class="stat-card" data-aos="fade-up" data-aos-delay="400">
                    <div class="stat-icon"><i class="fas fa-code-fork"></i></div>
                    <div class="stat-value">${totalForks}</div>
                    <div class="stat-label">Total Forks</div>
                </div>
            </div>
        `;
  }

  /**
   * Render Signal Bars (Live Telemetry) - inspired by GitHub profile
   * @param {Object} languageStats - Language statistics object
   */
  renderSignalBars(languageStats) {
    const topLanguages = Object.entries(languageStats).slice(0, 6);

    let barsHTML = '<div class="signal-bars-container">';
    barsHTML += '<h3 class="signal-title">⚡ Signal Bars (Live Telemetry)</h3>';
    barsHTML += '<div class="signal-bars">';

    topLanguages.forEach(([lang, stats], index) => {
      const percentage = parseFloat(stats.percentage);
      const normalizedHeight = Math.min(100, (percentage / 30) * 100); // Normalize to max 30%

      barsHTML += `
                <div class="signal-bar" data-aos="zoom-in" data-aos-delay="${index * 100}">
                    <div class="signal-bar-fill" style="height: ${normalizedHeight}%; --bar-color: ${this.github.getLanguageColor(lang)}">
                        <div class="signal-pulse"></div>
                    </div>
                    <div class="signal-label">${lang}</div>
                    <div class="signal-percentage">${stats.percentage}%</div>
                </div>
            `;
    });

    barsHTML += '</div>';
    barsHTML += '<p class="signal-description">Each signal reflects shipped systems—with telemetry to prove it.</p>';
    barsHTML += '</div>';

    return barsHTML;
  }

  /**
   * Render Mission Control section
   */
  renderMissionControl() {
    return `
            <div class="mission-control" data-aos="fade-up">
                <h2 class="section-title">🔭 Mission Control</h2>
                <div class="mission-loop">
                    <div class="loop-step" data-aos="fade-right" data-aos-delay="100">
                        <div class="loop-box">Learn</div>
                        <div class="loop-arrow">→</div>
                    </div>
                    <div class="loop-step" data-aos="fade-right" data-aos-delay="200">
                        <div class="loop-box">Experiment</div>
                        <div class="loop-arrow">→</div>
                    </div>
                    <div class="loop-step" data-aos="fade-right" data-aos-delay="300">
                        <div class="loop-box">Measure</div>
                        <div class="loop-arrow">→</div>
                    </div>
                    <div class="loop-step" data-aos="fade-right" data-aos-delay="400">
                        <div class="loop-box">Ship</div>
                        <div class="loop-arrow">→</div>
                    </div>
                    <div class="loop-step" data-aos="fade-right" data-aos-delay="500">
                        <div class="loop-box">Iterate</div>
                    </div>
                </div>
                <div class="mission-description">
                    <p>I am a <strong>Systems Futurist</strong> focused on creating value-driven, adaptive, and observable software. My work spans from autonomous ML agents to edge IoT meshes, always with the goal of fusing AI, robotics, and user experience into a single continuous loop.</p>
                    <ul class="mission-points">
                        <li><strong>Autonomous ML Agents:</strong> Powering ops, comms, and telemetry loops.</li>
                        <li><strong>Edge + IoT Meshes:</strong> Translating real-world signals into actionable data streams.</li>
                        <li><strong>Developer Copilots:</strong> Upgrading rituals into self-healing pipelines.</li>
                        <li><strong>Mission-Grade Software:</strong> Engineered with clean contracts, observability, and ruthless reliability.</li>
                    </ul>
                </div>
            </div>
        `;
  }

  /**
   * Render language chart/breakdown
   * @param {Object} languageStats - Language statistics object
   */
  renderLanguageChart(languageStats) {
    const topLanguages = Object.entries(languageStats).slice(0, 8);

    let chartHTML = '<div class="language-chart" data-aos="fade-up">';
    chartHTML += '<h3 class="chart-title">💻 Technology Stack</h3>';
    chartHTML += '<div class="language-bars">';

    topLanguages.forEach(([lang, stats], index) => {
      const color = this.github.getLanguageColor(lang);
      chartHTML += `
                <div class="language-bar-item" data-aos="fade-left" data-aos-delay="${index * 50}">
                    <div class="language-info">
                        <span class="language-dot" style="background-color: ${color}"></span>
                        <span class="language-name">${lang}</span>
                        <span class="language-percent">${stats.percentage}%</span>
                    </div>
                    <div class="language-bar-bg">
                        <div class="language-bar-fill" style="width: ${stats.percentage}%; background-color: ${color}"></div>
                    </div>
                </div>
            `;
    });

    chartHTML += '</div></div>';
    return chartHTML;
  }

  /**
   * Initialize and render all stats components
   */
  async init() {
    try {
      const [userData, repos] = await Promise.all([
        this.github.fetchUser(),
        this.github.fetchRepositories()
      ]);

      const languageStats = await this.github.calculateLanguageStats(repos);

      // Inject stats into appropriate containers
      const statsContainer = document.querySelector('#github-stats');
      if (statsContainer) {
        statsContainer.innerHTML = await this.renderStatsCards(userData, repos);
      }

      const signalBarsContainer = document.querySelector('#signal-bars');
      if (signalBarsContainer) {
        signalBarsContainer.innerHTML = this.renderSignalBars(languageStats);
      }

      const missionContainer = document.querySelector('#mission-control');
      if (missionContainer) {
        missionContainer.innerHTML = this.renderMissionControl();
      }

      const languageChartContainer = document.querySelector('#language-chart');
      if (languageChartContainer) {
        languageChartContainer.innerHTML = this.renderLanguageChart(languageStats);
      }

      // Re-initialize AOS for new elements
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }

    } catch (error) {
      console.error('Error initializing GitHub stats:', error);
      // Show error message to user
      this.showError();
    }
  }

  /**
   * Show error state
   */
  showError() {
    const containers = ['#github-stats', '#signal-bars', '#mission-control', '#language-chart'];
    containers.forEach(selector => {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Unable to load GitHub data. Please try again later.</p>
                    </div>
                `;
      }
    });
  }
}

// Initialize when DOM is ready
if (typeof githubService !== 'undefined') {
  const githubStats = new GitHubStats(githubService);
}
