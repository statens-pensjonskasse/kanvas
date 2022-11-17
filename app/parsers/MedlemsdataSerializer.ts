import Periode from "../domain/Periode";
import Tidslinje from "../domain/Tidslinje";


export class MedlemsdataSerializer {
    static serialize(personId: String, tidslinje: Tidslinje): String[] {
        const sortert: Periode[] = tidslinje.perioder
            .sort((a: Periode, b: Periode) => a.fraOgMed.getTime() - b.fraOgMed.getTime())

        if (tidslinje.label.toLowerCase().startsWith("person")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "PERSON",
                            periode.fraOgMed.aksjonsdato.replace(/\./g, ""),
                            periode.egenskap("Personnummer") || "58008",
                            periode.tilOgMed?.aksjonsdato,
                            periode.egenskap("Kjønn") || "Kvinne"
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("stilling")) {
            return [
                [
                    personId,
                    "1", // typeindikator avtalekobling
                    "", // reservert
                    "", // reservert
                    tidslinje[0]?.egenskap("Stillingsforholdsnummer") || "1",
                    tidslinje.fraOgMed.aksjonsdato,
                    tidslinje.tilOgMed?.aksjonsdato || "",
                    tidslinje[0]?.egenskap("Avtalenummer") || "203951", // en stor avtale
                ].join(";"),
                ...sortert.map(
                    periode => (
                        [
                            personId,
                            "0", // typeindikator stillingsendring
                            "", //reservert
                            "", //reservert
                            periode.egenskap("Stillingsforholdsnummer") || "1",
                            (() => {
                                if (periode.fraOgMed.aksjonsdato === tidslinje.fraOgMed.aksjonsdato) {
                                    return "011"
                                }
                                else if (tidslinje.tilOgMed && periode.tilOgMed.aksjonsdato === tidslinje.tilOgMed.aksjonsdato) {
                                    return "031"
                                }
                                else {
                                    return "021"
                                }
                            })(),
                            "", //reservert
                            periode.egenskap("Permisjonsavtale") || "",
                            periode.egenskap("Registreringsdato") || "",
                            periode.egenskap("Stillingsstørrelse") || "100.000",
                            periode.egenskap("Lønnstrinn") || "",
                            periode.egenskap("Innrapportert årslønn") || "600000",
                            periode.egenskap("Faste tillegg") || "",
                            periode.egenskap("Variable tillegg") || "",
                            periode.egenskap("Funksjonstillegg") || "",
                            periode.fraOgMed.aksjonsdato,
                            periode.egenskap("Stillingskode") || "",
                            "", //reservert
                            periode.egenskap("Aldersgrense") || "70",
                            periode.egenskap("Permisjonskode") || "",
                        ]
                            .join(";")
                    )
                )
            ]
        }
        else if (tidslinje.label.toLowerCase().startsWith("pensjonsvedtak")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "ISOLERTPENSJONSVEDTAK",
                            periode.fraOgMed.aksjonsdato,
                            periode.tilOgMed?.plussDager(-1).aksjonsdato || "",
                            periode.egenskap("Pensjonsart") || "343",
                            periode.egenskap("SPK beregnet pensjon") || "10000",
                            periode.egenskap("Pensjonsprodukt") || "UFO",
                            periode.egenskap("UttaksId") || "1",
                            periode.egenskap("Beregnetpensjonstype") || "PEN",
                            periode.egenskap("Grunnlagsgrad") || "100.000",
                            periode.egenskap("Pensjonsordning") || "3010",
                            periode.egenskap("Pensjonstype") || "UTB",
                            periode.egenskap("PensjonsuttaksId") || "12345", // TODO: fiks?
                            periode.egenskap("Etterlatt") || "",
                            periode.egenskap("Betalingsformidler") || "",
                            periode.egenskap("Barnetillegg") || "",
                            periode.egenskap("Pensjonsgrad") || "",
                            periode.egenskap("Stillingsstørrelse") || "",
                            periode.egenskap("Aldersgrense") || "70",
                            periode.egenskap("Ansattforhold") || "",
                            periode.egenskap("Pensjonsgrunnlag") || "700000",
                            periode.egenskap("Uføregrad") || "",
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("etterlatt")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "ETTERLATTE",
                            periode.egenskap("Etterlatte PersonId") || "",
                            periode.egenskap("Fødselsdato") || "19800101",
                            periode.egenskap("Personnummer") || "58008",
                            periode.egenskap("Dødsdato") || "",
                            periode.egenskap("Kjønn") || "Kvinne"
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("medregning")) {
            return sortert
                .map(
                    (periode, i) => (
                        [
                            personId,
                            "MEDREGNING",
                            periode.fraOgMed.aksjonsdato,
                            periode.tilOgMed?.plussDager(-1).aksjonsdato || "",
                            periode.egenskap("Medregningskode") || "01",
                            periode.egenskap("Medregningsbeløp") || "200000",
                            periode.egenskap("Medregned deltid") || "50.000",
                            periode.egenskap("Løpenummer") || `${i + 1}`,
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("avtalebytte")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "AVTALEBYTTE",
                            periode.egenskap("Avtalebyttedato") || periode.fraOgMed.aksjonsdato,
                            periode.egenskap("Bytt fra avtale") || "203951",
                            periode.egenskap("Bytt til avtale") || "203333",
                            periode.egenskap("Avtalebyttetype") || "Pensjonist",
                            periode.egenskap("Etterlatt") || "",
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("avtalebytte")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "FEILAVTALEBYTTE",
                            periode.egenskap("Avtalebyttedato") || periode.fraOgMed.aksjonsdato,
                            periode.egenskap("Bytt fra avtale") || "203951",
                            periode.egenskap("Bytt til avtale") || "203333",
                            periode.egenskap("Avtalebyttetype") || "Pensjonist",
                            periode.egenskap("Etterlatt") || "",
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("feil avtalebytte")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "FEILAVTALEBYTTE",
                            periode.fraOgMed.aksjonsdato,
                            periode.tilOgMed?.plussDager(-1).aksjonsdato || "",
                            periode.egenskap("Avtalebytte som oppsatt") || "0",
                            periode.egenskap("Avtalebytte som pensjonist") || "1",
                            periode.egenskap("Avtalebytte som på etterlatt") || "0",
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.toLowerCase().startsWith("folketrygd")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "FOLKETRYGD",
                            periode.fraOgMed.aksjonsdato,
                            periode.tilOgMed?.plussDager(-1).aksjonsdato || "",
                            periode.egenskap("T42") || "",
                            periode.egenskap("T45") || "",
                            periode.egenskap("Poengtall") || "",
                            periode.egenskap("Ervervskoeffisient") || "",
                            periode.egenskap("Vektet grunnbeløp") || "",
                            periode.egenskap("Er gift") || "Ja",
                        ]
                            .join(";")
                    )
                )
        }
        else {
            return []
        }
    }
}