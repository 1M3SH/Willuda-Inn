"use strict";

/* =========================================
   WILLUDA INN - MY BOOKINGS PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const totalBookingsElement =
    document.getElementById("totalBookings");

const confirmedBookingsElement =
    document.getElementById("confirmedBookings");

const pendingPaymentsElement =
    document.getElementById("pendingPayments");

const cancelledBookingsElement =
    document.getElementById("cancelledBookings");

const bookingSearch =
    document.getElementById("bookingSearch");

const bookingStatusFilter =
    document.getElementById("bookingStatusFilter");

const paymentStatusFilter =
    document.getElementById("paymentStatusFilter");

const clearFiltersButton =
    document.getElementById("clearFiltersButton");

const bookingsTableBody =
    document.getElementById("bookingsTableBody");

const bookingsTableWrapper =
    document.getElementById("bookingsTableWrapper");

const emptyBookings =
    document.getElementById("emptyBookings");

const emptyBookingMessage =
    document.getElementById("emptyBookingMessage");

const cancelModal =
    document.getElementById("cancelModal");

const cancelBookingId =
    document.getElementById("cancelBookingId");

const confirmCancelButton =
    document.getElementById("confirmCancelButton");

const keepBookingButton =
    document.getElementById("keepBookingButton");

const closeCancelModal =
    document.getElementById("closeCancelModal");

const toastMessage =
    document.getElementById("toastMessage");

/* =========================================
   APPLICATION DATA
========================================= */

let bookings = [];

let selectedBookingId = null;

let toastTimer = null;

/* =========================================
   CURRENCY FORMATTER
========================================= */

const currencyFormatter =
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    });

function formatCurrency(value) {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return "$0.00";
    }

    return currencyFormatter.format(amount);
}

/* =========================================
   DATE FORMATTER
========================================= */

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}

/* =========================================
   TEXT HELPERS
========================================= */

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function formatStatusText(value) {
    const status = String(value || "Pending")
        .trim();

    return status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase();
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================
   LOCAL STORAGE
========================================= */

function loadBookings() {
    const savedBookings =
        localStorage.getItem("willudaBookings");

    if (!savedBookings) {
        bookings = [];
        return;
    }

    try {
        const parsedBookings =
            JSON.parse(savedBookings);

        bookings =
            Array.isArray(parsedBookings)
                ? parsedBookings
                : [];

    } catch (error) {
        console.error(
            "Unable to load bookings:",
            error
        );

        bookings = [];
    }
}

function saveBookings() {
    localStorage.setItem(
        "willudaBookings",
        JSON.stringify(bookings)
    );
}

/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {
    const totalBookings =
        bookings.length;

    const confirmedBookings =
        bookings.filter((booking) => {
            const status =
                normalizeText(
                    booking.bookingStatus
                );

            return status === "confirmed";
        }).length;

    const pendingPayments =
        bookings.filter((booking) => {
            const paymentStatus =
                normalizeText(
                    booking.paymentStatus
                );

            return paymentStatus === "pending";
        }).length;

    const cancelledBookings =
        bookings.filter((booking) => {
            const status =
                normalizeText(
                    booking.bookingStatus
                );

            return status === "cancelled";
        }).length;

    totalBookingsElement.textContent =
        totalBookings;

    confirmedBookingsElement.textContent =
        confirmedBookings;

    pendingPaymentsElement.textContent =
        pendingPayments;

    cancelledBookingsElement.textContent =
        cancelledBookings;
}

/* =========================================
   FILTER BOOKINGS
========================================= */

function getFilteredBookings() {
    const searchValue =
        normalizeText(bookingSearch.value);

    const selectedBookingStatus =
        normalizeText(
            bookingStatusFilter.value
        );

    const selectedPaymentStatus =
        normalizeText(
            paymentStatusFilter.value
        );

    return bookings.filter((booking) => {
        const bookingId =
            normalizeText(booking.bookingId);

        const facility =
            normalizeText(booking.facility);

        const bookingStatus =
            normalizeText(
                booking.bookingStatus
            );

        const paymentStatus =
            normalizeText(
                booking.paymentStatus
            );

        const matchesSearch =
            bookingId.includes(searchValue) ||
            facility.includes(searchValue);

        const matchesBookingStatus =
            selectedBookingStatus === "all" ||
            bookingStatus ===
                selectedBookingStatus;

        const matchesPaymentStatus =
            selectedPaymentStatus === "all" ||
            paymentStatus ===
                selectedPaymentStatus;

        return (
            matchesSearch &&
            matchesBookingStatus &&
            matchesPaymentStatus
        );
    });
}

/* =========================================
   STATUS BADGE
========================================= */

function createStatusBadge(
    status,
    type
) {
    const normalizedStatus =
        normalizeText(status) || "pending";

    const formattedStatus =
        formatStatusText(normalizedStatus);

    let statusClass = "status-pending";

    if (
        normalizedStatus === "confirmed" ||
        normalizedStatus === "completed" ||
        normalizedStatus === "paid"
    ) {
        statusClass =
            `status-${normalizedStatus}`;
    }

    if (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "failed"
    ) {
        statusClass =
            `status-${normalizedStatus}`;
    }

    if (
        type === "payment" &&
        normalizedStatus === "paid"
    ) {
        statusClass = "status-paid";
    }

    return `
        <span class="status-badge ${statusClass}">
            ${escapeHTML(formattedStatus)}
        </span>
    `;
}

/* =========================================
   CREATE BOOKING ROW
========================================= */

function createBookingRow(booking) {
    const bookingId =
        escapeHTML(
            booking.bookingId || "-"
        );

    const facility =
        escapeHTML(
            booking.facility || "-"
        );

    const checkin =
        formatDate(booking.checkin);

    const checkout =
        formatDate(booking.checkout);

    const total =
        formatCurrency(booking.total);

    const bookingStatus =
        normalizeText(
            booking.bookingStatus
        ) || "pending";

    const paymentStatus =
        normalizeText(
            booking.paymentStatus
        ) || "pending";

    const cancelDisabled =
        bookingStatus === "cancelled" ||
        bookingStatus === "completed";

    return `
        <tr>
            <td>
                <span class="booking-id">
                    ${bookingId}
                </span>
            </td>

            <td>
                <span class="facility-name">
                    ${facility}
                </span>
            </td>

            <td>
                <span class="booking-date">
                    ${checkin}
                </span>
            </td>

            <td>
                <span class="booking-date">
                    ${checkout}
                </span>
            </td>

            <td>
                <span class="booking-total">
                    ${total}
                </span>
            </td>

            <td>
                ${createStatusBadge(
                    bookingStatus,
                    "booking"
                )}
            </td>

            <td>
                ${createStatusBadge(
                    paymentStatus,
                    "payment"
                )}
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button view-action"
                        data-action="view"
                        data-booking-id="${bookingId}"
                        aria-label="View booking details"
                        title="View booking"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="action-button cancel-action"
                        data-action="cancel"
                        data-booking-id="${bookingId}"
                        aria-label="Cancel booking"
                        title="Cancel booking"
                        ${cancelDisabled ? "disabled" : ""}
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>

                </div>
            </td>
        </tr>
    `;
}

/* =========================================
   DISPLAY BOOKINGS
========================================= */

function displayBookings() {
    const filteredBookings =
        getFilteredBookings();

    bookingsTableBody.innerHTML = "";

    if (filteredBookings.length === 0) {
        bookingsTableWrapper.hidden = true;
        emptyBookings.hidden = false;

        if (bookings.length === 0) {
            emptyBookingMessage.textContent =
                "You have not created any bookings yet.";
        } else {
            emptyBookingMessage.textContent =
                "No bookings match your current search or filters.";
        }

        return;
    }

    const rows =
        filteredBookings
            .map(createBookingRow)
            .join("");

    bookingsTableBody.innerHTML = rows;

    bookingsTableWrapper.hidden = false;
    emptyBookings.hidden = true;
}

/* =========================================
   FIND BOOKING
========================================= */

function findBookingById(bookingId) {
    return bookings.find((booking) => {
        return String(booking.bookingId) ===
            String(bookingId);
    });
}

/* =========================================
   VIEW BOOKING
========================================= */

function viewBooking(bookingId) {
    const booking =
        findBookingById(bookingId);

    if (!booking) {
        showToast(
            "Booking details could not be found.",
            "error"
        );

        return;
    }

    localStorage.setItem(
        "willudaLatestBooking",
        JSON.stringify(booking)
    );

    window.location.href =
        "booking-details.html";
}

/* =========================================
   CANCEL MODAL
========================================= */

function openCancelModal(bookingId) {
    selectedBookingId = bookingId;

    cancelBookingId.textContent =
        bookingId;

    cancelModal.classList.add("show");

    cancelModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}

function closeModal() {
    selectedBookingId = null;

    cancelModal.classList.remove("show");

    cancelModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}

/* =========================================
   CANCEL BOOKING
========================================= */

function cancelSelectedBooking() {
    if (!selectedBookingId) {
        closeModal();
        return;
    }

    const bookingIndex =
        bookings.findIndex((booking) => {
            return String(booking.bookingId) ===
                String(selectedBookingId);
        });

    if (bookingIndex === -1) {
        showToast(
            "Unable to cancel this booking.",
            "error"
        );

        closeModal();
        return;
    }

    bookings[bookingIndex].bookingStatus =
        "Cancelled";

    bookings[bookingIndex].cancelledAt =
        new Date().toISOString();

    saveBookings();

    const latestBooking =
        localStorage.getItem(
            "willudaLatestBooking"
        );

    if (latestBooking) {
        try {
            const parsedLatestBooking =
                JSON.parse(latestBooking);

            if (
                String(
                    parsedLatestBooking.bookingId
                ) ===
                String(selectedBookingId)
            ) {
                localStorage.setItem(
                    "willudaLatestBooking",
                    JSON.stringify(
                        bookings[bookingIndex]
                    )
                );
            }

        } catch (error) {
            console.error(
                "Unable to update latest booking:",
                error
            );
        }
    }

    updateStatistics();
    displayBookings();
    closeModal();

    // Sync cancellation to backend if database ID is present
    const dbId = bookings[bookingIndex].id;
    if (dbId) {
        const apiBase =
            (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.bookings) ||
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000/api/bookings"
                : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}/api/bookings`);

        fetch(`${apiBase}/${dbId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Cancelled" })
        }).catch((err) => console.warn("Backend cancel sync note:", err.message));
    }

    try {
        const stored = localStorage.getItem("willudaNotifications");
        let notifications = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(notifications)) notifications = [];
        notifications.unshift({
            id: "notif-" + Date.now(),
            title: "Booking Cancelled",
            message: `Booking ${selectedBookingId} has been cancelled.`,
            type: "system",
            isRead: false,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem("willudaNotifications", JSON.stringify(notifications));
    } catch (e) {}

    showToast(
        "Booking cancelled successfully.",
        "success"
    );
}

/* =========================================
   CLEAR FILTERS
========================================= */

function clearFilters() {
    bookingSearch.value = "";
    bookingStatusFilter.value = "all";
    paymentStatusFilter.value = "all";

    displayBookings();
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(
    message,
    type = "success"
) {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    toastMessage.className =
        `toast-message ${type} show`;

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove(
            "show"
        );
    }, 3000);
}

/* =========================================
   TABLE ACTIONS
========================================= */

function handleTableAction(event) {
    const actionButton =
        event.target.closest(
            "[data-action]"
        );

    if (!actionButton) {
        return;
    }

    const action =
        actionButton.dataset.action;

    const bookingId =
        actionButton.dataset.bookingId;

    if (action === "view") {
        viewBooking(bookingId);
    }

    if (
        action === "cancel" &&
        !actionButton.disabled
    ) {
        openCancelModal(bookingId);
    }
}

/* =========================================
   EVENT LISTENERS
========================================= */

bookingSearch.addEventListener(
    "input",
    displayBookings
);

bookingStatusFilter.addEventListener(
    "change",
    displayBookings
);

paymentStatusFilter.addEventListener(
    "change",
    displayBookings
);

clearFiltersButton.addEventListener(
    "click",
    clearFilters
);

bookingsTableBody.addEventListener(
    "click",
    handleTableAction
);

confirmCancelButton.addEventListener(
    "click",
    cancelSelectedBooking
);

keepBookingButton.addEventListener(
    "click",
    closeModal
);

closeCancelModal.addEventListener(
    "click",
    closeModal
);

cancelModal.addEventListener(
    "click",
    (event) => {
        if (event.target === cancelModal) {
            closeModal();
        }
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            cancelModal.classList.contains(
                "show"
            )
        ) {
            closeModal();
        }
    }
);

/* =========================================
   INITIAL PAGE LOAD & BACKEND SYNC
========================================= */

async function syncBookingsFromApi() {
    try {
        const userJson =
            sessionStorage.getItem("currentUser") ||
            localStorage.getItem("user");
        let userEmail = null;
        if (userJson) {
            try {
                const u = JSON.parse(userJson);
                userEmail = u.email;
            } catch (e) {}
        }
        if (!userEmail) {
            const profileJson = localStorage.getItem("willudaUserProfile");
            if (profileJson) {
                try {
                    const p = JSON.parse(profileJson);
                    userEmail = p.email;
                } catch (e) {}
            }
        }
        if (!userEmail) return;

        const apiUrl =
            (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.bookings) ||
            (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000/api/bookings"
                : `${(
                      window.WILLUDA_API_URL ||
                      localStorage.getItem("willudaApiUrl") ||
                      "https://willuda-inn-backend.up.railway.app"
                  ).replace(/\/+$/, "")}/api/bookings`);

        const res = await fetch(
            `${apiUrl}?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        const serverBookings = Array.isArray(json.data) ? json.data : [];
        if (serverBookings.length === 0) return;

        let changed = false;
        serverBookings.forEach((sb) => {
            const existing = bookings.find(
                (b) =>
                    String(b.id) === String(sb.id) ||
                    b.bookingId === `WIL-${String(sb.id).padStart(5, "0")}`
            );
            if (existing) {
                if (sb.status && existing.bookingStatus !== sb.status) {
                    existing.bookingStatus = sb.status;
                    existing.status = sb.status;
                    changed = true;
                }
            } else {
                bookings.push({
                    id: sb.id,
                    bookingId: `WIL-${String(sb.id).padStart(5, "0")}`,
                    customer: {
                        fullName: sb.customer_name || "-",
                        email: sb.email || "-",
                        phone: sb.phone || "-",
                        address: sb.address || "-"
                    },
                    facility: sb.room_type || "Deluxe Room",
                    checkin: sb.check_in,
                    checkout: sb.check_out,
                    adults: sb.guests || 1,
                    children: 0,
                    total: sb.total_price || 0,
                    bookingStatus: sb.status || "Confirmed",
                    paymentStatus:
                        sb.status === "Confirmed" ? "Paid" : "Pending",
                    createdAt: sb.created_at || new Date().toISOString()
                });
                changed = true;
            }
        });

        if (changed) {
            saveBookings();
            updateStatistics();
            displayBookings();
        }
    } catch (e) {
        console.warn("Could not sync bookings with backend API:", e);
    }
}

function initializeMyBookingsPage() {
    loadBookings();
    updateStatistics();
    displayBookings();
    syncBookingsFromApi();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeMyBookingsPage
);