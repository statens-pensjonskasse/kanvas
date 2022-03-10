import KategorisertHendelse from '../domain/KategorisertHendelse'
import { Aksjonsdato } from './Aksjonsdato'
import Periode from './Periode'
import Tidslinje from './Tidslinje'
import Tidslinjehendelse from './Tidslinjehendelse'
import Tidslinjesamling from './Tidslinjesamling'

export interface PoliseSimulering {
    simulering: [KategorisertHendelse, Tidslinjesamling][]
}

export default class SimulerTidslinjehendelser {
    static simuler(hendelser: Map<number, Tidslinjehendelse[]>): Map<number, PoliseSimulering> {
        return new Map(
            Array.from(hendelser.keys())
                .map(
                    key => [
                        key,
                        SimulerTidslinjehendelser.simulerPolise(hendelser.get(key))
                    ]
                )
        )
    }

    static simulerPolise(hendelser: Tidslinjehendelse[]): PoliseSimulering {
        let samlinger: [KategorisertHendelse, Tidslinjesamling][] = []
        let gjeldendeHendelser: Tidslinjehendelse[] = []
        let gjeldende = Tidslinjesamling.tom()

        let hendelsesnummer = hendelser[0]?.Hendelsesnummer || 0
        const sisteHendelsesnummer = hendelser.length - 1

        for (let i = 0; i < hendelser.length; i++) {
            const hendelse = hendelser[i]
            if ((hendelse.Hendelsesnummer !== hendelsesnummer || (i === sisteHendelsesnummer))) {
                const sisteGyldige = gjeldendeHendelser[gjeldendeHendelser.length - 1]
                const kategorisert = {
                    aksjonsdato: sisteGyldige.Aksjonsdato,
                    kategorisering: sisteGyldige.Hendelsestype,
                    hendelser: gjeldendeHendelser.sort((a, b) => (a.Egenskap > b.Egenskap) ? 1 : -1)
                }
                samlinger.push([kategorisert, gjeldende])
                gjeldendeHendelser = []
                hendelsesnummer = hendelse.Hendelsesnummer
            }
            gjeldendeHendelser.push(hendelse)
            gjeldende = SimulerTidslinjehendelser.simulerHendelse(hendelse, gjeldende)
        }
        return {
            simulering: samlinger
        };
    }

    private static simulerHendelse(hendelse: Tidslinjehendelse, gjeldende: Tidslinjesamling): Tidslinjesamling {
        if (hendelse.Tidslinjehendelsestype === "NY") {
            return gjeldende.leggTil(
                new Tidslinje(
                    [
                        new Periode(
                            hendelse.TidslinjeId,
                            hendelse.Aksjonsdato
                        )
                    ]
                )
            )
        }
        else if (hendelse.Tidslinjehendelsestype === "AVSLUTT") {
            return gjeldende.erstattSiste(
                hendelse.Aksjonsdato,
                hendelse.TidslinjeId,
                (aksjonsdato, periode) => [
                    periode.medSluttDato(aksjonsdato.plussDager(1))
                ]
            )
        }
        else if (hendelse.Tidslinjehendelsestype === "ENDRE") {
            return gjeldende.erstattSiste(
                hendelse.Aksjonsdato,
                hendelse.TidslinjeId,
                (aksjonsdato, periode) => {
                    const erstatning = periode
                        .somLøpende()
                        .medStartDato(aksjonsdato)
                        .erstattEgenskap(hendelse.Egenskap, hendelse.Neste)

                    if (SimulerTidslinjehendelser.løperTil(periode, aksjonsdato)) {
                        return [erstatning]
                    }

                    return [
                        periode.medSluttDato(aksjonsdato),
                        erstatning
                    ]
                }
            )
        }

        console.warn(`Ustøttet tidslinjehendelsestype ${hendelse.Tidslinjehendelsestype}`)
        return gjeldende
    }

    private static løperTil(periode: Periode, aksjonsdato: Aksjonsdato) {
        return periode.fraOgMed.avstand(aksjonsdato) <= 1
    }
}