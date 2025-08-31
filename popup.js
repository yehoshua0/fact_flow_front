// FactFlow Extension Popup JavaScript - Manifest V3 Version with API Integration

class FactFlowApp {
  constructor() {
    this.currentState = "analyze"; // analyze, loading, results
    this.analysisData = null;
    this.userVote = null; // 'up', 'down', or null
    this.currentUser = null; // User authentication state
    this.settings = {
      autoAnalyze: true,
      showNotifications: false,
      threshold: 70,
    };
    this.apiBaseUrl = "https://fact-flow-back.onrender.com/"; //"http://127.0.0.1:8050";

    this.init();
  }

  init() {
    this.loadSettings();
    this.checkAuthState();
    this.setupEventListeners();
  }

  // Storage Methods
  async getStorageData(key) {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        // Chrome extension environment
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result[key]);
          });
        });
      } else {
        // Fallback to localStorage for testing
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  }

  async setStorageData(key, value) {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        // Chrome extension environment
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, resolve);
        });
      } else {
        // Fallback to localStorage for testing
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Storage set error:", error);
    }
  }

  async removeStorageData(key) {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        // Chrome extension environment
        return new Promise((resolve) => {
          chrome.storage.local.remove([key], resolve);
        });
      } else {
        // Fallback to localStorage for testing
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  }

  // Authentication Methods
  async checkAuthState() {
    try {
      const token = await this.getStorageData("factflow_token");
      if (token) {
        const user = await this.validateToken(token);
        if (user) {
          this.currentUser = user;
          this.showMainInterface();
          this.loadUserData();
          this.loadInitialState();
        } else {
          await this.removeStorageData("factflow_token");
          this.showAuthInterface();
        }
      } else {
        this.showAuthInterface();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      this.showAuthInterface();
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Token validation failed:", error);
      return null;
    }
  }

  showAuthInterface() {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("main-container").classList.add("hidden");
  }

  showMainInterface() {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("main-container").classList.remove("hidden");
  }

  setupEventListeners() {
    this.setupAuthListeners();
    this.setupMainAppListeners();
  }

  setupAuthListeners() {
    // Auth tab switching
    const authTabBtns = document.querySelectorAll(".auth-tab-btn");
    const authTabContents = document.querySelectorAll(".auth-content");

    authTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-auth-tab");
        this.switchAuthTab(targetTab, authTabBtns, authTabContents);
      });
    });

    // Sign in form
    document.getElementById("signin-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSignIn();
    });

    // Sign up form
    document.getElementById("signup-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSignUp();
    });

    // Forgot password
    document
      .getElementById("forgot-password-btn")
      .addEventListener("click", () => {
        this.handleForgotPassword();
      });

    // Profile management
    document
      .getElementById("edit-profile-btn")
      .addEventListener("click", () => {
        this.openEditProfileModal();
      });

    document
      .getElementById("change-password-btn")
      .addEventListener("click", () => {
        this.openChangePasswordModal();
      });

    document.getElementById("signout-btn").addEventListener("click", () => {
      this.handleSignOut();
    });

    // Edit profile modal
    document
      .getElementById("edit-profile-close")
      .addEventListener("click", () => {
        this.closeModal("edit-profile-modal");
      });

    document
      .getElementById("edit-profile-cancel")
      .addEventListener("click", () => {
        this.closeModal("edit-profile-modal");
      });

    document
      .getElementById("edit-profile-save")
      .addEventListener("click", () => {
        this.saveProfileChanges();
      });

    // Change password modal
    document
      .getElementById("change-password-close")
      .addEventListener("click", () => {
        this.closeModal("change-password-modal");
      });

    document
      .getElementById("change-password-cancel")
      .addEventListener("click", () => {
        this.closeModal("change-password-modal");
      });

    document
      .getElementById("change-password-save")
      .addEventListener("click", () => {
        this.savePasswordChange();
      });
  }

  setupMainAppListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab, tabBtns, tabContents);
      });
    });

    // Analysis functionality
    document.getElementById("analysis-btn").addEventListener("click", () => {
      this.startAnalysis();
    });

    document
      .getElementById("analyze-again-btn")
      .addEventListener("click", () => {
        this.resetToAnalyzeState();
      });

    // Vote buttons
    document.getElementById("vote-up").addEventListener("click", () => {
      this.handleVote("up");
    });

    document.getElementById("vote-down").addEventListener("click", () => {
      this.handleVote("down");
    });

    // Modal functionality
    this.setupModalListeners();
  }

  setupModalListeners() {
    // Settings modal
    document.getElementById("settings-btn").addEventListener("click", () => {
      this.openModal("settings-modal");
    });

    document.getElementById("settings-close").addEventListener("click", () => {
      this.closeModal("settings-modal");
    });

    document.getElementById("settings-save").addEventListener("click", () => {
      this.saveSettings();
    });

    document.getElementById("settings-reset").addEventListener("click", () => {
      this.resetSettings();
    });

    // Help modal
    document.getElementById("help-btn").addEventListener("click", () => {
      this.openModal("help-modal");
    });

    document.getElementById("help-close").addEventListener("click", () => {
      this.closeModal("help-modal");
    });

    // Settings controls
    document
      .getElementById("threshold-slider")
      .addEventListener("input", (e) => {
        document.querySelector(".threshold-value").textContent =
          e.target.value + "%";
      });

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target.id);
      }
    });
  }

  switchAuthTab(targetTab, authTabBtns, authTabContents) {
    // Remove active class from all auth tabs
    authTabBtns.forEach((b) => b.classList.remove("active"));
    authTabContents.forEach((content) => content.classList.add("hidden"));

    // Add active class to clicked tab
    document
      .querySelector(`[data-auth-tab="${targetTab}"]`)
      .classList.add("active");
    document.getElementById(targetTab + "-auth-tab").classList.remove("hidden");

    // Clear any previous messages
    this.hideAuthMessage();
  }

  switchTab(targetTab, tabBtns, tabContents) {
    // Remove active class from all tabs
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((content) => content.classList.add("hidden"));

    // Add active class to clicked tab
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add("active");
    document.getElementById(targetTab + "-tab").classList.remove("hidden");
  }

  async handleSignIn() {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    if (!email || !password) {
      this.showAuthMessage("Please fill in all fields", "error");
      return;
    }

    const submitBtn = document.querySelector(
      "#signin-form button[type='submit']"
    );
    this.setButtonLoading(submitBtn, true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.currentUser = data.user;
        await this.setStorageData("factflow_token", data.access_token);
        this.showAuthMessage("Sign in successful!", "success");

        setTimeout(() => {
          this.showMainInterface();
          this.loadUserData();
          this.loadInitialState();
        }, 1000);
      } else {
        this.showAuthMessage(
          data.detail || data.error || "Sign in failed",
          "error"
        );
      }
    } catch (error) {
      console.error("Sign in error:", error);
      this.showAuthMessage("Network error. Please try again.", "error");
    } finally {
      this.setButtonLoading(submitBtn, false);
    }
  }

  async handleSignUp() {
    const username = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById(
      "signup-confirm-password"
    ).value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      this.showAuthMessage("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      this.showAuthMessage("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      this.showAuthMessage("Password must be at least 6 characters", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showAuthMessage("Please enter a valid email address", "error");
      return;
    }

    const submitBtn = document.querySelector(
      "#signup-form button[type='submit']"
    );
    this.setButtonLoading(submitBtn, true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          profile_photo: "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.showAuthMessage(
          "Account created successfully! Please sign in.",
          "success"
        );

        // Switch to sign in tab and pre-fill email
        setTimeout(() => {
          this.switchAuthTab(
            "signin",
            document.querySelectorAll(".auth-tab-btn"),
            document.querySelectorAll(".auth-content")
          );
          document.getElementById("signin-email").value = email;
        }, 1500);
      } else {
        this.showAuthMessage(
          data.detail || data.error || "Sign up failed",
          "error"
        );
      }
    } catch (error) {
      console.error("Sign up error:", error);
      this.showAuthMessage("Network error. Please try again.", "error");
    } finally {
      this.setButtonLoading(submitBtn, false);
    }
  }

  handleForgotPassword() {
    const email = document.getElementById("signin-email").value.trim();

    if (!email) {
      this.showAuthMessage("Please enter your email address first", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showAuthMessage("Please enter a valid email address", "error");
      return;
    }

    // Show message (password reset would be handled by backend)
    this.showAuthMessage(
      "If an account exists with this email, you will receive a password reset link.",
      "info"
    );
  }

  async handleSignOut() {
    if (confirm("Are you sure you want to sign out?")) {
      try {
        // Clear stored token
        await this.removeStorageData("factflow_token");

        // Reset user state
        this.currentUser = null;
        this.analysisData = null;
        this.userVote = null;

        // Show auth interface
        this.showAuthInterface();
        this.clearAuthForms();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  }

  loadUserData() {
    if (!this.currentUser) return;

    // Update user display
    document.getElementById("user-name").textContent =
      this.currentUser.username;
    document.getElementById(
      "user-level"
    ).textContent = `Level ${this.currentUser.level}`;
    document.getElementById("points-value").textContent =
      this.currentUser.points;

    // Update stats
    document.getElementById("stat-verified").textContent = this.currentUser
      .is_verified
      ? "Yes"
      : "No";
    document.getElementById("stat-reputation").textContent =
      this.currentUser.reputation;
    document.getElementById("stat-streak").textContent =
      this.currentUser.streak;

    // Set user avatar - use profile photo if available, otherwise initials
    const avatar = document.getElementById("user-avatar");
    if (this.currentUser.profile_photo) {
      // Create img element for profile photo
      avatar.innerHTML = `<img src="${this.currentUser.profile_photo}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      // Use initials as fallback
      avatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
    }

    // Display badges if any
    this.displayUserBadges(this.currentUser.badges || []);
  }

  displayUserBadges(badges) {
    const badgesContainer = document.getElementById("user-badges-container");

    if (!badgesContainer) {
      console.log("User badges:", badges);
      return;
    }

    badgesContainer.innerHTML = "";

    if (!badges || badges.length === 0) {
      badgesContainer.innerHTML =
        '<span class="no-badges">No badges yet</span>';
      return;
    }

    badges.forEach((badge) => {
      const badgeEl = document.createElement("div");
      badgeEl.className = "user-badge";

      // Map badge names to display info
      const badgeInfo = this.getBadgeInfo(badge);
      badgeEl.innerHTML = `
        <span class="badge-icon">${badgeInfo.icon}</span>
        <span class="badge-name">${badgeInfo.name}</span>
      `;

      badgesContainer.appendChild(badgeEl);
    });
  }

  getBadgeInfo(badge) {
    const badgeMap = {
      first_vote: { icon: "🗳️", name: "First Vote" },
      analyst: { icon: "📊", name: "Analyst" },
      fact_checker: { icon: "✅", name: "Fact Checker" },
      trusted_user: { icon: "⭐", name: "Trusted User" },
      power_voter: { icon: "💪", name: "Power Voter" },
      streak_master: { icon: "🔥", name: "Streak Master" },
    };

    return badgeMap[badge] || { icon: "🏆", name: badge.replace("_", " ") };
  }

  loadInitialState() {
    this.setState("analyze");
    this.updateStatusIndicator("active");

    // Switch to analysis tab by default
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    this.switchTab("analysis", tabBtns, tabContents);

    // Auto-analyze if enabled
    if (this.settings.autoAnalyze) {
      setTimeout(() => {
        this.startAnalysis();
      }, 1000);
    }
  }

  // Analysis Methods
  async startAnalysis() {
    if (this.currentState === "loading") return;

    try {
      this.setState("loading");
      this.updateStatusIndicator("analyzing");

      // Simulate analysis steps
      await this.simulateAnalysisSteps();

      // Get current page content for analysis
      const pageContent = await this.getCurrentPageContent();

      // Perform analysis using API
      const results = await this.performAnalysis(pageContent);

      this.analysisData = results;
      this.setState("results");
      this.displayResults(results);
      this.updateStatusIndicator("active");

      // Load existing votes for this article
      await this.loadArticleVotes(results.article_id);
    } catch (error) {
      console.error("Analysis failed:", error);
      this.updateStatusIndicator("error");
      this.showAnalysisError(error.message);
    }
  }

  async simulateAnalysisSteps() {
    const steps = document.querySelectorAll(".step");

    for (let i = 0; i < steps.length; i++) {
      // Remove active from all steps
      steps.forEach((step) => step.classList.remove("active"));
      // Add active to current step
      steps[i].classList.add("active");

      // Wait before next step
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  async getCurrentPageContent() {
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        // Chrome extension environment
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        // Execute content script to get page text
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            // Extract main content text from the page
            const content =
              document.body.innerText || document.body.textContent || "";
            return content.substring(0, 5000); // Limit to first 5000 characters
          },
        });

        return results[0].result;
      } else {
        // Fallback for testing - return sample text
        return "This is sample article content for testing the FactFlow extension. It contains various claims that need to be fact-checked for accuracy and reliability.";
      }
    } catch (error) {
      console.error("Failed to get page content:", error);
      return "Unable to extract page content";
    }
  }

  async performAnalysis(text) {
    const token = await this.getStorageData("factflow_token");

    const response = await fetch(`${this.apiBaseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();

    // Get additional article data if available
    if (data.article_id) {
      try {
        const articleResponse = await fetch(
          `${this.apiBaseUrl}/article/${data.article_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (articleResponse.ok) {
          const articleData = await articleResponse.json();
          // Merge the data
          return {
            ...data,
            ai_score: articleData.ai_score * 100 || data.score * 100,
            community_score:
              articleData.community_score * 100 || data.community_score * 100,
            combined_score:
              articleData.combined_score * 100 || data.score * 100,
            vote_count: articleData.vote_count || data.total_votes,
          };
        }
      } catch (error) {
        console.error("Failed to get article details:", error);
      }
    }

    return data;
  }

  async loadArticleVotes(articleId) {
    if (!articleId) return;

    try {
      const token = await this.getStorageData("factflow_token");
      const response = await fetch(
        `${this.apiBaseUrl}/article/${articleId}/votes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const voteData = await response.json();
        // Update vote display with actual data
        this.updateVoteDisplay(voteData);
      }
    } catch (error) {
      console.error("Failed to load article votes:", error);
    }
  }

  updateVoteDisplay(voteData) {
    // Update vote counts based on API response
    if (typeof voteData === "string") {
      // If it's a string response, parse it or handle accordingly
      console.log("Vote data:", voteData);
    } else if (voteData.positive !== undefined) {
      document.getElementById("vote-up-count").textContent = voteData.positive;
      document.getElementById("vote-down-count").textContent =
        voteData.negative;
    }
  }

  displayResults(results) {
    // Use combined_score or score for final score
    const finalScore = results.combined_score || results.score || 0;
    const aiScore = results.ai_score || results.score || 0;
    const communityScore = results.community_score || 0;

    // Update status based on combined score
    const statusIcon = document.getElementById("result-status-icon");
    const statusTitle = document.getElementById("result-status-title");
    const statusSubtitle = document.getElementById("result-status-subtitle");

    if (finalScore >= 70) {
      statusIcon.textContent = "🟢";
      statusTitle.textContent = "High Reliability";
      statusSubtitle.textContent = "This source appears trustworthy";
    } else if (finalScore >= 40) {
      statusIcon.textContent = "🟡";
      statusTitle.textContent = "Moderate Reliability";
      statusSubtitle.textContent = "Use caution, verify claims";
    } else {
      statusIcon.textContent = "🔴";
      statusTitle.textContent = "Low Reliability";
      statusSubtitle.textContent = "High risk of misinformation";
    }

    // Update scores with animation
    this.animateScore("ai-score", aiScore);
    this.animateScore("community-score", communityScore);
    this.animateScore("final-score", finalScore);

    // Update explanation - format as justified paragraphs
    this.displayExplanation(
      results.explanation ||
        results.label ||
        "No detailed explanation available"
    );

    // Update vote counts
    document.getElementById("vote-up-count").textContent =
      results.positive || 0;
    document.getElementById("vote-down-count").textContent =
      results.negative || 0;
  }

  animateScore(scorePrefix, value) {
    const fillEl = document.getElementById(scorePrefix + "-fill");
    const valueEl = document.getElementById(scorePrefix + "-value");

    // Determine color based on value
    const colorClass = value >= 70 ? "green" : value >= 40 ? "yellow" : "red";
    fillEl.className = `score-fill ${colorClass}`;

    // Animate the fill
    setTimeout(() => {
      fillEl.style.width = value + "%";
    }, 100);

    // Animate the number
    let current = 0;
    const increment = value / 30; // 30 frames
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      valueEl.textContent = Math.round(current) + "%";
    }, 30);
  }

  displayExplanation(explanation) {
    const container = document.getElementById("explanation-items");
    container.innerHTML = "";

    if (typeof explanation === "string") {
      // Create a justified paragraph for the explanation
      const div = document.createElement("div");
      div.className = "explanation-paragraph";
      div.style.textAlign = "justify";
      div.style.lineHeight = "1.5";
      div.style.marginBottom = "10px";
      div.style.fontSize = "0.8em";
      div.style.padding = "10px";
      div.style.backgroundColor = "#f8f9fa";
      div.style.borderRadius = "6px";
      div.style.border = "1px solid #e9ecef";
      div.textContent = explanation;
      container.appendChild(div);
    } else if (Array.isArray(explanation)) {
      // Handle array of explanation items (legacy format)
      explanation.forEach((item) => {
        const div = document.createElement("div");
        div.className = `explanation-item ${item.type}`;

        const icon =
          item.type === "positive" ? "✓" : item.type === "warning" ? "⚠" : "✗";

        div.innerHTML = `
          <span class="explanation-icon">${icon}</span>
          <span>${item.text}</span>
        `;

        container.appendChild(div);
      });
    }
  }

  showAnalysisError(message) {
    const container = document.getElementById("explanation-items");
    container.innerHTML = `
      <div class="explanation-item error">
        <span class="explanation-icon">✗</span>
        <span>Analysis failed: ${message}</span>
      </div>
    `;
  }

  // Vote handling
  async handleVote(voteType) {
    if (!this.analysisData || !this.analysisData.article_id) {
      console.error("No article to vote on");
      return;
    }

    const previousVote = this.userVote;

    if (this.userVote === voteType) {
      // User is removing their vote
      this.userVote = null;
    } else {
      this.userVote = voteType;
    }

    this.updateVoteButtons();

    // Submit vote to API
    try {
      await this.submitVote(voteType, this.analysisData.article_id);

      // Update local counts optimistically
      this.updateLocalVoteCounts(voteType, previousVote);
    } catch (error) {
      console.error("Vote submission failed:", error);
      // Revert vote on failure
      this.userVote = previousVote;
      this.updateVoteButtons();
    }
  }

  updateVoteButtons() {
    const upBtn = document.getElementById("vote-up");
    const downBtn = document.getElementById("vote-down");

    // Reset classes
    upBtn.classList.remove("voted");
    downBtn.classList.remove("voted");

    // Add voted class to active vote
    if (this.userVote === "up") {
      upBtn.classList.add("voted");
    } else if (this.userVote === "down") {
      downBtn.classList.add("voted");
    }
  }

  async submitVote(voteType, articleId) {
    const token = await this.getStorageData("factflow_token");

    const voteData = {
      user_id: this.currentUser.user_id,
      article_id: articleId,
      vote: voteType === "up" ? 1 : 0, // 1 for upvote, 0 for downvote
    };

    const response = await fetch(`${this.apiBaseUrl}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Vote submission failed");
    }

    const result = await response.text();
    console.log("Vote submitted successfully:", result);

    // Award points and update user data after successful vote
    await this.updateUserAfterVote();

    return result;
  }

  updateLocalVoteCounts(voteType, previousVote) {
    const upCountEl = document.getElementById("vote-up-count");
    const downCountEl = document.getElementById("vote-down-count");

    let upCount = parseInt(upCountEl.textContent);
    let downCount = parseInt(downCountEl.textContent);

    // Remove previous vote
    if (previousVote === "up") {
      upCount = Math.max(0, upCount - 1);
    } else if (previousVote === "down") {
      downCount = Math.max(0, downCount - 1);
    }

    // Add new vote
    if (this.userVote === "up") {
      upCount += 1;
    } else if (this.userVote === "down") {
      downCount += 1;
    }

    upCountEl.textContent = upCount;
    downCountEl.textContent = downCount;
  }

  async updateUserAfterVote() {
    try {
      // Refresh current user data to get updated points, badges, etc.
      const updatedUser = await this.getCurrentUser();
      if (updatedUser) {
        const oldUser = { ...this.currentUser };
        this.currentUser = updatedUser;
        this.loadUserData();

        // Check for new badges or achievements
        this.checkForNewAchievements(updatedUser, oldUser);
      }
    } catch (error) {
      console.error("Failed to update user after vote:", error);
    }
  }

  checkForNewAchievements(updatedUser, oldUser) {
    // Check if user earned their first vote badge
    if (
      updatedUser.badges &&
      updatedUser.badges.includes("first_vote") &&
      (!oldUser.badges || !oldUser.badges.includes("first_vote"))
    ) {
      this.showTemporaryMessage("Achievement unlocked: First Vote!", "success");
    }

    // Check if user became verified (has voted on articles)
    if (updatedUser.is_verified && !oldUser.is_verified) {
      this.showTemporaryMessage("You are now a verified user!", "success");
    }

    // Check for analyst badge (after 10 days login streak)
    if (
      updatedUser.badges &&
      updatedUser.badges.includes("analyst") &&
      (!oldUser.badges || !oldUser.badges.includes("analyst"))
    ) {
      this.showTemporaryMessage(
        "Achievement unlocked: Analyst Badge!",
        "success"
      );
    }

    // Check for other potential badges
    if (
      updatedUser.badges &&
      updatedUser.badges.includes("fact_checker") &&
      (!oldUser.badges || !oldUser.badges.includes("fact_checker"))
    ) {
      this.showTemporaryMessage(
        "Achievement unlocked: Fact Checker!",
        "success"
      );
    }

    // Show points gained
    if (updatedUser.points > oldUser.points) {
      const pointsGained = updatedUser.points - oldUser.points;
      this.showTemporaryMessage(`+${pointsGained} points earned!`, "success");
    }
  }

  resetToAnalyzeState() {
    this.setState("analyze");
    this.userVote = null;
    this.analysisData = null;
    this.updateVoteButtons();
  }

  // State Management
  setState(newState) {
    this.currentState = newState;

    // Hide all states
    document.getElementById("analyze-state").classList.add("hidden");
    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("results-state").classList.add("hidden");

    // Show current state
    document.getElementById(newState + "-state").classList.remove("hidden");
  }

  updateStatusIndicator(status) {
    const indicator = document.getElementById("status-indicator");
    indicator.className = "status-indicator " + status;
  }

  // Profile Management
  openEditProfileModal() {
    // Pre-fill form with current user data
    document.getElementById("edit-display-name").value =
      this.currentUser.username;
    document.getElementById("edit-email").value = this.currentUser.email;

    // Set up profile photo upload functionality
    this.setupProfilePhotoUpload();

    this.openModal("edit-profile-modal");
  }

  setupProfilePhotoUpload() {
    const photoInput = document.getElementById("profile-photo-input");
    const photoPreview = document.getElementById("photo-preview");
    const uploadBtn = document.getElementById("upload-photo-btn");

    if (!photoInput || !photoPreview || !uploadBtn) return;

    // Set current photo if exists
    if (this.currentUser.profile_photo) {
      photoPreview.src = this.currentUser.profile_photo;
      photoPreview.classList.remove("hidden");
    }

    // Handle file selection
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file
        if (!this.validatePhotoFile(file)) {
          return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
          photoPreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });

    // Handle upload button click
    uploadBtn.addEventListener("click", () => {
      photoInput.click();
    });
  }

  validatePhotoFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and GIF files are allowed");
      return false;
    }

    return true;
  }

  openChangePasswordModal() {
    // Clear password form
    document.getElementById("change-password-form").reset();
    this.openModal("change-password-modal");
  }

  async saveProfileChanges() {
    const newUsername = document
      .getElementById("edit-display-name")
      .value.trim();

    if (!newUsername) {
      alert("Display name is required");
      return;
    }

    const saveBtn = document.getElementById("edit-profile-save");
    this.setButtonLoading(saveBtn, true);

    try {
      // First, handle photo upload if a new photo was selected
      const photoInput = document.getElementById("profile-photo-input");
      let newProfilePhoto = this.currentUser.profile_photo || "";

      if (photoInput && photoInput.files && photoInput.files[0]) {
        try {
          const uploadResult = await this.uploadProfilePhoto(
            photoInput.files[0]
          );
          if (uploadResult) {
            // Get the updated user data which should include the new photo URL
            const updatedUser = await this.getCurrentUser();
            if (updatedUser && updatedUser.profile_photo) {
              newProfilePhoto = updatedUser.profile_photo;
            }
          }
        } catch (error) {
          console.error("Photo upload failed:", error);
          alert("Failed to upload photo, but profile will still be updated");
        }
      }

      // Update profile with username and photo
      const token = await this.getStorageData("factflow_token");
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          profile_photo: newProfilePhoto,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        this.currentUser = updatedUser;
        this.loadUserData();
        this.closeModal("edit-profile-modal");
        this.showTemporaryMessage("Profile updated successfully", "success");
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Network error. Please try again.");
    } finally {
      this.setButtonLoading(saveBtn, false);
    }
  }

  async savePasswordChange() {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById(
      "confirm-new-password"
    ).value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      // Note: Password change endpoint not specified in API
      // This would typically be a separate endpoint like /users/me/password
      this.closeModal("change-password-modal");
      alert(
        "Password change functionality would be implemented with backend support"
      );
    } catch (error) {
      console.error("Password change failed:", error);
      alert("Failed to update password");
    }
  }

  // Modal Management
  openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
  }

  // Settings Management
  async loadSettings() {
    try {
      const storedSettings = await this.getStorageData("factflow_settings");
      if (storedSettings) {
        this.settings = { ...this.settings, ...storedSettings };
      }

      // Update UI elements if they exist
      setTimeout(() => {
        const autoAnalyzeEl = document.getElementById("auto-analyze");
        const showNotificationsEl =
          document.getElementById("show-notifications");
        const thresholdSliderEl = document.getElementById("threshold-slider");
        const thresholdValueEl = document.querySelector(".threshold-value");

        if (autoAnalyzeEl) autoAnalyzeEl.checked = this.settings.autoAnalyze;
        if (showNotificationsEl)
          showNotificationsEl.checked = this.settings.showNotifications;
        if (thresholdSliderEl)
          thresholdSliderEl.value = this.settings.threshold;
        if (thresholdValueEl)
          thresholdValueEl.textContent = this.settings.threshold + "%";
      }, 100);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async saveSettings() {
    this.settings.autoAnalyze = document.getElementById("auto-analyze").checked;
    this.settings.showNotifications =
      document.getElementById("show-notifications").checked;
    this.settings.threshold = parseInt(
      document.getElementById("threshold-slider").value
    );

    try {
      await this.setStorageData("factflow_settings", this.settings);
      console.log("Settings saved:", this.settings);
      this.closeModal("settings-modal");

      // Show success feedback
      this.showTemporaryMessage("Settings saved successfully", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    }
  }

  async resetSettings() {
    this.settings = {
      autoAnalyze: true,
      showNotifications: false,
      threshold: 70,
    };

    try {
      await this.setStorageData("factflow_settings", this.settings);
      this.loadSettings();
      this.showTemporaryMessage("Settings reset to defaults", "info");
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }

  // Photo Upload Methods
  async uploadProfilePhoto(file) {
    try {
      const token = await this.getStorageData("factflow_token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.apiBaseUrl}/users/me/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        console.log("Photo uploaded successfully:", result);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Upload failed");
      }
    } catch (error) {
      console.error("Photo upload failed:", error);
      throw error;
    }
  }

  // User Profile Methods
  async getCurrentUser() {
    try {
      const token = await this.getStorageData("factflow_token");
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  // Utility Methods
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add("loading");
      button.disabled = true;
      const originalText = button.textContent;
      button.setAttribute("data-original-text", originalText);
      button.textContent = "Loading...";
    } else {
      button.classList.remove("loading");
      button.disabled = false;
      const originalText = button.getAttribute("data-original-text");
      if (originalText) {
        button.textContent = originalText;
        button.removeAttribute("data-original-text");
      }
    }
  }

  showAuthMessage(message, type) {
    const messageEl = document.getElementById("auth-message");
    const textEl = messageEl.querySelector(".message-text");

    messageEl.className = `auth-message ${type}`;
    textEl.textContent = message;
    messageEl.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideAuthMessage();
    }, 5000);
  }

  hideAuthMessage() {
    const messageEl = document.getElementById("auth-message");
    messageEl.classList.add("hidden");
  }

  showTemporaryMessage(message, type) {
    // Create temporary message element
    const messageEl = document.createElement("div");
    messageEl.className = `temporary-message ${type}`;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transition: opacity 0.3s ease;
    `;

    if (type === "success") {
      messageEl.style.backgroundColor = "#28a745";
    } else if (type === "error") {
      messageEl.style.backgroundColor = "#dc3545";
    } else {
      messageEl.style.backgroundColor = "#17a2b8";
    }

    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.opacity = "0";
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  clearAuthForms() {
    document.getElementById("signin-form").reset();
    document.getElementById("signup-form").reset();
    this.hideAuthMessage();
  }

  // Auto-analysis for new pages
  async handlePageChange() {
    if (
      this.settings.autoAnalyze &&
      this.currentUser &&
      this.currentState === "analyze"
    ) {
      setTimeout(() => {
        this.startAnalysis();
      }, 2000); // Delay to allow page to load
    }
  }

  // Network status handling
  handleNetworkError() {
    this.updateStatusIndicator("error");
    this.showTemporaryMessage("Network connection lost", "error");
  }

  handleNetworkRestore() {
    this.updateStatusIndicator("active");
    this.showTemporaryMessage("Connection restored", "success");
  }

  // Error Handling
  handleApiError(error, response) {
    if (response && response.status === 401) {
      // Unauthorized - token might be expired
      this.handleSignOut();
      return;
    }

    console.error("API Error:", error);
    throw error;
  }

  // Login Streak and Reputation Management
  async updateLoginStreak() {
    try {
      const lastLogin = await this.getStorageData("factflow_last_login");
      const today = new Date().toDateString();

      if (lastLogin !== today) {
        // Update login streak
        await this.setStorageData("factflow_last_login", today);

        // Refresh user data to get updated streak
        const updatedUser = await this.getCurrentUser();
        if (updatedUser) {
          this.currentUser = updatedUser;
          this.loadUserData();

          // Check for streak achievements
          if (
            updatedUser.streak >= 10 &&
            updatedUser.badges &&
            updatedUser.badges.includes("analyst")
          ) {
            this.showTemporaryMessage(
              "Daily login streak maintained!",
              "success"
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to update login streak:", error);
    }
  }

  // Daily login tracking
  async trackDailyLogin() {
    try {
      const today = new Date().toDateString();
      const lastLogin = await this.getStorageData("factflow_last_login");

      if (lastLogin !== today) {
        await this.setStorageData("factflow_last_login", today);

        // Could call an API endpoint to update server-side streak
        // This would increment the user's streak count
        const token = await this.getStorageData("factflow_token");

        try {
          await fetch(`${this.apiBaseUrl}/users/me/daily-login`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Failed to track daily login:", error);
        }
      }
    } catch (error) {
      console.error("Failed to track daily login:", error);
    }
  }

  // Article vote history
  async loadUserVoteHistory() {
    try {
      const token = await this.getStorageData("factflow_token");
      const response = await fetch(`${this.apiBaseUrl}/users/me/votes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const voteHistory = await response.json();
        this.displayVoteHistory(voteHistory);
      }
    } catch (error) {
      console.error("Failed to load vote history:", error);
    }
  }

  displayVoteHistory(voteHistory) {
    const historyContainer = document.getElementById("vote-history-container");

    if (!historyContainer) return;

    historyContainer.innerHTML = "";

    if (!voteHistory || voteHistory.length === 0) {
      historyContainer.innerHTML =
        '<p class="no-history">No vote history yet</p>';
      return;
    }

    voteHistory.forEach((vote) => {
      const voteEl = document.createElement("div");
      voteEl.className = "vote-history-item";

      const voteIcon = vote.vote === 1 ? "👍" : "👎";
      const voteText = vote.vote === 1 ? "Upvoted" : "Downvoted";

      voteEl.innerHTML = `
        <div class="vote-icon">${voteIcon}</div>
        <div class="vote-details">
          <div class="vote-action">${voteText}</div>
          <div class="vote-date">${new Date(
            vote.created_at
          ).toLocaleDateString()}</div>
        </div>
      `;

      historyContainer.appendChild(voteEl);
    });
  }

  // Community features
  async loadCommunityStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/community/stats`);

      if (response.ok) {
        const stats = await response.json();
        this.displayCommunityStats(stats);
      }
    } catch (error) {
      console.error("Failed to load community stats:", error);
    }
  }

  displayCommunityStats(stats) {
    const statsContainer = document.getElementById("community-stats");

    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${stats.total_articles || 0}</div>
        <div class="stat-label">Articles Analyzed</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.total_votes || 0}</div>
        <div class="stat-label">Community Votes</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.active_users || 0}</div>
        <div class="stat-label">Active Users</div>
      </div>
    `;
  }

  // Enhanced initialization
  async initializeApp() {
    await this.trackDailyLogin();
    await this.updateLoginStreak();

    // Load community stats in background
    this.loadCommunityStats();

    // Set up periodic updates
    this.setupPeriodicUpdates();
  }

  setupPeriodicUpdates() {
    // Update user data every 5 minutes
    setInterval(async () => {
      if (this.currentUser) {
        const updatedUser = await this.getCurrentUser();
        if (updatedUser) {
          const oldUser = { ...this.currentUser };
          this.currentUser = updatedUser;
          this.loadUserData();
          this.checkForNewAchievements(updatedUser, oldUser);
        }
      }
    }, 5 * 60 * 1000);

    // Update community stats every 10 minutes
    setInterval(() => {
      this.loadCommunityStats();
    }, 10 * 60 * 1000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new FactFlowApp();

  // Enhanced initialization
  app.initializeApp();

  // Listen for page changes if in extension environment
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.active) {
        app.handlePageChange();
      }
    });
  }

  // Handle network status
  window.addEventListener("online", () => app.handleNetworkRestore());
  window.addEventListener("offline", () => app.handleNetworkError());

  // Handle page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && app.currentUser) {
      // Page became visible, refresh user data
      app.getCurrentUser().then((user) => {
        if (user) {
          const oldUser = { ...app.currentUser };
          app.currentUser = user;
          app.loadUserData();
          app.checkForNewAchievements(user, oldUser);
        }
      });
    }
  });
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = FactFlowApp;
}
