import { Badge, Heading, HStack, Table, TableCaption, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack } from "@chakra-ui/react";
import React, { useContext } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";
import { unikeVerdier } from "~/util/utils";

export default function KategoriseringTabell() {
    const { kategorisertHendelse } = useContext(PandavarehusContext)

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
                        <Th>Egenskap</Th>
                        <Th>Gammel verdi</Th>
                        <Th>Ny verdi</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        hendelser
                            .map(
                                (tidslinjehendelse, i) => (
                                    <KategoriseringRad
                                        key={i}
                                        tidslinjehendelse={tidslinjehendelse}
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
}

function KategoriseringRad(props: RadProps) {
    const { tidslinjehendelse } = props
    const { diff } = useContext(PandavarehusContext)
    const diffForHendelse: Tidslinjehendelsediff | undefined = diff.diffForHendelse(tidslinjehendelse)
    const harDiff = !!diffForHendelse

    return (
        <Tr>
            <Td>
                <HStack>
                    <VStack alignItems={'left'}>
                        <Text>{tidslinjehendelse.Egenskap}</Text>
                        <Tooltip>
                            <Tag size='sm' maxW={'15em'} shadow='base' padding='2'>
                                {tidslinjehendelse.TidslinjeId.replace(/_/g, ' ').toLowerCase()}
                            </Tag>
                        </Tooltip>
                    </VStack>
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