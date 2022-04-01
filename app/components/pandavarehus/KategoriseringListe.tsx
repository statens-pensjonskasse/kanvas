import { Container, HStack, Tag, Text, Tooltip, VStack } from "@chakra-ui/react";
import { useContext } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { PandavarehusContext } from "~/state/PandavarehusProvider";
import { unikeVerdier } from "~/util/utils";
import { AksjonsdatoTag } from "./AksjonsdatoTag";

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
                            ({ aksjonsdato, kategorisering, hendelser }, i) => (
                                <HStack
                                    spacing={2}
                                    onClick={() => oppdaterTilstand(i)}
                                    shadow={tilstand === i ? 'outline' : 'none'}
                                    key={i}
                                >
                                    <AksjonsdatoTag aksjonsdato={aksjonsdato} />
                                    <Text>
                                        {`${kategorisering}`}
                                    </Text>
                                    {hendelser.some(diffForHendelse) && (
                                        <Tooltip
                                            label={
                                                <>
                                                    <Text>Egenskaper med endringer:</Text>
                                                    {
                                                        unikeVerdier(
                                                            hendelser
                                                                .filter(diffForHendelse)
                                                                .map(h => h.Egenskap)
                                                        )
                                                            .map(
                                                                (egenskap) => <Text key={egenskap}>{egenskap}</Text>
                                                            )
                                                    }
                                                </>
                                            }
                                        >
                                            <Tag colorScheme={'blue'}>Endret</Tag>
                                        </Tooltip>
                                    )}
                                    <hr />

                                </HStack>
                            )
                        )
                }
            </VStack>
        </Container>
    );
}