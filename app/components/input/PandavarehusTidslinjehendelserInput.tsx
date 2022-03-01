import { HStack, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import SimulerTidslinjehendelser, { PoliseSimulering } from "../../domain/SimulerTidslinjehendelser";
import Tidslinjehendelse from "../../domain/Tidslinjehendelse";
import Tidslinjehendelsediffer from "../../domain/Tidslinjehendelsediff";
import PandavarehusTidslinjehendelserParser from '../../parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '../../state/PandavarehusProvider';
import { useStickyState } from "../../util/useStickyState";

interface FetchetData {
    parset: Map<number, Tidslinjehendelse[]>,
    simulert: Map<number, PoliseSimulering>
}

const tomFetch = (): FetchetData => ({
    parset: new Map(),
    simulert: new Map()
})

export default function PandavarehusInput() {
    const {
        person,
        table,
        parset,
        oppdaterSimulerteSamlinger,
        cache,
        setCache,
        setDiff,
        poliseId,
        velgPoliseId,
        setPoliseIder
    } = useContext(PandavarehusContext)

    const [tidslinjehendelseHost, setTidslinjehendelseHost] = useStickyState("http://localhost:3044", "pandavarehus_tidslinjehendelser_host")

    const toast = useToast()
    const input = useRef()

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    useEffect(() => {
        const fetchData = async (tidslinjetabell): Promise<FetchetData> => {
            if (!person) {
                return tomFetch()
            }
            const URL = `${tidslinjehendelseHost}/${tidslinjetabell}?PersonId=eq.${person}`
            let data: Response;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${tidslinjehendelseHost}`,
                    description: `${error.message}, kjører pandavarehus-kanvas-connector.sh?`,
                    position: "top-right",
                    status: "error"
                })
                return tomFetch()
            }
            if (data.ok) {
                const json = await data.json()
                const parset: Map<number, Tidslinjehendelse[]> = tidslinjeparser.parse(json)
                const simulert: Map<number, PoliseSimulering> = SimulerTidslinjehendelser.simuler(parset)

                if (!simulert.keys()) {
                    toast({
                        title: tidslinjehendelseHost,
                        description: `Fant ingen tidslinjehendelser for Person ${person.substring(0, 8)}`,
                        status: 'warning',
                        position: 'top-right'
                    })
                }

                return {
                    parset,
                    simulert
                }
            }
            else {
                toast({
                    title: `Feil ved henting fra ${tidslinjehendelseHost}`,
                    description: `${data.status}: ${data.statusText}. Husk å kjøre pandavarehus-kanvas-connector.sh på nytt om du har lastet inn nye data.`,
                    position: "top-right",
                    status: "error"
                })
            }
        }
        Promise.all([
            fetchData("forrige"),
            fetchData("neste")
        ])
            .then(([forrige, neste]) => {
                setCache({
                    ...cache,
                    tidslinjehendelser: {
                        forrige: forrige.simulert,
                        neste: neste.simulert
                    }
                })
                setDiff(Tidslinjehendelsediffer.utled(forrige.parset, neste.parset))
                setPoliseIder(Array.from(neste.parset.keys()))
            })
    }, [person, tidslinjehendelseHost])

    useEffect(() => {
        if (cache?.tidslinjehendelser) {
            oppdaterSimulerteSamlinger(cache.tidslinjehendelser[table].get(poliseId)?.simulering || [])
        }
    }, [cache?.tidslinjehendelser, table, poliseId])

    return (
        <VStack>
            <HStack>
                <Textarea
                    ref={input}
                    readOnly
                    resize={'both'}
                    type="text"
                    spellCheck="false"
                    placeholder={"Kjør pandavarehus-kanvas-connector.sh lokalt for å kunne hente tidslinjehendelser fra pandavarehus"}
                    value={parset}
                    minWidth={'2xl'}
                    minHeight={'20em'}
                    wrap='off'
                    overflow={'auto'}
                    fontFamily={'mono'}
                />
            </HStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter tidslinjehendelser ${table} fra pandavarehus, gitt at postgrest kjører på ${tidslinjehendelseHost}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}