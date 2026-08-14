"use strict";

/* =====================================================
   WILLUDA INN - BOOKING PAGE JAVASCRIPT
===================================================== */

const API_URL =
    "http://localhost:5000/api/bookings";

/* =========================
   FORM ELEMENTS
========================= */

const bookingForm =
    document.getElementById("bookingForm");

const facilityInput =
    document.getElementById("facility");

const checkinInput =
    document.getElementById("checkin");

const checkoutInput =
    document.getElementById("checkout");

const adultsInput =
    document.getElementById("adults");

const childrenInput =
    document.getElementById("children");

const requestInput =
    document.getElementById("request");

const fullNameInput =
    document.getElementById("fullname");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const addressInput =
    document.getElementById("address");

/* =========================
   SUMMARY ELEMENTS
========================= */

const facilityNameElement =
    document.getElementById("facilityName");

const roomPriceElement =
    document.getElementById("roomPrice");

const nightsElement =
    document.getElementById("nights");

const subtotalElement =
    document.getElementById("subtotal");

const serviceElement =
    document.getElementById("service");

const taxElement =
    document.getElementById("tax");

const totalElement =
    document.getElementById("total");

const bookingMessage =
    document.getElementById("bookingMessage");

/* =========================
   FACILITY PRICES
========================= */

const facilityPrices = {
    "Luxury Deluxe Room": 85,
    "Standard Room": 65,
    "Family Suite": 120,
    "Wedding Hall": 500,
    "Conference Hall": 350,
    "Garden Area": 250
};

/* =========================
   BOOKING CHARGES
========================= */

const serviceChargeRate = 0.08;
const taxRate = 0.10;

/* =========================
   CURRENT CALCULATION DATA
========================= */

let currentPrice = 0;
let currentNights = 0;
let currentSubtotal = 0;
let currentServiceCharge = 0;
let currentTax = 0;
let currentTotal = 0;

/* =========================
   CURRENCY FORMATTER
========================= */

const currencyFormatter =
    new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }
    );

function formatCurrency(amount) {
    return currencyFormatter.format(
        Number(amount) || 0
    );
}

/* =========================
   DATE FUNCTIONS
========================= */

function formatDateForInput(date) {
    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setMinimumBookingDates() {
    const today =
        new Date();

    const todayString =
        formatDateForInput(today);

    checkinInput.min =
        todayString;

    checkoutInput.min =
        todayString;
}

function calculateNumberOfNights() {
    const checkinValue =
        checkinInput.value;

    const checkoutValue =
        checkoutInput.value;

    if (
        !checkinValue ||
        !checkoutValue
    ) {
        return 0;
    }

    const checkinDate =
        new Date(
            `${checkinValue}T00:00:00`
        );

    const checkoutDate =
        new Date(
            `${checkoutValue}T00:00:00`
        );

    const difference =
        checkoutDate.getTime() -
        checkinDate.getTime();

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const nights =
        difference /
        millisecondsPerDay;

    if (nights <= 0) {
        return 0;
    }

    return Math.round(nights);
}

function updateCheckoutMinimumDate() {
    const checkinValue =
        checkinInput.value;

    if (!checkinValue) {
        return;
    }

    const minimumCheckoutDate =
        new Date(
            `${checkinValue}T00:00:00`
        );

    minimumCheckoutDate.setDate(
        minimumCheckoutDate.getDate() + 1
    );

    const minimumCheckoutValue =
        formatDateForInput(
            minimumCheckoutDate
        );

    checkoutInput.min =
        minimumCheckoutValue;

    if (
        checkoutInput.value &&
        checkoutInput.value <
            minimumCheckoutValue
    ) {
        checkoutInput.value = "";
    }
}

/* =========================
   BOOKING CALCULATION
========================= */

function calculateBookingSummary() {
    const selectedFacility =
        facilityInput.value;

    currentPrice =
        facilityPrices[
            selectedFacility
        ] || 0;

    currentNights =
        calculateNumberOfNights();

    if (
        !selectedFacility ||
        currentNights <= 0
    ) {
        currentSubtotal = 0;
        currentServiceCharge = 0;
        currentTax = 0;
        currentTotal = 0;

        updateSummaryDisplay();

        return;
    }

    currentSubtotal =
        currentPrice *
        currentNights;

    currentServiceCharge =
        currentSubtotal *
        serviceChargeRate;

    currentTax =
        currentSubtotal *
        taxRate;

    currentTotal =
        currentSubtotal +
        currentServiceCharge +
        currentTax;

    updateSummaryDisplay();
}

function updateSummaryDisplay() {
    const selectedFacility =
        facilityInput.value;

    facilityNameElement.textContent =
        selectedFacility ||
        "Not Selected";

    roomPriceElement.textContent =
        formatCurrency(
            currentPrice
        );

    nightsElement.textContent =
        String(currentNights);

    subtotalElement.textContent =
        formatCurrency(
            currentSubtotal
        );

    serviceElement.textContent =
        formatCurrency(
            currentServiceCharge
        );

    taxElement.textContent =
        formatCurrency(
            currentTax
        );

    totalElement.textContent =
        formatCurrency(
            currentTotal
        );
}

/* =========================
   FIELD ERROR FUNCTIONS
========================= */

function clearFieldError(inputElement) {
    inputElement.classList.remove(
        "input-error"
    );

    inputElement.classList.remove(
        "input-success"
    );

    const formGroup =
        inputElement.closest(
            ".form-group"
        );

    if (!formGroup) {
        return;
    }

    const existingError =
        formGroup.querySelector(
            ".error-message"
        );

    if (existingError) {
        existingError.remove();
    }
}

function showFieldError(
    inputElement,
    message
) {
    clearFieldError(inputElement);

    inputElement.classList.add(
        "input-error"
    );

    const errorMessage =
        document.createElement(
            "span"
        );

    errorMessage.className =
        "error-message";

    errorMessage.textContent =
        message;

    const formGroup =
        inputElement.closest(
            ".form-group"
        );

    if (formGroup) {
        formGroup.appendChild(
            errorMessage
        );
    }
}

function showFieldSuccess(
    inputElement
) {
    clearFieldError(inputElement);

    inputElement.classList.add(
        "input-success"
    );
}

/* =========================
   VALIDATION HELPERS
========================= */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

function isValidPhone(phone) {
    return /^[+]?[\d\s-]{9,15}$/
        .test(phone);
}

function validateFacility() {
    if (!facilityInput.value) {
        showFieldError(
            facilityInput,
            "Please select a facility."
        );

        return false;
    }

    showFieldSuccess(
        facilityInput
    );

    return true;
}

function validateCheckin() {
    if (!checkinInput.value) {
        showFieldError(
            checkinInput,
            "Please select a check-in date."
        );

        return false;
    }

    const selectedDate =
        new Date(
            `${checkinInput.value}T00:00:00`
        );

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    if (selectedDate < today) {
        showFieldError(
            checkinInput,
            "Check-in date cannot be in the past."
        );

        return false;
    }

    showFieldSuccess(
        checkinInput
    );

    return true;
}

function validateCheckout() {
    if (!checkoutInput.value) {
        showFieldError(
            checkoutInput,
            "Please select a check-out date."
        );

        return false;
    }

    if (!checkinInput.value) {
        showFieldError(
            checkoutInput,
            "Select the check-in date first."
        );

        return false;
    }

    const checkinDate =
        new Date(
            `${checkinInput.value}T00:00:00`
        );

    const checkoutDate =
        new Date(
            `${checkoutInput.value}T00:00:00`
        );

    if (
        checkoutDate <=
        checkinDate
    ) {
        showFieldError(
            checkoutInput,
            "Check-out must be after the check-in date."
        );

        return false;
    }

    showFieldSuccess(
        checkoutInput
    );

    return true;
}

function validateFullName() {
    const fullName =
        fullNameInput.value.trim();

    if (!fullName) {
        showFieldError(
            fullNameInput,
            "Please enter your full name."
        );

        return false;
    }

    if (fullName.length < 3) {
        showFieldError(
            fullNameInput,
            "Full name must contain at least 3 characters."
        );

        return false;
    }

    showFieldSuccess(
        fullNameInput
    );

    return true;
}

function validateEmail() {
    const email =
        emailInput.value.trim();

    if (!email) {
        showFieldError(
            emailInput,
            "Please enter your email address."
        );

        return false;
    }

    if (!isValidEmail(email)) {
        showFieldError(
            emailInput,
            "Please enter a valid email address."
        );

        return false;
    }

    showFieldSuccess(
        emailInput
    );

    return true;
}

function validatePhone() {
    const phone =
        phoneInput.value.trim();

    if (!phone) {
        showFieldError(
            phoneInput,
            "Please enter your phone number."
        );

        return false;
    }

    if (!isValidPhone(phone)) {
        showFieldError(
            phoneInput,
            "Please enter a valid phone number."
        );

        return false;
    }

    showFieldSuccess(
        phoneInput
    );

    return true;
}

function validateAddress() {
    const address =
        addressInput.value.trim();

    if (!address) {
        showFieldError(
            addressInput,
            "Please enter your address."
        );

        return false;
    }

    if (address.length < 5) {
        showFieldError(
            addressInput,
            "Please enter a complete address."
        );

        return false;
    }

    showFieldSuccess(
        addressInput
    );

    return true;
}

function validateBookingForm() {
    const isFacilityValid =
        validateFacility();

    const isCheckinValid =
        validateCheckin();

    const isCheckoutValid =
        validateCheckout();

    const isFullNameValid =
        validateFullName();

    const isEmailValid =
        validateEmail();

    const isPhoneValid =
        validatePhone();

    const isAddressValid =
        validateAddress();

    const hasValidPrice =
        currentTotal > 0;

    if (!hasValidPrice) {
        showBookingMessage(
            "Please select a valid facility and booking period.",
            "error"
        );
    }

    return (
        isFacilityValid &&
        isCheckinValid &&
        isCheckoutValid &&
        isFullNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isAddressValid &&
        hasValidPrice
    );
}

/* =========================
   BOOKING MESSAGE
========================= */

function showBookingMessage(
    message,
    type = "success"
) {
    if (!bookingMessage) {
        return;
    }

    bookingMessage.textContent =
        message;

    bookingMessage.style.background =
        type === "error"
            ? "#c0392b"
            : "#111b31";

    bookingMessage.classList.add(
        "show"
    );

    window.setTimeout(
        () => {
            bookingMessage
                .classList
                .remove("show");
        },
        3500
    );
}

/* =========================
   CREATE LOCAL BOOKING OBJECT
========================= */

function createLocalBookingData(
    databaseBookingId = null
) {
    const adults =
        Number(
            adultsInput.value
        );

    const children =
        Number(
            childrenInput.value
        );

    return {
        id:
            databaseBookingId,

        bookingId:
            databaseBookingId
                ? `WLI-${String(
                    databaseBookingId
                ).padStart(5, "0")}`
                : null,

        facility:
            facilityInput.value,

        pricePerNight:
            currentPrice,

        checkin:
            checkinInput.value,

        checkout:
            checkoutInput.value,

        nights:
            currentNights,

        adults,
        children,

        guests:
            adults + children,

        specialRequest:
            requestInput.value.trim(),

        customer: {
            fullName:
                fullNameInput.value.trim(),

            email:
                emailInput.value.trim(),

            phone:
                phoneInput.value.trim(),

            address:
                addressInput.value.trim()
        },

        subtotal:
            Number(
                currentSubtotal.toFixed(2)
            ),

        serviceCharge:
            Number(
                currentServiceCharge.toFixed(2)
            ),

        tax:
            Number(
                currentTax.toFixed(2)
            ),

        total:
            Number(
                currentTotal.toFixed(2)
            ),

        bookingStatus:
            "Pending",

        paymentStatus:
            "Pending",

        createdAt:
            new Date().toISOString()
    };
}

/* =========================
   CREATE API BOOKING OBJECT
========================= */

function createApiBookingData() {
    const totalGuests =
        Number(adultsInput.value) +
        Number(childrenInput.value);

    return {
        customer_name:
            fullNameInput.value.trim(),

        email:
            emailInput.value.trim(),

        phone:
            phoneInput.value.trim(),

        room_type:
            facilityInput.value,

        check_in:
            checkinInput.value,

        check_out:
            checkoutInput.value,

        guests:
            totalGuests,

        total_price:
            Number(
                currentTotal.toFixed(2)
            ),

        status:
            "Pending"
    };
}

/* =========================
   SAVE TO LOCAL STORAGE
========================= */

function saveBookingLocally(
    bookingData
) {
    localStorage.setItem(
        "willudaLatestBooking",
        JSON.stringify(
            bookingData
        )
    );

    let savedBookings = [];

    try {
        const storedBookings =
            JSON.parse(
                localStorage.getItem(
                    "willudaBookings"
                )
            );

        savedBookings =
            Array.isArray(
                storedBookings
            )
                ? storedBookings
                : [];

    } catch (error) {
        console.error(
            "Unable to read local bookings:",
            error
        );
    }

    savedBookings.unshift(
        bookingData
    );

    localStorage.setItem(
        "willudaBookings",
        JSON.stringify(
            savedBookings
        )
    );
}

/* =========================
   SEND BOOKING TO BACKEND
========================= */

async function sendBookingToApi(
    bookingData
) {
    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    bookingData
                )
            }
        );

    let result;

    try {
        result =
            await response.json();

    } catch (error) {
        throw new Error(
            "The server returned an invalid response."
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Booking could not be created."
        );
    }

    return result;
}

/* =========================
   SUBMIT BUTTON STATE
========================= */

function setSubmitButtonLoading(
    isLoading
) {
    const submitButton =
        bookingForm.querySelector(
            'button[type="submit"]'
        );

    if (!submitButton) {
        return;
    }

    if (isLoading) {
        submitButton.disabled =
            true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Processing Booking...
        `;

        return;
    }

    submitButton.disabled =
        false;

    submitButton.innerHTML = `
        <i class="fa-solid fa-calendar-check"></i>
        Confirm Booking
    `;
}

/* =========================
   FORM SUBMISSION
========================= */

async function handleBookingSubmit(
    event
) {
    event.preventDefault();

    calculateBookingSummary();

    const formIsValid =
        validateBookingForm();

    if (!formIsValid) {
        const firstErrorField =
            document.querySelector(
                ".input-error"
            );

        if (firstErrorField) {
            firstErrorField.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            firstErrorField.focus();
        }

        return;
    }

    setSubmitButtonLoading(true);

    showBookingMessage(
        "Submitting your booking..."
    );

    try {
        const apiBookingData =
            createApiBookingData();

        const result =
            await sendBookingToApi(
                apiBookingData
            );

        const databaseBookingId =
            result.data?.id ||
            result.id ||
            null;

        const localBookingData =
            createLocalBookingData(
                databaseBookingId
            );

        saveBookingLocally(
            localBookingData
        );

        showBookingMessage(
            `Booking ${
                localBookingData.bookingId ||
                databaseBookingId ||
                ""
            } created successfully.`
        );

        window.setTimeout(
            () => {
                window.location.href =
                    "booking-details.html";
            },
            1800
        );

    } catch (error) {
        console.error(
            "Booking submission error:",
            error
        );

        showBookingMessage(
            error.message ===
                "Failed to fetch"
                ? "Cannot connect to the server. Start the backend using npm run dev."
                : error.message,
            "error"
        );

        setSubmitButtonLoading(
            false
        );
    }
}

/* =========================
   EVENT LISTENERS
========================= */

facilityInput.addEventListener(
    "change",
    () => {
        clearFieldError(
            facilityInput
        );

        calculateBookingSummary();
    }
);

checkinInput.addEventListener(
    "change",
    () => {
        clearFieldError(
            checkinInput
        );

        updateCheckoutMinimumDate();

        calculateBookingSummary();
    }
);

checkoutInput.addEventListener(
    "change",
    () => {
        clearFieldError(
            checkoutInput
        );

        calculateBookingSummary();
    }
);

fullNameInput.addEventListener(
    "input",
    () =>
        clearFieldError(
            fullNameInput
        )
);

emailInput.addEventListener(
    "input",
    () =>
        clearFieldError(
            emailInput
        )
);

phoneInput.addEventListener(
    "input",
    () =>
        clearFieldError(
            phoneInput
        )
);

addressInput.addEventListener(
    "input",
    () =>
        clearFieldError(
            addressInput
        )
);

bookingForm.addEventListener(
    "submit",
    handleBookingSubmit
);

/* =========================
   INITIAL PAGE SETUP
========================= */

setMinimumBookingDates();

calculateBookingSummary();

console.log(
    "Willuda Inn booking page loaded successfully."
);