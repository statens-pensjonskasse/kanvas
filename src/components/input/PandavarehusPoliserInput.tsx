import { HStack, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import PandavarehusPoliserParser from '../../parsers/pandavarehus/PandavarehusPoliserParser';
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import { useStickyState } from "../../util/useStickyState";

export default function PandavarehusInput() {
    const toast = useToast()
    const input = useRef()

    const [poliserHost, setPoliserHost] = useStickyState("http://localhost:3033", "pandavarehus_poliser_host")

    const {
        person,
        table,
        parset,
        oppdaterMedNyeTidslinjer,
        cache,
        setCache
    } = useContext(PandavarehusContext)

    const tidslinjeparser = new PandavarehusPoliserParser();

    useEffect(() => {
        const fetchData = async (tidslinjetabell) => {
            if (!person) {
                return
            }
            const URL = `${poliserHost}/${tidslinjetabell}?PersonId=eq.${person}`
            let data;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${poliserHost}`,
                    description: `${error.message}, kjører pandavarehus-kanvas-connector.sh?`,
                    position: "top-right",
                    status: "error"
                })
                return []
            }
            if (data.ok) {
                const json = await data.json()
                const tidslinjer = tidslinjeparser.parse(json)
                if (!tidslinjer.length) {
                    toast({
                        title: poliserHost,
                        description: `Fant ingen poliser for Person ${person.substring(0, 8)}`,
                        status: 'warning',
                        position: 'top-right'
                    })
                }
                return tidslinjer
            }
            else {
                toast({
                    title: `Feil ved henting fra ${poliserHost}`,
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
                    poliser: {
                        forrige,
                        neste
                    }
                })
            })

    }, [person, poliserHost])

    useEffect(() => {
        if (cache?.poliser) {
            oppdaterMedNyeTidslinjer(cache.poliser[table] || [])
        }
    }, [cache?.poliser, table])

    return (
        <VStack>
            <VStack >
                <HStack>
                    <Textarea
                        readOnly
                        ref={input}
                        resize={'both'}
                        type="text"
                        spellCheck="false"
                        placeholder={"Kjør kanvas-connector lokalt for å kunne hente poliser fra pandavarehus"}
                        value={parset}
                        minWidth={'2xl'}
                        minHeight={'20em'}
                        wrap='off'
                        overflow={'auto'}
                        fontFamily={'mono'}
                    />
                </HStack>
            </VStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter poliser ${table} fra pandavarehus, gitt at postgrest kjører på ${poliserHost}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}