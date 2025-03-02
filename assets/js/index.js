/****************************/
/* GESTIONE NAVBAR
/****************************/
const collegamentiNav = document.querySelector("nav a");
const sezioneHome = document.getElementById("homeSection");
const sezioneInfo = document.getElementById("infoSection");
const sezioneCronologia = document.getElementById("cronologiaSection");

collegamentiNav.forEach((link) => {
    link.addEventListener("click", (evento) => {
        evento.preventDefault();

        // Rimuovo classe "ATTIVA" da tutte le sezioni
        sezioneHome.classList.remove("attiva");
        sezioneInfo.classList.remove("attiva");
        sezioneCronologia.classList.remove("attiva");

        if (sezioneDaMostrare === "home") {
            sezioneHome.classList.add("attiva");
            sezioneHome.scrollIntoView({ behavior: "smooth" });
        } else if (sezioneDaMostrare === "info") {
            sezioneInfo.classList.add("attiva");
            sezioneInfo.scrollIntoView({ behavior: "smooth" });
        } else if (sezioneDaMostrare === "cronologia") {
            sezioneCronologia.classList.add("attiva");
            sezioneCronologia.scrollIntoView({ behavior: "smooth" });
        }
    });
});

/****************************/
/* GESTIONE NAVBAR
/****************************/

