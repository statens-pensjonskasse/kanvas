import Periode from "../domain/Periode"
import Tidslinjeparser from "./Tidslinjeparser"

import { DateTime } from "luxon"
import Tidslinje from "../domain/Tidslinje"

const minsteGyldigeStartDato = DateTime.fromISO("1814-05-17")

type TidslinjeparserProps = {
    delimiter: string
    fraOgMedIndex: number
    tilOgMedIndex: number
    identifikatorIndex: number
}

export default class CSVTidslinjeparser implements Tidslinjeparser {
    delimiter: string
    fraOgMedIndex: number
    tilOgMedIndex: number
    identifikatorIndex: number
    norskDato: RegExp

    constructor({
        delimiter,
        fraOgMedIndex,
        tilOgMedIndex,
        identifikatorIndex
    }: TidslinjeparserProps) {
        this.delimiter = delimiter
        this.fraOgMedIndex = fraOgMedIndex
        this.tilOgMedIndex = tilOgMedIndex
        this.identifikatorIndex = identifikatorIndex
        this.norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)
    }

    parse(rawData: string[]): Tidslinje[] {
        const rader: string[][] = rawData
            .map(rad => rad.split(this.delimiter))

        // posisjoner blir satt etter rekkefølgen identifikatorer er definert
        const posisjoner =
            rader.map(rad => rad[this.identifikatorIndex])
                .filter(identifikator => !!identifikator)
                .reduce(
                    (acc: string[], current: string) => acc.includes(current) ? acc : [current, ...acc],
                    []
                )

        const perioderPerLabel: Map<string, Periode[]> = rader
            .filter(rad => this.kanOversettes(rad))
            .map(
                rad => this.oversettRad(rad, posisjoner.indexOf(rad[this.identifikatorIndex]) + 1)
            )
            .reduce(
                (acc: Map<string, Periode[]>, current: Periode) => {
                    return acc.set(current.label, [...acc.get(current.label) || [], current])
                }, new Map()
            );

        return Array.from(perioderPerLabel.values())
            .map(
                perioder => new Tidslinje(perioder)
            )
    }

    kanOversettes(rad: string[]): boolean {
        const fraOgMed = this.oversettDato(rad[this.fraOgMedIndex]?.trim())

        const harInnhold = rad.length > 2
        const harFraOgMed = fraOgMed.isValid && rad[this.fraOgMedIndex]?.length >= 4
        const harFornuftigDato = fraOgMed > minsteGyldigeStartDato
        return harInnhold && harFraOgMed && harFornuftigDato
    }

    oversettRad(rad: string[], posisjon: number): Periode {
        const fraOgMed = rad[this.fraOgMedIndex]?.trim()
        const tilOgMedRaw = rad[this.tilOgMedIndex]?.trim()
        const tilOgMed = this.erGyldigDato(tilOgMedRaw) ? tilOgMedRaw : undefined
        const label = rad[this.identifikatorIndex]

        return new Periode(
            label,
            this.oversettDato(fraOgMed).toJSDate(),
            tilOgMed && tilOgMed.length >= 4 ? this.oversettTilOgMed(tilOgMed) : undefined,
        )
            .medPosisjon(posisjon)
            .medEgenskaper(rad.slice(this.tilOgMedIndex + 1))
    }

    private oversettTilOgMed(tilOgMed: string): Date {
        return new Date(this.oversettDato(tilOgMed).toJSDate().toDateString())
    }

    erGyldigDato(dato: string) {
        return dato && (this.norskDato.test(dato) || DateTime.fromISO(dato).isValid)
    }

    oversettDato(dato: string): DateTime {
        return this.norskDato.test(dato) ? DateTime.fromFormat(dato, "d.M.yyyy") : DateTime.fromISO(dato);
    }
}