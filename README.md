# Kanvas

Kanvas er en applikasjon for å raskt kunne tegne tidslinjer.

Applikasjonen er tilgjengelig på http://kanvas.lyn.spk.no/

Jenkins-jobben ligger her: http://jenkins.spk.no/job/kanvas/

## Lokal kjøring

Applikasjonen er bygd på node.js med React og d3. Lokalt utviklingsmiljø kan startes med:

```
npm install
npm run start
```

## Produksjon

I "produksjon" (Lyn) bygges først applikasjonen, før den serves på port 8080 med express. Se [Dockerfile](./Dockerfile) for mer.

```
npm run build
npm run serve
```

Applikasjonen blir da tilgjengelig på http://localhost:8080/