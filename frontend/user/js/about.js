"use strict";

/* =========================================
   STATISTICS COUNTER
========================================= */

const counters = document.querySelectorAll(".stat-box h2");

function animateCounter(counter) {

    const targetText = counter.innerText;

    const targetNumber = parseInt(
        targetText.replace(/\D/g, "")
    );

    const suffix = targetText.replace(
        targetNumber,
        ""
    );

    let count = 0;

    const increment =
        Math.ceil(targetNumber / 100);

    const timer = setInterval(() => {

        count += increment;

        if (count >= targetNumber) {

            counter.innerText =
                targetNumber + suffix;

            clearInterval(timer);

        } else {

            counter.innerText =
                count + suffix;
        }

    }, 20);
}

/* =========================================
   INTERSECTION OBSERVER
========================================= */

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                animateCounter(
                    entry.target
                );

                observer.unobserve(
                    entry.target
                );
            }
        });
    },

    {
        threshold: 0.5
    }
);

counters.forEach((counter) => {

    observer.observe(counter);

});

/* =========================================
   SCROLL ANIMATION
========================================= */

const animatedElements = document.querySelectorAll(
    ".mission-card, .service-card, .story-content"
);

const animationObserver =
    new IntersectionObserver(

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

animatedElements.forEach((element) => {

    element.style.opacity = "0";

    element.style.transform =
        "translateY(50px)";

    element.style.transition =
        "all 0.8s ease";

    animationObserver.observe(
        element
    );

});

/* =========================================
   NAVBAR EFFECT
========================================= */

const navbar =
    document.querySelector(".navbar");

window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 100) {

            navbar.style.background =
                "#111b31";

            navbar.style.padding =
                "20px";

            navbar.style.borderRadius =
                "10px";

        } else {

            navbar.style.background =
                "transparent";

            navbar.style.padding =
                "25px 0";
        }
    }
);

/* =========================================
   WELCOME MESSAGE
========================================= */

window.addEventListener(
    "load",
    () => {

        console.log(
            "Welcome to Willuda Inn."
        );
    }
);