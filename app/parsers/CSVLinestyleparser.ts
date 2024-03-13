import {Aksjonsdato} from "~/domain/Aksjonsdato";

type LinestyleparserProps = {
    delimiter: string
}

export class Tidsspenn {

    constructor(fraOgMed: Aksjonsdato, tilOgMed: Aksjonsdato) {
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed
    }

    fraOgMed: Aksjonsdato
    tilOgMed: Aksjonsdato
}

export class LinestyleKey {

    constructor(identifikator: string, tidsspenn?: Tidsspenn) {
        this.identifikator = identifikator

        if (tidsspenn) {
            this.fraOgMed = tidsspenn.fraOgMed
            this.tilOgMed = tidsspenn.tilOgMed
            this.erPeriode = true
        } else {
            this.fraOgMed = new Aksjonsdato("2020.01.01")
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
            return new LinestyleKey(split[0], new Tidsspenn(new Aksjonsdato(split[1]), new Aksjonsdato(split[2])))
        } else {
            return new LinestyleKey(split[0])
        }
    }

    static renDato(dato: Date): string {
        const renDato = new Date(dato.getTime() - (dato.getTimezoneOffset() * 60 * 1000))
        return renDato.toISOString().split('T')[0]
    }

    key(): string {
        if (this.erPeriode) {
            return this.identifikator + "|||" + LinestyleKey.renDato(this.fraOgMed.somDato()) + "|||" + LinestyleKey.renDato(this.tilOgMed.somDato())
        } else {
            return this.identifikator
        }
    }

    identifikator: string
    fraOgMed: Aksjonsdato
    tilOgMed: Aksjonsdato
    erPeriode: boolean
}

export default class Linestyleparser {
    readonly delimiter: string
    readonly fraOgMedIndex = 3
    readonly tilOgMedIndex = 4
    readonly identifikatorIndex = 1
    readonly stilIndex = 2

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
        // Polise 1;linestyle;dashed;2020;2023

        const harInnhold = rad.length === 3 || rad.length === 5
        const harTypeindikator = rad[this.identifikatorIndex]?.toLowerCase() === "linestyle"
        const harLinjestil = rad[this.stilIndex]?.length > 0

        if (rad.length == 5) {
            const erFraDato = Aksjonsdato.erGyldig(rad[this.fraOgMedIndex])
            const erTilDato = Aksjonsdato.erGyldig(rad[this.tilOgMedIndex])

            return harInnhold && harTypeindikator && harLinjestil && erFraDato && erTilDato
        } else {
            return harInnhold && harTypeindikator && harLinjestil
        }
    }

    oversettRad(rad: string[]): readonly [LinestyleKey, string] {
        const label = rad[0]
        const linestyle = rad[this.stilIndex]

        if (rad.length === 3) {
            // uten periode, hele linja
            return [new LinestyleKey(label), linestyle]
        } else {
            // kun én periode
            const fraOgMed = new Aksjonsdato(rad[this.fraOgMedIndex])
            const tilOgMed = new Aksjonsdato(rad[this.tilOgMedIndex])
            return [new LinestyleKey(label, new Tidsspenn(fraOgMed, tilOgMed)), linestyle]
        }
    }
}
