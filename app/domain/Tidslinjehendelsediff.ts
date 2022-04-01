import { DiffType } from './DiffType'
import Tidslinjehendelse from './Tidslinjehendelse'

export class Tidslinjehendelsediff {
    readonly diffType: DiffType
    readonly beskrivelse: string

    constructor(diffType: DiffType, beskrivelse: string = "") {
        this.diffType = diffType
        this.beskrivelse = beskrivelse
    }
}


export default class Tidslinjehendelsediffer {
    readonly tidslinjehendelsediffer: Map<Tidslinjehendelse, Tidslinjehendelsediff> = new Map();

    private constructor(tidslinjehendelsediffer: Map<Tidslinjehendelse, Tidslinjehendelsediff>) {
        this.tidslinjehendelsediffer = tidslinjehendelsediffer
    }

    static tom() {
        return new Tidslinjehendelsediffer(new Map())
    }

    private static nøkkelFor(tidslinjehendelse: Tidslinjehendelse): string {
        return [
            tidslinjehendelse.PoliseId,
            tidslinjehendelse.Aksjonsdato.aksjonsdato,
            tidslinjehendelse.Tidslinjehendelsestype,
            tidslinjehendelse.TidslinjeId,
            tidslinjehendelse.Egenskap,
            tidslinjehendelse.Forrige,
            tidslinjehendelse.Neste
        ].join(';')
    }

    // endringer
    // bytte tidslinje
    // bytte hendelse

    private static finnEndringer(forrige: Tidslinjehendelse, neste: Tidslinjehendelse): Tidslinjehendelsediff | undefined {
        const beskrivelse = (
            () => {
                if (forrige.Hendelsestype != neste.Hendelsestype) {
                    return `Denne endringen av ${neste.Egenskap} var før i hendelsen ${forrige.Hendelsestype}, men er nå flyttet til ${neste.Hendelsestype}.`
                }
                if (forrige.TidslinjeId != neste.TidslinjeId) {
                    return `Denne endringen av ${neste.Egenskap} har blitt flyttet fra tidslinjen ${forrige.TidslinjeId} til ${neste.TidslinjeId}.`
                }
                return
            })()

        if (beskrivelse) {
            return new Tidslinjehendelsediff(
                DiffType.ENDRET,
                beskrivelse
            )
        }

    }


    static utled(forrige: Map<number, Tidslinjehendelse[]>, neste: Map<number, Tidslinjehendelse[]>): Tidslinjehendelsediffer {
        return this.utledPolise(
            Array.from(forrige.values()).flatMap(x => x),
            Array.from(neste.values()).flatMap(x => x)
        )
    }

    static utledPolise(forrige: Tidslinjehendelse[], neste: Tidslinjehendelse[]): Tidslinjehendelsediffer {
        // per aksjonsdato og rekkefølge
        // ny/endret/fjernet
        const [forrigePerNøkkel, nestePerNøkkel] = [forrige, neste].map(
            hendelser =>
                new Map(
                    hendelser
                        .map(
                            hendelse => [
                                Tidslinjehendelsediffer.nøkkelFor(hendelse),
                                hendelse
                            ]
                        )
                )
        )
        const forrigeNøkler = Array.from(forrigePerNøkkel.keys())
        const nesteNøkler = Array.from(nestePerNøkkel.keys())
        const forsvunnet: [Tidslinjehendelse, Tidslinjehendelsediff][] = forrigeNøkler
            .filter(nøkkel => !nesteNøkler.includes(nøkkel))
            .map(nøkkel => forrigePerNøkkel.get(nøkkel))
            .map(
                hendelse => [
                    hendelse,
                    new Tidslinjehendelsediff(DiffType.FJERNET, `Denne endringen av ${hendelse.Egenskap} er ikke lenger med i hendelsen ${hendelse.Hendelsestype}.`)
                ]
            )

        const nye: [Tidslinjehendelse, Tidslinjehendelsediff][] = nesteNøkler
            .filter(nøkkel => !forrigeNøkler.includes(nøkkel))
            .map(nøkkel => nestePerNøkkel.get(nøkkel))
            .map(
                hendelse => [
                    hendelse,
                    new Tidslinjehendelsediff(DiffType.NY, `Denne endringen av ${hendelse.Egenskap} var ikke med i hendelsen ${hendelse.Hendelsestype} før.`)
                ]
            )

        const felles: [Tidslinjehendelse, Tidslinjehendelse][] = nesteNøkler
            .filter(nøkkel => forrigeNøkler.includes(nøkkel))
            .map(
                nøkkel => [
                    forrigePerNøkkel.get(nøkkel),
                    nestePerNøkkel.get(nøkkel)
                ]
            );

        const endringer: [Tidslinjehendelse, Tidslinjehendelsediff][] = felles
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

        return new Tidslinjehendelsediffer(
            new Map(
                [
                    ...forsvunnet,
                    ...nye,
                    ...endringer
                ]
            )
        )
    }

    diffForHendelse(hendelse: Tidslinjehendelse): Tidslinjehendelsediff | undefined {
        return this.tidslinjehendelsediffer.get(hendelse)
    }
}