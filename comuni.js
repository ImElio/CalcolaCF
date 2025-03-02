// Questo script verrà utilizzato per recuperare e aggiornare l'elenco dei comuni italiani.
// Il file dei comuni verrà preso dalla repository GitHub:
// https://github.com/matteocontrini/comuni-json/blob/master/comuni.json
// Versione script (v1)

const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json';
const outputFile = 'comuni.json';

https.get(url, (res) => {
  let data = '';

  // Raccoglie i dati dal flusso
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const comuni = JSON.parse(data);
      // Filtra i dati per ottenere solo i campi richiesti: "nome" e "codice" (usa "codiceCatastale" se presente)
      const filtered = comuni.map(item => ({
        nome: item.nome,
        codice: item.codiceCatastale || item.codice
      }));

      fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2));
      console.log(`File aggiornato con successo: ${outputFile}`);
    } catch (err) {
      console.error('Errore durante il parsing del JSON:', err);
    }
  });
}).on('error', (err) => {
  console.error('Errore durante il download del file:', err);
});
