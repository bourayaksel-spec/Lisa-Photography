document.addEventListener("DOMContentLoaded", function () {

    const bookingForm = document.getElementById("booking-form");

    if (!bookingForm) {
        return;
    }

    bookingForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const submitButton =
            bookingForm.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.textContent = "SENDING...";

        try {

            const response = await fetch(
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

                submitButton.disabled = false;
                submitButton.textContent = "SEND REQUEST";

                alert(
                    "Something went wrong. Please try again."
                );

            }

        } catch (error) {

            submitButton.disabled = false;
            submitButton.textContent = "SEND REQUEST";

            alert(
                "Unable to send your request. Please try again."
            );

        }

    });
    const galleryImages = document.querySelectorAll(".gallery img");

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightbox-image");

const closeButton = document.querySelector(".close");

const previousButton = document.getElementById("prev");

const nextButton = document.getElementById("next");

let currentImage = 0;


function showGalleryImage(index) {

    if (!galleryImages.length) {
        return;
    }

    currentImage = index;

    lightboxImage.src = galleryImages[currentImage].src;

    lightbox.style.display = "flex";
}


galleryImages.forEach(function (image, index) {

    image.addEventListener("click", function () {

        showGalleryImage(index);

    });

});


if (closeButton) {

    closeButton.addEventListener("click", function () {

        lightbox.style.display = "none";

    });

}


if (nextButton) {

    nextButton.addEventListener("click", function () {

        currentImage++;

        if (currentImage >= galleryImages.length) {
            currentImage = 0;
        }

        showGalleryImage(currentImage);

    });

}


if (previousButton) {

    previousButton.addEventListener("click", function () {

        currentImage--;

        if (currentImage < 0) {
            currentImage = galleryImages.length - 1;
        }

        showGalleryImage(currentImage);

    });

}


if (lightbox) {

    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {

            lightbox.style.display = "none";

        }

    });

}

});
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});
document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", function () {

            navLinks.classList.toggle("active");

        });

    }

});








