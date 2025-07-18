// main.js

// Function to display welcome message
function showWelcome() {
  const username = sessionStorage.getItem("username") || "User";
  const welcomeEl = document.getElementById("welcome-message");
  if (welcomeEl) {
    welcomeEl.textContent = "Welcome, " + username;
  }
}

// Universal logout handler
function logout() {
  sessionStorage.removeItem("username");
  window.location.href = "/index.html";
}

//retrieves header
window.addEventListener("DOMContentLoaded", () => {
  fetch("/header.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);
      showWelcome();
    });
});