"use strict";

/* =========================
   ELEMENT REFERENCES
========================= */

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const menuButton = document.getElementById("menu-button");
const sidebarClose = document.getElementById("sidebar-close");

const profileButton = document.getElementById("profile-button");
const profileDropdown = document.getElementById("profile-dropdown");

const logoutButton = document.getElementById("logout-button");
const dropdownLogout = document.getElementById("dropdown-logout");

const cancelBookingButton = document.getElementById(
    "cancel-booking-button"
);

const confirmationModal = document.getElementById(
    "confirmation-modal"
);

const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

const dashboardToast = document.getElementById("dashboard-toast");
const currentDateElement = document.getElementById("current-date");
const dashboardYear = document.getElementById("dashboard-year");

/*
    This variable stores the action that must run
    after the user clicks "Yes, Continue".
*/
let confirmationAction = null;

/* =========================
   CURRENT DATE AND YEAR
========================= */

function displayCurrentDate() {
    const currentDate = new Date();

    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    if (currentDateElement) {
        currentDateElement.textContent =
            currentDate.toLocaleDateString(
                "en-US",
                dateOptions
            );
    }

    if (dashboardYear) {
        dashboardYear.textContent =
            currentDate.getFullYear();
    }
}

displayCurrentDate();

/* =========================
   MOBILE SIDEBAR
========================= */

function openSidebar() {
    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");

    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");

    document.body.style.overflow = "";
}

if (menuButton) {
    menuButton.addEventListener("click", openSidebar);
}

if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}

/*
    Close sidebar when a sidebar link is selected
    on a small screen.
*/
document
    .querySelectorAll(".sidebar-link")
    .forEach(function (sidebarLink) {
        sidebarLink.addEventListener("click", function () {
            if (window.innerWidth <= 1000) {
                closeSidebar();
            }
        });
    });

/* =========================
   PROFILE DROPDOWN
========================= */

function closeProfileDropdown() {
    if (profileDropdown) {
        profileDropdown.classList.remove("show");
    }
}

if (profileButton && profileDropdown) {
    profileButton.addEventListener("click", function (event) {
        event.stopPropagation();

        profileDropdown.classList.toggle("show");
    });
}

document.addEventListener("click", function (event) {
    if (
        profileDropdown &&
        profileButton &&
        !profileDropdown.contains(event.target) &&
        !profileButton.contains(event.target)
    ) {
        closeProfileDropdown();
    }
});

/* =========================
   TOAST MESSAGE
========================= */

function showToast(message) {
    if (!dashboardToast) {
        return;
    }

    dashboardToast.textContent = message;
    dashboardToast.classList.add("show");

    window.setTimeout(function () {
        dashboardToast.classList.remove("show");
    }, 3000);
}

/* =========================
   CONFIRMATION MODAL
========================= */

function openConfirmationModal(
    title,
    message,
    confirmButtonText,
    action
) {
    if (!confirmationModal) {
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirm.textContent = confirmButtonText;

    confirmationAction = action;

    confirmationModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeConfirmationModal() {
    if (!confirmationModal) {
        return;
    }

    confirmationModal.classList.remove("show");
    document.body.style.overflow = "";

    confirmationAction = null;
}

if (modalCancel) {
    modalCancel.addEventListener(
        "click",
        closeConfirmationModal
    );
}

if (confirmationModal) {
    confirmationModal.addEventListener(
        "click",
        function (event) {
            if (event.target === confirmationModal) {
                closeConfirmationModal();
            }
        }
    );
}

if (modalConfirm) {
    modalConfirm.addEventListener("click", function () {
        if (typeof confirmationAction === "function") {
            confirmationAction();
        }

        closeConfirmationModal();
    });
}

/* =========================
   CANCEL BOOKING
========================= */

if (cancelBookingButton) {
    cancelBookingButton.addEventListener(
        "click",
        function () {
            openConfirmationModal(
                "Cancel Booking?",
                "Are you sure you want to cancel booking #WLI-2026-00128? This action cannot be reversed during the frontend demonstration.",
                "Yes, Cancel Booking",
                function () {
                    showToast(
                        "Booking cancellation request recorded. The database connection will be added in Phase 2."
                    );
                }
            );
        }
    );
}

/* =========================
   LOGOUT
========================= */

function requestLogout() {
    closeProfileDropdown();

    openConfirmationModal(
        "Logout from Account?",
        "Are you sure you want to logout from your Willuda Inn customer account?",
        "Yes, Logout",
        function () {
            /*
                In Phase 1, we redirect directly.
                In Phase 2, PHP will destroy the login session.
            */
            window.location.href = "login.html";
        }
    );
}

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        requestLogout
    );
}

if (dropdownLogout) {
    dropdownLogout.addEventListener(
        "click",
        requestLogout
    );
}

/* =========================
   KEYBOARD SUPPORT
========================= */

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeProfileDropdown();

        if (
            confirmationModal &&
            confirmationModal.classList.contains("show")
        ) {
            closeConfirmationModal();
        }

        if (
            sidebar &&
            sidebar.classList.contains("open")
        ) {
            closeSidebar();
        }
    }
});

/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener("resize", function () {
    if (window.innerWidth > 1000) {
        closeSidebar();
    }
});

console.log("Willuda Inn customer dashboard loaded.");