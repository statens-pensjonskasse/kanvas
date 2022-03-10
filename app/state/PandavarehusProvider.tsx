import { createContext, useContext, useEffect, useState } from "react";
import KategorisertHendelse from "../domain/KategorisertHendelse";
import Tidslinje from "../domain/Tidslinje";
import Tidslinjehendelsediffer from "../domain/Tidslinjehendelsediff";
import Tidslinjesamling from "../domain/Tidslinjesamling";
import { useSessionState } from "../util/useSessionState";
import { ColorContext } from "./ColorProvider";
import { TidslinjeContext } from "./TidslinjerProvider";

interface PandavarehusContextInterface {
    oppdaterMedNyeTidslinjer(tidslinjer: Tidslinje[]): void,
    oppdaterSimulerteSamlinger(nyeSamlinger: [KategorisertHendelse, Tidslinjesamling][]): void,
    oppdaterTilstand(nyTilstand: number): void,
    velgTidslinjeIder(nyeIder: string[]): void
    toggleTidslinjeId(id: string): void,
    setTable(newTable: string): void,
    setDiff(diff: Tidslinjehendelsediffer): void,
    setPoliseIder(poliseIder: number[]): void,
    poliseIder: number[],
    diff: Tidslinjehendelsediffer,
    tilstand: number,
    maxTilstand: number,
    table: string,
    parset: string,
    kategoriseringer(): KategorisertHendelse[],
    kategorisertHendelse: KategorisertHendelse,
    tidslinjeIder: string[],
    valgteTidslinjeIder: string[],
    sisteSimulerteTilstand(): Tidslinje[],
}

export const PandavarehusContext = createContext<PandavarehusContextInterface>(null)

export default function PandavarehusProvider({ children }) {
    const [tidslinjesamlinger, setTidslinjesamlinger] = useState<[KategorisertHendelse, Tidslinjesamling][]>([])
    const [poliseIder, setPoliseIder] = useState<number[]>([])
    const [diff, setDiff] = useState<Tidslinjehendelsediffer>(Tidslinjehendelsediffer.tom())
    const { setTidslinjer } = useContext(TidslinjeContext)

    const { setColors } = useContext(ColorContext)

    const [tilstand, setTilstand] = useState(0)
    const [maxTilstand, setMaxTilstand] = useState(0)
    const [table, setTable] = useSessionState("neste", "pandavarehus_table")

    const [parset, setParset] = useState<string>("")
    const [kategorisertHendelse, setKategorisertHendelse] = useState<KategorisertHendelse>()
    const [tidslinjeIder, setTidslinjeIder] = useState<string[]>([])
    const [valgteTidslinjeIder, setValgteTidslinjeIder] = useState([])

    const velgTidslinjeIder = (tidslinjeIder: string[]) => {
        setValgteTidslinjeIder(tidslinjeIder)
    }

    const toggleTidslinjeId = (tidslinjeId: string) => {
        if (valgteTidslinjeIder.includes(tidslinjeId)) {
            setValgteTidslinjeIder(valgteTidslinjeIder.filter(t => t !== tidslinjeId))
        }
        else {
            setValgteTidslinjeIder([
                ...valgteTidslinjeIder,
                tidslinjeId
            ])
        }
    }

    const sisteSimulerteTilstand = () => {
        if (tidslinjesamlinger.length) {
            return tidslinjesamlinger[maxTilstand][1].tidslinjer
        }
        return []
    }
    const kategoriseringer = () => {
        return tidslinjesamlinger.map(t => t[0])
    }

    const oppdaterMedNyeTidslinjer = (tidslinjer: Tidslinje[]) => {
        setTidslinjeIder((sisteSimulerteTilstand().length ? sisteSimulerteTilstand() : tidslinjer).map(t => t.label))
        setParset(
            tidslinjer.map(
                t => t.somCSV().join("\n")
            )
                .join("\n\n\n")
        )
        setTidslinjer(tidslinjer)
    }

    const oppdaterTilstand = (tilstand: number) => {
        const nyTilstand = Math.max(0, Math.min(tilstand, maxTilstand))
        setTilstand(nyTilstand);
        oppdaterMedNyeTidslinjer(tidslinjesamlinger[nyTilstand][1].tidslinjer)
    }

    const oppdaterSimulerteSamlinger = (samlinger: [KategorisertHendelse, Tidslinjesamling][]) => {
        const nyMaxTilstand = Math.max(0, samlinger.length - 1)
        setMaxTilstand(nyMaxTilstand)
        setTidslinjesamlinger(samlinger)
        if (samlinger.length) {
            oppdaterMedNyeTidslinjer(samlinger[Math.min(tilstand, nyMaxTilstand)][1].tidslinjer)
        }
        else {
            oppdaterMedNyeTidslinjer([])
        }
    }

    useEffect(() => {
        if (tidslinjesamlinger.length && tilstand < tidslinjesamlinger.length) {
            const [kategorisertHendelse, tidslinjesamling] = tidslinjesamlinger[tilstand]
            setKategorisertHendelse(kategorisertHendelse)
            setColors(new Map(
                kategorisertHendelse.hendelser
                    .map(
                        hendelse => [hendelse.TidslinjeId, 'red']
                    )
            ))
        }
    }, [tidslinjesamlinger, tilstand])

    const exported: PandavarehusContextInterface = {
        diff,
        setDiff,
        tilstand,
        maxTilstand,
        table,
        setTable,
        parset,
        kategoriseringer,
        kategorisertHendelse,
        tidslinjeIder,
        valgteTidslinjeIder,
        oppdaterMedNyeTidslinjer,
        oppdaterSimulerteSamlinger,
        oppdaterTilstand,
        velgTidslinjeIder,
        toggleTidslinjeId,
        setPoliseIder,
        poliseIder,
        sisteSimulerteTilstand
    }

    return (
        <PandavarehusContext.Provider value={exported}>
            {children}
        </PandavarehusContext.Provider>
    )
}