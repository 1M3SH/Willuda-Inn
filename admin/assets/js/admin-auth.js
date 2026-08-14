"use strict";

/* =====================================================
   WILLUDA INN - ADMIN PAGE AUTHENTICATION
===================================================== */

const ADMIN_LOGIN_PAGE = "../login.html";
const ADMIN_TOKEN_KEY = "willudaAdminToken";
const ADMIN_DATA_KEY = "willudaAdmin";

/* =====================================================
   SESSION HELPERS
===================================================== */

function getAdminToken() {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function getSavedAdminData() {
    return sessionStorage.getItem(ADMIN_DATA_KEY);
}

function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_DATA_KEY);
}

function redirectToLogin() {
    window.location.replace(ADMIN_LOGIN_PAGE);
}

/* =====================================================
   JWT EXPIRY CHECK
===================================================== */

function decodeJwtPayload(token) {
    try {
        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {
            return null;
        }

        const base64Url = tokenParts[1];
        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decodedText = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map(function (character) {
                    return (
                        "%" +
                        ("00" + character.charCodeAt(0).toString(16)).slice(-2)
                    );
                })
                .join("")
        );

        return JSON.parse(decodedText);
    } catch (error) {
        console.error("Unable to read the admin token:", error);
        return null;
    }
}

function tokenIsExpired(token) {
    const payload = decodeJwtPayload(token);

    if (!payload || !payload.exp) {
        return true;
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    return payload.exp <= currentTimeInSeconds;
}

/* =====================================================
   READ ADMIN DETAILS
===================================================== */

function getLoggedInAdmin() {
    const savedAdminData = getSavedAdminData();

    if (!savedAdminData) {
        return null;
    }

    try {
        return JSON.parse(savedAdminData);
    } catch (error) {
        console.error("Unable to read saved administrator details:", error);
        return null;
    }
}

function getInitials(name) {
    const words = String(name || "Administrator")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "AU";
    }

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}

/* =====================================================
   PROTECT ADMIN PAGE
===================================================== */

function protectAdminPage() {
    const token = getAdminToken();
    const admin = getLoggedInAdmin();

    if (!token || !admin || tokenIsExpired(token)) {
        clearAdminSession();
        redirectToLogin();
        return false;
    }

    return true;
}

/* =====================================================
   DISPLAY LOGGED-IN ADMIN
===================================================== */

function displayAdminDetails() {
    const admin = getLoggedInAdmin();

    if (!admin) {
        clearAdminSession();
        redirectToLogin();
        return;
    }

    document
        .querySelectorAll("[data-admin-name]")
        .forEach(function (element) {
            element.textContent =
                admin.fullName ||
                admin.full_name ||
                "Administrator";
        });

    document
        .querySelectorAll("[data-admin-role]")
        .forEach(function (element) {
            element.textContent = admin.role || "Administrator";
        });

    document
        .querySelectorAll("[data-admin-email]")
        .forEach(function (element) {
            element.textContent = admin.email || "";
        });

    document
        .querySelectorAll("[data-admin-initials]")
        .forEach(function (element) {
            element.textContent = getInitials(
                admin.fullName ||
                admin.full_name ||
                "Administrator"
            );
        });
}

/* =====================================================
   LOGOUT
===================================================== */

function logoutAdmin() {
    clearAdminSession();
    redirectToLogin();
}

function registerLogoutButtons() {
    const logoutButtons = document.querySelectorAll(
        "#logoutButton, [data-logout-button]"
    );

    logoutButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const confirmed = window.confirm(
                "Are you sure you want to log out?"
            );

            if (confirmed) {
                logoutAdmin();
            }
        });
    });
}

/* =====================================================
   BACK/FORWARD CACHE PROTECTION
===================================================== */

window.addEventListener("pageshow", function () {
    const token = getAdminToken();
    const admin = getLoggedInAdmin();

    if (!token || !admin || tokenIsExpired(token)) {
        clearAdminSession();
        redirectToLogin();
    }
});

/* =====================================================
   INITIALIZE
===================================================== */

function initializeAdminAuthentication() {
    if (!protectAdminPage()) {
        return;
    }

    displayAdminDetails();
    registerLogoutButtons();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminAuthentication
);
