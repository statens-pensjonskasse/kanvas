import { Aksjonsdato } from "./Aksjonsdato"
import Tidslinjehendelse from "./Tidslinjehendelse"
import Tidslinjehendelsediffer, { DiffType } from "./Tidslinjehendelsediff"

describe('Test av tidslinjehendelsediff', () => {
    test('Skal markere hendelser som endret når de flyttes rundt', () => {
        const hendelse1 = {
            ...enHendelse(),
            Hendelsestype: "Pensjonering"
        }
        const hendelse2 = {
            ...enHendelse(),
            Hendelsestype: "Pensjonsendring"
        }

        const forrige: Map<number, Tidslinjehendelse[]> = new Map([
            [1, [hendelse1]]
        ])
        const neste: Map<number, Tidslinjehendelse[]> = new Map([
            [1, [hendelse2]]
        ])

        const diff = Tidslinjehendelsediffer.utled(forrige, neste)
        expect(diff.tidslinjehendelsediffer.get(hendelse1).diffType).toBe(DiffType.ENDRET)
        expect(diff.tidslinjehendelsediffer.get(hendelse2).diffType).toBe(DiffType.ENDRET)
    })

    test('Skal markere hendelser som nye når de oppstår', () => {
        const hendelsen = {
            ...enHendelse(),
            Hendelsestype: "Pensjonering"
        }

        const forrige: Map<number, Tidslinjehendelse[]> = new Map([
            [1, []]
        ])
        const neste: Map<number, Tidslinjehendelse[]> = new Map([
            [1, [hendelsen]]
        ])

        const diff = Tidslinjehendelsediffer.utled(forrige, neste)
        expect(diff.tidslinjehendelsediffer.get(hendelsen).diffType).toBe(DiffType.NY)
    })

    test('Skal markere hendelser som fjernet når de forsvinner', () => {
        const hendelsen = {
            ...enHendelse(),
            Hendelsestype: "Pensjonsendring"
        }

        const forrige: Map<number, Tidslinjehendelse[]> = new Map([
            [1, [hendelsen]]
        ])
        const neste: Map<number, Tidslinjehendelse[]> = new Map([
            [1, []]
        ])

        const diff = Tidslinjehendelsediffer.utled(forrige, neste)
        expect(diff.tidslinjehendelsediffer.get(hendelsen).diffType).toBe(DiffType.FJERNET)
    })
})

function enHendelse(): Tidslinjehendelse {
    return {
        Aksjonsdato: new Aksjonsdato('2000-01-01'),
        Egenskap: "Polisestatus",
        Forrige: "AKTIV",
        Neste: "ALDERSPENSJON",
        Hendelsesnummer: 1,
        Hendelsestype: "Pensjonering",
        PersonId: "1950000012345",
        PoliseId: 1,
        TidslinjeId: "POLISE",
        Tidslinjehendelsestype: "ENDRE",
        Typeindikator: "POLISE"
    }
}