import { Aksjonsdato } from "./Aksjonsdato";
import Periode from "./Periode";

export default class Tidslinje {
    readonly label: string;
    readonly perioder: Periode[];
    readonly datoer: Aksjonsdato[];
    readonly fraOgMed: Aksjonsdato;
    readonly tilOgMed?: Aksjonsdato;
    readonly posisjon: number;

    constructor(perioder: Periode[]) {
        this.label = perioder[0]?.label || "Tidslinje"
        this.posisjon = Math.max(...perioder.map(p => p.posisjon), -1)
        this.perioder = this.justerSammenhengendePerioder(perioder)
        this.datoer = this.perioder
            .flatMap(periode => [periode.fraOgMed, periode.tilOgMed])
            .flatMap(x => x)
            .filter(dato => !!dato)

        this.fraOgMed = this.utledStartdato()
        this.tilOgMed = this.utledSluttdato()
    }

    justerSammenhengendePerioder(perioder: Periode[]): Periode[] {
        const kombinertePerioder = perioder
            .sort((a, b) => b.fraOgMed.getTime() - a.fraOgMed.getTime())
            .reduce(
                (acc: Periode[], current: Periode) => acc.length === 0
                    ? [current]
                    : [...acc, this.kombinerSammenhengende(acc[acc.length - 1], current)]
                , []
            )

        const sistePeriode = kombinertePerioder[0]
        const sluttdato = sistePeriode.tilOgMed

        const justertePerioder = sluttdato ?
            [
                sistePeriode.medSluttDato(sluttdato),
                ...kombinertePerioder.slice(1)
            ] :
            kombinertePerioder

        return justertePerioder.sort((a, b) => a.fraOgMed.getTime() - b.fraOgMed.getTime())
    }

    private kombinerSammenhengende(neste: Periode, current: Periode): Periode {
        if (!current.tilOgMed) {
            return current.medSluttDato(neste.fraOgMed);
        }
        return current;
    }

    private utledStartdato(): Aksjonsdato {
        return this.perioder[0].fraOgMed
    }

    private utledSluttdato(): Aksjonsdato | undefined {
        return this.perioder[this.perioder.length - 1].tilOgMed
    }

    med(periode: Periode) {
        return new Tidslinje(
            [
                ...this.perioder,
                periode
            ]

        )
    }

    erLøpende() {
        return !this.siste().tilOgMed
    }

    siste() {
        return this.perioder[this.perioder.length - 1]
    }

    medPosisjon(posisjon: number) {
        return new Tidslinje(
            this.perioder.map(periode => periode.medPosisjon(posisjon))
        )
    }

    somCSV(): String[] {
        return this.perioder
            .sort((a: Periode, b: Periode) => a.fraOgMed.getTime() - b.fraOgMed.getTime())
            .map(
                periode => (
                    [
                        periode.label,
                        periode.fraOgMed.aksjonsdato,
                        periode.tilOgMed?.aksjonsdato || "",
                        ...periode.egenskaper
                    ]
                        .join(";")
                )
            )

    }
}