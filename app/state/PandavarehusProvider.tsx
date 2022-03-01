import { createContext, useContext, useEffect, useState } from "react";
import KategorisertHendelse from "../domain/KategorisertHendelse";
import { PoliseSimulering } from "../domain/SimulerTidslinjehendelser";
import Tidslinje from "../domain/Tidslinje";
import Tidslinjehendelsediffer from "../domain/Tidslinjehendelsediff";
import Tidslinjesamling from "../domain/Tidslinjesamling";
import { useSessionState } from "../util/useSessionState";
import { useStickyState } from "../util/useStickyState";
import { ColorContext } from "./ColorProvider";
import { TidslinjeContext } from "./TidslinjerProvider";

interface PandavarehusContextInterface {
    nullstill(): void,
    oppdaterMedNyeTidslinjer(tidslinjer: Tidslinje[]): void,
    oppdaterSimulerteSamlinger(nyeSamlinger: [KategorisertHendelse, Tidslinjesamling][]): void,
    oppdaterTilstand(nyTilstand: number): void,
    velgTidslinjeIder(nyeIder: string[]): void
    toggleTidslinjeId(id: string): void,
    setPerson(nyPerson: string): void,
    setTable(newTable: string): void,
    setCache(nyCache: Cache): void,
    setDiff(diff: Tidslinjehendelsediffer): void,
    velgPoliseId(poliseId: number): void,
    setPoliseIder(poliseIder: number[]): void,
    poliseIder: number[],
    poliseId: number,
    diff: Tidslinjehendelsediffer,
    cache: Cache,
    tilstand: number,
    maxTilstand: number,
    person: string,
    table: string,
    parset: string,
    kategoriseringer(): KategorisertHendelse[],
    kategorisertHendelse: KategorisertHendelse,
    tidslinjeIder: string[],
    valgteTidslinjeIder: string[],
    sisteSimulerteTilstand(): Tidslinje[],
}

export const PandavarehusContext = createContext<PandavarehusContextInterface>(null)

interface PoliseCache {
    forrige: Tidslinje[],
    neste: Tidslinje[]
}
interface TidslinjehendelseCache {
    forrige: Map<number, PoliseSimulering>
    neste: Map<number, PoliseSimulering>
}

interface Cache {
    poliser: PoliseCache,
    tidslinjehendelser: TidslinjehendelseCache
}

export default function PandavarehusProvider({ children }) {
    const [cache, setCache] = useState<Cache>()

    const [tidslinjesamlinger, setTidslinjesamlinger] = useState<[KategorisertHendelse, Tidslinjesamling][]>([])
    const [poliseIder, setPoliseIder] = useState<number[]>([])
    const [poliseId, setPoliseId] = useState(1)
    const [diff, setDiff] = useState<Tidslinjehendelsediffer>(Tidslinjehendelsediffer.tom())
    const { setTidslinjer } = useContext(TidslinjeContext)

    const { setColors } = useContext(ColorContext)

    const [tilstand, setTilstand] = useState(0)
    const [maxTilstand, setMaxTilstand] = useState(0)
    const [person, setPerson] = useStickyState("", "pandavarehus_person")
    const [table, setTable] = useSessionState("neste", "pandavarehus_table")

    const [parset, setParset] = useState<string>("")
    const [kategorisertHendelse, setKategorisertHendelse] = useState<KategorisertHendelse>()
    const [tidslinjeIder, setTidslinjeIder] = useState<string[]>([])
    const [valgteTidslinjeIder, setValgteTidslinjeIder] = useState([])

    const nullstill = () => {
        setParset("")
        oppdaterSimulerteSamlinger([])
        setValgteTidslinjeIder([])
        setKategorisertHendelse(null)
    }

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

    const oppdaterMedNyeTidslinjer = (tidslinjer) => {
        setTidslinjeIder((sisteSimulerteTilstand().length ? sisteSimulerteTilstand() : tidslinjer).map(t => t.label))
        setParset(
            tidslinjer.map(
                t => t.somCSV().join("\n")
            )
                .join("\n\n\n")
        )
        setTidslinjer(tidslinjer)
    }

    const oppdaterTilstand = tilstand => {
        const nyTilstand = Math.max(0, Math.min(tilstand, maxTilstand))
        setTilstand(nyTilstand);
        oppdaterMedNyeTidslinjer(tidslinjesamlinger[nyTilstand][1].tidslinjer)
    }

    const velgPoliseId = poliseId => {
        setPoliseId(poliseId)
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
        cache,
        setCache,
        nullstill,
        tilstand,
        maxTilstand,
        person,
        setPerson,
        table,
        setTable,
        parset,
        poliseId,
        kategoriseringer,
        kategorisertHendelse,
        tidslinjeIder,
        valgteTidslinjeIder,
        oppdaterMedNyeTidslinjer,
        oppdaterSimulerteSamlinger,
        oppdaterTilstand,
        velgTidslinjeIder,
        toggleTidslinjeId,
        velgPoliseId,
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