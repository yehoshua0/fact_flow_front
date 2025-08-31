// Green social media style verification badge with effects
const el = document.querySelector("h1");
if (el) {
  const score = 0.7; // TODO: Use the real score from API

  // Create badge container
  const badgeContainer = document.createElement("div");
  badgeContainer.style.cssText = `
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
    animation: fadeInUp 0.8s ease-out;
  `;

  // Create the main badge (circular like social media)
  const badge = document.createElement("div");
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 900;
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(255,255,255,0.3);
    user-select: none;
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 6px 20px rgba(0,0,0,0.25),
      0 2px 8px rgba(0,0,0,0.15),
      inset 0 1px 2px rgba(255,255,255,0.4);
  `;

  // Create checkmark icon
  const checkmark = document.createElement("span");
  checkmark.style.cssText = `
    font-size: 15px;
    line-height: 1;
    z-index: 2;
    position: relative;
    animation: float 2s ease-in-out infinite;
    display: inline-block;
  `;

  // Create reflection effect (enhanced)
  const reflection = document.createElement("div");
  reflection.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.8) 0%, 
      rgba(255,255,255,0.5) 25%, 
      rgba(255,255,255,0.2) 50%,
      transparent 70%
    );
    pointer-events: none;
  `;

  // Create animated glow effect
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: absolute;
    top: -4px;
    left: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    animation: pulse 2s ease-in-out infinite;
  `;

  // Set badge style based on score with attractive gradients
  if (score < 0.3) {
    // Red gradient for unverified/problematic
    badge.style.background =
      "linear-gradient(135deg, #EF4444, #DC2626, #B91C1C)";
    glow.style.background =
      "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)";
    checkmark.innerHTML = "✕";
    badge.title = "Unverified - This information has not been fact-checked";
  } else if (score < 0.7) {
    // Orange gradient for under review
    badge.style.background =
      "linear-gradient(135deg, #F59E0B, #EA580C, #D97706)";
    glow.style.background =
      "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)";
    checkmark.innerHTML = "?";
    badge.title = "Under Review - This information is being verified";
  } else {
    // Enhanced green gradient for verified
    badge.style.background =
      "linear-gradient(135deg, #22C55E, #16A34A, #15803D)";
    glow.style.background =
      "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)";
    checkmark.innerHTML = "✓";
    badge.title = "Verified - Fact-checked and verified by FactFlow";
  }

  badge.appendChild(glow);
  badge.appendChild(checkmark);
  badge.appendChild(reflection);

  // Enhanced hover effects with glow
  badge.addEventListener("mouseenter", () => {
    badge.style.transform = "translateY(-3px) scale(1.15)";
    badge.style.boxShadow = `
      0 12px 30px rgba(0,0,0,0.4),
      0 4px 15px rgba(0,0,0,0.2),
      inset 0 1px 2px rgba(255,255,255,0.5)
    `;
    glow.style.opacity = "1";
  });

  badge.addEventListener("mouseleave", () => {
    badge.style.transform = "translateY(0) scale(1)";
    badge.style.boxShadow = `
      0 6px 20px rgba(0,0,0,0.25),
      0 2px 8px rgba(0,0,0,0.15),
      inset 0 1px 2px rgba(255,255,255,0.4)
    `;
    glow.style.opacity = "0";
  });

  // Click handler with ripple effect
  badge.addEventListener("click", (e) => {
    // Create ripple effect
    const ripple = document.createElement("div");
    const rect = badge.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255,255,255,0.5);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    badge.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    const statusIcon = score < 0.3 ? "✕" : score < 0.7 ? "?" : "✓";
    const statusText =
      score < 0.3 ? "Unverified" : score < 0.7 ? "Under Review" : "Verified";
    const reliabilityScore = (score * 100).toFixed(0);

    alert(`FactFlow Verification ${statusIcon}

Status: ${statusText}
Reliability: ${reliabilityScore}%
Powered by FactFlow 2.0

${
  score >= 0.7
    ? "This information has been fact-checked and verified."
    : score >= 0.3
    ? "This information is currently under review."
    : "This information has not been verified. Use caution."
}`);
  });

  // Add badge to container
  badgeContainer.appendChild(badge);

  // Make the h1 a flex container for proper alignment
  el.style.display = "flex";
  el.style.alignItems = "center";

  // Insert badge at the beginning of the h1 element
  el.insertBefore(badgeContainer, el.firstChild);

  // Enhanced CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-4px) rotate(2deg); }
    }
    
    @keyframes ripple {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes fadeInUp {
      0% { 
        opacity: 0; 
        transform: translateY(20px) scale(0.8); 
      }
      60% { 
        opacity: 1; 
        transform: translateY(-5px) scale(1.1); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    @keyframes pulse {
      0%, 100% { 
        transform: scale(1); 
        opacity: 0; 
      }
      50% { 
        transform: scale(1.1); 
        opacity: 0.3; 
      }
    }
  `;
  document.head.appendChild(style);
}
