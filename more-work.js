document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       SUPABASE CONFIGURATION
    ========================================================= */

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET_NAME = "portfolio";


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


    /* =========================================================
       STORAGE URL
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
       DETERMINE CATEGORY
       
       Expected structure:
       
       portfolio/
           portraits/
           couples/
           sports/
           landscapes/
           real-estate/
           lifestyle/
    ========================================================= */

    function getCategoryFromPath(filePath) {

        const parts =
            filePath.split("/");

        /*
           Example:

           portraits/photo01.webp

           parts[0] = portraits
        */

        if (parts.length > 1) {

            const folder =
                parts[0].toLowerCase();

            const allowedCategories = [
                "portraits",
                "couples",
                "sports",
                "landscapes",
                "real-estate",
                "lifestyle"
            ];

            if (
                allowedCategories.includes(folder)
            ) {
                return folder;
            }

        }


        /*
           If no folder exists,
           try to determine category
           from filename.
        */

        const filename =
            parts[parts.length - 1]
                .toLowerCase();


        const categories = [
            "portraits",
            "couples",
            "sports",
            "landscapes",
            "real-estate",
            "lifestyle"
        ];


        for (
            const category of categories
        ) {

            if (
                filename.includes(category)
            ) {
                return category;
            }

        }


        return "lifestyle";

    }


    /* =========================================================
       CREATE GALLERY ITEM
    ========================================================= */

    function createGalleryItem(file) {

        const filePath =
            file.name;

        const imageUrl =
            getPublicImageUrl(filePath);

        const category =
            getCategoryFromPath(filePath);


        const item =
            document.createElement("div");

        item.className =
            "gallery-item";

        item.dataset.category =
            category;


        const image =
            document.createElement("img");

        image.src =
            imageUrl;

        image.alt =
            createAltText(category);


        image.loading =
            "lazy";

        image.decoding =
            "async";

        image.draggable =
            false;


        /*
           Prevent right click
        */

        image.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            }
        );


        item.appendChild(image);

        gallery.appendChild(item);

    }


    /* =========================================================
       ALT TEXT
    ========================================================= */

    function createAltText(category) {

        const names = {

            "portraits":
                "Portrait photography by Lisa Michelle Visuals",

            "couples":
                "Couples photography by Lisa Michelle Visuals",

            "sports":
                "Sports photography by Lisa Michelle Visuals",

            "landscapes":
                "Landscape photography by Lisa Michelle Visuals",

            "real-estate":
                "Real estate photography by Lisa Michelle Visuals",

            "lifestyle":
                "Lifestyle photography by Lisa Michelle Visuals"

        };


        return (
            names[category] ||
            "Photography by Lisa Michelle Visuals"
        );

    }


    /* =========================================================
       LOAD FILES FROM SUPABASE
    ========================================================= */

    async function loadPortfolio() {

        try {

            loadingMessage.style.display =
                "block";

            errorMessage.style.display =
                "none";

            emptyMessage.style.display =
                "none";


            /*
               Get folders first
            */

            const foldersResponse =
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

                            prefix: "",

                            limit: 100,

                            offset: 0,

                            sortBy: {
                                column: "name",
                                order: "asc"
                            }

                        })

                    }

                );


            if (
                !foldersResponse.ok
            ) {

                throw new Error(
                    "Unable to access Supabase Storage."
                );

            }


            const rootFiles =
                await foldersResponse.json();


            /*
               Supabase may return folders
               as objects without metadata.
               
               We need to load files from
               each category folder.
            */

            const categories = [

                "portraits",
                "couples",
                "sports",
                "landscapes",
                "real-estate",
                "lifestyle"

            ];


            let allFiles = [];


            /*
               Load each category folder
            */

            for (
                const category of categories
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

                                limit: 100,

                                offset: 0,

                                sortBy: {
                                    column: "name",
                                    order: "asc"
                                }

                            })

                        }

                    );


                if (!response.ok) {

                    console.warn(
                        "Could not load folder:",
                        category
                    );

                    continue;

                }


                const files =
                    await response.json();


                /*
                   Only actual files
                   should be added.
                */

                files.forEach(function (file) {

                    if (
                        file.name &&
                        !file.id &&
                        !file.metadata
                    ) {
                        return;
                    }


                    /*
                       Supabase returns the name
                       relative to the prefix.

                       Therefore rebuild full path.
                    */

                    if (
                        file.name &&
                        !file.name.includes("/")
                    ) {

                        allFiles.push({

                            ...file,

                            name:
                                category +
                                "/" +
                                file.name

                        });

                    }

                });

            }


            /*
               If no category folders exist,
               try files in the root.
            */

            if (
                allFiles.length === 0
            ) {

                rootFiles.forEach(function (file) {

                    if (
                        file.name &&
                        file.metadata
                    ) {

                        allFiles.push(file);

                    }

                });

            }


            loadingMessage.style.display =
                "none";


            /*
               No images
            */

            if (
                allFiles.length === 0
            ) {

                emptyMessage.style.display =
                    "block";

                return;

            }


            /*
               Create gallery
            */

            allFiles.forEach(function (file) {

                createGalleryItem(file);

            });


            /*
               Initialize gallery
               after images are created
            */

            initializeGallery();


        } catch (error) {

            console.error(
                "Portfolio loading error:",
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
            document.querySelectorAll(
                "#portfolio-gallery img"
            );


        return Array.from(images).filter(
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


        /*
           Loop protection
        */

        if (
            index < 0
        ) {

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


        lightboxImage.src =
            visibleImages[
                currentImage
            ].src;


        lightboxImage.alt =
            visibleImages[
                currentImage
            ].alt;


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


        /*
           Counter
        */

        if (
            lightboxCounter
        ) {

            lightboxCounter.textContent =
                (currentImage + 1) +
                " / " +
                visibleImages.length;

        }


        /*
           Previous
        */

        if (
            previousButton
        ) {

            previousButton.style.visibility =
                currentImage === 0
                    ? "hidden"
                    : "visible";

        }


        /*
           Next
        */

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
       INITIALIZE GALLERY
    ========================================================= */

    function initializeGallery() {

        const galleryImages =
            document.querySelectorAll(
                "#portfolio-gallery img"
            );


        galleryImages.forEach(
            function (image) {

                image.addEventListener(
                    "click",
                    function () {

                        const visibleImages =
                            getVisibleGalleryImages();


                        const index =
                            visibleImages.indexOf(
                                image
                            );


                        if (
                            index !== -1
                        ) {

                            showGalleryImage(
                                index
                            );

                        }

                    }
                );

            }
        );

    }


    /* =========================================================
       CLOSE LIGHTBOX
    ========================================================= */

    if (
        closeButton
    ) {

        closeButton.addEventListener(
            "click",
            closeLightbox
        );

    }


    function closeLightbox() {

        if (
            !lightbox
        ) {

            return;

        }


        lightbox.style.display =
            "none";


        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );


        lightboxImage.src =
            "";

    }


    /* =========================================================
       NEXT IMAGE
    ========================================================= */

    if (
        nextButton
    ) {

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

    if (
        previousButton
    ) {

        previousButton.addEventListener(
            "click",
            function () {

                if (
                    currentImage > 0
                ) {

                    currentImage--;

                    showGalleryImage(
                        currentImage
                    );

                }

            }
        );

    }


    /* =========================================================
       CLICK OUTSIDE IMAGE
    ========================================================= */

    if (
        lightbox
    ) {

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
                event.key === "Escape"
            ) {

                closeLightbox();

            }


            else if (
                event.key === "ArrowRight"
            ) {

                if (
                    nextButton
                ) {

                    nextButton.click();

                }

            }


            else if (
                event.key === "ArrowLeft"
            ) {

                if (
                    previousButton
                ) {

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


    if (
        lightboxImage
    ) {

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
                    touchEndX -
                    touchStartX;


                /*
                   Swipe left = Next
                */

                if (
                    swipeDistance < -50
                ) {

                    if (
                        nextButton
                    ) {

                        nextButton.click();

                    }

                }


                /*
                   Swipe right = Previous
                */

                else if (
                    swipeDistance > 50
                ) {

                    if (
                        previousButton
                    ) {

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
                       Active button
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
                       Filter gallery
                    */

                    const items =
                        document.querySelectorAll(
                            "#portfolio-gallery .gallery-item"
                        );


                    items.forEach(
                        function (item) {

                            const categories =
                                item.dataset.category
                                    .split(" ");


                            if (
                                currentFilter ===
                                    "all" ||
                                categories.includes(
                                    currentFilter
                                )
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


                    /*
                       Close lightbox when
                       changing category
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

                const isActive =
                    navLinks.classList.toggle(
                        "active"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    isActive
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
