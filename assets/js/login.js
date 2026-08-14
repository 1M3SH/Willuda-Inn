"use strict";

/* =========================================
   CONFIGURATION
========================================= */

const LOGIN_API_URL =
    "http://localhost:5000/api/auth/login";

const DASHBOARD_URL =
    "admin/admin-dashboard.html";

/* =========================================
   ELEMENTS
========================================= */

const loginForm =
    document.getElementById(
        "login-form"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const emailError =
    document.getElementById(
        "email-error"
    );

const passwordError =
    document.getElementById(
        "password-error"
    );

const passwordToggle =
    document.getElementById(
        "password-toggle"
    );

const loginMessage =
    document.getElementById(
        "login-message"
    );

const loginButton =
    loginForm?.querySelector(
        'button[type="submit"]'
    );

let messageTimer = null;

/* =========================================
   INPUT ERROR FUNCTIONS
========================================= */

function showInputError(
    input,
    errorElement,
    message
) {
    if (input) {
        input.classList.add(
            "input-error"
        );
    }

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function clearInputError(
    input,
    errorElement
) {
    if (input) {
        input.classList.remove(
            "input-error"
        );
    }

    if (errorElement) {
        errorElement.textContent =
            "";
    }
}

/* =========================================
   VALIDATION
========================================= */

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
        email
    );
}

/* =========================================
   LOGIN MESSAGE
========================================= */

function showMessage(
    message,
    type = "success"
) {
    if (!loginMessage) {
        return;
    }

    window.clearTimeout(
        messageTimer
    );

    loginMessage.textContent =
        message;

    loginMessage.classList.remove(
        "success",
        "error"
    );

    loginMessage.classList.add(
        "show",
        type
    );

    loginMessage.style.color =
        type === "error"
            ? "#b42318"
            : "#067647";

    messageTimer =
        window.setTimeout(
            function () {
                loginMessage.classList.remove(
                    "show"
                );
            },
            4000
        );
}

/* =========================================
   LOADING STATE
========================================= */

function setLoadingState(
    isLoading
) {
    if (!loginButton) {
        return;
    }

    loginButton.disabled =
        isLoading;

    if (isLoading) {
        loginButton.dataset.originalText =
            loginButton.innerHTML;

        loginButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing in...
        `;

        return;
    }

    loginButton.innerHTML =
        loginButton.dataset
            .originalText ||
        "Sign In";
}

/* =========================================
   PASSWORD VISIBILITY
========================================= */

if (
    passwordToggle &&
    passwordInput
) {
    passwordToggle.addEventListener(
        "click",
        function () {
            const icon =
                passwordToggle.querySelector(
                    "i"
                );

            const passwordIsHidden =
                passwordInput.type ===
                "password";

            passwordInput.type =
                passwordIsHidden
                    ? "text"
                    : "password";

            if (icon) {
                icon.classList.toggle(
                    "fa-eye",
                    !passwordIsHidden
                );

                icon.classList.toggle(
                    "fa-eye-slash",
                    passwordIsHidden
                );
            }

            passwordToggle.setAttribute(
                "aria-label",
                passwordIsHidden
                    ? "Hide password"
                    : "Show password"
            );
        }
    );
}

/* =========================================
   CLEAR ERRORS
========================================= */

emailInput?.addEventListener(
    "input",
    function () {
        clearInputError(
            emailInput,
            emailError
        );
    }
);

passwordInput?.addEventListener(
    "input",
    function () {
        clearInputError(
            passwordInput,
            passwordError
        );
    }
);

/* =========================================
   API LOGIN
========================================= */

async function sendLoginRequest(
    email,
    password
) {
    const response =
        await fetch(
            LOGIN_API_URL,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email,
                        password
                    })
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
            "Login failed."
        );
    }

    return result;
}

/* =========================================
   LOGIN SUBMIT
========================================= */

loginForm?.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        let formIsValid =
            true;

        clearInputError(
            emailInput,
            emailError
        );

        clearInputError(
            passwordInput,
            passwordError
        );

        /* -----------------------------------------
           EMAIL VALIDATION
        ----------------------------------------- */

        if (email === "") {
            showInputError(
                emailInput,
                emailError,
                "Email address is required."
            );

            formIsValid =
                false;

        } else if (
            !isValidEmail(email)
        ) {
            showInputError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            formIsValid =
                false;
        }

        /* -----------------------------------------
           PASSWORD VALIDATION
        ----------------------------------------- */

        if (password === "") {
            showInputError(
                passwordInput,
                passwordError,
                "Password is required."
            );

            formIsValid =
                false;

        } else if (
            password.length < 6
        ) {
            showInputError(
                passwordInput,
                passwordError,
                "Password must contain at least 6 characters."
            );

            formIsValid =
                false;
        }

        if (!formIsValid) {
            return;
        }

        /* -----------------------------------------
           BACKEND REQUEST
        ----------------------------------------- */

        try {
            setLoadingState(
                true
            );

            const result =
                await sendLoginRequest(
                    email,
                    password
                );

            /*
               sessionStorage is cleared when
               the browser session is closed.
            */

            sessionStorage.setItem(
                "willudaAdminToken",
                result.token
            );

            sessionStorage.setItem(
                "willudaAdmin",
                JSON.stringify(
                    result.admin
                )
            );

            showMessage(
                result.message ||
                "Login successful.",
                "success"
            );

            window.setTimeout(
                function () {
                    window.location.href =
                        DASHBOARD_URL;
                },
                700
            );

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            const message =
                error.message ===
                "Failed to fetch"
                    ? "Cannot connect to the backend. Start the Node.js server."
                    : error.message;

            showMessage(
                message,
                "error"
            );

        } finally {
            setLoadingState(
                false
            );
        }
    }
);