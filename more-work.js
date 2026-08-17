document.addEventListener("DOMContentLoaded", function () {

    const SUPABASE_URL =
        "https://ilrdmzogaqfdrcyzjahk.supabase.co";

    const BUCKET =
        "portfolio";


    const photos = [

        {
            path: "portraits/19.webp",
            category: "portraits"
        }

        // أضف الصور الجديدة هنا لاحقاً
        // {
        //     path: "portraits/20.webp",
        //     category: "portraits"
        // }

    ];


    const gallery =
        document.getElementById("portfolio-gallery");

    const loading =
        document.getElementById("gallery-loading");

    const empty =
        document.getElementById("gallery-empty");


    function getImageURL(path) {

        return (
            SUPABASE_URL +
            "/storage/v1/object/public/" +
            BUCKET +
            "/" +
            path
        );

    }


    function addPhoto(photo) {

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


    /* LOAD PHOTOS */

    loading.style.display = "block";

    gallery.innerHTML = "";


    photos.forEach(function (photo) {

        addPhoto(photo);

    });


    loading.style.display = "none";


    if (photos.length === 0) {

        empty.style.display = "block";

        return;

    }


    /* =========================================
       FILTERS
    ========================================= */

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const filter =
                    button.dataset.filter;


                filterButtons.forEach(function (btn) {

                    btn.classList.remove("active");

                });


                button.classList.add("active");


                const items =
                    gallery.querySelectorAll(
                        ".gallery-item"
                    );


                items.forEach(function (item) {

                    if (
                        filter === "all" ||
                        item.dataset.category === filter
                    ) {

                        item.classList.remove("hidden");

                    } else {

                        item.classList.add("hidden");

                    }

                });

            }
        );

    });


    /* =========================================
       LIGHTBOX
    ========================================= */

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightbox-image");

    const close =
        document.querySelector(".close");

    const previous =
        document.getElementById("prev");

    const next =
        document.getElementById("next");

    const counter =
        document.getElementById("lightbox-counter");


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

            if (event.target === lightbox) {

                lightbox.style.display =
                    "none";

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                lightbox.style.display !== "flex"
            ) {
                return;
            }


            if (event.key === "Escape") {

                lightbox.style.display =
                    "none";

            }


            if (event.key === "ArrowRight") {

                showImage(current + 1);

            }


            if (event.key === "ArrowLeft") {

                showImage(current - 1);

            }

        }
    );


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

                navLinks.classList.toggle("active");

            }
        );

    }

});
