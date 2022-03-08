import { Aksjonsdato } from "./Aksjonsdato"
import Periode from "./Periode"

describe('test av tidslinjeperioder', () => {
    test('skal oppdage om en periode løper til en annen', () => {
        const periode1 = new Periode('test', new Aksjonsdato('2010.01.01'), new Aksjonsdato('2019.12.31'))
        const periode2 = new Periode('test', new Aksjonsdato('2020.01.01'))

        expect(periode1.løperTil(periode2)).toBe(true)
    })
    test('skal oppdage om en periode ikke løper til en annen', () => {
        const periode1 = new Periode('test', new Aksjonsdato('2010.01.01'), new Aksjonsdato('2018.12.31'))
        const periode2 = new Periode('test', new Aksjonsdato('2020.01.01'))

        expect(periode1.løperTil(periode2)).toBe(false)
    })
})