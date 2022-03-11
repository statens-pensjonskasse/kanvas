import { Badge, Heading, HStack, Table, TableCaption, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack } from "@chakra-ui/react";
import React, { useContext } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";

export default function KategoriseringTabell() {
    const { kategorisertHendelse } = useContext(PandavarehusContext)

    const {
        aksjonsdato,
        kategorisering,
        hendelser
    } = kategorisertHendelse || {};

    return (
        <VStack shadow={'md'} minH={'100%'} rounded={'xl'} padding={'3'}>
            <HStack>
                <Heading size={'sm'}>#{hendelser[0].Hendelsesnummer}</Heading>
                <Badge fontSize={'lg'}>{aksjonsdato.aksjonsdato} </Badge>
                <Heading size={'md'}>{kategorisering}</Heading>
            </HStack>
            <VStack minH={'5em'}>
                {
                    [...new Set(hendelser.map(hendelse => hendelse.Typeindikator))] // finn unike typeindikatorer
                        .map(typeindikator => <Badge key={typeindikator}>{typeindikator}</Badge>)
                }
            </VStack>
            <Table variant='striped' colorScheme='orange'>
                <TableCaption>Endrede tidslinjehendelser</TableCaption>
                <Thead>
                    <Tr>
                        <Th>Egenskap</Th>
                        <Th>Forrige</Th>
                        <Th>Neste</Th>
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
                            <Tag size='sm'>{tidslinjehendelse.TidslinjeId.replace(/_/g, ' ').toLowerCase()}</Tag>
                        </Tooltip>
                    </VStack>
                    {harDiff && (
                        <Tooltip label={diffForHendelse?.beskrivelse}>
                            <Tag colorScheme={'blue'}>{diffForHendelse?.diffType}</Tag>
                        </Tooltip>
                    )}
                </HStack>
            </Td>
            <Td>{tidslinjehendelse.Forrige?.split("\\n").map((rad, i) => <Text key={i}>{rad}</Text>) || "<tom>"}</Td>
            <Td>{tidslinjehendelse.Neste?.split("\\n").map((rad, i) => <Text key={i}>{rad}</Text>) || "<tom>"}</Td>
        </Tr>
    )
}