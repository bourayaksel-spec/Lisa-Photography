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
const bookingForm = document.getElementById("booking-form");

bookingForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const submitButton = bookingForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    submitButton.textContent = "SENDING...";

    try {

        const response = await fetch(bookingForm.action, {
            method: "POST",
            body: new FormData(bookingForm),
            headers: {
                "Accept": "application/json"
            }
        });

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

            alert("Something went wrong. Please try again.");

        }

    } catch (error) {

        submitButton.disabled = false;
        submitButton.textContent = "SEND REQUEST";

        alert("Unable to send your request. Please try again.");

    }

});
            lightbox.style.display = "none";

        }

    });
    const bookingForm = document.getElementById("booking-form");

bookingForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const submitButton =
        bookingForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    submitButton.textContent = "SENDING...";

    try {

        const response = await fetch(bookingForm.action, {
            method: "POST",
            body: new FormData(bookingForm),
            headers: {
                "Accept": "application/json"
            }
        });

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

            alert("Something went wrong. Please try again.");

        }

    } catch (error) {

        submitButton.disabled = false;
        submitButton.textContent = "SEND REQUEST";

        alert("Unable to send your request. Please try again.");

    }

});

});
