"use strict";

/* =========================================
   WILLUDA INN - CONTACT PAGE
========================================= */

/* =========================================
   PAGE ELEMENTS
========================================= */

const contactForm =
    document.getElementById("contactForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const subjectInput =
    document.getElementById("subject");

const messageInput =
    document.getElementById("message");

const submitButton =
    contactForm.querySelector(
        'button[type="submit"]'
    );

/* =========================================
   PAGE STATE
========================================= */

let toastTimer = null;

/* =========================================
   CREATE MESSAGE ELEMENTS
========================================= */

const formMessage =
    document.createElement("div");

formMessage.className =
    "contact-form-message";

formMessage.id =
    "contactFormMessage";

formMessage.setAttribute(
    "role",
    "alert"
);

formMessage.setAttribute(
    "aria-live",
    "polite"
);

contactForm.insertBefore(
    formMessage,
    submitButton
);

const toastMessage =
    document.createElement("div");

toastMessage.className =
    "toast-message";

toastMessage.id =
    "toastMessage";

toastMessage.setAttribute(
    "role",
    "alert"
);

toastMessage.setAttribute(
    "aria-live",
    "polite"
);

document.body.appendChild(
    toastMessage
);

/* =========================================
   HELPERS
========================================= */

function cleanText(value) {
    return String(value || "").trim();
}

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function isValidPhone(phone) {
    /*
        Accepts:
        0771234567
        +94771234567
        077-123-4567
        077 123 4567
    */

    const phonePattern =
        /^[+]?[\d\s()-]{7,20}$/;

    return phonePattern.test(phone);
}

function generateMessageId() {
    const timestamp =
        Date.now();

    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `MSG-${timestamp}-${randomNumber}`;
}

/* =========================================
   ERROR DISPLAY
========================================= */

function getFormGroup(inputElement) {
    return inputElement.closest(
        ".input-group"
    );
}

function clearFieldError(inputElement) {
    inputElement.classList.remove(
        "input-error"
    );

    const formGroup =
        getFormGroup(inputElement);

    if (!formGroup) {
        return;
    }

    const existingError =
        formGroup.querySelector(
            ".error-message"
        );

    if (existingError) {
        existingError.remove();
    }
}

function showFieldError(
    inputElement,
    message
) {
    clearFieldError(inputElement);

    inputElement.classList.add(
        "input-error"
    );

    const errorElement =
        document.createElement("small");

    errorElement.className =
        "error-message";

    errorElement.textContent =
        message;

    const formGroup =
        getFormGroup(inputElement);

    if (formGroup) {
        formGroup.appendChild(
            errorElement
        );
    }
}

function clearAllErrors() {
    [
        fullNameInput,
        emailInput,
        phoneInput,
        subjectInput,
        messageInput
    ].forEach(clearFieldError);
}

/* =========================================
   FORM MESSAGE
========================================= */

function showFormMessage(
    message,
    type
) {
    formMessage.textContent =
        message;

    formMessage.className =
        `contact-form-message ${type} show`;
}

function hideFormMessage() {
    formMessage.textContent = "";

    formMessage.className =
        "contact-form-message";
}

/* =========================================
   TOAST MESSAGE
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

    toastTimer =
        window.setTimeout(() => {
            toastMessage.classList.remove(
                "show"
            );
        }, 3000);
}

/* =========================================
   FIELD VALIDATION
========================================= */

function validateFullName() {
    const fullName =
        cleanText(fullNameInput.value);

    if (!fullName) {
        showFieldError(
            fullNameInput,
            "Full name is required."
        );

        return false;
    }

    if (fullName.length < 3) {
        showFieldError(
            fullNameInput,
            "Full name must contain at least 3 characters."
        );

        return false;
    }

    clearFieldError(
        fullNameInput
    );

    return true;
}

function validateEmail() {
    const email =
        cleanText(emailInput.value);

    if (!email) {
        showFieldError(
            emailInput,
            "Email address is required."
        );

        return false;
    }

    if (!isValidEmail(email)) {
        showFieldError(
            emailInput,
            "Please enter a valid email address."
        );

        return false;
    }

    clearFieldError(
        emailInput
    );

    return true;
}

function validatePhone() {
    const phone =
        cleanText(phoneInput.value);

    /*
        Phone number is optional.
    */

    if (!phone) {
        clearFieldError(
            phoneInput
        );

        return true;
    }

    if (!isValidPhone(phone)) {
        showFieldError(
            phoneInput,
            "Please enter a valid phone number."
        );

        return false;
    }

    clearFieldError(
        phoneInput
    );

    return true;
}

function validateSubject() {
    const subject =
        cleanText(subjectInput.value);

    if (!subject) {
        showFieldError(
            subjectInput,
            "Subject is required."
        );

        return false;
    }

    if (subject.length < 4) {
        showFieldError(
            subjectInput,
            "Subject must contain at least 4 characters."
        );

        return false;
    }

    clearFieldError(
        subjectInput
    );

    return true;
}

function validateMessage() {
    const message =
        cleanText(messageInput.value);

    if (!message) {
        showFieldError(
            messageInput,
            "Message is required."
        );

        return false;
    }

    if (message.length < 10) {
        showFieldError(
            messageInput,
            "Message must contain at least 10 characters."
        );

        return false;
    }

    clearFieldError(
        messageInput
    );

    return true;
}

function validateContactForm() {
    const fullNameValid =
        validateFullName();

    const emailValid =
        validateEmail();

    const phoneValid =
        validatePhone();

    const subjectValid =
        validateSubject();

    const messageValid =
        validateMessage();

    return (
        fullNameValid &&
        emailValid &&
        phoneValid &&
        subjectValid &&
        messageValid
    );
}

/* =========================================
   CREATE MESSAGE OBJECT
========================================= */

function createContactMessage() {
    return {
        id:
            generateMessageId(),

        fullName:
            cleanText(
                fullNameInput.value
            ),

        email:
            cleanText(
                emailInput.value
            ),

        phone:
            cleanText(
                phoneInput.value
            ),

        subject:
            cleanText(
                subjectInput.value
            ),

        message:
            cleanText(
                messageInput.value
            ),

        status:
            "New",

        createdAt:
            new Date().toISOString()
    };
}

/* =========================================
   SAVE MESSAGE TO LOCAL STORAGE
========================================= */

function saveContactMessage(
    contactMessage
) {
    let savedMessages = [];

    const storedMessages =
        localStorage.getItem(
            "willudaContactMessages"
        );

    if (storedMessages) {
        try {
            const parsedMessages =
                JSON.parse(storedMessages);

            if (Array.isArray(parsedMessages)) {
                savedMessages =
                    parsedMessages;
            }

        } catch (error) {
            console.error(
                "Unable to read saved contact messages:",
                error
            );
        }
    }

    savedMessages.unshift(
        contactMessage
    );

    localStorage.setItem(
        "willudaContactMessages",
        JSON.stringify(
            savedMessages
        )
    );
}

/* =========================================
   CREATE CUSTOMER NOTIFICATION
========================================= */

function createContactNotification(
    contactMessage
) {
    let notifications = [];

    const storedNotifications =
        localStorage.getItem(
            "willudaNotifications"
        );

    if (storedNotifications) {
        try {
            const parsedNotifications =
                JSON.parse(
                    storedNotifications
                );

            if (
                Array.isArray(
                    parsedNotifications
                )
            ) {
                notifications =
                    parsedNotifications;
            }

        } catch (error) {
            console.error(
                "Unable to read notifications:",
                error
            );
        }
    }

    notifications.unshift({
        id:
            `NOT-${Date.now()}-${Math.floor(
                Math.random() * 10000
            )}`,

        type:
            "System",

        title:
            "Message Submitted",

        message:
            `Your contact message "${contactMessage.subject}" was submitted successfully.`,

        createdAt:
            new Date().toISOString(),

        isRead:
            false,

        relatedPage:
            "contact.html"
    });

    localStorage.setItem(
        "willudaNotifications",
        JSON.stringify(
            notifications
        )
    );
}

/* =========================================
   SUBMIT BUTTON STATE
========================================= */

function setSubmittingState(
    isSubmitting
) {
    submitButton.disabled =
        isSubmitting;

    if (isSubmitting) {
        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Sending Message...
        `;
    } else {
        submitButton.textContent =
            "Send Message";
    }
}

/* =========================================
   FORM SUBMISSION
========================================= */

function handleContactSubmit(
    event
) {
    event.preventDefault();

    hideFormMessage();

    const formIsValid =
        validateContactForm();

    if (!formIsValid) {
        showFormMessage(
            "Please correct the highlighted fields before sending your message.",
            "error"
        );

        showToast(
            "Please check the contact form.",
            "error"
        );

        const firstInvalidField =
            contactForm.querySelector(
                ".input-error"
            );

        if (firstInvalidField) {
            firstInvalidField.focus();

            firstInvalidField.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        return;
    }

    const contactMessage =
        createContactMessage();

    setSubmittingState(true);

    /*
        Phase 1 demonstration delay.

        Phase 2 will send this data
        to the PHP API and MySQL database.
    */

    window.setTimeout(() => {
        saveContactMessage(
            contactMessage
        );

        createContactNotification(
            contactMessage
        );

        contactForm.reset();

        clearAllErrors();

        setSubmittingState(false);

        showFormMessage(
            `Thank you, ${contactMessage.fullName}. Your message has been submitted successfully.`,
            "success"
        );

        showToast(
            "Message sent successfully.",
            "success"
        );

    }, 900);
}

/* =========================================
   CLEAR ERRORS WHILE TYPING
========================================= */

function addLiveValidation(
    inputElement,
    validationFunction
) {
    inputElement.addEventListener(
        "input",
        () => {
            clearFieldError(
                inputElement
            );

            hideFormMessage();

            /*
                Validate only after the user
                has typed something.
            */

            if (
                cleanText(
                    inputElement.value
                )
            ) {
                validationFunction();
            }
        }
    );
}

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeContactPage() {
    const savedProfile =
        localStorage.getItem(
            "willudaUserProfile"
        );

    /*
        Automatically fill the user's
        saved profile information.
    */

    if (savedProfile) {
        try {
            const profile =
                JSON.parse(savedProfile);

            if (profile.fullName) {
                fullNameInput.value =
                    profile.fullName;
            }

            if (profile.email) {
                emailInput.value =
                    profile.email;
            }

            if (profile.phone) {
                phoneInput.value =
                    profile.phone;
            }

        } catch (error) {
            console.error(
                "Unable to load saved profile:",
                error
            );
        }
    }
}

/* =========================================
   EVENT LISTENERS
========================================= */

contactForm.addEventListener(
    "submit",
    handleContactSubmit
);

addLiveValidation(
    fullNameInput,
    validateFullName
);

addLiveValidation(
    emailInput,
    validateEmail
);

addLiveValidation(
    phoneInput,
    validatePhone
);

addLiveValidation(
    subjectInput,
    validateSubject
);

addLiveValidation(
    messageInput,
    validateMessage
);

document.addEventListener(
    "DOMContentLoaded",
    initializeContactPage
);