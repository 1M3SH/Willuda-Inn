"use strict";

/* =========================================
   DEFAULT SETTINGS
========================================= */

const defaultSettings = {
    fullName: "Prabhath Akalanka",
    email: "admin@willudainn.com",
    phone: "+94 77 123 4567",
    role: "Manager",

    emailNotifications: true,
    smsNotifications: false,
    bookingNotifications: true,
    paymentNotifications: true,

    theme: "light",
    language: "English",
    currency: "LKR",

    automaticBackup: true
};

let settings = {};

/* =========================================
   ELEMENTS
========================================= */

const form =
    document.getElementById(
        "adminSettingsForm"
    );

const message =
    document.getElementById(
        "settingsFormMessage"
    );

const toast =
    document.getElementById(
        "adminToast"
    );

/* =========================================
   TOAST
========================================= */

function showToast(text) {
    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove(
            "show"
        );
    }, 3000);
}

/* =========================================
   STORAGE
========================================= */

function saveSettings() {
    localStorage.setItem(
        "willudaSettings",
        JSON.stringify(settings)
    );
}

function loadSettings() {
    const storedSettings =
        localStorage.getItem(
            "willudaSettings"
        );

    if (storedSettings) {
        settings =
            JSON.parse(storedSettings);
    } else {
        settings = {
            ...defaultSettings
        };

        saveSettings();
    }
}

/* =========================================
   FORM VALUES
========================================= */

function updateFormValues() {
    document.getElementById(
        "adminFullName"
    ).value =
        settings.fullName;

    document.getElementById(
        "adminEmail"
    ).value =
        settings.email;

    document.getElementById(
        "adminPhone"
    ).value =
        settings.phone;

    document.getElementById(
        "adminRole"
    ).value =
        settings.role;

    document.getElementById(
        "emailNotifications"
    ).checked =
        settings.emailNotifications;

    document.getElementById(
        "smsNotifications"
    ).checked =
        settings.smsNotifications;

    document.getElementById(
        "bookingNotifications"
    ).checked =
        settings.bookingNotifications;

    document.getElementById(
        "paymentNotifications"
    ).checked =
        settings.paymentNotifications;

    document.getElementById(
        "themeSelection"
    ).value =
        settings.theme;

    document.getElementById(
        "languageSelection"
    ).value =
        settings.language;

    document.getElementById(
        "currencySelection"
    ).value =
        settings.currency;

    document.getElementById(
        "automaticBackup"
    ).checked =
        settings.automaticBackup;
}

/* =========================================
   PROFILE PREVIEW
========================================= */

function updatePreview() {
    document.getElementById(
        "profilePreviewName"
    ).textContent =
        document.getElementById(
            "adminFullName"
        ).value;

    document.getElementById(
        "profilePreviewEmail"
    ).textContent =
        document.getElementById(
            "adminEmail"
        ).value;
}

/* =========================================
   PASSWORD VISIBILITY
========================================= */

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const input =
                    document.getElementById(
                        button.dataset
                            .target
                    );

                if (
                    input.type ===
                    "password"
                ) {
                    input.type =
                        "text";
                } else {
                    input.type =
                        "password";
                }
            }
        );
    });

/* =========================================
   THEME
========================================= */

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add(
            "admin-dark-theme"
        );
    } else {
        document.body.classList.remove(
            "admin-dark-theme"
        );
    }
}

/* =========================================
   SAVE SETTINGS
========================================= */

form.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        settings.fullName =
            document.getElementById(
                "adminFullName"
            ).value;

        settings.email =
            document.getElementById(
                "adminEmail"
            ).value;

        settings.phone =
            document.getElementById(
                "adminPhone"
            ).value;

        settings.role =
            document.getElementById(
                "adminRole"
            ).value;

        settings.emailNotifications =
            document.getElementById(
                "emailNotifications"
            ).checked;

        settings.smsNotifications =
            document.getElementById(
                "smsNotifications"
            ).checked;

        settings.bookingNotifications =
            document.getElementById(
                "bookingNotifications"
            ).checked;

        settings.paymentNotifications =
            document.getElementById(
                "paymentNotifications"
            ).checked;

        settings.theme =
            document.getElementById(
                "themeSelection"
            ).value;

        settings.language =
            document.getElementById(
                "languageSelection"
            ).value;

        settings.currency =
            document.getElementById(
                "currencySelection"
            ).value;

        settings.automaticBackup =
            document.getElementById(
                "automaticBackup"
            ).checked;

        saveSettings();

        applyTheme(
            settings.theme
        );

        message.textContent =
            "Settings saved successfully.";

        message.className =
            "settings-form-message success";

        showToast(
            "Settings saved."
        );
    }
);

/* =========================================
   RESET
========================================= */

document
    .getElementById(
        "resetSettingsButton"
    )
    .addEventListener(
        "click",
        () => {
            settings = {
                ...defaultSettings
            };

            saveSettings();

            updateFormValues();

            showToast(
                "Settings reset."
            );
        }
    );

/* =========================================
   BACKUP
========================================= */

document
    .getElementById(
        "createBackupButton"
    )
    .addEventListener(
        "click",
        () => {
            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            settings,
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
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "settings-backup.json";

            link.click();

            URL.revokeObjectURL(
                url
            );

            showToast(
                "Backup created."
            );
        }
    );

/* =========================================
   INITIALIZE
========================================= */

function initializePage() {
    loadSettings();

    updateFormValues();

    updatePreview();

    applyTheme(
        settings.theme
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);