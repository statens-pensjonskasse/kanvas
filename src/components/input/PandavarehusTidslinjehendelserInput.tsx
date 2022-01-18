import { HStack, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import KategorisertHendelse from "../../domain/KategorisertHendelse";
import SimulerTidslinjehendelser from "../../domain/SimulerTidslinjehendelser";
import Tidslinjehendelse from "../../domain/Tidslinjehendelse";
import Tidslinjehendelsediffer from "../../domain/Tidslinjehendelsediff";
import Tidslinjesamling from "../../domain/Tidslinjesamling";
import PandavarehusTidslinjehendelserParser from '../../parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '../../state/PandavarehusProvider';
import { useStickyState } from "../../util/useStickyState";

interface FetchetData {
    parset: Tidslinjehendelse[],
    simulert: [KategorisertHendelse, Tidslinjesamling][]
}

const tomFetch = (): FetchetData => ({
    parset: [],
    simulert: []
})

export default function PandavarehusInput() {
    const {
        person,
        table,
        parset,
        oppdaterSimulerteSamlinger,
        cache,
        setCache,
        setDiff
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
            let data;
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
                const parset = tidslinjeparser.parse(json)
                console.log(parset)
                const simulert = SimulerTidslinjehendelser.simuler(parset)
                console.log(simulert)

                if (!simulert.length) {
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
            })
    }, [person, tidslinjehendelseHost])

    useEffect(() => {
        if (cache?.tidslinjehendelser) {
            oppdaterSimulerteSamlinger(cache.tidslinjehendelser[table] || [])
        }
    }, [cache?.tidslinjehendelser, table])

    return (
        <VStack>
            <HStack>
                <Textarea
                    ref={input}
                    readOnly
                    resize={'both'}
                    type="text"
                    spellCheck="false"
                    placeholder={"Kjør pandavarehus-kanvas-connector.sh lokalt for å kunne hente poliser fra pandavarehus"}
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
                label={`Henter poliser ${table} fra pandavarehus, gitt at postgrest kjører på ${tidslinjehendelseHost}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}