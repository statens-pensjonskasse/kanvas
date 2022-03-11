import { Container, HStack, Tag, Text, Tooltip, VStack } from "@chakra-ui/react";
import { useContext } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";


export default function KategoriseringListe() {
    const { diff, tilstand, oppdaterTilstand, kategoriseringer } = useContext(PandavarehusContext)

    const diffForHendelse = (hendelse: Tidslinjehendelse): Tidslinjehendelsediff | undefined => {
        return diff.diffForHendelse(hendelse)
    }

    return (
        <Container shadow='md' rounded='xl' padding={3}>
            <VStack alignItems={'left'}>
                {
                    kategoriseringer()
                        .map(
                            (kategoriserbarHendelse, i) => (
                                <HStack
                                    spacing={2}
                                    onClick={() => oppdaterTilstand(i)}
                                    shadow={tilstand === i ? 'outline' : 'none'}
                                    key={i}
                                >
                                    <Tag>
                                        {kategoriserbarHendelse.aksjonsdato.aksjonsdato}
                                    </Tag>
                                    <Text>
                                        {`${kategoriserbarHendelse.kategorisering}`}
                                    </Text>
                                    {kategoriserbarHendelse.hendelser.some(diffForHendelse) && (
                                        <Tooltip
                                            label={kategoriserbarHendelse.hendelser
                                                .filter(diffForHendelse)
                                                .map((h, i) => <Text key={i}>{h.Egenskap}</Text>)}
                                        >
                                            <Tag colorScheme={'blue'}>Endret</Tag>
                                        </Tooltip>
                                    )}

                                </HStack>
                            )
                        )
                }
            </VStack>
        </Container>
    );
}