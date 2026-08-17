document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET_NAME = "portfolio";


    /* =========================================================
       CATEGORIES
    ========================================================= */

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
       LOAD FILES FROM ONE FOLDER
    ========================================================= */

    async function loadFolder(category) {

        const response = await fetch(

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

                    prefix: category + "/",

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
                "Unable to load folder: " +
                category
            );

        }


        const files =
            await response.json();


        return files
            .filter(function (file) {

                return (
                    file &&
                    file.name &&
                    file.metadata
                );

            })
            .map(function (file) {

                return {

                    path:
                        category +
                        "/" +
                        file.name,

                    category:
                        category

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
            getPublicImageUrl(file.path);


        image.alt =
            createAltText(file.category);


        image.loading =
            "lazy";


        image.decoding =
            "async";


        image.draggable =
            false;


        /*
           Protect image from
           right-click
        */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        /*
           Open lightbox
        */

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


        item.appendChild(image);

        gallery.appendChild(item);

    }


    /* =========================================================
       LOAD COMPLETE PORTFOLIO
    ========================================================= */

    async function loadPortfolio() {

        try {

            loadingMessage.style.display =
                "block";

            errorMessage.style.display =
                "none";

            emptyMessage.style.display =
                "none";


            gallery.innerHTML = "";


            let allFiles = [];


            /*
               Load every category
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
                        allFiles.concat(files);

                }

                catch (error) {

                    console.warn(
                        "Could not load:",
                        category,
                        error
                    );

                }

            }


            /*
               Hide loading
            */

            loadingMessage.style.display =
                "none";


            /*
               Nothing found
            */

            if (
                allFiles.length === 0
            ) {

                emptyMessage.style.display =
                    "block";

                return;

            }


            /*
               Create images
            */

            allFiles.forEach(
                function (file) {

                    createGalleryItem(file);

                }
            );


        }

        catch (error) {

            console.error(
                "Portfolio error:",
                error
            );


            loadingMessage.style.display =
                "none";

            errorMessage.style.display =
                "block";

        }

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

        lightboxImage.src = "";

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


    /* =========================================================
       KEYBOARD
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                lightbox.style.display !==
                "flex"
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


            if (distance < -50) {

                nextButton.click();

            }


            else if (distance > 50) {

                previousButton.click();

            }

        }
    );


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


                    closeLightbox();


                    /*
                       Show empty message
                       when filter has no images
                    */

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
