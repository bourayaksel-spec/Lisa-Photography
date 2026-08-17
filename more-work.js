document.addEventListener("DOMContentLoaded", function () {

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_MGbh1GVGc9Vl_dLYJGTplA_-PDqMiPJ";

    const BUCKET =
        "portfolio";


    const categories = [
        "portraits",
        "couples",
        "sports",
        "landscapes",
        "real-estate",
        "lifestyle"
    ];


    const gallery =
        document.getElementById("portfolio-gallery");

    const loading =
        document.getElementById("gallery-loading");

    const error =
        document.getElementById("gallery-error");

    const empty =
        document.getElementById("gallery-empty");


    /* =========================================
       PUBLIC IMAGE URL
    ========================================= */

    function getImageURL(path) {

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET +
            "/" +
            path
        );

    }


    /* =========================================
       LOAD ONE FOLDER
    ========================================= */

  async function loadFolder(category) {

    const url =
        SUPABASE_URL +
        "/storage/v1/object/list/" +
        BUCKET_NAME;

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization":
                "Bearer " + SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            prefix: category + "/",
            limit: 1000,
            offset: 0
        })
    });

    const text = await response.text();

    console.log(
        "FOLDER:",
        category,
        "STATUS:",
        response.status,
        "RESPONSE:",
        text
    );

    if (!response.ok) {
        throw new Error(
            "Supabase returned " +
            response.status +
            " for " +
            category
        );
    }

    let files;

    try {
        files = JSON.parse(text);
    } catch (error) {
        throw new Error(
            "Invalid Supabase response"
        );
    }

    return files
        .filter(function (file) {

            return (
                file &&
                file.name &&
                !file.name.endsWith("/")
            );

        })
        .map(function (file) {

            return {
                path: category + "/" + file.name,
                category: category
            };

        });
}

    /* =========================================
       CREATE IMAGE
    ========================================= */

    function createImage(photo) {

        const item =
            document.createElement("div");

        item.className =
            "gallery-item";

        item.dataset.category =
            photo.category;


        const image =
            document.createElement("img");

        image.src =
            getImageURL(photo.path);

        image.alt =
            `${photo.category} photography by Lisa Michelle Visuals`;

        image.loading =
            "lazy";

        image.decoding =
            "async";

        image.draggable =
            false;


        item.appendChild(image);

        gallery.appendChild(item);

    }


    /* =========================================
       LOAD PORTFOLIO
    ========================================= */

    async function loadPortfolio() {

        try {

            loading.style.display =
                "block";

            error.style.display =
                "none";

            empty.style.display =
                "none";

            gallery.innerHTML = "";


            let photos = [];


            for (
                const category of categories
            ) {

                try {

                    const files =
                        await loadFolder(category);

                    photos =
                        photos.concat(files);

                } catch (folderError) {

                    console.warn(
                        "Folder failed:",
                        category
                    );

                }

            }


            loading.style.display =
                "none";


            if (!photos.length) {

                empty.style.display =
                    "block";

                return;

            }


            photos.forEach(function (photo) {

                createImage(photo);

            });


            initializeFilters();

            initializeLightbox();


        } catch (err) {

            console.error(err);

            loading.style.display =
                "none";

            error.style.display =
                "block";

        }

    }


    /* =========================================
       FILTERS
    ========================================= */

    function initializeFilters() {

        const buttons =
            document.querySelectorAll(
                ".filter-btn"
            );


        buttons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        button.dataset.filter;


                    buttons.forEach(
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


                    let count = 0;


                    items.forEach(
                        function (item) {

                            if (
                                filter === "all" ||
                                item.dataset.category ===
                                    filter
                            ) {

                                item.classList.remove(
                                    "hidden"
                                );

                                count++;

                            } else {

                                item.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );


                    empty.style.display =
                        count === 0
                            ? "block"
                            : "none";

                }
            );

        });

    }


    /* =========================================
       LIGHTBOX
    ========================================= */

    function initializeLightbox() {

        const lightbox =
            document.getElementById("lightbox");

        const lightboxImage =
            document.getElementById(
                "lightbox-image"
            );

        const close =
            document.querySelector(".close");

        const previous =
            document.getElementById("prev");

        const next =
            document.getElementById("next");

        const counter =
            document.getElementById(
                "lightbox-counter"
            );


        let current = 0;


        function getVisibleImages() {

            return Array.from(
                gallery.querySelectorAll("img")
            ).filter(function (image) {

                return !image
                    .closest(".gallery-item")
                    .classList
                    .contains("hidden");

            });

        }


        function showImage(index) {

            const images =
                getVisibleImages();


            if (!images.length) return;


            if (index < 0)
                index = 0;


            if (index >= images.length)
                index = images.length - 1;


            current = index;


            lightboxImage.src =
                images[current].src;

            lightboxImage.alt =
                images[current].alt;


            counter.textContent =
                `${current + 1} / ${images.length}`;


            previous.style.visibility =
                current === 0
                    ? "hidden"
                    : "visible";


            next.style.visibility =
                current === images.length - 1
                    ? "hidden"
                    : "visible";


            lightbox.style.display =
                "flex";

        }


        gallery.querySelectorAll("img")
            .forEach(function (image) {

                image.addEventListener(
                    "click",
                    function () {

                        const images =
                            getVisibleImages();

                        showImage(
                            images.indexOf(image)
                        );

                    }
                );

            });


        close.addEventListener(
            "click",
            function () {

                lightbox.style.display =
                    "none";

            }
        );


        next.addEventListener(
            "click",
            function () {

                showImage(current + 1);

            }
        );


        previous.addEventListener(
            "click",
            function () {

                showImage(current - 1);

            }
        );


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

                    lightbox.style.display =
                        "none";

                }


                if (
                    event.key === "ArrowRight"
                ) {

                    showImage(current + 1);

                }


                if (
                    event.key === "ArrowLeft"
                ) {

                    showImage(current - 1);

                }

            }
        );

    }


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");


    if (menuToggle && navLinks) {

        menuToggle.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "active"
                );

            }
        );

    }


    /* =========================================
       START
    ========================================= */

    loadPortfolio();

});
