import { createContext, useContext, useEffect, useState } from "react";
import GjeldendeEgenskapdiffer from "~/domain/GjeldendeEgenskapdiff";
import GjeldendeEgenskaper from "~/domain/GjeldendeEgenskaper";
import { SimulertTilstand } from "~/domain/SimulerTidslinjehendelser";
import { unikeVerdier } from "~/util/utils";
import KategorisertHendelse from "../domain/KategorisertHendelse";
import Tidslinje from "../domain/Tidslinje";
import Tidslinjehendelsediffer from "../domain/Tidslinjehendelsediff";
import { useSessionState } from "../util/useSessionState";
import { FilterContext } from "./FilterProvider";
import { TidslinjeContext } from "./TidslinjerProvider";

interface PandavarehusContextInterface {
    oppdaterMedNyeTidslinjer(tidslinjer: Tidslinje[]): void,
    oppdaterSimulerteSamlinger(nyeSamlinger: SimulertTilstand[]): void,
    oppdaterTilstand(nyTilstand: number): void,
    velgTidslinjeIder(nyeIder: string[]): void
    toggleTidslinjeId(id: string): void,
    setTable(newTable: string): void,
    setDiff(diff: Tidslinjehendelsediffer): void,
    setGjeldendeEgenskaperdiffer(diff: GjeldendeEgenskapdiffer): void,
    gjeldendeEgenskaperdiffer: GjeldendeEgenskapdiffer,
    setPoliseIder(poliseIder: number[]): void,
    poliseIder: number[],
    diff: Tidslinjehendelsediffer,
    tilstand: number,
    maxTilstand: number,
    table: string,
    parset: string,
    gjeldendeEgenskaper: GjeldendeEgenskaper,
    kategoriseringer(): KategorisertHendelse[],
    kategorisertHendelse: KategorisertHendelse,
    tidslinjeIder: string[],
    valgteTidslinjeIder: string[],
    sisteSimulerteTilstand(): Tidslinje[],
}

export const PandavarehusContext = createContext<PandavarehusContextInterface>(null)

export default function PandavarehusProvider({ children }) {
    const [tidslinjesamlinger, setTidslinjesamlinger] = useState<SimulertTilstand[]>([])
    const [poliseIder, setPoliseIder] = useState<number[]>([])
    const [diff, setDiff] = useState<Tidslinjehendelsediffer>(Tidslinjehendelsediffer.tom())
    const [gjeldendeEgenskaper, setGjeldendeEgenskaper] = useState<GjeldendeEgenskaper>(GjeldendeEgenskaper.tom())
    const [gjeldendeEgenskaperdiffer, setGjeldendeEgenskaperdiffer] = useState<GjeldendeEgenskapdiffer>(GjeldendeEgenskapdiffer.tom())
    const { setTidslinjer } = useContext(TidslinjeContext)

    const { setFilters } = useContext(FilterContext)

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

    const sisteSimulerteTidslinjesamling = (): Tidslinje[] => {
        if (tidslinjesamlinger.length) {
            return tidslinjesamlinger[maxTilstand].tidslinjesamling.tidslinjer
        }
        return []
    }

    const kategoriseringer = () => {
        return tidslinjesamlinger.map(t => t.kategorisertHendelse)
    }

    const oppdaterMedNyeTidslinjer = (tidslinjer: Tidslinje[]) => {
        setTidslinjeIder((sisteSimulerteTidslinjesamling().length ? sisteSimulerteTidslinjesamling() : tidslinjer).map(t => t.label))
        setParset(
            tidslinjer.map(
                t => t.somCSV().join("\n")
            )
                .join("\n\n\n")
        )
        setTidslinjer(tidslinjer)
    }

    const simulerteTidslinjer = (simulertTilstand: SimulertTilstand) => {
        const erKonvertering = simulertTilstand.kategorisertHendelse.kategorisering.toLowerCase() === 'konvertering'

        const påvirket = unikeVerdier(
            simulertTilstand.kategorisertHendelse.hendelser
                .filter(h => !erKonvertering)
                .map(h => h.TidslinjeId)
        )
        return simulertTilstand
            .tidslinjesamling
            .tidslinjer
            .filter(tidslinje => påvirket.includes(tidslinje.label))
            .map((tidslinje, i) => tidslinje.medPosisjon(i))
    }

    const oppdaterTilstand = (tilstand: number) => {
        const nyTilstand = Math.max(0, Math.min(tilstand, maxTilstand))
        setTilstand(nyTilstand);
        const nySimulertTilstand = tidslinjesamlinger[nyTilstand]
        oppdaterMedNyeTidslinjer(simulerteTidslinjer(nySimulertTilstand))
        setGjeldendeEgenskaper(nySimulertTilstand?.gjeldendeEgenskaper || GjeldendeEgenskaper.tom())
    }

    const oppdaterSimulerteSamlinger = (samlinger: SimulertTilstand[]) => {
        const nyMaxTilstand = Math.max(0, samlinger.length - 1)
        setMaxTilstand(nyMaxTilstand)
        setTidslinjesamlinger(samlinger)
        if (samlinger.length) {
            const ønsketTilstand = Math.min(tilstand, nyMaxTilstand)
            const nySimulertTilstand = samlinger[ønsketTilstand]
            oppdaterMedNyeTidslinjer(simulerteTidslinjer(nySimulertTilstand))
            setGjeldendeEgenskaper(nySimulertTilstand?.gjeldendeEgenskaper || GjeldendeEgenskaper.tom())
            setTilstand(ønsketTilstand)
        }
        else {
            oppdaterMedNyeTidslinjer([])
        }
    }

    useEffect(() => {
        if (tidslinjesamlinger.length && tilstand < tidslinjesamlinger.length) {
            const { kategorisertHendelse, tidslinjesamling } = tidslinjesamlinger[tilstand]
            setKategorisertHendelse(kategorisertHendelse)
            const kunEndredeEgenskaper = new Map(
                kategorisertHendelse.hendelser
                    .map(
                        hendelse => [hendelse.TidslinjeId, new RegExp(hendelse.Egenskap)]
                    )
            )
            setFilters(kunEndredeEgenskaper)
        }
    }, [tidslinjesamlinger, tilstand])

    const exported: PandavarehusContextInterface = {
        gjeldendeEgenskaper,
        gjeldendeEgenskaperdiffer,
        setGjeldendeEgenskaperdiffer,
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
        sisteSimulerteTilstand: sisteSimulerteTidslinjesamling
    }

    return (
        <PandavarehusContext.Provider value={exported}>
            {children}
        </PandavarehusContext.Provider>
    )
}