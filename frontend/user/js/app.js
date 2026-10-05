/**
 * Willuda Inn - Main Frontend Application Script
 * Bootstraps user session, header states, navigation toggles, and global toast notifications.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Check auth state from localStorage
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loginLinks = document.querySelectorAll("a[href='login.html']");
  if (token && user) {
    loginLinks.forEach(link => {
      link.textContent = user.name || "My Account";
      link.href = "dashboard.html";
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  console.log("Willuda Inn Frontend Client initialized.");
});
