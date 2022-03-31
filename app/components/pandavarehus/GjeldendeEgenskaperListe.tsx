import { HStack, Tag, Text, VStack } from "@chakra-ui/react";
import { useContext } from "react";
import { PandavarehusContext } from "~/state/PandavarehusProvider";

export default function GjeldendeEgenskaperListe() {
    const { gjeldendeEgenskaper, gjeldendeEgenskaperdiffer } = useContext(PandavarehusContext)

    return (
        <VStack shadow='md' rounded='xl' padding={3}>
            {
                [...gjeldendeEgenskaper.egenskaper.values()]
                    .flatMap(egenskaper => egenskaper)
                    .filter(egenskap => !!egenskap.type && !!egenskap.verdi)
                    .map(egenskap => gjeldendeEgenskaperdiffer.diffForEgenskap(egenskap))
                    .filter(diff => !!diff)
                    .map(
                        diff => (
                            <HStack>
                                <Tag colorScheme={'blue'}>{diff.diffType}</Tag>
                                <Text>{diff.beskrivelse}</Text>
                            </HStack>
                        )
                    )
            }
        </VStack>
    );
}