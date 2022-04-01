import { HStack, Tag, Text, VStack } from "@chakra-ui/react";
import { useContext, useMemo } from "react";
import { bestemFarge } from "~/domain/DiffType";
import { PandavarehusContext } from "~/state/PandavarehusProvider";

export default function EndredeEgenskaperListe() {
    const { gjeldendeEgenskaper, gjeldendeEgenskaperdiffer } = useContext(PandavarehusContext)

    const alleDifferanser = useMemo(
        () => [...gjeldendeEgenskaper.egenskaper.values()]
            .flatMap(egenskaper => egenskaper)
            .filter(egenskap => !!egenskap.type && !!egenskap.verdi)
            .map(egenskap => gjeldendeEgenskaperdiffer.diffForEgenskap(egenskap))
            .filter(diff => !!diff)
        , [gjeldendeEgenskaper, gjeldendeEgenskaperdiffer]
    )

    return (
        <VStack shadow='md' rounded='xl' padding={3}>
            {
                alleDifferanser
                    .map(
                        diff => (
                            <HStack key={diff.beskrivelse}>
                                <Tag colorScheme={bestemFarge(diff.diffType)} shadow={'base'}>{diff.diffType}</Tag>
                                <Text>{diff.beskrivelse}</Text>
                            </HStack>
                        )
                    )
            }
        </VStack>
    );
}