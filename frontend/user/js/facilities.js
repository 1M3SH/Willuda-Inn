"use strict";

/* =========================================
   WILLUDA INN - FACILITIES PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const facilitiesGrid =
    document.getElementById("facilitiesGrid");

const facilitySearch =
    document.getElementById("facilitySearch");

const facilitySort =
    document.getElementById("facilitySort");

const facilityResultCount =
    document.getElementById("facilityResultCount");

const emptyFacilities =
    document.getElementById("emptyFacilities");

const clearFacilityFilters =
    document.getElementById("clearFacilityFilters");

const emptyClearButton =
    document.getElementById("emptyClearButton");

const categoryFilters =
    document.getElementById("categoryFilters");

const categoryButtons =
    document.querySelectorAll(".filter-button");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const toastMessage =
    document.getElementById("toastMessage");

/* =========================================
   APPLICATION STATE
========================================= */

let selectedCategory = "All";

let toastTimer = null;

/* =========================================
   FACILITY DATA
========================================= */

const facilities = [
    {
        id: 1,
        name: "Deluxe Double Room",
        category: "Room",
        price: 85,
        priceUnit: "per night",
        capacity: 2,
        status: "Available",
        image: "assets/images/deluxe-room.jpg",
        description:
            "An elegant double room designed for comfort, privacy and relaxation.",
        features: [
            "Free Wi-Fi",
            "Air Conditioning",
            "Private Bathroom"
        ]
    },
    {
        id: 2,
        name: "Family Suite",
        category: "Room",
        price: 145,
        priceUnit: "per night",
        capacity: 5,
        status: "Available",
        image: "assets/images/family-suite.jpg",
        description:
            "A spacious family suite with modern facilities for families and groups.",
        features: [
            "Free Wi-Fi",
            "Family Living Area",
            "Private Bathroom"
        ]
    },
    {
        id: 3,
        name: "Grand Wedding Hall",
        category: "Hall",
        price: 850,
        priceUnit: "per event",
        capacity: 300,
        status: "Available",
        image: "assets/images/wedding-hall.jpg",
        description:
            "A luxurious wedding hall suitable for receptions and large celebrations.",
        features: [
            "Stage Area",
            "Dining Space",
            "Sound System"
        ]
    },
    {
        id: 4,
        name: "Conference Hall",
        category: "Event Space",
        price: 450,
        priceUnit: "per event",
        capacity: 120,
        status: "Available",
        image: "assets/images/conference.jpg",
        description:
            "A modern professional conference space for meetings and corporate events.",
        features: [
            "Projector",
            "Sound System",
            "Conference Seating"
        ]
    },
    {
        id: 5,
        name: "Willuda Restaurant",
        category: "Restaurant",
        price: 60,
        priceUnit: "per person",
        capacity: 50,
        status: "Available",
        image: "assets/images/restaurant.jpg",
        description:
            "Enjoy delicious meals and beverages in a comfortable dining environment.",
        features: [
            "Indoor Dining",
            "Food Packages",
            "Table Service"
        ]
    }
];

/* =========================================
   HELPER FUNCTIONS
========================================= */

function cleanText(value) {
    return String(value || "").trim();
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    ).format(amount);
}

function getCategoryIcon(category) {
    const icons = {
        Room: "fa-solid fa-bed",
        Hall: "fa-solid fa-champagne-glasses",
        "Event Space": "fa-solid fa-people-roof",
        Restaurant: "fa-solid fa-utensils"
    };

    return icons[category] || "fa-solid fa-building";
}

/* =========================================
   FILTER AND SORT
========================================= */

function getFilteredFacilities() {
    const searchText =
        cleanText(facilitySearch.value).toLowerCase();

    let filteredFacilities =
        facilities.filter((facility) => {
            const searchableContent = [
                facility.name,
                facility.category,
                facility.description,
                ...facility.features
            ]
                .join(" ")
                .toLowerCase();

            const matchesCategory =
                selectedCategory === "All" ||
                facility.category === selectedCategory;

            const matchesSearch =
                !searchText ||
                searchableContent.includes(searchText);

            return matchesCategory && matchesSearch;
        });

    switch (facilitySort.value) {
        case "price-low":
            filteredFacilities.sort(
                (firstFacility, secondFacility) =>
                    firstFacility.price - secondFacility.price
            );
            break;

        case "price-high":
            filteredFacilities.sort(
                (firstFacility, secondFacility) =>
                    secondFacility.price - firstFacility.price
            );
            break;

        case "capacity-high":
            filteredFacilities.sort(
                (firstFacility, secondFacility) =>
                    secondFacility.capacity -
                    firstFacility.capacity
            );
            break;

        default:
            filteredFacilities.sort(
                (firstFacility, secondFacility) =>
                    firstFacility.id - secondFacility.id
            );
    }

    return filteredFacilities;
}

/* =========================================
   CREATE FACILITY CARD
========================================= */

function createFacilityCard(facility) {
    const featuresHtml =
        facility.features
            .slice(0, 3)
            .map(
                (feature) => `
                    <span class="facility-feature">
                        <i class="fa-solid fa-check"></i>
                        ${escapeHtml(feature)}
                    </span>
                `
            )
            .join("");

    return `
        <article class="facility-card">

            <div class="facility-image">

                <img
                    src="${escapeHtml(facility.image)}"
                    alt="${escapeHtml(facility.name)}"
                    loading="lazy"
                    onerror="this.src='assets/images/home-hero.png'"
                >

                <span class="facility-status">
                    ${escapeHtml(facility.status)}
                </span>

                <span class="facility-image-category">
                    <i class="${getCategoryIcon(
                        facility.category
                    )}"></i>

                    ${escapeHtml(facility.category)}
                </span>

            </div>

            <div class="facility-content">

                <span class="facility-category">
                    ${escapeHtml(facility.category)}
                </span>

                <h3>
                    ${escapeHtml(facility.name)}
                </h3>

                <p class="facility-description">
                    ${escapeHtml(facility.description)}
                </p>

                <div class="facility-features">
                    ${featuresHtml}
                </div>

                <div class="facility-meta">

                    <div class="facility-price-wrapper">

                        <small>Starting From</small>

                        <div class="facility-price">
                            ${formatCurrency(facility.price)}
                        </div>

                        <span>
                            ${escapeHtml(facility.priceUnit)}
                        </span>

                    </div>

                    <div class="facility-capacity">

                        <small>Capacity</small>

                        <strong>
                            <i class="fa-solid fa-users"></i>

                            ${facility.capacity}
                            ${facility.capacity === 1
                                ? "Guest"
                                : "Guests"}
                        </strong>

                    </div>

                </div>

                <div class="facility-buttons">

                    <a
                        href="facility-details.html?id=${encodeURIComponent(
                            facility.id
                        )}"
                        class="view-button"
                    >
                        <i class="fa-regular fa-eye"></i>
                        View Details
                    </a>

                    <a
                        href="booking.html?facility=${encodeURIComponent(
                            facility.id
                        )}"
                        class="book-button"
                    >
                        <i class="fa-solid fa-calendar-check"></i>
                        Book Now
                    </a>

                </div>

            </div>

        </article>
    `;
}

/* =========================================
   RENDER FACILITIES
========================================= */

function renderFacilities() {
    const filteredFacilities =
        getFilteredFacilities();

    facilityResultCount.textContent =
        filteredFacilities.length;

    facilitiesGrid.innerHTML = "";

    if (filteredFacilities.length === 0) {
        facilitiesGrid.hidden = true;
        emptyFacilities.hidden = false;
        return;
    }

    facilitiesGrid.hidden = false;
    emptyFacilities.hidden = true;

    facilitiesGrid.innerHTML =
        filteredFacilities
            .map(createFacilityCard)
            .join("");
}

/* =========================================
   CATEGORY FILTER
========================================= */

function selectCategory(selectedButton) {
    categoryButtons.forEach((button) => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");

    selectedCategory =
        selectedButton.dataset.category || "All";

    renderFacilities();
}

/* =========================================
   CLEAR FILTERS
========================================= */

function clearFilters(showMessage = true) {
    facilitySearch.value = "";

    facilitySort.value = "recommended";

    selectedCategory = "All";

    categoryButtons.forEach((button) => {
        const isAllButton =
            button.dataset.category === "All";

        button.classList.toggle(
            "active",
            isAllButton
        );
    });

    renderFacilities();

    if (showMessage) {
        showToast(
            "Facility filters cleared.",
            "success"
        );
    }
}

/* =========================================
   MOBILE MENU
========================================= */

function toggleMobileMenu() {
    const isMenuHidden =
        mobileMenu.hidden;

    mobileMenu.hidden =
        !isMenuHidden;

    mobileMenuButton.setAttribute(
        "aria-expanded",
        String(isMenuHidden)
    );

    mobileMenuButton.innerHTML =
        isMenuHidden
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
}

function closeMobileMenu() {
    mobileMenu.hidden = true;

    mobileMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileMenuButton.innerHTML =
        '<i class="fa-solid fa-bars"></i>';
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(
    message,
    type = "success"
) {
    if (!toastMessage) {
        return;
    }

    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    toastMessage.className =
        `toast-message ${type} show`;

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove("show");
    }, 3000);
}

/* =========================================
   EVENT HANDLERS
========================================= */

function handleCategoryClick(event) {
    const selectedButton =
        event.target.closest(".filter-button");

    if (!selectedButton) {
        return;
    }

    selectCategory(selectedButton);
}

function handleWindowResize() {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
}

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeFacilitiesPage() {
    clearFilters(false);
}

/* =========================================
   EVENT LISTENERS
========================================= */

facilitySearch.addEventListener(
    "input",
    renderFacilities
);

facilitySort.addEventListener(
    "change",
    renderFacilities
);

categoryFilters.addEventListener(
    "click",
    handleCategoryClick
);

clearFacilityFilters.addEventListener(
    "click",
    () => clearFilters(true)
);

emptyClearButton.addEventListener(
    "click",
    () => clearFilters(true)
);

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener(
        "click",
        toggleMobileMenu
    );

    mobileMenu.addEventListener(
        "click",
        (event) => {
            if (event.target.closest("a")) {
                closeMobileMenu();
            }
        }
    );
}

window.addEventListener(
    "resize",
    handleWindowResize
);

document.addEventListener(
    "DOMContentLoaded",
    initializeFacilitiesPage
);