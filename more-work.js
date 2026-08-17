document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const BUCKET_NAME = "portfolio";


    /* =========================================================
       PORTFOLIO FILES
    ========================================================= */

    const portfolioFiles = [

        {
            path: "portraits/19.webp",
            category: "portraits"
        },

        {
            path: "landscapes/6.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/7.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/8.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/9.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/10.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/11.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/12.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/13.webp",
            category: "landscapes"
        },

        {
            path: "landscapes/14.webp",
            category: "landscapes"
        }

    ];


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const gallery =
        document.getElementById("portfolio-gallery");

    const loadingMessage =
        document.getElementById("gallery-loading");

    const errorMessage =
        document.getElementById("gallery-error");

    const emptyMessage =
        document.getElementById("gallery-empty");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    /* =========================================================
       LIGHTBOX
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

    const lightboxCounter =
        document.getElementById("lightbox-counter");


    let currentImage = 0;

    let touchStartX = 0;


    /* =========================================================
       PUBLIC IMAGE URL
    ========================================================= */

    function getPublicImageUrl(path) {

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET_NAME +
            "/" +
            path
        );

    }


    /* =========================================================
       ALT TEXT
    ========================================================= */

    function getAltText(category) {

        const altTexts = {

            portraits:
                "Portrait photography by Lisa Michelle Visuals in East Alabama",

            couples:
                "Couples photography by Lisa Michelle Visuals in East Alabama",

            sports:
                "Sports photography by Lisa Michelle Visuals in East Alabama",

            landscapes:
                "Landscape photography by Lisa Michelle Visuals in East Alabama",

            "real-estate":
                "Real estate photography by Lisa Michelle Visuals in East Alabama",

            lifestyle:
                "Lifestyle photography by Lisa Michelle Visuals in East Alabama"

        };

        return (
            altTexts[category] ||
            "Photography by Lisa Michelle Visuals"
        );

    }


    /* =========================================================
       CREATE IMAGE
    ========================================================= */

    function createGalleryItem(file) {

        const item =
            document.createElement("div");

        item.className =
            "gallery-item";

        item.dataset.category =
            file.category;


        const image =
            document.createElement("img");

        image.src =
            getPublicImageUrl(file.path);

        image.alt =
            getAltText(file.category);

        image.loading =
            "lazy";

        image.decoding =
            "async";

        image.draggable =
            false;


        /* Prevent right click */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        /* Open lightbox */

        image.addEventListener(
            "click",
            function () {

                const visibleImages =
                    getVisibleGalleryImages();

                const index =
                    visibleImages.indexOf(image);

                if (index !== -1) {

                    showGalleryImage(index);

                }

            }
        );


        /* Image loading error */

        image.addEventListener(
            "error",
            function () {

                console.error(
                    "Could not load image:",
                    image.src
                );

            }
        );


        item.appendChild(image);

        gallery.appendChild(item);

    }


    /* =========================================================
       LOAD PORTFOLIO
    ========================================================= */

    function loadPortfolio() {

        loadingMessage.style.display =
            "block";

        errorMessage.style.display =
            "none";

        emptyMessage.style.display =
            "none";

        gallery.innerHTML = "";


        if (
            portfolioFiles.length === 0
        ) {

            loadingMessage.style.display =
                "none";

            emptyMessage.style.display =
                "block";

            return;

        }


        portfolioFiles.forEach(
            function (file) {

                createGalleryItem(file);

            }
        );


        loadingMessage.style.display =
            "none";

    }


    /* =========================================================
       GET VISIBLE IMAGES
    ========================================================= */

    function getVisibleGalleryImages() {

        const images =
            gallery.querySelectorAll("img");


        return Array.from(images)
            .filter(function (image) {

                const item =
                    image.closest(".gallery-item");


                return (
                    item &&
                    !item.classList.contains("hidden")
                );

            });

    }


    /* =========================================================
       SHOW LIGHTBOX
    ========================================================= */

    function showGalleryImage(index) {

        const visibleImages =
            getVisibleGalleryImages();


        if (
            !visibleImages.length
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


        currentImage =
            index;


        const image =
            visibleImages[currentImage];


        lightboxImage.src =
            image.src;

        lightboxImage.alt =
            image.alt;


        lightbox.style.display =
            "flex";


        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );


        updateLightbox();

    }


    /* =========================================================
       UPDATE LIGHTBOX
    ========================================================= */

    function updateLightbox() {

        const visibleImages =
            getVisibleGalleryImages();


        if (
            !visibleImages.length
        ) {

            return;

        }


        if (lightboxCounter) {

            lightboxCounter.textContent =
                `${currentImage + 1} / ${visibleImages.length}`;

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

    function closeLightbox() {

        lightbox.style.display =
            "none";

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        lightboxImage.src =
            "";

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLightbox
        );

    }


    /* =========================================================
       NEXT
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

                    showGalleryImage(
                        currentImage + 1
                    );

                }

            }
        );

    }


    /* =========================================================
       PREVIOUS
    ========================================================= */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                if (
                    currentImage > 0
                ) {

                    showGalleryImage(
                        currentImage - 1
                    );

                }

            }
        );

    }


    /* =========================================================
       CLICK OUTSIDE
    ========================================================= */

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox
                ) {

                    closeLightbox();

                }

            }
        );

    }


    /* =========================================================
       KEYBOARD
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


            if (
                event.key === "Escape"
            ) {

                closeLightbox();

            }


            if (
                event.key === "ArrowRight"
            ) {

                if (nextButton) {

                    nextButton.click();

                }

            }


            if (
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

    if (lightboxImage) {

        lightboxImage.addEventListener(
            "touchstart",
            function (event) {

                touchStartX =
                    event.changedTouches[0].screenX;

            }
        );


        lightboxImage.addEventListener(
            "touchend",
            function (event) {

                const touchEndX =
                    event.changedTouches[0].screenX;


                const distance =
                    touchEndX -
                    touchStartX;


                if (
                    distance < -50 &&
                    nextButton
                ) {

                    nextButton.click();

                }


                else if (
                    distance > 50 &&
                    previousButton
                ) {

                    previousButton.click();

                }

            }
        );

    }


    /* =========================================================
       FILTERS
    ========================================================= */

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
                        gallery.querySelectorAll(
                            ".gallery-item"
                        );


                    let visibleCount = 0;


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

                                visibleCount++;

                            }

                            else {

                                item.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );


                    closeLightbox();


                    emptyMessage.style.display =
                        visibleCount === 0
                            ? "block"
                            : "none";

                }
            );

        }
    );


    /* =========================================================
       MOBILE MENU
    ========================================================= */

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");


    if (
        menuToggle &&
        navLinks
    ) {

        menuToggle.addEventListener(
            "click",
            function () {

                const active =
                    navLinks.classList.toggle(
                        "active"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    active
                        ? "true"
                        : "false"
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


                            menuToggle.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );

                }
            );

    }


    /* =========================================================
       START
    ========================================================= */

    loadPortfolio();

});
