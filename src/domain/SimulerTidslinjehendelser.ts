import { DateTime, Interval } from 'luxon'
import KategorisertHendelse from '../domain/KategorisertHendelse'
import Periode from './Periode'
import Tidslinje from './Tidslinje'
import Tidslinjehendelse from './Tidslinjehendelse'
import Tidslinjesamling from './Tidslinjesamling'

export default class SimulerTidslinjehendelser {

    static simuler(hendelser: Tidslinjehendelse[]): [KategorisertHendelse, Tidslinjesamling][] {
        let samlinger: [KategorisertHendelse, Tidslinjesamling][] = []
        let gjeldendeHendelser: Tidslinjehendelse[] = []
        let gjeldende = Tidslinjesamling.tom()

        let hendelsesnummer = hendelser[0]?.Hendelsesnummer || 0

        for (let i = 0; i < hendelser.length; i++) {
            const hendelse = hendelser[i]
            if (hendelse.Hendelsesnummer !== hendelsesnummer) {
                const sisteGyldige = gjeldendeHendelser[gjeldendeHendelser.length - 1]
                const kategorisert = {
                    aksjonsdato: sisteGyldige.Aksjonsdato,
                    kategorisering: sisteGyldige.Hendelsestype,
                    hendelser: gjeldendeHendelser.sort((a, b) => (a.Egenskap > b.Egenskap)? 1 : -1)
                }
                samlinger.push([kategorisert, gjeldende])
                gjeldendeHendelser = []
                hendelsesnummer = hendelse.Hendelsesnummer
            }
            gjeldendeHendelser.push(hendelse)
            gjeldende = SimulerTidslinjehendelser.simulerHendelse(hendelse, gjeldende)
        }

        return samlinger;
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
                    periode.medSluttDato(DateTime.fromJSDate(aksjonsdato).minus({ days: 1 }).toJSDate())
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
                        periode.medSluttDato(DateTime.fromJSDate(aksjonsdato).toJSDate()),
                        erstatning
                    ]
                }
            )
        }

        console.warn(`Ustøttet tidslinjehendelsestype ${hendelse.Tidslinjehendelsestype}`)
        return gjeldende
    }

    private static løperTil(periode: Periode, aksjonsdato: Date) {
        return Interval.fromDateTimes(DateTime.fromJSDate(periode.fraOgMed), DateTime.fromJSDate(aksjonsdato)).length("days") <= 1
    }
}