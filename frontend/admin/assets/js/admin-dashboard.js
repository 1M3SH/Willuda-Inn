"use strict";

/* =====================================================
   WILLUDA INN - ADMIN DASHBOARD
   Final Version:
   Bookings + Customers + Facilities + Events + Payments
===================================================== */

const API_BASE =
    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.apiBase) ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}`);

const BOOKING_API_URL = `${API_BASE}/api/bookings`;
const CUSTOMER_API_URL = `${API_BASE}/api/customers`;
const FACILITY_API_URL = `${API_BASE}/api/facilities`;
const EVENT_API_URL = `${API_BASE}/api/events`;
const PAYMENT_API_URL = `${API_BASE}/api/payments`;

/* =====================================================
   PAGE ELEMENTS
===================================================== */

const adminSidebar =
    document.getElementById("adminSidebar");

const sidebarToggleButton =
    document.getElementById("sidebarToggleButton");

const sidebarCloseButton =
    document.getElementById("sidebarCloseButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const exportReportButton =
    document.getElementById("exportReportButton");

const totalBookingsCount =
    document.getElementById("totalBookingsCount");

const totalRevenueCount =
    document.getElementById("totalRevenueCount");

const occupancyRateCount =
    document.getElementById("occupancyRateCount");

const customerCount =
    document.getElementById("customerCount");

const recentBookingsBody =
    document.getElementById("recentBookingsBody");

const emptyRecentBookings =
    document.getElementById("emptyRecentBookings");

const recentActivityList =
    document.getElementById("recentActivityList");

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   APPLICATION STATE
===================================================== */

let dashboardBookings = [];
let dashboardCustomers = [];
let dashboardFacilities = [];
let dashboardEvents = [];
let dashboardPayments = [];

let toastTimer = null;
let isLoadingDashboard = false;

/* =====================================================
   HELPERS
===================================================== */

function cleanText(value) {
    return String(value ?? "").trim();
}

function normalizeText(value) {
    return cleanText(value).toLowerCase();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function parseDate(value) {
    if (!value) {
        return null;
    }

    const date =
        new Date(
            String(value).replace(
                " ",
                "T"
            )
        );

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}

function formatDate(value) {
    const date = parseDate(value);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "2-digit"
        }
    );
}

function formatDateTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "-";
    }

    return date.toLocaleString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat(
        "en-LK",
        {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );
}

function getInitials(name) {
    const parts =
        cleanText(name || "Guest")
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 0) {
        return "GU";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

function getBookingReference(booking) {
    return (
        booking.booking_reference ||
        `WLI-${String(
            booking.id || 0
        ).padStart(5, "0")}`
    );
}

function getBookingCustomerName(booking) {
    return (
        booking.customer_name ||
        booking.guest_name ||
        booking.customerName ||
        "Guest"
    );
}

function getBookingFacility(booking) {
    return (
        booking.room_type ||
        booking.facility_name ||
        booking.facility ||
        "Facility"
    );
}

function getBookingCheckIn(booking) {
    return (
        booking.check_in ||
        booking.checkin ||
        booking.checkIn ||
        null
    );
}

function getBookingCheckOut(booking) {
    return (
        booking.check_out ||
        booking.checkout ||
        booking.checkOut ||
        null
    );
}

function getBookingStatus(booking) {
    return (
        booking.status ||
        booking.bookingStatus ||
        "Pending"
    );
}

function getBookingTotal(booking) {
    return Number(
        booking.total_price ||
        booking.total_amount ||
        booking.total ||
        0
    );
}

function getEventName(eventRecord) {
    return (
        eventRecord.event_name ||
        "Event"
    );
}

function getEventStatus(eventRecord) {
    return (
        eventRecord.status ||
        "Planned"
    );
}

function getEventAmount(eventRecord) {
    return Number(
        eventRecord.total_amount ||
        0
    );
}

function getPaymentStatus(payment) {
    return (
        payment.payment_status ||
        payment.status ||
        "Pending"
    );
}

function getPaymentAmount(payment) {
    return Number(
        payment.amount ||
        0
    );
}

function getPaymentReference(payment) {
    return (
        payment.transaction_reference ||
        `WLI-PAY-${String(
            payment.id || 0
        ).padStart(5, "0")}`
    );
}

/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {
    adminSidebar?.classList.add(
        "open"
    );

    sidebarOverlay?.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";
}

function closeSidebar() {
    adminSidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";
}

/* =====================================================
   API
===================================================== */

async function apiRequest(url) {
    const response =
        await fetch(url);

    let result;

    try {
        result =
            await response.json();
    } catch (error) {
        throw new Error(
            "The backend returned an invalid response."
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to load dashboard data."
        );
    }

    return result;
}

/* =====================================================
   LOAD DATA
===================================================== */

function showDashboardLoading() {
    totalBookingsCount.textContent =
        "...";

    totalRevenueCount.textContent =
        "...";

    occupancyRateCount.textContent =
        "...";

    customerCount.textContent =
        "...";

    recentBookingsBody.innerHTML = `
        <tr>
            <td colspan="5">
                <div style="
                    padding: 30px;
                    text-align: center;
                ">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading dashboard data...
                </div>
            </td>
        </tr>
    `;

    emptyRecentBookings.hidden =
        true;
}

async function loadDashboardData() {
    if (isLoadingDashboard) {
        return;
    }

    isLoadingDashboard = true;
    showDashboardLoading();

    try {
        const [
            bookingResult,
            customerResult,
            facilityResult,
            eventResult,
            paymentResult
        ] = await Promise.all([
            apiRequest(
                BOOKING_API_URL
            ),
            apiRequest(
                CUSTOMER_API_URL
            ),
            apiRequest(
                FACILITY_API_URL
            ),
            apiRequest(
                EVENT_API_URL
            ),
            apiRequest(
                PAYMENT_API_URL
            )
        ]);

        dashboardBookings =
            Array.isArray(
                bookingResult.data
            )
                ? bookingResult.data
                : [];

        dashboardCustomers =
            Array.isArray(
                customerResult.data
            )
                ? customerResult.data
                : [];

        dashboardFacilities =
            Array.isArray(
                facilityResult.data
            )
                ? facilityResult.data
                : [];

        dashboardEvents =
            Array.isArray(
                eventResult.data
            )
                ? eventResult.data
                : [];

        dashboardPayments =
            Array.isArray(
                paymentResult.data
            )
                ? paymentResult.data
                : [];
    } catch (error) {
        console.error(
            "Dashboard data load error:",
            error
        );

        dashboardBookings = [];
        dashboardCustomers = [];
        dashboardFacilities = [];
        dashboardEvents = [];
        dashboardPayments = [];

        showToast(
            error.message ===
                "Failed to fetch"
                ? "Cannot connect to the backend. Run node server.js."
                : error.message,
            "error"
        );
    } finally {
        isLoadingDashboard = false;
    }
}

/* =====================================================
   STATISTICS
===================================================== */

function calculateCollectedRevenue() {
    return dashboardPayments.reduce(
        (
            currentTotal,
            payment
        ) => {
            const status =
                normalizeText(
                    getPaymentStatus(
                        payment
                    )
                );

            if (
                status === "refunded" ||
                status === "failed"
            ) {
                return currentTotal;
            }

            return (
                currentTotal +
                getPaymentAmount(
                    payment
                )
            );
        },
        0
    );
}

function calculateOccupancyRate() {
    if (
        dashboardBookings.length ===
        0
    ) {
        return 0;
    }

    const activeBookings =
        dashboardBookings.filter(
            (booking) => {
                const status =
                    normalizeText(
                        getBookingStatus(
                            booking
                        )
                    );

                return (
                    status ===
                        "confirmed" ||
                    status ===
                        "completed"
                );
            }
        ).length;

    return Math.round(
        (
            activeBookings /
            dashboardBookings.length
        ) * 100
    );
}

function updateStatistics() {
    totalBookingsCount.textContent =
        dashboardBookings.length;

    totalRevenueCount.textContent =
        formatCurrency(
            calculateCollectedRevenue()
        );

    occupancyRateCount.textContent =
        `${calculateOccupancyRate()}%`;

    customerCount.textContent =
        dashboardCustomers.length;
}

/* =====================================================
   RECENT BOOKINGS
===================================================== */

function createBookingRow(booking) {
    const customerName =
        getBookingCustomerName(
            booking
        );

    const status =
        getBookingStatus(
            booking
        );

    return `
        <tr>

            <td>

                <div class="guest-cell">

                    <span class="guest-initials">
                        ${escapeHtml(
                            getInitials(
                                customerName
                            )
                        )}
                    </span>

                    <div>

                        <strong>
                            ${escapeHtml(
                                customerName
                            )}
                        </strong>

                        <small>
                            Ref:
                            #${escapeHtml(
                                getBookingReference(
                                    booking
                                )
                            )}
                        </small>

                    </div>

                </div>

            </td>

            <td>

                <span class="room-badge">
                    ${escapeHtml(
                        getBookingFacility(
                            booking
                        )
                    )}
                </span>

            </td>

            <td>
                ${formatDate(
                    getBookingCheckIn(
                        booking
                    )
                )}
                —
                ${formatDate(
                    getBookingCheckOut(
                        booking
                    )
                )}
            </td>

            <td>

                <span
                    class="status-badge ${escapeHtml(
                        normalizeText(
                            status
                        )
                    )}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>

            <td>

                <a
                    href="bookings.html"
                    class="table-action-button"
                    title="Manage booking"
                    aria-label="Manage booking"
                >
                    <i class="fa-solid fa-ellipsis"></i>
                </a>

            </td>

        </tr>
    `;
}

function renderRecentBookings() {
    const recentBookings =
        [...dashboardBookings]
            .sort(
                (
                    firstBooking,
                    secondBooking
                ) => {
                    const firstDate =
                        parseDate(
                            firstBooking.created_at ||
                            firstBooking.check_in
                        )?.getTime() || 0;

                    const secondDate =
                        parseDate(
                            secondBooking.created_at ||
                            secondBooking.check_in
                        )?.getTime() || 0;

                    return (
                        secondDate -
                        firstDate
                    );
                }
            )
            .slice(0, 4);

    if (
        recentBookings.length ===
        0
    ) {
        recentBookingsBody.innerHTML =
            "";

        emptyRecentBookings.hidden =
            false;

        return;
    }

    emptyRecentBookings.hidden =
        true;

    recentBookingsBody.innerHTML =
        recentBookings
            .map(createBookingRow)
            .join("");
}

/* =====================================================
   RECENT ACTIVITY
===================================================== */

function buildRecentActivities() {
    const activities = [];

    dashboardBookings.forEach(
        (booking) => {
            activities.push({
                type:
                    "Booking",

                title:
                    `Booking: ${getBookingFacility(
                        booking
                    )}`,

                description:
                    `${getBookingCustomerName(
                        booking
                    )} · ${getBookingStatus(
                        booking
                    )}`,

                date:
                    booking.created_at ||
                    booking.check_in
            });
        }
    );

    dashboardEvents.forEach(
        (eventRecord) => {
            activities.push({
                type:
                    "Event",

                title:
                    `Event: ${getEventName(
                        eventRecord
                    )}`,

                description:
                    `${eventRecord.event_type || "Event"} · ${getEventStatus(
                        eventRecord
                    )}`,

                date:
                    eventRecord.created_at ||
                    eventRecord.event_date
            });
        }
    );

    dashboardPayments.forEach(
        (payment) => {
            activities.push({
                type:
                    "Payment",

                title:
                    `Payment: ${getPaymentReference(
                        payment
                    )}`,

                description:
                    `${formatCurrency(
                        getPaymentAmount(
                            payment
                        )
                    )} · ${getPaymentStatus(
                        payment
                    )}`,

                date:
                    payment.payment_date ||
                    payment.created_at
            });
        }
    );

    return activities
        .sort(
            (
                firstActivity,
                secondActivity
            ) => {
                const firstDate =
                    parseDate(
                        firstActivity.date
                    )?.getTime() || 0;

                const secondDate =
                    parseDate(
                        secondActivity.date
                    )?.getTime() || 0;

                return (
                    secondDate -
                    firstDate
                );
            }
        )
        .slice(0, 6);
}

function renderActivity() {
    const activities =
        buildRecentActivities();

    if (
        activities.length ===
        0
    ) {
        recentActivityList.innerHTML = `
            <div class="activity-item">
                <span class="activity-dot"></span>
                <strong>Dashboard loaded</strong>
                <small>No recent database activity.</small>
            </div>
        `;

        return;
    }

    recentActivityList.innerHTML =
        activities
            .map(
                (activity) => `
                    <div class="activity-item">

                        <span class="activity-dot"></span>

                        <strong>
                            ${escapeHtml(
                                activity.title
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                activity.description
                            )}
                            ·
                            ${escapeHtml(
                                formatDateTime(
                                    activity.date
                                )
                            )}
                        </small>

                    </div>
                `
            )
            .join("");
}

/* =====================================================
   EXPORT REPORT
===================================================== */

function exportReport() {
    const report = {
        exportedAt:
            new Date().toISOString(),

        summary: {
            totalBookings:
                dashboardBookings.length,

            totalCustomers:
                dashboardCustomers.length,

            totalFacilities:
                dashboardFacilities.length,

            totalEvents:
                dashboardEvents.length,

            totalPayments:
                dashboardPayments.length,

            collectedRevenue:
                calculateCollectedRevenue(),

            occupancyRate:
                calculateOccupancyRate()
        },

        bookings:
            dashboardBookings,

        customers:
            dashboardCustomers,

        facilities:
            dashboardFacilities,

        events:
            dashboardEvents,

        payments:
            dashboardPayments
    };

    const file =
        new Blob(
            [
                JSON.stringify(
                    report,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            file
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "willuda-admin-final-report.json";

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Final admin report exported successfully.",
        "success"
    );
}

/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {
    if (!adminToast) {
        return;
    }

    clearTimeout(
        toastTimer
    );

    adminToast.textContent =
        message;

    adminToast.className =
        `admin-toast ${type} show`;

    toastTimer =
        window.setTimeout(
            () => {
                adminToast.classList.remove(
                    "show"
                );
            },
            3000
        );
}

/* =====================================================
   EVENTS
===================================================== */

function registerEventListeners() {
    sidebarToggleButton?.addEventListener(
        "click",
        openSidebar
    );

    sidebarCloseButton?.addEventListener(
        "click",
        closeSidebar
    );

    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );

    exportReportButton?.addEventListener(
        "click",
        exportReport
    );

    window.addEventListener(
        "resize",
        () => {
            if (
                window.innerWidth >
                900
            ) {
                closeSidebar();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape"
            ) {
                closeSidebar();
            }
        }
    );
}

/* =====================================================
   INITIALIZE
===================================================== */

async function initializeDashboard() {
    registerEventListeners();

    await refreshDashboard();

    window.setInterval(
        refreshDashboard,
        30000
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (!document.hidden) {
                refreshDashboard();
            }
        }
    );
}

async function refreshDashboard() {
    await loadDashboardData();

    updateStatistics();
    renderRecentBookings();
    renderActivity();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);
