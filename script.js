document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE CONFIGURATION
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET_NAME = "portfolio";
    const FEATURED_FOLDER = "featured";

    const categories = [
        "portraits",
        "couples",
        "sports",
        "landscapes",
        "real-estate",
        "lifestyle"
    ];


    /* =========================================================
       DOM ELEMENTS
    ========================================================= */

    const gallery =
        document.getElementById("portfolio-gallery");

    const portfolioLoading =
        document.getElementById("portfolio-loading");

    const portfolioError =
        document.getElementById("portfolio-error");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

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

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");


    /* =========================================================
       STATE
    ========================================================= */

    let currentFilter = "all";
    let currentImage = 0;

    let allPortfolioFiles = [];

    let largeImagePath = null;

    let lightboxItems = [];


    /* =========================================================
       SUPABASE HEADERS
    ========================================================= */

    const supabaseHeaders = {
        "Authorization":
            `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

        "apikey":
            SUPABASE_PUBLISHABLE_KEY,

        "Content-Type":
            "application/json"
    };


    /* =========================================================
       PUBLIC IMAGE URL
    ========================================================= */

    function getPublicImageUrl(filePath) {

        const normalized =
            normalizeImagePath(filePath);

        if (!normalized) {
            return "";
        }

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET_NAME +
            "/" +
            normalized
        );
    }


    /* =========================================================
       NORMALIZE PATH
    ========================================================= */

    function normalizeImagePath(path) {

        if (!path) {
            return "";
        }

        return String(path)
            .trim()
            .replace(/^\/+/, "")
            .replace(/\\/g, "/");
    }


    /* =========================================================
       GET CATEGORY FROM PATH
    ========================================================= */

    function getCategoryFromPath(filePath) {

        const path =
            normalizeImagePath(filePath);

        if (!path) {
            return "";
        }

        const parts =
            path.split("/");

        /*
           Example:

           featured/portraits/19.webp

           parts[0] = featured
           parts[1] = portraits
           parts[2] = 19.webp
        */

        if (
            parts.length >= 3 &&
            parts[0] === FEATURED_FOLDER
        ) {

            return parts[1];
        }

        return "";
    }


    /* =========================================================
       ALT TEXT
    ========================================================= */

    function createAltText(category) {

        const names = {

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
            names[category] ||
            "Photography by Lisa Michelle Visuals in East Alabama"
        );
    }


    /* =========================================================
       IMAGE PROTECTION
    ========================================================= */

    function protectImage(image) {

        if (!image) {
            return;
        }

        image.draggable = false;

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );
    }


    /* =========================================================
       BOOKING FORM
    ========================================================= */

    const bookingForm =
        document.getElementById("booking-form");

    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const submitButton =
                    bookingForm.querySelector(
                        "button[type='submit']"
                    );

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "SENDING...";
                }

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

                    if (!response.ok) {

                        throw new Error(
                            "Booking request failed."
                        );
                    }

                    bookingForm.innerHTML = `
                        <div class="form-success">
                            <h3>Thank you.</h3>
                            <p>
                                Your request has been received successfully.
                                Lisa will get back to you as soon as possible.
                            </p>
                        </div>
                    `;

                } catch (error) {

                    console.error(
                        "Booking error:",
                        error
                    );

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SEND REQUEST";
                    }

                    alert(
                        "Unable to send your request. Please try again."
                    );
                }
            }
        );
    }


    /* =========================================================
       LOAD LARGE IMAGE FROM DATABASE
    ========================================================= */

    async function loadLargeImageSetting() {

        largeImagePath = null;

        try {

            const url =
                SUPABASE_URL +
                "/rest/v1/portfolio_settings" +
                "?select=large_image" +
                "&large_image=not.is.null" +
                "&limit=1";

            console.log(
                "Loading portfolio_settings..."
            );

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {
                            "apikey":
                                SUPABASE_PUBLISHABLE_KEY,

                            "Authorization":
                                `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "portfolio_settings error:",
                    response.status,
                    errorText
                );

                throw new Error(
                    "portfolio_settings request failed: " +
                    response.status
                );
            }

            const data =
                await response.json();

            console.log(
                "portfolio_settings response:",
                data
            );

            if (
                Array.isArray(data) &&
                data.length > 0 &&
                data[0] &&
                data[0].large_image
            ) {

                largeImagePath =
                    normalizeImagePath(
                        data[0].large_image
                    );

            } else {

                largeImagePath = null;
            }

            console.log(
                "Large Image Path:",
                largeImagePath
            );

            if (largeImagePath) {

                const imageUrl =
                    getPublicImageUrl(
                        largeImagePath
                    );

                console.log(
                    "Large Image URL:",
                    imageUrl
                );
            }

            return largeImagePath;

        } catch (error) {

            console.error(
                "Large image setting error:",
                error
            );

            largeImagePath = null;

            return null;
        }
    }


    /* =========================================================
       CREATE LARGE IMAGE SECTION
    ========================================================= */

    function createLargeImageSection() {

        if (!gallery) {
            return;
        }

        /* -----------------------------------------
           REMOVE OLD LARGE IMAGE
        ----------------------------------------- */

        const oldLarge =
            document.getElementById(
                "portfolio-large-image"
            );

        if (oldLarge) {
            oldLarge.remove();
        }


        /* -----------------------------------------
           NO IMAGE
        ----------------------------------------- */

        if (!largeImagePath) {

            console.warn(
                "No Large Image selected."
            );

            return;
        }


        /* -----------------------------------------
           CATEGORY
        ----------------------------------------- */

        const category =
            getCategoryFromPath(
                largeImagePath
            );


        /* -----------------------------------------
           SECTION
        ----------------------------------------- */

        const section =
            document.createElement("div");

        section.id =
            "portfolio-large-image";

        section.className =
            "portfolio-large-image";

        section.dataset.category =
            category;


        /* -----------------------------------------
           INNER WRAPPER
        ----------------------------------------- */

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "portfolio-large-image-inner";


        /* -----------------------------------------
           IMAGE
        ----------------------------------------- */

        const image =
            document.createElement("img");

        const imageUrl =
            getPublicImageUrl(
                largeImagePath
            );

        image.src =
            imageUrl;

        image.alt =
            createAltText(
                category
            );

        image.loading =
            "eager";

        image.decoding =
            "async";

        image.className =
            "portfolio-featured-image";

        protectImage(image);


        /* -----------------------------------------
           CLICK → LIGHTBOX
        ----------------------------------------- */

        image.addEventListener(
            "click",
            function () {

                openLightboxFromPath(
                    largeImagePath
                );

            }
        );


        /* -----------------------------------------
           IMAGE LOAD
        ----------------------------------------- */

        image.addEventListener(
            "load",
            function () {

                section.classList.add(
                    "loaded"
                );

                console.log(
                    "Large Image loaded successfully:",
                    largeImagePath
                );
            }
        );


        /* -----------------------------------------
           IMAGE ERROR
        ----------------------------------------- */

        image.addEventListener(
            "error",
            function () {

                console.error(
                    "Large Image FAILED TO LOAD:",
                    largeImagePath
                );

                console.error(
                    "Image URL:",
                    imageUrl
                );

                section.remove();
            }
        );


        /* -----------------------------------------
           BUILD
        ----------------------------------------- */

        wrapper.appendChild(
            image
        );

        section.appendChild(
            wrapper
        );


        /* -----------------------------------------
           INSERT BEFORE GRID
        ----------------------------------------- */

        gallery.parentNode.insertBefore(
            section,
            gallery
        );


        console.log(
            "Large Image section created."
        );
    }


    /* =========================================================
       LOAD FEATURED CATEGORY
    ========================================================= */

    async function loadFeaturedCategory(
        category
    ) {

        const prefix =
            FEATURED_FOLDER +
            "/" +
            category +
            "/";

        const response =
            await fetch(
                SUPABASE_URL +
                "/storage/v1/object/list/" +
                BUCKET_NAME,
                {
                    method: "POST",

                    headers:
                        supabaseHeaders,

                    body:
                        JSON.stringify({
                            prefix:
                                prefix,

                            limit:
                                1000,

                            offset:
                                0,

                            sortBy: {
                                column:
                                    "name",

                                order:
                                    "asc"
                            }
                        })
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Storage category error:",
                category,
                response.status,
                errorText
            );

            throw new Error(
                "Featured folder failed: " +
                category
            );
        }

        const files =
            await response.json();

        if (!Array.isArray(files)) {
            return [];
        }

        return files
            .filter(function (file) {

                if (
                    !file ||
                    !file.name
                ) {
                    return false;
                }

                if (
                    file.name ===
                    ".emptyFolderPlaceholder"
                ) {
                    return false;
                }

                return (
                    file.metadata ||
                    file.id
                );
            })
            .map(function (file) {

                return {

                    path:
                        prefix +
                        file.name,

                    category:
                        category,

                    name:
                        file.name
                };
            });
    }


    /* =========================================================
       CREATE GALLERY ITEM
    ========================================================= */

    function createGalleryItem(file) {

        if (!gallery) {
            return;
        }

        const item =
            document.createElement("div");

        item.className =
            "gallery-item";

        item.dataset.category =
            file.category;

        item.dataset.path =
            normalizeImagePath(
                file.path
            );


        const image =
            document.createElement("img");

        const imageUrl =
            getPublicImageUrl(
                file.path
            );

        image.src =
            imageUrl;

        image.alt =
            createAltText(
                file.category
            );

        image.loading =
            "lazy";

        image.decoding =
            "async";

        protectImage(image);


        /* -----------------------------------------
           CLICK → LIGHTBOX
        ----------------------------------------- */

        image.addEventListener(
            "click",
            function () {

                openLightboxFromPath(
                    file.path
                );

            }
        );


        /* -----------------------------------------
           ERROR
        ----------------------------------------- */

        image.addEventListener(
            "error",
            function () {

                console.warn(
                    "Gallery image could not load:",
                    file.path
                );

                item.remove();
            }
        );


        item.appendChild(
            image
        );

        gallery.appendChild(
            item
        );
    }


    /* =========================================================
       LOAD PORTFOLIO
    ========================================================= */

    async function loadPortfolio() {

        if (!gallery) {

            console.warn(
                "Portfolio gallery not found."
            );

            return;
        }

        try {

            /* -----------------------------------------
               LOADING
            ----------------------------------------- */

            if (portfolioLoading) {

                portfolioLoading.style.display =
                    "block";
            }

            if (portfolioError) {

                portfolioError.style.display =
                    "none";
            }


            gallery.innerHTML =
                "";

            allPortfolioFiles =
                [];


            /* -----------------------------------------
               LOAD LARGE IMAGE
            ----------------------------------------- */

            await loadLargeImageSetting();


            /* -----------------------------------------
               CREATE LARGE IMAGE
            ----------------------------------------- */

            createLargeImageSection();


            /* -----------------------------------------
               LOAD ALL CATEGORIES
            ----------------------------------------- */

            const results =
                await Promise.allSettled(
                    categories.map(
                        function (category) {

                            return loadFeaturedCategory(
                                category
                            );
                        }
                    )
                );


            /* -----------------------------------------
               COMBINE RESULTS
            ----------------------------------------- */

            results.forEach(
                function (result) {

                    if (
                        result.status ===
                        "fulfilled"
                    ) {

                        allPortfolioFiles =
                            allPortfolioFiles.concat(
                                result.value
                            );

                    } else {

                        console.warn(
                            "Category loading failed:",
                            result.reason
                        );
                    }
                }
            );


            /* -----------------------------------------
               REMOVE LARGE IMAGE FROM GRID
               
               This prevents duplicate images.
            ----------------------------------------- */

            if (largeImagePath) {

                const normalizedLargePath =
                    normalizeImagePath(
                        largeImagePath
                    );

                allPortfolioFiles =
                    allPortfolioFiles.filter(
                        function (file) {

                            return (
                                normalizeImagePath(
                                    file.path
                                ) !==
                                normalizedLargePath
                            );
                        }
                    );
            }


            /* -----------------------------------------
               SORT
            ----------------------------------------- */

            allPortfolioFiles.sort(
                function (a, b) {

                    const first =
                        a.category +
                        "/" +
                        a.name;

                    const second =
                        b.category +
                        "/" +
                        b.name;

                    return first.localeCompare(
                        second,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                }
            );


            /* -----------------------------------------
               CREATE GRID
            ----------------------------------------- */

            allPortfolioFiles.forEach(
                function (file) {

                    createGalleryItem(
                        file
                    );
                }
            );


            /* -----------------------------------------
               APPLY FILTER
            ----------------------------------------- */

            applyPortfolioFilter(
                currentFilter
            );


            /* -----------------------------------------
               STOP LOADING
            ----------------------------------------- */

            if (portfolioLoading) {

                portfolioLoading.style.display =
                    "none";
            }


            /* -----------------------------------------
               EMPTY PORTFOLIO
            ----------------------------------------- */

            if (
                allPortfolioFiles.length === 0 &&
                !largeImagePath
            ) {

                showPortfolioError(
                    "No featured photographs found."
                );
            }

        } catch (error) {

            console.error(
                "Portfolio loading error:",
                error
            );

            if (portfolioLoading) {

                portfolioLoading.style.display =
                    "none";
            }

            showPortfolioError(
                "Unable to load the portfolio. Please try again later."
            );
        }
    }


    /* =========================================================
       PORTFOLIO ERROR
    ========================================================= */

    function showPortfolioError(
        message
    ) {

        if (!portfolioError) {
            return;
        }

        portfolioError.textContent =
            message;

        portfolioError.style.display =
            "block";
    }


    /* =========================================================
       APPLY PORTFOLIO FILTER
    ========================================================= */

    function applyPortfolioFilter(
        filter
    ) {

        currentFilter =
            filter;


        const items =
            gallery
                ? gallery.querySelectorAll(
                    ".gallery-item"
                )
                : [];


        let visibleCount =
            0;


        /* -----------------------------------------
           GRID FILTER
        ----------------------------------------- */

        items.forEach(
            function (item) {

                const category =
                    item.dataset.category;

                const visible =
                    filter === "all" ||
                    category === filter;


                if (visible) {

                    item.classList.remove(
                        "hidden"
                    );

                    visibleCount++;

                } else {

                    item.classList.add(
                        "hidden"
                    );
                }
            }
        );


        /* -----------------------------------------
           LARGE IMAGE FILTER
        ----------------------------------------- */

        const largeSection =
            document.getElementById(
                "portfolio-large-image"
            );


        if (largeSection) {

            const largeCategory =
                largeSection.dataset.category;

            const showLarge =
                filter === "all" ||
                largeCategory === filter;

            largeSection.style.display =
                showLarge
                    ? ""
                    : "none";
        }


        /* -----------------------------------------
           ERROR
        ----------------------------------------- */

        if (portfolioError) {

            if (
                filter !== "all" &&
                visibleCount === 0 &&
                !(
                    largeSection &&
                    largeSection.style.display !== "none"
                )
            ) {

                portfolioError.textContent =
                    "No photographs found in this category.";

                portfolioError.style.display =
                    "block";

            } else {

                portfolioError.style.display =
                    "none";
            }
        }
    }


    /* =========================================================
       FILTER BUTTONS
    ========================================================= */

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        button.dataset.filter ||
                        "all";


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


                    closeLightbox();


                    applyPortfolioFilter(
                        filter
                    );
                }
            );
        }
    );


    /* =========================================================
       GET VISIBLE LIGHTBOX ITEMS
    ========================================================= */

    function getVisibleLightboxItems() {

        const items = [];


        /* -----------------------------------------
           LARGE IMAGE FIRST
        ----------------------------------------- */

        const largeSection =
            document.getElementById(
                "portfolio-large-image"
            );


        if (
            largeSection &&
            largeSection.style.display !== "none" &&
            largeImagePath
        ) {

            const largeCategory =
                getCategoryFromPath(
                    largeImagePath
                );


            items.push({

                path:
                    normalizeImagePath(
                        largeImagePath
                    ),

                src:
                    getPublicImageUrl(
                        largeImagePath
                    ),

                alt:
                    createAltText(
                        largeCategory
                    ),

                category:
                    largeCategory
            });
        }


        /* -----------------------------------------
           GRID IMAGES
        ----------------------------------------- */

        if (gallery) {

            gallery
                .querySelectorAll(
                    ".gallery-item"
                )
                .forEach(
                    function (item) {

                        if (
                            item.classList.contains(
                                "hidden"
                            )
                        ) {
                            return;
                        }


                        const image =
                            item.querySelector(
                                "img"
                            );


                        if (!image) {
                            return;
                        }


                        items.push({

                            path:
                                item.dataset.path,

                            src:
                                image.src,

                            alt:
                                image.alt,

                            category:
                                item.dataset.category
                        });
                    }
                );
        }


        return items;
    }


    /* =========================================================
       OPEN LIGHTBOX
    ========================================================= */

    function openLightboxFromPath(
        path
    ) {

        const normalizedPath =
            normalizeImagePath(
                path
            );


        lightboxItems =
            getVisibleLightboxItems();


        const index =
            lightboxItems.findIndex(
                function (item) {

                    return (
                        item.path ===
                        normalizedPath
                    );
                }
            );


        if (index === -1) {

            console.warn(
                "Lightbox image not found:",
                normalizedPath
            );

            return;
        }


        currentImage =
            index;


        showCurrentLightboxImage();
    }


    /* =========================================================
       SHOW CURRENT LIGHTBOX IMAGE
    ========================================================= */

    function showCurrentLightboxImage() {

        if (
            !lightbox ||
            !lightboxImage ||
            !lightboxItems.length
        ) {
            return;
        }


        const item =
            lightboxItems[
                currentImage
            ];


        if (!item) {
            return;
        }


        lightboxImage.src =
            item.src;

        lightboxImage.alt =
            item.alt;


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

        if (
            !lightboxItems.length
        ) {
            return;
        }


        if (lightboxCounter) {

            lightboxCounter.textContent =
                `${currentImage + 1} / ${lightboxItems.length}`;
        }


        if (previousButton) {

            previousButton.style.visibility =
                currentImage > 0
                    ? "visible"
                    : "hidden";
        }


        if (nextButton) {

            nextButton.style.visibility =
                currentImage <
                lightboxItems.length - 1
                    ? "visible"
                    : "hidden";
        }
    }


    /* =========================================================
       CLOSE LIGHTBOX
    ========================================================= */

    function closeLightbox() {

        if (!lightbox) {
            return;
        }


        lightbox.style.display =
            "none";


        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );


        if (lightboxImage) {

            lightboxImage.src =
                "";
        }


        lightboxItems =
            [];
    }


    /* =========================================================
       CLOSE BUTTON
    ========================================================= */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLightbox
        );
    }


    /* =========================================================
       NEXT IMAGE
    ========================================================= */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                if (
                    currentImage <
                    lightboxItems.length - 1
                ) {

                    currentImage++;

                    showCurrentLightboxImage();
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
            function (event) {

                event.stopPropagation();


                if (
                    currentImage > 0
                ) {

                    currentImage--;

                    showCurrentLightboxImage();
                }
            }
        );
    }


    /* =========================================================
       CLICK OUTSIDE LIGHTBOX
    ========================================================= */

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeLightbox();
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
                lightbox.style.display !==
                    "flex"
            ) {
                return;
            }


            if (
                event.key ===
                "Escape"
            ) {

                closeLightbox();

            } else if (
                event.key ===
                "ArrowRight"
            ) {

                if (
                    currentImage <
                    lightboxItems.length - 1
                ) {

                    currentImage++;

                    showCurrentLightboxImage();
                }

            } else if (
                event.key ===
                "ArrowLeft"
            ) {

                if (
                    currentImage > 0
                ) {

                    currentImage--;

                    showCurrentLightboxImage();
                }
            }
        }
    );


    /* =========================================================
       MOBILE SWIPE
    ========================================================= */

    let touchStartX = 0;


    if (lightboxImage) {

        lightboxImage.addEventListener(
            "touchstart",
            function (event) {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;

            },
            {
                passive: true
            }
        );


        lightboxImage.addEventListener(
            "touchend",
            function (event) {

                const touchEndX =
                    event.changedTouches[0]
                        .screenX;


                const distance =
                    touchEndX -
                    touchStartX;


                if (
                    distance < -50 &&
                    currentImage <
                    lightboxItems.length - 1
                ) {

                    currentImage++;

                    showCurrentLightboxImage();

                } else if (
                    distance > 50 &&
                    currentImage > 0
                ) {

                    currentImage--;

                    showCurrentLightboxImage();
                }

            },
            {
                passive: true
            }
        );
    }


    /* =========================================================
       MOBILE MENU
    ========================================================= */

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


                menuToggle.setAttribute(
                    "aria-label",
                    active
                        ? "Close menu"
                        : "Open menu"
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


                            menuToggle.setAttribute(
                                "aria-label",
                                "Open menu"
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


                            item.classList.toggle(
                                "selected",
                                itemRating <=
                                    rating
                            );
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


                if (
                    ratingValue &&
                    !ratingValue.value
                ) {

                    alert(
                        "Please select a rating."
                    );

                    return;
                }


                const submitButton =
                    reviewForm.querySelector(
                        "button[type='submit']"
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "SENDING...";
                }


                try {

                    const response =
                        await fetch(
                            reviewForm.action,
                            {
                                method:
                                    "POST",

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


                    if (!response.ok) {

                        throw new Error(
                            "Review submission failed."
                        );
                    }


                    reviewForm.innerHTML = `
                        <div class="form-success">
                            <h3>Thank you.</h3>
                            <p>
                                Your review has been received.
                                Thank you for sharing your experience.
                            </p>
                        </div>
                    `;


                } catch (error) {

                    console.error(
                        "Review error:",
                        error
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SUBMIT REVIEW";
                    }


                    alert(
                        "Unable to send your review. Please try again."
                    );
                }
            }
        );
    }


    /* =========================================================
       COPYRIGHT YEAR
    ========================================================= */

    document
        .querySelectorAll(
            ".current-year"
        )
        .forEach(
            function (year) {

                year.textContent =
                    new Date()
                        .getFullYear();
            }
        );


    /* =========================================================
       GLOBAL IMAGE PROTECTION
    ========================================================= */

    document
        .querySelectorAll("img")
        .forEach(
            protectImage
        );


    /* =========================================================
       START PORTFOLIO
    ========================================================= */

    loadPortfolio();

});
