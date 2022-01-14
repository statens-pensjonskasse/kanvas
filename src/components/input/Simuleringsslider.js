import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Badge, Button, Code, Container, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Tooltip, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { PANDAVAREHUS_TIDSLINJEHENDELSER } from "../../parsers/Parser";
import { InputTextContext } from "../../state/InputTextProvider";
import { PandavarehusContext } from "../../state/PandavarehusProvider";

export default function Simuleringsslider() {
    const { tilstand, maxTilstand, setTilstand, tidslinjehendelse } = useContext(PandavarehusContext)
    const [showTooltip, setShowTooltip] = useState(false)
    const { parser } = useContext(InputTextContext)

    const {
        Aksjonsdato,
        Egenskap,
        Forrige,
        Neste,
        Hendelsesnummer,
        Hendelsestype,
        PersonId,
        PoliseId,
        TidslinjeId,
        Tidslinjehendelsestype,
        Typeindikator
    } = tidslinjehendelse || {};

    if (parser !== PANDAVAREHUS_TIDSLINJEHENDELSER) {
        return null
    }

    return (
        <VStack>
            <HStack>
                <Button
                    onClick={e => setTilstand(Math.max(0, tilstand - 1))}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                > - </Button>
                <Slider
                    min={0}
                    max={maxTilstand}
                    step={1}
                    defaultValue={tilstand}
                    value={tilstand}
                    onChange={setTilstand}
                    minWidth={'container.md'}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                        hasArrow
                        color='white'
                        placement='bottom'
                        isOpen={showTooltip}
                        label={`Tilstand ${tilstand}`}
                    >
                        <SliderThumb />
                    </Tooltip>
                </Slider>
                <Button
                    onClick={e => setTilstand(Math.min(maxTilstand, tilstand + 1))}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                > + </Button>
            </HStack>
            {
                tidslinjehendelse && (
                    <VStack
                        rounded='xl'
                        shadow={'lg'}
                        justifyContent={'center'}
                        padding={'4'}
                    >
                        <Badge colorScheme={'blue'} fontSize={'lg'}>{Hendelsestype}</Badge>
                        <Text fontSize="lg" fontWeight={'bold'}>
                            {
                                `
                   ${Aksjonsdato.toLocaleDateString('nb-NO')}: ${Tidslinjehendelsestype.toLowerCase()} ${Typeindikator.toLowerCase()}
                   `
                            }
                        </Text>
                        <Text fontFamily={'mono'}>
                            Fra: {Forrige || "<ingenting>"}
                        </Text>
                        <Text fontFamily={'mono'}>
                            Til: {Neste || "<ingenting>"}
                        </Text>
                    </VStack>
                )
            }

        </VStack>
    )
}