"use strict";

const checkInInput = document.getElementById("check-in");
const checkOutInput = document.getElementById("check-out");
const searchButton = document.querySelector(".search-room-btn");

const today = new Date().toISOString().split("T")[0];

if (checkInInput && checkOutInput) {
    checkInInput.min = today;
    checkOutInput.min = today;

    checkInInput.addEventListener("change", function () {
        checkOutInput.min = checkInInput.value;

        if (
            checkOutInput.value &&
            checkOutInput.value < checkInInput.value
        ) {
            checkOutInput.value = "";
        }
    });
}

/* =====================================================
   MOBILE NAVIGATION TOGGLE
===================================================== */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu") || document.querySelector("header nav");

if (navToggle && navMenu) {
    navToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        navMenu.classList.toggle("open");
        const icon = navToggle.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
        }
    });

    document.addEventListener("click", function (e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove("open");
            const icon = navToggle.querySelector("i");
            if (icon) {
                icon.classList.add("fa-bars");
                icon.classList.remove("fa-xmark");
            }
        }
    });
}

/* =====================================================
   DYNAMIC AUTH LINK (LOGIN vs DASHBOARD)
===================================================== */
const navAuthLink = document.getElementById("navAuthLink");
if (navAuthLink) {
    try {
        const user = sessionStorage.getItem("currentUser") || localStorage.getItem("user");
        if (user) {
            navAuthLink.textContent = "Dashboard";
            navAuthLink.href = "dashboard.html";
        }
    } catch (e) {}
}

/* =====================================================
   ROOM AVAILABILITY SEARCH
===================================================== */
if (searchButton) {
    searchButton.addEventListener("click", function () {
        const checkIn = checkInInput ? checkInInput.value : "";
        const checkOut = checkOutInput ? checkOutInput.value : "";
        const guestsEl = document.getElementById("guests");
        const guests = guestsEl ? guestsEl.value : "1";

        if (!checkIn || !checkOut) {
            alert("Please select check-in and check-out dates.");
            return;
        }

        if (checkOut <= checkIn) {
            alert("Check-out date must be after check-in date.");
            return;
        }

        const params = new URLSearchParams({
            checkin: checkIn,
            checkout: checkOut,
            guests: guests
        });

        window.location.href = `booking.html?${params.toString()}`;
    });
}

/* Footer current year */
const currentYearElement = document.getElementById("current-year");

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

console.log("Willuda Inn home page loaded successfully.");

