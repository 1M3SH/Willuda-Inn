"use strict";

const resetForm = document.getElementById("resetPasswordForm");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const resetMessage = document.getElementById("resetMessage");
const resetButton = document.getElementById("resetButton");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

const rules = [
    ["lengthRule", (value) => value.length >= 8],
    ["upperRule", (value) => /[A-Z]/.test(value)],
    ["lowerRule", (value) => /[a-z]/.test(value)],
    ["numberRule", (value) => /\d/.test(value)],
    ["specialRule", (value) => /[^A-Za-z0-9]/.test(value)]
];

function showError(input, message) {
    input.classList.toggle("invalid", Boolean(message));
    document.getElementById(`${input.id}Error`).textContent = message;
}

function updateStrength() {
    const value = newPassword.value;
    const passed = rules.filter(([, validate]) => validate(value)).length;
    rules.forEach(([id, validate]) => {
        const rule = document.getElementById(id);
        const valid = validate(value);
        rule.classList.toggle("valid", valid);
        rule.querySelector("i").className = valid ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
    });
    strengthFill.className = "strength-fill";
    if (!value) { strengthText.textContent = "Not entered"; return false; }
    const labels = ["", "Weak", "Weak", "Fair", "Good", "Strong"];
    strengthText.textContent = labels[passed];
    strengthFill.classList.add(["", "weak", "weak", "fair", "good", "strong"][passed]);
    return passed === rules.length;
}

document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const visible = input.type === "text";
        input.type = visible ? "password" : "text";
        button.setAttribute("aria-label", `${visible ? "Show" : "Hide"} password`);
        button.querySelector("i").className = visible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
    });
});

newPassword.addEventListener("input", () => { updateStrength(); showError(newPassword, ""); });
confirmPassword.addEventListener("input", () => showError(confirmPassword, ""));

resetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const isStrong = updateStrength();
    const matches = newPassword.value === confirmPassword.value;
    showError(newPassword, isStrong ? "" : "Use all five password requirements.");
    showError(confirmPassword, matches ? "" : "Passwords do not match.");
    if (!isStrong || !matches) return;

    localStorage.setItem("willudaUserPassword", newPassword.value);
    resetMessage.hidden = false;
    resetMessage.className = "form-message success";
    resetMessage.textContent = "Your password has been reset. Redirecting you to login…";
    resetButton.disabled = true;
    resetButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> Password Reset';
    window.setTimeout(() => { window.location.href = "login.html"; }, 1400);
});
