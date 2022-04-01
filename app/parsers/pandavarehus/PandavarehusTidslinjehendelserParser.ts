import { Aksjonsdato } from "~/domain/Aksjonsdato";
import Tidslinjehendelse from "../../domain/Tidslinjehendelse";

const normaliserTekst = (tekst: string | undefined) => {
    if (!tekst) return tekst

    const separator = " "
    const nyTekst = tekst
        .replace(/_/g, separator)
        .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase()
        .replace(/ae/g, 'æ')
        .replace(/oe/g, 'ø')
        .replace(/aa/g, 'å')
        .replace(/\bafp\b/g, "AFP");

    return nyTekst.charAt(0).toUpperCase() + nyTekst.slice(1)
}


export default class PandavarehusTidslinjehendelserParser {
    readonly norskDato = new RegExp(/^(?:[0-9]+\.){2}[0-9]{4}$/)

    parsePerPolise(data: any[]): Map<number, Tidslinjehendelse[]> {
        return this.parseAlle(data)
            .reduce(
                (acc: Map<number, Tidslinjehendelse[]>, current: Tidslinjehendelse) => {
                    return acc.set(
                        current.PoliseId,
                        [
                            ...acc.get(current.PoliseId) || [],
                            current
                        ]
                    )
                }, new Map()
            );
    }

    parseAlle(data: any[]): Tidslinjehendelse[] {
        return data
            .map(
                raw => ({
                    Aksjonsdato: this.oversettDato(raw['Aksjonsdato']),
                    Egenskap: normaliserTekst(raw['Egenskap']),
                    Forrige: normaliserTekst(raw['Forrige verdi']),
                    Neste: normaliserTekst(raw['Neste verdi']),
                    Hendelsesnummer: raw['Hendelsesnummer'],
                    Hendelsestype: normaliserTekst(raw['Hendelsestype']),
                    PersonId: raw['PersonId'],
                    PoliseId: raw['PoliseId'],
                    TidslinjeId: normaliserTekst(`${raw['TidslinjeId'].replace("(", "").replace(")", "")}`),
                    Tidslinjehendelsestype: raw['Tidslinjehendelsestype'],
                    Typeindikator: normaliserTekst(raw['Typeindikator'])
                })
            )
            .sort((a, b) => a.Hendelsesnummer - b.Hendelsesnummer)
    }

    oversettDato(dato: string): Aksjonsdato {
        return new Aksjonsdato(dato)
    }
}