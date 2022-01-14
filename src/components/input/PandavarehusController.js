import { Badge, Box, Button, Container, Heading, HStack, Input, Radio, RadioGroup, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Tag, Text, Tooltip, UnorderedList, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { InputTextContext } from "../../state/InputTextProvider";
import { PandavarehusContext } from "../../state/PandavarehusProvider";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from "@chakra-ui/icons";

export default function PandavarehusController() {
    const {
        tilstand,
        maxTilstand,
        setTilstand,
        kategorisertHendelse,
        table,
        setTable,
        person,
        setPerson
    } = useContext(PandavarehusContext)
    const [showTooltip, setShowTooltip] = useState(false)
    const { parser } = useContext(InputTextContext)

    const {
        aksjonsdato,
        kategorisering,
        hendelser
    } = kategorisertHendelse || {};

    if (!parser.startsWith("PANDAVAREHUS_")) {
        return null
    }

    const HendelserComponent = () => {
        return (
            <VStack>
                <HStack>
                    <Badge fontSize={'lg'}> {aksjonsdato.toLocaleDateString('nb-NO')} </Badge>
                    <Heading size={'md'}>{kategorisering}</Heading>
                </HStack>
                <Accordion allowToggle allowMultiple>
                    {
                        hendelser
                            .filter(h => h.Tidslinjehendelsestype === "ENDRE")
                            .map(
                                tidslinjehendelse => {
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
                                    } = (tidslinjehendelse) || {};
                                    return (
                                        <AccordionItem key={`${Hendelsesnummer} ${Egenskap}`}>
                                            <h2>
                                                <AccordionButton>
                                                    <HStack flex='1' textAlign='left'>
                                                        <Tag colorScheme={'green'}>{Egenskap}</Tag>
                                                        <Text>{Forrige?.substring(0, 50) || "(tom)"}</Text>
                                                        <ArrowForwardIcon />
                                                        <Text>{Neste?.substring(0, 50) || "(tom)"}</Text>
                                                    </HStack>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel maxW={'3xl'} overflow={'auto'} padding={'5'} margin={'5'} shadow={'md'} rounded={'lg'}>
                                                <HStack>
                                                    <Badge
                                                        fontSize={'lg'}
                                                        colorScheme={(() => {
                                                            switch (Tidslinjehendelsestype) {
                                                                case "NY":
                                                                    return "green"
                                                                case "AVSLUTT":
                                                                    return "red"
                                                                default:
                                                                    return "blue";
                                                            }
                                                        })()}
                                                    >
                                                        {Tidslinjehendelsestype}</Badge>
                                                    <Text fontSize="lg" fontWeight={'bold'} textColor={'red'}>
                                                        {Typeindikator}
                                                    </Text>
                                                </HStack>
                                                <VStack alignItems={'left'} >
                                                    <Text fontWeight={'bold'}>
                                                        {Egenskap}
                                                    </Text>
                                                    <Text fontFamily={'mono'}>
                                                        Fra: {Forrige?.replaceAll("\\n", "") || "<tom>"}
                                                    </Text>
                                                    <Text fontFamily={'mono'}>
                                                        Til: {Neste?.replaceAll("\\n", "") || "<tom>"}
                                                    </Text>
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )
                                }
                            )
                    }
                </Accordion>
            </VStack>

        )

    }

    return (
        <VStack>
            <HStack>
                <Text>PersonId:</Text>
                <Container shadow='md' rounded='lg'>
                    <Input
                        value={person}
                        placeholder="PersonId"
                        onChange={event => {
                            event.preventDefault()
                            setPerson(event.target.value)
                        }}
                        textAlign={'center'}
                        variant={'flushed'}
                        autoFocus
                        blur
                        opacity={"0"}
                        _hover={{
                            opacity: "100"
                        }}
                        _focus={{
                            opacity: "100"
                        }}
                    />

                </Container>
            </HStack>
            <RadioGroup onChange={setTable} value={table}>
                <Stack direction={'row'}>
                    <Radio value='forrige'>Forrige</Radio>
                    <Radio value='neste'>Neste</Radio>
                </Stack>
            </RadioGroup>
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
                        placement='top'
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
            {kategorisertHendelse && <HendelserComponent />}

        </VStack>
    )
}