"use strict";

const checkInInput = document.getElementById("check-in");
const checkOutInput = document.getElementById("check-out");
const searchButton = document.querySelector(".search-room-btn");

const today = new Date().toISOString().split("T")[0];

if (checkInInput && checkOutInput) {
    checkInInput.min = today;
    checkOutInput.min = today;

    checkInInput.addEventListener("change", function () {
        checkOutInput.min = checkInInput.value;

        if (
            checkOutInput.value &&
            checkOutInput.value < checkInInput.value
        ) {
            checkOutInput.value = "";
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", function () {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const guests = document.getElementById("guests").value;

        if (!checkIn || !checkOut) {
            alert("Please select check-in and check-out dates.");
            return;
        }

        if (checkOut <= checkIn) {
            alert("Check-out date must be after check-in date.");
            return;
        }

        alert(
            `Searching availability for ${guests} guest(s) from ${checkIn} to ${checkOut}.`
        );
    });
}

/* Footer current year */
const currentYearElement = document.getElementById("current-year");

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

console.log("Willuda Inn loaded successfully.");

