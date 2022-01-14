import { CheckIcon, WarningIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Box, Button, Container, Heading, HStack, Text, Tooltip, UnorderedList, useToast, VStack } from "@chakra-ui/react";
import { DateTime } from "luxon";
import React, { useContext, useEffect, useState } from "react";
import Egenskap from "../domain/Egenskap";
import { TidslinjeContext } from "../state/TidslinjerProvider";
import { useStickyState } from "../util/useStickyState";

const API_SERVER = process.env.REACT_APP_API_SERVER || "http://panda-hendelseskategorisering-webservice.lyn.spk.no"

export default function TidslinjehendelseView() {
    const [kategoriseringer, setKategoriseringer] = useState([])
    const [warning, setWarning] = useState("")
    const [pandaVersjon, setPandaVersjon] = useState([])
    const [isEnabled, setIsEnabled] = useStickyState(false, "kategorisering_enabled")

    const { tidslinjer } = useContext(TidslinjeContext);
    const toast = useToast();

    useEffect(() => {
        if (isEnabled) {
            postData(
                `${API_SERVER}/api/fra-tidslinjer/`,
                formaterteTidslinjer(tidslinjer)
            )
                .then(response => {
                    if (response.ok) {
                        setWarning("")
                        return response.json()
                    }
                    else {
                        return response.text()
                            .then(text => {
                                return Promise.reject(text)
                            })
                    }
                })
                .then(({ kategoriseringer, pandaVersjon }) => {
                    setKategoriseringer(kategoriseringer)
                    setPandaVersjon(pandaVersjon)
                })
                .catch(
                    error => {
                        setKategoriseringer([])
                        setWarning(`Feilmelding: ${error}`)
                    }
                )
        }
    }, [tidslinjer, toast, isEnabled])


    const formaterteTidslinjer = (nyeTidslinjer) => {
        return nyeTidslinjer
            .map(
                tidslinje => ({
                    "id": tidslinje.label,
                    "perioder": tidslinje.perioder.map(
                        periode => ({
                            "id": tidslinje.label,
                            "fraOgMed": DateTime.fromJSDate(periode.fraOgMed).toISODate().replaceAll("-", "."),
                            "tilOgMed": periode.tilOgMed ? DateTime.fromJSDate(periode.tilOgMed).minus({ days: 1 }).toISODate().replaceAll("-", ".") : null,
                            "egenskaper": Object.fromEntries(
                                periode.egenskaper
                                    .map(egenskap => egenskap.replace("_", ""))
                                    .map(egenskap => Egenskap.parse(egenskap).somPar())
                                    .filter(([k, value]) => k && value)
                            )
                        })
                    )
                })
            );
    }

    async function postData(url = '', data = {}) {
        // Default options are marked with *
        return await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    }

    const kjenteKategoriseringer = kategoriseringer
        .filter(k => k.kategorisering !== 'UKJENT')

    return (
        <HStack >
            <Button colorScheme={isEnabled ? 'red' : 'green'} onClick={() => setIsEnabled(!isEnabled)}>
                {isEnabled ? "Slå av" : "Slå på kategorisering"}
            </Button>
            {
                isEnabled ? (
                    <HStack>
                        <Accordion allowToggle>
                            <AccordionItem>
                                <h2>
                                    <AccordionButton >
                                        <Tooltip label={`Basert på pa-res-ba ${pandaVersjon}`}>
                                            <Box flex='1' textAlign='left'>
                                                {`${kjenteKategoriseringer.length} hendelseskategorisering${kjenteKategoriseringer.length === 1 ? "" : "er"}`}
                                            </Box>
                                        </Tooltip>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    {
                                        kjenteKategoriseringer
                                            .map(
                                                ({ kategorisering, tidslinjehendelse, polisestatus }, i) => (
                                                    <Container
                                                        key={kategorisering + i}
                                                        shadow={'base'}
                                                        rounded={'md'}
                                                        padding='3'
                                                    >
                                                        <Tooltip
                                                            label={<pre>{JSON.stringify(tidslinjehendelse, null, 2)}</pre>}
                                                            maxWidth={'90vw'}
                                                        >
                                                            <VStack align={'left'}>
                                                                <Heading size='sm'>
                                                                    <HStack>
                                                                        <Text>{tidslinjehendelse.aksjonsdato}</Text>
                                                                        <Badge
                                                                            colorScheme={'blue'}
                                                                            fontSize={'md'}
                                                                        >
                                                                            {kategorisering.replaceAll("_", " ")}
                                                                        </Badge>
                                                                        <Badge>
                                                                            {polisestatus}
                                                                        </Badge>
                                                                    </HStack>
                                                                </Heading>
                                                                <UnorderedList>
                                                                    {
                                                                        tidslinjehendelse.endredeEgenskaper
                                                                            ?.flatMap(x => x)
                                                                            .map(
                                                                                egenskap => <Text key={egenskap}> {egenskap.replaceAll("->", "➡️")} </Text>
                                                                            )
                                                                    }
                                                                </UnorderedList>
                                                            </VStack>
                                                        </Tooltip>
                                                    </Container>
                                                )
                                            )
                                    }
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>

                        {warning.length > 0 ? (
                            <Tooltip label={warning} maxW={'40vw'} maxH={'100vh'}>
                                <WarningIcon color={'orange.400'} />
                            </Tooltip>
                        )
                            : <CheckIcon color={'green.500'} />}
                    </HStack>

                ) : null
            }
        </HStack >
    );

}