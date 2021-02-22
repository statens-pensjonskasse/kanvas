import { DateTime } from "luxon";
import Periode from "./Periode";

export default class Tidslinje {
    readonly label: string;
    readonly perioder: Periode[];
    readonly datoer: Date[];
    readonly fraOgMed: Date;
    readonly tilOgMed?: Date;
    readonly posisjon: number;

    constructor(perioder: Periode[]) {
        this.label = perioder[0].label || "Tidslinje"
        this.posisjon = perioder[0].posisjon || -1
        this.perioder = perioder
        this.datoer = perioder
            .flatMap(periode => periode.tilOgMed ? [periode.fraOgMed, periode.tilOgMed] : [periode.fraOgMed])
            .flatMap(x => x)

        this.fraOgMed = this.utledStartdato(perioder)
        this.tilOgMed = this.utledSluttdato(perioder)

        this.valider()
        // console.log(`Opprettet tidslinje for ${this.label} med størrelse ${this.perioder.length}`)
    }

    datoerMedSammenlåtteDager(): Date[] {
        return this.datoer
            .sort()
            .reduce(
                (acc: Date[], current: Date) => DateTime.fromJSDate(acc[acc.length - 1]).plus({ days: 1 }) === DateTime.fromJSDate(current) ? acc : [...acc, current]
                , [this.fraOgMed]
            )
    }

    private utledStartdato(perioder: Periode[]): Date {
        return DateTime.min(...perioder.map(periode => DateTime.fromJSDate(periode.fraOgMed))).toJSDate();
    }

    private utledSluttdato(perioder: Periode[]): Date | undefined {
        return perioder.filter(periode => !periode.tilOgMed).length > 0 ? undefined : DateTime.max(...perioder.map(periode => DateTime.fromJSDate(periode.tilOgMed || new Date(-100000)))).toJSDate();
    }

    valider() {
        if (this.perioder
            .map((periode) => periode.label)
            .filter((label) => label !== this.label)
            .length > 0) {
            console.error(`Ugyldig tilstand: tidslinje inkluderer perioder med ulike labels. Forventet kun "${this.label}" i ${this.perioder}`)
        }
    }

    med(periode: Periode) {
        return new Tidslinje(
            [
                ...this.perioder,
                periode
            ]

        )
    }
}