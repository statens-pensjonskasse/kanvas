import Periode from "../domain/Periode"
import Tidslinjeparser from "./Tidslinjeparser"

import { DateTime } from "luxon"
import Tidslinje from "../domain/Tidslinje"

const minsteGyldigeStartDato = DateTime.fromISO("1814-05-17")
const starterMedLinje = new RegExp(/^[^-]/);

export default class GherkinTidslinjeparser implements Tidslinjeparser {
    fraOgMedIndex: number = -1
    tilOgMedIndex: number = -1
    identifikatorIndex: number = -1
    gherkinDato = new RegExp(/^[0-9]{4}\.[0-9]{2}\.[0-9]{2}$/)
    public static gherkinSection = new RegExp(/^(?:Gitt|Og|Når|Så|Eksempler|^\|\s+Tidslinje\b)/)

    parse(rawData: string[]): Tidslinje[] {
        const gherkinSections: number[] = rawData
            .map(
                (row, index) => GherkinTidslinjeparser.gherkinSection.test(row) ? index : -1
            )
            .filter(index => index > -1);

        let sections: number[][] = gherkinSections.flatMap((_, i, a) => [a.slice(i, i + 2)]);

        const tidslinjer = sections
            .map(
                pair => rawData.slice(pair[0], pair[1])
            )
            .filter(
                rawSectionData => rawSectionData
                    .filter(
                        rad => new RegExp(/^\|\s+Tidslinje\b/).test(rad)
                    )
                    .length > 0
            )
            .map(
                rawSectionData => this.parseSeksjon(
                    rawSectionData
                        .filter(rad => rad.startsWith("|"))
                )
            )
            .flatMap(x => x)

        return tidslinjer
            .map(
                (tidslinje, index) => tidslinje.medPosisjon(tidslinjer.length - 1 - index)
            )
    }

    parseSeksjon(rawData: string[]): Tidslinje[] {
        const transposed: string[][] = this.transpose(
            rawData
                .map(
                    rad => rad
                        .split("|")
                        .map(cell => cell.trim())
                )
        )

        const headerRad = transposed.filter(
            rad => rad.find(
                celle => celle === "Tidslinje"
            )
        )[0]

        this.fraOgMedIndex = headerRad.indexOf("Fra og med-dato") || 0
        this.tilOgMedIndex = headerRad.indexOf("Til og med-dato") || 0
        this.identifikatorIndex = headerRad.indexOf("Tidslinje") || 0

        const label = transposed[transposed.indexOf(headerRad) + 1][this.identifikatorIndex] || "Tidslinje";

        const perioder = transposed
            .filter(rad => this.kanOversettes(rad))
            .map(
                rad => this.oversettRad(rad, 1, label, headerRad)
            )

        return perioder.length > 0 ? [new Tidslinje(perioder)] : []
    }



    kanOversettes(rad: string[]): boolean {
        const fraOgMed = this.oversettDato(rad[this.fraOgMedIndex]?.trim())

        const harInnhold = rad.length > 2
        const harFraOgMed = fraOgMed.isValid && rad[this.fraOgMedIndex]?.length >= 4
        const harFornuftigDato = fraOgMed > minsteGyldigeStartDato
        return harInnhold && harFraOgMed && harFornuftigDato
    }

    oversettRad(rad: string[], posisjon: number, label: string, headerRad: string[]): Periode {
        const fraOgMed = rad[this.fraOgMedIndex]?.trim()
        const tilOgMedRaw = rad[this.tilOgMedIndex]?.trim()
        const tilOgMed = this.erGyldigDato(tilOgMedRaw) ? tilOgMedRaw : undefined
        // const label = rad[this.identifikatorIndex]

        return new Periode(
            label,
            this.oversettDato(fraOgMed).toJSDate(),
            tilOgMed && tilOgMed.length >= 4 ? this.oversettTilOgMed(tilOgMed) : undefined,
        )
            .medPosisjon(posisjon)
            .medEgenskaper(
                rad
                    .map((cell, index) => `${headerRad[index]?.trim()}: ${cell?.trim()}`)
                    .slice(this.tilOgMedIndex + 1)
                    .map(cell => cell.trim())
                    .filter(cell => cell !== "")
                    .filter(cell => starterMedLinje.test(cell))
            )
    }

    erGyldigDato(dato: string) {
        return dato && (this.gherkinDato.test(dato) || DateTime.fromISO(dato).isValid)
    }

    oversettDato(dato: string): DateTime {
        return this.gherkinDato.test(dato) ? DateTime.fromFormat(dato, "yyyy.M.d") : DateTime.fromISO(dato);
    }

    private oversettTilOgMed(tilOgMed: string): Date {
        return this.oversettDato(tilOgMed).plus({ days: 1 }).toJSDate()
    }

    transpose = (m: string[][]) => m[0].map((x, i) => m.map(x => x[i]))
}