"use strict";

/* =====================================================
   WILLUDA INN - ADMIN AUTHENTICATION
===================================================== */

const ADMIN_LOGIN_PAGE = "../login.html";

const ADMIN_TOKEN_KEY = "willudaAdminToken";
const ADMIN_DATA_KEY = "willudaAdmin";

/* =====================================================
   GET SAVED LOGIN DATA
===================================================== */

function getAdminToken() {
    return sessionStorage.getItem(
        ADMIN_TOKEN_KEY
    );
}

function getSavedAdminData() {
    return sessionStorage.getItem(
        ADMIN_DATA_KEY
    );
}

/* =====================================================
   CLEAR LOGIN DATA
===================================================== */

function clearAdminSession() {
    sessionStorage.removeItem(
        ADMIN_TOKEN_KEY
    );

    sessionStorage.removeItem(
        ADMIN_DATA_KEY
    );
}

/* =====================================================
   REDIRECT TO LOGIN PAGE
===================================================== */

function redirectToLogin() {
    window.location.replace(
        ADMIN_LOGIN_PAGE
    );
}

/* =====================================================
   PROTECT ADMIN PAGE
===================================================== */

function protectAdminPage() {
    const token = getAdminToken();
    const savedAdmin = getSavedAdminData();

    if (!token || !savedAdmin) {
        clearAdminSession();
        redirectToLogin();

        return false;
    }

    try {
        JSON.parse(savedAdmin);
        return true;

    } catch (error) {
        console.error(
            "Invalid admin login data:",
            error
        );

        clearAdminSession();
        redirectToLogin();

        return false;
    }
}

/* =====================================================
   GET LOGGED-IN ADMIN
===================================================== */

function getLoggedInAdmin() {
    const savedAdmin =
        getSavedAdminData();

    if (!savedAdmin) {
        return null;
    }

    try {
        return JSON.parse(
            savedAdmin
        );

    } catch (error) {
        console.error(
            "Unable to read admin data:",
            error
        );

        return null;
    }
}

/* =====================================================
   DISPLAY ADMIN DETAILS
===================================================== */

function displayAdminDetails() {
    const admin =
        getLoggedInAdmin();

    if (!admin) {
        clearAdminSession();
        redirectToLogin();

        return;
    }

    const adminNameElements =
        document.querySelectorAll(
            "[data-admin-name]"
        );

    const adminRoleElements =
        document.querySelectorAll(
            "[data-admin-role]"
        );

    const adminEmailElements =
        document.querySelectorAll(
            "[data-admin-email]"
        );

    adminNameElements.forEach(
        function (element) {
            element.textContent =
                admin.fullName ||
                "Administrator";
        }
    );

    adminRoleElements.forEach(
        function (element) {
            element.textContent =
                admin.role ||
                "Administrator";
        }
    );

    adminEmailElements.forEach(
        function (element) {
            element.textContent =
                admin.email || "";
        }
    );
}

/* =====================================================
   LOGOUT
===================================================== */

function logoutAdmin() {
    clearAdminSession();
    redirectToLogin();
}

/* =====================================================
   REGISTER LOGOUT BUTTONS
===================================================== */

function registerLogoutButtons() {
    const logoutButtons =
        document.querySelectorAll(
            "#logoutButton, [data-logout-button]"
        );

    logoutButtons.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    const confirmed =
                        window.confirm(
                            "Are you sure you want to log out?"
                        );

                    if (confirmed) {
                        logoutAdmin();
                    }
                }
            );
        }
    );
}

/* =====================================================
   PREVENT BACK BUTTON ACCESS
===================================================== */

window.addEventListener(
    "pageshow",
    function () {
        const token =
            getAdminToken();

        const savedAdmin =
            getSavedAdminData();

        if (!token || !savedAdmin) {
            redirectToLogin();
        }
    }
);

/* =====================================================
   INITIALIZE ADMIN AUTHENTICATION
===================================================== */

function initializeAdminAuthentication() {
    const authenticated =
        protectAdminPage();

    if (!authenticated) {
        return;
    }

    displayAdminDetails();
    registerLogoutButtons();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminAuthentication
);