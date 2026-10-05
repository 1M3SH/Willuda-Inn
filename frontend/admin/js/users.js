"use strict";

/* =====================================================
   WILLUDA INN - ADMIN CUSTOMERS
   Backend API + MySQL Version
===================================================== */

const CUSTOMER_API_URL =
    "http://localhost:5000/api/customers";

const BOOKING_API_URL =
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

const customerTableBody =
    document.getElementById("customerTableBody");

const customerSearch =
    document.getElementById("customerSearch");

const customerStatusFilter =
    document.getElementById("customerStatusFilter");

const clearCustomerFilters =
    document.getElementById("clearCustomerFilters");

const customerResultCount =
    document.getElementById("customerResultCount");

const emptyCustomers =
    document.getElementById("emptyCustomers");

const emptyCustomerMessage =
    document.getElementById("emptyCustomerMessage");

const totalCustomersCount =
    document.getElementById("totalCustomersCount");

const activeCustomersCount =
    document.getElementById("activeCustomersCount");

const blockedCustomersCount =
    document.getElementById("blockedCustomersCount");

const customersWithBookingsCount =
    document.getElementById(
        "customersWithBookingsCount"
    );

const exportCustomersButton =
    document.getElementById(
        "exportCustomersButton"
    );

/* =====================================================
   CUSTOMER DETAILS MODAL
===================================================== */

const customerDetailsModal =
    document.getElementById(
        "customerDetailsModal"
    );

const closeCustomerModalButton =
    document.getElementById(
        "closeCustomerModal"
    );

const modalCustomerInitials =
    document.getElementById(
        "modalCustomerInitials"
    );

const customerModalTitle =
    document.getElementById(
        "customerModalTitle"
    );

const modalCustomerStatus =
    document.getElementById(
        "modalCustomerStatus"
    );

const modalCustomerEmail =
    document.getElementById(
        "modalCustomerEmail"
    );

const modalCustomerPhone =
    document.getElementById(
        "modalCustomerPhone"
    );

const modalCustomerAddress =
    document.getElementById(
        "modalCustomerAddress"
    );

const modalCustomerCity =
    document.getElementById(
        "modalCustomerCity"
    );

const modalCustomerCountry =
    document.getElementById(
        "modalCustomerCountry"
    );

const modalCustomerJoinedDate =
    document.getElementById(
        "modalCustomerJoinedDate"
    );

const modalCustomerBookings =
    document.getElementById(
        "modalCustomerBookings"
    );

const modalCustomerSpent =
    document.getElementById(
        "modalCustomerSpent"
    );

const toggleCustomerStatusButton =
    document.getElementById(
        "toggleCustomerStatusButton"
    );

const deleteCustomerButton =
    document.getElementById(
        "deleteCustomerButton"
    );

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   APPLICATION STATE
===================================================== */

let customers = [];

let bookings = [];

let selectedCustomerId = null;

let toastTimer = null;

let isLoadingCustomers = false;

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

    adminSidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.add(
        "show"
    );

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

    adminSidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );

    document.body.style.overflow = "";
}

/* =====================================================
   API REQUEST
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
   NORMALIZE CUSTOMER
===================================================== */

function normalizeCustomer(
    databaseCustomer
) {
    const relatedBookings =
        getBookingsForCustomer(
            databaseCustomer.email
        );

    const totalSpent =
        relatedBookings.reduce(
            (
                total,
                booking
            ) => {
                return (
                    total +
                    Number(
                        booking.total_price ||
                        0
                    )
                );
            },
            0
        );

    return {
        id:
            databaseCustomer.id,

        reference:
            `CUS-${String(
                databaseCustomer.id
            ).padStart(5, "0")}`,

        name:
            databaseCustomer.full_name ||
            "Customer",

        email:
            databaseCustomer.email ||
            "-",

        phone:
            databaseCustomer.phone ||
            "-",

        address:
            databaseCustomer.address ||
            "-",

        city:
            databaseCustomer.city ||
            "-",

        country:
            databaseCustomer.country ||
            "Sri Lanka",

        joined:
            databaseCustomer.created_at,

        bookings:
            relatedBookings.length,

        spent:
            totalSpent,

        status:
            databaseCustomer.status ||
            "Active"
    };
}

function getBookingsForCustomer(
    customerEmail
) {
    return bookings.filter(
        (booking) =>
            normalizeText(
                booking.email
            ) ===
            normalizeText(
                customerEmail
            )
    );
}

/* =====================================================
   LOAD BOOKINGS
===================================================== */

async function loadBookings() {
    try {
        const result =
            await apiRequest(
                BOOKING_API_URL
            );

        bookings =
            Array.isArray(result.data)
                ? result.data
                : [];

    } catch (error) {
        console.error(
            "Load bookings error:",
            error
        );

        bookings = [];
    }
}

/* =====================================================
   LOAD CUSTOMERS
===================================================== */

async function loadCustomers() {
    if (isLoadingCustomers) {
        return;
    }

    isLoadingCustomers = true;

    showLoadingRow();

    try {
        await loadBookings();

        const result =
            await apiRequest(
                CUSTOMER_API_URL
            );

        const databaseCustomers =
            Array.isArray(result.data)
                ? result.data
                : [];

        customers =
            databaseCustomers.map(
                normalizeCustomer
            );

        renderCustomers();

    } catch (error) {
        console.error(
            "Load customers error:",
            error
        );

        customers = [];

        renderCustomers();

        showToast(
            error.message ===
                "Failed to fetch"
                ? "Cannot connect to the backend. Run npm run dev."
                : error.message,
            "error"
        );

    } finally {
        isLoadingCustomers = false;
    }
}

function showLoadingRow() {
    if (!customerTableBody) {
        return;
    }

    const tableWrapper =
        document.querySelector(
            ".table-wrapper"
        );

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyCustomers) {
        emptyCustomers.hidden = true;
    }

    customerTableBody.innerHTML = `
        <tr>
            <td colspan="7">
                <div style="
                    padding: 35px;
                    text-align: center;
                ">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading customers...
                </div>
            </td>
        </tr>
    `;
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {
    const total =
        customers.length;

    const active =
        customers.filter(
            (customer) =>
                normalizeText(
                    customer.status
                ) === "active"
        ).length;

    const blocked =
        customers.filter(
            (customer) =>
                normalizeText(
                    customer.status
                ) === "blocked"
        ).length;

    const withBookings =
        customers.filter(
            (customer) =>
                Number(
                    customer.bookings
                ) > 0
        ).length;

    if (totalCustomersCount) {
        totalCustomersCount.textContent =
            total;
    }

    if (activeCustomersCount) {
        activeCustomersCount.textContent =
            active;
    }

    if (blockedCustomersCount) {
        blockedCustomersCount.textContent =
            blocked;
    }

    if (customersWithBookingsCount) {
        customersWithBookingsCount.textContent =
            withBookings;
    }
}

/* =====================================================
   FILTER CUSTOMERS
===================================================== */

function getFilteredCustomers() {
    const searchValue =
        normalizeText(
            customerSearch?.value
        );

    const selectedStatus =
        customerStatusFilter?.value ||
        "all";

    return customers.filter(
        (customer) => {
            const searchableText = [
                customer.reference,
                customer.id,
                customer.name,
                customer.email,
                customer.phone,
                customer.address,
                customer.city,
                customer.country
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            const matchesStatus =
                selectedStatus === "all" ||
                normalizeText(
                    customer.status
                ) ===
                normalizeText(
                    selectedStatus
                );

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );
}

/* =====================================================
   CREATE CUSTOMER ROW
===================================================== */

function createCustomerRow(
    customer
) {
    const statusClass =
        normalizeText(
            customer.status
        );

    return `
        <tr>

            <td>

                <div class="customer-cell">

                    <div class="customer-avatar">
                        ${escapeHtml(
                            getInitials(
                                customer.name
                            )
                        )}
                    </div>

                    <div>

                        <span class="customer-name">
                            ${escapeHtml(
                                customer.name
                            )}
                        </span>

                        <span class="customer-email">
                            ${escapeHtml(
                                customer.email
                            )}
                        </span>

                    </div>

                </div>

            </td>

            <td>
                ${escapeHtml(
                    customer.phone
                )}
            </td>

            <td>
                <strong>
                    ${Number(
                        customer.bookings
                    ) || 0}
                </strong>
            </td>

            <td>
                <strong>
                    ${formatCurrency(
                        customer.spent
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
                        customer.status
                    )}
                </span>

            </td>

            <td>
                ${formatDate(
                    customer.joined
                )}
            </td>

            <td>

                <button
                    type="button"
                    class="table-action-button"
                    data-action="view"
                    data-customer-id="${escapeHtml(
                        customer.id
                    )}"
                    title="View customer"
                    aria-label="View customer"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

            </td>

        </tr>
    `;
}

/* =====================================================
   RENDER CUSTOMERS
===================================================== */

function renderCustomers() {
    if (!customerTableBody) {
        return;
    }

    const filteredCustomers =
        getFilteredCustomers();

    const tableWrapper =
        document.querySelector(
            ".table-wrapper"
        );

    if (customerResultCount) {
        customerResultCount.textContent =
            filteredCustomers.length;
    }

    updateStatistics();

    if (
        filteredCustomers.length === 0
    ) {
        customerTableBody.innerHTML = "";

        if (tableWrapper) {
            tableWrapper.hidden = true;
        }

        if (emptyCustomers) {
            emptyCustomers.hidden = false;
        }

        if (emptyCustomerMessage) {
            emptyCustomerMessage.textContent =
                customers.length === 0
                    ? "No customer records are currently available in the database."
                    : "No customers match your current search or status filter.";
        }

        return;
    }

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyCustomers) {
        emptyCustomers.hidden = true;
    }

    customerTableBody.innerHTML =
        filteredCustomers
            .map(createCustomerRow)
            .join("");
}

/* =====================================================
   FIND CUSTOMER
===================================================== */

function findCustomerById(
    customerId
) {
    return customers.find(
        (customer) =>
            String(customer.id) ===
            String(customerId)
    );
}

/* =====================================================
   OPEN CUSTOMER MODAL
===================================================== */

function openCustomerModal(
    customerId
) {
    const customer =
        findCustomerById(
            customerId
        );

    if (!customer) {
        showToast(
            "Customer could not be found.",
            "error"
        );

        return;
    }

    selectedCustomerId =
        String(customer.id);

    if (modalCustomerInitials) {
        modalCustomerInitials.textContent =
            getInitials(
                customer.name
            );
    }

    if (customerModalTitle) {
        customerModalTitle.textContent =
            customer.name;
    }

    if (modalCustomerStatus) {
        modalCustomerStatus.textContent =
            customer.status;

        modalCustomerStatus.className =
            `modal-status ${normalizeText(
                customer.status
            )}`;
    }

    if (modalCustomerEmail) {
        modalCustomerEmail.textContent =
            customer.email;
    }

    if (modalCustomerPhone) {
        modalCustomerPhone.textContent =
            customer.phone;
    }

    if (modalCustomerAddress) {
        modalCustomerAddress.textContent =
            customer.address;
    }

    if (modalCustomerCity) {
        modalCustomerCity.textContent =
            customer.city;
    }

    if (modalCustomerCountry) {
        modalCustomerCountry.textContent =
            customer.country;
    }

    if (modalCustomerJoinedDate) {
        modalCustomerJoinedDate.textContent =
            formatDate(
                customer.joined
            );
    }

    if (modalCustomerBookings) {
        modalCustomerBookings.textContent =
            Number(
                customer.bookings
            ) || 0;
    }

    if (modalCustomerSpent) {
        modalCustomerSpent.textContent =
            formatCurrency(
                customer.spent
            );
    }

    updateStatusButton(
        customer
    );

    if (customerDetailsModal) {
        customerDetailsModal.hidden =
            false;
    }

    document.body.style.overflow =
        "hidden";
}

function updateStatusButton(
    customer
) {
    if (!toggleCustomerStatusButton) {
        return;
    }

    const isBlocked =
        normalizeText(
            customer.status
        ) === "blocked";

    toggleCustomerStatusButton.innerHTML =
        isBlocked
            ? `
                <i class="fa-solid fa-user-check"></i>
                Activate Customer
            `
            : `
                <i class="fa-solid fa-user-lock"></i>
                Block Customer
            `;
}

/* =====================================================
   CLOSE CUSTOMER MODAL
===================================================== */

function closeCustomerDetails() {
    if (customerDetailsModal) {
        customerDetailsModal.hidden =
            true;
    }

    selectedCustomerId = null;

    document.body.style.overflow = "";
}

/* =====================================================
   STATUS BUTTON STATE
===================================================== */

function setModalButtonsDisabled(
    disabled
) {
    if (toggleCustomerStatusButton) {
        toggleCustomerStatusButton.disabled =
            disabled;
    }

    if (deleteCustomerButton) {
        deleteCustomerButton.disabled =
            disabled;
    }
}

/* =====================================================
   UPDATE CUSTOMER STATUS
===================================================== */

async function toggleSelectedCustomerStatus() {
    if (!selectedCustomerId) {
        showToast(
            "Please select a customer first.",
            "error"
        );

        return;
    }

    const customer =
        findCustomerById(
            selectedCustomerId
        );

    if (!customer) {
        showToast(
            "Customer could not be found.",
            "error"
        );

        return;
    }

    const currentStatus =
        normalizeText(
            customer.status
        );

    const newStatus =
        currentStatus === "blocked"
            ? "Active"
            : "Blocked";

    const updateData = {
        full_name:
            customer.name,

        email:
            customer.email,

        phone:
            customer.phone,

        address:
            customer.address,

        status:
            newStatus
    };

    setModalButtonsDisabled(
        true
    );

    try {
        await apiRequest(
            `${CUSTOMER_API_URL}/${customer.id}`,
            {
                method: "PUT",

                body: JSON.stringify(
                    updateData
                )
            }
        );

        customer.status =
            newStatus;

        renderCustomers();

        openCustomerModal(
            customer.id
        );

        showToast(
            newStatus === "Active"
                ? "Customer activated successfully."
                : "Customer blocked successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Update customer status error:",
            error
        );

        showToast(
            error.message,
            "error"
        );

    } finally {
        setModalButtonsDisabled(
            false
        );
    }
}

/* =====================================================
   DELETE CUSTOMER
===================================================== */

async function deleteSelectedCustomer() {
    if (!selectedCustomerId) {
        showToast(
            "Please select a customer first.",
            "error"
        );

        return;
    }

    const customer =
        findCustomerById(
            selectedCustomerId
        );

    if (!customer) {
        showToast(
            "Customer could not be found.",
            "error"
        );

        return;
    }

    const shouldDelete =
        window.confirm(
            `Are you sure you want to delete ${customer.name}?`
        );

    if (!shouldDelete) {
        return;
    }

    setModalButtonsDisabled(
        true
    );

    try {
        await apiRequest(
            `${CUSTOMER_API_URL}/${customer.id}`,
            {
                method: "DELETE"
            }
        );

        customers =
            customers.filter(
                (item) =>
                    String(item.id) !==
                    String(customer.id)
            );

        closeCustomerDetails();

        renderCustomers();

        showToast(
            "Customer deleted successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Delete customer error:",
            error
        );

        showToast(
            error.message,
            "error"
        );

    } finally {
        setModalButtonsDisabled(
            false
        );
    }
}

/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {
    if (customerSearch) {
        customerSearch.value = "";
    }

    if (customerStatusFilter) {
        customerStatusFilter.value =
            "all";
    }

    renderCustomers();

    showToast(
        "Customer filters cleared.",
        "success"
    );
}

/* =====================================================
   EXPORT CUSTOMERS
===================================================== */

function exportCustomers() {
    const customersToExport =
        getFilteredCustomers();

    const exportFile =
        new Blob(
            [
                JSON.stringify(
                    customersToExport,
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
        "willuda-customers.json";

    document.body.appendChild(
        downloadLink
    );

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(
        fileUrl
    );

    showToast(
        "Customer records exported successfully.",
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
   TABLE CLICK
===================================================== */

function handleCustomerTableClick(
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

    const customerId =
        actionButton.dataset
            .customerId;

    if (action === "view") {
        openCustomerModal(
            customerId
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

    customerSearch?.addEventListener(
        "input",
        renderCustomers
    );

    customerStatusFilter?.addEventListener(
        "change",
        renderCustomers
    );

    clearCustomerFilters?.addEventListener(
        "click",
        clearFilters
    );

    exportCustomersButton?.addEventListener(
        "click",
        exportCustomers
    );

    customerTableBody?.addEventListener(
        "click",
        handleCustomerTableClick
    );

    closeCustomerModalButton?.addEventListener(
        "click",
        closeCustomerDetails
    );

    toggleCustomerStatusButton?.addEventListener(
        "click",
        toggleSelectedCustomerStatus
    );

    deleteCustomerButton?.addEventListener(
        "click",
        deleteSelectedCustomer
    );

    customerDetailsModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                customerDetailsModal
            ) {
                closeCustomerDetails();
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
                customerDetailsModal &&
                !customerDetailsModal.hidden
            ) {
                closeCustomerDetails();
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
   INITIALIZE
===================================================== */

async function initializeCustomersPage() {
    registerEventListeners();

    await loadCustomers();

    showToast(
        "Customer management loaded successfully.",
        "success"
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializeCustomersPage
);