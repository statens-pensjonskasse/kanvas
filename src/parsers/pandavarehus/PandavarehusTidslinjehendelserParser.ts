import { DateTime, Interval } from "luxon"
import Periode from "../../domain/Periode"
import Tidslinje from "../../domain/Tidslinje"
import Tidslinjesamling from '../../domain/Tidslinjesamling'
import Pandavarehusparser from './PandavarehusParser'


interface Tidslinjehendelse {
    Aksjonsdato: Date,
    Egenskap: string,
    Forrige: string,
    Neste: string,
    Hendelsesnummer: string,
    Hendelsestype: string,
    PersonId: string,
    PoliseId: string,
    TidslinjeId: string,
    Tidslinjehendelsestype: string,
    Typeindikator: string
}

export default class PandavarehusTidslinjehendelserParser implements Pandavarehusparser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    løperTil(periode: Periode, aksjonsdato: Date) {
        return Interval.fromDateTimes(DateTime.fromJSDate(periode.fraOgMed), DateTime.fromJSDate(aksjonsdato)).length("days") <= 1
    }

    simulerHendelse(hendelse: Tidslinjehendelse, gjeldende: Tidslinjesamling): Tidslinjesamling {
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
                    periode.medSluttDato(DateTime.fromJSDate(aksjonsdato).minus({days: 1}).toJSDate())
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

                    if (this.løperTil(periode, aksjonsdato)) {
                        return [erstatning]
                    }

                    return [
                        periode.medSluttDato(DateTime.fromJSDate(aksjonsdato).minus({ days: 1 }).toJSDate()),
                        erstatning
                    ]
                }
            )
        }

        console.warn(`Ustøttet tidslinjehendelsestype ${hendelse.Tidslinjehendelsestype}`)
        return gjeldende
    }

    simuler(hendelser: Tidslinjehendelse[]): Tidslinjesamling[] {
        let samlinger: Tidslinjesamling[] = []
        let gjeldende = Tidslinjesamling.tom()

        for (let i = 0; i < hendelser.length; i++) {
            gjeldende = this.simulerHendelse(hendelser[i], gjeldende)
            samlinger.push(gjeldende)
        }

        return samlinger
    }

    parseOgSimuler(data: any[]): Tidslinjesamling[] {
        console.log(data[0])
        return this.simuler(
            data
                .map(
                    raw => ({
                        Aksjonsdato: this.oversettDato(raw['Aksjonsdato']).toJSDate(),
                        Egenskap: raw['Egenskap'],
                        Forrige: raw['Forrige verdi'],
                        Neste: raw['Neste verdi'],
                        Hendelsesnummer: raw['Hendelsesnummer'],
                        Hendelsestype: raw['Hendelsestype'],
                        PersonId: raw['PersonId'],
                        PoliseId: raw['PoliseId'],
                        TidslinjeId: raw['TidslinjeId'].replace("(", "").replace(")", ""),
                        Tidslinjehendelsestype: raw['Tidslinjehendelsestype'],
                        Typeindikator: raw['Typeindikator']
                    })
                )
                .filter(h => h.TidslinjeId !== "RESERVEFREMSKRIVINGER")
        )

    }

    parse(data: any[]): Tidslinje[] {
        const simulerteTilstander = this.parseOgSimuler(data)

        return simulerteTilstander[simulerteTilstander.length - 1]
            .tidslinjer
            .map(
                (tidslinje, i) => tidslinje.medPosisjon(i)
            )

    }


    private oversettTilOgMed(tilOgMed: string): Date | undefined {
        if (tilOgMed !== "9999-12-31") {
            return this.oversettDato(tilOgMed).toJSDate()
        }
    }

    erGyldigDato(dato: string) {
        return dato && (this.norskDato.test(dato) || DateTime.fromISO(dato).isValid)
    }

    oversettDato(dato: string): DateTime {
        return this.norskDato.test(dato) ? DateTime.fromFormat(dato, "d.M.yyyy") : DateTime.fromISO(dato);
    }
}