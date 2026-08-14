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
        booking.bookingId || "-";

    updateBookingStatus(
        booking.bookingStatus
    );

    updatePaymentStatus(
        booking.paymentStatus
    );

    createdDateElement.textContent =
        formatCreatedDate(
            booking.createdAt
        );

    /* Customer Information */

    customerNameElement.textContent =
        booking.customer?.fullName || "-";

    customerEmailElement.textContent =
        booking.customer?.email || "-";

    customerPhoneElement.textContent =
        booking.customer?.phone || "-";

    customerAddressElement.textContent =
        booking.customer?.address || "-";

    /* Booking Information */

    facilityElement.textContent =
        booking.facility || "-";

    checkinElement.textContent =
        formatDate(booking.checkin);

    checkoutElement.textContent =
        formatDate(booking.checkout);

    nightsElement.textContent =
        booking.nights ?? 0;

    adultsElement.textContent =
        booking.adults ?? 0;

    childrenElement.textContent =
        booking.children ?? 0;

    /* Special Request */

    specialRequestElement.textContent =
        booking.specialRequest ||
        "No special request provided.";

    /* Payment Information */

    pricePerNightElement.textContent =
        formatCurrency(
            booking.pricePerNight
        );

    subtotalElement.textContent =
        formatCurrency(
            booking.subtotal
        );

    serviceChargeElement.textContent =
        formatCurrency(
            booking.serviceCharge
        );

    taxElement.textContent =
        formatCurrency(
            booking.tax
        );

    totalElement.textContent =
        formatCurrency(
            booking.total
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
   LOAD BOOKING FROM LOCAL STORAGE
========================================= */

function loadLatestBooking() {
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