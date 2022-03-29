import { Badge, Heading, HStack, Table, TableCaption, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";
import { unikeVerdier } from "~/util/utils";

export default function KategoriseringTabell() {
    const { kategorisertHendelse, diff } = useContext(PandavarehusContext)
    const [kunEndringer, setKunEndringer] = useState(false)

    const {
        aksjonsdato,
        kategorisering,
        hendelser
    } = kategorisertHendelse || {};

    return (
        <VStack alignItems={'left'} minH={'100%'} padding={'3'}>
            <HStack>
                <Heading size={'sm'}>#{hendelser[0].Hendelsesnummer}</Heading>
                <Badge fontSize={'lg'}>{aksjonsdato.aksjonsdato} </Badge>
                <Heading size={'md'}>{kategorisering}</Heading>
            </HStack>
            <VStack minH={'5em'}>
                {
                    unikeVerdier(hendelser.map(h => h.Typeindikator))
                        .map(
                            typeindikator => (
                                <Badge key={typeindikator}>{typeindikator}</Badge>
                            )
                        )
                }
            </VStack>
            <Table variant='striped' colorScheme='orange'>
                <TableCaption>Tidslinjehendelser som inngår i kategoriseringen</TableCaption>
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
                            .map(
                                (tidslinjehendelse: Tidslinjehendelse) => ({
                                    tidslinjehendelse,
                                    diffForHendelse: diff.diffForHendelse(tidslinjehendelse)
                                })
                            )
                            .filter(({ diffForHendelse }) => !kunEndringer || !!diffForHendelse)
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
                        {tidslinjehendelse.TidslinjeId.replace(/_/g, ' ').toLowerCase()}
                    </Tag>
                </Tooltip>
            </Td>
            <Td>
                <HStack>
                    <Text>{tidslinjehendelse.Egenskap}</Text>
                    {harDiff && (
                        <Tooltip label={diffForHendelse?.beskrivelse}>
                            <Tag colorScheme={'blue'}>{diffForHendelse?.diffType}</Tag>
                        </Tooltip>
                    )}
                </HStack>
            </Td>
            {
                ["Forrige", "Neste"].map(
                    kilde => (
                        <Td key={kilde}>
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