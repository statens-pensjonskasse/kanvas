import { createContext, useState } from "react";
import { useSessionState } from "../util/useSessionState";
import { useStickyState } from "../util/useStickyState";

export const PandavarehusContext = createContext()

export default function PandavarehusProvider({ children }) {
    const [ tilstand, setTilstand ] = useSessionState(0, "pandavarehus_tilstand")
    const [ maxTilstand, setMaxTilstand ] = useSessionState(0, "pandavarehus_max_tilstand")
    const [tidslinjehendelseHost, setTidslinjehendelseHost] = useStickyState("http://localhost:3044", "pandavarehus_tidslinjehendelser_host")
    const [poliserHost, setPoliserHost] = useStickyState("http://localhost:3033", "pandavarehus_poliser_host")
    const [person, setPerson] = useStickyState("", "pandavarehus_person")
    const [table, setTable] = useSessionState("neste", "pandavarehus_table")
    const [parset, setParset] = useState("")
    const [tidslinjehendelse, setTidslinjehendelse] = useState()

    const exported = {
        tilstand,
        setTilstand,
        maxTilstand,
        setMaxTilstand,
        tidslinjehendelseHost,
        setTidslinjehendelseHost,
        poliserHost,
        setPoliserHost,
        person,
        setPerson,
        table,
        setTable,
        parset,
        setParset,
        tidslinjehendelse,
        setTidslinjehendelse
    }

    return (
        <PandavarehusContext.Provider value={exported}>
            {children}
        </PandavarehusContext.Provider>
    )
}