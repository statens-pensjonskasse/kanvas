import { Aksjonsdato } from "~/domain/Aksjonsdato"
import Periode from "../../domain/Periode"
import Tidslinje from "../../domain/Tidslinje"
import Pandavarehusparser from './PandavarehusParser'

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
                    Typeindikator: periode["Type"],
                    PoliseId: periode["PoliseId"],
                    FraOgMed: this.oversettDato(periode["FraOgMed"]),
                    TilOgMed: this.oversettTilOgMed(periode["TilOgMed"]),
                    Polisestatus: periode["Polisestatus"] || "",
                    AvtaleForReserve: periode["Avtale for reserve"] || "",
                    Ordningsgruppe: periode["Ordningsgruppe"] || "",
                    Stillingsforholdnummer: periode["Stillingsforhold"] || "",
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
                    .medPosisjon(posisjoner.indexOf(polisePeriode.PoliseId))
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


    private oversettTilOgMed(tilOgMed: string): Aksjonsdato | undefined {
        if (!!tilOgMed) {
            return this.oversettDato(tilOgMed).plussDager(1) // kombinerer med påfølgende
        }
    }

    erGyldigDato(dato: string) {
        return dato && Aksjonsdato.erGyldig(dato)
    }

    oversettDato(dato: string): Aksjonsdato {
        return new Aksjonsdato(dato)
    }
}