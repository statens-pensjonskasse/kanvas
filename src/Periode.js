export default class Periode {
    constructor(fraOgMed, tilOgMed, label) {
        this.label = label || "Tidslinje"
        this.fraOgMed = fraOgMed
        this.tilOgMed = tilOgMed?.add(1, "day");
        this.valider()
    }

    valider() {
        if (this.tilOgMed && this.fraOgMed.isAfter(this.tilOgMed)) {
            console.error("Fra og med kan ikke være etter til og med dato")
        }
    }

    egenskaper(egenskaper) {
        this.egenskaper = egenskaper
        return this
    }

    posisjon(posisjon) {
        this.posisjon = posisjon
        return this
    }
}