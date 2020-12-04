import Periode from "./Periode"
import moment from "moment"

const minsteGyldigeStartDato = moment("1814-05-17")

export default class Periodeparser {
    constructor({
        delimiter,
        fraOgMedIndex,
        tilOgMedIndex,
        identifikatorIndex
    }) {
        this.delimiter = delimiter
        this.fraOgMedIndex = fraOgMedIndex
        this.tilOgMedIndex = tilOgMedIndex
        this.identifikatorIndex = identifikatorIndex
    }

    parse(rawData) {
        const rader = rawData.split(/\r?\n/)
            .map(rad => rad.trim())
            .map(rad => rad.split(this.delimiter))

        // posisjoner blir satt etter rekkefølgen identifikatorer er definert
        const posisjoner =
            rader.map(rad => rad[this.identifikatorIndex])
                .filter(identifikator => !!identifikator)
                .reduce(
                    (acc, current) => acc.includes(current) ? acc : [current, ...acc],
                    []
                )

        return rader
            .filter(rad => this.erGyldigRad(rad))
            .map(
                rad => this.oversettRad(rad, posisjoner.indexOf(rad[this.identifikatorIndex]) + 1)
            )
    }

    erGyldigRad(rad) {
        const fraOgMed = moment(rad[this.fraOgMedIndex])

        const harInnhold = rad.length > 1
        const harFraOgMed = fraOgMed.isValid() && rad[this.fraOgMedIndex]?.length >= 4
        const harFornuftigDato = fraOgMed.isAfter(minsteGyldigeStartDato)
        return harInnhold && harFraOgMed && harFornuftigDato
    }

    oversettRad(rad, posisjon) {
        const fraOgMed = rad[this.fraOgMedIndex]
        const tilOgMed = rad[this.tilOgMedIndex]?.trim() || undefined
        const label = rad[this.identifikatorIndex]

        return new Periode(
            moment(fraOgMed),
            tilOgMed ? moment(tilOgMed) : undefined,
            label
        )
            .posisjon(posisjon)
            .egenskaper({
                data: rad.slice(this.tilOgMedIndex + 1)
            })
    }
}