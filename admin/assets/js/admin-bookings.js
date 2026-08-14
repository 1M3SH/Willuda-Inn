"use strict";

/* =====================================================
   WILLUDA INN - ADMIN BOOKING MANAGEMENT
   Backend API + MySQL Version
===================================================== */

const API_URL =
    "http://localhost:5000/api/bookings";

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

const bookingSearch =
    document.getElementById("bookingSearch");

const bookingStatusFilter =
    document.getElementById("bookingStatusFilter");

const bookingTypeFilter =
    document.getElementById("bookingTypeFilter");

const clearBookingFilters =
    document.getElementById("clearBookingFilters");

const bookingResultCount =
    document.getElementById("bookingResultCount");

const bookingTableBody =
    document.getElementById("bookingTableBody");

const emptyBookings =
    document.getElementById("emptyBookings");

const emptyBookingMessage =
    document.getElementById("emptyBookingMessage");

const totalBookingsCount =
    document.getElementById("totalBookingsCount");

const pendingBookingsCount =
    document.getElementById("pendingBookingsCount");

const confirmedBookingsCount =
    document.getElementById("confirmedBookingsCount");

const cancelledBookingsCount =
    document.getElementById("cancelledBookingsCount");

const exportBookingsButton =
    document.getElementById("exportBookingsButton");

const addBookingButton =
    document.getElementById("addBookingButton");

const emptyAddBookingButton =
    document.getElementById("emptyAddBookingButton");

/* =====================================================
   BOOKING DETAILS MODAL ELEMENTS
===================================================== */

const bookingDetailsModal =
    document.getElementById("bookingDetailsModal");

const closeBookingModal =
    document.getElementById("closeBookingModal");

const bookingModalTitle =
    document.getElementById("bookingModalTitle");

const modalBookingStatus =
    document.getElementById("modalBookingStatus");

const modalBookingReference =
    document.getElementById("modalBookingReference");

const modalGuestName =
    document.getElementById("modalGuestName");

const modalGuestEmail =
    document.getElementById("modalGuestEmail");

const modalGuestPhone =
    document.getElementById("modalGuestPhone");

const modalFacilityName =
    document.getElementById("modalFacilityName");

const modalFacilityType =
    document.getElementById("modalFacilityType");

const modalCheckIn =
    document.getElementById("modalCheckIn");

const modalCheckOut =
    document.getElementById("modalCheckOut");

const modalGuestCount =
    document.getElementById("modalGuestCount");

const modalTotalAmount =
    document.getElementById("modalTotalAmount");

const modalSpecialRequest =
    document.getElementById("modalSpecialRequest");

const confirmBookingButton =
    document.getElementById("confirmBookingButton");

const completeBookingButton =
    document.getElementById("completeBookingButton");

const cancelBookingButton =
    document.getElementById("cancelBookingButton");

const deleteBookingButton =
    document.getElementById("deleteBookingButton");

/* =====================================================
   ADD BOOKING MODAL ELEMENTS
===================================================== */

const addBookingModal =
    document.getElementById("addBookingModal");

const closeAddBookingModal =
    document.getElementById("closeAddBookingModal");

const cancelAddBookingButton =
    document.getElementById("cancelAddBookingButton");

const addBookingForm =
    document.getElementById("addBookingForm");

const newGuestName =
    document.getElementById("newGuestName");

const newGuestEmail =
    document.getElementById("newGuestEmail");

const newGuestPhone =
    document.getElementById("newGuestPhone");

const newFacilityName =
    document.getElementById("newFacilityName");

const newFacilityType =
    document.getElementById("newFacilityType");

const newGuestCount =
    document.getElementById("newGuestCount");

const newCheckIn =
    document.getElementById("newCheckIn");

const newCheckOut =
    document.getElementById("newCheckOut");

const newTotalAmount =
    document.getElementById("newTotalAmount");

const newSpecialRequest =
    document.getElementById("newSpecialRequest");

const addBookingMessage =
    document.getElementById("addBookingMessage");

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   APPLICATION STATE
===================================================== */

let bookings = [];

let selectedBookingId = null;

let toastTimer = null;

let isLoadingBookings = false;

/* =====================================================
   HELPER FUNCTIONS
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

function formatCurrency(value) {
    return new Intl.NumberFormat(
        "en-LK",
        {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2
        }
    ).format(Number(value) || 0);
}

function formatDate(dateValue) {
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
            day: "2-digit"
        }
    );
}

function formatDateForInput(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getInitials(name) {
    const parts =
        cleanText(name)
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

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

/* =====================================================
   NORMALIZE DATABASE BOOKING
===================================================== */

function normalizeBooking(databaseBooking) {
    return {
        id:
            databaseBooking.id,

        reference:
            `WLI-${String(
                databaseBooking.id
            ).padStart(5, "0")}`,

        customerName:
            databaseBooking.customer_name ||
            "Guest",

        email:
            databaseBooking.email ||
            "-",

        phone:
            databaseBooking.phone ||
            "-",

        facility:
            databaseBooking.room_type ||
            "Facility",

        facilityType:
            getFacilityType(
                databaseBooking.room_type
            ),

        checkIn:
            databaseBooking.check_in,

        checkOut:
            databaseBooking.check_out,

        guests:
            Number(
                databaseBooking.guests
            ) || 1,

        total:
            Number(
                databaseBooking.total_price
            ) || 0,

        status:
            databaseBooking.status ||
            "Pending",

        specialRequest:
            databaseBooking.special_request ||
            "No special request stored in the current database table."
    };
}

function getFacilityType(facilityName) {
    const facility =
        normalizeText(facilityName);

    if (
        facility.includes("hall")
    ) {
        return "Hall";
    }

    if (
        facility.includes("garden") ||
        facility.includes("event")
    ) {
        return "Event Space";
    }

    if (
        facility.includes("restaurant")
    ) {
        return "Restaurant";
    }

    return "Room";
}

/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {
    if (
        !adminSidebar ||
        !sidebarOverlay
    ) {
        return;
    }

    adminSidebar.classList.add("open");

    sidebarOverlay.classList.add("show");

    document.body.style.overflow =
        "hidden";
}

function closeSidebar() {
    if (
        !adminSidebar ||
        !sidebarOverlay
    ) {
        return;
    }

    adminSidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

    document.body.style.overflow = "";
}

/* =====================================================
   API HELPERS
===================================================== */

async function apiRequest(
    url,
    options = {}
) {
    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );

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
            "The request could not be completed."
        );
    }

    return result;
}

/* =====================================================
   LOAD BOOKINGS FROM BACKEND
===================================================== */

async function loadBookings() {
    if (isLoadingBookings) {
        return;
    }

    isLoadingBookings = true;

    if (bookingTableBody) {
        bookingTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div style="
                        padding: 30px;
                        text-align: center;
                    ">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Loading bookings...
                    </div>
                </td>
            </tr>
        `;
    }

    try {
        const result =
            await apiRequest(
                API_URL
            );

        const databaseBookings =
            Array.isArray(result.data)
                ? result.data
                : [];

        bookings =
            databaseBookings.map(
                normalizeBooking
            );

        renderBookings();

    } catch (error) {
        console.error(
            "Load bookings error:",
            error
        );

        bookings = [];

        renderBookings();

        showToast(
            error.message ===
                "Failed to fetch"
                ? "Cannot connect to the backend. Run npm run dev."
                : error.message,
            "error"
        );

    } finally {
        isLoadingBookings = false;
    }
}

/* =====================================================
   FILTER BOOKINGS
===================================================== */

function getFilteredBookings() {
    const searchValue =
        normalizeText(
            bookingSearch?.value
        );

    const statusValue =
        bookingStatusFilter?.value ||
        "all";

    const typeValue =
        bookingTypeFilter?.value ||
        "all";

    return bookings.filter(
        (booking) => {
            const searchableContent = [
                booking.reference,
                booking.id,
                booking.customerName,
                booking.email,
                booking.phone,
                booking.facility,
                booking.facilityType
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableContent.includes(
                    searchValue
                );

            const matchesStatus =
                statusValue === "all" ||
                normalizeText(
                    booking.status
                ) ===
                normalizeText(
                    statusValue
                );

            const matchesType =
                typeValue === "all" ||
                normalizeText(
                    booking.facilityType
                ) ===
                normalizeText(
                    typeValue
                );

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        }
    );
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {
    const total =
        bookings.length;

    const pending =
        bookings.filter(
            (booking) =>
                normalizeText(
                    booking.status
                ) === "pending"
        ).length;

    const confirmed =
        bookings.filter(
            (booking) =>
                normalizeText(
                    booking.status
                ) === "confirmed"
        ).length;

    const cancelled =
        bookings.filter(
            (booking) =>
                normalizeText(
                    booking.status
                ) === "cancelled"
        ).length;

    if (totalBookingsCount) {
        totalBookingsCount.textContent =
            total;
    }

    if (pendingBookingsCount) {
        pendingBookingsCount.textContent =
            pending;
    }

    if (confirmedBookingsCount) {
        confirmedBookingsCount.textContent =
            confirmed;
    }

    if (cancelledBookingsCount) {
        cancelledBookingsCount.textContent =
            cancelled;
    }
}

/* =====================================================
   CREATE TABLE ROW
===================================================== */

function createBookingRow(booking) {
    const statusClass =
        normalizeText(
            booking.status
        );

    return `
        <tr>

            <td>
                <strong class="booking-reference">
                    ${escapeHtml(
                        booking.reference
                    )}
                </strong>
            </td>

            <td>
                <div class="guest-cell">

                    <span class="guest-initials">
                        ${escapeHtml(
                            getInitials(
                                booking.customerName
                            )
                        )}
                    </span>

                    <div>

                        <strong>
                            ${escapeHtml(
                                booking.customerName
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                booking.email
                            )}
                        </small>

                    </div>

                </div>
            </td>

            <td>

                <strong>
                    ${escapeHtml(
                        booking.facility
                    )}
                </strong>

                <small class="table-secondary-text">
                    ${escapeHtml(
                        booking.facilityType
                    )}
                </small>

            </td>

            <td>

                <span>
                    ${formatDate(
                        booking.checkIn
                    )}
                </span>

                <small class="table-secondary-text">
                    to
                    ${formatDate(
                        booking.checkOut
                    )}
                </small>

            </td>

            <td>
                ${escapeHtml(
                    booking.guests
                )}
            </td>

            <td>
                <strong>
                    ${formatCurrency(
                        booking.total
                    )}
                </strong>
            </td>

            <td>

                <span
                    class="status-badge ${escapeHtml(
                        statusClass
                    )}"
                >
                    ${escapeHtml(
                        booking.status
                    )}
                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="table-action-button"
                    data-action="view"
                    data-booking-id="${escapeHtml(
                        booking.id
                    )}"
                    title="View booking"
                    aria-label="View booking"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

            </td>

        </tr>
    `;
}

/* =====================================================
   RENDER BOOKINGS
===================================================== */

function renderBookings() {
    if (!bookingTableBody) {
        return;
    }

    const filteredBookings =
        getFilteredBookings();

    const tableWrapper =
        document.querySelector(
            ".table-wrapper"
        );

    if (bookingResultCount) {
        bookingResultCount.textContent =
            filteredBookings.length;
    }

    updateStatistics();

    if (
        filteredBookings.length === 0
    ) {
        bookingTableBody.innerHTML = "";

        if (tableWrapper) {
            tableWrapper.hidden = true;
        }

        if (emptyBookings) {
            emptyBookings.hidden = false;
        }

        if (emptyBookingMessage) {
            emptyBookingMessage.textContent =
                bookings.length === 0
                    ? "No booking records are currently available in the database."
                    : "No bookings match your current search or filters.";
        }

        return;
    }

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyBookings) {
        emptyBookings.hidden = true;
    }

    bookingTableBody.innerHTML =
        filteredBookings
            .map(createBookingRow)
            .join("");
}

/* =====================================================
   FIND BOOKING
===================================================== */

function findBookingById(
    bookingId
) {
    return bookings.find(
        (booking) =>
            String(booking.id) ===
            String(bookingId)
    );
}

/* =====================================================
   OPEN BOOKING DETAILS
===================================================== */

function openBookingDetails(
    bookingId
) {
    const booking =
        findBookingById(
            bookingId
        );

    if (!booking) {
        showToast(
            "Booking could not be found.",
            "error"
        );

        return;
    }

    selectedBookingId =
        String(booking.id);

    if (bookingModalTitle) {
        bookingModalTitle.textContent =
            booking.facility;
    }

    if (modalBookingStatus) {
        modalBookingStatus.textContent =
            booking.status;

        modalBookingStatus.className =
            `modal-status ${normalizeText(
                booking.status
            )}`;
    }

    if (modalBookingReference) {
        modalBookingReference.textContent =
            booking.reference;
    }

    if (modalGuestName) {
        modalGuestName.textContent =
            booking.customerName;
    }

    if (modalGuestEmail) {
        modalGuestEmail.textContent =
            booking.email;
    }

    if (modalGuestPhone) {
        modalGuestPhone.textContent =
            booking.phone;
    }

    if (modalFacilityName) {
        modalFacilityName.textContent =
            booking.facility;
    }

    if (modalFacilityType) {
        modalFacilityType.textContent =
            booking.facilityType;
    }

    if (modalCheckIn) {
        modalCheckIn.textContent =
            formatDate(
                booking.checkIn
            );
    }

    if (modalCheckOut) {
        modalCheckOut.textContent =
            formatDate(
                booking.checkOut
            );
    }

    if (modalGuestCount) {
        modalGuestCount.textContent =
            booking.guests;
    }

    if (modalTotalAmount) {
        modalTotalAmount.textContent =
            formatCurrency(
                booking.total
            );
    }

    if (modalSpecialRequest) {
        modalSpecialRequest.textContent =
            booking.specialRequest;
    }

    if (bookingDetailsModal) {
        bookingDetailsModal.hidden =
            false;
    }

    document.body.style.overflow =
        "hidden";
}

function closeBookingDetails() {
    if (bookingDetailsModal) {
        bookingDetailsModal.hidden =
            true;
    }

    selectedBookingId =
        null;

    document.body.style.overflow =
        "";
}

/* =====================================================
   CREATE UPDATE PAYLOAD
===================================================== */

function createUpdatePayload(
    booking,
    newStatus
) {
    return {
        customer_name:
            booking.customerName,

        email:
            booking.email,

        phone:
            booking.phone,

        room_type:
            booking.facility,

        check_in:
            getDateInputValue(
                booking.checkIn
            ),

        check_out:
            getDateInputValue(
                booking.checkOut
            ),

        guests:
            Number(
                booking.guests
            ),

        total_price:
            Number(
                booking.total
            ),

        status:
            newStatus
    };
}

function getDateInputValue(
    dateValue
) {
    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date
        .toISOString()
        .split("T")[0];
}

/* =====================================================
   UPDATE BOOKING STATUS
===================================================== */

async function updateSelectedBookingStatus(
    newStatus
) {
    if (!selectedBookingId) {
        showToast(
            "Please select a booking first.",
            "error"
        );

        return;
    }

    const booking =
        findBookingById(
            selectedBookingId
        );

    if (!booking) {
        showToast(
            "Booking could not be found.",
            "error"
        );

        return;
    }

    setStatusButtonsDisabled(
        true
    );

    try {
        const payload =
            createUpdatePayload(
                booking,
                newStatus
            );

        await apiRequest(
            `${API_URL}/${booking.id}`,
            {
                method: "PUT",

                body: JSON.stringify(
                    payload
                )
            }
        );

        booking.status =
            newStatus;

        renderBookings();

        openBookingDetails(
            booking.id
        );

        showToast(
            `Booking status changed to ${newStatus}.`,
            "success"
        );

    } catch (error) {
        console.error(
            "Update status error:",
            error
        );

        showToast(
            error.message,
            "error"
        );

    } finally {
        setStatusButtonsDisabled(
            false
        );
    }
}

function setStatusButtonsDisabled(
    disabled
) {
    [
        confirmBookingButton,
        completeBookingButton,
        cancelBookingButton,
        deleteBookingButton
    ].forEach(
        (button) => {
            if (button) {
                button.disabled =
                    disabled;
            }
        }
    );
}

/* =====================================================
   DELETE BOOKING
===================================================== */

async function deleteSelectedBooking() {
    if (!selectedBookingId) {
        showToast(
            "Please select a booking first.",
            "error"
        );

        return;
    }

    const booking =
        findBookingById(
            selectedBookingId
        );

    if (!booking) {
        showToast(
            "Booking could not be found.",
            "error"
        );

        return;
    }

    const shouldDelete =
        window.confirm(
            `Are you sure you want to delete booking ${booking.reference}?`
        );

    if (!shouldDelete) {
        return;
    }

    setStatusButtonsDisabled(
        true
    );

    try {
        await apiRequest(
            `${API_URL}/${booking.id}`,
            {
                method: "DELETE"
            }
        );

        bookings =
            bookings.filter(
                (item) =>
                    String(item.id) !==
                    String(booking.id)
            );

        closeBookingDetails();

        renderBookings();

        showToast(
            "Booking deleted successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Delete booking error:",
            error
        );

        showToast(
            error.message,
            "error"
        );

    } finally {
        setStatusButtonsDisabled(
            false
        );
    }
}

/* =====================================================
   ADD BOOKING MODAL
===================================================== */

function openAddBookingModal() {
    if (!addBookingModal) {
        return;
    }

    if (addBookingForm) {
        addBookingForm.reset();
    }

    if (addBookingMessage) {
        addBookingMessage.textContent =
            "";
    }

    setDefaultBookingDates();

    addBookingModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    window.setTimeout(
        () => {
            newGuestName?.focus();
        },
        100
    );
}

function closeAddBooking() {
    if (addBookingModal) {
        addBookingModal.hidden =
            true;
    }

    if (addBookingMessage) {
        addBookingMessage.textContent =
            "";
    }

    document.body.style.overflow =
        "";
}

/* =====================================================
   DEFAULT DATES
===================================================== */

function setDefaultBookingDates() {
    if (
        !newCheckIn ||
        !newCheckOut
    ) {
        return;
    }

    const today =
        new Date();

    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const todayValue =
        formatDateForInput(
            today
        );

    const tomorrowValue =
        formatDateForInput(
            tomorrow
        );

    newCheckIn.min =
        todayValue;

    newCheckOut.min =
        tomorrowValue;

    newCheckIn.value =
        todayValue;

    newCheckOut.value =
        tomorrowValue;
}

/* =====================================================
   ADD BOOKING VALIDATION
===================================================== */

function validateAddBookingForm() {
    const guestName =
        cleanText(
            newGuestName?.value
        );

    const email =
        cleanText(
            newGuestEmail?.value
        );

    const phone =
        cleanText(
            newGuestPhone?.value
        );

    const facility =
        cleanText(
            newFacilityName?.value
        );

    const guests =
        Number(
            newGuestCount?.value
        );

    const checkIn =
        newCheckIn?.value ||
        "";

    const checkOut =
        newCheckOut?.value ||
        "";

    const total =
        Number(
            newTotalAmount?.value
        );

    if (
        !guestName ||
        !email ||
        !phone ||
        !facility ||
        !checkIn ||
        !checkOut
    ) {
        setAddBookingMessage(
            "Please complete all required fields."
        );

        return false;
    }

    if (!isValidEmail(email)) {
        setAddBookingMessage(
            "Please enter a valid email address."
        );

        return false;
    }

    if (
        Number.isNaN(guests) ||
        guests < 1
    ) {
        setAddBookingMessage(
            "Guest count must be at least 1."
        );

        return false;
    }

    if (
        new Date(checkOut) <=
        new Date(checkIn)
    ) {
        setAddBookingMessage(
            "Check-out date must be after check-in date."
        );

        return false;
    }

    if (
        Number.isNaN(total) ||
        total < 0
    ) {
        setAddBookingMessage(
            "Please enter a valid total amount."
        );

        return false;
    }

    setAddBookingMessage("");

    return true;
}

function setAddBookingMessage(
    message
) {
    if (addBookingMessage) {
        addBookingMessage.textContent =
            message;
    }
}

/* =====================================================
   CREATE BOOKING FROM ADMIN
===================================================== */

async function handleAddBookingSubmit(
    event
) {
    event.preventDefault();

    if (
        !validateAddBookingForm()
    ) {
        return;
    }

    const submitButton =
        addBookingForm?.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.disabled =
            true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;
    }

    const bookingData = {
        customer_name:
            cleanText(
                newGuestName.value
            ),

        email:
            cleanText(
                newGuestEmail.value
            ),

        phone:
            cleanText(
                newGuestPhone.value
            ),

        room_type:
            cleanText(
                newFacilityName.value
            ),

        check_in:
            newCheckIn.value,

        check_out:
            newCheckOut.value,

        guests:
            Number(
                newGuestCount.value
            ),

        total_price:
            Number(
                newTotalAmount.value
            ),

        status:
            "Pending"
    };

    try {
        await apiRequest(
            API_URL,
            {
                method: "POST",

                body: JSON.stringify(
                    bookingData
                )
            }
        );

        closeAddBooking();

        await loadBookings();

        showToast(
            "New booking added successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Create booking error:",
            error
        );

        setAddBookingMessage(
            error.message
        );

        showToast(
            error.message,
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled =
                false;

            submitButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Booking
            `;
        }
    }
}

/* =====================================================
   FILTER FUNCTIONS
===================================================== */

function clearFilters() {
    if (bookingSearch) {
        bookingSearch.value = "";
    }

    if (bookingStatusFilter) {
        bookingStatusFilter.value =
            "all";
    }

    if (bookingTypeFilter) {
        bookingTypeFilter.value =
            "all";
    }

    renderBookings();

    showToast(
        "Booking filters cleared.",
        "success"
    );
}

/* =====================================================
   EXPORT BOOKINGS
===================================================== */

function exportBookings() {
    const filteredBookings =
        getFilteredBookings();

    const exportFile =
        new Blob(
            [
                JSON.stringify(
                    filteredBookings,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const fileUrl =
        URL.createObjectURL(
            exportFile
        );

    const downloadLink =
        document.createElement("a");

    downloadLink.href =
        fileUrl;

    downloadLink.download =
        "willuda-bookings.json";

    document.body.appendChild(
        downloadLink
    );

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(
        fileUrl
    );

    showToast(
        "Booking records exported successfully.",
        "success"
    );
}

/* =====================================================
   TOAST MESSAGE
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
   TABLE ACTIONS
===================================================== */

function handleTableAction(
    event
) {
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
        openBookingDetails(
            bookingId
        );
    }
}

/* =====================================================
   EVENT LISTENERS
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

    bookingSearch?.addEventListener(
        "input",
        renderBookings
    );

    bookingStatusFilter?.addEventListener(
        "change",
        renderBookings
    );

    bookingTypeFilter?.addEventListener(
        "change",
        renderBookings
    );

    clearBookingFilters?.addEventListener(
        "click",
        clearFilters
    );

    bookingTableBody?.addEventListener(
        "click",
        handleTableAction
    );

    exportBookingsButton?.addEventListener(
        "click",
        exportBookings
    );

    addBookingButton?.addEventListener(
        "click",
        openAddBookingModal
    );

    emptyAddBookingButton?.addEventListener(
        "click",
        openAddBookingModal
    );

    closeBookingModal?.addEventListener(
        "click",
        closeBookingDetails
    );

    bookingDetailsModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                bookingDetailsModal
            ) {
                closeBookingDetails();
            }
        }
    );

    confirmBookingButton?.addEventListener(
        "click",
        () =>
            updateSelectedBookingStatus(
                "Confirmed"
            )
    );

    completeBookingButton?.addEventListener(
        "click",
        () =>
            updateSelectedBookingStatus(
                "Completed"
            )
    );

    cancelBookingButton?.addEventListener(
        "click",
        () =>
            updateSelectedBookingStatus(
                "Cancelled"
            )
    );

    deleteBookingButton?.addEventListener(
        "click",
        deleteSelectedBooking
    );

    closeAddBookingModal?.addEventListener(
        "click",
        closeAddBooking
    );

    cancelAddBookingButton?.addEventListener(
        "click",
        closeAddBooking
    );

    addBookingModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                addBookingModal
            ) {
                closeAddBooking();
            }
        }
    );

    addBookingForm?.addEventListener(
        "submit",
        handleAddBookingSubmit
    );

    newCheckIn?.addEventListener(
        "change",
        () => {
            if (
                !newCheckIn.value ||
                !newCheckOut
            ) {
                return;
            }

            const nextDay =
                new Date(
                    `${newCheckIn.value}T00:00:00`
                );

            nextDay.setDate(
                nextDay.getDate() + 1
            );

            const nextDayValue =
                formatDateForInput(
                    nextDay
                );

            newCheckOut.min =
                nextDayValue;

            if (
                !newCheckOut.value ||
                newCheckOut.value <
                    nextDayValue
            ) {
                newCheckOut.value =
                    nextDayValue;
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !== "Escape"
            ) {
                return;
            }

            if (
                bookingDetailsModal &&
                !bookingDetailsModal.hidden
            ) {
                closeBookingDetails();
            }

            if (
                addBookingModal &&
                !addBookingModal.hidden
            ) {
                closeAddBooking();
            }

            closeSidebar();
        }
    );

    window.addEventListener(
        "resize",
        () => {
            if (
                window.innerWidth > 900
            ) {
                closeSidebar();
            }
        }
    );
}

/* =====================================================
   INITIALIZE PAGE
===================================================== */

async function initializeBookingsPage() {
    registerEventListeners();

    setDefaultBookingDates();

    await loadBookings();

    showToast(
        "Booking management loaded successfully.",
        "success"
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializeBookingsPage
);