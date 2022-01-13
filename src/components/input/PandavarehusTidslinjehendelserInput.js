import { HStack, Input, Radio, RadioGroup, Stack, Text, Textarea, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import PandavarehusTidslinjehendelserParser from '../../parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { TidslinjeContext } from "../../state/TidslinjerProvider";
import { useStickyState } from "../../util/useStickyState";

export default function PandavarehusInput() {
    const { tidslinjer } = useContext(TidslinjeContext)
    const [person, setPerson] = useStickyState("", "pandavarehus_person")
    const { setTidslinjer } = useContext(TidslinjeContext)

    const [host, setHost] = useStickyState("http://localhost:3044", "pandavarehus_tidslinjehendelser_host")
    const [table, setTable] = useStickyState("neste", "pandavarehus_table")

    const [parset, setParset] = useState()

    const toast = useToast()
    const input = useRef()

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    useEffect(() => {
        const fetchData = async () => {
            if (!person) {
                return
            }
            const URL = `${host}/${table}?PersonId=eq.${person}`
            console.log(`Bruker pandavarehus ${URL}`)
            let data;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${host}`,
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
                        title: host,
                        description: `Hentet ${tidslinjer.length} tidslinjer fra ${table}`,
                        status: 'success',
                        position: 'top-right'
                    })
                }
                else {
                    toast({
                        title: host,
                        description: `Fant ingen tidslinjer for PersonId ${person}`,
                        status: 'warning',
                        position: 'top-right'
                    })
                }
            }
        }
        setTidslinjer([])
        fetchData()

    }, [person, host, table])

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
                {/* <HStack>
                    <Text>Host</Text>
                    <Input
                        defaultValue={host}
                        placeholder={"Host med port, feks http://localhost:3033"}
                        textAlign={'center'}
                        onChange={(event) => {
                            event.preventDefault()
                            setHost(event.target.value)
                        }}
                        variant={'filled'}
                    />
                </HStack> */}
                <HStack>
                    <Textarea
                        ref={input}
                        variant={'filled'}
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
                label={`Henter poliser ${table} fra pandavarehus, gitt at postgrest kjører på ${host}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}