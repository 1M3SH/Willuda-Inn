"use strict";

/* =========================================
   WILLUDA INN - NOTIFICATIONS PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const sidebarProfileImage =
    document.getElementById("sidebarProfileImage");

const sidebarInitials =
    document.getElementById("sidebarInitials");

const sidebarName =
    document.getElementById("sidebarName");

const sidebarEmail =
    document.getElementById("sidebarEmail");

const sidebarUnreadCount =
    document.getElementById("sidebarUnreadCount");

const markAllReadButton =
    document.getElementById("markAllReadButton");

const totalNotifications =
    document.getElementById("totalNotifications");

const unreadNotifications =
    document.getElementById("unreadNotifications");

const bookingNotifications =
    document.getElementById("bookingNotifications");

const paymentNotifications =
    document.getElementById("paymentNotifications");

const notificationSearch =
    document.getElementById("notificationSearch");

const notificationTypeFilter =
    document.getElementById("notificationTypeFilter");

const notificationStatusFilter =
    document.getElementById("notificationStatusFilter");

const clearNotificationFilters =
    document.getElementById("clearNotificationFilters");

const notificationList =
    document.getElementById("notificationList");

const emptyNotifications =
    document.getElementById("emptyNotifications");

const emptyNotificationMessage =
    document.getElementById("emptyNotificationMessage");

const deleteNotificationModal =
    document.getElementById("deleteNotificationModal");

const closeDeleteModal =
    document.getElementById("closeDeleteModal");

const keepNotificationButton =
    document.getElementById("keepNotificationButton");

const confirmDeleteNotification =
    document.getElementById("confirmDeleteNotification");

const deleteNotificationTitle =
    document.getElementById("deleteNotificationTitle");

const toastMessage =
    document.getElementById("toastMessage");

/* =========================================
   APPLICATION DATA
========================================= */

let notifications = [];

let notificationToDelete = null;

let toastTimer = null;

/* =========================================
   DEFAULT NOTIFICATIONS
========================================= */

function createDefaultNotifications() {
    const now = new Date();

    const oneHourAgo =
        new Date(now.getTime() - 60 * 60 * 1000);

    const fiveHoursAgo =
        new Date(now.getTime() - 5 * 60 * 60 * 1000);

    const oneDayAgo =
        new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const threeDaysAgo =
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    return [
        {
            id: generateNotificationId(),
            type: "Booking",
            title: "Booking Confirmed",
            message:
                "Your reservation at Willuda Inn has been confirmed successfully.",
            createdAt: oneHourAgo.toISOString(),
            isRead: false,
            relatedPage: "my-bookings.html"
        },
        {
            id: generateNotificationId(),
            type: "Payment",
            title: "Payment Pending",
            message:
                "Your booking payment is still pending. Please complete the payment before the due date.",
            createdAt: fiveHoursAgo.toISOString(),
            isRead: false,
            relatedPage: "my-bookings.html"
        },
        {
            id: generateNotificationId(),
            type: "Promotion",
            title: "Weekend Special Offer",
            message:
                "Enjoy a special discount on selected rooms and event facilities this weekend.",
            createdAt: oneDayAgo.toISOString(),
            isRead: true,
            relatedPage: "booking.html"
        },
        {
            id: generateNotificationId(),
            type: "System",
            title: "Profile Updated",
            message:
                "Your profile information has been updated successfully.",
            createdAt: threeDaysAgo.toISOString(),
            isRead: true,
            relatedPage: "profile.html"
        }
    ];
}

/* =========================================
   HELPERS
========================================= */

function cleanText(value) {
    return String(value || "").trim();
}

function generateNotificationId() {
    return `NOT-${Date.now()}-${Math.floor(
        Math.random() * 100000
    )}`;
}

function getInitials(fullName) {
    const name = cleanText(fullName);

    if (!name) {
        return "WI";
    }

    const parts = name
        .split(/\s+/)
        .filter(Boolean);

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

function escapeHtml(value) {
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

function saveNotifications() {
    localStorage.setItem(
        "willudaNotifications",
        JSON.stringify(notifications)
    );
}

function loadNotifications() {
    const storedNotifications =
        localStorage.getItem(
            "willudaNotifications"
        );

    if (!storedNotifications) {
        notifications =
            createDefaultNotifications();

        saveNotifications();
        return;
    }

    try {
        const parsedNotifications =
            JSON.parse(storedNotifications);

        notifications =
            Array.isArray(parsedNotifications)
                ? parsedNotifications
                : [];

    } catch (error) {
        console.error(
            "Unable to load notifications:",
            error
        );

        notifications =
            createDefaultNotifications();

        saveNotifications();
    }
}

/* =========================================
   SIDEBAR PROFILE
========================================= */

function loadSidebarProfile() {
    const storedProfile =
        localStorage.getItem(
            "willudaUserProfile"
        );

    if (!storedProfile) {
        return;
    }

    try {
        const profile =
            JSON.parse(storedProfile);

        const fullName =
            profile.fullName ||
            "Willuda Guest";

        const email =
            profile.email ||
            "guest@willudainn.com";

        sidebarName.textContent =
            fullName;

        sidebarEmail.textContent =
            email;

        if (profile.profileImage) {
            sidebarProfileImage.src =
                profile.profileImage;

            sidebarProfileImage.hidden =
                false;

            sidebarInitials.hidden =
                true;

        } else {
            sidebarProfileImage.src = "";

            sidebarProfileImage.hidden =
                true;

            sidebarInitials.hidden =
                false;

            sidebarInitials.textContent =
                getInitials(fullName);
        }

    } catch (error) {
        console.error(
            "Unable to load profile:",
            error
        );
    }
}

/* =========================================
   DATE FORMATTING
========================================= */

function formatNotificationDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function formatRelativeTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Unknown time";
    }

    const now = new Date();

    const difference =
        now.getTime() - date.getTime();

    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;

    if (difference < minute) {
        return "Just now";
    }

    if (difference < hour) {
        const minutes =
            Math.floor(difference / minute);

        return `${minutes} minute${
            minutes === 1 ? "" : "s"
        } ago`;
    }

    if (difference < day) {
        const hours =
            Math.floor(difference / hour);

        return `${hours} hour${
            hours === 1 ? "" : "s"
        } ago`;
    }

    const days =
        Math.floor(difference / day);

    if (days <= 7) {
        return `${days} day${
            days === 1 ? "" : "s"
        } ago`;
    }

    return formatNotificationDate(
        dateValue
    );
}

/* =========================================
   NOTIFICATION TYPE HELPERS
========================================= */

function getNotificationIcon(type) {
    const icons = {
        Booking:
            "fa-solid fa-calendar-check",

        Payment:
            "fa-solid fa-credit-card",

        Promotion:
            "fa-solid fa-gift",

        System:
            "fa-solid fa-gear"
    };

    return (
        icons[type] ||
        "fa-solid fa-bell"
    );
}

function getTypeClass(type) {
    return String(type || "")
        .toLowerCase();
}

/* =========================================
   FILTERING
========================================= */

function getFilteredNotifications() {
    const searchValue =
        cleanText(
            notificationSearch.value
        ).toLowerCase();

    const selectedType =
        notificationTypeFilter.value;

    const selectedStatus =
        notificationStatusFilter.value;

    return notifications.filter(
        (notification) => {
            const searchableContent = [
                notification.title,
                notification.message,
                notification.type
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableContent.includes(
                    searchValue
                );

            const matchesType =
                selectedType === "all" ||
                notification.type ===
                    selectedType;

            const matchesStatus =
                selectedStatus === "all" ||
                (
                    selectedStatus ===
                        "read" &&
                    notification.isRead
                ) ||
                (
                    selectedStatus ===
                        "unread" &&
                    !notification.isRead
                );

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );
        }
    );
}

/* =========================================
   STATISTICS
========================================= */

function updateNotificationStatistics() {
    const total =
        notifications.length;

    const unread =
        notifications.filter(
            (notification) =>
                !notification.isRead
        ).length;

    const bookingCount =
        notifications.filter(
            (notification) =>
                notification.type ===
                "Booking"
        ).length;

    const paymentCount =
        notifications.filter(
            (notification) =>
                notification.type ===
                "Payment"
        ).length;

    totalNotifications.textContent =
        total;

    unreadNotifications.textContent =
        unread;

    bookingNotifications.textContent =
        bookingCount;

    paymentNotifications.textContent =
        paymentCount;

    sidebarUnreadCount.textContent =
        unread;

    markAllReadButton.disabled =
        unread === 0;
}

/* =========================================
   RENDER NOTIFICATIONS
========================================= */

function renderNotifications() {
    const filteredNotifications =
        getFilteredNotifications();

    notificationList.innerHTML = "";

    updateNotificationStatistics();

    if (
        filteredNotifications.length === 0
    ) {
        notificationList.hidden = true;
        emptyNotifications.hidden = false;

        const filtersAreActive =
            cleanText(
                notificationSearch.value
            ) ||
            notificationTypeFilter.value !==
                "all" ||
            notificationStatusFilter.value !==
                "all";

        emptyNotificationMessage.textContent =
            filtersAreActive
                ? "No notifications match your selected search or filters."
                : "You do not have any notifications at the moment.";

        return;
    }

    notificationList.hidden = false;
    emptyNotifications.hidden = true;

    const sortedNotifications = [
        ...filteredNotifications
    ].sort(
        (firstNotification, secondNotification) =>
            new Date(
                secondNotification.createdAt
            ) -
            new Date(
                firstNotification.createdAt
            )
    );

    sortedNotifications.forEach(
        (notification) => {
            notificationList.insertAdjacentHTML(
                "beforeend",
                createNotificationHtml(
                    notification
                )
            );
        }
    );
}

/* =========================================
   CREATE NOTIFICATION HTML
========================================= */

function createNotificationHtml(
    notification
) {
    const typeClass =
        getTypeClass(
            notification.type
        );

    const unreadClass =
        notification.isRead
            ? ""
            : "unread";

    const readButtonTitle =
        notification.isRead
            ? "Mark as unread"
            : "Mark as read";

    const readButtonIcon =
        notification.isRead
            ? "fa-solid fa-envelope"
            : "fa-solid fa-envelope-open";

    const unreadDot =
        notification.isRead
            ? ""
            : '<span class="unread-dot" aria-label="Unread notification"></span>';

    return `
        <article
            class="notification-item ${unreadClass}"
            data-notification-id="${escapeHtml(
                notification.id
            )}"
        >

            <div
                class="notification-type-icon ${typeClass}"
            >
                <i class="${getNotificationIcon(
                    notification.type
                )}"></i>
            </div>

            <div class="notification-main">

                <div class="notification-topline">

                    <h3>
                        ${escapeHtml(
                            notification.title
                        )}
                    </h3>

                    ${unreadDot}

                </div>

                <p class="notification-message">
                    ${escapeHtml(
                        notification.message
                    )}
                </p>

                <div class="notification-meta">

                    <span
                        class="notification-time"
                        title="${escapeHtml(
                            formatNotificationDate(
                                notification.createdAt
                            )
                        )}"
                    >
                        <i class="fa-regular fa-clock"></i>

                        ${escapeHtml(
                            formatRelativeTime(
                                notification.createdAt
                            )
                        )}
                    </span>

                    <span
                        class="notification-badge ${typeClass}"
                    >
                        ${escapeHtml(
                            notification.type
                        )}
                    </span>

                </div>

            </div>

            <div class="notification-actions">

                ${
                    notification.relatedPage
                        ? `
                            <button
                                type="button"
                                class="notification-action-button open-button"
                                data-action="open"
                                data-notification-id="${escapeHtml(
                                    notification.id
                                )}"
                                title="Open related page"
                                aria-label="Open related page"
                            >
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="notification-action-button read-button"
                    data-action="toggle-read"
                    data-notification-id="${escapeHtml(
                        notification.id
                    )}"
                    title="${readButtonTitle}"
                    aria-label="${readButtonTitle}"
                >
                    <i class="${readButtonIcon}"></i>
                </button>

                <button
                    type="button"
                    class="notification-action-button delete-button"
                    data-action="delete"
                    data-notification-id="${escapeHtml(
                        notification.id
                    )}"
                    title="Delete notification"
                    aria-label="Delete notification"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </article>
    `;
}

/* =========================================
   NOTIFICATION ACTIONS
========================================= */

function findNotificationById(
    notificationId
) {
    return notifications.find(
        (notification) =>
            notification.id ===
            notificationId
    );
}

function toggleNotificationReadStatus(
    notificationId
) {
    const notification =
        findNotificationById(
            notificationId
        );

    if (!notification) {
        return;
    }

    notification.isRead =
        !notification.isRead;

    saveNotifications();
    renderNotifications();

    showToast(
        notification.isRead
            ? "Notification marked as read."
            : "Notification marked as unread.",
        "success"
    );
}

function openRelatedPage(
    notificationId
) {
    const notification =
        findNotificationById(
            notificationId
        );

    if (
        !notification ||
        !notification.relatedPage
    ) {
        showToast(
            "No related page is available.",
            "error"
        );

        return;
    }

    notification.isRead = true;

    saveNotifications();

    window.location.href =
        notification.relatedPage;
}

/* =========================================
   MARK ALL AS READ
========================================= */

function markAllNotificationsAsRead() {
    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.isRead
        ).length;

    if (unreadCount === 0) {
        showToast(
            "All notifications are already read.",
            "success"
        );

        return;
    }

    notifications =
        notifications.map(
            (notification) => ({
                ...notification,
                isRead: true
            })
        );

    saveNotifications();
    renderNotifications();

    showToast(
        "All notifications marked as read.",
        "success"
    );
}

/* =========================================
   DELETE MODAL
========================================= */

function openDeleteModal(
    notificationId
) {
    const notification =
        findNotificationById(
            notificationId
        );

    if (!notification) {
        return;
    }

    notificationToDelete =
        notification.id;

    deleteNotificationTitle.textContent =
        notification.title;

    deleteNotificationModal.hidden =
        false;

    document.body.classList.add(
        "modal-open"
    );

    confirmDeleteNotification.focus();
}

function closeDeleteNotificationModal() {
    deleteNotificationModal.hidden =
        true;

    document.body.classList.remove(
        "modal-open"
    );

    notificationToDelete = null;
}

function deleteSelectedNotification() {
    if (!notificationToDelete) {
        return;
    }

    notifications =
        notifications.filter(
            (notification) =>
                notification.id !==
                notificationToDelete
        );

    saveNotifications();

    closeDeleteNotificationModal();

    renderNotifications();

    showToast(
        "Notification deleted successfully.",
        "success"
    );
}

/* =========================================
   CLEAR FILTERS
========================================= */

function resetNotificationFilters() {
    notificationSearch.value = "";

    notificationTypeFilter.value =
        "all";

    notificationStatusFilter.value =
        "all";

    renderNotifications();

    showToast(
        "Notification filters cleared.",
        "success"
    );
}

/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
) {
    clearTimeout(toastTimer);

    toastMessage.textContent =
        message;

    toastMessage.className =
        `toast-message ${type} show`;

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove(
            "show"
        );
    }, 3000);
}

/* =========================================
   EVENT DELEGATION
========================================= */

function handleNotificationListClick(
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

    const notificationId =
        actionButton.dataset
            .notificationId;

    if (action === "toggle-read") {
        toggleNotificationReadStatus(
            notificationId
        );

        return;
    }

    if (action === "delete") {
        openDeleteModal(
            notificationId
        );

        return;
    }

    if (action === "open") {
        openRelatedPage(
            notificationId
        );
    }
}

/* =========================================
   KEYBOARD HANDLING
========================================= */

function handleKeyboardActions(event) {
    if (
        event.key === "Escape" &&
        !deleteNotificationModal.hidden
    ) {
        closeDeleteNotificationModal();
    }
}

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeNotificationsPage() {
    loadSidebarProfile();
    loadNotifications();
    renderNotifications();
}

/* =========================================
   EVENT LISTENERS
========================================= */

notificationSearch.addEventListener(
    "input",
    renderNotifications
);

notificationTypeFilter.addEventListener(
    "change",
    renderNotifications
);

notificationStatusFilter.addEventListener(
    "change",
    renderNotifications
);

clearNotificationFilters.addEventListener(
    "click",
    resetNotificationFilters
);

markAllReadButton.addEventListener(
    "click",
    markAllNotificationsAsRead
);

notificationList.addEventListener(
    "click",
    handleNotificationListClick
);

closeDeleteModal.addEventListener(
    "click",
    closeDeleteNotificationModal
);

keepNotificationButton.addEventListener(
    "click",
    closeDeleteNotificationModal
);

confirmDeleteNotification.addEventListener(
    "click",
    deleteSelectedNotification
);

deleteNotificationModal.addEventListener(
    "click",
    (event) => {
        if (
            event.target ===
            deleteNotificationModal
        ) {
            closeDeleteNotificationModal();
        }
    }
);

document.addEventListener(
    "keydown",
    handleKeyboardActions
);

document.addEventListener(
    "DOMContentLoaded",
    initializeNotificationsPage
);