import Periode from "./Periode"

import { DateTime } from "luxon"

const minsteGyldigeStartDato = DateTime.fromISO("1814-05-17")

type PeriodeparserProps = {
    delimiter: string
    fraOgMedIndex: number
    tilOgMedIndex: number
    identifikatorIndex: number
}

export default class Periodeparser {
    delimiter: string
    fraOgMedIndex: number
    tilOgMedIndex: number
    identifikatorIndex: number

    constructor({
        delimiter,
        fraOgMedIndex,
        tilOgMedIndex,
        identifikatorIndex
    }: PeriodeparserProps) {
        this.delimiter = delimiter
        this.fraOgMedIndex = fraOgMedIndex
        this.tilOgMedIndex = tilOgMedIndex
        this.identifikatorIndex = identifikatorIndex
    }

    parse(rawData: string) {
        const rader: string[][] = rawData.split(/\r?\n/)
            .map(rad => rad.trim())
            .map(rad => rad.split(this.delimiter))

        // posisjoner blir satt etter rekkefølgen identifikatorer er definert
        const posisjoner =
            rader.map(rad => rad[this.identifikatorIndex])
                .filter(identifikator => !!identifikator)
                .reduce(
                    (acc: string[], current: string) => acc.includes(current) ? acc : [current, ...acc],
                    []
                )

        return rader
            .filter(rad => this.kanOversettes(rad))
            .map(
                rad => this.oversettRad(rad, posisjoner.indexOf(rad[this.identifikatorIndex]) + 1)
            )
    }

    kanOversettes(rad: string[]): boolean {
        const fraOgMed = DateTime.fromISO(rad[this.fraOgMedIndex])

        const harInnhold = rad.length > 2
        const harFraOgMed = fraOgMed.isValid && rad[this.fraOgMedIndex]?.length >= 4
        const harFornuftigDato = fraOgMed > minsteGyldigeStartDato
        return harInnhold && harFraOgMed && harFornuftigDato
    }

    oversettRad(rad: string[], posisjon: number): Periode {
        const fraOgMed = rad[this.fraOgMedIndex]
        const tilOgMed = rad[this.tilOgMedIndex]?.trim() || undefined
        const label = rad[this.identifikatorIndex]

        return new Periode(
            label,
            DateTime.fromISO(fraOgMed).toJSDate(),
            tilOgMed ? DateTime.fromISO(tilOgMed).plus({day: 1}).toJSDate() : undefined,
        )
            .setPosisjon(posisjon)
            .setEgenskaper(rad.slice(this.tilOgMedIndex + 1))
    }
}