import { createContext, useContext, useEffect, useState } from "react";
import { useSessionState } from "../util/useSessionState";
import { useStickyState } from "../util/useStickyState";
import { ColorContext } from "./ColorProvider";
import { TidslinjeContext } from "./TidslinjerProvider";

export const PandavarehusContext = createContext()

export default function PandavarehusProvider({ children }) {
    const [tidslinjesamlinger, setTidslinjesamlinger] = useState([])
    const { setTidslinjer } = useContext(TidslinjeContext)
    const { setColors } = useContext(ColorContext)

    const [tilstand, setTilstand] = useSessionState(0, "pandavarehus_tilstand")
    const [maxTilstand, setMaxTilstand] = useSessionState(0, "pandavarehus_max_tilstand")
    const [tidslinjehendelseHost, setTidslinjehendelseHost] = useStickyState("http://localhost:3044", "pandavarehus_tidslinjehendelser_host")
    const [poliserHost, setPoliserHost] = useStickyState("http://localhost:3033", "pandavarehus_poliser_host")
    const [person, setPerson] = useStickyState("", "pandavarehus_person")
    const [table, setTable] = useSessionState("neste", "pandavarehus_table")

    const [parset, setParset] = useState("")
    const [kategorisertHendelse, setKategorisertHendelse] = useState()
    const [tidslinjeIder, setTidslinjeIder] = useState([])
    const [valgteTidslinjeIder, setValgteTidslinjeIder] = useState([])

    const oppdaterMedNyeTidslinjer = (tidslinjer) => {
        setTidslinjeIder(tidslinjer.map(t => t.label))
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
    }

    const oppdaterSimulerteSamlinger = samlinger => {
        const nyMaxTilstand = Math.max(0, samlinger.length - 1)
        setMaxTilstand(nyMaxTilstand)
        setTidslinjesamlinger(samlinger)
        oppdaterMedNyeTidslinjer(samlinger[nyMaxTilstand][1].tidslinjer)
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

    const exported = {
        tilstand,
        maxTilstand,
        tidslinjehendelseHost,
        setTidslinjehendelseHost,
        poliserHost,
        setPoliserHost,
        person,
        setPerson,
        table,
        setTable,
        parset,
        kategorisertHendelse,
        tidslinjeIder,
        valgteTidslinjeIder,
        setValgteTidslinjeIder,
        oppdaterMedNyeTidslinjer,
        oppdaterSimulerteSamlinger,
        oppdaterTilstand
    }

    return (
        <PandavarehusContext.Provider value={exported}>
            {children}
        </PandavarehusContext.Provider>
    )
}