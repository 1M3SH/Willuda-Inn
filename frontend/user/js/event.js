"use strict";

/* ==========================================
   ELEMENTS
========================================== */

const eventCards = document.querySelectorAll(
    ".event-card"
);

const packageCards = document.querySelectorAll(
    ".package-card"
);

const navbar = document.querySelector(
    ".navbar"
);

/* ==========================================
   SCROLL ANIMATION
========================================== */

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                    "translateY(0)";
            }
        });

    },

    {
        threshold: 0.2
    }
);

eventCards.forEach((card) => {

    card.style.opacity = "0";

    card.style.transform =
        "translateY(50px)";

    card.style.transition =
        "all 0.8s ease";

    observer.observe(card);
});

packageCards.forEach((card) => {

    card.style.opacity = "0";

    card.style.transform =
        "translateY(50px)";

    card.style.transition =
        "all 0.8s ease";

    observer.observe(card);
});

/* ==========================================
   PACKAGE EFFECT
========================================== */

packageCards.forEach((card) => {

    card.addEventListener(
        "click",
        () => {

            const packageName =
                card.querySelector("h3")
                    .innerText;

            alert(
                packageName +
                " selected successfully."
            );
        }
    );
});

/* ==========================================
   NAVIGATION EFFECT
========================================== */

window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 80) {

            navbar.style.background =
                "#111b31";

            navbar.style.padding =
                "20px";

            navbar.style.borderRadius =
                "12px";

        } else {

            navbar.style.background =
                "transparent";

            navbar.style.padding =
                "25px 0";
        }
    }
);

/* ==========================================
   EVENT CARD EFFECT
========================================== */

eventCards.forEach((card) => {

    card.addEventListener(
        "mouseenter",
        () => {

            card.style.transform =
                "translateY(-10px)";
        }
    );

    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform =
                "translateY(0)";
        }
    );
});

/* ==========================================
   PAGE LOADED
========================================== */

window.addEventListener(
    "load",
    () => {

        console.log(
            "Events page loaded successfully."
        );
    }
);