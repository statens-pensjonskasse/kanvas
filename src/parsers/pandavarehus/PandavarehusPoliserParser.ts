import { DateTime } from "luxon"
import Periode from "../../domain/Periode"
import Tidslinje from "../../domain/Tidslinje"
import Pandavarehusparser from './PandavarehusParser'

interface Poliseperiode {
    Typeindikator: String
    PoliseId: String
    FraOgMed: Date
    TilOgMed: Date
    Polisestatus: String,
    AvtaleForReserve: String,
    Ordningsgruppe: String,
    Stillingsforholdnummer: String,
    Polisetype: String,
    Polisegrad: String
}

export default class PandavarehusPoliserParser implements Pandavarehusparser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    parse(data: any[]): Tidslinje[] {
        // posisjoner blir satt etter poliseID
        const posisjoner = data.map(rad => rad["PoliseId"])
            .filter(identifikator => !!identifikator)
            .reduce(
                (acc: string[], current: string) => acc.includes(current) ? acc : [current, ...acc],
                []
            )

        const perioderPerLabel: Map<string, Periode[]> = data
            .map(
                periode => ({
                    Typeindikator: periode["Typeindikator"],
                    PoliseId: periode["PoliseId"],
                    FraOgMed: this.oversettDato(periode["Fra og med-dato"]).toJSDate(),
                    TilOgMed: this.oversettTilOgMed(periode["Til og med-dato"]),
                    Polisestatus: periode["Polisestatus"] || "",
                    AvtaleForReserve: periode["Avtale for reserve"] || "",
                    Ordningsgruppe: periode["Ordningsgruppe"] || "",
                    Stillingsforholdnummer: periode["Stillingsforholdnummer"] || "",
                    Polisetype: periode["Polisetype"] || "",
                    Polisegrad: periode["Polisegrad"] || ""
                })
            )
            .map(
                polisePeriode => new Periode(
                    `Polise ${polisePeriode.PoliseId}`,
                    polisePeriode.FraOgMed,
                    polisePeriode.TilOgMed
                )
                    .medEgenskaper([
                        `Polisestatus: ${polisePeriode.Polisestatus}`,
                        `_AvtaleForReserve: ${polisePeriode.AvtaleForReserve}`,
                        //`Ordningsgruppe: ${polisePeriode.Ordningsgruppe}`,
                        //`Stillingsforholdnummer: ${polisePeriode.Stillingsforholdnummer}`,
                        //`Polisetype: ${polisePeriode.Polisetype}`,
                        `Polisegrad: ${polisePeriode.Polisegrad}%`
                    ]
                        .filter(egenskap => !!egenskap)
                    )
                    .medPosisjon(posisjoner.indexOf(polisePeriode.PoliseId) + 1)
            )
            .reduce(
                (acc: Map<string, Periode[]>, current: Periode) => {
                    return acc.set(current.label, [...acc.get(current.label) || [], current])
                }, new Map()
            );

        return Array.from(perioderPerLabel.values())
            .map(
                perioder => {
                    const sammenslåtte = perioder
                        .sort((a: Periode, b: Periode) => a.fraOgMed.getTime() - b.fraOgMed.getTime())
                        .reduce(
                            (acc: Periode[], current: Periode) => {
                                if (acc.length > 0) {
                                    const forrigeIndeks = acc.length - 1
                                    const forrigeElement = acc[forrigeIndeks]
                                    const nyeElementer = forrigeElement.kombinerMed(current)

                                    return [...acc.slice(0, forrigeIndeks), ...nyeElementer]
                                }
                                return [current]
                            }, []
                        )
                    return new Tidslinje(sammenslåtte)
                }
            )
    }


    private oversettTilOgMed(tilOgMed: string): Date | undefined {
        if (tilOgMed !== "9999-12-31") {
            return this.oversettDato(tilOgMed).toJSDate()
        }
    }

    erGyldigDato(dato: string) {
        return dato && (this.norskDato.test(dato) || DateTime.fromISO(dato).isValid)
    }

    oversettDato(dato: string): DateTime {
        return this.norskDato.test(dato) ? DateTime.fromFormat(dato, "d.M.yyyy") : DateTime.fromISO(dato);
    }
}