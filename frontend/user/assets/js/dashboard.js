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

window.cancelUpcomingBooking = function (bookingIdStr) {
    const rawId = decodeURIComponent(bookingIdStr);
    openConfirmationModal(
        "Cancel Reservation?",
        `Are you sure you want to cancel booking ${rawId}?`,
        "Yes, Cancel Reservation",
        async function () {
            try {
                let storedBookings = JSON.parse(
                    localStorage.getItem("willudaBookings") || "[]"
                );
                let targetBooking = null;
                storedBookings = storedBookings.map((b) => {
                    if (String(b.id) === String(rawId) || b.bookingId === rawId) {
                        b.bookingStatus = "Cancelled";
                        b.status = "Cancelled";
                        targetBooking = b;
                    }
                    return b;
                });
                localStorage.setItem(
                    "willudaBookings",
                    JSON.stringify(storedBookings)
                );

                const latestRaw = localStorage.getItem("willudaLatestBooking");
                if (latestRaw) {
                    try {
                        const latest = JSON.parse(latestRaw);
                        if (String(latest.id) === String(rawId) || latest.bookingId === rawId) {
                            latest.bookingStatus = "Cancelled";
                            latest.status = "Cancelled";
                            localStorage.setItem(
                                "willudaLatestBooking",
                                JSON.stringify(latest)
                            );
                        }
                    } catch (e) {}
                }

                try {
                    let notifs = JSON.parse(
                        localStorage.getItem("willudaNotifications") || "[]"
                    );
                    notifs.unshift({
                        id: "notif-" + Date.now(),
                        title: "Booking Cancelled",
                        message: `Your reservation ${rawId} was cancelled successfully.`,
                        type: "booking",
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem(
                        "willudaNotifications",
                        JSON.stringify(notifs)
                    );
                } catch (e) {}

                const numericId =
                    targetBooking?.id ||
                    (String(rawId).match(/\d+$/)
                        ? String(rawId).match(/\d+$/)[0]
                        : null);

                if (numericId) {
                    const apiUrl =
                        (window.WILLUDA_CONFIG &&
                            window.WILLUDA_CONFIG.bookings) ||
                        (window.location.hostname === "localhost" ||
                        window.location.hostname === "127.0.0.1"
                            ? "http://localhost:5000/api/bookings"
                            : `${(
                                  window.WILLUDA_API_URL ||
                                  localStorage.getItem("willudaApiUrl") ||
                                  "https://willuda-inn-backend.up.railway.app"
                              ).replace(/\/+$/, "")}/api/bookings`);

                    fetch(`${apiUrl}/${numericId}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "Cancelled" })
                    }).catch((err) =>
                        console.warn("Background API cancel sync:", err)
                    );
                }

                showToast("Booking cancelled successfully.");
                loadUserBookingsAndStatistics();
                loadUserNotificationsAndBadges();
            } catch (err) {
                console.error("Cancellation error:", err);
                showToast("Failed to cancel booking.");
            }
        }
    );
};

if (cancelBookingButton) {
    cancelBookingButton.addEventListener("click", function () {
        const latest = localStorage.getItem("willudaLatestBooking");
        let bid = "#WLI-ONLINE";
        if (latest) {
            try {
                const parsed = JSON.parse(latest);
                bid = parsed.bookingId || parsed.id || bid;
            } catch (e) {}
        }
        window.cancelUpcomingBooking(bid);
    });
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
            sessionStorage.removeItem("willudaAdminToken");
            sessionStorage.removeItem("willudaAdmin");
            sessionStorage.removeItem("currentUser");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
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

/* =========================
   DYNAMIC USER PROFILE SYNC
========================= */

function loadLoggedInUserProfile() {
    let user = null;
    const userJson =
        sessionStorage.getItem("currentUser") ||
        sessionStorage.getItem("willudaAdmin") ||
        localStorage.getItem("user");

    if (userJson) {
        try {
            user = JSON.parse(userJson);
        } catch (e) {
            user = null;
        }
    }

    if (user && (user.full_name || user.fullName)) {
        const fullName = (user.full_name || user.fullName).trim();
        const firstName = fullName.split(" ")[0] || fullName;
        const initials = fullName
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "WI";

        const roleText = user.role || "Customer Account";

        // Sidebar user info
        const sidebarName = document.querySelector(".sidebar-user-info h3");
        const sidebarRole = document.querySelector(".sidebar-user-info p");
        const sidebarAvatar = document.querySelector(".sidebar-avatar");

        if (sidebarName) sidebarName.textContent = fullName;
        if (sidebarRole) sidebarRole.textContent = roleText;
        if (sidebarAvatar) sidebarAvatar.textContent = initials;

        // Header user info
        const headerName = document.querySelector("#profile-button strong");
        const headerRole = document.querySelector("#profile-button small");
        const headerAvatar = document.querySelector(".header-avatar");

        if (headerName) headerName.textContent = firstName;
        if (headerRole) headerRole.textContent = roleText.includes("Admin") ? "Admin" : "Customer";
        if (headerAvatar) headerAvatar.textContent = initials;

        // Welcome banner greeting
        const welcomeHeading = document.querySelector(".welcome-content h2");
        if (welcomeHeading) welcomeHeading.textContent = `Hello, ${firstName}!`;
    }
}

/* =========================
   DYNAMIC USER NOTIFICATIONS SYNC
========================= */

function loadUserNotificationsAndBadges() {
    let notifications = [];
    const stored = localStorage.getItem("willudaNotifications");
    if (stored) {
        try {
            notifications = JSON.parse(stored);
            if (!Array.isArray(notifications)) notifications = [];
        } catch (e) {
            notifications = [];
        }
    }

    // Check user bookings
    let bookings = [];
    const storedBookings = localStorage.getItem("willudaBookings");
    if (storedBookings) {
        try {
            bookings = JSON.parse(storedBookings);
            if (!Array.isArray(bookings)) bookings = [];
        } catch (e) {
            bookings = [];
        }
    }

    // If user has no bookings, purge any fake booking/payment notifications
    if (bookings.length === 0 && notifications.length > 0) {
        notifications = notifications.filter(
            (n) => n.type !== "Booking" && n.type !== "Payment"
        );
        localStorage.setItem("willudaNotifications", JSON.stringify(notifications));
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Sidebar badge & header notification dot
    const sidebarNotifCount = document.getElementById("sidebar-notifications-count");
    const headerDot = document.getElementById("header-notification-dot");

    if (sidebarNotifCount) {
        if (unreadCount > 0) {
            sidebarNotifCount.style.display = "inline-flex";
            sidebarNotifCount.textContent = unreadCount;
        } else {
            sidebarNotifCount.style.display = "none";
            sidebarNotifCount.textContent = "0";
        }
    }

    if (headerDot) {
        headerDot.style.display = unreadCount > 0 ? "inline-block" : "none";
    }

    // Dashboard notifications container
    const notifContainer = document.getElementById("dashboard-notifications-wrapper");
    if (notifContainer) {
        if (notifications.length === 0) {
            notifContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 14px; border: 1px dashed #cbd5e1; width: 100%;">
                    <i class="fa-regular fa-bell-slash" style="font-size: 2.2rem; color: #94a3b8; margin-bottom: 12px; display: inline-block;"></i>
                    <h4 style="font-size: 1.05rem; font-weight: 600; color: #1e293b; margin-bottom: 4px;">No Notifications Yet</h4>
                    <p style="font-size: 0.85rem; color: #64748b; margin: 0;">You're all caught up! When you create reservations or orders, your updates will appear here.</p>
                </div>
            `;
        }
    }
}

/* =========================
   DYNAMIC USER BOOKINGS & STATISTICS SYNC
========================= */

function loadUserBookingsAndStatistics() {
    let bookings = [];
    const stored = localStorage.getItem("willudaBookings");
    if (stored) {
        try {
            bookings = JSON.parse(stored);
            if (!Array.isArray(bookings)) bookings = [];
        } catch (e) {
            bookings = [];
        }
    }

    const total = bookings.length;
    const upcoming = bookings.filter((b) => {
        const s = String(b.bookingStatus || b.status || "").toLowerCase();
        return s === "confirmed" || s === "pending";
    }).length;
    const completed = bookings.filter((b) => {
        const s = String(b.bookingStatus || b.status || "").toLowerCase();
        return s === "completed";
    }).length;
    const cancelled = bookings.filter((b) => {
        const s = String(b.bookingStatus || b.status || "").toLowerCase();
        return s === "cancelled";
    }).length;

    // Update stat cards
    const statTotal = document.getElementById("stat-total-bookings");
    const statTotalSub = document.getElementById("stat-total-bookings-sub");
    const statUpcoming = document.getElementById("stat-upcoming-bookings");
    const statUpcomingSub = document.getElementById("stat-upcoming-bookings-sub");
    const statCompleted = document.getElementById("stat-completed-bookings");
    const statCompletedSub = document.getElementById("stat-completed-bookings-sub");
    const statCancelled = document.getElementById("stat-cancelled-bookings");
    const statCancelledSub = document.getElementById("stat-cancelled-bookings-sub");

    if (statTotal) statTotal.textContent = total < 10 && total > 0 ? `0${total}` : total;
    if (statTotalSub) statTotalSub.innerHTML = total > 0 ? `<i class="fa-solid fa-arrow-trend-up"></i> ${total} total` : `0 this month`;

    if (statUpcoming) statUpcoming.textContent = upcoming < 10 && upcoming > 0 ? `0${upcoming}` : upcoming;
    if (statUpcomingSub) statUpcomingSub.textContent = upcoming > 0 ? `${upcoming} upcoming stays` : `No upcoming`;

    if (statCompleted) statCompleted.textContent = completed < 10 && completed > 0 ? `0${completed}` : completed;
    if (statCompletedSub) statCompletedSub.textContent = completed > 0 ? `${completed} completed stays` : `Successful stays`;

    if (statCancelled) statCancelled.textContent = cancelled < 10 && cancelled > 0 ? `0${cancelled}` : cancelled;
    if (statCancelledSub) statCancelledSub.textContent = cancelled > 0 ? `${cancelled} cancelled stays` : `Previous bookings`;

    // Sidebar bookings badge
    const sidebarBookingsCount = document.getElementById("sidebar-bookings-count");
    if (sidebarBookingsCount) {
        if (total > 0) {
            sidebarBookingsCount.style.display = "inline-flex";
            sidebarBookingsCount.textContent = total;
        } else {
            sidebarBookingsCount.style.display = "none";
            sidebarBookingsCount.textContent = "0";
        }
    }

    // Upcoming booking card wrapper
    const upcomingWrapper = document.getElementById("upcoming-booking-wrapper");
    if (upcomingWrapper) {
        if (total === 0) {
            upcomingWrapper.innerHTML = `
                <div style="background: #fff; border-radius: 16px; padding: 40px 24px; text-align: center; border: 1px dashed #cbd5e1; width: 100%;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 2.2rem; color: #94a3b8; margin-bottom: 12px; display: inline-block;"></i>
                    <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 6px;">No Upcoming Bookings</h3>
                    <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 18px;">You haven't placed any room or event reservations yet.</p>
                    <a href="booking.html" class="welcome-button" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        <i class="fa-regular fa-calendar-plus"></i> Make a Reservation
                    </a>
                </div>
            `;
        } else {
            const nextBooking =
                bookings.find((b) => {
                    const s = String(
                        b.bookingStatus || b.status || ""
                    ).toLowerCase();
                    return s === "confirmed" || s === "pending";
                }) || bookings[0];

            if (nextBooking) {
                const status =
                    nextBooking.bookingStatus ||
                    nextBooking.status ||
                    "Confirmed";
                const sLower = status.toLowerCase();
                const statusClass =
                    sLower === "confirmed"
                        ? "confirmed"
                        : sLower === "cancelled"
                        ? "cancelled"
                        : "pending";
                const bId =
                    nextBooking.bookingId ||
                    (nextBooking.id
                        ? `#WIL-${String(nextBooking.id).padStart(5, "0")}`
                        : "#WLI-ONLINE");
                const facilityName =
                    nextBooking.facility ||
                    nextBooking.room_type ||
                    "Luxury Suite";
                const checkinDate =
                    nextBooking.checkin || nextBooking.check_in || "-";
                const checkoutDate =
                    nextBooking.checkout || nextBooking.check_out || "-";
                const guests = `${
                    nextBooking.adults || nextBooking.guests || 1
                } Guests`;
                const totalPrice = Number(
                    nextBooking.total || nextBooking.total_price || 0
                ).toFixed(2);
                const detailsId = nextBooking.id || nextBooking.bookingId || "";

                upcomingWrapper.innerHTML = `
                    <article class="upcoming-booking-card">
                        <div class="booking-image">
                            <img src="assets/images/facility-room.png" alt="${facilityName}">
                            <span class="booking-status ${statusClass}">${status}</span>
                        </div>
                        <div class="upcoming-booking-content">
                            <div class="booking-title-row">
                                <div>
                                    <span class="booking-reference">BOOKING ${bId}</span>
                                    <h3>${facilityName}</h3>
                                </div>
                            </div>
                            <div class="booking-details-grid">
                                <div class="booking-detail-item">
                                    <i class="fa-regular fa-calendar"></i>
                                    <div>
                                        <span>Check In</span>
                                        <strong>${checkinDate}</strong>
                                    </div>
                                </div>
                                <div class="booking-detail-item">
                                    <i class="fa-regular fa-calendar-check"></i>
                                    <div>
                                        <span>Check Out</span>
                                        <strong>${checkoutDate}</strong>
                                    </div>
                                </div>
                                <div class="booking-detail-item">
                                    <i class="fa-solid fa-user-group"></i>
                                    <div>
                                        <span>Guests</span>
                                        <strong>${guests}</strong>
                                    </div>
                                </div>
                                <div class="booking-detail-item">
                                    <i class="fa-solid fa-dollar-sign"></i>
                                    <div>
                                        <span>Total Price</span>
                                        <strong>$${totalPrice}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="booking-card-actions">
                                <a href="booking-details.html?id=${encodeURIComponent(
                                    detailsId
                                )}" class="details-button">
                                    View Details
                                </a>
                                ${
                                    sLower !== "cancelled"
                                        ? `<button type="button" class="cancel-button" onclick="cancelUpcomingBooking('${encodeURIComponent(
                                              detailsId
                                          )}')">
                                                Cancel Booking
                                           </button>`
                                        : ""
                                }
                            </div>
                        </div>
                    </article>
                `;
            }
        }
    }

    // Recent bookings table
    const recentBookingsBody = document.getElementById(
        "dashboard-recent-bookings-body"
    );
    if (recentBookingsBody) {
        if (total === 0) {
            recentBookingsBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 45px 20px; color: #64748b;">
                        <i class="fa-solid fa-receipt" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                        <strong style="color: #334155; font-size: 1rem; display: block; margin-bottom: 4px;">No Booking History</strong>
                        <span style="font-size: 0.85rem;">You haven't made any reservations or orders yet.</span>
                    </td>
                </tr>
            `;
        } else {
            recentBookingsBody.innerHTML = bookings
                .slice(0, 5)
                .map((b) => {
                    const status = b.bookingStatus || b.status || "Confirmed";
                    const sLower = status.toLowerCase();
                    const statusClass =
                        sLower === "confirmed"
                            ? "confirmed"
                            : sLower === "cancelled"
                            ? "cancelled"
                            : "pending";
                    const bId =
                        b.bookingId ||
                        (b.id
                            ? `#WIL-${String(b.id).padStart(5, "0")}`
                            : "#WLI-ONLINE");
                    const facility = b.facility || b.room_type || "Deluxe Room";
                    const dates = `${b.checkin || b.check_in || "-"} – ${
                        b.checkout || b.check_out || "-"
                    }`;
                    const totalStr = `$${Number(
                        b.total || b.total_price || 0
                    ).toFixed(2)}`;
                    const detailsId = b.id || b.bookingId || "";
                    return `
                    <tr>
                        <td data-label="Booking ID"><strong>${bId}</strong></td>
                        <td data-label="Facility">${facility}</td>
                        <td data-label="Booking Date">${dates}</td>
                        <td data-label="Total">${totalStr}</td>
                        <td data-label="Status"><span class="table-status ${statusClass}">${status}</span></td>
                        <td data-label="Action"><a href="booking-details.html?id=${encodeURIComponent(
                            detailsId
                        )}">View</a></td>
                    </tr>
                `;
                })
                .join("");
        }
    }
}

// Synchronize profile and dynamic data on page load
loadLoggedInUserProfile();
loadUserNotificationsAndBadges();
loadUserBookingsAndStatistics();

console.log("Willuda Inn customer dashboard loaded.");