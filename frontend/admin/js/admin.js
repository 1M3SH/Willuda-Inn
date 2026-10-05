/**
 * Willuda Inn - Admin Portal Core Script
 * Manages admin authentication checks, dynamic sidebar toggling, and dashboard helpers.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Verify admin session if applicable
  const adminToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");

  // Highlight current active navigation link
  const currentPath = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".admin-sidebar a, .nav-item a");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && (href === currentPath || (currentPath === "" && href === "dashboard.html"))) {
      link.classList.add("active");
    }
  });

  console.log("Willuda Inn Admin Portal initialized.");
});
