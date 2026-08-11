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

});
