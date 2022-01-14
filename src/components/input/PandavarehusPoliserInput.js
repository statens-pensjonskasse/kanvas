import { HStack, Input, Radio, RadioGroup, Stack, Text, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import PandavarehusPoliserParser from '../../parsers/pandavarehus/PandavarehusPoliserParser';
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import { TidslinjeContext } from "../../state/TidslinjerProvider";

export default function PandavarehusInput() {
    const { tidslinjer } = useContext(TidslinjeContext)
    const { setTidslinjer } = useContext(TidslinjeContext)

    const toast = useToast()
    const input = useRef()

    const {
        poliserHost,
        person,
        setPerson,
        table,
        setTable,
        parset,
        setParset
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
                setTidslinjer([])
                return
            }
            if (data.ok) {
                const json = await data.json()
                const tidslinjer = tidslinjeparser.parse(json)
                setTidslinjer(tidslinjer)
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
        setTidslinjer([])
        fetchData()

    }, [person, poliserHost, table])

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
                        readOnly
                        ref={input}
                        resize={'both'}
                        type="text"
                        spellCheck="false"
                        placeholder={"Kjør kanvas-connector lokalt for å kunne hente poliser fra pandavarehus"}
                        defaultValue={parset}
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