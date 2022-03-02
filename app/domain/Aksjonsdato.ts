import { DateTime, Interval } from "luxon"
import invariant from "ts-invariant"

export class Aksjonsdato {
    public static readonly TIDENES_MORGEN: Aksjonsdato = new Aksjonsdato('1000-01-01')
    public static readonly TIDENES_SLUTT: Aksjonsdato = new Aksjonsdato('3000-01-01')

    public readonly DELIMITER = '.'
    public readonly FORMAT = ['yyyy', 'mm', 'dd'].join(this.DELIMITER)

    private readonly somDateTime: DateTime;
    public readonly aksjonsdato: string

    constructor(aksjonsdato: string) {
        invariant(aksjonsdato, 'Aksjonsdato mangler')
        const parset = this.normaliserDato(aksjonsdato)
        this.aksjonsdato = parset
        this.somDateTime = DateTime.fromFormat(parset, this.FORMAT)
    }

    private normaliserDato(dato: string): string {
        const split = dato.replace(/[^0-9]/g, this.DELIMITER)
            .split(this.DELIMITER)
            .filter(s => !!s)
            .map(s => s.trim())

        invariant([1, 3].includes(split.length), `${dato} er ikke en gyldig aksjonsdato, forventer "${this.FORMAT}" eller "yyyy"`)
        if (split.length === 1) { //kun år oppgitt
            return `${split[0]}.01.01`
        }
        if (split[0].length === 4) {
            return split.join(this.DELIMITER)
        }
        else if (split[2].length === 4) {
            return split.reverse().join(this.DELIMITER)
        }
        else {
            throw Error(`Klarte ikke parse ${dato} som aksjonsdato`)
        }
    }

    public plussDager(antallDager: number): Aksjonsdato {
        return new Aksjonsdato(
            this.somDateTime.plus({ days: antallDager }).toFormat('yyyy.mm.dd')
        )
    }

    public static erGyldig(text: string) {
        const split = text.replace("-", ".")
            .split(".")
            .filter(s => !!s)
            .map(s => s.trim())

        // enten varianter av yyyy.mm.dd eller kun yyyy
        return split.length === 3 || (split.length === 1 && split[0].length === 4)
    }

    public år(): number {
        return Number.parseInt(this.aksjonsdato.split(this.DELIMITER)[0])
    }

    public måned(): number {
        return Number.parseInt(this.aksjonsdato.split(this.DELIMITER)[1])
    }

    public dag(): number {
        return Number.parseInt(this.aksjonsdato.split(this.DELIMITER)[2])
    }

    public avstand(other: Aksjonsdato) {
        if (other.aksjonsdato.substring(0, 4) === this.aksjonsdato.substring(0, 4)) {
            return Math.abs(other.dag() - this.dag()) // samme måned og år
        }
        else {
            return Interval.fromDateTimes(this.somDateTime, other.somDateTime).difference()
        }

    }

    public somDato() {
        return this.somDateTime.toJSDate()
    }

    public getTime(): number {
        return this.somDateTime.toSeconds()
    }

}