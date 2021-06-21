type FilterparserProps = {
    delimiter: string
}

export default class Filterparser {
    readonly delimiter: string
    readonly identifikatorIndex: number
    readonly labelIndex: number
    readonly filterIndex: number

    constructor({
        delimiter
    }: FilterparserProps) {
        this.delimiter = delimiter
        this.labelIndex = 0
        this.identifikatorIndex = 1
        this.filterIndex = 2
    }

    parse(rawData: string[]): Map<string, RegExp> {
        const rader: string[][] = rawData
            .map(rad => rad.split(this.delimiter))

        const oversatteRader: (readonly [string, RegExp])[] = rader
            .filter((rad: string[]) => this.kanOversettes(rad))
            .map(
                (rad: string[]) => this.oversettRad(rad)
            )

        return new Map(oversatteRader)
    }

    kanOversettes(rad: string[]): boolean {
        const harInnhold = rad.length >= 3
        const harTypeindikator = rad[this.identifikatorIndex]?.toLowerCase() === "filter";
        const harFilter = rad[this.filterIndex]?.length > 0

        return harInnhold && harTypeindikator && harFilter
    }

    oversettRad(rad: string[]): readonly [string, RegExp] {
        const label = rad[this.labelIndex]
        const filters = rad.slice(this.filterIndex).join("|")

        let regex;
        try {
            regex = new RegExp(filters)
        }
        catch (exception) {
            console.error(`Ugyldig regex "${filters}" - matcher alt.`)
            regex = new RegExp(/.*/)
        }

        return [label, regex]
    }
}