/****************************/
/* GESTIONE NAVBAR */
/****************************/
const collegamentiNav = document.querySelectorAll("nav a");
const sezioneHome = document.getElementById("homeSection");
const sezioneVerifica = document.getElementById("verificaCFSection");
const sezioneInfo = document.getElementById("infoSection");
const sezioneCronologia = document.getElementById("cronologiaSection");

collegamentiNav.forEach((link) => {
  link.addEventListener("click", (evento) => {
    evento.preventDefault();
    const sezioneDaMostrare = link.getAttribute("data-sezione");

    // Rimuovo la classe "attiva" da tutte le sezioni
    sezioneHome.classList.remove("attiva");
    sezioneVerifica.classList.remove("attiva");
    sezioneInfo.classList.remove("attiva");
    sezioneCronologia.classList.remove("attiva");

    if (sezioneDaMostrare === "home") {
      sezioneHome.classList.add("attiva");
      sezioneHome.scrollIntoView({ behavior: "smooth" });
    } else if (sezioneDaMostrare === "verificaCF") {
      sezioneVerifica.classList.add("attiva");
      sezioneVerifica.scrollIntoView({ behavior: "smooth" });
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
/* OVERLAY CARICAMENTO */
/****************************/
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("overlayCaricamento").classList.add("nascosto");
  }, 1000);
});

/****************************/
/* Caricamento COMUNI (comuni.json) */
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

/****************************/
/* GENERAZIONE CODICE FISCALE */
/****************************/
const formCF = document.getElementById("formCF");
const outputCF = document.getElementById("outputCF");
const risultatoCF = document.getElementById("risultatoCF");

formCF.addEventListener("submit", (evento) => {
  evento.preventDefault();

  // Mostro l'overlay di caricamento
  document.getElementById("overlayCaricamento").classList.remove("nascosto");

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

  setTimeout(() => {
    const codiceFiscaleGenerato = generaCodiceFiscale(
      valoreCognome,
      valoreNome,
      valoreDataNascita,
      valoreSesso,
      codiceComune
    );
    outputCF.textContent = codiceFiscaleGenerato;
    salvaCronologia(codiceFiscaleGenerato);
    svuotaCampiForm();
    document.getElementById("overlayCaricamento").classList.add("nascosto");
    risultatoCF.scrollIntoView({ behavior: "smooth" });
  }, 800);
});

/****************************/
/* SVUOTA CAMPI DEL FORM */
/****************************/
function svuotaCampiForm() {
  document.getElementById("cognome").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("dataNascita").value = "";
  document.querySelectorAll('input[name="sesso"]').forEach((el) => (el.checked = false));
  selectComune.value = "";
}

/****************************/
/* VERIFICA CODICE FISCALE */
/****************************/
const formVerifica = document.getElementById("formVerifica");
const risultatoVerifica = document.getElementById("risultatoVerifica");

formVerifica.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const cfInserito = document.getElementById("inputCF").value.trim().toUpperCase();
  const valido = validaCodiceFiscale(cfInserito);
  if (valido) {
    risultatoVerifica.textContent = "Il codice fiscale è valido.";
    risultatoVerifica.style.color = "green";
    document.getElementById("cardIdentita").style.display = "block";
    document.getElementById("cfDisplay").textContent = cfInserito;

    const dati = decodificaCF(cfInserito);
    if (dati) {
      document.getElementById("cognomeID").textContent = dati.cognomeCode;
      document.getElementById("nomeID").textContent = dati.nomeCode;
      let giorno = String(dati.dataNascita.getDate()).padStart(2, "0");
      let mese = String(dati.dataNascita.getMonth() + 1).padStart(2, "0");
      let anno = dati.dataNascita.getFullYear();
      document.getElementById("dataNascitaID").textContent = giorno + "/" + mese + "/" + anno;
      document.getElementById("luogoID").textContent = dati.comuneCode;
      document.getElementById("sessoID").textContent = dati.sesso;
    }
  } else {
    risultatoVerifica.textContent = "Il codice fiscale NON è valido.";
    risultatoVerifica.style.color = "red";
    document.getElementById("cardIdentita").style.display = "none";
  }
  risultatoVerifica.scrollIntoView({ behavior: "smooth" });
});

/****************************/
/* CRONOLOGIA (LocalStorage) */
/****************************/
const listaCronologia = document.getElementById("listaCronologia");
const pulsanteCancellaCronologia = document.getElementById("pulsanteCancellaCronologia");

document.addEventListener("DOMContentLoaded", () => {
  caricaCronologia();
});

function salvaCronologia(cf) {
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
  document.querySelectorAll(".cronologia-lista button").forEach((bottone) => {
    bottone.addEventListener("click", () => {
      const idx = bottone.getAttribute("data-indice");
      eliminaElementoCronologia(idx);
    });
  });
}

/****************************/
/* FUNZIONI PER CALCOLO CODICE FISCALE */
/****************************/
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
  const mese = data.getMonth();
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
    0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21,
    A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21,
    K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14,
    U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23
  };
  const valoriPari = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9,
    K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19,
    U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25
  };
  let somma = 0;
  for (let i = 0; i < primi15.length; i++) {
    const carattere = primi15[i];
    if ((i + 1) % 2 !== 0) {
      somma += valoriDispari[carattere];
    } else {
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

/****************************/
/* POPUP COPIA */
/****************************/
const popupCopiato = document.getElementById("popupCopiato");
["mouseover", "click"].forEach((evt) => {
  risultatoCF.addEventListener(evt, () => {
    if (
      outputCF.textContent.trim() !== "" &&
      outputCF.textContent.trim() !== "Il Codice Fiscale comparirà qui."
    ) {
      navigator.clipboard.writeText(outputCF.textContent.trim());
      popupCopiato.classList.add("visibile");
      setTimeout(() => {
        popupCopiato.classList.remove("visibile");
      }, 1000);
    }
  });
});

/****************************/
/* Funzione Verifica */
/****************************/
function decodificaCF(cf) {
  if (cf.length !== 16) return null;
  const cognomeCode = cf.substring(0, 3);
  const nomeCode = cf.substring(3, 6);
  const anno2Cifre = parseInt(cf.substring(6, 8), 10);
  const meseLettera = cf.charAt(8);
  const giornoVal = parseInt(cf.substring(9, 11), 10);
  const comuneCode = cf.substring(11, 15);
  const carattereControllo = cf.charAt(15); 
  let sesso = "M";
  let giorno = giornoVal;
  if (giornoVal > 31) {
    sesso = "F";
    giorno = giornoVal - 40;
  }
  const mappaMesi = { A: 0, B: 1, C: 2, D: 3, E: 4, H: 5, L: 6, M: 7, P: 8, R: 9, S: 10, T: 11 };
  const meseNum = mappaMesi[meseLettera];
  let annoCompleto = anno2Cifre + 1900;
  if (anno2Cifre < 30) {
    annoCompleto = anno2Cifre + 2000;
  }
  const dataNascita = new Date(annoCompleto, meseNum, giorno);
  return {
    cognomeCode,
    nomeCode,
    dataNascita,
    sesso,
    comuneCode,
    carattereControllo,
  };
}