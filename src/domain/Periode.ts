import { DateTime } from "luxon";

export default class Periode {
    readonly fraOgMed: Date;
    readonly tilOgMed?: Date;
    readonly label: string;

    posisjon: number = -1;
    egenskaper: string[] = [];

    constructor(label: string, fraOgMed: Date, tilOgMed?: Date) {
        this.label = label || "Tidslinje"
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed;
        this.valider()
    }

    valider() {
        if (this.tilOgMed && DateTime.fromJSDate(this.fraOgMed) > DateTime.fromJSDate(this.tilOgMed)) {
            console.error("Fra og med kan ikke være etter til og med dato")
        }
    }

    setEgenskaper(egenskaper: string[]) {
        this.egenskaper = egenskaper
        return this
    }

    setPosisjon(posisjon: number) {
        this.posisjon = posisjon
        return this
    }
}