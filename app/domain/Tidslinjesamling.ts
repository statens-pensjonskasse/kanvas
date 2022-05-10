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
}