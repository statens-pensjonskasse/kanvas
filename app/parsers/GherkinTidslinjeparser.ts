import { Aksjonsdato } from "~/domain/Aksjonsdato"
import Periode from "../domain/Periode"
import Tidslinje from "../domain/Tidslinje"
import Tidslinjeparser from "./Tidslinjeparser"


const minsteGyldigeStartDato = new Aksjonsdato("1814-05-17")
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

        const sections: number[][] = gherkinSections.flatMap((_, i, a) => [a.slice(i, i + 2)]);

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
        const fraOgMedString = rad[this.fraOgMedIndex]?.trim()
        if (!fraOgMedString || !Aksjonsdato.erGyldig(fraOgMedString)) {
            return false
        }
        const fraOgMed = this.oversettDato(fraOgMedString)

        const harInnhold = rad.length > 2
        const harFraOgMed = fraOgMed && rad[this.fraOgMedIndex]?.length >= 4
        const harFornuftigDato = fraOgMed.getTime() > minsteGyldigeStartDato.getTime()
        return harInnhold && harFraOgMed && harFornuftigDato
    }

    oversettRad(rad: string[], posisjon: number, label: string, headerRad: string[]): Periode {
        const fraOgMed = rad[this.fraOgMedIndex]?.trim()
        const tilOgMedRaw = rad[this.tilOgMedIndex]?.trim()
        const tilOgMed = this.erGyldigDato(tilOgMedRaw) ? tilOgMedRaw : undefined
        // const label = rad[this.identifikatorIndex]

        return new Periode(
            label,
            this.oversettDato(fraOgMed),
            tilOgMed && tilOgMed.length >= 4 ? this.oversettDato(tilOgMed).plussDager(1) : undefined,
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
        return this.gherkinDato.test(dato) && Aksjonsdato.erGyldig(dato)
    }

    oversettDato(dato: string): Aksjonsdato {
        return new Aksjonsdato(dato)
    }

    transpose = (m: string[][]) => m[0].map((x, i) => m.map(x => x[i]))
}