import Egenskap from "./Egenskap";
import Tidslinje from "./Tidslinje";

export default class GjeldendeEgenskaper {
    readonly egenskaper: Map<string, Egenskap[]>

    constructor(egenskaper: Map<string, Egenskap[]>) {
        this.egenskaper = egenskaper
    }

    static tom() {
        return new GjeldendeEgenskaper(
            new Map()
        )

    }

    static utled(tidslinjer: Tidslinje[]): GjeldendeEgenskaper {
        return new GjeldendeEgenskaper(
            new Map(
                tidslinjer
                    .filter(tidslinje => tidslinje.erLøpende())
                    .map(tidslinje => tidslinje.siste())
                    .filter(løpendePeriode => !!løpendePeriode.egenskaper.length)
                    .map(
                        ({ label, egenskaper }) => [
                            label,
                            egenskaper
                                .sort()
                                .map(Egenskap.parse)
                        ]
                    )

            )
        )
    }
}