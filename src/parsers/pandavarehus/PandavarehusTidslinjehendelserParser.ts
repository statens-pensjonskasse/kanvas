import { DateTime } from "luxon"
import SimulerTidslinjehendelser from '../../domain/SimulerTidslinjehendelser'
import Tidslinje from "../../domain/Tidslinje"
import Tidslinjehendelse from "../../domain/Tidslinjehendelse"
import Tidslinjesamling from '../../domain/Tidslinjesamling'
import Pandavarehusparser from './PandavarehusParser'


export default class PandavarehusTidslinjehendelserParser implements Pandavarehusparser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    parseOgSimuler(data: any[]): [Tidslinjehendelse, Tidslinjesamling][] {
        return SimulerTidslinjehendelser.simuler(
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
                        TidslinjeId: `${raw['TidslinjeId'].replace("(", "").replace(")", "")}`,
                        Tidslinjehendelsestype: raw['Tidslinjehendelsestype'],
                        Typeindikator: raw['Typeindikator']
                    })
                )
        )

    }

    parse(data: any[]): Tidslinje[] {
        const simulerteTilstander = this.parseOgSimuler(data)

        return simulerteTilstander[simulerteTilstander.length - 1][1].tidslinjer
    }

    oversettDato(dato: string): DateTime {
        return this.norskDato.test(dato) ? DateTime.fromFormat(dato, "d.M.yyyy") : DateTime.fromISO(dato);
    }
}