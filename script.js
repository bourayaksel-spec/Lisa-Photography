document.addEventListener("DOMContentLoaded", function () {

    const images = document.querySelectorAll(".gallery img");

    const lightbox = document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightbox-image");

    const closeButton =
        document.querySelector(".close");

    const previousButton =
        document.getElementById("prev");

    const nextButton =
        document.getElementById("next");

    let currentImage = 0;


    function showImage(index) {

        currentImage = index;

        lightboxImage.src = images[currentImage].src;

    }


    images.forEach(function (image, index) {

        image.addEventListener("click", function () {

            lightbox.style.display = "flex";

            showImage(index);

        });

    });


    nextButton.addEventListener("click", function () {

        currentImage++;

        if (currentImage >= images.length) {
            currentImage = 0;
        }

        showImage(currentImage);

    });


    previousButton.addEventListener("click", function () {

        currentImage--;

        if (currentImage < 0) {
            currentImage = images.length - 1;
        }

        showImage(currentImage);

    });


    closeButton.addEventListener("click", function () {

        lightbox.style.display = "none";

    });


    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {

            lightbox.style.display = "none";

        }

    });

});