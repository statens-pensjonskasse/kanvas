import { HStack, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import PandavarehusTidslinjehendelserParser from '../../parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '../../state/PandavarehusProvider';

export default function PandavarehusInput() {
    const {
        tidslinjehendelseHost,
        person,
        table,
        parset,
        oppdaterSimulerteSamlinger,
    } = useContext(PandavarehusContext)

    const toast = useToast()
    const input = useRef()

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    useEffect(() => {
        const fetchData = async () => {
            if (!person) {
                return
            }
            const URL = `${tidslinjehendelseHost}/${table}?PersonId=eq.${person}`
            console.log(`Bruker pandavarehus ${URL}`)
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
                oppdaterSimulerteSamlinger([])
                return
            }
            if (data.ok) {
                const json = await data.json()
                const samlinger = tidslinjeparser.parseOgSimuler(json)
                oppdaterSimulerteSamlinger(samlinger)
                if (samlinger.length) {
                    toast({
                        title: tidslinjehendelseHost,
                        description: `Simulerte ${samlinger.length - 1} tilstander fra ${table}`,
                        status: 'success',
                        position: 'top-right'
                    })
                }
                else {
                    toast({
                        title: tidslinjehendelseHost,
                        description: `Fant ingen tidslinjer for PersonId ${person}`,
                        status: 'warning',
                        position: 'top-right'
                    })
                }
            }
        }
        fetchData()
    }, [person, tidslinjehendelseHost, table])

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