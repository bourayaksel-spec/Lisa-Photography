```javascript
document.addEventListener("DOMContentLoaded", () => {

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
            `Bearer ${SUPABASE_PUBLISHABLE_KEY},`
            

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
            `${SUPABASE_URL}` +
            `/storage/v1/object/public/` +
            `${BUCKET_NAME}/` +
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
       CATEGORY
    ========================================================= */

    function getCategoryFromPath(filePath) {

        const path =
            normalizeImagePath(filePath);

        if (!path) {
            return "";
        }

        const parts =
            path.split("/");

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
            event => {
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
            async event => {

                event.preventDefault();

                const submitButton =
                    bookingForm.querySelector(
                        "button[type='submit']"
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "SENDING...";
                }

                try {

                    const response =
                        await fetch(
                            bookingForm.action,
                            {
                                method: "POST",
                                body: new FormData(bookingForm),
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
                        submitButton.disabled = false;
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
       LOAD LARGE IMAGE SETTING
    ========================================================= */

  async function loadLargeImageSetting() {

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/portfolio_settings" +
            "?select=large_image" +
            "&large_image=not.is.null" +
            "&limit=1";

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_PUBLISHABLE_KEY,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Supabase portfolio_settings error:",
                response.status,
                errorText
            );

            throw new Error(
                "Could not load portfolio large image setting."
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

            console.log(
                "Large Image URL:",
                getPublicImageUrl(
                    largeImagePath
                )
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
       LOAD FEATURED CATEGORY
    ========================================================= */

    async function loadFeaturedCategory(category) {

        const prefix =
            `${FEATURED_FOLDER}/${category}/`;

        const response =
            await fetch(
                `${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`,
                {
                    method: "POST",
                    headers: supabaseHeaders,

                    body: JSON.stringify({
                        prefix,
                        limit: 1000,
                        offset: 0,

                        sortBy: {
                            column: "name",
                            order: "asc"
                        }
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                `Featured folder failed: ${category}`
            );
        }

        const files =
            await response.json();

        if (!Array.isArray(files)) {
            return [];
        }

        return files
            .filter(file => {

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
            .map(file => ({

                path:
                    `${prefix}${file.name}`,

                category,

                name:
                    file.name

            }));
    }


    /* =========================================================
       LARGE IMAGE STYLES
    ========================================================= */

    function addLargeImageStyles() {

        if (
            document.getElementById(
                "portfolio-large-image-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "portfolio-large-image-styles";

        style.textContent = `

            .portfolio-large-image {
                width: 100%;
                margin: 0 auto 40px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
            }

            .portfolio-large-image img {
                display: block;
                width: 100%;
                max-height: 700px;
                object-fit: cover;
                object-position: center;
                transition: transform 0.5s ease;
                user-select: none;
                -webkit-user-drag: none;
            }

            .portfolio-large-image:hover img {
                transform: scale(1.02);
            }

            @media (max-width: 768px) {

                .portfolio-large-image {
                    margin-bottom: 25px;
                }

                .portfolio-large-image img {
                    max-height: 500px;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* =========================================================
       CREATE LARGE IMAGE
    ========================================================= */

    function createLargeImageSection() {

        if (!gallery) {
            return;
        }

        const oldLarge =
            document.getElementById(
                "portfolio-large-image"
            );

        if (oldLarge) {
            oldLarge.remove();
        }

        if (!largeImagePath) {
            return;
        }

        const category =
            getCategoryFromPath(
                largeImagePath
            );

        const section =
            document.createElement("div");

        section.id =
            "portfolio-large-image";

        section.className =
            "portfolio-large-image";

        section.dataset.category =
            category;

        const image =
            document.createElement("img");

        image.src =
            getPublicImageUrl(
                largeImagePath
            );

        image.alt =
            createAltText(category);

        image.loading =
            "eager";

        image.decoding =
            "async";

        protectImage(image);

        image.addEventListener(
            "click",
            () => {

                openLightboxFromPath(
                    largeImagePath
                );
            }
        );

        image.addEventListener(
            "error",
            () => {

                console.warn(
                    "Large image could not load:",
                    largeImagePath
                );

                section.remove();
            }
        );

        section.appendChild(image);

        gallery.parentNode.insertBefore(
            section,
            gallery
        );
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

        image.src =
            getPublicImageUrl(
                file.path
            );

        image.alt =
            createAltText(
                file.category
            );

        image.loading =
            "lazy";

        image.decoding =
            "async";

        protectImage(image);

        image.addEventListener(
            "click",
            () => {
                openLightboxFromPath(
                    file.path
                );
            }
        );

        image.addEventListener(
            "error",
            () => {

                console.warn(
                    "Image could not load:",
                    file.path
                );

                item.remove();
            }
        );

        item.appendChild(image);

        gallery.appendChild(item);
    }


    /* =========================================================
       LOAD PORTFOLIO
    ========================================================= */

    async function loadPortfolio() {

        if (!gallery) {
            return;
        }

        try {

            if (portfolioLoading) {
                portfolioLoading.style.display =
                    "block";
            }

            if (portfolioError) {
                portfolioError.style.display =
                    "none";
            }

            gallery.innerHTML = "";

            allPortfolioFiles = [];

            await loadLargeImageSetting();

            addLargeImageStyles();

            createLargeImageSection();


            /* -----------------------------------------
               LOAD ALL CATEGORIES IN PARALLEL
            ----------------------------------------- */

            const results =
                await Promise.allSettled(
                    categories.map(
                        category =>
                            loadFeaturedCategory(
                                category
                            )
                    )
                );

            results.forEach(result => {

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
            });


            /* -----------------------------------------
               REMOVE LARGE IMAGE FROM GRID
            ----------------------------------------- */

            if (largeImagePath) {

                const normalizedLarge =
                    normalizeImagePath(
                        largeImagePath
                    );

                allPortfolioFiles =
                    allPortfolioFiles.filter(
                        file =>
                            normalizeImagePath(
                                file.path
                            ) !== normalizedLarge
                    );
            }


            /* -----------------------------------------
               SORT
            ----------------------------------------- */

            allPortfolioFiles.sort(
                (a, b) => {

                    const first =
                        `${a.category}/${a.name}`;

                    const second =
                        `${b.category}/${b.name}`;

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
                createGalleryItem
            );


            /* -----------------------------------------
               APPLY INITIAL FILTER
            ----------------------------------------- */

            applyPortfolioFilter(
                currentFilter
            );


            if (portfolioLoading) {
                portfolioLoading.style.display =
                    "none";
            }


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

    function showPortfolioError(message) {

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

    function applyPortfolioFilter(filter) {

        currentFilter = filter;

        const items =
            gallery
                ? gallery.querySelectorAll(
                    ".gallery-item"
                )
                : [];

        let visibleCount = 0;


        items.forEach(item => {

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
        });


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
           ERROR MESSAGE
        ----------------------------------------- */

        if (portfolioError) {

            if (
                filter !== "all" &&
                visibleCount === 0
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

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter ||
                    "all";

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
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
    });


    /* =========================================================
       LIGHTBOX ITEMS
    ========================================================= */

    function getVisibleLightboxItems() {

        const items = [];

        /* -----------------------------------------
           LARGE IMAGE
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
                        getCategoryFromPath(
                            largeImagePath
                        )
                    ),

                category:
                    getCategoryFromPath(
                        largeImagePath
                    )
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
                .forEach(item => {

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
                });
        }

        return items;
    }


    /* =========================================================
       OPEN LIGHTBOX
    ========================================================= */

    function openLightboxFromPath(path) {

        const normalizedPath =
            normalizeImagePath(path);

        lightboxItems =
            getVisibleLightboxItems();

        const index =
            lightboxItems.findIndex(
                item =>
                    item.path ===
                    normalizedPath
            );

        if (index === -1) {
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

        if (!lightboxItems.length) {
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
            lightboxImage.src = "";
        }

        lightboxItems = [];
    }


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
            event => {

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
            event => {

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
       CLICK OUTSIDE
    ========================================================= */

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            event => {

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
        event => {

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
            event => {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;
            },
            { passive: true }
        );


        lightboxImage.addEventListener(
            "touchend",
            event => {

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
            { passive: true }
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
            () => {

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
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

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
            });
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

    stars.forEach(star => {

        star.addEventListener(
            "click",
            () => {

                const rating =
                    Number(
                        star.dataset.rating
                    );

                if (ratingValue) {
                    ratingValue.value =
                        rating;
                }

                stars.forEach(item => {

                    const itemRating =
                        Number(
                            item.dataset.rating
                        );

                    item.classList.toggle(
                        "selected",
                        itemRating <= rating
                    );
                });
            }
        );
    });


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
            async event => {

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

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "SENDING...";
                }

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
        .querySelectorAll(".current-year")
        .forEach(year => {

            year.textContent =
                new Date().getFullYear();
        });


    /* =========================================================
       GLOBAL IMAGE PROTECTION
    ========================================================= */

    document
        .querySelectorAll("img")
        .forEach(protectImage);


    /* =========================================================
       START PORTFOLIO
    ========================================================= */

    loadPortfolio();

});
```
