import { DateTime, Interval } from 'luxon'
import Periode from './Periode'
import Tidslinjesamling from './Tidslinjesamling'
import Tidslinje from './Tidslinje'
import Tidslinjehendelse from './Tidslinjehendelse'

export default class SimulerTidslinjehendelser {

    static simuler(hendelser: Tidslinjehendelse[]): [Tidslinjehendelse, Tidslinjesamling][] {
        let samlinger: [Tidslinjehendelse, Tidslinjesamling][] = []
        let gjeldende = Tidslinjesamling.tom()

        for (let i = 0; i < hendelser.length; i++) {
            const hendelse = hendelser[i]
            gjeldende = SimulerTidslinjehendelser.simulerHendelse(hendelse, gjeldende)
            samlinger.push([hendelse, gjeldende])
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

                    if (hendelse.Typeindikator === 'FAKTISK_ALDER') {
                        console.log("Erstatning", erstatning)
                        console.log("Periode", periode)
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