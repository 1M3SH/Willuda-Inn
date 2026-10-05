"use strict";

/* =========================================
   WILLUDA INN - FACILITY DETAILS PAGE
========================================= */

/* =========================================
   FACILITY DATA
========================================= */

const facilities = [
    {
        id: 1,
        name: "Deluxe Double Room",
        category: "Room",
        type: "Hotel Room",
        price: 85,
        priceUnit: "per night",
        capacity: 2,
        status: "Available",

        description:
            "An elegant double room designed for comfort, privacy and relaxation.",

        longDescription:
            "The Deluxe Double Room offers a peaceful and comfortable environment for couples, solo travellers and business guests. The room includes a comfortable double bed, private bathroom, air conditioning, free Wi-Fi and modern furniture. Guests can enjoy a relaxing stay with convenient access to the hotel's restaurant, parking area and customer support services.",

        images: [
            "assets/images/deluxe-room.jpg",
            "assets/images/deluxe-room-2.jpg",
            "assets/images/deluxe-room-3.jpg",
            "assets/images/deluxe-room-4.jpg"
        ],

        amenities: [
            {
                name: "Free Wi-Fi",
                icon: "fa-solid fa-wifi"
            },
            {
                name: "Air Conditioning",
                icon: "fa-solid fa-snowflake"
            },
            {
                name: "Private Bathroom",
                icon: "fa-solid fa-bath"
            },
            {
                name: "Double Bed",
                icon: "fa-solid fa-bed"
            },
            {
                name: "Television",
                icon: "fa-solid fa-tv"
            },
            {
                name: "Room Service",
                icon: "fa-solid fa-bell-concierge"
            }
        ],

        rules: [
            "Check-in is available from 2:00 PM.",
            "Check-out must be completed before 11:00 AM.",
            "Smoking is not allowed inside the room.",
            "Pets are not allowed unless approved by management.",
            "Guests must provide valid identification during check-in."
        ]
    },

    {
        id: 2,
        name: "Family Suite",
        category: "Room",
        type: "Family Accommodation",
        price: 145,
        priceUnit: "per night",
        capacity: 5,
        status: "Available",

        description:
            "A spacious family suite with modern facilities for families and small groups.",

        longDescription:
            "The Family Suite provides spacious and comfortable accommodation for families and groups. It includes multiple sleeping areas, a private bathroom, a living area and essential hotel facilities. The suite is ideal for guests who need additional space, privacy and convenience during their stay.",

        images: [
            "assets/images/family-suite.jpg",
            "assets/images/family-suite-2.jpg",
            "assets/images/family-suite-3.jpg",
            "assets/images/family-suite-4.jpg"
        ],

        amenities: [
            {
                name: "Free Wi-Fi",
                icon: "fa-solid fa-wifi"
            },
            {
                name: "Family Living Area",
                icon: "fa-solid fa-couch"
            },
            {
                name: "Private Bathroom",
                icon: "fa-solid fa-bath"
            },
            {
                name: "Air Conditioning",
                icon: "fa-solid fa-snowflake"
            },
            {
                name: "Television",
                icon: "fa-solid fa-tv"
            },
            {
                name: "Mini Refrigerator",
                icon: "fa-solid fa-box"
            }
        ],

        rules: [
            "Check-in is available from 2:00 PM.",
            "Check-out must be completed before 11:00 AM.",
            "The maximum allowed capacity is five guests.",
            "Smoking is not allowed inside the suite.",
            "Children must be supervised by an adult."
        ]
    },

    {
        id: 3,
        name: "Grand Wedding Hall",
        category: "Hall",
        type: "Wedding and Celebration Hall",
        price: 850,
        priceUnit: "per event",
        capacity: 300,
        status: "Available",

        description:
            "A luxurious wedding hall suitable for receptions, celebrations and large events.",

        longDescription:
            "The Grand Wedding Hall is designed for elegant weddings, receptions and special celebrations. The spacious hall provides a stage area, dining arrangements, lighting, sound facilities and sufficient space for decorations. Custom seating arrangements and food packages are available based on the event requirements.",

        images: [
            "assets/images/wedding-hall.jpg",
            "assets/images/wedding-hall-2.jpg",
            "assets/images/wedding-hall-3.jpg",
            "assets/images/wedding-hall-4.jpg"
        ],

        amenities: [
            {
                name: "Stage Area",
                icon: "fa-solid fa-masks-theater"
            },
            {
                name: "Sound System",
                icon: "fa-solid fa-volume-high"
            },
            {
                name: "Dining Space",
                icon: "fa-solid fa-utensils"
            },
            {
                name: "Air Conditioning",
                icon: "fa-solid fa-snowflake"
            },
            {
                name: "Parking Area",
                icon: "fa-solid fa-square-parking"
            },
            {
                name: "Decoration Support",
                icon: "fa-solid fa-wand-magic-sparkles"
            }
        ],

        rules: [
            "Event setup times must be arranged with management.",
            "The maximum allowed capacity is 300 guests.",
            "Outside catering requires prior approval.",
            "All decorations must follow hotel safety regulations.",
            "Any damages caused during the event may result in additional charges."
        ]
    },

    {
        id: 4,
        name: "Conference Hall",
        category: "Event Space",
        type: "Business and Meeting Space",
        price: 450,
        priceUnit: "per event",
        capacity: 120,
        status: "Available",

        description:
            "A modern conference space for business meetings, seminars and corporate events.",

        longDescription:
            "The Conference Hall provides a professional environment for meetings, training sessions, seminars and corporate events. It includes comfortable seating, a projector, sound equipment and internet access. Different seating arrangements can be prepared according to the event requirements.",

        images: [
            "assets/images/conference.jpg",
            "assets/images/conference-2.jpg",
            "assets/images/conference-3.jpg",
            "assets/images/conference-4.jpg"
        ],

        amenities: [
            {
                name: "Projector",
                icon: "fa-solid fa-video"
            },
            {
                name: "Sound System",
                icon: "fa-solid fa-volume-high"
            },
            {
                name: "Free Wi-Fi",
                icon: "fa-solid fa-wifi"
            },
            {
                name: "Conference Seating",
                icon: "fa-solid fa-chair"
            },
            {
                name: "Air Conditioning",
                icon: "fa-solid fa-snowflake"
            },
            {
                name: "Refreshment Service",
                icon: "fa-solid fa-mug-hot"
            }
        ],

        rules: [
            "Booking times must include event setup and closing time.",
            "The maximum capacity is 120 participants.",
            "Equipment must be handled carefully.",
            "Food and drinks are allowed only in approved areas.",
            "Additional technical support may require an extra charge."
        ]
    },

    {
        id: 5,
        name: "Willuda Restaurant",
        category: "Restaurant",
        type: "Dining Facility",
        price: 60,
        priceUnit: "per person",
        capacity: 50,
        status: "Available",

        description:
            "Enjoy delicious meals and beverages in a comfortable dining environment.",

        longDescription:
            "Willuda Restaurant offers a relaxing dining experience with local and international dishes. Guests can choose from different meal packages suitable for individuals, families and small groups. Table reservations and custom food arrangements are available for special occasions.",

        images: [
            "assets/images/restaurant.jpg",
            "assets/images/restaurant-2.jpg",
            "assets/images/restaurant-3.jpg",
            "assets/images/restaurant-4.jpg"
        ],

        amenities: [
            {
                name: "Indoor Dining",
                icon: "fa-solid fa-utensils"
            },
            {
                name: "Table Service",
                icon: "fa-solid fa-bell-concierge"
            },
            {
                name: "Food Packages",
                icon: "fa-solid fa-bowl-food"
            },
            {
                name: "Air Conditioning",
                icon: "fa-solid fa-snowflake"
            },
            {
                name: "Family Seating",
                icon: "fa-solid fa-people-group"
            },
            {
                name: "Free Parking",
                icon: "fa-solid fa-square-parking"
            }
        ],

        rules: [
            "Reservations are recommended during busy periods.",
            "The maximum seating capacity is 50 guests.",
            "Outside food and beverages are not permitted.",
            "Children must be supervised by an adult.",
            "Special food requests must be informed in advance."
        ]
    }
];

/* =========================================
   PAGE ELEMENTS
========================================= */

const detailsContainer =
    document.querySelector(".details-container");

const facilityNotFound =
    document.getElementById("facilityNotFound");

const headerFacilityCategory =
    document.getElementById("headerFacilityCategory");

const headerFacilityName =
    document.getElementById("headerFacilityName");

const headerFacilityDescription =
    document.getElementById("headerFacilityDescription");

const mainFacilityImage =
    document.getElementById("mainFacilityImage");

const facilityAvailability =
    document.getElementById("facilityAvailability");

const thumbnailList =
    document.getElementById("thumbnailList");

const facilityCategory =
    document.getElementById("facilityCategory");

const facilityName =
    document.getElementById("facilityName");

const facilityCapacity =
    document.getElementById("facilityCapacity");

const facilityType =
    document.getElementById("facilityType");

const facilityStatus =
    document.getElementById("facilityStatus");

const facilityQuickPrice =
    document.getElementById("facilityQuickPrice");

const facilityLongDescription =
    document.getElementById("facilityLongDescription");

const facilityAmenities =
    document.getElementById("facilityAmenities");

const facilityRules =
    document.getElementById("facilityRules");

const facilityPrice =
    document.getElementById("facilityPrice");

const facilityPriceUnit =
    document.getElementById("facilityPriceUnit");

const summaryFacilityPrice =
    document.getElementById("summaryFacilityPrice");

const summaryDays =
    document.getElementById("summaryDays");

const summaryTotal =
    document.getElementById("summaryTotal");

const checkInDate =
    document.getElementById("checkInDate");

const checkOutDate =
    document.getElementById("checkOutDate");

const guestCount =
    document.getElementById("guestCount");

const quickBookingForm =
    document.getElementById("quickBookingForm");

const bookingMessage =
    document.getElementById("bookingMessage");

const favoriteButton =
    document.getElementById("favoriteButton");

const relatedFacilitiesGrid =
    document.getElementById("relatedFacilitiesGrid");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const toastMessage =
    document.getElementById("toastMessage");

/* =========================================
   PAGE STATE
========================================= */

let selectedFacility = null;

let toastTimer = null;

/* =========================================
   HELPER FUNCTIONS
========================================= */

function getFacilityIdFromUrl() {
    const urlParameters =
        new URLSearchParams(window.location.search);

    return Number(urlParameters.get("id"));
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

function getNumberOfDays() {
    if (
        !checkInDate.value ||
        !checkOutDate.value
    ) {
        return 1;
    }

    const startDate =
        new Date(`${checkInDate.value}T00:00:00`);

    const endDate =
        new Date(`${checkOutDate.value}T00:00:00`);

    const difference =
        endDate.getTime() -
        startDate.getTime();

    const numberOfDays =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    return numberOfDays > 0
        ? numberOfDays
        : 1;
}

function getPriceMultiplier() {
    if (!selectedFacility) {
        return 1;
    }

    if (
        selectedFacility.priceUnit ===
        "per person"
    ) {
        return Math.max(
            Number(guestCount.value) || 1,
            1
        );
    }

    if (
        selectedFacility.priceUnit ===
        "per event"
    ) {
        return 1;
    }

    return getNumberOfDays();
}

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
   SET DEFAULT DATES
========================================= */

function setDefaultDates() {
    const today =
        new Date();

    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        today.getDate() + 1
    );

    checkInDate.min =
        formatDateForInput(today);

    checkOutDate.min =
        formatDateForInput(tomorrow);

    if (!checkInDate.value) {
        checkInDate.value =
            formatDateForInput(today);
    }

    if (!checkOutDate.value) {
        checkOutDate.value =
            formatDateForInput(tomorrow);
    }
}

/* =========================================
   RENDER THUMBNAILS
========================================= */

function renderThumbnails(facility) {
    thumbnailList.innerHTML =
        facility.images
            .map(
                (image, index) => `
                    <button
                        type="button"
                        class="thumbnail-item ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-image="${image}"
                        aria-label="View facility image ${
                            index + 1
                        }"
                    >
                        <img
                            src="${image}"
                            alt="${facility.name} image ${
                                index + 1
                            }"
                            onerror="this.src='assets/images/home-hero.png'"
                        >
                    </button>
                `
            )
            .join("");
}

/* =========================================
   RENDER AMENITIES
========================================= */

function renderAmenities(facility) {
    facilityAmenities.innerHTML =
        facility.amenities
            .map(
                (amenity) => `
                    <div class="amenity-item">

                        <i class="${amenity.icon}"></i>

                        <span>
                            ${amenity.name}
                        </span>

                    </div>
                `
            )
            .join("");
}

/* =========================================
   RENDER RULES
========================================= */

function renderRules(facility) {
    facilityRules.innerHTML =
        facility.rules
            .map(
                (rule) => `
                    <li>
                        ${rule}
                    </li>
                `
            )
            .join("");
}

/* =========================================
   RENDER RELATED FACILITIES
========================================= */

function renderRelatedFacilities(
    currentFacility
) {
    const relatedFacilities =
        facilities
            .filter(
                (facility) =>
                    facility.id !==
                    currentFacility.id
            )
            .slice(0, 3);

    relatedFacilitiesGrid.innerHTML =
        relatedFacilities
            .map(
                (facility) => `
                    <article class="related-facility-card">

                        <div class="related-facility-image">

                            <img
                                src="${facility.images[0]}"
                                alt="${facility.name}"
                                loading="lazy"
                                onerror="this.src='assets/images/home-hero.png'"
                            >

                        </div>

                        <div class="related-facility-content">

                            <span>
                                ${facility.category}
                            </span>

                            <h3>
                                ${facility.name}
                            </h3>

                            <div class="related-facility-meta">

                                <div>
                                    <i class="fa-solid fa-users"></i>
                                    ${facility.capacity} Guests
                                </div>

                                <strong>
                                    ${formatCurrency(
                                        facility.price
                                    )}
                                </strong>

                            </div>

                            <a
                                href="facility-details.html?id=${facility.id}"
                            >
                                View Facility
                            </a>

                        </div>

                    </article>
                `
            )
            .join("");
}

/* =========================================
   RENDER FACILITY DETAILS
========================================= */

function renderFacilityDetails(facility) {
    document.title =
        `${facility.name} | Willuda Inn`;

    headerFacilityCategory.textContent =
        facility.category;

    headerFacilityName.textContent =
        facility.name;

    headerFacilityDescription.textContent =
        facility.description;

    mainFacilityImage.src =
        facility.images[0];

    mainFacilityImage.alt =
        facility.name;

    facilityAvailability.textContent =
        facility.status;

    facilityCategory.textContent =
        facility.category;

    facilityName.textContent =
        facility.name;

    facilityCapacity.textContent =
        `${facility.capacity} ${
            facility.capacity === 1
                ? "Guest"
                : "Guests"
        }`;

    facilityType.textContent =
        facility.type;

    facilityStatus.textContent =
        facility.status;

    facilityQuickPrice.textContent =
        formatCurrency(facility.price);

    facilityLongDescription.textContent =
        facility.longDescription;

    facilityPrice.textContent =
        formatCurrency(facility.price);

    facilityPriceUnit.textContent =
        facility.priceUnit;

    summaryFacilityPrice.textContent =
        formatCurrency(facility.price);

    guestCount.max =
        facility.capacity;

    renderThumbnails(facility);

    renderAmenities(facility);

    renderRules(facility);

    renderRelatedFacilities(facility);

    updateBookingSummary();
}

/* =========================================
   UPDATE BOOKING SUMMARY
========================================= */

function updateBookingSummary() {
    if (!selectedFacility) {
        return;
    }

    const days =
        getNumberOfDays();

    const multiplier =
        getPriceMultiplier();

    const estimatedTotal =
        selectedFacility.price *
        multiplier;

    summaryFacilityPrice.textContent =
        formatCurrency(
            selectedFacility.price
        );

    summaryDays.textContent =
        selectedFacility.priceUnit ===
        "per night"
            ? days
            : "1";

    summaryTotal.textContent =
        formatCurrency(
            estimatedTotal
        );
}

/* =========================================
   DATE VALIDATION
========================================= */

function handleCheckInChange() {
    if (!checkInDate.value) {
        return;
    }

    const selectedCheckIn =
        new Date(
            `${checkInDate.value}T00:00:00`
        );

    const minimumCheckOut =
        new Date(selectedCheckIn);

    minimumCheckOut.setDate(
        selectedCheckIn.getDate() + 1
    );

    checkOutDate.min =
        formatDateForInput(
            minimumCheckOut
        );

    if (
        !checkOutDate.value ||
        new Date(
            `${checkOutDate.value}T00:00:00`
        ) <= selectedCheckIn
    ) {
        checkOutDate.value =
            formatDateForInput(
                minimumCheckOut
            );
    }

    updateBookingSummary();
}

/* =========================================
   THUMBNAIL CLICK
========================================= */

function handleThumbnailClick(event) {
    const thumbnail =
        event.target.closest(
            ".thumbnail-item"
        );

    if (!thumbnail) {
        return;
    }

    const selectedImage =
        thumbnail.dataset.image;

    mainFacilityImage.src =
        selectedImage;

    document
        .querySelectorAll(
            ".thumbnail-item"
        )
        .forEach((item) => {
            item.classList.remove(
                "active"
            );
        });

    thumbnail.classList.add(
        "active"
    );
}

/* =========================================
   FAVOURITE BUTTON
========================================= */

function toggleFavourite() {
    if (!selectedFacility) {
        return;
    }

    const favouriteKey =
        `willudaFavouriteFacility_${selectedFacility.id}`;

    const isCurrentlyFavourite =
        localStorage.getItem(
            favouriteKey
        ) === "true";

    const newFavouriteState =
        !isCurrentlyFavourite;

    localStorage.setItem(
        favouriteKey,
        String(newFavouriteState)
    );

    favoriteButton.classList.toggle(
        "active",
        newFavouriteState
    );

    favoriteButton.innerHTML =
        newFavouriteState
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

    showToast(
        newFavouriteState
            ? "Facility added to favourites."
            : "Facility removed from favourites.",
        "success"
    );
}

function loadFavouriteState() {
    if (!selectedFacility) {
        return;
    }

    const isFavourite =
        localStorage.getItem(
            `willudaFavouriteFacility_${selectedFacility.id}`
        ) === "true";

    favoriteButton.classList.toggle(
        "active",
        isFavourite
    );

    favoriteButton.innerHTML =
        isFavourite
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';
}

/* =========================================
   QUICK BOOKING FORM
========================================= */

function handleQuickBooking(event) {
    event.preventDefault();

    bookingMessage.textContent = "";
    bookingMessage.classList.remove(
        "success"
    );

    const guests =
        Number(guestCount.value);

    if (
        !checkInDate.value ||
        !checkOutDate.value
    ) {
        bookingMessage.textContent =
            "Please select the required dates.";

        return;
    }

    if (
        guests < 1 ||
        guests >
            selectedFacility.capacity
    ) {
        bookingMessage.textContent =
            `Guest count must be between 1 and ${selectedFacility.capacity}.`;

        return;
    }

    const startDate =
        new Date(
            `${checkInDate.value}T00:00:00`
        );

    const endDate =
        new Date(
            `${checkOutDate.value}T00:00:00`
        );

    if (endDate <= startDate) {
        bookingMessage.textContent =
            "Check-out date must be after the check-in date.";

        return;
    }

    const bookingSelection = {
        facilityId:
            selectedFacility.id,

        facilityName:
            selectedFacility.name,

        facilityCategory:
            selectedFacility.category,

        facilityPrice:
            selectedFacility.price,

        priceUnit:
            selectedFacility.priceUnit,

        checkIn:
            checkInDate.value,

        checkOut:
            checkOutDate.value,

        guests,

        estimatedTotal:
            selectedFacility.price *
            getPriceMultiplier()
    };

    localStorage.setItem(
        "willudaBookingSelection",
        JSON.stringify(
            bookingSelection
        )
    );

    bookingMessage.textContent =
        "Facility selected successfully. Redirecting to booking page...";

    bookingMessage.classList.add(
        "success"
    );

    setTimeout(() => {
        window.location.href =
            `booking.html?facility=${selectedFacility.id}`;
    }, 700);
}

/* =========================================
   MOBILE MENU
========================================= */

function toggleMobileMenu() {
    const isHidden =
        mobileMenu.hidden;

    mobileMenu.hidden =
        !isHidden;

    mobileMenuButton.innerHTML =
        isHidden
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
}

function closeMobileMenu() {
    mobileMenu.hidden = true;

    mobileMenuButton.innerHTML =
        '<i class="fa-solid fa-bars"></i>';
}

/* =========================================
   SHOW NOT FOUND STATE
========================================= */

function showFacilityNotFound() {
    if (detailsContainer) {
        detailsContainer.hidden =
            true;
    }

    facilityNotFound.hidden =
        false;
}

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeFacilityDetailsPage() {
    const facilityId =
        getFacilityIdFromUrl();

    selectedFacility =
        facilities.find(
            (facility) =>
                facility.id ===
                facilityId
        );

    if (!selectedFacility) {
        showFacilityNotFound();
        return;
    }

    setDefaultDates();

    renderFacilityDetails(
        selectedFacility
    );

    loadFavouriteState();
}

/* =========================================
   EVENT LISTENERS
========================================= */

thumbnailList.addEventListener(
    "click",
    handleThumbnailClick
);

checkInDate.addEventListener(
    "change",
    handleCheckInChange
);

checkOutDate.addEventListener(
    "change",
    updateBookingSummary
);

guestCount.addEventListener(
    "input",
    updateBookingSummary
);

favoriteButton.addEventListener(
    "click",
    toggleFavourite
);

quickBookingForm.addEventListener(
    "submit",
    handleQuickBooking
);

if (
    mobileMenuButton &&
    mobileMenu
) {
    mobileMenuButton.addEventListener(
        "click",
        toggleMobileMenu
    );

    mobileMenu.addEventListener(
        "click",
        (event) => {
            if (
                event.target.closest("a")
            ) {
                closeMobileMenu();
            }
        }
    );
}

window.addEventListener(
    "resize",
    () => {
        if (
            window.innerWidth > 900 &&
            mobileMenu
        ) {
            closeMobileMenu();
        }
    }
);

document.addEventListener(
    "DOMContentLoaded",
    initializeFacilityDetailsPage
);