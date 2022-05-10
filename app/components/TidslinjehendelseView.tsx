import { CheckIcon, WarningIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, HStack, Table, TableCaption, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import Tidslinje from "~/domain/Tidslinje";
import Egenskap from "../domain/Egenskap";
import { TidslinjeContext } from "../state/TidslinjerProvider";

const API_SERVER = "http://panda-hendelseskategorisering-webservice.kpt.spk.no"

export default function TidslinjehendelseView() {
    const [kategoriseringer, setKategoriseringer] = useState([])
    const [warning, setWarning] = useState("")
    const [pandaVersjon, setPandaVersjon] = useState([])
    const [isEnabled, setIsEnabled] = useState(false)

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


    const formaterteTidslinjer = (nyeTidslinjer: Tidslinje[]) => {
        return nyeTidslinjer
            .map(
                tidslinje => ({
                    "id": tidslinje.label,
                    "perioder": tidslinje.perioder.map(
                        periode => ({
                            "id": tidslinje.label,
                            "fraOgMed": periode.fraOgMed.aksjonsdato,
                            "tilOgMed": periode.tilOgMed?.aksjonsdato,
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

    return (
        <HStack >
            <Button colorScheme={isEnabled ? 'orange' : 'green'} onClick={() => setIsEnabled(!isEnabled)}>
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
                                    <Table variant={'striped'} colorScheme={'orange'}>
                                        <TableCaption>Kategoriseringer</TableCaption>
                                        <Thead>
                                            <Tr>
                                                <Th>Aksjonsdato</Th>
                                                <Th>Kategorisering</Th>
                                                <Th>Endring</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tbody>
                                                {
                                                    kjenteKategoriseringer
                                                        .map(
                                                            ({ kategorisering, tidslinjehendelse, polisestatus }, i) => (
                                                                <Tooltip label={<pre>{JSON.stringify(tidslinjehendelse, null, 2)}</pre>} maxW={'90vw'}>
                                                                    <Tr>
                                                                        <Td>{tidslinjehendelse.aksjonsdato}</Td>
                                                                        <Td> {kategorisering.replaceAll("_", " ")} </Td>
                                                                        <Td>
                                                                            <VStack>
                                                                                {
                                                                                    tidslinjehendelse.endredeEgenskaper.map(
                                                                                        egenskap => <Text key={egenskap}> {egenskap} </Text>
                                                                                    )
                                                                                }
                                                                            </VStack>
                                                                        </Td>
                                                                    </Tr>
                                                                </Tooltip>
                                                            )
                                                        )
                                                }
                                            </Tbody>
                                        </Tbody>

                                    </Table>
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