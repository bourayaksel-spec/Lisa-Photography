document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       BOOKING FORM
    ========================= */

    const bookingForm = document.getElementById("booking-form");

    if (bookingForm) {

        bookingForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const submitButton =
                bookingForm.querySelector("button[type='submit']");

            submitButton.disabled = true;
            submitButton.textContent = "SENDING...";

            try {

                const response = await fetch(
                    bookingForm.action,
                    {
                        method: "POST",
                        body: new FormData(bookingForm),
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                if (response.ok) {

                    bookingForm.innerHTML = `
                        <div class="form-success">

                            <h3>Thank you.</h3>

                            <p>
                                Your request has been received successfully.
                                Lisa will get back to you as soon as possible.
                            </p>

                        </div>
                    `;

                } else {

                    submitButton.disabled = false;
                    submitButton.textContent = "SEND REQUEST";

                    alert(
                        "Something went wrong. Please try again."
                    );

                }

            } catch (error) {

                submitButton.disabled = false;
                submitButton.textContent = "SEND REQUEST";

                alert(
                    "Unable to send your request. Please try again."
                );

            }

        });

    }


    /* =========================
       PORTFOLIO LIGHTBOX
    ========================= */

    const galleryImages =
        document.querySelectorAll(".gallery img");

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightbox-image");

    const closeButton =
        document.querySelector(".close");

    const previousButton =
        document.getElementById("prev");

    const nextButton =
        document.getElementById("next");

    let currentImage = 0;


    function showGalleryImage(index) {

        if (!galleryImages.length || !lightbox || !lightboxImage) {
            return;
        }

        currentImage = index;

        lightboxImage.src =
            galleryImages[currentImage].src;

        lightbox.style.display = "flex";
    }


    galleryImages.forEach(function (image, index) {

        image.addEventListener("click", function () {

            showGalleryImage(index);

        });

    });


    if (closeButton) {

        closeButton.addEventListener("click", function () {

            lightbox.style.display = "none";

        });

    }


    if (nextButton) {

        nextButton.addEventListener("click", function () {

            currentImage++;

            if (currentImage >= galleryImages.length) {
                currentImage = 0;
            }

            showGalleryImage(currentImage);

        });

    }


    if (previousButton) {

        previousButton.addEventListener("click", function () {

            currentImage--;

            if (currentImage < 0) {
                currentImage = galleryImages.length - 1;
            }

            showGalleryImage(currentImage);

        });

    }


    if (lightbox) {

        lightbox.addEventListener("click", function (event) {

            if (event.target === lightbox) {

                lightbox.style.display = "none";

            }

        });

    }

/* =========================================================
   LIGHTBOX KEYBOARD NAVIGATION
========================================================= */

document.addEventListener("keydown", function (event) {

    // التحقق من أن الـ Lightbox مفتوح على الشاشة
    if (!lightbox || lightbox.style.display !== "flex") {
        return;
    }

    if (event.key === "Escape") {

        lightbox.style.display = "none";

    } else if (event.key === "ArrowRight") {

        if (nextButton) {
            nextButton.click();
        }

    } else if (event.key === "ArrowLeft") {

        if (previousButton) {
            previousButton.click();
        }

    }

});

    
    /* =========================
       MOBILE MENU
    ========================= */

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");


    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", function () {

            navLinks.classList.toggle("active");

        });


        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.classList.remove("active");

            });

        });

    }


  /* =========================================================
   STAR RATING
========================================================= */

const stars = document.querySelectorAll(".stars .star");
const ratingValue = document.getElementById("rating-value");

stars.forEach((star) => {

    star.addEventListener("click", () => {

        const rating = Number(star.dataset.rating);

        // Save rating
        ratingValue.value = rating;

        // Update stars
        stars.forEach((item) => {

            const itemRating = Number(item.dataset.rating);

            if (itemRating <= rating) {
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }

        });

    });

});

    /* =========================
       REVIEW FORM
    ========================= */

    const reviewForm =
        document.getElementById("review-form");


    if (reviewForm) {

        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const submitButton =
                    reviewForm.querySelector(
                        "button[type='submit']"
                    );


                submitButton.disabled = true;
                submitButton.textContent = "SENDING...";


                try {

                    const response =
                        await fetch(
                            reviewForm.action,
                            {
                                method: "POST",
                                body: new FormData(reviewForm),
                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }
                        );


                    if (response.ok) {

                        reviewForm.innerHTML = `
                            <div class="form-success">

                                <h3>
                                    Thank you.
                                </h3>

                                <p>
                                    Your review has been received.
                                    Thank you for sharing your experience.
                                </p>

                            </div>
                        `;

                    } else {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "SUBMIT REVIEW";

                        alert(
                            "Something went wrong. Please try again."
                        );

                    }


                } catch (error) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "SUBMIT REVIEW";

                    alert(
                        "Unable to send your review. Please try again."
                    );

                }

            }
        );

    }


    /* =========================
       AUTOMATIC COPYRIGHT YEAR
    ========================= */

   const currentYears =
    document.querySelectorAll(".current-year");

currentYears.forEach(function (year) {

    year.textContent =
        new Date().getFullYear();

});
});
// Protect images
document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
});









