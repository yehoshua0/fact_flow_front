// Highlight article titles

document.querySelectorAll("h1").forEach((el) => {
  score = 0.1; //TODO: Use the real score from API

  // Customize flag style
  el.style.color = "white";
  if (score < 0.5) {
    el.style.background = "red";
  } else {
    el.style.background = "green";
  }
});
