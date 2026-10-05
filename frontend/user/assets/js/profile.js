"use strict";

/* =========================================
   WILLUDA INN - PROFILE PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const profileForm =
    document.getElementById("profileForm");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileImage =
    document.getElementById("profileImage");

const profileInitials =
    document.getElementById("profileInitials");

const profileImageInput =
    document.getElementById("profileImageInput");

const changePhotoButton =
    document.getElementById("changePhotoButton");

const removePhotoButton =
    document.getElementById("removePhotoButton");

const sidebarName =
    document.getElementById("sidebarName");

const sidebarEmail =
    document.getElementById("sidebarEmail");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const dateOfBirthInput =
    document.getElementById("dateOfBirth");

const genderInput =
    document.getElementById("gender");

const addressInput =
    document.getElementById("address");

const cityInput =
    document.getElementById("city");

const countryInput =
    document.getElementById("country");

const fullNameError =
    document.getElementById("fullNameError");

const emailError =
    document.getElementById("emailError");

const phoneError =
    document.getElementById("phoneError");

const dateOfBirthError =
    document.getElementById("dateOfBirthError");

const addressError =
    document.getElementById("addressError");

const profileMessage =
    document.getElementById("profileMessage");

const resetProfileButton =
    document.getElementById("resetProfileButton");

const toastMessage =
    document.getElementById("toastMessage");

/* =========================================
   APPLICATION DATA
========================================= */

let savedProfile = null;

let selectedProfileImage = "";

let toastTimer = null;

/* =========================================
   DEFAULT PROFILE & ACTIVE USER
========================================= */

function getActiveUser() {
    let user = null;
    const userJson =
        sessionStorage.getItem("currentUser") ||
        sessionStorage.getItem("willudaAdmin") ||
        localStorage.getItem("user");

    if (userJson) {
        try {
            user = JSON.parse(userJson);
        } catch (e) {
            user = null;
        }
    }
    return user;
}

function getDefaultProfile() {
    const active = getActiveUser();
    const fullName = active ? (active.full_name || active.fullName || "Customer") : "Customer";
    const email = active ? (active.email || "") : "";
    const phone = active ? (active.phone || "") : "";
    const address = active ? (active.address || "") : "";
    const city = active ? (active.city || "") : "";
    const country = active ? (active.country || "") : "";

    return {
        fullName: fullName,
        email: email,
        phone: phone,
        dateOfBirth: "",
        gender: "",
        address: address,
        city: city,
        country: country,
        profileImage: "",
        updatedAt: ""
    };
}

/* =========================================
   TEXT HELPERS
========================================= */

function cleanText(value) {
    return String(value || "").trim();
}

function getInitials(fullName) {
    const name = cleanText(fullName);

    if (!name) {
        return "WI";
    }

    const nameParts = name
        .split(/\s+/)
        .filter(Boolean);

    if (nameParts.length === 1) {
        return nameParts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        nameParts[0][0] +
        nameParts[nameParts.length - 1][0]
    ).toUpperCase();
}

/* =========================================
   VALIDATION HELPERS
========================================= */

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function isValidPhone(phone) {
    const phonePattern =
        /^[0-9+\-\s()]{7,20}$/;

    return phonePattern.test(phone);
}

function isFutureDate(dateValue) {
    if (!dateValue) {
        return false;
    }

    const selectedDate =
        new Date(`${dateValue}T00:00:00`);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return selectedDate > today;
}

/* =========================================
   ERROR DISPLAY
========================================= */

function setInputError(
    inputElement,
    errorElement,
    message
) {
    inputElement.classList.add("invalid");
    errorElement.textContent = message;
}

function clearInputError(
    inputElement,
    errorElement
) {
    inputElement.classList.remove("invalid");
    errorElement.textContent = "";
}

function clearAllErrors() {
    clearInputError(
        fullNameInput,
        fullNameError
    );

    clearInputError(
        emailInput,
        emailError
    );

    clearInputError(
        phoneInput,
        phoneError
    );

    clearInputError(
        dateOfBirthInput,
        dateOfBirthError
    );

    clearInputError(
        addressInput,
        addressError
    );
}

/* =========================================
   PROFILE MESSAGE
========================================= */

function showProfileMessage(
    message,
    type
) {
    profileMessage.textContent = message;

    profileMessage.className =
        `form-message ${type} show`;
}

function hideProfileMessage() {
    profileMessage.textContent = "";
    profileMessage.className =
        "form-message";
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(
    message,
    type = "success"
) {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    toastMessage.className =
        `toast-message ${type} show`;

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove(
            "show"
        );
    }, 3000);
}

/* =========================================
   LOCAL STORAGE
========================================= */

function loadProfile() {
    const baseDefault = getDefaultProfile();
    const storedProfile =
        localStorage.getItem(
            "willudaUserProfile"
        );

    if (!storedProfile) {
        savedProfile = {
            ...baseDefault
        };

        return;
    }

    try {
        const parsedProfile =
            JSON.parse(storedProfile);

        savedProfile = {
            ...baseDefault,
            ...parsedProfile
        };

        if (savedProfile.fullName === "Willuda Guest" && baseDefault.fullName && baseDefault.fullName !== "Willuda Guest") {
            savedProfile.fullName = baseDefault.fullName;
        }
        if (savedProfile.email === "guest@willudainn.com" && baseDefault.email && baseDefault.email !== "guest@willudainn.com") {
            savedProfile.email = baseDefault.email;
        }

    } catch (error) {
        console.error(
            "Unable to load profile:",
            error
        );

        savedProfile = {
            ...baseDefault
        };
    }
}

function saveProfile(profile) {
    localStorage.setItem(
        "willudaUserProfile",
        JSON.stringify(profile)
    );

    savedProfile = {
        ...profile
    };

    try {
        const userJson = sessionStorage.getItem("currentUser") || localStorage.getItem("user");
        if (userJson) {
            const activeUser = JSON.parse(userJson);
            activeUser.full_name = profile.fullName;
            activeUser.fullName = profile.fullName;
            activeUser.email = profile.email;
            if (profile.phone) activeUser.phone = profile.phone;
            if (profile.address) activeUser.address = profile.address;
            if (profile.city) activeUser.city = profile.city;
            if (profile.country) activeUser.country = profile.country;

            if (sessionStorage.getItem("currentUser")) {
                sessionStorage.setItem("currentUser", JSON.stringify(activeUser));
            }
            if (localStorage.getItem("user")) {
                localStorage.setItem("user", JSON.stringify(activeUser));
            }
        }
    } catch (e) {
        console.error("Unable to update active session user:", e);
    }
}

/* =========================================
   DISPLAY PROFILE IMAGE
========================================= */

function displayProfileImage(
    imageData,
    fullName
) {
    if (imageData) {
        profileImage.src = imageData;
        profileImage.hidden = false;
        profileInitials.hidden = true;
        removePhotoButton.hidden = false;

        return;
    }

    profileImage.src = "";
    profileImage.hidden = true;
    profileInitials.hidden = false;
    removePhotoButton.hidden = true;

    profileInitials.textContent =
        getInitials(fullName);
}

/* =========================================
   UPDATE SIDEBAR
========================================= */

function updateSidebar(
    fullName,
    email,
    imageData
) {
    const active = getActiveUser();
    const fallbackName = active ? (active.full_name || active.fullName || "Customer") : "Customer";
    const fallbackEmail = active ? (active.email || "") : "";

    const name =
        cleanText(fullName) && cleanText(fullName) !== "Willuda Guest"
            ? cleanText(fullName)
            : fallbackName;

    const emailAddress =
        cleanText(email) && cleanText(email) !== "guest@willudainn.com"
            ? cleanText(email)
            : fallbackEmail;

    if (sidebarName) sidebarName.textContent = name;
    if (sidebarEmail) sidebarEmail.textContent = emailAddress;

    const memberRole = document.querySelector(".member-card strong");
    if (memberRole) {
        memberRole.textContent = (active && active.role) ? active.role : "Customer Account";
    }

    displayProfileImage(
        imageData,
        name
    );
}

/* =========================================
   POPULATE FORM
========================================= */

function populateProfileForm(profile) {
    fullNameInput.value =
        profile.fullName || "";

    emailInput.value =
        profile.email || "";

    phoneInput.value =
        profile.phone || "";

    dateOfBirthInput.value =
        profile.dateOfBirth || "";

    genderInput.value =
        profile.gender || "";

    addressInput.value =
        profile.address || "";

    cityInput.value =
        profile.city || "";

    countryInput.value =
        profile.country || "";

    selectedProfileImage =
        profile.profileImage || "";

    updateSidebar(
        profile.fullName,
        profile.email,
        selectedProfileImage
    );
}

/* =========================================
   FORM VALIDATION
========================================= */

function validateProfileForm() {
    clearAllErrors();

    let isValid = true;

    const fullName =
        cleanText(fullNameInput.value);

    const email =
        cleanText(emailInput.value);

    const phone =
        cleanText(phoneInput.value);

    const dateOfBirth =
        dateOfBirthInput.value;

    const address =
        cleanText(addressInput.value);

    if (fullName.length < 3) {
        setInputError(
            fullNameInput,
            fullNameError,
            "Please enter your full name."
        );

        isValid = false;
    }

    if (!email) {
        setInputError(
            emailInput,
            emailError,
            "Email address is required."
        );

        isValid = false;

    } else if (!isValidEmail(email)) {
        setInputError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );

        isValid = false;
    }

    if (!phone) {
        setInputError(
            phoneInput,
            phoneError,
            "Phone number is required."
        );

        isValid = false;

    } else if (!isValidPhone(phone)) {
        setInputError(
            phoneInput,
            phoneError,
            "Please enter a valid phone number."
        );

        isValid = false;
    }

    if (
        dateOfBirth &&
        isFutureDate(dateOfBirth)
    ) {
        setInputError(
            dateOfBirthInput,
            dateOfBirthError,
            "Date of birth cannot be in the future."
        );

        isValid = false;
    }

    if (address.length < 5) {
        setInputError(
            addressInput,
            addressError,
            "Please enter your complete address."
        );

        isValid = false;
    }

    return isValid;
}

/* =========================================
   CREATE PROFILE OBJECT
========================================= */

function createProfileObject() {
    return {
        fullName:
            cleanText(fullNameInput.value),

        email:
            cleanText(emailInput.value),

        phone:
            cleanText(phoneInput.value),

        dateOfBirth:
            dateOfBirthInput.value,

        gender:
            genderInput.value,

        address:
            cleanText(addressInput.value),

        city:
            cleanText(cityInput.value),

        country:
            cleanText(countryInput.value),

        profileImage:
            selectedProfileImage,

        updatedAt:
            new Date().toISOString()
    };
}

/* =========================================
   UPDATE RELATED BOOKING CUSTOMER DATA
========================================= */

function updateBookingCustomerDetails(
    profile
) {
    const storedBookings =
        localStorage.getItem(
            "willudaBookings"
        );

    if (storedBookings) {
        try {
            const bookings =
                JSON.parse(storedBookings);

            if (Array.isArray(bookings)) {
                const updatedBookings =
                    bookings.map((booking) => {
                        return {
                            ...booking,
                            customer: {
                                ...booking.customer,
                                fullName:
                                    profile.fullName,
                                email:
                                    profile.email,
                                phone:
                                    profile.phone,
                                address:
                                    profile.address
                            }
                        };
                    });

                localStorage.setItem(
                    "willudaBookings",
                    JSON.stringify(
                        updatedBookings
                    )
                );
            }

        } catch (error) {
            console.error(
                "Unable to update booking customer details:",
                error
            );
        }
    }

    const latestBooking =
        localStorage.getItem(
            "willudaLatestBooking"
        );

    if (latestBooking) {
        try {
            const booking =
                JSON.parse(latestBooking);

            const updatedLatestBooking = {
                ...booking,
                customer: {
                    ...booking.customer,
                    fullName:
                        profile.fullName,
                    email:
                        profile.email,
                    phone:
                        profile.phone,
                    address:
                        profile.address
                }
            };

            localStorage.setItem(
                "willudaLatestBooking",
                JSON.stringify(
                    updatedLatestBooking
                )
            );

        } catch (error) {
            console.error(
                "Unable to update latest booking:",
                error
            );
        }
    }
}

/* =========================================
   FORM SUBMISSION
========================================= */

function handleProfileSubmit(event) {
    event.preventDefault();

    hideProfileMessage();

    const formIsValid =
        validateProfileForm();

    if (!formIsValid) {
        showProfileMessage(
            "Please correct the highlighted fields.",
            "error"
        );

        showToast(
            "Please check your profile information.",
            "error"
        );

        return;
    }

    const profile =
        createProfileObject();

    saveProfile(profile);

    updateBookingCustomerDetails(
        profile
    );

    updateSidebar(
        profile.fullName,
        profile.email,
        profile.profileImage
    );

    showProfileMessage(
        "Your profile information has been saved successfully.",
        "success"
    );

    showToast(
        "Profile updated successfully.",
        "success"
    );
}

/* =========================================
   RESET CHANGES
========================================= */

function resetProfileChanges() {
    clearAllErrors();
    hideProfileMessage();

    populateProfileForm(
        savedProfile
    );

    showToast(
        "Unsaved changes have been reset.",
        "success"
    );
}

/* =========================================
   PROFILE IMAGE
========================================= */

function openImageSelector() {
    profileImageInput.click();
}

function handleProfileImageChange(event) {
    const selectedFile =
        event.target.files[0];

    if (!selectedFile) {
        return;
    }

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];

    if (
        !allowedTypes.includes(
            selectedFile.type
        )
    ) {
        showToast(
            "Please select a PNG, JPG or WebP image.",
            "error"
        );

        profileImageInput.value = "";
        return;
    }

    const maximumFileSize =
        2 * 1024 * 1024;

    if (
        selectedFile.size >
        maximumFileSize
    ) {
        showToast(
            "Profile image must be smaller than 2 MB.",
            "error"
        );

        profileImageInput.value = "";
        return;
    }

    const fileReader =
        new FileReader();

    fileReader.onload = () => {
        selectedProfileImage =
            fileReader.result;

        displayProfileImage(
            selectedProfileImage,
            fullNameInput.value
        );

        showToast(
            "Photo selected. Click Save Changes to keep it.",
            "success"
        );
    };

    fileReader.onerror = () => {
        showToast(
            "Unable to read the selected image.",
            "error"
        );
    };

    fileReader.readAsDataURL(
        selectedFile
    );
}

function removeProfilePhoto() {
    selectedProfileImage = "";

    profileImageInput.value = "";

    displayProfileImage(
        "",
        fullNameInput.value
    );

    showToast(
        "Photo removed. Click Save Changes to confirm.",
        "success"
    );
}

/* =========================================
   LIVE SIDEBAR PREVIEW
========================================= */

function updateLiveProfilePreview() {
    updateSidebar(
        fullNameInput.value,
        emailInput.value,
        selectedProfileImage
    );
}

/* =========================================
   CLEAR FIELD ERROR ON INPUT
========================================= */

function addLiveValidationClear(
    inputElement,
    errorElement
) {
    inputElement.addEventListener(
        "input",
        () => {
            clearInputError(
                inputElement,
                errorElement
            );

            hideProfileMessage();
        }
    );
}

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeProfilePage() {
    loadProfile();

    populateProfileForm(
        savedProfile
    );

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    dateOfBirthInput.max = today;
}

/* =========================================
   EVENT LISTENERS
========================================= */

profileForm.addEventListener(
    "submit",
    handleProfileSubmit
);

resetProfileButton.addEventListener(
    "click",
    resetProfileChanges
);

changePhotoButton.addEventListener(
    "click",
    openImageSelector
);

profileImageInput.addEventListener(
    "change",
    handleProfileImageChange
);

removePhotoButton.addEventListener(
    "click",
    removeProfilePhoto
);

fullNameInput.addEventListener(
    "input",
    updateLiveProfilePreview
);

emailInput.addEventListener(
    "input",
    updateLiveProfilePreview
);

addLiveValidationClear(
    fullNameInput,
    fullNameError
);

addLiveValidationClear(
    emailInput,
    emailError
);

addLiveValidationClear(
    phoneInput,
    phoneError
);

addLiveValidationClear(
    dateOfBirthInput,
    dateOfBirthError
);

addLiveValidationClear(
    addressInput,
    addressError
);

document.addEventListener(
    "DOMContentLoaded",
    initializeProfilePage
);