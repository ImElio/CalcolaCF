document.addEventListener("DOMContentLoaded", function () {
    const cookiePopup = document.getElementById("cookiePopup");
    const acceptButton = document.querySelector(".acceptButton");
    const declineButton = document.querySelector(".declineButton");

    // Controllo: Se l'utente ha gia' accettato i cookie, nascondo il popup
    if (localStorage.getItem("cookieAccepted") === "true") {
        cookiePopup.style.display = "none";
    } else {
        cookiePopup.style.display = "block";
    }

    acceptButton.addEventListener("click", function () {
        localStorage.setItem("cookieAccepted", "true");
        cookiePopup.style.display = "none";
    });

    declineButton.addEventListener("click", function () {
        // Controllo: Se l'utente rifiuta, nascondiamo il popup
        // Il popup si rimostrera' ogni volta in quanto non verra' salvato nel localstorage
        cookiePopup.style.display = "none";
    });
});
