import { unikeVerdier } from "~/util/utils";
import { Aksjonsdato } from "./Aksjonsdato";
import Periode from "./Periode";

export default class Tidslinje {
    readonly label: String;
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

    somCucumber(): String[] {
        const header = this.label
        const periodenesFraOgmed = this.perioder.map(p => p.fraOgMed?.aksjonsdato || "")
        const periodenesTilOgMed = this.perioder.map(p => p.tilOgMed?.plussDager(-1).aksjonsdato || "")
        const egenskaper = unikeVerdier(
            this.perioder
                .flatMap(
                    periode => periode.egenskaper.filter(e => e.includes(":")).map(e => e.split(":")[0])
                )
        )

        const antallPerioder = this.perioder.length
        const antallEgenskaper = egenskaper.length

        const tomRad = Array(antallPerioder + 1).fill("")
        const headerRad = [
            "Tidslinje",
            header,
            ...Array(antallPerioder - 1).fill("")
        ]

        const periodeRad = [
            "Tidslinjeperiode",
            ...Array(antallPerioder).fill("").map(
                (_, i) => `#${i + 1}`,
            )
        ]

        const fraOgMedRad = [
            "Fra og med-dato",
            ...periodenesFraOgmed
        ]
        const tilOgMedRad = [
            "Til og med-dato",
            ...periodenesTilOgMed
        ]

        let egenskapRader = []

        for (let i = 0; i < antallEgenskaper; i++) { // en rad per egenskap
            const egenskap = egenskaper[i]
            let rad = [egenskap.replace(/^_/g, "")]

            for (let j = 0; j < antallPerioder; j++) { // en kolonne per periode
                const periode = this.perioder[j]
                const verdi = periode.egenskaper.find(e => e.startsWith(egenskap))?.split(":")[1] || ""
                rad.push(verdi.trim())
            }
            egenskapRader.push(rad)
        }

        let resultat: string[][] = [
            headerRad,
            tomRad,
            periodeRad,
            fraOgMedRad,
            tilOgMedRad,
            ...egenskapRader
        ]

        const kolonnebredde = Math.max(...resultat.flatMap(rad => rad).map(cell => cell.length)) + 1

        const skillerad = Array(antallPerioder + 1).fill("-".repeat(kolonnebredde - 1))

        resultat = [
            skillerad,
            ...resultat,
            skillerad
        ]

        const parsedResultat = resultat
            .map(
                (rad: string[]) => "| " + rad.map(cell => cell.padEnd(kolonnebredde)).join("| ") + "|"
            )
        return parsedResultat
    }
}