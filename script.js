document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE CONFIGURATION
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    const PORTFOLIO_BUCKET = "portfolio";


    /* =========================================================
       PORTFOLIO
    ========================================================= */

    const gallery =
        document.getElementById("portfolio-gallery");

    let galleryImages = [];

    let currentImage = 0;


    /*
       Folder names = portfolio categories
    */

    const portfolioCategories = [
        "portraits",
        "couples",
        "sports",
        "landscapes",
        "real-estate",
        "lifestyle"
    ];


    /*
       Create public URL for a Storage file
    */

    function getPublicImageUrl(path) {

        const { data } =
            supabaseClient.storage
                .from(PORTFOLIO_BUCKET)
                .getPublicUrl(path);

        return data.publicUrl;

    }


    /*
       Load images from a category
    */

    async function loadPortfolio() {

        if (!gallery) {
            return;
        }

        gallery.innerHTML = "";

        try {

            for (const category of portfolioCategories) {

                const { data, error } =
                    await supabaseClient.storage
                        .from(PORTFOLIO_BUCKET)
                        .list(category, {
                            limit: 100,
                            offset: 0,
                            sortBy: {
                                column: "name",
                                order: "asc"
                            }
                        });


                if (error) {

                    console.error(
                        `Error loading ${category}:`,
                        error
                    );

                    continue;

                }


                if (!data || !data.length) {
                    continue;
                }


                data.forEach(function (file) {

                    /*
                       Ignore folders
                    */

                    if (!file.name) {
                        return;
                    }


                    /*
                       Only display image files
                    */

                    const extension =
                        file.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const allowedExtensions = [
                        "jpg",
                        "jpeg",
                        "png",
                        "webp",
                        "avif"
                    ];


                    if (
                        !allowedExtensions.includes(
                            extension
                        )
                    ) {
                        return;
                    }


                    const path =
                        `${category}/${file.name}`;


                    const imageUrl =
                        getPublicImageUrl(path);


                    /*
                       Create gallery item
                    */

                    const galleryItem =
                        document.createElement("div");

                    galleryItem.className =
                        "gallery-item";


                    galleryItem.dataset.category =
                        category;


                    /*
                       Image
                    */

                    const image =
                        document.createElement("img");


                    image.src = imageUrl;

                    image.alt =
                        `Lisa Michelle Visuals - ${category.replace("-", " ")} photography`;

                    image.loading = "lazy";

                    image.decoding = "async";

                    image.draggable = false;


                    /*
                       Prevent right click
                    */

                    image.addEventListener(
                        "contextmenu",
                        function (event) {

                            event.preventDefault();

                        }
                    );


                    galleryItem.appendChild(image);

                    gallery.appendChild(galleryItem);


                    /*
                       Open Lightbox
                    */

                    image.addEventListener(
                        "click",
                        function () {

                            const visibleImages =
                                getVisibleGalleryImages();

                            const index =
                                visibleImages.indexOf(
                                    image
                                );

                            if (index !== -1) {

                                showGalleryImage(
                                    index
                                );

                            }

                        }
                    );

                });

            }


            /*
               Refresh image collection
            */

            galleryImages =
                Array.from(
                    gallery.querySelectorAll("img")
                );


            console.log(
                `Portfolio loaded: ${galleryImages.length} images`
            );


        } catch (error) {

            console.error(
                "Portfolio loading error:",
                error
            );

            gallery.innerHTML = `
                <p class="portfolio-error">
                    Unable to load portfolio images.
                </p>
            `;

        }

    }


    /* =========================================================
       PORTFOLIO LIGHTBOX
    ========================================================= */

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


    /*
       Get only visible images
    */

    function getVisibleGalleryImages() {

        return Array.from(galleryImages).filter(
            function (image) {

                const galleryItem =
                    image.closest(".gallery-item");

                return (
                    galleryItem &&
                    !galleryItem.classList.contains(
                        "hidden"
                    )
                );

            }
        );

    }


    /*
       Show image
    */

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


        if (index < 0) {
            index = 0;
        }


        if (
            index >= visibleImages.length
        ) {
            index =
                visibleImages.length - 1;
        }


        currentImage = index;


        lightboxImage.src =
            visibleImages[currentImage].src;


        lightboxImage.alt =
            visibleImages[currentImage].alt;


        lightbox.style.display = "flex";


        updateLightboxButtons();

    }


    /*
       Update Previous / Next buttons
    */

    function updateLightboxButtons() {

        const visibleImages =
            getVisibleGalleryImages();


        if (!visibleImages.length) {
            return;
        }


        if (previousButton) {

            previousButton.style.visibility =
                currentImage === 0
                    ? "hidden"
                    : "visible";

        }


        if (nextButton) {

            nextButton.style.visibility =
                currentImage ===
                visibleImages.length - 1
                    ? "hidden"
                    : "visible";

        }

    }


    /* =========================================================
       CLOSE LIGHTBOX
    ========================================================= */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                lightbox.style.display = "none";

            }
        );

    }


    /* =========================================================
       NEXT IMAGE
    ========================================================= */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                const visibleImages =
                    getVisibleGalleryImages();


                if (
                    currentImage <
                    visibleImages.length - 1
                ) {

                    currentImage++;

                    showGalleryImage(
                        currentImage
                    );

                }

            }
        );

    }


    /* =========================================================
       PREVIOUS IMAGE
    ========================================================= */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                if (currentImage > 0) {

                    currentImage--;

                    showGalleryImage(
                        currentImage
                    );

                }

            }
        );

    }


    /* =========================================================
       CLOSE WHEN CLICKING OUTSIDE
    ========================================================= */

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox
                ) {

                    lightbox.style.display =
                        "none";

                }

            }
        );

    }


    /* =========================================================
       KEYBOARD NAVIGATION
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !lightbox ||
                lightbox.style.display !== "flex"
            ) {
                return;
            }


            if (event.key === "Escape") {

                lightbox.style.display =
                    "none";

            }


            else if (
                event.key === "ArrowRight"
            ) {

                if (nextButton) {
                    nextButton.click();
                }

            }


            else if (
                event.key === "ArrowLeft"
            ) {

                if (previousButton) {
                    previousButton.click();
                }

            }

        }
    );


    /* =========================================================
       MOBILE SWIPE
    ========================================================= */

    let touchStartX = 0;

    let touchEndX = 0;


    if (lightboxImage) {

        lightboxImage.addEventListener(
            "touchstart",
            function (event) {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;

            }
        );


        lightboxImage.addEventListener(
            "touchend",
            function (event) {

                touchEndX =
                    event.changedTouches[0]
                        .screenX;


                const swipeDistance =
                    touchEndX - touchStartX;


                if (swipeDistance < -50) {

                    if (nextButton) {
                        nextButton.click();
                    }

                }


                else if (
                    swipeDistance > 50
                ) {

                    if (previousButton) {
                        previousButton.click();
                    }

                }

            }
        );

    }


    /* =========================================================
       PORTFOLIO FILTERS
    ========================================================= */

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        button.dataset.filter;


                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const items =
                        document.querySelectorAll(
                            ".gallery-item"
                        );


                    items.forEach(
                        function (item) {

                            const category =
                                item.dataset.category;


                            if (
                                filter === "all" ||
                                category === filter
                            ) {

                                item.classList.remove(
                                    "hidden"
                                );

                            } else {

                                item.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );

                }
            );

        }
    );


    /* =========================================================
       BOOKING FORM
    ========================================================= */

    const bookingForm =
        document.getElementById(
            "booking-form"
        );


    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const submitButton =
                    bookingForm.querySelector(
                        "button[type='submit']"
                    );


                submitButton.disabled = true;

                submitButton.textContent =
                    "SENDING...";


                try {

                    const response =
                        await fetch(
                            bookingForm.action,
                            {
                                method: "POST",
                                body:
                                    new FormData(
                                        bookingForm
                                    ),
                                headers: {
                                    "Accept":
                                        "application/json"
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

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SEND REQUEST";


                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

                } catch (error) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "SEND REQUEST";


                    alert(
                        "Unable to send your request. Please try again."
                    );

                }

            }
        );

    }


    /* =========================================================
       MOBILE MENU
    ========================================================= */

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );


    const navLinks =
        document.querySelector(
            ".nav-links"
        );


    if (
        menuToggle &&
        navLinks
    ) {

        menuToggle.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "active"
                );

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            navLinks.classList.remove(
                                "active"
                            );

                        }
                    );

                }
            );

    }


    /* =========================================================
       STAR RATING
    ========================================================= */

    const stars =
        document.querySelectorAll(
            ".stars .star"
        );


    const ratingValue =
        document.getElementById(
            "rating-value"
        );


    stars.forEach(
        function (star) {

            star.addEventListener(
                "click",
                function () {

                    const rating =
                        Number(
                            star.dataset.rating
                        );


                    if (ratingValue) {

                        ratingValue.value =
                            rating;

                    }


                    stars.forEach(
                        function (item) {

                            const itemRating =
                                Number(
                                    item.dataset.rating
                                );


                            if (
                                itemRating <=
                                rating
                            ) {

                                item.classList.add(
                                    "selected"
                                );

                            } else {

                                item.classList.remove(
                                    "selected"
                                );

                            }

                        }
                    );

                }
            );

        }
    );


    /* =========================================================
       REVIEW FORM
    ========================================================= */

    const reviewForm =
        document.getElementById(
            "review-form"
        );


    if (reviewForm) {

        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const submitButton =
                    reviewForm.querySelector(
                        "button[type='submit']"
                    );


                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "SENDING...";


                try {

                    const response =
                        await fetch(
                            reviewForm.action,
                            {
                                method: "POST",
                                body:
                                    new FormData(
                                        reviewForm
                                    ),
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

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SUBMIT REVIEW";


                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

                } catch (error) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "SUBMIT REVIEW";


                    alert(
                        "Unable to send your review. Please try again."
                    );

                }

            }
        );

    }


    /* =========================================================
       AUTOMATIC COPYRIGHT YEAR
    ========================================================= */

    const currentYears =
        document.querySelectorAll(
            ".current-year"
        );


    currentYears.forEach(
        function (year) {

            year.textContent =
                new Date().getFullYear();

        }
    );


    /* =========================================================
       LOAD PORTFOLIO
    ========================================================= */

    loadPortfolio();

});
