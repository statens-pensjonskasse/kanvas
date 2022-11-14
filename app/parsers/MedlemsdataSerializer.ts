import Periode from "../domain/Periode";
import Tidslinje from "../domain/Tidslinje";


export class MedlemsdataSerializer {
    static serialize(personId: String, tidslinje: Tidslinje): String[] {
        const sortert: Periode[] = tidslinje.perioder
            .sort((a: Periode, b: Periode) => a.fraOgMed.getTime() - b.fraOgMed.getTime())

        if (tidslinje.label.startsWith("Person")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "PERSON",
                            periode.fraOgMed.aksjonsdato.replace(/\./g, ""),
                            "12345",
                            periode.tilOgMed?.aksjonsdato,
                            periode.egenskap("Kjønn") || "Kvinne"
                        ]
                            .join(";")
                    )
                )
        }
        else if (tidslinje.label.startsWith("Stilling")) {
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
        else if (tidslinje.label.startsWith("Pensjonsvedtak")) {
            return sortert
                .map(
                    periode => (
                        [
                            personId,
                            "ISOLERTPENSJONSVEDTAK",
                            periode.fraOgMed.aksjonsdato,
                            periode.tilOgMed?.aksjonsdato || "",
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
        // TODO: Manglende oversettere:
        // AVTALEBYTTE
        // ETTERLATT
        // FEILAVTALEBYTTE
        // FOLKETRYGD
        // MEDREGNING

        else {
            return []
        }
    }


}