import KategorisertHendelse from '../domain/KategorisertHendelse'
import { Aksjonsdato } from './Aksjonsdato'
import GjeldendeEgenskaper from './GjeldendeEgenskaper'
import Periode from './Periode'
import Tidslinje from './Tidslinje'
import Tidslinjehendelse from './Tidslinjehendelse'
import Tidslinjesamling from './Tidslinjesamling'

export interface SimulertTilstand {
    kategorisertHendelse: KategorisertHendelse,
    tidslinjesamling: Tidslinjesamling,
    gjeldendeEgenskaper: GjeldendeEgenskaper
}

export interface PoliseSimulering {
    simulering: SimulertTilstand[]
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
        let simulering: SimulertTilstand[] = []
        let gjeldendeHendelser: Tidslinjehendelse[] = []
        let gjeldende = Tidslinjesamling.tom()

        let hendelsesnummer = hendelser[0]?.Hendelsesnummer || 0
        const sisteHendelsesIndeks = hendelser.length - 1

        for (let i = 0; i < hendelser.length; i++) {
            const hendelse = hendelser[i]
            if (hendelse.Hendelsesnummer !== hendelsesnummer) {
                const simulertTilstand = SimulerTidslinjehendelser.utledSimulertTilstand(gjeldendeHendelser, gjeldende)
                simulering.push(simulertTilstand)
                gjeldendeHendelser = []
                hendelsesnummer = hendelse.Hendelsesnummer
            }
            gjeldendeHendelser.push(hendelse)
            gjeldende = SimulerTidslinjehendelser.simulerHendelse(hendelse, gjeldende)

            if (i === sisteHendelsesIndeks) {
                const simulertTilstand = SimulerTidslinjehendelser.utledSimulertTilstand(gjeldendeHendelser, gjeldende)
                simulering.push(simulertTilstand)
            }
        }
        return {
            simulering
        };
    }

    private static utledSimulertTilstand(gjeldendeHendelser: Tidslinjehendelse[], gjeldende: Tidslinjesamling) {
        const sisteGyldige = gjeldendeHendelser[gjeldendeHendelser.length - 1]
        const kategorisertHendelse = {
            aksjonsdato: sisteGyldige.Aksjonsdato,
            kategorisering: sisteGyldige.Hendelsestype,
            hendelser: gjeldendeHendelser
                .sort((a, b) => (a.Aksjonsdato.aksjonsdato > b.Aksjonsdato.aksjonsdato) ? 1 : -1)
        }
        const simulertTilstand: SimulertTilstand = {
            kategorisertHendelse,
            tidslinjesamling: gjeldende,
            gjeldendeEgenskaper: GjeldendeEgenskaper.utled(gjeldende.tidslinjer)
        }
        return simulertTilstand
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
                    periode.medSluttDato(aksjonsdato)
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
                        periode.medSluttDato(aksjonsdato).erstattEgenskap(hendelse.Egenskap, hendelse.Forrige),
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