import { DateTime } from "luxon"
import Tidslinjehendelse from "../../domain/Tidslinjehendelse"


export default class PandavarehusTidslinjehendelserParser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    parse(data: any[]): Tidslinjehendelse[] {
        return data
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
            .filter(r => r.Typeindikator !== "RESERVEFREMSKRIVINGER")
            .sort((a, b) => a.Hendelsesnummer - b.Hendelsesnummer)
    }

    oversettDato(dato: string): DateTime {
        return this.norskDato.test(dato) ? DateTime.fromFormat(dato, "d.M.yyyy") : DateTime.fromISO(dato);
    }
}