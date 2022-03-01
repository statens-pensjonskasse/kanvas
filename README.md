# Kanvas

Kanvas er en applikasjon for å raskt kunne tegne tidslinjer.

Applikasjonen er tilgjengelig på http://kanvas.lyn.spk.no/

Jenkins-jobben ligger her: http://jenkins.spk.no/job/kanvas/

## API

Kanvas tilbyr et api som kan generere tidslinjer som SVG.
Endepunktet støtter POST, og krever et felt `data` som inneholder en array med csv-linjer (hvert element er en csv-rad).

Eksempel:
``` bash
curl -X POST http://kanvas.kpt.spk.no/api/lagTidslinjer \
   -H "Content-Type: application/json" \
   -d '{"data": ["Polise 1;2000;;", "Polise 1;2010;;"]}'
```

## CSV-format

Tidslinjeperioder:

`Polise 1;2000;2010;Polisestatus: Aktiv;Avtale for reserve: 200123`

Oppretter en tidslinje med:
* **Typeindikator:** Polise 1
* **Fra og med:** 1.1.2000
* **Til og med:** 1.1.2010
* **Polisestatus:** Aktiv
* **Avtale for reserve:** 200123

Hver ekstra kolonne som blir lagt til blir tolket som en ny egenskap.
Dersom egenskapen er oppgitt på formatet `<nøkkel>: <verdi>` vil kanvas tolke det som at egenskap `<nøkkel>` har verdi `<verdi>`.
I eksempelet over er en av egenskapene oppgitt med nøkkel "Polisestatus" og verdi "Aktiv".

### Ekstra
Fargelegg en tidslinje:
`Polise 1;color;red`

Filtrer egenskaper:
`Polise 1;filter;Polisestatus;Avtale`


## Lokal kjøring

Applikasjonen er bygd på node.js med React og d3. Lokalt utviklingsmiljø kan startes med:

``` bash
npm install
npm run start
```

## Produksjon

I "produksjon" (Lyn) bygges først applikasjonen, før den serves på port 8080 med express. Se [Dockerfile](./Dockerfile) for mer.

``` bash
npm run build
npm run serve
```

Applikasjonen blir da tilgjengelig på http://localhost:8080/