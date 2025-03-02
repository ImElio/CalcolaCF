/****************************/
/* GESTIONE NAVBAR
/****************************/
const collegamentiNav = document.querySelectorAll("nav a");
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

formCF.addEventListener("submit", (evento) => { 
    evento.preventDefault();

    // Overlay Caricamento
    document.getElementById("overlayCaricamento").classList.remove("nascosto");

    // Salvo i dati dal form
    const valoreCognome = document.getElementById("cognome").value.trim().toUpperCase();
    const valoreNome = document.getElementById("nome").value.trim().toUpperCase();
    const valoreDataNascita = document.getElementById("dataNascita").value;
    const sessoSelezionato = document.querySelector('input[name="sesso"]:checked'); 
    const codiceComune = selectComune.value;

    if (!sessoSelezionato || !codiceComune) {
        alert("Compila tutti i campi e seleziona un comune.");
        document.getElementById("overlayCaricamento").classList.add("nascosto");
        return;
    }
    const valoreSesso = sessoSelezionato.value;

    // Simulo un caricamento 
    setTimeout(() => {
        const codiceFiscaleGenerato = generaCodiceFiscale(
            valoreCognome,
            valoreNome,
            valoreDataNascita,
            valoreSesso,
            codiceComune
        );
        outputCF.textContent = codiceFiscaleGenerato;
        risultatoCF.classList.add("fade-in");

        // Salvo in cronologia usando il localstorage
        // Possibile introduzione indexedDB
        salvaCronologia(codiceFiscaleGenerato);

        // Svuoto i campi
        svuotaCampiForm();
        
        // Dopo la generazione nascondo lo spinner
        document.getElementById("overlayCaricamento").classList.add("nascosto");

        // Scroll risultato
        risultatoCF.scrollIntoView({ behavior: "smooth" });

        timerOverlay = null;
    }, 800);
});


/************************************************************
 * FUNZIONE SVUOTA CAMPI
 ************************************************************/
function svuotaCampiForm() {
    document.getElementById("cognome").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("dataNascita").value = "";
    document.querySelectorAll('input[name="sesso"]').forEach((el) => (el.checked = false));
    selectComune.value = "";
    // Rimuovo effetto fade-in
    risultatoCF.classList.remove("fade-in")
}

/************************************************************
 * VERIFICA CODICE FISCALE
 ************************************************************/
const formVerifica = document.getElementById("formVerifica");
const risultatoVerifica = document.getElementById("risultatoVerifica");

formVerifica.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const cfInserito = document.getElementById("inputCF").value.trim().toUpperCase();
  const valido = validaCodiceFiscale(cfInserito);
  if (valido) {
    risultatoVerifica.textContent = "Il codice fiscale è valido.";
    risultatoVerifica.style.color = "green";
  } else {
    risultatoVerifica.textContent = "Il codice fiscale NON è valido.";
    risultatoVerifica.style.color = "red";
  }
  risultatoVerifica.scrollIntoView({ behavior: "smooth" });
});

/************************************************************
 * CRONOLOGIA (LocalStorage)
 ************************************************************/
const listaCronologia = document.getElementById("listaCronologia");
const pulsanteCancellaCronologia = document.getElementById("pulsanteCancellaCronologia");

document.addEventListener("DOMContentLoaded", () => {
  caricaCronologia();
});

function salvaInCronologia(cf) {
  let cronologia = JSON.parse(localStorage.getItem("cfHistory")) || [];
  cronologia.push({
    codice: cf,
    data: new Date().toLocaleString(),
  });
  localStorage.setItem("cfHistory", JSON.stringify(cronologia));
  mostraCronologia(cronologia);
}

function caricaCronologia() {
  let cronologia = JSON.parse(localStorage.getItem("cfHistory")) || [];
  mostraCronologia(cronologia);
}

function eliminaElementoCronologia(indice) {
  let cronologia = JSON.parse(localStorage.getItem("cfHistory")) || [];
  cronologia.splice(indice, 1);
  localStorage.setItem("cfHistory", JSON.stringify(cronologia));
  mostraCronologia(cronologia);
}

pulsanteCancellaCronologia.addEventListener("click", () => {
  localStorage.removeItem("cfHistory");
  mostraCronologia([]);
});

function mostraCronologia(cronologia) {
  listaCronologia.innerHTML = "";
  cronologia.forEach((item, indice) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.codice} <small>(${item.data})</small></span>
      <button data-indice="${indice}">Elimina</button>
    `;
    listaCronologia.appendChild(li);
  });
  // Gestione click su "Elimina"
  document.querySelectorAll(".cronologia-lista button").forEach((bottone) => {
    bottone.addEventListener("click", () => {
      const idx = bottone.getAttribute("data-indice");
      eliminaElementoCronologia(idx);
    });
  });
}

/************************************************************
 * FUNZIONI PER CALCOLO CODICE FISCALE
 ************************************************************/
function estraiConsonanti(testo) {
  return testo.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, "");
}
function estraiVocali(testo) {
  return testo.replace(/[^AEIOU]/g, "");
}

function elaboraCognome(cognome) {
  const cons = estraiConsonanti(cognome);
  const vocali = estraiVocali(cognome);
  let risultato = (cons + vocali).slice(0, 3);
  while (risultato.length < 3) {
    risultato += "X";
  }
  return risultato;
}

function elaboraNome(nome) {
  const cons = estraiConsonanti(nome);
  const vocali = estraiVocali(nome);
  let risultato = "";
  if (cons.length >= 4) {
    risultato = cons[0] + cons[2] + cons[3];
  } else {
    risultato = (cons + vocali).slice(0, 3);
  }
  while (risultato.length < 3) {
    risultato += "X";
  }
  return risultato;
}

function elaboraData(dataNascita, sesso) {
  const data = new Date(dataNascita);
  const anno = data.getFullYear().toString().slice(-2);
  const mese = data.getMonth(); // 0=Gennaio, 11=Dicembre
  const giorno = data.getDate();

  const codiciMese = ["A", "B", "C", "D", "E", "H", "L", "M", "P", "R", "S", "T"];
  const codiceMese = codiciMese[mese];

  let giornoCalcolato = giorno;
  if (sesso === "F") {
    giornoCalcolato += 40;
  }
  giornoCalcolato = giornoCalcolato < 10 ? "0" + giornoCalcolato : "" + giornoCalcolato;

  return anno + codiceMese + giornoCalcolato;
}

function calcolaCarattereControllo(primi15) {
  const valoriDispari = {
    0: 1,
    1: 0,
    2: 5,
    3: 7,
    4: 9,
    5: 13,
    6: 15,
    7: 17,
    8: 19,
    9: 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
  };
  const valoriPari = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
  };

  let somma = 0;
  for (let i = 0; i < primi15.length; i++) {
    const carattere = primi15[i];
    // i è 0-based, ma la posizione è (i+1)
    if ((i + 1) % 2 !== 0) {
      // dispari -> valoriDispari
      somma += valoriDispari[carattere];
    } else {
      // pari -> valoriPari
      somma += valoriPari[carattere];
    }
  }
  const alfabetoControllo = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alfabetoControllo[somma % 26];
}

function generaCodiceFiscale(cognome, nome, dataNascita, sesso, codiceComune) {
  const codiceCognome = elaboraCognome(cognome);
  const codiceNome = elaboraNome(nome);
  const codiceData = elaboraData(dataNascita, sesso);
  const primi15 = codiceCognome + codiceNome + codiceData + codiceComune;
  const carattereDiControllo = calcolaCarattereControllo(primi15);
  return primi15 + carattereDiControllo;
}

function validaCodiceFiscale(cf) {
  if (cf.length !== 16) return false;
  const primi15 = cf.slice(0, 15);
  const caratterePrevisto = calcolaCarattereControllo(primi15);
  return caratterePrevisto === cf[15];
}