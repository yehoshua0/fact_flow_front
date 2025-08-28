// FactFlow Extension Popup JavaScript - Interactive Version

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

      // Make API call
      const analysisResult = await this.performAnalysis();

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

  async performAnalysis() {
    try {
      const response = await fetch("http://127.0.0.1:8050/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: window.location?.href || "https://example.com/article",
          text:
            document.body?.innerText?.substring(0, 1000) ||
            "Sample article text",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Analysis results:", data);
      return data;
    } catch (error) {
      console.error("Error during analysis:", error);
      // Return mock data if API fails
      return this.getMockAnalysisData();
    }
  }

  getMockAnalysisData() {
    return {
      ai_score: 85,
      community_score: 78,
      final_score: 82,
      status: "reliable",
      title: "Article analyzed",
      subtitle: "Reliable source detected",
      details: [
        { type: "positive", text: "Recognized source" },
        { type: "positive", text: "Verifiable information" },
        { type: "warning", text: "Catchy headline" },
      ],
      votes: {
        up: 12,
        down: 3,
      },
    };
  }

  displayResults(data) {
    // Update status
    document.getElementById("result-status-icon").textContent =
      this.getStatusIcon(data.final_score);
    document.getElementById("result-status-title").textContent =
      data.title || "Article analyzed";
    document.getElementById("result-status-subtitle").textContent =
      data.subtitle || "Analysis complete";

    // Update scores with animation
    this.animateScore("ai-score", data.ai_score);
    this.animateScore("community-score", data.community_score);
    this.animateScore("final-score", data.final_score);

    // Update explanation
    this.displayExplanation(data.details || []);

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
      fillElement.style.width = `${value}%`;
      valueElement.textContent = `${value}%`;
    }, 100);
  }

  getScoreColorClass(score) {
    if (score >= 70) return "green";
    if (score >= 40) return "yellow";
    return "red";
  }

  getStatusIcon(score) {
    if (score >= 70) return "🟢";
    if (score >= 40) return "🟡";
    return "🔴";
  }

  displayExplanation(details) {
    const container = document.getElementById("explanation-items");
    container.innerHTML = "";

    details.forEach((detail) => {
      const item = document.createElement("div");
      item.className = `explanation-item ${detail.type}`;

      const icon = document.createElement("span");
      icon.className = "explanation-icon";
      icon.textContent = this.getExplanationIcon(detail.type);

      const text = document.createElement("span");
      text.textContent = detail.text;

      item.appendChild(icon);
      item.appendChild(text);
      container.appendChild(item);
    });
  }

  getExplanationIcon(type) {
    switch (type) {
      case "positive":
        return "✓";
      case "warning":
        return "⚠";
      case "negative":
        return "✗";
      default:
        return "•";
    }
  }

  handleVote(voteType) {
    const upBtn = document.getElementById("vote-up");
    const downBtn = document.getElementById("vote-down");
    const upCount = document.getElementById("vote-up-count");
    const downCount = document.getElementById("vote-down-count");

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

    // Send vote to backend (implement as needed)
    this.sendVoteToBackend(voteType);
  }

  updateVoteCount(voteType, change) {
    const countElement = document.getElementById(`vote-${voteType}-count`);
    const currentCount = parseInt(countElement.textContent);
    countElement.textContent = Math.max(0, currentCount + change);
  }

  async sendVoteToBackend(voteType) {
    try {
      // Implement actual API call here
      console.log("Sending vote:", voteType);

      // Example API call structure:
      /*
      const response = await fetch('http://127.0.0.1:8050/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: this.getCurrentArticleId(),
          vote: voteType === 'up' ? 1 : -1,
          user_id: this.getCurrentUserId()
        })
      });
      */
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
    console.log(error);
    this.setState("analyze");

    // Show error message (you could implement a toast notification here)
    const btn = document.getElementById("analysis-btn");
    const originalText = btn.querySelector(".btn-text").textContent;

    btn.querySelector(".btn-text").textContent = "Analysis failed - Try again";
    btn.style.backgroundColor = "#f44336";

    setTimeout(() => {
      btn.querySelector(".btn-text").textContent = originalText;
      btn.style.backgroundColor = "";
    }, 3000);
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
    // Load from chrome.storage or localStorage
    // For demo, we'll use default values
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

    // Save to chrome.storage or localStorage
    // chrome.storage.sync.set({ factflowSettings: this.settings });

    console.log("Settings saved:", this.settings);
    this.closeModal("settings-modal");

    // Show confirmation (implement toast notification if needed)
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
    // Check if current page is suitable for analysis
    // For demo, we'll return true
    return true;
  }

  // Utility functions
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCurrentArticleId() {
    // Generate or get article identifier
    return window.location?.href
      ? btoa(window.location.href).substring(0, 10)
      : "demo_article";
  }

  getCurrentUserId() {
    // Get user identifier from storage or generate one
    return "user_" + Math.random().toString(36).substring(2, 8);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.factFlowApp = new FactFlowApp();
});
