import { Container, Flex, HStack, Input, Text, Tooltip, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import PandavarehusPoliserParser from '../../parsers/pandavarehus/PandavarehusPoliserParser';
import { TidslinjeContext } from "../../state/TidslinjerProvider";
import { useStickyState } from "../../util/useStickyState";

export default function PandavarehusInput() {
    const [person, setPerson] = useStickyState("", "pandavarehus_person")
    const { setTidslinjer } = useContext(TidslinjeContext)
    const [host, setHost] = useStickyState("http://localhost:3033", "pandavarehus_host")
    const toast = useToast()

    const tidslinjeparser = new PandavarehusPoliserParser();

    useEffect(() => {
        const fetchData = async () => {
            if (person.length < 8) {
                return
            }
            const URL = `${host}/neste?PersonId=eq.${person}`
            console.log(`Bruker pandavarehus ${URL}`)
            let data;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${host}`,
                    description: error.message,
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
            }
        }
        fetchData()

    }, [person, host])

    return (
        <VStack>
            <VStack >
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
                    />
                </HStack>
                <HStack>
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
                </HStack>
            </VStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter poliser fra pandavarehus, gitt at postgrest kjører på ${host}`}
            >
                ?
            </Tooltip>
        </VStack >
    );
}