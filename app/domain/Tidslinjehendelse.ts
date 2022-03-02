import { Aksjonsdato } from "./Aksjonsdato";

export default interface Tidslinjehendelse {
    Aksjonsdato: Aksjonsdato,
    Egenskap: string,
    Forrige: string,
    Neste: string,
    Hendelsesnummer: number,
    Hendelsestype: string,
    PersonId: string,
    PoliseId: number,
    TidslinjeId: string,
    Tidslinjehendelsestype: string,
    Typeindikator: string
}