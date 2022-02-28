export default class Egenskap {
    public readonly type: string;
    public readonly verdi: string;

    constructor(type: string, verdi: string) {
        this.type = type;
        this.verdi = verdi;
    }

    somPar(): string[] {
        return [this.type, this.verdi]
    }

    static parse(tekst: string) {
        const egenskapArray: string[] = tekst.split(":").map(s => s.trim());

        switch (egenskapArray.length) {
            case 0: return new Egenskap("", "")
            case 1: return new Egenskap("", egenskapArray[0])
            case 2: return new Egenskap(egenskapArray[0], egenskapArray[1])
            default: return new Egenskap("UGYLDIG EGENSKAP", tekst)
        }
    }

}