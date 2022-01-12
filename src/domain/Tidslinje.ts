import { DateTime, Interval } from "luxon";
import Periode from "./Periode";

export default class Tidslinje {
    readonly label: string;
    readonly perioder: Periode[];
    readonly datoer: Date[];
    readonly fraOgMed: Date;
    readonly tilOgMed?: Date;
    readonly posisjon: number;

    constructor(perioder: Periode[]) {
        this.label = perioder[0]?.label || "Tidslinje"
        this.posisjon = Math.max(...perioder.map(p => p.posisjon), -1)
        this.perioder = this.justerSammenhengendePerioder(perioder)
        this.datoer = this.perioder
            .flatMap(periode => periode.tilOgMed ? [periode.fraOgMed, periode.tilOgMed] : [periode.fraOgMed])
            .flatMap(x => x)

        this.fraOgMed = this.utledStartdato()
        this.tilOgMed = this.utledSluttdato()

        this.valider()
        // console.log(`Opprettet tidslinje for ${this.label} med størrelse ${this.perioder.length}`)
    }
    justerSammenhengendePerioder(perioder: Periode[]): Periode[] {
        const kombinertePerioder = perioder
            .sort((a, b) => b.fraOgMed.getTime() - a.fraOgMed.getTime())
            .reduce(
                (acc: Periode[], current: Periode) => acc.length === 0 ? [current] : [...acc, this.kombinerSammenhengende(acc[acc.length - 1], current)]
                , []
            )


        const sistePeriode = kombinertePerioder[0]
        const sluttdato = sistePeriode.tilOgMed ?
            DateTime.fromJSDate(sistePeriode.tilOgMed).plus({ days: 0 }).toJSDate() :
            sistePeriode.tilOgMed

        const justertePerioder = sluttdato ?
            [
                sistePeriode.medSluttDato(sluttdato),
                ...kombinertePerioder.slice(1)
            ] :
            kombinertePerioder

        return justertePerioder
    }

    private kombinerSammenhengende(next: Periode, current: Periode): Periode {
        if (!current.tilOgMed) {
            return current.medSluttDato(next.fraOgMed);
        }
        else if (Interval.fromDateTimes(DateTime.fromJSDate(current.tilOgMed), DateTime.fromJSDate(next.fraOgMed)).length("days") === 1) {
            return current.medSluttDato(next.fraOgMed)
        }
        return current;
    }

    private utledStartdato(): Date {
        return DateTime.min(...this.perioder.map(periode => DateTime.fromJSDate(periode.fraOgMed))).toJSDate();
    }

    private utledSluttdato(): Date | undefined {
        return this.perioder
            .filter(
                periode => !periode.tilOgMed).length > 0 ?
            undefined :
            DateTime.max(
                ...this.perioder.map(
                    periode => DateTime.fromJSDate(periode.tilOgMed || new Date(-100000))
                )
            ).toJSDate();
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

    medPosisjon(posisjon: number) {
        return new Tidslinje(
            this.perioder.map(periode => periode.medPosisjon(posisjon))
        )
    }
}