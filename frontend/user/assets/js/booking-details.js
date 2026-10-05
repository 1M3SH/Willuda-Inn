"use strict";

/* =========================================
   WILLUDA INN - BOOKING DETAILS PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const bookingContent =
    document.getElementById("bookingContent");

const emptyBooking =
    document.getElementById("emptyBooking");

const printButton =
    document.getElementById("printButton");

/* Overview */

const bookingIdElement =
    document.getElementById("bookingId");

const bookingStatusElement =
    document.getElementById("bookingStatus");

const paymentStatusElement =
    document.getElementById("paymentStatus");

const createdDateElement =
    document.getElementById("createdDate");

/* Customer Information */

const customerNameElement =
    document.getElementById("customerName");

const customerEmailElement =
    document.getElementById("customerEmail");

const customerPhoneElement =
    document.getElementById("customerPhone");

const customerAddressElement =
    document.getElementById("customerAddress");

/* Booking Information */

const facilityElement =
    document.getElementById("facility");

const checkinElement =
    document.getElementById("checkin");

const checkoutElement =
    document.getElementById("checkout");

const nightsElement =
    document.getElementById("nights");

const adultsElement =
    document.getElementById("adults");

const childrenElement =
    document.getElementById("children");

/* Special Request */

const specialRequestElement =
    document.getElementById("specialRequest");

/* Payment Information */

const pricePerNightElement =
    document.getElementById("pricePerNight");

const subtotalElement =
    document.getElementById("subtotal");

const serviceChargeElement =
    document.getElementById("serviceCharge");

const taxElement =
    document.getElementById("tax");

const totalElement =
    document.getElementById("total");

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
            month: "long",
            day: "numeric"
        }
    );
}

function formatCreatedDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

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
   STATUS BADGE UPDATE
========================================= */

function updateBookingStatus(status) {
    const bookingStatus =
        status || "Pending";

    bookingStatusElement.textContent =
        bookingStatus;

    bookingStatusElement.className =
        "status-badge";

    const normalizedStatus =
        bookingStatus.toLowerCase();

    if (
        normalizedStatus === "confirmed" ||
        normalizedStatus === "completed"
    ) {
        bookingStatusElement.classList.add(
            "confirmed"
        );
    } else if (
        normalizedStatus === "cancelled"
    ) {
        bookingStatusElement.classList.add(
            "cancelled"
        );
    } else {
        bookingStatusElement.classList.add(
            "pending"
        );
    }
}

function updatePaymentStatus(status) {
    const paymentStatus =
        status || "Pending";

    paymentStatusElement.textContent =
        paymentStatus;

    paymentStatusElement.className =
        "status-badge";

    const normalizedStatus =
        paymentStatus.toLowerCase();

    if (
        normalizedStatus === "paid" ||
        normalizedStatus === "completed"
    ) {
        paymentStatusElement.classList.add(
            "confirmed"
        );
    } else if (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "failed"
    ) {
        paymentStatusElement.classList.add(
            "cancelled"
        );
    } else {
        paymentStatusElement.classList.add(
            "pending"
        );
    }
}

/* =========================================
   DISPLAY BOOKING DETAILS
========================================= */

function displayBookingDetails(booking) {
    bookingIdElement.textContent =
        booking.bookingId || (booking.id ? `#WIL-${String(booking.id).padStart(5, '0')}` : "-");

    updateBookingStatus(
        booking.bookingStatus || booking.status
    );

    updatePaymentStatus(
        booking.paymentStatus || (booking.status === "Confirmed" ? "Paid" : "Pending")
    );

    createdDateElement.textContent =
        formatCreatedDate(
            booking.createdAt || booking.created_at || new Date().toISOString()
        );

    /* Customer Information */

    customerNameElement.textContent =
        booking.customer?.fullName || booking.customer_name || "-";

    customerEmailElement.textContent =
        booking.customer?.email || booking.email || "-";

    customerPhoneElement.textContent =
        booking.customer?.phone || booking.phone || "-";

    customerAddressElement.textContent =
        booking.customer?.address || booking.address || "-";

    /* Booking Information */

    facilityElement.textContent =
        booking.facility || booking.room_type || "-";

    checkinElement.textContent =
        formatDate(booking.checkin || booking.check_in);

    checkoutElement.textContent =
        formatDate(booking.checkout || booking.check_out);

    let calculatedNights = booking.nights;
    if (calculatedNights === undefined && (booking.check_in || booking.checkin) && (booking.check_out || booking.checkout)) {
        try {
            const inD = new Date(booking.check_in || booking.checkin);
            const outD = new Date(booking.check_out || booking.checkout);
            calculatedNights = Math.max(1, Math.round((outD - inD) / (1000 * 60 * 60 * 24)));
        } catch (e) {
            calculatedNights = 1;
        }
    }
    nightsElement.textContent = calculatedNights ?? 1;

    adultsElement.textContent =
        booking.adults ?? booking.guests ?? 1;

    childrenElement.textContent =
        booking.children ?? 0;

    /* Special Request */

    specialRequestElement.textContent =
        booking.specialRequest ||
        booking.special_requests ||
        "No special request provided.";

    /* Payment Information */

    pricePerNightElement.textContent =
        formatCurrency(
            booking.pricePerNight || (calculatedNights ? ((booking.total || booking.total_price || 0) / calculatedNights) : 0)
        );

    subtotalElement.textContent =
        formatCurrency(
            booking.subtotal || booking.total || booking.total_price || 0
        );

    serviceChargeElement.textContent =
        formatCurrency(
            booking.serviceCharge || 0
        );

    taxElement.textContent =
        formatCurrency(
            booking.tax || 0
        );

    totalElement.textContent =
        formatCurrency(
            booking.total || booking.total_price || 0
        );
}

/* =========================================
   SHOW BOOKING CONTENT
========================================= */

function showBookingContent() {
    bookingContent.hidden = false;
    emptyBooking.hidden = true;
}

/* =========================================
   SHOW EMPTY BOOKING STATE
========================================= */

function showEmptyBooking() {
    bookingContent.hidden = true;
    emptyBooking.hidden = false;
}

/* =========================================
   LOAD BOOKING FROM LOCAL STORAGE OR API
========================================= */

async function loadLatestBooking() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id") || urlParams.get("ref");

    if (queryId) {
        try {
            const storedBookings = JSON.parse(
                localStorage.getItem("willudaBookings") || "[]"
            );
            const found = storedBookings.find(
                b => String(b.id) === queryId || b.bookingId === queryId
            );
            if (found) {
                displayBookingDetails(found);
                showBookingContent();
                return;
            }
        } catch (e) {
            console.error("Error looking up booking in localStorage:", e);
        }

        // Try fetching directly from API if queryId has numbers
        const cleanId = queryId.replace(/^WIL-0*/i, "").trim();
        if (cleanId) {
            try {
                const apiUrl =
                    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.bookings) ||
                    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                        ? "http://localhost:5000/api/bookings"
                        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}/api/bookings`);

                const res = await fetch(`${apiUrl}/${cleanId}`);
                if (res.ok) {
                    const json = await res.json();
                    const bData = json.data || json;
                    if (bData && (bData.id || bData.customer_name)) {
                        displayBookingDetails(bData);
                        showBookingContent();
                        return;
                    }
                }
            } catch (apiErr) {
                console.warn("Unable to fetch booking from API:", apiErr);
            }
        }
    }

    const savedBooking =
        localStorage.getItem(
            "willudaLatestBooking"
        );

    if (!savedBooking) {
        showEmptyBooking();
        return;
    }

    try {
        const booking =
            JSON.parse(savedBooking);

        if (
            !booking ||
            typeof booking !== "object"
        ) {
            showEmptyBooking();
            return;
        }

        displayBookingDetails(booking);
        showBookingContent();

    } catch (error) {
        console.error(
            "Unable to load booking:",
            error
        );

        showEmptyBooking();
    }
}

/* =========================================
   PRINT BOOKING
========================================= */

function printBookingDetails() {
    window.print();
}

/* =========================================
   EVENT LISTENERS
========================================= */

if (printButton) {
    printButton.addEventListener(
        "click",
        printBookingDetails
    );
}

/* =========================================
   INITIAL PAGE LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadLatestBooking
);