import { HStack, Input, Radio, RadioGroup, Stack, Text, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import PandavarehusTidslinjehendelserParser from '../../parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '../../state/PandavarehusProvider';
import { TidslinjeContext } from "../../state/TidslinjerProvider";

export default function PandavarehusInput() {
    const { tidslinjer, setTidslinjer } = useContext(TidslinjeContext)

    const [tidslinjesamlinger, setTidslinjesamlinger] = useState([])

    const {
        tilstand,
        setTilstand,
        setMaxTilstand,
        tidslinjehendelseHost,
        person,
        setPerson,
        table,
        setTable,
        parset,
        setParset,
        setTidslinjehendelse
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
                setTidslinjer([])
                return
            }
            if (data.ok) {
                const json = await data.json()
                const samlinger = tidslinjeparser.parseOgSimuler(json)
                const nyMaxTilstand = Math.max(0, samlinger.length - 1)
                setMaxTilstand(nyMaxTilstand)
                setTidslinjesamlinger(samlinger)
                setTilstand(Math.min(tilstand, nyMaxTilstand))
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

    useEffect(() => {
        if (tidslinjesamlinger.length) {
            const [tidslinjehendelse, tidslinjesamling] = tidslinjesamlinger[tilstand]
            setTidslinjer(tidslinjesamling.tidslinjer)
            setTidslinjehendelse(tidslinjehendelse)
        }
    }, [tidslinjesamlinger, tilstand])

    useEffect(() => {
        setParset(
            tidslinjer.map(
                t => t.somCSV().join("\n")
            )
                .join("\n\n") + "\n"
        )
    }, [tidslinjer])

    return (
        <VStack>
            <VStack >
                <RadioGroup onChange={setTable} value={table}>
                    <Stack direction={'row'}>
                        <Radio value='forrige'>Forrige</Radio>
                        <Radio value='neste'>Neste</Radio>
                    </Stack>
                </RadioGroup>
                <HStack>
                    <Text>PersonId</Text>
                    <Input
                        defaultValue={person || ""}
                        placeholder="PersonId"
                        onChange={event => {
                            event.preventDefault()
                            setPerson(event.target.value)
                        }}
                        textAlign={'center'}
                        variant={'filled'}
                        autoFocus
                        blur
                    />
                </HStack>
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
            </VStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter poliser ${table} fra pandavarehus, gitt at postgrest kjører på ${tidslinjehendelseHost}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}