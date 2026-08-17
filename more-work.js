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
       IMPORTANT:
       More Work is completely separated from Featured Portfolio.

       Supabase structure:

       portfolio/
       └── more-work/
           ├── portraits/
           ├── couples/
           ├── sports/
           ├── landscapes/
           ├── real-estate/
           └── lifestyle/
    */

    const ROOT_FOLDER = "more-work";

    const categories = [
        "portraits",
        "couples",
        "sports",
        "landscapes",
        "real-estate",
        "lifestyle"
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
       LIGHTBOX ELEMENTS
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

    let currentFilter = "all";

    let touchStartX = 0;


    /* =========================================================
       PUBLIC IMAGE URL
    ========================================================= */

    function getPublicImageUrl(filePath) {

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

    function createAltText(category) {

        const names = {

            portraits:
                "Portrait photography by Lisa Michelle Visuals",

            couples:
                "Couples photography by Lisa Michelle Visuals",

            sports:
                "Sports photography by Lisa Michelle Visuals",

            landscapes:
                "Landscape photography by Lisa Michelle Visuals",

            "real-estate":
                "Real estate photography by Lisa Michelle Visuals",

            lifestyle:
                "Lifestyle photography by Lisa Michelle Visuals"

        };

        return (
            names[category] ||
            "Photography by Lisa Michelle Visuals"
        );

    }


    /* =========================================================
       LOAD ONE MORE-WORK FOLDER
    ========================================================= */

    async function loadFolder(category) {

        const folderPath =
            ROOT_FOLDER + "/" + category + "/";


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

                        prefix: folderPath,

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
                folderPath
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


                /*
                   Ignore Supabase empty-folder
                   placeholder.
                */

                if (
                    file.name ===
                    ".emptyFolderPlaceholder"
                ) {

                    return false;

                }


                /*
                   Only actual files.
                */

                return (
                    file.metadata ||
                    file.id
                );

            })
            .map(function (file) {

                return {

                    path:
                        folderPath +
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
           Open Lightbox.
        */

        image.addEventListener(
            "click",
            function () {

                openLightbox(image);

            }
        );


        /*
           If image fails,
           remove only that image.
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


        item.appendChild(image);

        gallery.appendChild(item);

    }


    /* =========================================================
       LOAD COMPLETE MORE WORK PORTFOLIO
    ========================================================= */

    async function loadPortfolio() {

        if (!gallery) {

            console.error(
                "portfolio-gallery not found."
            );

            return;

        }


        try {

            if (loadingMessage) {

                loadingMessage.style.display =
                    "block";

            }


            if (errorMessage) {

                errorMessage.style.display =
                    "none";

            }


            if (emptyMessage) {

                emptyMessage.style.display =
                    "none";

            }


            gallery.innerHTML = "";


            let allFiles = [];


            /* -------------------------------------------------
               Load every More Work category
            ------------------------------------------------- */

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
                        "Could not load:",
                        category,
                        error
                    );

                }

            }


            /* -------------------------------------------------
               Sort files
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               Hide loading
            ------------------------------------------------- */

            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }


            /* -------------------------------------------------
               No images
            ------------------------------------------------- */

            if (
                allFiles.length === 0
            ) {

                if (emptyMessage) {

                    emptyMessage.textContent =
                        "No photographs found.";

                    emptyMessage.style.display =
                        "block";

                }

                return;

            }


            /* -------------------------------------------------
               Create gallery
            ------------------------------------------------- */

            allFiles.forEach(
                function (file) {

                    createGalleryItem(
                        file
                    );

                }
            );


        }

        catch (error) {

            console.error(
                "More Work loading error:",
                error
            );


            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }


            if (errorMessage) {

                errorMessage.textContent =
                    "Unable to load the gallery. Please try again later.";

                errorMessage.style.display =
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
       OPEN LIGHTBOX
    ========================================================= */

    function openLightbox(image) {

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


        /* Counter */

        if (
            lightboxCounter
        ) {

            lightboxCounter.textContent =
                `${currentImage + 1} / ${visibleImages.length}`;

        }


        /* Previous button */

        if (
            previousButton
        ) {

            previousButton.style.visibility =
                currentImage === 0
                    ? "hidden"
                    : "visible";

        }


        /* Next button */

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


                /* Swipe left = Next */

                if (
                    distance < -50
                ) {

                    if (nextButton) {

                        nextButton.click();

                    }

                }


                /* Swipe right = Previous */

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
       FILTERS
    ========================================================= */

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    currentFilter =
                        button.dataset.filter;


                    /* Active button */

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


                    /* Filter images */

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

                                }

                                else {

                                    item.classList.add(
                                        "hidden"
                                    );

                                }

                            }
                        );


                        /*
                           Show message if
                           category has no images.
                        */

                        if (emptyMessage) {

                            emptyMessage.style.display =
                                visibleCount === 0
                                    ? "block"
                                    : "none";

                        }

                    }


                    /*
                       Close lightbox when
                       changing category.
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
       START
    ========================================================= */

    loadPortfolio();

});
