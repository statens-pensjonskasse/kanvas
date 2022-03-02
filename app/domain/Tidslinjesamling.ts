import { Aksjonsdato } from "./Aksjonsdato";
import Periode from "./Periode";
import Tidslinje from "./Tidslinje";

export interface PeriodeErstatter {
    (aksjonsdato: Aksjonsdato, periode: Periode): Periode[]
}

export default class Tidslinjesamling {
    readonly tidslinjer: Tidslinje[]

    private constructor(tidslinjer: Tidslinje[]) {
        this.tidslinjer = tidslinjer.map((t, i) => t.medPosisjon(i))
    }

    static tom() {
        return new Tidslinjesamling([])
    }

    leggTil(tidslinje: Tidslinje) {
        return new Tidslinjesamling([
            ...this.tidslinjer,
            tidslinje
        ])
    }

    løperTil(periode: Aksjonsdato, aksjonsdato: Aksjonsdato) {
        return periode.avstand(aksjonsdato) <= 1
    }

    erstattSiste(aksjonsdato: Aksjonsdato, tidslinjeId: string, erstatter: PeriodeErstatter): Tidslinjesamling {
        const tidslinjeIndeks = this.tidslinjer.findIndex(t => t.label === tidslinjeId)
        if (tidslinjeIndeks > -1) {
            return new Tidslinjesamling([
                ...this.tidslinjer.slice(0, tidslinjeIndeks),
                this.tidslinjer[tidslinjeIndeks].erstattSiste(aksjonsdato, erstatter),
                ...this.tidslinjer.slice(tidslinjeIndeks + 1)
            ])
        }
        else {
            const minsteStartdato: Aksjonsdato = this.tidslinjer.map(t => t.fraOgMed).sort((a, b) => a.getTime() - b.getTime())[0] || Aksjonsdato.TIDENES_MORGEN
            console.debug(`Fant ikke tidslinje ${tidslinjeId} i tidslinjesamling, oppretter ny med startdato ${minsteStartdato}.`)

            return this.leggTil(
                new Tidslinje([
                    ...(this.løperTil(minsteStartdato, aksjonsdato) ? [] : [
                        new Periode(
                            tidslinjeId,
                            minsteStartdato,
                            aksjonsdato
                        )
                    ]),
                    ...erstatter(
                        aksjonsdato,
                        new Periode(
                            tidslinjeId,
                            aksjonsdato.plussDager(1)
                        )
                    )
                ])
            )
        }
    }
}