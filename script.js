document.addEventListener("DOMContentLoaded", function () {


    /* =========================================================
       SUPABASE CONFIGURATION
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET_NAME = "portfolio";


    const categories = [
        "portraits",
        "couples",
        "sports",
        "landscapes",
        "real-estate",
        "lifestyle"
    ];


    /*
       Number of images displayed on the homepage.

       MORE WORK contains the complete portfolio.
    */

    const HOME_IMAGE_LIMIT = 9;



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


                submitButton.disabled = true;

                submitButton.textContent =
                    "SENDING...";


                try {

                    const response =
                        await fetch(
                            bookingForm.action,
                            {
                                method: "POST",
                                body: new FormData(
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

                                <h3>
                                    Thank you.
                                </h3>

                                <p>
                                    Your request has been received successfully.
                                    Lisa will get back to you as soon as possible.
                                </p>

                            </div>
                        `;

                    }

                    else {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SEND REQUEST";


                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

                }

                catch (error) {

                    console.error(error);


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
       PORTFOLIO ELEMENTS
    ========================================================= */

    const gallery =
        document.getElementById(
            "portfolio-gallery"
        );


    const portfolioLoading =
        document.getElementById(
            "portfolio-loading"
        );


    const portfolioError =
        document.getElementById(
            "portfolio-error"
        );


    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    let currentFilter =
        "all";



    /* =========================================================
       SUPABASE PUBLIC IMAGE URL
    ========================================================= */

    function getPublicImageUrl(
        filePath
    ) {

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET_NAME +
            "/" +
            filePath
        );

    }



    /* =========================================================
       ALT TEXT
    ========================================================= */

    function createAltText(
        category
    ) {

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
       LOAD ONE SUPABASE FOLDER
    ========================================================= */

    async function loadFolder(
        category
    ) {

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

                        prefix:
                            category + "/",

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
                "Folder failed: " +
                category
            );

        }


        const files =
            await response.json();


        return files
            .filter(function (file) {

                /*
                   Ignore empty folder placeholders.
                */

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


                /*
                   We only want actual files.
                */

                return (
                    file.metadata ||
                    file.id
                );

            })
            .map(function (file) {

                return {

                    path:
                        category +
                        "/" +
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

    function createGalleryItem(
        file
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "gallery-item";


        item.dataset.category =
            file.category;


        const image =
            document.createElement(
                "img"
            );


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
           Protect image from right click.
        */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        /*
           Open Lightbox.
        */

        image.addEventListener(
            "click",
            function () {

                openLightbox(
                    image
                );

            }
        );


        /*
           If an image cannot load,
           remove it from the gallery.
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


            let allFiles = [];


            /*
               Load all six folders.
            */

            for (
                const category of categories
            ) {

                try {

                    const files =
                        await loadFolder(
                            category
                        );


                    allFiles =
                        allFiles.concat(
                            files
                        );

                }

                catch (error) {

                    console.warn(
                        error.message
                    );

                }

            }


            /*
               Sort alphabetically by
               category and filename.
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
               Homepage shows only
               the first 9 images.
            */

            const homeFiles =
                allFiles.slice(
                    0,
                    HOME_IMAGE_LIMIT
                );


            homeFiles.forEach(
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


            /*
               If there are no images.
            */

            if (
                homeFiles.length === 0
            ) {

                if (portfolioError) {

                    portfolioError.textContent =
                        "No photographs found.";

                    portfolioError.style.display =
                        "block";

                }

            }

        }

        catch (error) {

            console.error(
                "Portfolio loading error:",
                error
            );


            if (portfolioLoading) {

                portfolioLoading.style.display =
                    "none";

            }


            if (portfolioError) {

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
                "img"
            );


        return Array.from(
            images
        ).filter(
            function (image) {

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

            }
        );

    }



    /* =========================================================
       LIGHTBOX
    ========================================================= */

    const lightbox =
        document.getElementById(
            "lightbox"
        );


    const lightboxImage =
        document.getElementById(
            "lightbox-image"
        );


    const closeButton =
        document.querySelector(
            ".close"
        );


    const previousButton =
        document.getElementById(
            "prev"
        );


    const nextButton =
        document.getElementById(
            "next"
        );


    const lightboxCounter =
        document.getElementById(
            "lightbox-counter"
        );


    let currentImage =
        0;



    /* =========================================================
       OPEN LIGHTBOX
    ========================================================= */

    function openLightbox(
        image
    ) {

        const visibleImages =
            getVisibleGalleryImages();


        const index =
            visibleImages.indexOf(
                image
            );


        if (
            index === -1
        ) {

            return;

        }


        showGalleryImage(
            index
        );

    }



    /* =========================================================
       SHOW LIGHTBOX IMAGE
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


        if (
            index < 0
        ) {

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


        if (
            lightboxCounter
        ) {

            lightboxCounter.textContent =
                `${currentImage + 1} / ${visibleImages.length}`;

        }


        if (
            previousButton
        ) {

            previousButton.style.visibility =
                currentImage === 0
                    ? "hidden"
                    : "visible";

        }


        if (
            nextButton
        ) {

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

                    showGalleryImage(
                        currentImage + 1
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

    let touchStartX =
        0;


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


                    /*
                       Active button.
                    */

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


                    /*
                       Filter homepage images.
                    */

                    if (gallery) {

                        const items =
                            gallery.querySelectorAll(
                                ".gallery-item"
                            );


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

                                }

                                else {

                                    item.classList.add(
                                        "hidden"
                                    );

                                }

                            }
                        );

                    }


                    /*
                       Close lightbox after
                       changing filter.
                    */

                    closeLightbox();

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

                            }

                            else {

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
                                body: new FormData(
                                    reviewForm
                                ),
                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }
                        );


                    if (
                        response.ok
                    ) {

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

                    }

                    else {

                        submitButton.disabled =
                            false;


                        submitButton.textContent =
                            "SUBMIT REVIEW";


                        alert(
                            "Something went wrong. Please try again."
                        );

                    }

                }

                catch (error) {

                    console.error(error);


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
       START PORTFOLIO
    ========================================================= */

    loadPortfolio();

});
