import { DiffType } from './DiffType'
import Egenskap from './Egenskap'
import KategorisertHendelse from './KategorisertHendelse'
import { PoliseSimulering } from './SimulerTidslinjehendelser'

export class GjeldendeEgenskapdiff {
    readonly diffType: DiffType
    readonly beskrivelse: string

    constructor(diffType: DiffType, beskrivelse: string = "") {
        this.diffType = diffType
        this.beskrivelse = beskrivelse
    }
}


export default class GjeldendeEgenskapdiffer {
    readonly gjeldendeEgenskapdiffer: Map<Egenskap, GjeldendeEgenskapdiff> = new Map(); // per tidslinjeId

    private constructor(gjeldendeEgenskapdiffer: Map<Egenskap, GjeldendeEgenskapdiff>) {
        this.gjeldendeEgenskapdiffer = gjeldendeEgenskapdiffer
    }

    static tom() {
        return new GjeldendeEgenskapdiffer(new Map())
    }

    private static nøkkelFor(tidslinje: string, kategorisertHendelse: KategorisertHendelse, egenskap: Egenskap): string {
        return [
            tidslinje,
            kategorisertHendelse.aksjonsdato.aksjonsdato,
            kategorisertHendelse.kategorisering,
            egenskap.type
        ].join(';')
    }

    private static finnEndringer(forrige: Egenskap, neste: Egenskap): GjeldendeEgenskapdiff | undefined {
        const beskrivelse = (
            () => {
                if (forrige.verdi !== neste.verdi) {
                    return `${forrige.type} var før ${forrige.verdi}, men er nå ${neste.verdi}.`
                }
                return
            })()

        if (beskrivelse) {
            return new GjeldendeEgenskapdiff(
                DiffType.ENDRET,
                beskrivelse
            )
        }
    }

    static utled(forrige: PoliseSimulering, neste: PoliseSimulering): GjeldendeEgenskapdiffer {
        const [forrigePerNøkkel, nestePerNøkkel]: Map<string, Egenskap>[] = [forrige, neste].map(
            polisesimulering =>
                new Map(
                    polisesimulering.simulering
                        .flatMap(
                            simulering => [...simulering.gjeldendeEgenskaper.egenskaper.keys()]
                                .flatMap(
                                    tidslinje => simulering.gjeldendeEgenskaper.egenskaper.get(tidslinje)
                                        .map(
                                            egenskap => [
                                                this.nøkkelFor(
                                                    tidslinje.split(",")
                                                        .filter(e => !e.toLowerCase().includes("kopiert"))
                                                        .filter(e => !e.toLowerCase().includes("arvet"))
                                                        .join(","),
                                                    simulering.kategorisertHendelse,
                                                    egenskap
                                                ),
                                                egenskap
                                            ]
                                        )
                                )
                        )
                )
        )

        const forrigeNøkler = Array.from(forrigePerNøkkel.keys())
        const nesteNøkler = Array.from(nestePerNøkkel.keys())

        const forsvunnet: [Egenskap, GjeldendeEgenskapdiff][] = forrigeNøkler
            .filter(nøkkel => !nesteNøkler.includes(nøkkel))
            .map(nøkkel => forrigePerNøkkel.get(nøkkel))
            .map(
                egenskap => [
                    egenskap,
                    new GjeldendeEgenskapdiff(DiffType.FJERNET, `Har ikke lenger ${egenskap.type}: ${egenskap.verdi}.`)]
            )

        const nye: [Egenskap, GjeldendeEgenskapdiff][] = nesteNøkler
            .filter(nøkkel => !forrigeNøkler.includes(nøkkel))
            .map(nøkkel => nestePerNøkkel.get(nøkkel))
            .map(
                egenskap => [
                    egenskap,
                    new GjeldendeEgenskapdiff(DiffType.NY, `Har nå fått ${egenskap.type}: ${egenskap.verdi}.`)
                ])

        const endret: [Egenskap, Egenskap][] = nesteNøkler
            .filter(nøkkel => forrigeNøkler.includes(nøkkel))
            .map(
                nøkkel => [
                    forrigePerNøkkel.get(nøkkel),
                    nestePerNøkkel.get(nøkkel)
                ]
            );

        const endringer: [Egenskap, GjeldendeEgenskapdiff][] = endret
            .filter(([forrige, neste]) => forrige.verdi != neste.verdi)
            .flatMap(
                ([forrige, neste]) => {
                    const resultat = this.finnEndringer(forrige, neste)
                    if (resultat) {
                        return [
                            [forrige, resultat],
                            [neste, resultat]
                        ]
                    }
                    return []
                })

        return new GjeldendeEgenskapdiffer(
            new Map(
                [
                    ...forsvunnet,
                    ...nye,
                    ...endringer
                ]
            )
        )
    }

    diffForEgenskap(egenskap: Egenskap): GjeldendeEgenskapdiff | undefined {
        return this.gjeldendeEgenskapdiffer.get(egenskap)
    }
}