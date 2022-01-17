import { HStack, Input, Radio, RadioGroup, Stack, Text, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import PandavarehusPoliserParser from '../../parsers/pandavarehus/PandavarehusPoliserParser';
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import { TidslinjeContext } from "../../state/TidslinjerProvider";

export default function PandavarehusInput() {
    const toast = useToast()
    const input = useRef()

    const {
        poliserHost,
        person,
        table,
        parset,
        oppdaterMedNyeTidslinjer
    } = useContext(PandavarehusContext)

    const tidslinjeparser = new PandavarehusPoliserParser();

    useEffect(() => {
        const fetchData = async () => {
            if (!person) {
                return
            }
            const URL = `${poliserHost}/${table}?PersonId=eq.${person}`
            console.log(`Bruker pandavarehus ${URL}`)
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
                oppdaterMedNyeTidslinjer([])
                return
            }
            if (data.ok) {
                const json = await data.json()
                const tidslinjer = tidslinjeparser.parse(json)
                oppdaterMedNyeTidslinjer(tidslinjer)
                if (tidslinjer.length) {
                    toast({
                        title: poliserHost,
                        description: `Hentet ${tidslinjer.length} poliser fra ${table}`,
                        status: 'success',
                        position: 'top-right'
                    })
                }
                else {
                    toast({
                        title: poliserHost,
                        description: `Fant ingen poliser for PersonId ${person}`,
                        status: 'warning',
                        position: 'top-right'
                    })
                }
            }
        }
        oppdaterMedNyeTidslinjer([])
        fetchData()

    }, [person, poliserHost, table])

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