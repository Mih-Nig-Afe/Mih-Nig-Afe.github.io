/**
 * GitHub API Service
 * Handles all GitHub API interactions with caching and error handling
 */

class GitHubService {
  constructor(username) {
    this.username = username;
    this.apiBase = 'https://api.github.com';
    this.cache = cacheManager;
  }

  /**
   * Make API request with retry logic and caching
   * @param {string} endpoint - API endpoint
   * @param {string} cacheKey - Cache key for this request
   * @returns {Promise<Object>} API response data
   */
  async fetchWithCache(endpoint, cacheKey) {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Using cached data for ${cacheKey}`);
      return cached;
    }

    try {
      const response = await fetch(`${this.apiBase}${endpoint}`);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the successful response
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error('GitHub API fetch error:', error);

      // Try to return stale cache if available
      const staleCache = localStorage.getItem('github_cache_' + cacheKey);
      if (staleCache) {
        console.warn('Using stale cache due to API error');
        return JSON.parse(staleCache).data;
      }

      throw error;
    }
  }

  /**
   * Fetch user profile data
   * @returns {Promise<Object>} User profile data
   */
  async fetchUser() {
    return this.fetchWithCache(`/users/${this.username}`, 'user_profile');
  }

  /**
   * Fetch all user repositories
   * @returns {Promise<Array>} Array of repository objects
   */
  async fetchRepositories() {
    const repos = await this.fetchWithCache(
      `/users/${this.username}/repos?per_page=100&sort=updated`,
      'user_repos'
    );

    // Filter out forks if you want only original repos
    // return repos.filter(repo => !repo.fork);
    return repos;
  }

  /**
   * Fetch languages for a specific repository
   * @param {string} repoName - Repository name
   * @returns {Promise<Object>} Language statistics
   */
  async fetchRepoLanguages(repoName) {
    return this.fetchWithCache(
      `/repos/${this.username}/${repoName}/languages`,
      `repo_languages_${repoName}`
    );
  }

  /**
   * Calculate aggregate language statistics across all repos
   * @param {Array} repos - Array of repository objects
   * @returns {Promise<Object>} Aggregated language stats
   */
  async calculateLanguageStats(repos) {
    const languageStats = {};

    // Use cached aggregate if available and fresh
    const cached = this.cache.get('aggregate_language_stats');
    if (cached) return cached;

    for (const repo of repos) {
      try {
        const languages = await this.fetchRepoLanguages(repo.name);

        for (const [lang, bytes] of Object.entries(languages)) {
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
        }
      } catch (error) {
        console.error(`Error fetching languages for ${repo.name}:`, error);
      }
    }

    // Convert bytes to percentages
    const total = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
    const percentages = {};

    for (const [lang, bytes] of Object.entries(languageStats)) {
      percentages[lang] = {
        bytes,
        percentage: ((bytes / total) * 100).toFixed(2)
      };
    }

    // Sort by usage
    const sorted = Object.entries(percentages)
      .sort((a, b) => b[1].bytes - a[1].bytes)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // Cache the result
    this.cache.set('aggregate_language_stats', sorted);

    return sorted;
  }

  /**
   * Get total stars across all repositories
   * @param {Array} repos - Array of repository objects
   * @returns {number} Total star count
   */
  getTotalStars(repos) {
    return repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  }

  /**
   * Get total forks across all repositories
   * @param {Array} repos - Array of repository objects
   * @returns {number} Total fork count
   */
  getTotalForks(repos) {
    return repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  }

  /**
   * Get repository language color (GitHub's color scheme)
   * @param {string} language - Programming language name
   * @returns {string} Hex color code
   */
  getLanguageColor(language) {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB',
      'Shell': '#89e051',
      'Dockerfile': '#384d54'
    };

    return colors[language] || '#858585';
  }

  /**
   * Format relative time (e.g., "2 days ago")
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}

// Initialize with username
const githubService = new GitHubService('Mih-Nig-Afe');
