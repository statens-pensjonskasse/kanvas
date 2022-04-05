import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Center, Container, Heading, HStack, Table, TableCaption, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { bestemFarge } from "~/domain/DiffType";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";
import { TidslinjeContext } from "~/state/TidslinjerProvider";
import { unikeVerdier } from "~/util/utils";
import TidslinjerView from "../TidslinjeView";
import EndredeEgenskaperListe from "./EndredeEgenskaperListe";
import GjeldendeEgenskaperListe from "./GjeldendeEgenskaperListe";

export default function TidslinjehendelseTabell() {
    const { kategorisertHendelse, diff } = useContext(PandavarehusContext)
    const [kunEndredeTidslinjehendelser, setKunEndredeTidslinjehendelser] = useState(false)

    const {
        aksjonsdato,
        kategorisering,
        hendelser
    } = kategorisertHendelse || {};
    const { tidslinjer } = useContext(TidslinjeContext)

    return (
        <VStack alignItems={'left'} minH={'100%'} padding={'3'} spacing={'3em'}>
            <Center>
                <HStack>
                    <Heading size={'sm'}>Kategorisering #{hendelser[0].Hendelsesnummer}</Heading>
                    <Badge fontSize={'lg'}>{aksjonsdato.aksjonsdato} </Badge>
                    <Heading size={'md'}>{kategorisering}</Heading>
                </HStack>
            </Center>
            <Accordion allowToggle={true} reduceMotion={true} allowMultiple={true} defaultIndex={4}>
                <AccordionItem>
                    <AccordionButton>
                        <Heading size={'md'}>Endringer i gjeldende verdier</Heading>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                        <Text>{`Endringer i verdier som gjaldt på tidspunktet for kategoriseringen ${kategorisering} ${aksjonsdato.aksjonsdato}.`}</Text>
                        <EndredeEgenskaperListe />
                    </AccordionPanel>

                </AccordionItem>

                <AccordionItem>
                    <AccordionButton>
                        <Heading size={'md'}>Gjeldende verdier</Heading>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                        <Text>{`Komplett liste over gjeldende verdier ved kategoriseringen ${kategorisering} ${aksjonsdato.aksjonsdato}.`}</Text>
                        <GjeldendeEgenskaperListe />
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <AccordionButton>
                        <Heading size={'md'}>Typeindikatorer</Heading>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>

                        <Text>{`Tidslinjene som er inkludert i kategoriseringen ${kategorisering}.`}</Text>
                        <Container minH={'5em'} maxW='90%' padding={'2em'} margin={'1em'} justifyItems={'center'}>
                            {
                                unikeVerdier(hendelser.map(h => h.Typeindikator))
                                    .sort()
                                    .map(
                                        typeindikator => (
                                            <Tag margin={'0.5em'} shadow={'base'} key={typeindikator}>{typeindikator}</Tag>
                                        )
                                    )
                            }
                        </Container>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <AccordionButton>
                        <Heading size={'md'}>{`Tidslinjehendelser (${hendelser.length} stk)`}</Heading>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel animation={'none'}>

                        <VStack>
                            <Text>{`Tidslinjehendelser som inngår i kategoriseringen ${kategorisering}.`}</Text>
                        </VStack>
                        <Table variant='striped' colorScheme='orange'>
                            <TableCaption>{`Tidslinjehendelser som inngår i kategoriseringen ${kategorisering}.`}</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Aksjonsdato</Th>
                                    <Th>Tidslinje</Th>
                                    <Th>Egenskap</Th>
                                    <Th>Gammel verdi</Th>
                                    <Th>Ny verdi</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    hendelser
                                        .filter(h => !!h.Egenskap && (!!h.Forrige || !!h.Neste)) // fjern tomme endringer
                                        .map(
                                            (tidslinjehendelse: Tidslinjehendelse) => ({
                                                tidslinjehendelse,
                                                diffForHendelse: diff.diffForHendelse(tidslinjehendelse)
                                            })
                                        )
                                        .filter(({ diffForHendelse }) => !kunEndredeTidslinjehendelser || !!diffForHendelse)
                                        .map(
                                            ({ tidslinjehendelse, diffForHendelse }, i) => (
                                                <KategoriseringRad
                                                    key={i}
                                                    tidslinjehendelse={tidslinjehendelse}
                                                    diffForHendelse={diffForHendelse}
                                                />
                                            )
                                        )
                                }
                            </Tbody>
                        </Table>
                    </AccordionPanel>
                </AccordionItem>
                {
                    tidslinjer.length < 10 && (
                        <AccordionItem>
                            <AccordionButton>
                                <Heading size={'md'}>Visualisering av endringen</Heading>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack>
                                    <Text>{`Visualisering av tidslinjene som endrer seg ${aksjonsdato.aksjonsdato}.`}</Text>
                                    <TidslinjerView />
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    )
                }
            </Accordion>
        </VStack>
    )
}

interface RadProps {
    tidslinjehendelse: Tidslinjehendelse,
    diffForHendelse: Tidslinjehendelsediff | undefined
}

function KategoriseringRad(props: RadProps) {
    const { tidslinjehendelse, diffForHendelse } = props
    const harDiff = !!diffForHendelse


    return (
        <Tr>
            <Td> {tidslinjehendelse.Aksjonsdato.aksjonsdato} </Td>
            <Td>
                <Tooltip>
                    <Tag size='sm' maxW={'15em'} shadow='base' padding='2'>
                        {tidslinjehendelse.TidslinjeId}
                    </Tag>
                </Tooltip>
            </Td>
            <Td>
                <HStack maxW={'15em'}>
                    <Text>{tidslinjehendelse.Egenskap}</Text>
                    {harDiff && (
                        <Tooltip label={diffForHendelse?.beskrivelse}>
                            <Tag shadow={'base'} colorScheme={bestemFarge(diffForHendelse?.diffType)}>{diffForHendelse?.diffType}</Tag>
                        </Tooltip>
                    )}
                </HStack>
            </Td>
            {
                ["Forrige", "Neste"].map(
                    kilde => (
                        <Td key={kilde} maxW={'20em'}>
                            {
                                tidslinjehendelse[kilde]?.split("\\n")
                                    .map((rad: string, i: number) =>
                                        <Text key={i}>{rad}</Text>
                                    ) || "<tom>"

                            }
                        </Td>

                    )
                )
            }
        </Tr >
    )
}