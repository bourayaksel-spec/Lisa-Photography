document.addEventListener("DOMContentLoaded", function () {

    const filterButtons = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");

    let currentFilter = "all";


    function getVisibleItems() {

        return Array.from(galleryItems).filter(function (item) {

            return !item.classList.contains("hidden");

        });

    }


    /* =========================
       PORTFOLIO FILTERS
    ========================= */

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            currentFilter = button.dataset.filter;

            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");


            galleryItems.forEach(function (item) {

                const categories =
                    item.dataset.category.split(" ");

                if (
                    currentFilter === "all" ||
                    categories.includes(currentFilter)
                ) {

                    item.classList.remove("hidden");

                } else {

                    item.classList.add("hidden");

                }

            });

        });

    });


    /* =========================
       LIGHTBOX
    ========================= */

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
    const lightboxCounter =
    document.getElementById("lightbox-counter");


    let currentImage = 0;


    function showImage(index) {

        const visibleItems = getVisibleItems();

        if (!visibleItems.length) {
            return;
        }


        if (index < 0) {
            index = visibleItems.length - 1;
        }


        if (index >= visibleItems.length) {
            index = 0;
        }


        currentImage = index;


        const image =
            visibleItems[currentImage].querySelector("img");


       lightboxImage.src = image.src;

lightboxImage.alt = image.alt;

if (lightboxCounter) {

    lightboxCounter.textContent =
        (currentImage + 1) +
        " / " +
        visibleItems.length;

}

lightbox.style.display = "flex";

    }


    galleryItems.forEach(function (item) {

        const image =
            item.querySelector("img");


        image.addEventListener("click", function () {

            const visibleItems = getVisibleItems();

            const index =
                visibleItems.indexOf(item);


            if (index !== -1) {

                showImage(index);

            }

        });

    });


    /* =========================
       NEXT
    ========================= */

    if (nextButton) {

        nextButton.addEventListener("click", function () {

            showImage(currentImage + 1);

        });

    }


    /* =========================
       PREVIOUS
    ========================= */

    if (previousButton) {

        previousButton.addEventListener("click", function () {

            showImage(currentImage - 1);

        });

    }


    /* =========================
       CLOSE
    ========================= */

    if (closeButton) {

        closeButton.addEventListener("click", function () {

            lightbox.style.display = "none";

        });

    }


    if (lightbox) {

        lightbox.addEventListener("click", function (event) {

            if (event.target === lightbox) {

                lightbox.style.display = "none";

            }

        });

    }


    /* =========================
       KEYBOARD
    ========================= */

    document.addEventListener("keydown", function (event) {

        if (!lightbox ||
            lightbox.style.display !== "flex") {

            return;

        }


        if (event.key === "Escape") {

            lightbox.style.display = "none";

        }


        if (event.key === "ArrowRight") {

            showImage(currentImage + 1);

        }


        if (event.key === "ArrowLeft") {

            showImage(currentImage - 1);

        }

    });
/* =========================
       MOBILE SWIPE
    ========================= */

    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {

        lightbox.addEventListener("touchstart", function (event) {

            touchStartX = event.changedTouches[0].screenX;

        }, { passive: true });


        lightbox.addEventListener("touchend", function (event) {

            touchEndX = event.changedTouches[0].screenX;

            const swipeDistance =
                touchEndX - touchStartX;


            // Swipe left → Next
            if (swipeDistance < -50) {

                showImage(currentImage + 1);

            }


            // Swipe right → Previous
            if (swipeDistance > 50) {

                showImage(currentImage - 1);

            }

        }, { passive: true });

    }
});
