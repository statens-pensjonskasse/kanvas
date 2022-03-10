import { Aksjonsdato } from "~/domain/Aksjonsdato";
import Tidslinjehendelse from "../../domain/Tidslinjehendelse";


export default class PandavarehusTidslinjehendelserParser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    parsePerPolise(data: any[]): Map<number, Tidslinjehendelse[]> {
        return this.parseAlle(data)
            .reduce(
                (acc: Map<number, Tidslinjehendelse[]>, current: Tidslinjehendelse) => {
                    return acc.set(current.PoliseId, [...acc.get(current.PoliseId) || [], current])
                }, new Map()
            );
    }

    parseAlle(data: any[]): Tidslinjehendelse[] {
        return data
            .map(
                raw => ({
                    Aksjonsdato: this.oversettDato(raw['Aksjonsdato']),
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

    oversettDato(dato: string): Aksjonsdato {
        return new Aksjonsdato(dato)
    }
}