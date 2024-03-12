type LinestyleparserProps = {
    delimiter: string
}

export class Tidsspenn {

    constructor(fraOgMed: Date, tilOgMed: Date) {
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed
    }

    fraOgMed: Date
    tilOgMed: Date
}

export class LinestyleKey {

    constructor(identifikator: string, tidsspenn?: Tidsspenn) {
        this.identifikator = identifikator

        if (tidsspenn) {
            this.fraOgMed = tidsspenn.fraOgMed
            this.tilOgMed = tidsspenn.tilOgMed
            this.erPeriode = true
        } else {
            this.fraOgMed = new Date()
            this.tilOgMed = this.fraOgMed
            this.erPeriode = false
        }
    }

    // JavaScript/TypeScript har ikke støtte for egne klasser som key i en Map, så bruker en serialisert versjon.
    serialize() {
        return this.identifikator + "|||" + this.fraOgMed + "|||" + this.tilOgMed + "|||" + this.erPeriode;
    }

    static deserialize(inp: string): LinestyleKey {
        const split = inp.split("|||")

        if (split[3] === "true") {
            return new LinestyleKey(split[0], new Tidsspenn(new Date(split[1]), new Date(split[2])))
        } else {
            return new LinestyleKey(split[0])
        }
    }

    key(): string {
        return this.identifikator
    }

    identifikator: string
    fraOgMed: Date
    tilOgMed: Date
    erPeriode: boolean
}

export default class Linestyleparser {
    readonly delimiter: string
    readonly fraOgMedIndex = 1
    readonly tilOgMedIndex = 2
    readonly identifikatorIndex1 = 1
    readonly identifikatorIndex2 = 3
    readonly stilIndex1 = 2
    readonly stilIndex2 = 4

    constructor({
                    delimiter
                }: LinestyleparserProps) {
        this.delimiter = delimiter
    }

    parse(rawData: string[]): Map<LinestyleKey, string> {
        const rader: string[][] = rawData
            .map(rad => rad.split(this.delimiter))

        const oversatteRader: (readonly [LinestyleKey, string])[] = rader
            .filter((rad: string[]) => this.kanOversettes(rad))
            .map(
                (rad: string[]) => this.oversettRad(rad)
            )

        return new Map(oversatteRader)
    }

    kanOversettes(rad: string[]): boolean {
        // Eksempler:
        //
        // Polise 1;linestyle;dashed
        // Polise 1;2020;2023;linestyle;dashed

        const harInnhold = rad.length === 3 || rad.length === 5
        const harTypeindikator = rad[this.identifikatorIndex1]?.toLowerCase() === "linestyle"
            || rad[this.identifikatorIndex2]?.toLowerCase() === "linestyle";
        const harLinjestil = rad.length === 3
            ? (rad[this.stilIndex1]?.length > 0)
            : (rad.length === 5
                    ? rad[this.stilIndex2]?.length > 0
                    : false
            )

        return harInnhold && harTypeindikator && harLinjestil
    }

    oversettRad(rad: string[]): readonly [LinestyleKey, string] {
        if (rad.length === 3) { // uten periode, hele linja
            const label = rad[0]
            const linestyle = rad[this.stilIndex1]

            return [new LinestyleKey(label), linestyle]
        } else { // kun én periode
            const label = rad[0]
            const linestyle = rad[this.stilIndex2]

            return [new LinestyleKey(label), linestyle]
        }
    }
}
