"use strict";

const form = document.getElementById("registerForm");
const submitButton = form ? form.querySelector("button") : null;

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nameInput = document.getElementById("fullname");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmInput = document.getElementById("confirm");

        const name = (nameInput ? nameInput.value : "").trim();
        const email = (emailInput ? emailInput.value : "").trim();
        const password = passwordInput ? passwordInput.value : "";
        const confirm = confirmInput ? confirmInput.value : "";

        if (!name) {
            alert("Please enter your full name.");
            if (nameInput) nameInput.focus();
            return;
        }

        if (!email) {
            alert("Please enter your email address.");
            if (emailInput) emailInput.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            if (emailInput) emailInput.focus();
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            if (passwordInput) passwordInput.focus();
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match. Please re-enter.");
            if (confirmInput) confirmInput.focus();
            return;
        }

        const originalBtnText = submitButton ? submitButton.textContent : "Create Account";
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
        }

        try {
            const registerApiUrl =
                (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.register) ||
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                    ? "http://localhost:5000/api/auth/register"
                    : `${(window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "")}/api/auth/register`);

            const response = await fetch(registerApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Registration failed. Please try again.");
            }

            // Save profile details to localStorage (passwords must NEVER be stored in plain text)
            try {
                const stored = JSON.parse(localStorage.getItem("registered_users") || "[]");
                const existingIndex = stored.findIndex(
                    (u) => u.email.toLowerCase() === email.toLowerCase()
                );
                const userRecord = {
                    id: data.user ? data.user.id : Date.now(),
                    full_name: name,
                    fullName: name,
                    email: email,
                    role: "Customer",
                    status: "Active"
                };
                if (existingIndex >= 0) {
                    stored[existingIndex] = userRecord;
                } else {
                    stored.push(userRecord);
                }
                localStorage.setItem("registered_users", JSON.stringify(stored));
            } catch (storageErr) {
                console.warn("Storage warning:", storageErr);
            }

            alert("Account Created Successfully! Redirecting to login...");
            window.location.href = "login.html";

        } catch (error) {
            console.error("Registration error:", error);

            alert(error.message || "An error occurred during registration. Please try again.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalBtnText;
            }
        }
    });
}