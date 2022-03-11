import { Grid, GridItem, HStack, Radio, RadioGroup, Stack, VStack } from "@chakra-ui/react";
import React, { useContext } from "react";
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import KategoriseringListe from "../pandavarehus/KategoriseringListe";
import KategoriseringTabell from "../pandavarehus/KategoriseringTabell";
import TilstandSlider from "../pandavarehus/TilstandSlider";

export default function TidslinjehendelseController() {
    const {
        kategorisertHendelse,
        table,
        setTable,
    } = useContext(PandavarehusContext)

    const HendelserComponent = () => {
        return (
            <Grid
                templateRows='repeat(1, 1fr)'
                templateColumns='repeat(3, 1fr)'
                gap={4}
                width={'90vw'}
                maxH='50vh'
            >
                <GridItem colSpan={2} overflow='auto'>
                    <KategoriseringTabell />
                </GridItem>
                <GridItem colSpan={1} overflow='auto'>
                    <KategoriseringListe />
                </GridItem>
            </Grid>
        )
    }

    return (
        <VStack>
            <HStack width={'container.sm'}>
            </HStack>
            <RadioGroup onChange={setTable} value={table}>
                <Stack direction={'row'}>
                    <Radio value='forrige'>Forrige</Radio>
                    <Radio value='neste'>Neste</Radio>
                </Stack>
            </RadioGroup>
            {kategorisertHendelse && (
                <>
                    <HendelserComponent />
                    <TilstandSlider />
                </>
            )}

        </VStack>
    )

}