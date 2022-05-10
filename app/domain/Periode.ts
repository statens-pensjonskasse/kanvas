import { Aksjonsdato } from "./Aksjonsdato";

export default class Periode {
    readonly fraOgMed: Aksjonsdato;
    readonly tilOgMed?: Aksjonsdato;
    readonly label: string;

    posisjon: number = -1;
    egenskaper: string[] = [];

    constructor(label: string, fraOgMed: Aksjonsdato, tilOgMed?: Aksjonsdato) {
        this.label = label || "Tidslinje"
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed
    }

    medEgenskaper(egenskaper: string[]) {
        this.egenskaper = egenskaper
        return this
    }

    medPosisjon(posisjon: number) {
        this.posisjon = posisjon
        return this
    }

    medSluttDato(nySluttdato: Aksjonsdato): Periode {
        return new Periode(
            this.label,
            this.fraOgMed,
            nySluttdato
        )
            .medEgenskaper(this.egenskaper)
            .medPosisjon(this.posisjon);
    }

    medStartDato(nyStartdato: Aksjonsdato): Periode {
        return new Periode(
            this.label,
            nyStartdato,
            this.tilOgMed
        )
            .medEgenskaper(this.egenskaper)
            .medPosisjon(this.posisjon);
    }

    erstattEgenskap(egenskap: string, verdi: string): Periode {
        return new Periode(
            this.label,
            this.fraOgMed,
            this.tilOgMed,
        )
            .medEgenskaper([
                ...this.egenskaper.filter(e => e.split(":")[0].trim() !== egenskap),
                `${egenskap}: ${verdi?.split('\\n')[0] || ""}`
            ])
    }

    somLøpende(): Periode {
        return new Periode(
            this.label,
            this.fraOgMed
        )
            .medEgenskaper(this.egenskaper)
            .medPosisjon(this.posisjon);
    }

    løperTil(neste: Periode) {
        return this.tilOgMed?.avstand(neste.fraOgMed) <= 1 || false
    }
}