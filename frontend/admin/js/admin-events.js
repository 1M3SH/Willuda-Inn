"use strict";

/* =====================================================
   WILLUDA INN - ADMIN EVENTS
   Backend API + MySQL Version
===================================================== */

const API_BASE =
    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.apiBase) ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}`);

const EVENT_API_URL = `${API_BASE}/api/events`;
const CUSTOMER_API_URL = `${API_BASE}/api/customers`;
const FACILITY_API_URL = `${API_BASE}/api/facilities`;

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

const eventSearch =
    document.getElementById("eventSearch");

const eventTypeFilter =
    document.getElementById("eventTypeFilter");

const eventStatusFilter =
    document.getElementById("eventStatusFilter");

const clearEventFilters =
    document.getElementById("clearEventFilters");

const eventResultCount =
    document.getElementById("eventResultCount");

const eventTableBody =
    document.getElementById("eventTableBody");

const emptyEvents =
    document.getElementById("emptyEvents");

const emptyEventMessage =
    document.getElementById("emptyEventMessage");

const totalEventsCount =
    document.getElementById("totalEventsCount");

const plannedEventsCount =
    document.getElementById("plannedEventsCount");

const confirmedEventsCount =
    document.getElementById("confirmedEventsCount");

const completedEventsCount =
    document.getElementById("completedEventsCount");

const exportEventsButton =
    document.getElementById("exportEventsButton");

const addEventButton =
    document.getElementById("addEventButton");

const emptyAddEventButton =
    document.getElementById("emptyAddEventButton");

const adminToast =
    document.getElementById("adminToast");

/* =====================================================
   DETAILS MODAL ELEMENTS
===================================================== */

const eventDetailsModal =
    document.getElementById("eventDetailsModal");

const closeEventDetailsModal =
    document.getElementById("closeEventDetailsModal");

const eventDetailsTitle =
    document.getElementById("eventDetailsTitle");

const detailsEventStatus =
    document.getElementById("detailsEventStatus");

const detailsEventType =
    document.getElementById("detailsEventType");

const detailsCustomerName =
    document.getElementById("detailsCustomerName");

const detailsFacilityName =
    document.getElementById("detailsFacilityName");

const detailsEventDate =
    document.getElementById("detailsEventDate");

const detailsStartTime =
    document.getElementById("detailsStartTime");

const detailsEndTime =
    document.getElementById("detailsEndTime");

const detailsGuestCount =
    document.getElementById("detailsGuestCount");

const detailsTotalAmount =
    document.getElementById("detailsTotalAmount");

const detailsEventNotes =
    document.getElementById("detailsEventNotes");

const editSelectedEventButton =
    document.getElementById("editSelectedEventButton");

const confirmSelectedEventButton =
    document.getElementById("confirmSelectedEventButton");

const completeSelectedEventButton =
    document.getElementById("completeSelectedEventButton");

const cancelSelectedEventButton =
    document.getElementById("cancelSelectedEventButton");

const deleteSelectedEventButton =
    document.getElementById("deleteSelectedEventButton");

/* =====================================================
   FORM MODAL ELEMENTS
===================================================== */

const eventFormModal =
    document.getElementById("eventFormModal");

const closeEventFormModal =
    document.getElementById("closeEventFormModal");

const cancelEventFormButton =
    document.getElementById("cancelEventFormButton");

const eventForm =
    document.getElementById("eventForm");

const eventFormTitle =
    document.getElementById("eventFormTitle");

const eventId =
    document.getElementById("eventId");

const eventName =
    document.getElementById("eventName");

const eventType =
    document.getElementById("eventType");

const eventStatus =
    document.getElementById("eventStatus");

const eventCustomer =
    document.getElementById("eventCustomer");

const eventFacility =
    document.getElementById("eventFacility");

const eventDate =
    document.getElementById("eventDate");

const eventGuestCount =
    document.getElementById("eventGuestCount");

const eventStartTime =
    document.getElementById("eventStartTime");

const eventEndTime =
    document.getElementById("eventEndTime");

const eventTotalAmount =
    document.getElementById("eventTotalAmount");

const eventNotes =
    document.getElementById("eventNotes");

const eventFormMessage =
    document.getElementById("eventFormMessage");

const saveEventButton =
    document.getElementById("saveEventButton");

/* =====================================================
   APPLICATION STATE
===================================================== */

let events = [];
let customers = [];
let facilities = [];

let selectedEventId = null;
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
    ).format(Number(value) || 0);
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const datePart =
        String(dateValue).slice(0, 10);

    const date =
        new Date(`${datePart}T00:00:00`);

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

function formatTime(timeValue) {
    if (!timeValue) {
        return "-";
    }

    const value =
        String(timeValue).slice(0, 5);

    const [hours, minutes] =
        value.split(":").map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return value;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function getEventStatus(eventRecord) {
    return cleanText(
        eventRecord.status || "Planned"
    );
}

function getCustomerName(eventRecord) {
    return cleanText(
        eventRecord.customer_name ||
        customers.find(
            (customer) =>
                Number(customer.id) ===
                Number(eventRecord.customer_id)
        )?.full_name ||
        "Unknown Customer"
    );
}

function getFacilityName(eventRecord) {
    return cleanText(
        eventRecord.facility_name ||
        facilities.find(
            (facility) =>
                Number(facility.id) ===
                Number(eventRecord.facility_id)
        )?.facility_name ||
        "Unknown Facility"
    );
}

/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {
    adminSidebar?.classList.add("open");
    sidebarOverlay?.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    adminSidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("show");
    document.body.style.overflow = "";
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

    window.clearTimeout(toastTimer);

    adminToast.textContent = message;
    adminToast.className =
        `admin-toast ${type} show`;

    toastTimer =
        window.setTimeout(
            function () {
                adminToast.classList.remove(
                    "show"
                );
            },
            3200
        );
}

/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(
    url,
    options = {}
) {
    const requestOptions = {
        ...options,
        headers: {
            "Content-Type":
                "application/json",
            ...(options.headers || {})
        }
    };

    const response =
        await fetch(
            url,
            requestOptions
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

async function loadPageData() {
    if (loading) {
        return;
    }

    loading = true;
    showLoadingRow();

    try {
        const [
            eventResult,
            customerResult,
            facilityResult
        ] = await Promise.all([
            apiRequest(EVENT_API_URL),
            apiRequest(CUSTOMER_API_URL),
            apiRequest(FACILITY_API_URL)
        ]);

        events =
            Array.isArray(eventResult.data)
                ? eventResult.data
                : [];

        customers =
            Array.isArray(customerResult.data)
                ? customerResult.data
                : [];

        facilities =
            Array.isArray(facilityResult.data)
                ? facilityResult.data
                : [];

        populateCustomerOptions();
        populateFacilityOptions();
        populateEventTypeFilter();

        renderPage();

    } catch (error) {
        console.error(
            "Events page load error:",
            error
        );

        events = [];
        customers = [];
        facilities = [];

        renderPage();

        showToast(
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Start node server.js."
                : error.message,
            "error"
        );

    } finally {
        loading = false;
    }
}

function showLoadingRow() {
    if (!eventTableBody) {
        return;
    }

    eventTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="8">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading event records...
            </td>
        </tr>
    `;
}

/* =====================================================
   DROPDOWN OPTIONS
===================================================== */

function populateCustomerOptions() {
    if (!eventCustomer) {
        return;
    }

    const currentValue =
        eventCustomer.value;

    eventCustomer.innerHTML = `
        <option value="">
            Select customer
        </option>
        ${customers
            .map(
                (customer) => `
                    <option value="${Number(customer.id)}">
                        ${escapeHtml(
                            customer.full_name ||
                            `Customer ${customer.id}`
                        )}
                    </option>
                `
            )
            .join("")}
    `;

    eventCustomer.value =
        currentValue;
}

function populateFacilityOptions() {
    if (!eventFacility) {
        return;
    }

    const currentValue =
        eventFacility.value;

    eventFacility.innerHTML = `
        <option value="">
            Select facility
        </option>
        ${facilities
            .map(
                (facility) => `
                    <option value="${Number(facility.id)}">
                        ${escapeHtml(
                            facility.facility_name ||
                            `Facility ${facility.id}`
                        )}
                    </option>
                `
            )
            .join("")}
    `;

    eventFacility.value =
        currentValue;
}

function populateEventTypeFilter() {
    if (!eventTypeFilter) {
        return;
    }

    const currentValue =
        eventTypeFilter.value;

    const types =
        [...new Set(
            events
                .map(
                    (eventRecord) =>
                        cleanText(
                            eventRecord.event_type
                        )
                )
                .filter(Boolean)
        )].sort();

    eventTypeFilter.innerHTML = `
        <option value="all">
            All Event Types
        </option>
        ${types
            .map(
                (type) => `
                    <option value="${escapeHtml(type)}">
                        ${escapeHtml(type)}
                    </option>
                `
            )
            .join("")}
    `;

    eventTypeFilter.value =
        types.includes(currentValue)
            ? currentValue
            : "all";
}

/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {
    const planned =
        events.filter(
            (eventRecord) =>
                normalizeText(
                    getEventStatus(eventRecord)
                ) === "planned"
        ).length;

    const confirmed =
        events.filter(
            (eventRecord) =>
                normalizeText(
                    getEventStatus(eventRecord)
                ) === "confirmed"
        ).length;

    const completed =
        events.filter(
            (eventRecord) =>
                normalizeText(
                    getEventStatus(eventRecord)
                ) === "completed"
        ).length;

    if (totalEventsCount) {
        totalEventsCount.textContent =
            events.length;
    }

    if (plannedEventsCount) {
        plannedEventsCount.textContent =
            planned;
    }

    if (confirmedEventsCount) {
        confirmedEventsCount.textContent =
            confirmed;
    }

    if (completedEventsCount) {
        completedEventsCount.textContent =
            completed;
    }
}

/* =====================================================
   FILTER EVENTS
===================================================== */

function getFilteredEvents() {
    const searchValue =
        normalizeText(eventSearch?.value);

    const typeValue =
        eventTypeFilter?.value || "all";

    const statusValue =
        eventStatusFilter?.value || "all";

    return events.filter(
        (eventRecord) => {
            const searchableText =
                normalizeText(
                    [
                        eventRecord.event_name,
                        eventRecord.event_type,
                        getCustomerName(eventRecord),
                        getFacilityName(eventRecord),
                        eventRecord.notes
                    ].join(" ")
                );

            const matchesSearch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            const matchesType =
                typeValue === "all" ||
                cleanText(
                    eventRecord.event_type
                ) === typeValue;

            const matchesStatus =
                statusValue === "all" ||
                getEventStatus(
                    eventRecord
                ) === statusValue;

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );
        }
    );
}

/* =====================================================
   RENDER TABLE
===================================================== */

function createEventRow(eventRecord) {
    const status =
        getEventStatus(eventRecord);

    const statusClass =
        normalizeText(status);

    const eventDateValue =
        formatDate(
            eventRecord.event_date
        );

    const startTimeValue =
        formatTime(
            eventRecord.start_time
        );

    const endTimeValue =
        formatTime(
            eventRecord.end_time
        );

    return `
        <tr>

            <td>
                <div class="event-primary">

                    <span class="event-icon">
                        <i class="fa-solid fa-champagne-glasses"></i>
                    </span>

                    <div>
                        <strong>
                            ${escapeHtml(
                                eventRecord.event_name ||
                                "Untitled Event"
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                eventRecord.event_type ||
                                "Event"
                            )}
                        </small>
                    </div>

                </div>
            </td>

            <td>
                ${escapeHtml(
                    getCustomerName(
                        eventRecord
                    )
                )}

                <span class="table-subtext">
                    ${escapeHtml(
                        eventRecord.customer_email ||
                        ""
                    )}
                </span>
            </td>

            <td>
                ${escapeHtml(
                    getFacilityName(
                        eventRecord
                    )
                )}

                <span class="table-subtext">
                    ${escapeHtml(
                        eventRecord.location ||
                        eventRecord.facility_type ||
                        ""
                    )}
                </span>
            </td>

            <td>
                ${escapeHtml(eventDateValue)}

                <span class="table-subtext">
                    ${escapeHtml(startTimeValue)}
                    —
                    ${escapeHtml(endTimeValue)}
                </span>
            </td>

            <td>
                ${Number(
                    eventRecord.guest_count
                ) || 0}
            </td>

            <td>
                ${formatCurrency(
                    eventRecord.total_amount
                )}
            </td>

            <td>
                <span
                    class="status-badge ${escapeHtml(
                        statusClass
                    )}"
                >
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <div class="event-actions">

                    <button
                        type="button"
                        class="event-action-button"
                        data-action="view"
                        data-event-id="${Number(
                            eventRecord.id
                        )}"
                        title="View event"
                        aria-label="View event"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="event-action-button"
                        data-action="edit"
                        data-event-id="${Number(
                            eventRecord.id
                        )}"
                        title="Edit event"
                        aria-label="Edit event"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="event-action-button delete"
                        data-action="delete"
                        data-event-id="${Number(
                            eventRecord.id
                        )}"
                        title="Delete event"
                        aria-label="Delete event"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>

        </tr>
    `;
}

function renderEventTable() {
    if (
        !eventTableBody ||
        !emptyEvents
    ) {
        return;
    }

    const filteredEvents =
        getFilteredEvents();

    if (eventResultCount) {
        eventResultCount.textContent =
            filteredEvents.length;
    }

    if (filteredEvents.length === 0) {
        eventTableBody.innerHTML = "";
        emptyEvents.hidden = false;

        if (emptyEventMessage) {
            emptyEventMessage.textContent =
                events.length === 0
                    ? "No event records are currently available."
                    : "No events match the selected filters.";
        }

        return;
    }

    emptyEvents.hidden = true;

    eventTableBody.innerHTML =
        filteredEvents
            .sort(
                (firstEvent, secondEvent) =>
                    String(
                        firstEvent.event_date || ""
                    ).localeCompare(
                        String(
                            secondEvent.event_date || ""
                        )
                    )
            )
            .map(createEventRow)
            .join("");
}

function renderPage() {
    updateStatistics();
    renderEventTable();
}

/* =====================================================
   MODAL HELPERS
===================================================== */

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = false;
    document.body.style.overflow =
        "hidden";
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = true;
    document.body.style.overflow =
        "";
}

function findEventById(eventRecordId) {
    return events.find(
        (eventRecord) =>
            Number(eventRecord.id) ===
            Number(eventRecordId)
    );
}

/* =====================================================
   EVENT DETAILS
===================================================== */

function openEventDetails(
    eventRecordId
) {
    const eventRecord =
        findEventById(
            eventRecordId
        );

    if (!eventRecord) {
        showToast(
            "Event record not found.",
            "error"
        );
        return;
    }

    selectedEventId =
        Number(eventRecord.id);

    const status =
        getEventStatus(eventRecord);

    eventDetailsTitle.textContent =
        eventRecord.event_name ||
        "Event";

    detailsEventStatus.textContent =
        status;

    detailsEventStatus.className =
        `modal-status ${normalizeText(
            status
        )}`;

    detailsEventType.textContent =
        eventRecord.event_type ||
        "-";

    detailsCustomerName.textContent =
        getCustomerName(eventRecord);

    detailsFacilityName.textContent =
        getFacilityName(eventRecord);

    detailsEventDate.textContent =
        formatDate(
            eventRecord.event_date
        );

    detailsStartTime.textContent =
        formatTime(
            eventRecord.start_time
        );

    detailsEndTime.textContent =
        formatTime(
            eventRecord.end_time
        );

    detailsGuestCount.textContent =
        Number(
            eventRecord.guest_count
        ) || 0;

    detailsTotalAmount.textContent =
        formatCurrency(
            eventRecord.total_amount
        );

    detailsEventNotes.textContent =
        eventRecord.notes ||
        "No notes provided.";

    openModal(eventDetailsModal);
}

/* =====================================================
   ADD / EDIT FORM
===================================================== */

function resetEventForm() {
    eventForm?.reset();

    eventId.value = "";
    eventGuestCount.value = "1";
    eventTotalAmount.value = "0";
    eventStatus.value = "Planned";
    eventFormMessage.textContent = "";
}

function openAddEventForm() {
    resetEventForm();

    eventFormTitle.textContent =
        "Add Event";

    saveEventButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Save Event
    `;

    openModal(eventFormModal);
}

function openEditEventForm(
    eventRecordId
) {
    const eventRecord =
        findEventById(
            eventRecordId
        );

    if (!eventRecord) {
        showToast(
            "Event record not found.",
            "error"
        );
        return;
    }

    closeModal(eventDetailsModal);
    resetEventForm();

    eventId.value =
        eventRecord.id;

    eventName.value =
        eventRecord.event_name || "";

    eventType.value =
        eventRecord.event_type || "";

    eventStatus.value =
        getEventStatus(eventRecord);

    eventCustomer.value =
        eventRecord.customer_id || "";

    eventFacility.value =
        eventRecord.facility_id || "";

    eventDate.value =
        String(
            eventRecord.event_date || ""
        ).slice(0, 10);

    eventGuestCount.value =
        Number(
            eventRecord.guest_count
        ) || 1;

    eventStartTime.value =
        String(
            eventRecord.start_time || ""
        ).slice(0, 5);

    eventEndTime.value =
        String(
            eventRecord.end_time || ""
        ).slice(0, 5);

    eventTotalAmount.value =
        Number(
            eventRecord.total_amount
        ) || 0;

    eventNotes.value =
        eventRecord.notes || "";

    eventFormTitle.textContent =
        "Edit Event";

    saveEventButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Event
    `;

    openModal(eventFormModal);
}

function buildEventPayload() {
    return {
        customer_id:
            Number(
                eventCustomer.value
            ) || null,

        facility_id:
            Number(
                eventFacility.value
            ) || null,

        event_name:
            cleanText(
                eventName.value
            ),

        event_type:
            cleanText(
                eventType.value
            ),

        event_date:
            eventDate.value,

        start_time:
            eventStartTime.value ||
            null,

        end_time:
            eventEndTime.value ||
            null,

        guest_count:
            Number(
                eventGuestCount.value
            ) || 1,

        total_amount:
            Number(
                eventTotalAmount.value
            ) || 0,

        status:
            eventStatus.value ||
            "Planned",

        notes:
            cleanText(
                eventNotes.value
            ) || null
    };
}

function validateEventPayload(payload) {
    if (!payload.event_name) {
        return "Event name is required.";
    }

    if (!payload.event_type) {
        return "Event type is required.";
    }

    if (!payload.customer_id) {
        return "Please select a customer.";
    }

    if (!payload.facility_id) {
        return "Please select a facility.";
    }

    if (!payload.event_date) {
        return "Event date is required.";
    }

    if (payload.guest_count < 1) {
        return "Guest count must be at least 1.";
    }

    if (payload.total_amount < 0) {
        return "Total amount cannot be negative.";
    }

    if (
        payload.start_time &&
        payload.end_time &&
        payload.end_time <=
            payload.start_time
    ) {
        return "End time must be later than start time.";
    }

    return null;
}

async function saveEvent(
    submitEvent
) {
    submitEvent.preventDefault();

    const payload =
        buildEventPayload();

    const validationError =
        validateEventPayload(
            payload
        );

    if (validationError) {
        eventFormMessage.textContent =
            validationError;
        return;
    }

    const editingEventId =
        Number(eventId.value) || null;

    const originalButtonHtml =
        saveEventButton.innerHTML;

    try {
        saveEventButton.disabled = true;

        saveEventButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;

        const result =
            await apiRequest(
                editingEventId
                    ? `${EVENT_API_URL}/${editingEventId}`
                    : EVENT_API_URL,
                {
                    method:
                        editingEventId
                            ? "PUT"
                            : "POST",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        closeModal(eventFormModal);

        showToast(
            result.message ||
            (
                editingEventId
                    ? "Event updated successfully."
                    : "Event created successfully."
            ),
            "success"
        );

        await reloadEvents();

    } catch (error) {
        console.error(
            "Save event error:",
            error
        );

        eventFormMessage.textContent =
            error.message;

    } finally {
        saveEventButton.disabled = false;
        saveEventButton.innerHTML =
            originalButtonHtml;
    }
}

/* =====================================================
   RELOAD EVENTS
===================================================== */

async function reloadEvents() {
    const eventResult =
        await apiRequest(
            EVENT_API_URL
        );

    events =
        Array.isArray(
            eventResult.data
        )
            ? eventResult.data
            : [];

    populateEventTypeFilter();
    renderPage();
}

/* =====================================================
   STATUS UPDATE
===================================================== */

async function updateSelectedEventStatus(
    status
) {
    if (!selectedEventId) {
        return;
    }

    try {
        const result =
            await apiRequest(
                `${EVENT_API_URL}/${selectedEventId}/status`,
                {
                    method: "PATCH",
                    body:
                        JSON.stringify({
                            status
                        })
                }
            );

        closeModal(eventDetailsModal);

        showToast(
            result.message ||
            "Event status updated.",
            "success"
        );

        await reloadEvents();

    } catch (error) {
        console.error(
            "Status update error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

/* =====================================================
   DELETE EVENT
===================================================== */

async function deleteEventRecord(
    eventRecordId
) {
    const eventRecord =
        findEventById(
            eventRecordId
        );

    if (!eventRecord) {
        showToast(
            "Event record not found.",
            "error"
        );
        return;
    }

    const confirmed =
        window.confirm(
            `Delete "${eventRecord.event_name}" permanently?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const result =
            await apiRequest(
                `${EVENT_API_URL}/${eventRecordId}`,
                {
                    method: "DELETE"
                }
            );

        closeModal(eventDetailsModal);

        showToast(
            result.message ||
            "Event deleted successfully.",
            "success"
        );

        await reloadEvents();

    } catch (error) {
        console.error(
            "Delete event error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

/* =====================================================
   EXPORT EVENTS
===================================================== */

function escapeCsv(value) {
    const text =
        String(value ?? "");

    return `"${text.replaceAll(
        '"',
        '""'
    )}"`;
}

function exportEvents() {
    if (events.length === 0) {
        showToast(
            "No event records are available to export.",
            "error"
        );
        return;
    }

    const headers = [
        "ID",
        "Event Name",
        "Event Type",
        "Customer",
        "Facility",
        "Event Date",
        "Start Time",
        "End Time",
        "Guest Count",
        "Total Amount",
        "Status",
        "Notes"
    ];

    const rows =
        events.map(
            (eventRecord) => [
                eventRecord.id,
                eventRecord.event_name,
                eventRecord.event_type,
                getCustomerName(eventRecord),
                getFacilityName(eventRecord),
                String(
                    eventRecord.event_date ||
                    ""
                ).slice(0, 10),
                eventRecord.start_time,
                eventRecord.end_time,
                eventRecord.guest_count,
                eventRecord.total_amount,
                getEventStatus(eventRecord),
                eventRecord.notes
            ]
        );

    const csvContent =
        [
            headers,
            ...rows
        ]
            .map(
                (row) =>
                    row
                        .map(escapeCsv)
                        .join(",")
            )
            .join("\n");

    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8"
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
        "willuda-events-report.csv";

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast(
        "Event report exported successfully.",
        "success"
    );
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

    eventSearch?.addEventListener(
        "input",
        renderEventTable
    );

    eventTypeFilter?.addEventListener(
        "change",
        renderEventTable
    );

    eventStatusFilter?.addEventListener(
        "change",
        renderEventTable
    );

    clearEventFilters?.addEventListener(
        "click",
        function () {
            eventSearch.value = "";
            eventTypeFilter.value = "all";
            eventStatusFilter.value = "all";
            renderEventTable();
        }
    );

    addEventButton?.addEventListener(
        "click",
        openAddEventForm
    );

    emptyAddEventButton?.addEventListener(
        "click",
        openAddEventForm
    );

    exportEventsButton?.addEventListener(
        "click",
        exportEvents
    );

    closeEventDetailsModal?.addEventListener(
        "click",
        function () {
            closeModal(
                eventDetailsModal
            );
        }
    );

    closeEventFormModal?.addEventListener(
        "click",
        function () {
            closeModal(
                eventFormModal
            );
        }
    );

    cancelEventFormButton?.addEventListener(
        "click",
        function () {
            closeModal(
                eventFormModal
            );
        }
    );

    eventForm?.addEventListener(
        "submit",
        saveEvent
    );

    eventTableBody?.addEventListener(
        "click",
        function (clickEvent) {
            const actionButton =
                clickEvent.target.closest(
                    "[data-action][data-event-id]"
                );

            if (!actionButton) {
                return;
            }

            const selectedId =
                Number(
                    actionButton.dataset
                        .eventId
                );

            const action =
                actionButton.dataset.action;

            if (action === "view") {
                openEventDetails(
                    selectedId
                );
            }

            if (action === "edit") {
                openEditEventForm(
                    selectedId
                );
            }

            if (action === "delete") {
                deleteEventRecord(
                    selectedId
                );
            }
        }
    );

    editSelectedEventButton?.addEventListener(
        "click",
        function () {
            openEditEventForm(
                selectedEventId
            );
        }
    );

    confirmSelectedEventButton?.addEventListener(
        "click",
        function () {
            updateSelectedEventStatus(
                "Confirmed"
            );
        }
    );

    completeSelectedEventButton?.addEventListener(
        "click",
        function () {
            updateSelectedEventStatus(
                "Completed"
            );
        }
    );

    cancelSelectedEventButton?.addEventListener(
        "click",
        function () {
            updateSelectedEventStatus(
                "Cancelled"
            );
        }
    );

    deleteSelectedEventButton?.addEventListener(
        "click",
        function () {
            deleteEventRecord(
                selectedEventId
            );
        }
    );

    eventDetailsModal?.addEventListener(
        "click",
        function (clickEvent) {
            if (
                clickEvent.target ===
                eventDetailsModal
            ) {
                closeModal(
                    eventDetailsModal
                );
            }
        }
    );

    eventFormModal?.addEventListener(
        "click",
        function (clickEvent) {
            if (
                clickEvent.target ===
                eventFormModal
            ) {
                closeModal(
                    eventFormModal
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        function (keyEvent) {
            if (
                keyEvent.key !== "Escape"
            ) {
                return;
            }

            closeModal(eventDetailsModal);
            closeModal(eventFormModal);
            closeSidebar();
        }
    );

    window.addEventListener(
        "resize",
        function () {
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

async function initializeEventsPage() {
    registerEventListeners();
    await loadPageData();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeEventsPage
);
