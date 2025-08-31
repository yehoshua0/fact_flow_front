// FactFlow Extension Popup JavaScript - Manifest V3 Version

class FactFlowApp {
  constructor() {
    this.currentState = "analyze"; // analyze, loading, results
    this.analysisData = null;
    this.userVote = null; // 'up', 'down', or null
    this.settings = {
      autoAnalyze: true,
      showNotifications: false,
      threshold: 70,
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.loadInitialState();
  }

  setupEventListeners() {
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

    // Close modal when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target.id);
      }
    });

    // Settings controls
    const thresholdSlider = document.getElementById("threshold-slider");
    thresholdSlider.addEventListener("input", (e) => {
      document.querySelector(".threshold-value").textContent =
        e.target.value + "%";
    });

    // ESC key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });
  }

  switchTab(targetTab, tabBtns, tabContents) {
    // Remove active class from all tabs
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((content) => content.classList.add("hidden"));

    // Add active class to clicked tab
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add("active");
    document.getElementById(targetTab + "-tab").classList.remove("hidden");
  }

  async startAnalysis() {
    this.setState("loading");
    this.updateStatusIndicator("analyzing");

    try {
      // Simulate loading steps
      await this.simulateLoadingSteps();

      // Make API call with actual webpage content
      const analysisResult = await this.performAnalysis();
      console.log("Analysis completed:", analysisResult);

      this.analysisData = analysisResult;
      this.setState("results");
      this.displayResults(analysisResult);
      this.updateStatusIndicator("active");
    } catch (error) {
      console.error("Analysis failed:", error);
      this.handleAnalysisError(error);
      this.updateStatusIndicator("error");
    }
  }

  async simulateLoadingSteps() {
    const steps = document.querySelectorAll(".step");

    for (let i = 0; i < steps.length; i++) {
      // Remove active from previous steps
      steps.forEach((step) => step.classList.remove("active"));
      // Add active to current step
      steps[i].classList.add("active");
      // Wait before next step
      await this.delay(800 + Math.random() * 400);
    }
  }

  // NEW: Get actual webpage content using chrome.scripting API
  async getCurrentPageContent() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        throw new Error("No active tab found");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // This function runs in the actual webpage context
          return {
            text: document.body.innerText || document.body.textContent || "",
            title: document.title || "",
            url: window.location.href || "",
            domain: window.location.hostname || "",
            html: document.documentElement.outerHTML.substring(0, 5000), // Limit size
          };
        },
      });

      if (!results || !results[0] || !results[0].result) {
        throw new Error("Failed to extract page content");
      }

      return results[0].result;
    } catch (error) {
      console.error("Error getting page content:", error);

      // Check if it's a permissions issue
      if (error.message.includes("Cannot access")) {
        throw new Error(
          "Cannot access this page. Try refreshing the page or visiting a different website."
        );
      }

      throw new Error("Could not access page content: " + error.message);
    }
  }

  // UPDATED: Use actual webpage content instead of extension popup content
  async performAnalysis() {
    try {
      // Get current active tab content (actual webpage, not extension popup)
      const pageContent = await this.getCurrentPageContent();
      console.log("Page content retrieved:", {
        title: pageContent.title,
        domain: pageContent.domain,
        textLength: pageContent.text.length,
      });

      // Validate content
      if (!pageContent.text || pageContent.text.trim().length < 50) {
        throw new Error(
          "Page content is too short or empty. Please try a different page."
        );
      }

      const response = await fetch("http://127.0.0.1:8050/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: pageContent.text.substring(0, 2000),
          title: pageContent.title,
          url: pageContent.url,
          domain: pageContent.domain,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Analysis results:", data);
      return data;
    } catch (error) {
      console.error("Error during analysis:", error);

      // Return mock data if API fails for development
      if (error.message.includes("fetch")) {
        console.warn("API unavailable, using mock data for development");
        return this.getMockAnalysisData();
      }

      throw error;
    }
  }

  // NEW: Mock data for development when API is unavailable
  getMockAnalysisData() {
    return {
      score: 0.75,
      final_score: 0.75,
      community_score: 0.72,
      title: "Analysis Complete",
      subtitle: "Using mock data - API unavailable",
      explanation:
        "This is mock data returned because the API server is not available. The actual analysis would provide detailed fact-checking results based on AI analysis and community input.",
      votes: {
        up: 42,
        down: 8,
      },
    };
  }

  displayResults(data) {
    // Update status
    document.getElementById("result-status-icon").textContent =
      this.getStatusIcon(data.final_score || data.score);
    document.getElementById("result-status-title").textContent =
      data.title || "Article analyzed";
    document.getElementById("result-status-subtitle").textContent =
      data.subtitle || "Analysis complete";

    // Update scores with animation
    this.animateScore("ai-score", data.score || 0);
    this.animateScore("community-score", data.community_score || 0);
    this.animateScore("final-score", data.final_score || data.score || 0);

    // Update explanation
    this.displayExplanation(
      data.explanation || "No detailed explanation available."
    );

    // Update vote counts
    document.getElementById("vote-up-count").textContent = data.votes?.up || 0;
    document.getElementById("vote-down-count").textContent =
      data.votes?.down || 0;
  }

  animateScore(scoreType, value) {
    const fillElement = document.getElementById(`${scoreType}-fill`);
    const valueElement = document.getElementById(`${scoreType}-value`);
    const colorClass = this.getScoreColorClass(value);

    // Remove existing color classes
    fillElement.classList.remove("green", "yellow", "red");
    fillElement.classList.add(colorClass);

    // Animate width
    setTimeout(() => {
      fillElement.style.width = `${value * 100}%`;
      valueElement.textContent = `${Math.round(value * 100)}%`;
    }, 100);
  }

  getScoreColorClass(score) {
    const percentage = score * 100;
    if (percentage >= 70) return "green";
    if (percentage >= 40) return "yellow";
    return "red";
  }

  getStatusIcon(score) {
    const percentage = score * 100;
    if (percentage >= 70) return "🟢";
    if (percentage >= 40) return "🟡";
    return "🔴";
  }

  displayExplanation(details) {
    const container = document.getElementById("explanation-items");
    container.innerHTML = "";

    const text = document.createElement("small");
    text.style.display = "block";
    text.style.textAlign = "justify";
    text.style.lineHeight = "1.4";
    text.style.color = "#666";
    text.textContent = details;
    container.appendChild(text);
  }

  handleVote(voteType) {
    const upBtn = document.getElementById("vote-up");
    const downBtn = document.getElementById("vote-down");

    // Remove previous vote styling
    upBtn.classList.remove("voted");
    downBtn.classList.remove("voted");

    // Handle vote logic
    if (this.userVote === voteType) {
      // User clicked same vote - remove vote
      this.userVote = null;
      this.updateVoteCount(voteType, -1);
    } else {
      // New vote or changing vote
      if (this.userVote) {
        // Remove previous vote count
        this.updateVoteCount(this.userVote, -1);
      }

      this.userVote = voteType;
      this.updateVoteCount(voteType, 1);

      // Add voted styling
      if (voteType === "up") {
        upBtn.classList.add("voted");
      } else {
        downBtn.classList.add("voted");
      }
    }

    // Send vote to backend
    this.sendVoteToBackend(voteType);
  }

  updateVoteCount(voteType, change) {
    const countElement = document.getElementById(`vote-${voteType}-count`);
    const currentCount = parseInt(countElement.textContent);
    countElement.textContent = Math.max(0, currentCount + change);
  }

  async sendVoteToBackend(voteType) {
    try {
      console.log("Sending vote:", voteType);

      // Implement actual API call here when ready
      const response = await fetch("http://127.0.0.1:8050/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: this.getCurrentArticleId(),
          vote: voteType === "up" ? 1 : -1,
          user_id: this.getCurrentUserId(),
        }),
      });

      if (response.ok) {
        console.log("Vote sent successfully");
      }
    } catch (error) {
      console.error("Error sending vote:", error);
    }
  }

  setState(newState) {
    this.currentState = newState;

    // Hide all states
    document.getElementById("analyze-state").classList.add("hidden");
    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("results-state").classList.add("hidden");

    // Show current state
    document.getElementById(`${newState}-state`).classList.remove("hidden");
  }

  resetToAnalyzeState() {
    this.setState("analyze");
    this.updateStatusIndicator("inactive");
    this.analysisData = null;
    this.userVote = null;

    // Reset vote button styling
    document.getElementById("vote-up").classList.remove("voted");
    document.getElementById("vote-down").classList.remove("voted");
  }

  updateStatusIndicator(status) {
    const indicator = document.getElementById("status-indicator");
    indicator.classList.remove("active", "analyzing", "error");

    if (status !== "inactive") {
      indicator.classList.add(status);
    }
  }

  handleAnalysisError(error) {
    console.error("Analysis error:", error);
    this.setState("analyze");

    // Show error message
    const btn = document.getElementById("analysis-btn");
    const originalText = btn.querySelector(".btn-text").textContent;

    let errorMessage = "Analysis failed - Try again";

    // Customize error message based on error type
    if (error.message.includes("Cannot access")) {
      errorMessage = "Cannot access this page";
    } else if (error.message.includes("too short")) {
      errorMessage = "Page content too short";
    } else if (error.message.includes("API Error")) {
      errorMessage = "Server error - Try again";
    }

    btn.querySelector(".btn-text").textContent = errorMessage;
    btn.style.backgroundColor = "#f44336";

    setTimeout(() => {
      btn.querySelector(".btn-text").textContent = originalText;
      btn.style.backgroundColor = "";
    }, 4000);
  }

  // Modal functionality
  openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
    document.body.style.overflow = "";
  }

  closeAllModals() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.classList.add("hidden");
    });
    document.body.style.overflow = "";
  }

  // Settings functionality
  loadSettings() {
    // Load from chrome.storage in a real extension
    // For now, use defaults
    this.applySettings();
  }

  applySettings() {
    document.getElementById("auto-analyze").checked = this.settings.autoAnalyze;
    document.getElementById("show-notifications").checked =
      this.settings.showNotifications;
    document.getElementById("threshold-slider").value = this.settings.threshold;
    document.querySelector(".threshold-value").textContent =
      this.settings.threshold + "%";
  }

  saveSettings() {
    this.settings.autoAnalyze = document.getElementById("auto-analyze").checked;
    this.settings.showNotifications =
      document.getElementById("show-notifications").checked;
    this.settings.threshold = parseInt(
      document.getElementById("threshold-slider").value
    );

    // Save to chrome.storage in a real extension
    // chrome.storage.sync.set({ factflowSettings: this.settings });

    console.log("Settings saved:", this.settings);
    this.closeModal("settings-modal");
    this.showSettingsSavedFeedback();
  }

  resetSettings() {
    this.settings = {
      autoAnalyze: true,
      showNotifications: false,
      threshold: 70,
    };

    this.applySettings();
  }

  showSettingsSavedFeedback() {
    const saveBtn = document.getElementById("settings-save");
    const originalText = saveBtn.textContent;

    saveBtn.textContent = "Saved!";
    saveBtn.style.backgroundColor = "#4CAF50";

    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.backgroundColor = "";
    }, 1500);
  }

  loadInitialState() {
    // Check if we should auto-analyze
    if (this.settings.autoAnalyze && this.isValidPage()) {
      // Auto-analyze after a short delay
      setTimeout(() => {
        this.startAnalysis();
      }, 1000);
    }
  }

  isValidPage() {
    // In a real extension, you might check the URL or page type
    return true;
  }

  // Utility functions
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCurrentArticleId() {
    // Generate article identifier based on URL
    try {
      const url = this.analysisData?.url || window.location.href;
      return btoa(url).substring(0, 12);
    } catch {
      return "demo_article";
    }
  }

  getCurrentUserId() {
    // In a real extension, you'd get this from storage or generate/store it
    return "user_" + Math.random().toString(36).substring(2, 8);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if we have the necessary Chrome APIs
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.scripting) {
    window.factFlowApp = new FactFlowApp();
  } else {
    console.error("Chrome extension APIs not available");
    // You might want to show an error message to the user here
  }
});
