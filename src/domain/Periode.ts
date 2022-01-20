import { DateTime, Interval } from "luxon";

export default class Periode {
    readonly fraOgMed: Date;
    readonly tilOgMed?: Date;
    readonly label: string;

    posisjon: number = -1;
    egenskaper: string[] = [];

    constructor(label: string, fraOgMed: Date, tilOgMed?: Date) {
        this.label = label || "Tidslinje"
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed
        this.valider()
    }

    valider() {
        if (this.tilOgMed && DateTime.fromJSDate(this.fraOgMed) > DateTime.fromJSDate(this.tilOgMed)) {
            console.error("Fra og med kan ikke være etter til og med dato", this)
        }
    }

    medEgenskaper(egenskaper: string[]) {
        this.egenskaper = egenskaper
        return this
    }

    medPosisjon(posisjon: number) {
        this.posisjon = posisjon
        return this
    }

    medSluttDato(nySluttdato: Date): Periode {
        return new Periode(
            this.label,
            this.fraOgMed,
            nySluttdato
        )
        .medEgenskaper( this.egenskaper )
        .medPosisjon( this.posisjon );
    }

    medStartDato(nyStartdato: Date): Periode {
        return new Periode(
            this.label,
            nyStartdato,
            this.tilOgMed
        )
        .medEgenskaper( this.egenskaper )
        .medPosisjon( this.posisjon );
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

    kombinerMed(annen: Periode): Periode[] {
        if (!this.løperTil(annen)) {
            console.warn("Perioder må kombineres i kronologisk rekkefølge, forsøkte å kombinere", this, annen)
            return [this, annen]
        }
        const den = annen.egenskaper.sort().join("_")
        const denne = this.egenskaper.sort().join("_")
        if (den === denne) {
            if (annen.tilOgMed) {
                return [this.medSluttDato(annen.tilOgMed)]
            }
            return [this.somLøpende()]

        }
        return [this, annen];
    }

    løperTil(neste: Periode) {
        return this.tilOgMed && Interval.fromDateTimes(DateTime.fromJSDate(this.tilOgMed), DateTime.fromJSDate(neste.fraOgMed)).length("days") <= 1
    }
}