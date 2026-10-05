"use strict";

/* =====================================================
   WILLUDA INN - ADMIN FACILITIES
   Backend API + MySQL Version
===================================================== */

const FACILITY_API_URL =
    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.facilities) ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api/facilities"
        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}/api/facilities`);

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

const facilityTableBody =
    document.getElementById("facilityTableBody");

const facilitySearch =
    document.getElementById("facilitySearch");

const facilityTypeFilter =
    document.getElementById("facilityTypeFilter");

const facilityStatusFilter =
    document.getElementById("facilityStatusFilter");

const clearFacilityFilters =
    document.getElementById("clearFacilityFilters");

const facilityResultCount =
    document.getElementById("facilityResultCount");

const totalFacilitiesCount =
    document.getElementById("totalFacilitiesCount");

const availableFacilitiesCount =
    document.getElementById("availableFacilitiesCount");

const bookedFacilitiesCount =
    document.getElementById("bookedFacilitiesCount");

const maintenanceFacilitiesCount =
    document.getElementById(
        "maintenanceFacilitiesCount"
    );

const emptyFacilities =
    document.getElementById("emptyFacilities");

const emptyFacilityMessage =
    document.getElementById("emptyFacilityMessage");

const exportFacilitiesButton =
    document.getElementById("exportFacilitiesButton");

const addFacilityButton =
    document.getElementById("addFacilityButton");

const emptyAddFacilityButton =
    document.getElementById("emptyAddFacilityButton");

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   DETAILS MODAL
===================================================== */

const facilityDetailsModal =
    document.getElementById("facilityDetailsModal");

const closeFacilityModal =
    document.getElementById("closeFacilityModal");

const facilityModalTitle =
    document.getElementById("facilityModalTitle");

const modalFacilityStatus =
    document.getElementById("modalFacilityStatus");

const modalFacilityId =
    document.getElementById("modalFacilityId");

const modalFacilityType =
    document.getElementById("modalFacilityType");

const modalFacilityLocation =
    document.getElementById("modalFacilityLocation");

const modalFacilityCapacity =
    document.getElementById("modalFacilityCapacity");

const modalFacilityPrice =
    document.getElementById("modalFacilityPrice");

const modalFacilityStatusText =
    document.getElementById("modalFacilityStatusText");

const modalFacilityDescription =
    document.getElementById("modalFacilityDescription");

const editFacilityButton =
    document.getElementById("editFacilityButton");

const markAvailableButton =
    document.getElementById("markAvailableButton");

const markMaintenanceButton =
    document.getElementById("markMaintenanceButton");

const deleteFacilityButton =
    document.getElementById("deleteFacilityButton");

/* =====================================================
   FORM MODAL
===================================================== */

const facilityFormModal =
    document.getElementById("facilityFormModal");

const closeFacilityFormModal =
    document.getElementById("closeFacilityFormModal");

const cancelFacilityFormButton =
    document.getElementById("cancelFacilityFormButton");

const facilityForm =
    document.getElementById("facilityForm");

const facilityFormTitle =
    document.getElementById("facilityFormTitle");

const facilityNameInput =
    document.getElementById("facilityNameInput");

const facilityTypeInput =
    document.getElementById("facilityTypeInput");

const facilityLocationInput =
    document.getElementById("facilityLocationInput");

const facilityCapacityInput =
    document.getElementById("facilityCapacityInput");

const facilityPriceInput =
    document.getElementById("facilityPriceInput");

const facilityStatusInput =
    document.getElementById("facilityStatusInput");

const facilityDescriptionInput =
    document.getElementById("facilityDescriptionInput");

const facilityFormMessage =
    document.getElementById("facilityFormMessage");

/* =====================================================
   STATE
===================================================== */

let facilities = [];

let selectedFacilityId = null;

let editingFacilityId = null;

let toastTimer = null;

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
    ).format(Number(value) || 0);
}

function normalizeFacility(item) {
    return {
        id: item.id,

        reference:
            `FAC-${String(item.id)
                .padStart(5, "0")}`,

        name:
            item.facility_name ||
            "Facility",

        type:
            item.facility_type ||
            "Room",

        location:
            item.location ||
            "-",

        capacity:
            Number(item.capacity) || 1,

        price:
            Number(item.price) || 0,

        status:
            item.status ||
            "Available",

        description:
            item.description ||
            "No description available."
    };
}

/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {
    adminSidebar?.classList.add("open");
    sidebarOverlay?.classList.add("show");

    document.body.style.overflow =
        "hidden";
}

function closeSidebar() {
    adminSidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("show");

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
            "The server returned an invalid response."
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Request failed."
        );
    }

    return result;
}

/* =====================================================
   LOAD FACILITIES
===================================================== */

async function loadFacilities() {
    showLoadingRow();

    try {
        const result =
            await apiRequest(
                FACILITY_API_URL
            );

        const databaseFacilities =
            Array.isArray(result.data)
                ? result.data
                : [];

        facilities =
            databaseFacilities.map(
                normalizeFacility
            );

        renderFacilities();

    } catch (error) {
        console.error(
            "Load facilities error:",
            error
        );

        facilities = [];

        renderFacilities();

        showToast(
            error.message === "Failed to fetch"
                ? "Cannot connect to backend. Run npm run dev."
                : error.message,
            "error"
        );
    }
}

function showLoadingRow() {
    const tableWrapper =
        document.querySelector(
            ".table-wrapper"
        );

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyFacilities) {
        emptyFacilities.hidden = true;
    }

    if (facilityTableBody) {
        facilityTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div style="
                        padding: 35px;
                        text-align: center;
                    ">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Loading facilities...
                    </div>
                </td>
            </tr>
        `;
    }
}

/* =====================================================
   FILTERING
===================================================== */

function getFilteredFacilities() {
    const searchValue =
        normalizeText(
            facilitySearch?.value
        );

    const selectedType =
        facilityTypeFilter?.value ||
        "all";

    const selectedStatus =
        facilityStatusFilter?.value ||
        "all";

    return facilities.filter(
        (facility) => {
            const searchableText = [
                facility.reference,
                facility.name,
                facility.type,
                facility.location,
                facility.description
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            const matchesType =
                selectedType === "all" ||
                normalizeText(
                    facility.type
                ) ===
                normalizeText(
                    selectedType
                );

            const matchesStatus =
                selectedStatus === "all" ||
                normalizeText(
                    facility.status
                ) ===
                normalizeText(
                    selectedStatus
                );

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );
        }
    );
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {
    const total =
        facilities.length;

    const available =
        facilities.filter(
            (facility) =>
                normalizeText(
                    facility.status
                ) === "available"
        ).length;

    const booked =
        facilities.filter(
            (facility) =>
                normalizeText(
                    facility.status
                ) === "booked"
        ).length;

    const maintenance =
        facilities.filter(
            (facility) =>
                normalizeText(
                    facility.status
                ) === "maintenance"
        ).length;

    if (totalFacilitiesCount) {
        totalFacilitiesCount.textContent =
            total;
    }

    if (availableFacilitiesCount) {
        availableFacilitiesCount.textContent =
            available;
    }

    if (bookedFacilitiesCount) {
        bookedFacilitiesCount.textContent =
            booked;
    }

    if (maintenanceFacilitiesCount) {
        maintenanceFacilitiesCount.textContent =
            maintenance;
    }
}

/* =====================================================
   CREATE TABLE ROW
===================================================== */

function createFacilityRow(facility) {
    const statusClass =
        normalizeText(
            facility.status
        );

    return `
        <tr>

            <td>
                <strong>
                    ${escapeHtml(
                        facility.name
                    )}
                </strong>

                <small class="table-secondary-text">
                    ${escapeHtml(
                        facility.reference
                    )}
                </small>
            </td>

            <td>
                ${escapeHtml(
                    facility.type
                )}
            </td>

            <td>
                ${escapeHtml(
                    facility.location
                )}
            </td>

            <td>
                ${escapeHtml(
                    facility.capacity
                )}
            </td>

            <td>
                <strong>
                    ${formatCurrency(
                        facility.price
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
                        facility.status
                    )}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="table-action-button"
                    data-action="view"
                    data-facility-id="${escapeHtml(
                        facility.id
                    )}"
                    title="View facility"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>
            </td>

        </tr>
    `;
}

/* =====================================================
   RENDER FACILITIES
===================================================== */

function renderFacilities() {
    if (!facilityTableBody) {
        return;
    }

    const filteredFacilities =
        getFilteredFacilities();

    const tableWrapper =
        document.querySelector(
            ".table-wrapper"
        );

    if (facilityResultCount) {
        facilityResultCount.textContent =
            filteredFacilities.length;
    }

    updateStatistics();

    if (
        filteredFacilities.length === 0
    ) {
        facilityTableBody.innerHTML = "";

        if (tableWrapper) {
            tableWrapper.hidden = true;
        }

        if (emptyFacilities) {
            emptyFacilities.hidden = false;
        }

        if (emptyFacilityMessage) {
            emptyFacilityMessage.textContent =
                facilities.length === 0
                    ? "No facilities are currently available in the database."
                    : "No facilities match the current filters.";
        }

        return;
    }

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyFacilities) {
        emptyFacilities.hidden = true;
    }

    facilityTableBody.innerHTML =
        filteredFacilities
            .map(createFacilityRow)
            .join("");
}

/* =====================================================
   FIND FACILITY
===================================================== */

function findFacilityById(id) {
    return facilities.find(
        (facility) =>
            String(facility.id) ===
            String(id)
    );
}

/* =====================================================
   OPEN DETAILS MODAL
===================================================== */

function openFacilityDetails(id) {
    const facility =
        findFacilityById(id);

    if (!facility) {
        showToast(
            "Facility could not be found.",
            "error"
        );

        return;
    }

    selectedFacilityId =
        String(facility.id);

    facilityModalTitle.textContent =
        facility.name;

    modalFacilityStatus.textContent =
        facility.status;

    modalFacilityStatus.className =
        `modal-status ${normalizeText(
            facility.status
        )}`;

    modalFacilityId.textContent =
        facility.reference;

    modalFacilityType.textContent =
        facility.type;

    modalFacilityLocation.textContent =
        facility.location;

    modalFacilityCapacity.textContent =
        facility.capacity;

    modalFacilityPrice.textContent =
        formatCurrency(
            facility.price
        );

    modalFacilityStatusText.textContent =
        facility.status;

    modalFacilityDescription.textContent =
        facility.description;

    facilityDetailsModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}

function closeFacilityDetails() {
    facilityDetailsModal.hidden =
        true;

    selectedFacilityId = null;

    document.body.style.overflow = "";
}

/* =====================================================
   FORM MODAL
===================================================== */

function openAddFacilityModal() {
    editingFacilityId = null;

    facilityForm.reset();

    facilityFormTitle.textContent =
        "Add New Facility";

    facilityStatusInput.value =
        "Available";

    facilityFormMessage.textContent =
        "";

    facilityFormModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    setTimeout(
        () => facilityNameInput.focus(),
        100
    );
}

function openEditFacilityModal() {
    const facility =
        findFacilityById(
            selectedFacilityId
        );

    if (!facility) {
        return;
    }

    editingFacilityId =
        facility.id;

    facilityFormTitle.textContent =
        "Edit Facility";

    facilityNameInput.value =
        facility.name;

    facilityTypeInput.value =
        facility.type;

    facilityLocationInput.value =
        facility.location;

    facilityCapacityInput.value =
        facility.capacity;

    facilityPriceInput.value =
        facility.price;

    facilityStatusInput.value =
        facility.status;

    facilityDescriptionInput.value =
        facility.description;

    facilityFormMessage.textContent =
        "";

    closeFacilityDetails();

    facilityFormModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}

function closeFacilityForm() {
    facilityFormModal.hidden =
        true;

    editingFacilityId = null;

    facilityFormMessage.textContent =
        "";

    document.body.style.overflow = "";
}

/* =====================================================
   VALIDATE FORM
===================================================== */

function validateFacilityForm() {
    if (
        !cleanText(
            facilityNameInput.value
        ) ||
        !facilityTypeInput.value ||
        !cleanText(
            facilityLocationInput.value
        )
    ) {
        facilityFormMessage.textContent =
            "Please complete all required fields.";

        return false;
    }

    if (
        Number(
            facilityCapacityInput.value
        ) < 1
    ) {
        facilityFormMessage.textContent =
            "Capacity must be at least 1.";

        return false;
    }

    if (
        Number(
            facilityPriceInput.value
        ) < 0
    ) {
        facilityFormMessage.textContent =
            "Price cannot be negative.";

        return false;
    }

    facilityFormMessage.textContent = "";

    return true;
}

/* =====================================================
   SUBMIT FORM
===================================================== */

async function handleFacilityFormSubmit(
    event
) {
    event.preventDefault();

    if (!validateFacilityForm()) {
        return;
    }

    const submitButton =
        facilityForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    submitButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;

    const facilityData = {
        facility_name:
            cleanText(
                facilityNameInput.value
            ),

        facility_type:
            facilityTypeInput.value,

        location:
            cleanText(
                facilityLocationInput.value
            ),

        capacity:
            Number(
                facilityCapacityInput.value
            ),

        price:
            Number(
                facilityPriceInput.value
            ),

        status:
            facilityStatusInput.value,

        description:
            cleanText(
                facilityDescriptionInput.value
            )
    };

    try {
        if (editingFacilityId) {
            await apiRequest(
                `${FACILITY_API_URL}/${editingFacilityId}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            facilityData
                        )
                }
            );

            showToast(
                "Facility updated successfully."
            );

        } else {
            await apiRequest(
                FACILITY_API_URL,
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            facilityData
                        )
                }
            );

            showToast(
                "Facility created successfully."
            );
        }

        closeFacilityForm();

        await loadFacilities();

    } catch (error) {
        facilityFormMessage.textContent =
            error.message;

        showToast(
            error.message,
            "error"
        );

    } finally {
        submitButton.disabled = false;

        submitButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Save Facility
        `;
    }
}

/* =====================================================
   UPDATE STATUS
===================================================== */

async function updateFacilityStatus(
    newStatus
) {
    const facility =
        findFacilityById(
            selectedFacilityId
        );

    if (!facility) {
        return;
    }

    try {
        await apiRequest(
            `${FACILITY_API_URL}/${facility.id}`,
            {
                method: "PUT",

                body: JSON.stringify({
                    facility_name:
                        facility.name,

                    facility_type:
                        facility.type,

                    location:
                        facility.location,

                    capacity:
                        facility.capacity,

                    description:
                        facility.description,

                    price:
                        facility.price,

                    status:
                        newStatus
                })
            }
        );

        facility.status =
            newStatus;

        renderFacilities();

        openFacilityDetails(
            facility.id
        );

        showToast(
            `Facility marked as ${newStatus}.`
        );

    } catch (error) {
        showToast(
            error.message,
            "error"
        );
    }
}

/* =====================================================
   DELETE FACILITY
===================================================== */

async function deleteSelectedFacility() {
    const facility =
        findFacilityById(
            selectedFacilityId
        );

    if (!facility) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete ${facility.name}?`
        );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(
            `${FACILITY_API_URL}/${facility.id}`,
            {
                method: "DELETE"
            }
        );

        facilities =
            facilities.filter(
                (item) =>
                    String(item.id) !==
                    String(facility.id)
            );

        closeFacilityDetails();

        renderFacilities();

        showToast(
            "Facility deleted successfully."
        );

    } catch (error) {
        showToast(
            error.message,
            "error"
        );
    }
}

/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {
    facilitySearch.value = "";
    facilityTypeFilter.value = "all";
    facilityStatusFilter.value = "all";

    renderFacilities();

    showToast(
        "Facility filters cleared."
    );
}

/* =====================================================
   EXPORT
===================================================== */

function exportFacilities() {
    const data =
        getFilteredFacilities();

    const file =
        new Blob(
            [
                JSON.stringify(
                    data,
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
        URL.createObjectURL(file);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "willuda-facilities.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast(
        "Facilities exported successfully."
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

    clearTimeout(toastTimer);

    adminToast.textContent =
        message;

    adminToast.className =
        `admin-toast ${type} show`;

    toastTimer =
        setTimeout(() => {
            adminToast.classList.remove(
                "show"
            );
        }, 3000);
}

/* =====================================================
   TABLE CLICK
===================================================== */

function handleTableClick(event) {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) {
        return;
    }

    if (
        button.dataset.action ===
        "view"
    ) {
        openFacilityDetails(
            button.dataset.facilityId
        );
    }
}

/* =====================================================
   EVENTS
===================================================== */

function registerEvents() {
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

    facilitySearch?.addEventListener(
        "input",
        renderFacilities
    );

    facilityTypeFilter?.addEventListener(
        "change",
        renderFacilities
    );

    facilityStatusFilter?.addEventListener(
        "change",
        renderFacilities
    );

    clearFacilityFilters?.addEventListener(
        "click",
        clearFilters
    );

    exportFacilitiesButton?.addEventListener(
        "click",
        exportFacilities
    );

    addFacilityButton?.addEventListener(
        "click",
        openAddFacilityModal
    );

    emptyAddFacilityButton?.addEventListener(
        "click",
        openAddFacilityModal
    );

    facilityTableBody?.addEventListener(
        "click",
        handleTableClick
    );

    closeFacilityModal?.addEventListener(
        "click",
        closeFacilityDetails
    );

    editFacilityButton?.addEventListener(
        "click",
        openEditFacilityModal
    );

    markAvailableButton?.addEventListener(
        "click",
        () =>
            updateFacilityStatus(
                "Available"
            )
    );

    markMaintenanceButton?.addEventListener(
        "click",
        () =>
            updateFacilityStatus(
                "Maintenance"
            )
    );

    deleteFacilityButton?.addEventListener(
        "click",
        deleteSelectedFacility
    );

    closeFacilityFormModal?.addEventListener(
        "click",
        closeFacilityForm
    );

    cancelFacilityFormButton?.addEventListener(
        "click",
        closeFacilityForm
    );

    facilityForm?.addEventListener(
        "submit",
        handleFacilityFormSubmit
    );

    facilityDetailsModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                facilityDetailsModal
            ) {
                closeFacilityDetails();
            }
        }
    );

    facilityFormModal?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                facilityFormModal
            ) {
                closeFacilityForm();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") {
                return;
            }

            closeFacilityDetails();
            closeFacilityForm();
            closeSidebar();
        }
    );
}

/* =====================================================
   INITIALIZE
===================================================== */

async function initializePage() {
    registerEvents();

    await loadFacilities();

    showToast(
        "Facility management loaded successfully."
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);