"use strict";

/* =========================================
   WILLUDA INN - CHANGE PASSWORD
========================================= */

const changePasswordForm =
    document.getElementById("changePasswordForm");

const currentPasswordInput =
    document.getElementById("currentPassword");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const currentPasswordError =
    document.getElementById("currentPasswordError");

const newPasswordError =
    document.getElementById("newPasswordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const passwordMessage =
    document.getElementById("passwordMessage");

const clearPasswordButton =
    document.getElementById("clearPasswordButton");

const strengthFill =
    document.getElementById("strengthFill");

const strengthText =
    document.getElementById("strengthText");

const lengthRequirement =
    document.getElementById("lengthRequirement");

const uppercaseRequirement =
    document.getElementById("uppercaseRequirement");

const lowercaseRequirement =
    document.getElementById("lowercaseRequirement");

const numberRequirement =
    document.getElementById("numberRequirement");

const specialRequirement =
    document.getElementById("specialRequirement");

const sidebarProfileImage =
    document.getElementById("sidebarProfileImage");

const sidebarInitials =
    document.getElementById("sidebarInitials");

const sidebarName =
    document.getElementById("sidebarName");

const sidebarEmail =
    document.getElementById("sidebarEmail");

const toastMessage =
    document.getElementById("toastMessage");

let toastTimer = null;

/* Temporary default password for Phase 1 */
const DEFAULT_PASSWORD = "Willuda@123";

/* =========================================
   HELPERS
========================================= */

function getStoredPassword() {
    return (
        localStorage.getItem("willudaUserPassword") ||
        DEFAULT_PASSWORD
    );
}

function cleanText(value) {
    return String(value || "").trim();
}

function getInitials(fullName) {
    const name = cleanText(fullName);

    if (!name) {
        return "WI";
    }

    const parts = name.split(/\s+/);

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

/* =========================================
   SIDEBAR PROFILE
========================================= */

function loadSidebarProfile() {
    const storedProfile =
        localStorage.getItem("willudaUserProfile");

    if (!storedProfile) {
        return;
    }

    try {
        const profile = JSON.parse(storedProfile);

        const fullName =
            profile.fullName || "Willuda Guest";

        const email =
            profile.email || "guest@willudainn.com";

        sidebarName.textContent = fullName;
        sidebarEmail.textContent = email;

        if (profile.profileImage) {
            sidebarProfileImage.src =
                profile.profileImage;

            sidebarProfileImage.hidden = false;
            sidebarInitials.hidden = true;
        } else {
            sidebarProfileImage.hidden = true;
            sidebarInitials.hidden = false;
            sidebarInitials.textContent =
                getInitials(fullName);
        }

    } catch (error) {
        console.error(
            "Unable to load user profile:",
            error
        );
    }
}

/* =========================================
   PASSWORD REQUIREMENTS
========================================= */

function getPasswordRules(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}

function updateRequirement(
    element,
    isValid
) {
    const icon = element.querySelector("i");

    if (isValid) {
        element.classList.add("valid");

        icon.className =
            "fa-solid fa-circle-check";
    } else {
        element.classList.remove("valid");

        icon.className =
            "fa-solid fa-circle";
    }
}

function updatePasswordStrength() {
    const password =
        newPasswordInput.value;

    const rules =
        getPasswordRules(password);

    updateRequirement(
        lengthRequirement,
        rules.length
    );

    updateRequirement(
        uppercaseRequirement,
        rules.uppercase
    );

    updateRequirement(
        lowercaseRequirement,
        rules.lowercase
    );

    updateRequirement(
        numberRequirement,
        rules.number
    );

    updateRequirement(
        specialRequirement,
        rules.special
    );

    const score =
        Object.values(rules)
            .filter(Boolean)
            .length;

    strengthFill.className =
        "strength-fill";

    if (!password) {
        strengthText.textContent =
            "Not entered";

        return;
    }

    if (score <= 2) {
        strengthFill.classList.add("weak");
        strengthText.textContent = "Weak";
    } else if (score === 3) {
        strengthFill.classList.add("fair");
        strengthText.textContent = "Fair";
    } else if (score === 4) {
        strengthFill.classList.add("good");
        strengthText.textContent = "Good";
    } else {
        strengthFill.classList.add("strong");
        strengthText.textContent = "Strong";
    }
}

function isStrongPassword(password) {
    const rules =
        getPasswordRules(password);

    return Object.values(rules)
        .every(Boolean);
}

/* =========================================
   VALIDATION
========================================= */

function setError(
    input,
    errorElement,
    message
) {
    input.classList.add("invalid");
    errorElement.textContent = message;
}

function clearError(
    input,
    errorElement
) {
    input.classList.remove("invalid");
    errorElement.textContent = "";
}

function clearAllErrors() {
    clearError(
        currentPasswordInput,
        currentPasswordError
    );

    clearError(
        newPasswordInput,
        newPasswordError
    );

    clearError(
        confirmPasswordInput,
        confirmPasswordError
    );
}

function validateForm() {
    clearAllErrors();

    let valid = true;

    const currentPassword =
        currentPasswordInput.value;

    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    const storedPassword =
        getStoredPassword();

    if (!currentPassword) {
        setError(
            currentPasswordInput,
            currentPasswordError,
            "Current password is required."
        );

        valid = false;

    } else if (
        currentPassword !== storedPassword
    ) {
        setError(
            currentPasswordInput,
            currentPasswordError,
            "Current password is incorrect."
        );

        valid = false;
    }

    if (!newPassword) {
        setError(
            newPasswordInput,
            newPasswordError,
            "New password is required."
        );

        valid = false;

    } else if (
        !isStrongPassword(newPassword)
    ) {
        setError(
            newPasswordInput,
            newPasswordError,
            "New password does not meet all requirements."
        );

        valid = false;

    } else if (
        newPassword === currentPassword
    ) {
        setError(
            newPasswordInput,
            newPasswordError,
            "New password must be different from the current password."
        );

        valid = false;
    }

    if (!confirmPassword) {
        setError(
            confirmPasswordInput,
            confirmPasswordError,
            "Please confirm your new password."
        );

        valid = false;

    } else if (
        confirmPassword !== newPassword
    ) {
        setError(
            confirmPasswordInput,
            confirmPasswordError,
            "Passwords do not match."
        );

        valid = false;
    }

    return valid;
}

/* =========================================
   MESSAGE AND TOAST
========================================= */

function showMessage(message, type) {
    passwordMessage.textContent = message;

    passwordMessage.className =
        `form-message ${type} show`;
}

function hideMessage() {
    passwordMessage.textContent = "";

    passwordMessage.className =
        "form-message";
}

function showToast(
    message,
    type = "success"
) {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    toastMessage.className =
        `toast-message ${type} show`;

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove("show");
    }, 3000);
}

/* =========================================
   PASSWORD VISIBILITY
========================================= */

function togglePasswordVisibility(event) {
    const button =
        event.currentTarget;

    const targetId =
        button.dataset.target;

    const input =
        document.getElementById(targetId);

    const icon =
        button.querySelector("i");

    const showingPassword =
        input.type === "text";

    input.type =
        showingPassword
            ? "password"
            : "text";

    icon.className =
        showingPassword
            ? "fa-solid fa-eye"
            : "fa-solid fa-eye-slash";

    button.setAttribute(
        "aria-label",
        showingPassword
            ? "Show password"
            : "Hide password"
    );
}

/* =========================================
   SUBMIT PASSWORD
========================================= */

function handlePasswordSubmit(event) {
    event.preventDefault();

    hideMessage();

    if (!validateForm()) {
        showMessage(
            "Please correct the highlighted fields.",
            "error"
        );

        showToast(
            "Password update failed.",
            "error"
        );

        return;
    }

    const newPassword =
        newPasswordInput.value;

    localStorage.setItem(
        "willudaUserPassword",
        newPassword
    );

    localStorage.setItem(
        "willudaPasswordUpdatedAt",
        new Date().toISOString()
    );

    showMessage(
        "Your password has been updated successfully.",
        "success"
    );

    showToast(
        "Password updated successfully.",
        "success"
    );

    changePasswordForm.reset();
    clearAllErrors();
    updatePasswordStrength();
}

/* =========================================
   CLEAR FORM
========================================= */

function clearPasswordForm() {
    changePasswordForm.reset();

    clearAllErrors();
    hideMessage();
    updatePasswordStrength();

    showToast(
        "Password fields cleared.",
        "success"
    );
}

/* =========================================
   EVENT LISTENERS
========================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach((button) => {
        button.addEventListener(
            "click",
            togglePasswordVisibility
        );
    });

newPasswordInput.addEventListener(
    "input",
    () => {
        clearError(
            newPasswordInput,
            newPasswordError
        );

        hideMessage();
        updatePasswordStrength();
    }
);

currentPasswordInput.addEventListener(
    "input",
    () => {
        clearError(
            currentPasswordInput,
            currentPasswordError
        );

        hideMessage();
    }
);

confirmPasswordInput.addEventListener(
    "input",
    () => {
        clearError(
            confirmPasswordInput,
            confirmPasswordError
        );

        hideMessage();
    }
);

changePasswordForm.addEventListener(
    "submit",
    handlePasswordSubmit
);

clearPasswordButton.addEventListener(
    "click",
    clearPasswordForm
);

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadSidebarProfile();
        updatePasswordStrength();
    }
);