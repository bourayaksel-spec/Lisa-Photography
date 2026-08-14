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


/*
   Get only the images that are currently visible
   after applying the portfolio filter.
*/
function getVisibleGalleryImages() {

    return Array.from(galleryImages).filter(function (image) {

        const galleryItem =
            image.closest(".gallery-item");

        return galleryItem &&
               !galleryItem.classList.contains("hidden");

    });

}


function showGalleryImage(index) {

    const visibleImages =
        getVisibleGalleryImages();

    if (
        !visibleImages.length ||
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }

    // Keep index inside the visible images
    if (index < 0) {
        index = 0;
    }

    if (index >= visibleImages.length) {
        index = visibleImages.length - 1;
    }

    currentImage = index;

    lightboxImage.src =
        visibleImages[currentImage].src;

    lightboxImage.alt =
        visibleImages[currentImage].alt;

    lightbox.style.display = "flex";

    updateLightboxButtons();
}


function updateLightboxButtons() {

    const visibleImages =
        getVisibleGalleryImages();

    if (!visibleImages.length) {
        return;
    }

    /*
       Hide the Previous button on the first image
       and Next button on the last image.
    */

    if (previousButton) {

        previousButton.style.visibility =
            currentImage === 0
                ? "hidden"
                : "visible";

    }

    if (nextButton) {

        nextButton.style.visibility =
            currentImage === visibleImages.length - 1
                ? "hidden"
                : "visible";

    }

}


/* Open image */

galleryImages.forEach(function (image) {

    image.addEventListener("click", function () {

        const visibleImages =
            getVisibleGalleryImages();

        const index =
            visibleImages.indexOf(image);

        if (index !== -1) {

            showGalleryImage(index);

        }

    });

});


/* Close */

if (closeButton) {

    closeButton.addEventListener("click", function () {

        lightbox.style.display = "none";

    });

}


/* Next */

if (nextButton) {

    nextButton.addEventListener("click", function () {

        const visibleImages =
            getVisibleGalleryImages();

        if (
            currentImage <
            visibleImages.length - 1
        ) {

            currentImage++;

            showGalleryImage(currentImage);

        }

    });

}


/* Previous */

if (previousButton) {

    previousButton.addEventListener("click", function () {

        if (currentImage > 0) {

            currentImage--;

            showGalleryImage(currentImage);

        }

    });

}


/* Close when clicking outside image */

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

    if (
        !lightbox ||
        lightbox.style.display !== "flex"
    ) {
        return;
    }

    if (event.key === "Escape") {

        lightbox.style.display = "none";

    }

    else if (event.key === "ArrowRight") {

        if (nextButton) {
            nextButton.click();
        }

    }

    else if (event.key === "ArrowLeft") {

        if (previousButton) {
            previousButton.click();
        }

    }

});
/* =========================================================
   MOBILE SWIPE
========================================================= */

let touchStartX = 0;
let touchEndX = 0;

lightboxImage.addEventListener("touchstart", function (event) {

    touchStartX = event.changedTouches[0].screenX;

});


lightboxImage.addEventListener("touchend", function (event) {

    touchEndX = event.changedTouches[0].screenX;

    const swipeDistance =
        touchEndX - touchStartX;

    // Swipe left → Next
    if (swipeDistance < -50) {

        if (nextButton) {
            nextButton.click();
        }

    }

    // Swipe right → Previous
    else if (swipeDistance > 50) {

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
// Protect images

document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
});
    /* =========================
   PORTFOLIO FILTERS
========================= */

const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        galleryItems.forEach(item => {

            const categories = item.dataset.category.split(" ");

            if (
                filter === "all" ||
                categories.includes(filter)
            ) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }

        });

    });

});
});










