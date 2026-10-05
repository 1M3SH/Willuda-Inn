"use strict";

/* =========================================
   CONFIGURATION
========================================= */

const LOGIN_API_URL =
    (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.login) ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api/auth/login"
        : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}/api/auth/login`);

const DASHBOARD_URL = window.location.pathname.includes("/frontend/user")
    ? "../admin/admin-dashboard.html"
    : "admin/admin-dashboard.html";

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
    let response;
    try {
        response = await fetch(
            LOGIN_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );
    } catch (networkError) {
        throw new Error(
            "Cannot connect to the backend server. Please ensure the server is running."
        );
    }

    let result;
    try {
        result = await response.json();
    } catch (parseError) {
        throw new Error(
            "Invalid response received from the authentication server."
        );
    }

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Invalid email address or password."
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

            const loggedInUser = result.user || result.admin || {};
            const role = String(loggedInUser.role || "").trim().toLowerCase();
            const isStaff = ["administrator", "manager", "receptionist", "accountant", "event manager"].includes(role);

            /*
               Store session details
            */
            sessionStorage.setItem(
                "willudaAdminToken",
                result.token
            );

            sessionStorage.setItem(
                "willudaAdmin",
                JSON.stringify(
                    loggedInUser
                )
            );

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(
                    loggedInUser
                )
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedInUser
                )
            );

            localStorage.setItem(
                "token",
                result.token
            );

            showMessage(
                result.message ||
                "Login successful.",
                "success"
            );

            // Role-based routing: Customers go to customer dashboard, Admins go to admin dashboard
            const destination = isStaff
                ? (window.location.pathname.includes("/frontend/user") ? "../admin/admin-dashboard.html" : "admin/admin-dashboard.html")
                : "dashboard.html";

            window.setTimeout(
                function () {
                    window.location.href =
                        destination;
                },
                700
            );

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            showMessage(
                error.message || "Login failed.",
                "error"
            );

        } finally {
            setLoadingState(
                false
            );
        }
    }
);