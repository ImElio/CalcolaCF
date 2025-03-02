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
/* OVERLAY CARICAMENTO
/****************************/
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("overlayCaricamento").classList.add("nascosto");
    }, 1000);
});

/****************************/
/* Caricamento COMUNI => comuni.json
/****************************/
const selectComune = document.getElementById("comune");
fetch("comuni/comuni.json")
.then((risposta) => risposta.json())
.then((datiComuni) => {
    datiComuni.forEach((comune) => {
        const opzione = document.createElement("option");
        opzione.value = comune.codice;
        opzione.textContent = comune.nome;
        selectComune.appendChild(opzione);
    });
})
.catch((errore) => console.error("Comuni non caricati:", errore));

/************************************************************
 * GENERAZIONE CODICE FISCALE
 ************************************************************/
const formCF = document.getElementById("formCF");
const outputCF = document.getElementById("outputCF");
const risultatoCF = document.getElementById("risultatoCF");

formCF.addEventListener("sumbit", (evento) => {
    evento.preventDefault();

    // Overlay Caricamento
    document.getElementById("overlayCaricamento").classList.remove("nascosto");

    // Salvo i dati dal form
    const valoreCognome = document.getElementById("cognome").value.trim().toUpperCase();
    const valoreNome = document.getElementById("nome").value.trim().toUpperCase();
    const valoreDataNascita = document.getElementById("dataNscita").value;
    const sessoSelezionato = document.getElementById('input[name="sesso":checked]');
    const codiceComune = selectComune.value;
})