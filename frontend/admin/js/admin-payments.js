"use strict";

/* =====================================================
   WILLUDA INN - ADMIN PAYMENTS
   Existing Admin Design + Backend API + MySQL
===================================================== */

const API_BASE =
    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.apiBase) ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}`);

const PAYMENT_API_URL = `${API_BASE}/api/payments`;
const CUSTOMER_API_URL = `${API_BASE}/api/customers`;
const BOOKING_API_URL = `${API_BASE}/api/bookings`;

/* =====================================================
   ELEMENTS
===================================================== */

const adminSidebar =
    document.getElementById("adminSidebar");

const sidebarToggleButton =
    document.getElementById("sidebarToggleButton");

const sidebarCloseButton =
    document.getElementById("sidebarCloseButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const paymentSearch =
    document.getElementById("paymentSearch");

const paymentStatusFilter =
    document.getElementById("paymentStatusFilter");

const paymentMethodFilter =
    document.getElementById("paymentMethodFilter");

const clearPaymentFilters =
    document.getElementById("clearPaymentFilters");

const paymentResultCount =
    document.getElementById("paymentResultCount");

const paymentTableBody =
    document.getElementById("paymentTableBody");

const emptyPayments =
    document.getElementById("emptyPayments");

const emptyPaymentMessage =
    document.getElementById("emptyPaymentMessage");

const totalPaymentsCount =
    document.getElementById("totalPaymentsCount");

const paidPaymentsCount =
    document.getElementById("paidPaymentsCount");

const pendingPaymentsCount =
    document.getElementById("pendingPaymentsCount");

const totalCollectedAmount =
    document.getElementById("totalCollectedAmount");

const exportPaymentsButton =
    document.getElementById("exportPaymentsButton");

const addPaymentButton =
    document.getElementById("addPaymentButton");

const emptyAddPaymentButton =
    document.getElementById("emptyAddPaymentButton");

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   DETAILS MODAL
===================================================== */

const paymentDetailsModal =
    document.getElementById("paymentDetailsModal");

const closePaymentDetailsModal =
    document.getElementById("closePaymentDetailsModal");

const paymentDetailsTitle =
    document.getElementById("paymentDetailsTitle");

const detailsPaymentStatus =
    document.getElementById("detailsPaymentStatus");

const detailsTransactionReference =
    document.getElementById("detailsTransactionReference");

const detailsPaymentAmount =
    document.getElementById("detailsPaymentAmount");

const detailsCustomerName =
    document.getElementById("detailsCustomerName");

const detailsCustomerEmail =
    document.getElementById("detailsCustomerEmail");

const detailsBookingName =
    document.getElementById("detailsBookingName");

const detailsBookingDates =
    document.getElementById("detailsBookingDates");

const detailsPaymentMethod =
    document.getElementById("detailsPaymentMethod");

const detailsPaymentDate =
    document.getElementById("detailsPaymentDate");

const detailsPaymentNotes =
    document.getElementById("detailsPaymentNotes");

const editSelectedPaymentButton =
    document.getElementById("editSelectedPaymentButton");

const markPaymentPaidButton =
    document.getElementById("markPaymentPaidButton");

const markPaymentRefundedButton =
    document.getElementById("markPaymentRefundedButton");

const deleteSelectedPaymentButton =
    document.getElementById("deleteSelectedPaymentButton");

/* =====================================================
   FORM MODAL
===================================================== */

const paymentFormModal =
    document.getElementById("paymentFormModal");

const closePaymentFormModal =
    document.getElementById("closePaymentFormModal");

const cancelPaymentFormButton =
    document.getElementById("cancelPaymentFormButton");

const paymentForm =
    document.getElementById("paymentForm");

const paymentFormTitle =
    document.getElementById("paymentFormTitle");

const paymentId =
    document.getElementById("paymentId");

const paymentBooking =
    document.getElementById("paymentBooking");

const paymentCustomer =
    document.getElementById("paymentCustomer");

const paymentAmount =
    document.getElementById("paymentAmount");

const paymentMethod =
    document.getElementById("paymentMethod");

const paymentStatus =
    document.getElementById("paymentStatus");

const paymentDate =
    document.getElementById("paymentDate");

const transactionReference =
    document.getElementById("transactionReference");

const paymentNotes =
    document.getElementById("paymentNotes");

const paymentFormMessage =
    document.getElementById("paymentFormMessage");

const savePaymentButton =
    document.getElementById("savePaymentButton");

/* =====================================================
   STATE
===================================================== */

let payments = [];
let customers = [];
let bookings = [];

let selectedPaymentId = null;
let toastTimer = null;
let loading = false;

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

function parseDateValue(value) {
    if (!value) {
        return null;
    }

    const normalizedValue =
        String(value).replace(
            " ",
            "T"
        );

    const parsedDate =
        new Date(normalizedValue);

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? null
        : parsedDate;
}

function formatDate(value) {
    const date =
        parseDateValue(value);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }
    );
}

function formatDateTime(value) {
    const date =
        parseDateValue(value);

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

function formatDateTimeInput(value) {
    const date =
        parseDateValue(value);

    if (!date) {
        return "";
    }

    const localDate =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() *
                60000
        );

    return localDate
        .toISOString()
        .slice(0, 16);
}

function getPaymentReference(payment) {
    return (
        cleanText(
            payment.transaction_reference
        ) ||
        `WLI-PAY-${String(
            payment.id || 0
        ).padStart(5, "0")}`
    );
}

function getPaymentCustomerName(payment) {
    return (
        cleanText(
            payment.customer_name
        ) ||
        cleanText(
            payment.booking_customer_name
        ) ||
        "Guest"
    );
}

function getPaymentCustomerEmail(payment) {
    return (
        cleanText(
            payment.customer_email
        ) ||
        cleanText(
            payment.booking_email
        ) ||
        "-"
    );
}

function getBookingLabel(payment) {
    if (!payment.booking_id) {
        return "No booking linked";
    }

    const roomType =
        cleanText(payment.room_type) ||
        "Booking";

    return `#${payment.booking_id} · ${roomType}`;
}

function getBookingStay(payment) {
    if (
        !payment.check_in &&
        !payment.check_out
    ) {
        return "-";
    }

    return `${formatDate(
        payment.check_in
    )} — ${formatDate(
        payment.check_out
    )}`;
}

function getPaymentStatus(payment) {
    return (
        cleanText(
            payment.payment_status
        ) ||
        "Pending"
    );
}

function getSelectedPayment() {
    return payments.find(
        (payment) =>
            Number(payment.id) ===
            Number(selectedPaymentId)
    ) || null;
}

function getCurrentDateTimeInput() {
    const date =
        new Date();

    const localDate =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() *
                60000
        );

    return localDate
        .toISOString()
        .slice(0, 16);
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

    if (
        !document.querySelector(
            ".modal-overlay:not([hidden])"
        )
    ) {
        document.body.style.overflow =
            "";
    }
}

/* =====================================================
   API
===================================================== */

async function apiRequest(
    url,
    options = {}
) {
    const response =
        await fetch(
            url,
            options
        );

    let result = {};

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
   LOAD DATA
===================================================== */

function showLoadingState() {
    paymentTableBody.innerHTML = `
        <tr>
            <td colspan="8">
                <div style="
                    padding: 32px;
                    text-align: center;
                ">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading payment records...
                </div>
            </td>
        </tr>
    `;

    emptyPayments.hidden = true;
}

async function loadPaymentPageData() {
    if (loading) {
        return;
    }

    loading = true;
    showLoadingState();

    try {
        const [
            paymentResult,
            customerResult,
            bookingResult
        ] = await Promise.all([
            apiRequest(
                PAYMENT_API_URL
            ),
            apiRequest(
                CUSTOMER_API_URL
            ),
            apiRequest(
                BOOKING_API_URL
            )
        ]);

        payments =
            Array.isArray(
                paymentResult.data
            )
                ? paymentResult.data
                : [];

        customers =
            Array.isArray(
                customerResult.data
            )
                ? customerResult.data
                : [];

        bookings =
            Array.isArray(
                bookingResult.data
            )
                ? bookingResult.data
                : [];

        populateCustomerOptions();
        populateBookingOptions();
        updateStatistics();
        applyFilters();
    } catch (error) {
        console.error(
            "Payment data load error:",
            error
        );

        payments = [];
        customers = [];
        bookings = [];

        paymentTableBody.innerHTML = "";

        emptyPayments.hidden = false;

        emptyPaymentMessage.textContent =
            error.message ===
            "Failed to fetch"
                ? "Cannot connect to the backend. Start the Node.js server."
                : error.message;

        updateStatistics();

        showToast(
            emptyPaymentMessage.textContent,
            "error"
        );
    } finally {
        loading = false;
    }
}

/* =====================================================
   DROPDOWNS
===================================================== */

function populateCustomerOptions() {
    const currentValue =
        paymentCustomer.value;

    paymentCustomer.innerHTML = `
        <option value="">
            Select customer
        </option>
    `;

    const sortedCustomers =
        [...customers].sort(
            (firstCustomer, secondCustomer) =>
                cleanText(
                    firstCustomer.full_name
                ).localeCompare(
                    cleanText(
                        secondCustomer.full_name
                    )
                )
        );

    sortedCustomers.forEach(
        (customer) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                customer.id;

            option.textContent =
                `${customer.full_name || "Customer"} · ${customer.email || "No email"}`;

            paymentCustomer.appendChild(
                option
            );
        }
    );

    paymentCustomer.value =
        currentValue;
}

function populateBookingOptions() {
    const currentValue =
        paymentBooking.value;

    paymentBooking.innerHTML = `
        <option value="">
            Select booking
        </option>
    `;

    const sortedBookings =
        [...bookings].sort(
            (firstBooking, secondBooking) =>
                Number(
                    secondBooking.id || 0
                ) -
                Number(
                    firstBooking.id || 0
                )
        );

    sortedBookings.forEach(
        (booking) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                booking.id;

            option.textContent =
                `#${booking.id} · ${booking.customer_name || "Guest"} · ${booking.room_type || "Facility"}`;

            paymentBooking.appendChild(
                option
            );
        }
    );

    paymentBooking.value =
        currentValue;
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {
    const paidCount =
        payments.filter(
            (payment) =>
                normalizeText(
                    getPaymentStatus(
                        payment
                    )
                ) === "paid"
        ).length;

    const pendingCount =
        payments.filter(
            (payment) => {
                const status =
                    normalizeText(
                        getPaymentStatus(
                            payment
                        )
                    );

                return (
                    status ===
                        "pending" ||
                    status ===
                        "partial"
                );
            }
        ).length;

    const collectedAmount =
        payments.reduce(
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
                    status ===
                        "refunded" ||
                    status ===
                        "failed"
                ) {
                    return currentTotal;
                }

                return (
                    currentTotal +
                    Number(
                        payment.amount || 0
                    )
                );
            },
            0
        );

    totalPaymentsCount.textContent =
        payments.length;

    paidPaymentsCount.textContent =
        paidCount;

    pendingPaymentsCount.textContent =
        pendingCount;

    totalCollectedAmount.textContent =
        formatCurrency(
            collectedAmount
        );
}

/* =====================================================
   FILTER AND RENDER
===================================================== */

function getFilteredPayments() {
    const searchValue =
        normalizeText(
            paymentSearch.value
        );

    const selectedStatus =
        paymentStatusFilter.value;

    const selectedMethod =
        paymentMethodFilter.value;

    return payments.filter(
        (payment) => {
            const searchableText =
                normalizeText(
                    [
                        getPaymentReference(
                            payment
                        ),
                        getPaymentCustomerName(
                            payment
                        ),
                        getPaymentCustomerEmail(
                            payment
                        ),
                        payment.booking_id,
                        payment.room_type,
                        payment.payment_method,
                        getPaymentStatus(
                            payment
                        )
                    ].join(" ")
                );

            const matchesSearch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            const matchesStatus =
                selectedStatus ===
                    "all" ||
                getPaymentStatus(
                    payment
                ) ===
                    selectedStatus;

            const matchesMethod =
                selectedMethod ===
                    "all" ||
                cleanText(
                    payment.payment_method
                ) ===
                    selectedMethod;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesMethod
            );
        }
    );
}

function createPaymentRow(payment) {
    const reference =
        getPaymentReference(
            payment
        );

    const customerName =
        getPaymentCustomerName(
            payment
        );

    const status =
        getPaymentStatus(
            payment
        );

    return `
        <tr>

            <td>

                <div class="transaction-primary">

                    <div class="transaction-icon">
                        <i class="fa-solid fa-receipt"></i>
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(reference)}
                        </strong>

                        <small>
                            Payment #${escapeHtml(
                                payment.id
                            )}
                        </small>

                    </div>

                </div>

            </td>

            <td>

                <strong>
                    ${escapeHtml(customerName)}
                </strong>

                <span class="table-subtext">
                    ${escapeHtml(
                        getPaymentCustomerEmail(
                            payment
                        )
                    )}
                </span>

            </td>

            <td>

                <strong>
                    ${escapeHtml(
                        getBookingLabel(
                            payment
                        )
                    )}
                </strong>

                <span class="table-subtext">
                    ${escapeHtml(
                        getBookingStay(
                            payment
                        )
                    )}
                </span>

            </td>

            <td class="payment-amount">
                ${formatCurrency(
                    payment.amount
                )}
            </td>

            <td>

                <span class="method-badge">
                    ${escapeHtml(
                        payment.payment_method ||
                        "-"
                    )}
                </span>

            </td>

            <td>
                ${escapeHtml(
                    formatDateTime(
                        payment.payment_date ||
                        payment.created_at
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

                <div class="table-actions">

                    <button
                        type="button"
                        class="icon-button"
                        data-payment-action="view"
                        data-payment-id="${escapeHtml(
                            payment.id
                        )}"
                        aria-label="View payment"
                        title="View"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="icon-button"
                        data-payment-action="edit"
                        data-payment-id="${escapeHtml(
                            payment.id
                        )}"
                        aria-label="Edit payment"
                        title="Edit"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="icon-button delete-button"
                        data-payment-action="delete"
                        data-payment-id="${escapeHtml(
                            payment.id
                        )}"
                        aria-label="Delete payment"
                        title="Delete"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </td>

        </tr>
    `;
}

function renderPayments(
    filteredPayments
) {
    paymentResultCount.textContent =
        filteredPayments.length;

    if (
        filteredPayments.length ===
        0
    ) {
        paymentTableBody.innerHTML =
            "";

        emptyPayments.hidden =
            false;

        emptyPaymentMessage.textContent =
            payments.length === 0
                ? "No payment records are currently available."
                : "No payment records match the selected filters.";

        return;
    }

    emptyPayments.hidden =
        true;

    paymentTableBody.innerHTML =
        filteredPayments
            .map(createPaymentRow)
            .join("");
}

function applyFilters() {
    renderPayments(
        getFilteredPayments()
    );
}

/* =====================================================
   MODALS
===================================================== */

function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add(
        "modal-open"
    );
}

function closeModal(modal) {
    modal.hidden = true;

    if (
        !document.querySelector(
            ".modal-overlay:not([hidden])"
        )
    ) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

function openPaymentDetails(
    paymentRecord
) {
    selectedPaymentId =
        paymentRecord.id;

    const status =
        getPaymentStatus(
            paymentRecord
        );

    paymentDetailsTitle.textContent =
        getPaymentReference(
            paymentRecord
        );

    detailsPaymentStatus.textContent =
        status;

    detailsPaymentStatus.className =
        `modal-status ${normalizeText(
            status
        )}`;

    detailsTransactionReference.textContent =
        getPaymentReference(
            paymentRecord
        );

    detailsPaymentAmount.textContent =
        formatCurrency(
            paymentRecord.amount
        );

    detailsCustomerName.textContent =
        getPaymentCustomerName(
            paymentRecord
        );

    detailsCustomerEmail.textContent =
        getPaymentCustomerEmail(
            paymentRecord
        );

    detailsBookingName.textContent =
        getBookingLabel(
            paymentRecord
        );

    detailsBookingDates.textContent =
        getBookingStay(
            paymentRecord
        );

    detailsPaymentMethod.textContent =
        paymentRecord.payment_method ||
        "-";

    detailsPaymentDate.textContent =
        formatDateTime(
            paymentRecord.payment_date ||
            paymentRecord.created_at
        );

    detailsPaymentNotes.textContent =
        paymentRecord.notes ||
        "No notes provided.";

    markPaymentPaidButton.hidden =
        normalizeText(status) ===
        "paid";

    markPaymentRefundedButton.hidden =
        normalizeText(status) ===
        "refunded";

    openModal(
        paymentDetailsModal
    );
}

function resetPaymentForm() {
    paymentForm.reset();

    paymentId.value = "";

    paymentStatus.value =
        "Pending";

    paymentDate.value =
        getCurrentDateTimeInput();

    paymentFormMessage.textContent =
        "";

    savePaymentButton.disabled =
        false;

    savePaymentButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Save Payment
    `;
}

function openAddPaymentForm() {
    selectedPaymentId = null;

    resetPaymentForm();

    paymentFormTitle.textContent =
        "Add Payment";

    openModal(
        paymentFormModal
    );
}

function openEditPaymentForm(
    paymentRecord
) {
    resetPaymentForm();

    selectedPaymentId =
        paymentRecord.id;

    paymentId.value =
        paymentRecord.id;

    paymentFormTitle.textContent =
        "Edit Payment";

    paymentBooking.value =
        paymentRecord.booking_id ||
        "";

    paymentCustomer.value =
        paymentRecord.customer_id ||
        "";

    paymentAmount.value =
        Number(
            paymentRecord.amount || 0
        );

    paymentMethod.value =
        paymentRecord.payment_method ||
        "";

    paymentStatus.value =
        getPaymentStatus(
            paymentRecord
        );

    paymentDate.value =
        formatDateTimeInput(
            paymentRecord.payment_date ||
            paymentRecord.created_at
        );

    transactionReference.value =
        paymentRecord.transaction_reference ||
        "";

    paymentNotes.value =
        paymentRecord.notes ||
        "";

    closeModal(
        paymentDetailsModal
    );

    openModal(
        paymentFormModal
    );
}

/* =====================================================
   FORM
===================================================== */

function matchCustomerFromBooking(
    booking
) {
    if (!booking) {
        return null;
    }

    const bookingEmail =
        normalizeText(
            booking.email
        );

    if (!bookingEmail) {
        return null;
    }

    return (
        customers.find(
            (customer) =>
                normalizeText(
                    customer.email
                ) ===
                bookingEmail
        ) || null
    );
}

function handleBookingSelection() {
    const selectedBooking =
        bookings.find(
            (booking) =>
                Number(booking.id) ===
                Number(
                    paymentBooking.value
                )
        );

    if (!selectedBooking) {
        return;
    }

    if (
        !paymentAmount.value ||
        Number(paymentAmount.value) ===
            0
    ) {
        paymentAmount.value =
            Number(
                selectedBooking.total_price ||
                0
            );
    }

    const matchingCustomer =
        matchCustomerFromBooking(
            selectedBooking
        );

    if (matchingCustomer) {
        paymentCustomer.value =
            matchingCustomer.id;
    }
}

function buildPaymentPayload() {
    return {
        booking_id:
            paymentBooking.value ||
            null,

        customer_id:
            paymentCustomer.value ||
            null,

        amount:
            Number(
                paymentAmount.value
            ),

        payment_method:
            paymentMethod.value,

        payment_status:
            paymentStatus.value,

        payment_date:
            paymentDate.value
                ? paymentDate.value
                    .replace("T", " ") +
                    ":00"
                : null,

        transaction_reference:
            cleanText(
                transactionReference.value
            ),

        notes:
            cleanText(
                paymentNotes.value
            )
    };
}

function validatePaymentForm(
    payload
) {
    if (
        !Number.isFinite(
            payload.amount
        ) ||
        payload.amount < 0
    ) {
        return "Enter a valid payment amount.";
    }

    if (!payload.payment_method) {
        return "Select a payment method.";
    }

    if (!payload.payment_status) {
        return "Select a payment status.";
    }

    return null;
}

async function savePayment(event) {
    event.preventDefault();

    const payload =
        buildPaymentPayload();

    const validationError =
        validatePaymentForm(
            payload
        );

    if (validationError) {
        paymentFormMessage.textContent =
            validationError;

        return;
    }

    const editingId =
        Number(paymentId.value);

    const editing =
        Number.isInteger(editingId) &&
        editingId > 0;

    try {
        savePaymentButton.disabled =
            true;

        savePaymentButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;

        paymentFormMessage.textContent =
            "";

        const result =
            await apiRequest(
                editing
                    ? `${PAYMENT_API_URL}/${editingId}`
                    : PAYMENT_API_URL,
                {
                    method:
                        editing
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        closeModal(
            paymentFormModal
        );

        await loadPaymentPageData();

        showToast(
            result.message ||
            (
                editing
                    ? "Payment updated successfully."
                    : "Payment created successfully."
            ),
            "success"
        );
    } catch (error) {
        console.error(
            "Save payment error:",
            error
        );

        paymentFormMessage.textContent =
            error.message;
    } finally {
        savePaymentButton.disabled =
            false;

        savePaymentButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Save Payment
        `;
    }
}

/* =====================================================
   STATUS AND DELETE
===================================================== */

async function updatePaymentStatus(
    paymentRecord,
    newStatus
) {
    try {
        const result =
            await apiRequest(
                `${PAYMENT_API_URL}/${paymentRecord.id}/status`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            payment_status:
                                newStatus
                        })
                }
            );

        closeModal(
            paymentDetailsModal
        );

        await loadPaymentPageData();

        showToast(
            result.message ||
            "Payment status updated successfully.",
            "success"
        );
    } catch (error) {
        console.error(
            "Payment status error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

async function deletePayment(
    paymentRecord
) {
    const confirmed =
        window.confirm(
            `Delete payment "${getPaymentReference(
                paymentRecord
            )}"?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const result =
            await apiRequest(
                `${PAYMENT_API_URL}/${paymentRecord.id}`,
                {
                    method:
                        "DELETE"
                }
            );

        closeModal(
            paymentDetailsModal
        );

        await loadPaymentPageData();

        showToast(
            result.message ||
            "Payment deleted successfully.",
            "success"
        );
    } catch (error) {
        console.error(
            "Delete payment error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

/* =====================================================
   EXPORT CSV
===================================================== */

function csvCell(value) {
    const text =
        String(value ?? "");

    return `"${text.replaceAll(
        '"',
        '""'
    )}"`;
}

function exportPayments() {
    if (payments.length === 0) {
        showToast(
            "There are no payment records to export.",
            "error"
        );

        return;
    }

    const rows = [
        [
            "Payment ID",
            "Transaction Reference",
            "Customer",
            "Customer Email",
            "Booking ID",
            "Facility",
            "Amount",
            "Payment Method",
            "Payment Status",
            "Payment Date",
            "Notes"
        ],
        ...payments.map(
            (payment) => [
                payment.id,
                getPaymentReference(
                    payment
                ),
                getPaymentCustomerName(
                    payment
                ),
                getPaymentCustomerEmail(
                    payment
                ),
                payment.booking_id ||
                    "",
                payment.room_type ||
                    "",
                Number(
                    payment.amount || 0
                ),
                payment.payment_method ||
                    "",
                getPaymentStatus(
                    payment
                ),
                formatDateTime(
                    payment.payment_date ||
                    payment.created_at
                ),
                payment.notes ||
                    ""
            ]
        )
    ];

    const csvContent =
        rows
            .map(
                (row) =>
                    row
                        .map(csvCell)
                        .join(",")
            )
            .join("\n");

    const blob =
        new Blob(
            [
                "\uFEFF" +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "willuda-payments.csv";

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Payment report exported successfully.",
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

    window.clearTimeout(
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
            3200
        );
}

/* =====================================================
   EVENTS
===================================================== */

function handleTableAction(event) {
    const actionButton =
        event.target.closest(
            "[data-payment-action]"
        );

    if (!actionButton) {
        return;
    }

    const selectedPayment =
        payments.find(
            (payment) =>
                Number(payment.id) ===
                Number(
                    actionButton.dataset
                        .paymentId
                )
        );

    if (!selectedPayment) {
        showToast(
            "Payment record not found.",
            "error"
        );

        return;
    }

    const action =
        actionButton.dataset
            .paymentAction;

    if (action === "view") {
        openPaymentDetails(
            selectedPayment
        );
    }

    if (action === "edit") {
        openEditPaymentForm(
            selectedPayment
        );
    }

    if (action === "delete") {
        deletePayment(
            selectedPayment
        );
    }
}

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

    paymentSearch?.addEventListener(
        "input",
        applyFilters
    );

    paymentStatusFilter?.addEventListener(
        "change",
        applyFilters
    );

    paymentMethodFilter?.addEventListener(
        "change",
        applyFilters
    );

    clearPaymentFilters?.addEventListener(
        "click",
        () => {
            paymentSearch.value =
                "";

            paymentStatusFilter.value =
                "all";

            paymentMethodFilter.value =
                "all";

            applyFilters();
        }
    );

    paymentTableBody?.addEventListener(
        "click",
        handleTableAction
    );

    addPaymentButton?.addEventListener(
        "click",
        openAddPaymentForm
    );

    emptyAddPaymentButton?.addEventListener(
        "click",
        openAddPaymentForm
    );

    exportPaymentsButton?.addEventListener(
        "click",
        exportPayments
    );

    closePaymentDetailsModal?.addEventListener(
        "click",
        () =>
            closeModal(
                paymentDetailsModal
            )
    );

    closePaymentFormModal?.addEventListener(
        "click",
        () =>
            closeModal(
                paymentFormModal
            )
    );

    cancelPaymentFormButton?.addEventListener(
        "click",
        () =>
            closeModal(
                paymentFormModal
            )
    );

    paymentDetailsModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                paymentDetailsModal
            ) {
                closeModal(
                    paymentDetailsModal
                );
            }
        }
    );

    paymentFormModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                paymentFormModal
            ) {
                closeModal(
                    paymentFormModal
                );
            }
        }
    );

    paymentForm?.addEventListener(
        "submit",
        savePayment
    );

    paymentBooking?.addEventListener(
        "change",
        handleBookingSelection
    );

    editSelectedPaymentButton?.addEventListener(
        "click",
        () => {
            const paymentRecord =
                getSelectedPayment();

            if (paymentRecord) {
                openEditPaymentForm(
                    paymentRecord
                );
            }
        }
    );

    markPaymentPaidButton?.addEventListener(
        "click",
        () => {
            const paymentRecord =
                getSelectedPayment();

            if (paymentRecord) {
                updatePaymentStatus(
                    paymentRecord,
                    "Paid"
                );
            }
        }
    );

    markPaymentRefundedButton?.addEventListener(
        "click",
        () => {
            const paymentRecord =
                getSelectedPayment();

            if (paymentRecord) {
                updatePaymentStatus(
                    paymentRecord,
                    "Refunded"
                );
            }
        }
    );

    deleteSelectedPaymentButton?.addEventListener(
        "click",
        () => {
            const paymentRecord =
                getSelectedPayment();

            if (paymentRecord) {
                deletePayment(
                    paymentRecord
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            closeModal(
                paymentDetailsModal
            );

            closeModal(
                paymentFormModal
            );

            closeSidebar();
        }
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
}

/* =====================================================
   INITIALIZE
===================================================== */

async function initializePaymentsPage() {
    registerEventListeners();

    await loadPaymentPageData();

    showToast(
        "Payment records loaded successfully.",
        "success"
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializePaymentsPage
);
