type ColorparserProps = {
    delimiter: string
}

export default class Colorparser {
    readonly delimiter: string
    readonly identifikatorIndex: number
    readonly labelIndex: number
    readonly colorIndex: number

    constructor({
        delimiter
    }: ColorparserProps) {
        this.delimiter = delimiter
        this.labelIndex = 0
        this.identifikatorIndex = 1
        this.colorIndex = 2
    }

    parse(rawData: string): Map<string, string> {
        const rader: string[][] = rawData.split(/\r?\n/)
            .map(rad => rad.trim())
            .map(rad => rad.split(this.delimiter))

        const oversatteRader: (readonly [string, string])[] = rader
            .filter((rad: string[]) => this.kanOversettes(rad))
            .map(
                (rad: string[]) => this.oversettRad(rad)
            )
            
        return new Map(oversatteRader)
    }

    kanOversettes(rad: string[]): boolean {
        const harInnhold = rad.length === 3
        const harTypeindikator = rad[this.identifikatorIndex]?.toLowerCase() === "color";
        const harFarge = rad[this.colorIndex]?.length > 0

        return harInnhold && harTypeindikator && harFarge
    }

    oversettRad(rad: string[]): readonly [string, string] {
        const label = rad[this.labelIndex]
        const color = rad[this.colorIndex]

        return [label, color]
    }
}