import { Grid, GridItem, Radio, RadioGroup, Stack, VStack } from "@chakra-ui/react";
import React, { useContext } from "react";
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import KategoriseringListe from "../pandavarehus/KategoriseringListe";
import TidslinjehendelseTabell from "../pandavarehus/TidslinjehendelseTabell";
import TilstandSlider from "../pandavarehus/TilstandSlider";

export default function TidslinjehendelseController() {
    const {
        kategorisertHendelse,
        table,
        setTable,
    } = useContext(PandavarehusContext)

    const Hendelsesnavigering = () => {
        return (
            <Grid
                templateRows='repeat(1, 1fr)'
                templateColumns='repeat(3, 1fr)'
                gap={4}
                width={'90vw'}
            >
                <GridItem colSpan={2} overflow='auto' alignItems={'left'} shadow='base' rounded={'xl'} padding={'3em'}>
                    <TidslinjehendelseTabell />
                </GridItem>
                <GridItem colSpan={1} overflow='auto' maxH={'50em'}>
                    <KategoriseringListe />
                </GridItem>
            </Grid>
        )
    }

    return (
        <VStack>
            <RadioGroup onChange={setTable} value={table}>
                <Stack direction={'row'}>
                    <Radio value='forrige'>Forrige</Radio>
                    <Radio value='neste'>Neste</Radio>
                </Stack>
            </RadioGroup>
            {kategorisertHendelse && (
                <>
                    <TilstandSlider />
                    <Hendelsesnavigering />
                </>
            )}

        </VStack>
    )

}