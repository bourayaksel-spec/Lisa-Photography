document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE CONFIGURATION
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET_NAME = "portfolio";

    /*
       Featured folders:

       portfolio/featured/portraits/
       portfolio/featured/couples/
       portfolio/featured/sports/
       portfolio/featured/landscapes/
       portfolio/featured/real-estate/
       portfolio/featured/lifestyle/

       IMPORTANT:

       portfolio_settings.large_image

       contains ONE image for the whole homepage.

       Example:

       featured/portraits/19.webp

       OR

       featured/couples/05.webp

       OR

       featured/sports/12.webp
    */

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

                        if (submitButton) {

                            submitButton.disabled = false;
                            submitButton.textContent =
                                "SEND REQUEST";

                        }

                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

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
       PORTFOLIO ELEMENTS
    ========================================================= */

    const gallery =
        document.getElementById("portfolio-gallery");

    const portfolioLoading =
        document.getElementById("portfolio-loading");

    const portfolioError =
        document.getElementById("portfolio-error");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    let currentFilter = "all";


    /*
       The single Large Image for the entire portfolio.

       Example:

       featured/portraits/19.webp
    */

    let largeImagePath = null;


    /* =========================================================
       SUPABASE PUBLIC IMAGE URL
    ========================================================= */

    function getPublicImageUrl(filePath) {

        if (!filePath) {
            return "";
        }

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET_NAME +
            "/" +
            filePath
        );

    }


    /* =========================================================
       NORMALIZE IMAGE PATH
    ========================================================= */

    function normalizeImagePath(path) {

        if (!path) {
            return "";
        }

        return String(path)
            .trim()
            .replace(/^\/+/, "");

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
            "Photography by Lisa Michelle Visuals"
        );

    }


    /* =========================================================
       FIND CATEGORY FROM PATH
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
           Expected:

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
       LOAD SINGLE LARGE IMAGE SETTING
       
       Reads:

       portfolio_settings.large_image

       IMPORTANT:

       There is only ONE large_image
       for the whole portfolio.
    ========================================================= */

    async function loadLargeImageSetting() {

        try {

            const url =
                SUPABASE_URL +
                "/rest/v1/portfolio_settings" +
                "?select=large_image&limit=1";


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                "Bearer " +
                                SUPABASE_PUBLISHABLE_KEY,

                            "apikey":
                                SUPABASE_PUBLISHABLE_KEY,

                            "Content-Type":
                                "application/json"

                        }

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Could not load portfolio large image setting."
                );

            }


            const data =
                await response.json();


            if (
                Array.isArray(data) &&
                data.length > 0
            ) {

                largeImagePath =
                    normalizeImagePath(
                        data[0].large_image
                    );

            } else {

                largeImagePath = null;

            }


            console.log(
                "Portfolio Large Image:",
                largeImagePath
            );


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
       
       This is the ONE large image for the whole portfolio.
    ========================================================= */

    function createLargeImageSection() {

        if (!gallery) {
            return;
        }


        /*
           Remove an old large image section
           if one already exists.
        */

        const oldLarge =
            document.getElementById(
                "portfolio-large-image"
            );


        if (oldLarge) {

            oldLarge.remove();

        }


        /*
           If no Large Image has been selected,
           do not create the section.
        */

        if (!largeImagePath) {

            return;

        }


        const largeSection =
            document.createElement("div");


        largeSection.id =
            "portfolio-large-image";


        largeSection.className =
            "portfolio-large-image";


        const image =
            document.createElement("img");


        image.src =
            getPublicImageUrl(
                largeImagePath
            );


        const largeCategory =
            getCategoryFromPath(
                largeImagePath
            );


        image.alt =
            createAltText(
                largeCategory
            );


        image.loading =
            "eager";


        image.decoding =
            "async";


        image.draggable =
            false;


        /*
           Prevent right click.
        */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        /*
           Open the same lightbox.
        */

        image.addEventListener(
            "click",
            function () {

                openLargeImageInLightbox(
                    image
                );

            }
        );


        /*
           If the Large Image cannot load,
           hide the section.
        */

        image.addEventListener(
            "error",
            function () {

                console.warn(
                    "Large image could not load:",
                    largeImagePath
                );


                largeSection.remove();

            }
        );


        largeSection.appendChild(
            image
        );


        /*
           Put the Large Image BEFORE
           the normal gallery.
        */

        gallery.parentNode.insertBefore(
            largeSection,
            gallery
        );

    }


    /* =========================================================
       LARGE IMAGE CSS
       
       Creates the visual presentation automatically,
       so no HTML change is required.
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


        document.head.appendChild(
            style
        );

    }


    /* =========================================================
       LOAD FEATURED CATEGORY
       
       Example:

       featured/portraits/01.webp
       featured/portraits/02.webp
       featured/portraits/19.webp
    ========================================================= */

    async function loadFeaturedCategory(category) {

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

                    headers: {

                        "Authorization":
                            "Bearer " +
                            SUPABASE_PUBLISHABLE_KEY,

                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        prefix: prefix,

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
                "Featured folder failed: " +
                category
            );

        }


        const files =
            await response.json();


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

        image.draggable =
            false;


        /*
           Prevent right click.
        */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        /*
           Open lightbox.
        */

        image.addEventListener(
            "click",
            function () {

                openLightbox(image);

            }
        );


        /*
           Image loading error.
        */

        image.addEventListener(
            "error",
            function () {

                console.warn(
                    "Image could not load:",
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
       
       Loads:

       1. ONE Large Image
       2. ALL Featured Images

       The Large Image is NOT removed from Supabase.
       It is only excluded from the normal grid
       to prevent the same image appearing twice.
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


            /*
               Load the single Large Image
               from portfolio_settings.
            */

            await loadLargeImageSetting();


            /*
               Add the Large Image section.
            */

            addLargeImageStyles();

            createLargeImageSection();


            let allFiles = [];


            /*
               Load every Featured category.
            */

            for (
                const category of categories
            ) {

                try {

                    const files =
                        await loadFeaturedCategory(
                            category
                        );


                    allFiles =
                        allFiles.concat(files);

                } catch (error) {

                    console.warn(
                        error.message
                    );

                }

            }


            /*
               Remove the Large Image from
               the normal gallery.

               Example:

               Large:
               featured/portraits/19.webp

               It will appear ONLY in the
               Large Image area.

               All other images remain.
            */

            if (largeImagePath) {

                const normalizedLarge =
                    normalizeImagePath(
                        largeImagePath
                    );


                allFiles =
                    allFiles.filter(
                        function (file) {

                            return (
                                normalizeImagePath(
                                    file.path
                                ) !==
                                normalizedLarge
                            );

                        }
                    );

            }


            /*
               Sort images.

               Category first,
               filename second.
            */

            allFiles.sort(
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


            /*
               Display ALL remaining Featured images.
            */

            allFiles.forEach(
                function (file) {

                    createGalleryItem(
                        file
                    );

                }
            );


            if (portfolioLoading) {

                portfolioLoading.style.display =
                    "none";

            }


            if (
                allFiles.length === 0 &&
                !largeImagePath
            ) {

                if (portfolioError) {

                    portfolioError.textContent =
                        "No featured photographs found.";

                    portfolioError.style.display =
                        "block";

                }

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


            if (portfolioError) {

                portfolioError.textContent =
                    "Unable to load the portfolio.";

                portfolioError.style.display =
                    "block";

            }

        }

    }


    /* =========================================================
       GET VISIBLE GALLERY IMAGES
    ========================================================= */

    function getVisibleGalleryImages() {

        if (!gallery) {

            return [];

        }


        const images =
            gallery.querySelectorAll(
                ".gallery-item img"
            );


        return Array.from(images)
            .filter(function (image) {

                const item =
                    image.closest(
                        ".gallery-item"
                    );


                return (
                    item &&
                    !item.classList.contains(
                        "hidden"
                    )
                );

            });

    }


    /* =========================================================
       LIGHTBOX ELEMENTS
    ========================================================= */

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById(
            "lightbox-image"
        );

    const closeButton =
        document.querySelector(".close");

    const previousButton =
        document.getElementById("prev");

    const nextButton =
        document.getElementById("next");

    const lightboxCounter =
        document.getElementById(
            "lightbox-counter"
        );


    let currentImage = 0;


    /* =========================================================
       OPEN NORMAL GALLERY IMAGE
    ========================================================= */

    function openLightbox(image) {

        const visibleImages =
            getVisibleGalleryImages();


        const index =
            visibleImages.indexOf(
                image
            );


        if (index === -1) {

            return;

        }


        showGalleryImage(
            index
        );

    }


    /* =========================================================
       OPEN LARGE IMAGE IN LIGHTBOX
    ========================================================= */

    function openLargeImageInLightbox(
        image
    ) {

        if (
            !lightbox ||
            !lightboxImage
        ) {

            return;

        }


        lightboxImage.src =
            image.src;


        lightboxImage.alt =
            image.alt;


        /*
           Large image is outside the
           normal gallery, so it gets
           its own simple counter.
        */

        if (lightboxCounter) {

            lightboxCounter.textContent =
                "Large";

        }


        if (previousButton) {

            previousButton.style.visibility =
                "hidden";

        }


        if (nextButton) {

            nextButton.style.visibility =
                "hidden";

        }


        lightbox.style.display =
            "flex";


        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =========================================================
       SHOW GALLERY IMAGE
    ========================================================= */

    function showGalleryImage(
        index
    ) {

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
            index >=
            visibleImages.length
        ) {

            index =
                visibleImages.length - 1;

        }


        currentImage =
            index;


        const image =
            visibleImages[
                currentImage
            ];


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
       KEYBOARD
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

            }


            else if (
                event.key ===
                "ArrowRight"
            ) {

                if (nextButton) {

                    nextButton.click();

                }

            }


            else if (
                event.key ===
                "ArrowLeft"
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

                const touchEndX =
                    event.changedTouches[0]
                        .screenX;


                const distance =
                    touchEndX -
                    touchStartX;


                if (
                    distance < -50
                ) {

                    if (nextButton) {

                        nextButton.click();

                    }

                }


                else if (
                    distance > 50
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

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    currentFilter =
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


                    if (gallery) {

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
                                    currentFilter ===
                                        "all" ||
                                    category ===
                                        currentFilter
                                ) {

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


                        /*
                           IMPORTANT:

                           The Large Image is independent
                           from categories.

                           Therefore it ALWAYS stays visible
                           when filtering Portraits, Couples,
                           Sports, etc.
                        */

                        closeLightbox();


                        if (
                            portfolioError &&
                            currentFilter !== "all"
                        ) {

                            if (
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


                        if (
                            portfolioError &&
                            currentFilter === "all"
                        ) {

                            portfolioError.style.display =
                                "none";

                        }

                    }

                }
            );

        }
    );


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

                        if (submitButton) {

                            submitButton.disabled =
                                false;

                            submitButton.textContent =
                                "SUBMIT REVIEW";

                        }

                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

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
       IMAGE PROTECTION
    ========================================================= */

    document
        .querySelectorAll("img")
        .forEach(
            function (img) {

                img.setAttribute(
                    "draggable",
                    "false"
                );


                img.addEventListener(
                    "contextmenu",
                    function (event) {

                        event.preventDefault();

                    }
                );

            }
        );


    /* =========================================================
       START
    ========================================================= */

    loadPortfolio();

});
